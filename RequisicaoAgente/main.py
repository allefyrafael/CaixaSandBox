# main.py
# -*- coding: utf-8 -*-
from app.config import IBM_CLOUD_API_KEY, AGENT_ID
from app.auth.iam_token import IAMTokenManager
from app.storage.thread_store import ThreadStore
from app.storage.conversation_logger import ConversationLogger
from app.orchestrate.client import OrchestrateClient
from app.utils.extract import extract_texts

def run_demo():
    tm = IAMTokenManager(IBM_CLOUD_API_KEY)
    store = ThreadStore()
    logger = ConversationLogger()
    client = OrchestrateClient(AGENT_ID, tm, store, logger)

    # True = novo thread / False = continua a conversa salva
    start_new = True
    mensagens = [
        "INICIAR",                                          # 1
        "Programa Inclusão Digital Comunitária",                      # 2
        "João Felipe de Almeida",                           # 3
        "114567",                                           # 4
        "4467",                                             # 5
        "Universidade Católica de Brasília",                                              # 6
        "Muitos jovens têm pouco acesso a recursos de tecnologia, o que dificulta o desenvolvimento de competências digitais para o mercado de trabalho.",  # 7
        "O objetivo é ampliar em 30% o acesso a capacitações digitais em comunidades carentes. A metodologia envolve parcerias com escolas e ONGs locais, treinamentos semanais, oficinas práticas e acompanhamento remoto. Etapas: (1) diagnóstico da comunidade, (2) montagem de laboratórios, (3) oferta de cursos básicos de TI, (4) monitoramento de resultados e (5) relatório final.",               # 8
        "Jovens terão maior interesse em programas de capacitação digital se o ensino for prático e vinculado a oportunidades reais de trabalho.",                                                 # 9
        "Aplicaremos testes A/B entre turmas presenciais e híbridas, medindo engajamento, taxa de conclusão dos cursos e posterior inserção em programas de estágio.",                                                 # 10
        "Hoje apenas 15% dos jovens da comunidade participam de atividades formais de capacitação digital.",                                                 # 11
        "Aumentar em 30% a participação em capacitações, com pelo menos 200 jovens concluindo o curso em um ano.",                                                 # 12
        "Métricas: número de inscritos, taxa de conclusão, satisfação dos participantes, percentual de inserção em programas de estágio ou emprego.",                                                 # 13
        "Risco: falta de equipamentos ou evasão escolar. Mitigação: parcerias com empresas para doação de computadores e acompanhamento próximo dos jovens para manter engajamento."                                                 # 14
    ]

    runs = client.send_sequence(mensagens, start_new_thread=start_new)

    print("=== Respostas do assistente ===")
    for i, r in enumerate(runs, 1):
        for t in extract_texts(r):
            print(f"[{i}] {t}")

if __name__ == "__main__":
    run_demo()
