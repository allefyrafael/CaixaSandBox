"""
Carregador de Base de Conhecimento do Agente de Ideia
Lê arquivos de texto da pasta knowledge/ e os inclui no prompt
"""
import os
from pathlib import Path
from typing import List

# Caminho para a pasta de conhecimento do Agente de Ideia
KNOWLEDGE_DIR = Path(__file__).parent / "knowledge"

def load_ideia_knowledge() -> str:
    """
    Carrega todos os arquivos de texto da pasta knowledge/ do Agente de Ideia
    e retorna como uma string formatada
    
    Returns:
        String com todo o conteúdo dos arquivos de conhecimento do Agente de Ideia
    """
    if not KNOWLEDGE_DIR.exists():
        return ""
    
    knowledge_parts = []
    
    # Lista todos os arquivos .txt e .md na pasta
    text_files = list(KNOWLEDGE_DIR.glob("*.txt")) + list(KNOWLEDGE_DIR.glob("*.md"))
    
    # Remove o README.md se existir
    text_files = [f for f in text_files if f.name != "README.md"]
    
    # Ordena por nome para garantir ordem consistente
    text_files.sort()
    
    for file_path in text_files:
        try:
            # Tenta diferentes encodings
            content = None
            for encoding in ['utf-8', 'utf-8-sig', 'latin-1', 'cp1252']:
                try:
                    with open(file_path, 'r', encoding=encoding) as f:
                        content = f.read().strip()
                        break
                except (UnicodeDecodeError, UnicodeError):
                    continue
            
            if content:
                # Adiciona o nome do arquivo como cabeçalho
                knowledge_parts.append(f"\n--- {file_path.name} ---\n{content}")
            else:
                print(f"[AVISO] Não foi possível ler o arquivo {file_path.name} com nenhum encoding conhecido")
        except Exception as e:
            print(f"[AVISO] Erro ao ler arquivo {file_path.name}: {e}")
            continue
    
    if knowledge_parts:
        return "\n".join(knowledge_parts)
    
    return ""

def get_ideia_knowledge_summary() -> dict:
    """
    Retorna um resumo dos arquivos de conhecimento carregados do Agente de Ideia
    
    Returns:
        Dicionário com informações sobre os arquivos
    """
    if not KNOWLEDGE_DIR.exists():
        return {"files_count": 0, "files": []}
    
    text_files = list(KNOWLEDGE_DIR.glob("*.txt")) + list(KNOWLEDGE_DIR.glob("*.md"))
    text_files = [f for f in text_files if f.name != "README.md"]
    text_files.sort()
    
    files_info = []
    total_size = 0
    
    for file_path in text_files:
        try:
            size = file_path.stat().st_size
            total_size += size
            files_info.append({
                "name": file_path.name,
                "size": size,
                "size_kb": round(size / 1024, 2)
            })
        except Exception:
            continue
    
    return {
        "files_count": len(files_info),
        "total_size_kb": round(total_size / 1024, 2),
        "files": files_info
    }

