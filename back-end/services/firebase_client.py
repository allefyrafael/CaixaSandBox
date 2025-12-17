"""
Cliente Firebase - Integração com Firestore
Armazena ideias, metadados e histórico de chat
"""

import os
import re
from pathlib import Path
from typing import Optional, Dict, Any, List
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
from config.settings import settings

class FirebaseClient:
    """Cliente para comunicação com Firebase Firestore"""
    
    def __init__(self):
        if not firebase_admin._apps:
            credentials_path = self._find_credentials_file()
            
            if credentials_path:
                try:
                    print(f"[FIREBASE] Carregando credenciais de: {credentials_path}")
                    cred = credentials.Certificate(str(credentials_path))
                    firebase_admin.initialize_app(cred)
                    print("[FIREBASE] OK: Inicializado com arquivo de credenciais")
                except Exception as e:
                    raise Exception(f"Erro ao carregar credenciais Firebase: {str(e)}")
            else:
                try:
                    print("[FIREBASE] Tentando usar Application Default Credentials (ADC)")
                    firebase_admin.initialize_app()
                    print("[FIREBASE] OK: Inicializado com ADC")
                except Exception as e:
                    raise Exception(
                        f"Erro ao inicializar Firebase. "
                        f"Configure FIREBASE_CREDENTIALS_PATH no .env ou use ADC. "
                        f"Erro: {str(e)}"
                    )
        
        try:
            self.db = firestore.client()
            self._initialized = True
        except Exception as e:
            self._initialized = False
            raise Exception(f"Erro ao conectar com Firestore: {str(e)}")
    
    def _find_credentials_file(self) -> Optional[Path]:
        """
        Encontra o arquivo de credenciais do Firebase
        
        Tenta na seguinte ordem:
        1. Caminho absoluto fornecido em FIREBASE_CREDENTIALS_PATH
        2. Caminho relativo à pasta back-end/
        3. Busca automática por arquivo *-firebase-adminsdk-*.json na pasta back-end/
        """
        back_end_path = Path(__file__).parent.parent
        
        # 1. Tentar caminho fornecido no .env (absoluto ou relativo)
        if settings.FIREBASE_CREDENTIALS_PATH:
            print(f"[FIREBASE] Procurando credenciais em: {settings.FIREBASE_CREDENTIALS_PATH}")
            
            # Tentar como caminho absoluto
            if os.path.isabs(settings.FIREBASE_CREDENTIALS_PATH):
                if os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
                    print(f"[FIREBASE] OK: Encontrado (absoluto): {settings.FIREBASE_CREDENTIALS_PATH}")
                    return Path(settings.FIREBASE_CREDENTIALS_PATH)
                else:
                    print(f"[FIREBASE] ERRO: Nao encontrado (absoluto): {settings.FIREBASE_CREDENTIALS_PATH}")
            else:
                # Tentar como caminho relativo à pasta back-end/
                relative_path = back_end_path / settings.FIREBASE_CREDENTIALS_PATH
                if relative_path.exists():
                    print(f"[FIREBASE] OK: Encontrado (relativo back-end): {relative_path}")
                    return relative_path
                else:
                    print(f"[FIREBASE] ERRO: Nao encontrado (relativo back-end): {relative_path}")
                
                # Tentar na pasta atual (onde o script está rodando)
                current_dir_path = Path.cwd() / settings.FIREBASE_CREDENTIALS_PATH
                if current_dir_path.exists():
                    print(f"[FIREBASE] OK: Encontrado (pasta atual): {current_dir_path}")
                    return current_dir_path
                else:
                    print(f"[FIREBASE] ERRO: Nao encontrado (pasta atual): {current_dir_path}")
        
        # 2. Busca automática por arquivo de credenciais na pasta back-end/
        print(f"[FIREBASE] Buscando automaticamente em: {back_end_path}")
        credentials_files = list(back_end_path.glob("*-firebase-adminsdk-*.json"))
        
        if credentials_files:
            print(f"[FIREBASE] OK: Encontrado automaticamente: {credentials_files[0]}")
            return credentials_files[0]
        else:
            print(f"[FIREBASE] ERRO: Nenhum arquivo de credenciais encontrado em: {back_end_path}")
            # Tentar também na pasta atual
            current_dir_files = list(Path.cwd().glob("*-firebase-adminsdk-*.json"))
            if current_dir_files:
                print(f"[FIREBASE] OK: Encontrado na pasta atual: {current_dir_files[0]}")
                return current_dir_files[0]
        
        return None
    
    def is_initialized(self) -> bool:
        """Verifica se o Firebase está inicializado"""
        return getattr(self, '_initialized', False) and firebase_admin._apps
    
    # ============================================
    # OPERAÇÕES COM IDEIAS
    # ============================================
    
    async def create_idea(
        self,
        user_id: str,
        idea_data: Dict[str, Any]
    ) -> str:
        """
        Cria uma nova ideia
        
        Args:
            user_id: ID do usuário
            idea_data: Dados da ideia
        
        Returns:
            ID da ideia criada
        """
        # Filtrar campos vazios antes de criar o documento
        filtered_data = {}
        for key, value in idea_data.items():
            # Ignorar strings vazias
            if isinstance(value, str) and value.strip() == "":
                continue
            
            # Se for dict (dynamic_content), filtrar campos vazios dentro
            if isinstance(value, dict):
                filtered_dict = {k: v for k, v in value.items() if v is not None and (not isinstance(v, str) or v.strip() != "")}
                if filtered_dict:
                    filtered_data[key] = filtered_dict
                continue
            
            # Incluir o campo (já validado que não é string vazia)
            filtered_data[key] = value
        
        # Adicionar campos obrigatórios
        filtered_data.update({
            "user_id": user_id,
            "created_at": firestore.SERVER_TIMESTAMP,
            "updated_at": firestore.SERVER_TIMESTAMP,
            "status": filtered_data.get("status", "draft")
        })
        
        doc_ref = self.db.collection("ideias").document()
        doc_ref.set(filtered_data)
        return doc_ref.id
    
    async def get_idea(
        self,
        user_id: str,
        idea_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Busca uma ideia específica
        
        Args:
            user_id: ID do usuário
            idea_id: ID da ideia
        
        Returns:
            Dados da ideia ou None
        """
        doc_ref = self.db.collection("ideias").document(idea_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return None
        
        data = doc.to_dict()
        if data.get("user_id") != user_id:
            return None
        
        data["id"] = doc.id
        return data
    
    async def update_idea(
        self,
        user_id: str,
        idea_id: str,
        update_data: Dict[str, Any]
    ) -> bool:
        """
        Atualiza uma ideia
        
        Args:
            user_id: ID do usuário
            idea_id: ID da ideia
            update_data: Dados para atualizar (campos vazios serão ignorados)
        
        Returns:
            True se atualizado com sucesso
        """
        # Verificar se a ideia pertence ao usuário
        idea = await self.get_idea(user_id, idea_id)
        if not idea:
            return False
        
        # Filtrar campos vazios - NUNCA salvar strings vazias
        # Manter apenas campos que têm valor ou são explicitamente None
        filtered_update = {}
        for key, value in update_data.items():
            # SEMPRE ignorar strings vazias, independente de o campo existir ou não
            if isinstance(value, str) and value.strip() == "":
                continue
            
            # Se for dict (dynamic_content), verificar se tem conteúdo
            if isinstance(value, dict):
                # Filtrar campos vazios dentro do dict
                filtered_dict = {k: v for k, v in value.items() if v is not None and (not isinstance(v, str) or v.strip() != "")}
                if filtered_dict:
                    filtered_update[key] = filtered_dict
                # Se o dict estiver vazio, não incluir
                continue
            
            # Incluir o campo na atualização (já validado que não é string vazia)
            filtered_update[key] = value
        
        # Sempre atualizar updated_at para manter o documento atualizado
        # Usar SERVER_TIMESTAMP para garantir sincronização com servidor
        filtered_update["updated_at"] = firestore.SERVER_TIMESTAMP
        
        doc_ref = self.db.collection("ideias").document(idea_id)
        doc_ref.update(filtered_update)
        return True
    
    async def list_ideas(
        self,
        user_id: str,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Lista ideias de um usuário
        
        Args:
            user_id: ID do usuário
            limit: Limite de resultados
        
        Returns:
            Lista de ideias
        
        Raises:
            Exception: Se o índice composto do Firestore estiver faltando
        """
        try:
            query = (
                self.db.collection("ideias")
                .where("user_id", "==", user_id)
                .order_by("updated_at", direction=firestore.Query.DESCENDING)
                .limit(limit)
            )
            
            docs = query.stream()
            ideas = []
            for doc in docs:
                data = doc.to_dict()
                data["id"] = doc.id
                ideas.append(data)
            
            return ideas
        except Exception as e:
            error_str = str(e)
            # Verificar se é erro de índice faltante
            if "index" in error_str.lower() or "requires an index" in error_str.lower() or "índice" in error_str.lower():
                # Extrair link do índice se presente no erro
                # O Firestore retorna o link em diferentes formatos
                index_link = None
                
                # Tentar diferentes padrões de extração
                patterns = [
                    "create it here:",
                    "create it here",
                    "create composite:",
                    "create composite",
                    "link:",
                    "https://console.firebase.google.com",
                    "https://console.cloud.google.com"
                ]
                
                for pattern in patterns:
                    if pattern.lower() in error_str.lower():
                        # Encontrar a posição do padrão
                        idx = error_str.lower().find(pattern.lower())
                        if idx != -1:
                            # Extrair tudo após o padrão
                            remaining = error_str[idx + len(pattern):].strip()
                            # Limpar espaços e caracteres extras
                            remaining = remaining.lstrip(": ").strip()
                            # Procurar por URL completa
                            url_match = re.search(r'https?://[^\s\)]+', remaining)
                            if url_match:
                                index_link = url_match.group(0)
                                break
                            # Se não encontrar URL completa, pegar até o próximo espaço ou quebra
                            if remaining:
                                index_link = remaining.split()[0] if remaining.split() else remaining
                                break
                
                # Se ainda não encontrou, procurar diretamente por URLs no erro
                if not index_link:
                    url_matches = re.findall(r'https?://[^\s\)]+', error_str)
                    if url_matches:
                        index_link = url_matches[0]
                
                error_msg = (
                    "A query requer um índice composto no Firestore. "
                    "Por favor, crie o índice necessário."
                )
                if index_link:
                    error_msg += f" Link: {index_link}"
                else:
                    # Link padrão para criar índice
                    error_msg += f" Acesse: https://console.firebase.google.com/project/{settings.FIREBASE_PROJECT_ID}/firestore/indexes"
                
                raise Exception(error_msg) from e
            # Re-raise outros erros
            raise
    
    async def delete_idea(
        self,
        user_id: str,
        idea_id: str
    ) -> bool:
        """
        Deleta uma ideia
        
        Args:
            user_id: ID do usuário
            idea_id: ID da ideia
        
        Returns:
            True se deletado com sucesso
        """
        idea = await self.get_idea(user_id, idea_id)
        if not idea:
            return False
        
        self.db.collection("ideias").document(idea_id).delete()
        return True
    
    # ============================================
    # OPERAÇÕES COM CHAT
    # ============================================
    
    async def add_chat_message(
        self,
        user_id: str,
        idea_id: str,
        role: str,
        content: str
    ) -> str:
        """
        Adiciona mensagem ao histórico de chat
        
        Args:
            user_id: ID do usuário
            idea_id: ID da ideia
            role: 'user' ou 'assistant'
            content: Conteúdo da mensagem
        
        Returns:
            ID da mensagem
        """
        chat_ref = (
            self.db.collection("ideias")
            .document(idea_id)
            .collection("chat")
            .document()
        )
        
        message_data = {
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow()
        }
        
        chat_ref.set(message_data)
        return chat_ref.id
    
    async def get_chat_history(
        self,
        user_id: str,
        idea_id: str,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Busca histórico de chat
        
        Args:
            user_id: ID do usuário
            idea_id: ID da ideia
            limit: Limite de mensagens
        
        Returns:
            Lista de mensagens ordenadas por timestamp
        """
        # Verificar se a ideia pertence ao usuário
        idea = await self.get_idea(user_id, idea_id)
        if not idea:
            return []
        
        try:
            query = (
                self.db.collection("ideias")
                .document(idea_id)
                .collection("chat")
                .order_by("timestamp", direction=firestore.Query.ASCENDING)
                .limit(limit)
            )
            
            docs = query.stream()
            messages = []
            for doc in docs:
                data = doc.to_dict()
                data["id"] = doc.id
                # Converter timestamp do Firestore para string ISO
                if "timestamp" in data and hasattr(data["timestamp"], "isoformat"):
                    data["timestamp"] = data["timestamp"].isoformat()
                elif "timestamp" in data:
                    data["timestamp"] = str(data["timestamp"])
                messages.append(data)
            
            return messages
        except Exception:
            # Se a coleção não existir, retornar lista vazia
            return []
    
    async def clear_chat_history(
        self,
        user_id: str,
        idea_id: str
    ) -> bool:
        """
        Limpa histórico de chat
        
        Args:
            user_id: ID do usuário
            idea_id: ID da ideia
        
        Returns:
            True se limpo com sucesso
        """
        idea = await self.get_idea(user_id, idea_id)
        if not idea:
            return False
        
        try:
            chat_ref = (
                self.db.collection("ideias")
                .document(idea_id)
                .collection("chat")
            )
            
            docs = chat_ref.stream()
            for doc in docs:
                doc.reference.delete()
            
            return True
        except Exception:
            # Se a coleção não existir, considerar sucesso
            return True

# Instância global do cliente
_firebase_client: Optional[FirebaseClient] = None

def get_firebase_client() -> FirebaseClient:
    """Retorna instância singleton do cliente Firebase"""
    global _firebase_client
    if _firebase_client is None:
        _firebase_client = FirebaseClient()
    return _firebase_client

