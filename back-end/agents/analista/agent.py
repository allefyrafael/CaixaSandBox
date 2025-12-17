"""
Agente Analista - Classificação e Insights
Gera metadados para facilitar a gestão de ideias
"""

from typing import Dict, Any
from pathlib import Path
from services.groq_client import get_groq_client
from .config import (
    TEMPERATURE, MAX_TOKENS, MAX_RESUMO_CARACTERES,
    MAX_TAGS, VALORES_PADRAO, COMPLEXIDADE_VALIDA,
    ALINHAMENTO_MIN, ALINHAMENTO_MAX
)

class AgenteAnalista:
    """Agente responsável por classificar e gerar insights sobre ideias"""
    
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
        return f"""Você é um Diretor de Estratégia (CSO) experiente da CAIXA.
Sua função é analisar ideias e gerar metadados estruturados para facilitar a gestão.

{conhecimento}

Você deve analisar ideias e fornecer:
1. Resumo executivo (TL;DR) - máximo {MAX_RESUMO_CARACTERES} caracteres
2. Setor responsável - baseado na taxonomia interna
3. Nível de complexidade (Baixo, Médio, Alto)
4. Alinhamento estratégico ({ALINHAMENTO_MIN} a {ALINHAMENTO_MAX})
5. Categoria principal

Sua resposta deve ser APENAS um JSON válido com esta estrutura:
{{
    "resumo_executivo": "Resumo em até {MAX_RESUMO_CARACTERES} caracteres",
    "setor_responsavel": "Nome do setor/gerência",
    "nivel_complexidade": "Baixo|Médio|Alto",
    "alinhamento_estrategico": {ALINHAMENTO_MIN}-{ALINHAMENTO_MAX},
    "categoria": "Categoria da ideia",
    "tags": ["tag1", "tag2", "tag3"]
}}"""
    
    def _formatar_ideia(self, ideia: Dict[str, Any]) -> str:
        """Formata dados da ideia em texto para análise"""
        campos = []
        
        if ideia.get("title"):
            campos.append(f"TÍTULO: {ideia['title']}")
        
        if ideia.get("description"):
            campos.append(f"DESCRIÇÃO: {ideia['description']}")
        
        # Dynamic content
        dynamic = ideia.get("dynamic_content", {})
        for campo in ["problema", "objetivos", "metricas", "recursos", "cronograma"]:
            if dynamic.get(campo):
                campos.append(f"{campo.upper()}: {dynamic[campo]}")
        
        return "\n".join(campos) if campos else "Ideia sem conteúdo"
    
    def _normalizar_complexidade(self, complexidade: str) -> str:
        """Normaliza nível de complexidade"""
        complexidade_lower = complexidade.lower()
        if "baixo" in complexidade_lower or "low" in complexidade_lower:
            return "Baixo"
        elif "alto" in complexidade_lower or "high" in complexidade_lower:
            return "Alto"
        return "Médio"
    
    def _normalizar_resultado(self, resultado: Dict[str, Any]) -> Dict[str, Any]:
        """Normaliza e valida resultado da análise"""
        # Normalizar complexidade
        complexidade = self._normalizar_complexidade(
            resultado.get("nivel_complexidade", "Médio")
        )
        
        # Normalizar alinhamento estratégico
        alinhamento = resultado.get("alinhamento_estrategico", 5)
        try:
            alinhamento = int(alinhamento)
            alinhamento = max(ALINHAMENTO_MIN, min(ALINHAMENTO_MAX, alinhamento))
        except (ValueError, TypeError):
            alinhamento = 5
        
        # Normalizar resumo
        resumo = resultado.get("resumo_executivo", VALORES_PADRAO["resumo_executivo"])
        resumo = resumo[:MAX_RESUMO_CARACTERES]
        
        # Normalizar tags
        tags = resultado.get("tags", [])
        if isinstance(tags, list):
            tags = tags[:MAX_TAGS]
        else:
            tags = []
        
        return {
            "resumo_executivo": resumo,
            "setor_responsavel": resultado.get("setor_responsavel", VALORES_PADRAO["setor_responsavel"]),
            "nivel_complexidade": complexidade,
            "alinhamento_estrategico": alinhamento,
            "categoria": resultado.get("categoria", VALORES_PADRAO["categoria"]),
            "tags": tags
        }
    
    async def analisar(
        self,
        ideia_completa: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Analisa a ideia e gera metadados estruturados
        
        Args:
            ideia_completa: Dados completos da ideia
        
        Returns:
            Dicionário com metadados de classificação
        """
        system_prompt = self._construir_system_prompt()
        texto_ideia = self._formatar_ideia(ideia_completa)
        
        user_prompt = f"""Analise a seguinte ideia e gere os metadados:

{texto_ideia}

Forneça a análise completa em formato JSON."""

        try:
            resultado = await self.groq.generate_json(
                prompt=user_prompt,
                system_prompt=system_prompt,
                temperature=TEMPERATURE
            )
            
            return self._normalizar_resultado(resultado)
        
        except Exception:
            return VALORES_PADRAO.copy()

