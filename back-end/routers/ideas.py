"""
Router de Ideias
Endpoints para CRUD de ideias com integração dos agentes
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from models.schemas import (
    IdeiaCreate, IdeiaUpdate, IdeiaResponse,
    ValidacaoRequest, ValidacaoResponse, CampoProblema
)
from services.firebase_client import get_firebase_client
from agents.guardiao import AgenteGuardiao
from agents.analista import AgenteAnalista
from middleware.auth import verify_user_id, get_current_user
from datetime import datetime

router = APIRouter()

# ============================================
# DEPENDENCIES
# ============================================

def get_firebase():
    """Dependency para Firebase"""
    try:
        return get_firebase_client()
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Erro ao conectar com Firebase: {str(e)}"
        )

# ============================================
# ENDPOINTS
# ============================================

@router.post("/ideas/", response_model=IdeiaResponse)
async def create_idea(
    idea_data: IdeiaCreate,
    current_user: dict = Depends(get_current_user),
    firebase = Depends(get_firebase)
):
    """
    Cria uma nova ideia
    
    Fluxo:
    1. Valida autenticação
    2. Cria ideia no Firebase com status 'draft'
    3. Retorna ID da ideia
    """
    try:
        # Usar user_id do token autenticado
        user_id = current_user["uid"]
        
        # Validar se user_id da requisição corresponde ao autenticado
        if idea_data.user_id != user_id:
            raise HTTPException(
                status_code=403,
                detail="user_id não corresponde ao usuário autenticado"
            )
        
        idea_dict = {
            "title": idea_data.title,
            "status": "draft"
        }
        
        idea_id = await firebase.create_idea(
            user_id=user_id,
            idea_data=idea_dict
        )
        
        # Buscar ideia criada
        idea = await firebase.get_idea(idea_data.user_id, idea_id)
        
        return IdeiaResponse(**idea)
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao criar ideia: {str(e)}"
        )

@router.get("/ideas/{user_id}/{idea_id}", response_model=IdeiaResponse)
async def get_idea(
    user_id: str,
    idea_id: str,
    _: str = Depends(verify_user_id),
    firebase = Depends(get_firebase)
):
    """Busca uma ideia específica"""
    idea = await firebase.get_idea(user_id, idea_id)
    
    if not idea:
        raise HTTPException(
            status_code=404,
            detail="Ideia não encontrada"
        )
    
    return IdeiaResponse(**idea)

@router.post("/ideas/{user_id}/validate", response_model=ValidacaoResponse)
async def validate_fields(
    user_id: str,
    validation_data: ValidacaoRequest,
    _: str = Depends(verify_user_id)
):
    """
    Valida campos antes de salvar (moderação)
    
    Fluxo:
    1. Valida autenticação
    2. Chama Agente Guardião para validar campos
    3. Retorna resultado da validação
    """
    import logging
    logging.info(f"[VALIDATE] Validação solicitada para user_id: {user_id}")
    try:
        guardiao = AgenteGuardiao()
        
        # Preparar campos para validação
        campos_validar = {}
        
        if validation_data.title:
            campos_validar["title"] = validation_data.title
        if validation_data.description:
            campos_validar["description"] = validation_data.description
        if validation_data.target_audience:
            campos_validar["target_audience"] = validation_data.target_audience
        
        # Adicionar campos do dynamic_content
        if validation_data.dynamic_content:
            dynamic_dict = validation_data.dynamic_content.dict(exclude_unset=True)
            for key, value in dynamic_dict.items():
                if value and isinstance(value, str) and value.strip():
                    campos_validar[key] = value
        
        # Validar campos
        logging.info(f"[VALIDATE] Campos a validar: {list(campos_validar.keys())}")
        resultado = await guardiao.validar_campos_individualmente(campos_validar)
        logging.info(f"[VALIDATE] Resultado: aprovado={resultado.get('aprovado')}, problemas={len(resultado.get('campos_com_problema', []))}")
        
        # Converter para schema
        campos_problema = [
            CampoProblema(**campo) for campo in resultado.get("campos_com_problema", [])
        ]
        
        return ValidacaoResponse(
            aprovado=resultado.get("aprovado", False),
            campos_com_problema=campos_problema,
            justificativa_geral=resultado.get("justificativa_geral", "")
        )
    
    except Exception as e:
        import logging
        logging.error(f"Erro ao validar campos: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao validar campos: {str(e)}"
        )

@router.get("/ideas/{user_id}", response_model=List[IdeiaResponse])
async def list_ideas(
    user_id: str,
    limit: int = 50,
    _: str = Depends(verify_user_id),
    firebase = Depends(get_firebase)
):
    """
    Lista ideias de um usuário
    
    Requer índice composto no Firestore:
    - Collection: ideias
    - Fields: user_id (Ascending), updated_at (Descending)
    """
    try:
        ideas = await firebase.list_ideas(user_id, limit)
        return [IdeiaResponse(**idea) for idea in ideas]
    except Exception as e:
        error_str = str(e)
        # Se for erro de índice faltante, retornar erro 500 com mensagem clara
        if "índice" in error_str.lower() or "index" in error_str.lower() or "requires an index" in error_str.lower():
            raise HTTPException(
                status_code=500,
                detail=error_str
            )
        # Re-raise outros erros
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao listar ideias: {str(e)}"
        )

@router.patch("/ideas/{user_id}/{idea_id}", response_model=IdeiaResponse)
async def update_idea(
    user_id: str,
    idea_id: str,
    update_data: IdeiaUpdate,
    _: str = Depends(verify_user_id),
    firebase = Depends(get_firebase)
):
    """
    Atualiza uma ideia (autosave)
    
    Fluxo:
    1. Valida autenticação
    2. Valida campos com Agente Guardião
    3. Se aprovado, atualiza dados no Firebase
    4. Retorna ideia atualizada
    """
    try:
        # Converter Pydantic para dict, excluindo campos não definidos
        update_dict = update_data.dict(exclude_unset=True)
        
        # Converter dynamic_content se existir
        if update_data.dynamic_content:
            # Filtrar campos vazios do dynamic_content
            dynamic_dict = update_data.dynamic_content.dict(exclude_unset=True)
            # Remover campos que são strings vazias
            dynamic_dict = {
                k: v for k, v in dynamic_dict.items() 
                if v is not None and (not isinstance(v, str) or v.strip() != "")
            }
            # Só incluir dynamic_content se tiver pelo menos um campo válido
            if dynamic_dict:
                update_dict["dynamic_content"] = dynamic_dict
        
        # Remover campos principais que são strings vazias
        # Camada extra de segurança: nunca enviar strings vazias para o FirebaseClient
        filtered_dict = {}
        for key, value in update_dict.items():
            # Ignorar strings vazias
            if isinstance(value, str) and value.strip() == "":
                continue
            # Ignorar dicts vazios (dynamic_content já foi filtrado acima, mas garantir)
            if isinstance(value, dict) and not value:
                continue
            filtered_dict[key] = value
        
        # Se não houver nada para atualizar, retornar ideia atual
        if not filtered_dict:
            idea = await firebase.get_idea(user_id, idea_id)
            if not idea:
                raise HTTPException(
                    status_code=404,
                    detail="Ideia não encontrada"
                )
            return IdeiaResponse(**idea)
        
        # VALIDAÇÃO COM AGENTE GUARDIÃO ANTES DE SALVAR
        guardiao = AgenteGuardiao()
        campos_validar = {}
        
        if "title" in filtered_dict:
            campos_validar["title"] = filtered_dict["title"]
        if "description" in filtered_dict:
            campos_validar["description"] = filtered_dict["description"]
        if "target_audience" in filtered_dict:
            campos_validar["target_audience"] = filtered_dict["target_audience"]
        
        # Adicionar campos do dynamic_content
        if "dynamic_content" in filtered_dict and isinstance(filtered_dict["dynamic_content"], dict):
            for key, value in filtered_dict["dynamic_content"].items():
                if value and isinstance(value, str) and value.strip():
                    campos_validar[key] = value
        
        # Validar campos
        if campos_validar:
            resultado_validacao = await guardiao.validar_campos_individualmente(campos_validar)
            
            if not resultado_validacao.get("aprovado", False):
                # Campos com problema - retornar erro 400 com detalhes
                campos_problema = resultado_validacao.get("campos_com_problema", [])
                # Converter para formato JSON serializável
                campos_problema_dict = [
                    {
                        "campo": campo.get("campo", ""),
                        "tipo": campo.get("tipo", ""),
                        "justificativa": campo.get("justificativa", "")
                    }
                    for campo in campos_problema
                ]
                raise HTTPException(
                    status_code=400,
                    detail={
                        "error": "moderation_failed",
                        "campos_com_problema": campos_problema_dict,
                        "justificativa_geral": resultado_validacao.get("justificativa_geral", "Alguns campos precisam ser revisados")
                    }
                )
        
        # Se passou na validação, salvar no Firebase
        success = await firebase.update_idea(user_id, idea_id, filtered_dict)
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail="Ideia não encontrada"
            )
        
        # Buscar ideia atualizada
        idea = await firebase.get_idea(user_id, idea_id)
        return IdeiaResponse(**idea)
    
    except HTTPException:
        raise
    except Exception as e:
        # Log do erro para debug
        import logging
        logging.error(f"Erro ao atualizar ideia {idea_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao atualizar ideia: {str(e)}"
        )

@router.put("/ideas/{user_id}/{idea_id}/status")
async def update_status(
    user_id: str,
    idea_id: str,
    new_status: str,
    _: str = Depends(verify_user_id),
    firebase = Depends(get_firebase)
):
    """Atualiza status da ideia"""
    success = await firebase.update_idea(
        user_id,
        idea_id,
        {"status": new_status}
    )
    
    if not success:
        raise HTTPException(
            status_code=404,
            detail="Ideia não encontrada"
        )
    
    return {"status": "updated", "new_status": new_status}

@router.post("/ideas/{user_id}/{idea_id}/submit", response_model=IdeiaResponse)
async def submit_idea(
    user_id: str,
    idea_id: str,
    _: str = Depends(verify_user_id),
    firebase = Depends(get_firebase)
):
    """
    Submete uma ideia (checkpoint completo)
    
    Fluxo:
    1. Valida autenticação
    2. Busca ideia atual
    3. Agente Guardião valida conteúdo
    4. Se aprovado, Agente Analista gera metadados
    5. Salva ideia com metadados e status 'submitted'
    6. Retorna ideia completa
    """
    # 1. Buscar ideia
    idea = await firebase.get_idea(user_id, idea_id)
    if not idea:
        raise HTTPException(
            status_code=404,
            detail="Ideia não encontrada"
        )
    
    # 2. Agente Guardião - Validação de segurança
    guardiao = AgenteGuardiao()
    
    titulo = idea.get("title", "")
    descricao = idea.get("description", "")
    problema = idea.get("dynamic_content", {}).get("problema", "")
    
    aprovado, justificativa = await guardiao.validar(titulo, descricao, problema)
    
    if not aprovado:
        raise HTTPException(
            status_code=400,
            detail=f"Conteúdo inapropriado: {justificativa}"
        )
    
    # 3. Agente Analista - Gerar metadados
    analista = AgenteAnalista()
    classificacao = await analista.analisar(idea)
    
    # 4. Atualizar ideia com metadados e status
    update_data = {
        "status": "submitted",
        "classificacao_ia": classificacao,
        "submitted_at": datetime.utcnow()
    }
    
    await firebase.update_idea(user_id, idea_id, update_data)
    
    # 5. Retornar ideia completa
    idea_updated = await firebase.get_idea(user_id, idea_id)
    return IdeiaResponse(**idea_updated)

@router.delete("/ideas/{user_id}/{idea_id}")
async def delete_idea(
    user_id: str,
    idea_id: str,
    _: str = Depends(verify_user_id),
    firebase = Depends(get_firebase)
):
    """Deleta uma ideia"""
    success = await firebase.delete_idea(user_id, idea_id)
    
    if not success:
        raise HTTPException(
            status_code=404,
            detail="Ideia não encontrada"
        )
    
    return {"status": "deleted", "idea_id": idea_id}

