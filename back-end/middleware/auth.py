"""
Middleware de Autenticação Firebase
Valida tokens JWT do Firebase Authentication
"""

from fastapi import HTTPException, Depends, Header
from typing import Optional
import firebase_admin
from firebase_admin import auth

async def verify_firebase_token(
    authorization: Optional[str] = Header(None)
) -> dict:
    """
    Verifica e decodifica token do Firebase
    
    Args:
        authorization: Header Authorization com formato "Bearer <token>"
    
    Returns:
        Dicionário com dados do usuário autenticado
    
    Raises:
        HTTPException: Se token inválido ou ausente
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Token de autenticação não fornecido"
        )
    
    # Extrair token do header
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise ValueError("Esquema de autenticação inválido")
    except ValueError:
        raise HTTPException(
            status_code=401,
            detail="Formato de autorização inválido. Use: Bearer <token>"
        )
    
    # Verificar token com Firebase Admin
    try:
        decoded_token = auth.verify_id_token(token)
        return {
            "uid": decoded_token["uid"],
            "email": decoded_token.get("email"),
            "email_verified": decoded_token.get("email_verified", False),
            "name": decoded_token.get("name"),
            "firebase_claims": decoded_token
        }
    except firebase_admin.exceptions.InvalidArgumentError:
        raise HTTPException(
            status_code=401,
            detail="Token inválido ou expirado"
        )
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Erro ao verificar token: {str(e)}"
        )


def verify_user_id(
    user_id: str,
    current_user: dict = Depends(verify_firebase_token)
) -> str:
    """
    Verifica se o user_id da requisição corresponde ao usuário autenticado
    
    Args:
        user_id: ID do usuário da requisição
        current_user: Dados do usuário autenticado (dependency)
    
    Returns:
        user_id validado
    
    Raises:
        HTTPException: Se user_id não corresponder ao usuário autenticado
    """
    if user_id != current_user["uid"]:
        raise HTTPException(
            status_code=403,
            detail="Você não tem permissão para acessar este recurso"
        )
    return user_id


# Dependency para obter usuário autenticado (sem validar user_id)
def get_current_user(
    current_user: dict = Depends(verify_firebase_token)
) -> dict:
    """Retorna dados do usuário autenticado"""
    return current_user

