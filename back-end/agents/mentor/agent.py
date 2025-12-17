"""
Agente Mentor - Ideação e Refinamento
Atua como consultor sênior fazendo perguntas socráticas
"""

from typing import Dict, Any, Optional, List
from pathlib import Path
from services.groq_client import get_groq_client
from .config import (
    TEMPERATURE_SUGESTAO, TEMPERATURE_CHAT,
    MAX_TOKENS_SUGESTAO, MAX_TOKENS_CHAT,
    MAX_HISTORICO_MENSAGENS, CAMPOS_FORMULARIO
)

class AgenteMentor:
    """Agente responsável por ajudar a refinar ideias"""
    
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
    
    def _construir_system_prompt_sugestao(self) -> str:
        """Constrói prompt do sistema para sugestões"""
        conhecimento = self._carregar_conhecimento()
        return f"""Você é um Mentor Sênior de Inovação da CAIXA.
Sua função é ajudar colaboradores a refinar suas ideias através de perguntas socráticas e sugestões construtivas.

{conhecimento}

Formato de resposta:
- Seja direto e objetivo
- Faça 2-3 perguntas relevantes
- Sugira melhorias específicas
- Conecte aos objetivos estratégicos quando relevante"""
    
    def _construir_system_prompt_chat(self) -> str:
        """Constrói prompt do sistema para chat"""
        conhecimento = self._carregar_conhecimento()
        return f"""Você é um Mentor Sênior de Inovação da CAIXA em um chat ao vivo.
Ajude o colaborador a desenvolver sua ideia através de conversa natural e perguntas socráticas.

{conhecimento}

Seja:
- Conversacional e amigável
- Focado em ajudar a melhorar a ideia
- Conectado aos objetivos estratégicos
- Prático e objetivo"""
    
    def _formatar_contexto(self, contexto: Dict[str, Any]) -> str:
        """Formata contexto do formulário em texto"""
        campos = []
        
        # Mapear campos alternativos
        titulo = contexto.get("title") or contexto.get("ideaTitle")
        descricao = contexto.get("description") or contexto.get("ideaDescription")
        
        if titulo:
            campos.append(f"Título: {titulo}")
        if descricao:
            campos.append(f"Descrição: {descricao}")
        
        # Campos dinâmicos
        for campo in ["problema", "objetivos", "metricas", "recursos", "cronograma"]:
            valor = contexto.get(campo)
            if valor:
                campos.append(f"{campo.capitalize()}: {valor}")
        
        return "\n".join(campos) if campos else "Formulário ainda não preenchido"
    
    async def sugerir_melhoria(
        self,
        contexto_atual: Dict[str, Any],
        campo_foco: Optional[str] = None
    ) -> str:
        """
        Sugere melhorias para a ideia baseado no contexto atual
        
        Args:
            contexto_atual: Dados atuais do formulário
            campo_foco: Campo específico para focar (opcional)
        
        Returns:
            Sugestão de melhoria em texto
        """
        system_prompt = self._construir_system_prompt_sugestao()
        contexto_texto = self._formatar_contexto(contexto_atual)
        
        if campo_foco:
            user_prompt = f"""O usuário está trabalhando no campo "{campo_foco}".

Contexto atual da ideia:
{contexto_texto}

Ajude o usuário a melhorar este campo específico com perguntas socráticas e sugestões."""
        else:
            user_prompt = f"""Contexto atual da ideia:
{contexto_texto}

Analise a ideia e forneça sugestões de melhoria focando em:
1. Completude dos campos obrigatórios
2. Alinhamento com objetivos estratégicos
3. Métricas de sucesso mensuráveis
4. Viabilidade e recursos necessários"""

        try:
            resposta = await self.groq.generate(
                prompt=user_prompt,
                system_prompt=system_prompt,
                temperature=TEMPERATURE_SUGESTAO,
                max_tokens=MAX_TOKENS_SUGESTAO
            )
            return resposta
        except Exception as e:
            return f"Erro ao gerar sugestão: {str(e)}"
    
    async def responder_chat(
        self,
        mensagem_usuario: str,
        contexto_formulario: Dict[str, Any],
        historico: Optional[List[Dict[str, str]]] = None
    ) -> str:
        """
        Responde mensagem do chat com contexto do formulário
        
        Args:
            mensagem_usuario: Mensagem do usuário
            contexto_formulario: Dados atuais do formulário
            historico: Histórico de mensagens anteriores (opcional)
        
        Returns:
            Resposta do mentor
        """
        system_prompt = self._construir_system_prompt_chat()
        contexto_texto = self._formatar_contexto(contexto_formulario)
        
        # Construir histórico se existir
        historico_texto = ""
        if historico:
            historico_texto = "\n\nHistórico da conversa:\n"
            for msg in historico[-MAX_HISTORICO_MENSAGENS:]:
                role = "Usuário" if msg.get("role") == "user" else "Mentor"
                historico_texto += f"{role}: {msg.get('content', '')}\n"
        
        user_prompt = f"""Contexto atual da ideia:
{contexto_texto}
{historico_texto}

Mensagem do usuário: {mensagem_usuario}

Responda de forma natural e útil, ajudando a desenvolver a ideia."""

        try:
            resposta = await self.groq.generate(
                prompt=user_prompt,
                system_prompt=system_prompt,
                temperature=TEMPERATURE_CHAT,
                max_tokens=MAX_TOKENS_CHAT
            )
            return resposta
        except Exception:
            return "Desculpe, ocorreu um erro. Por favor, tente novamente."

