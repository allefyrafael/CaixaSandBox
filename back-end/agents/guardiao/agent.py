"""
Agente Guardião - Filtro de Segurança e Contexto
Primeira barreira de defesa contra conteúdo inapropriado
"""

from typing import Tuple, Dict, List, Any
from pathlib import Path
from services.groq_client import get_groq_client
from .config import TEMPERATURE, MAX_TOKENS, CONSERVATIVE_ON_ERROR

class AgenteGuardiao:
    """Agente responsável por filtrar conteúdo inapropriado"""
    
    def __init__(self):
        self.groq = get_groq_client()
        self._conhecimento_cache = None
    
    def _carregar_conhecimento(self) -> str:
        """Carrega conhecimento do agente"""
        if self._conhecimento_cache is None:
            conhecimento_path = Path(__file__).parent / "conhecimento.txt"
            try:
                with open(conhecimento_path, "r", encoding="utf-8") as f:
                    self._conhecimento_cache = f.read()
            except Exception:
                self._conhecimento_cache = "[Erro ao carregar conhecimento]"
        return self._conhecimento_cache
    
    def _construir_system_prompt(self) -> str:
        """Constrói prompt do sistema"""
        conhecimento = self._carregar_conhecimento()
        return f"""Você é o Guardião do Sistema de Inovação da CAIXA. 
Sua função é proteger a empresa de riscos legais e manter um ambiente respeitoso.

{conhecimento}

REGRAS CRÍTICAS:
1. PERMITA críticas sobre processos, sistemas e ferramentas (mesmo com linguagem forte)
2. BLOQUEIE ataques pessoais, assédio ou discriminação
3. DIFERENCIE: "O sistema é estúpido" (OK) de "O gerente é estúpido" (BLOQUEAR)
4. Seja EDUCATIVO, não punitivo ao bloquear
5. VALIDE se o conteúdo está relacionado a IDEIAS E INOVAÇÃO da Caixa Econômica Federal
6. BLOQUEIE conteúdo completamente fora de contexto (ex: "Empresa péssima" sem contexto)

Sua resposta deve ser APENAS um JSON com:
{{
    "aprovado": true/false,
    "justificativa": "Explicação educativa e clara do motivo"
}}"""
    
    def _construir_system_prompt_validacao_detalhada(self) -> str:
        """Constrói prompt do sistema para validação detalhada de campos"""
        conhecimento = self._carregar_conhecimento()
        return f"""Você é o Guardião do Sistema de Inovação da CAIXA. 
Sua função é proteger a empresa de riscos legais e manter um ambiente respeitoso.

{conhecimento}

REGRAS CRÍTICAS:
1. PERMITA críticas sobre processos, sistemas e ferramentas (mesmo com linguagem forte)
2. BLOQUEIE ataques pessoais, assédio ou discriminação
3. DIFERENCIE: "O sistema é estúpido" (OK) de "O gerente é estúpido" (BLOQUEAR)
4. Seja EDUCATIVO, não punitivo ao bloquear
5. VALIDE se o conteúdo está relacionado a IDEIAS E INOVAÇÃO da Caixa Econômica Federal
6. BLOQUEIE conteúdo completamente fora de contexto (ex: "Empresa péssima" sem contexto)

TIPOS DE PROBLEMA:
- "ofensivo": Linguagem ofensiva, ataques pessoais, assédio, discriminação
- "fora_contexto": Conteúdo não relacionado a ideias e inovação da Caixa

Sua resposta deve ser APENAS um JSON com:
{{
    "aprovado": true/false,
    "tipo": "ofensivo" | "fora_contexto" | null,
    "justificativa": "Explicação educativa e clara do motivo"
}}"""
    
    async def validar(
        self,
        titulo: str,
        descricao: str,
        problema: str
    ) -> Tuple[bool, str]:
        """
        Valida se o conteúdo é apropriado
        
        Args:
            titulo: Título da ideia
            descricao: Descrição da ideia
            problema: Problema que a ideia resolve
        
        Returns:
            Tupla (aprovado: bool, justificativa: str)
        """
        system_prompt = self._construir_system_prompt()
        
        user_prompt = f"""Analise o seguinte conteúdo de uma ideia:

TÍTULO: {titulo or '[Não informado]'}
DESCRIÇÃO: {descricao or '[Não informado]'}
PROBLEMA: {problema or '[Não informado]'}

Determine se o conteúdo é apropriado seguindo as regras do código de conduta.
Se houver conteúdo inapropriado, forneça uma justificativa educativa que ajude o usuário a reformular."""

        try:
            resultado = await self.groq.generate_json(
                prompt=user_prompt,
                system_prompt=system_prompt,
                temperature=TEMPERATURE
            )
            
            aprovado = resultado.get("aprovado", False)
            justificativa = resultado.get("justificativa", "Análise concluída")
            
            return (aprovado, justificativa)
        
        except Exception as e:
            if CONSERVATIVE_ON_ERROR:
                return (
                    False,
                    f"Erro ao processar validação. Por favor, revise o conteúdo e tente novamente."
                )
            raise
    
    async def validar_campos_individualmente(
        self,
        campos: Dict[str, str]
    ) -> Dict[str, Any]:
        """
        Valida campos individualmente e retorna detalhes dos problemas
        
        Args:
            campos: Dicionário com nome do campo e seu valor
                   Ex: {"title": "Título", "description": "Descrição", ...}
        
        Returns:
            Dicionário com:
            {
                "aprovado": bool,
                "campos_com_problema": [
                    {
                        "campo": "title",
                        "tipo": "ofensivo" | "fora_contexto",
                        "justificativa": "..."
                    }
                ],
                "justificativa_geral": "..."
            }
        """
        system_prompt = self._construir_system_prompt_validacao_detalhada()
        
        # Construir prompt com todos os campos
        campos_texto = []
        for nome_campo, valor in campos.items():
            if valor and valor.strip():
                campos_texto.append(f"{nome_campo.upper()}: {valor}")
        
        if not campos_texto:
            return {
                "aprovado": True,
                "campos_com_problema": [],
                "justificativa_geral": "Nenhum campo para validar"
            }
        
        user_prompt = f"""Analise os seguintes campos de uma ideia de inovação para a Caixa Econômica Federal:

{chr(10).join(campos_texto)}

Para cada campo, determine:
1. Se contém linguagem ofensiva, ataques pessoais, assédio ou discriminação (tipo: "ofensivo")
2. Se está fora de contexto (não relacionado a ideias e inovação da Caixa) (tipo: "fora_contexto")
3. Se está aprovado (aprovado: true)

IMPORTANTE:
- Identifique QUAL campo específico tem problema
- Se houver múltiplos campos com problema, identifique todos
- Seja específico sobre qual campo e qual tipo de problema

Sua resposta deve ser APENAS um JSON com:
{{
    "aprovado": true/false,
    "campos_com_problema": [
        {{
            "campo": "nome_do_campo",
            "tipo": "ofensivo" | "fora_contexto",
            "justificativa": "Explicação educativa"
        }}
    ],
    "justificativa_geral": "Mensagem geral se houver problemas"
}}"""

        try:
            resultado = await self.groq.generate_json(
                prompt=user_prompt,
                system_prompt=system_prompt,
                temperature=TEMPERATURE
            )
            
            # Garantir estrutura correta
            aprovado = resultado.get("aprovado", False)
            campos_com_problema = resultado.get("campos_com_problema", [])
            justificativa_geral = resultado.get("justificativa_geral", "")
            
            # Validar estrutura dos campos com problema
            campos_validados = []
            for campo_problema in campos_com_problema:
                if isinstance(campo_problema, dict):
                    campo_nome = campo_problema.get("campo", "")
                    tipo = campo_problema.get("tipo", "")
                    justificativa = campo_problema.get("justificativa", "")
                    
                    # Validar se o campo existe no dicionário original
                    if campo_nome in campos:
                        campos_validados.append({
                            "campo": campo_nome,
                            "tipo": tipo if tipo in ["ofensivo", "fora_contexto"] else "fora_contexto",
                            "justificativa": justificativa or "Conteúdo precisa ser revisado",
                            "texto": campos[campo_nome]  # Incluir o texto problemático
                        })
            
            return {
                "aprovado": aprovado and len(campos_validados) == 0,
                "campos_com_problema": campos_validados,
                "justificativa_geral": justificativa_geral or ("Todos os campos estão aprovados" if aprovado else "Alguns campos precisam ser revisados")
            }
        
        except Exception as e:
            if CONSERVATIVE_ON_ERROR:
                return {
                    "aprovado": False,
                    "campos_com_problema": [],
                    "justificativa_geral": "Erro ao processar validação. Por favor, revise o conteúdo e tente novamente."
                }
            raise

