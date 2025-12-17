"""
Cliente Groq - Integração com LPU (Language Processing Unit)
Fornece inferência rápida para os agentes cognitivos
"""

import os
from typing import Optional, Dict, Any
from groq import Groq
from config.settings import settings
import json

class GroqClient:
    """Cliente para comunicação com Groq API"""
    
    def __init__(self):
        if not settings.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY não configurada")
        
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model = settings.GROQ_MODEL
        self.timeout = settings.GROQ_TIMEOUT
    
    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        response_format: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Gera resposta do modelo Groq
        
        Args:
            prompt: Prompt principal
            system_prompt: Prompt do sistema (persona)
            temperature: Criatividade (0.0-1.0)
            max_tokens: Máximo de tokens na resposta
            response_format: Formato de resposta (ex: {"type": "json_object"})
        
        Returns:
            Resposta do modelo
        """
        messages = []
        
        if system_prompt:
            messages.append({
                "role": "system",
                "content": system_prompt
            })
        
        messages.append({
            "role": "user",
            "content": prompt
        })
        
        try:
            # Preparar parâmetros da chamada
            params = {
                "model": self.model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens
            }
            
            # Adicionar response_format se fornecido
            if response_format:
                params["response_format"] = response_format
            
            chat_completion = self.client.chat.completions.create(**params)
            
            return chat_completion.choices[0].message.content
        
        except Exception as e:
            raise Exception(f"Erro na comunicação com Groq: {str(e)}")
    
    async def generate_json(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.3
    ) -> Dict[str, Any]:
        """
        Gera resposta em formato JSON estruturado
        
        Args:
            prompt: Prompt principal
            system_prompt: Prompt do sistema
            temperature: Temperatura (mais baixa para respostas mais determinísticas)
        
        Returns:
            Dicionário Python com a resposta parseada
        """
        response = await self.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=temperature,
            response_format={"type": "json_object"}
        )
        
        try:
            return json.loads(response)
        except json.JSONDecodeError as e:
            # Tentar extrair JSON da resposta se estiver em markdown
            import re
            json_match = re.search(r'\{[^{}]*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            raise Exception(f"Erro ao parsear JSON: {str(e)}")

# Instância global do cliente
_groq_client: Optional[GroqClient] = None

def get_groq_client() -> GroqClient:
    """Retorna instância singleton do cliente Groq"""
    global _groq_client
    if _groq_client is None:
        _groq_client = GroqClient()
    return _groq_client

