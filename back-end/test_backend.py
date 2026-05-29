"""
Script de teste rápido para verificar se o backend está respondendo
"""
import requests
import sys

def test_backend():
    base_url = "http://localhost:8000"
    
    print("Testando backend...")
    print(f"URL base: {base_url}")
    
    # Teste 1: Health check
    try:
        print("\n1. Testando /health...")
        response = requests.get(f"{base_url}/health", timeout=5)
        print(f"   Status: {response.status_code}")
        print(f"   Resposta: {response.json()}")
    except requests.exceptions.Timeout:
        print("   ❌ TIMEOUT - Backend não está respondendo")
        return False
    except requests.exceptions.ConnectionError:
        print("   ❌ ERRO DE CONEXÃO - Backend não está rodando")
        return False
    except Exception as e:
        print(f"   ❌ ERRO: {e}")
        return False
    
    # Teste 2: Root endpoint
    try:
        print("\n2. Testando /...")
        response = requests.get(f"{base_url}/", timeout=5)
        print(f"   Status: {response.status_code}")
        print(f"   Resposta: {response.json()}")
    except Exception as e:
        print(f"   ❌ ERRO: {e}")
        return False
    
    # Teste 3: Listar ideias (deve retornar lista vazia rapidamente)
    try:
        print("\n3. Testando /api/ideas/test_user...")
        response = requests.get(f"{base_url}/api/ideas/test_user", timeout=10)
        print(f"   Status: {response.status_code}")
        print(f"   Tempo de resposta: {response.elapsed.total_seconds():.2f}s")
        data = response.json()
        print(f"   Ideias retornadas: {len(data)}")
    except requests.exceptions.Timeout:
        print("   ❌ TIMEOUT - Endpoint está demorando muito (>10s)")
        return False
    except Exception as e:
        print(f"   ❌ ERRO: {e}")
        return False
    
    print("\n✅ Todos os testes passaram!")
    return True

if __name__ == "__main__":
    success = test_backend()
    sys.exit(0 if success else 1)



