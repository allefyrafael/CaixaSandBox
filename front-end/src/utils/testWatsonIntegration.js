/**
 * Utilitário para testar a integração com IBM Watson
 * Use apenas em desenvolvimento para validar a conexão
 */

import IBMWatsonClient from '../services/ibmWatsonClient';
import { validateConfig } from '../config/ibmConfig';

/**
 * Testa a conexão básica com IBM Watson
 */
export const testBasicConnection = async () => {
  console.log('🔍 Testando integração IBM Watson...');
  
  try {
    // 1. Valida configuração
    const configValidation = validateConfig();
    console.log('📋 Validação de configuração:', configValidation);
    
    if (!configValidation.isValid) {
      console.warn('⚠️ Configuração incompleta:', configValidation.errors);
    }

    // 2. Testa obtenção de token
    console.log('🔑 Testando obtenção de token...');
    const token = await IBMWatsonClient.getAccessToken();
    console.log('✅ Token obtido com sucesso');

    // 3. Testa envio de mensagem simples
    console.log('💬 Testando envio de mensagem...');
    const response = await IBMWatsonClient.sendMessage('Olá, este é um teste de conexão');
    console.log('✅ Mensagem enviada e resposta recebida:', response);

    return {
      success: true,
      message: 'Integração funcionando corretamente!',
      details: {
        hasToken: !!token,
        responseReceived: !!response,
        threadId: response.threadId
      }
    };

  } catch (error) {
    console.error('❌ Erro no teste de integração:', error);
    return {
      success: false,
      message: error.message,
      error: error
    };
  }
};

/**
 * Testa processamento de formulário completo
 */
export const testFormProcessing = async () => {
  console.log('📝 Testando processamento de formulário...');
  
  const mockFormData = {
    ideaTitle: 'Sistema de Atendimento Inteligente',
    ideaDescription: 'Plataforma que utiliza IA para otimizar o atendimento ao cliente',
    problema: 'Demora no atendimento causa insatisfação dos clientes',
    publicoAlvo: 'Clientes pessoa física da CAIXA',
    objetivos: 'Reduzir tempo de atendimento em 50%',
    metricas: 'Tempo médio de resposta, satisfação do cliente',
    cronograma: '6 meses para implementação',
    recursos: 'Equipe de desenvolvimento, infraestrutura cloud',
    desafios: 'Integração com sistemas legados'
  };

  try {
    const analysis = await IBMWatsonClient.processFormData(mockFormData);
    console.log('✅ Formulário processado:', analysis);
    
    return {
      success: true,
      analysis: analysis,
      suggestionsCount: analysis.suggestions?.length || 0,
      viabilityScore: analysis.viabilityScore
    };

  } catch (error) {
    console.error('❌ Erro no processamento de formulário:', error);
    return {
      success: false,
      message: error.message,
      error: error
    };
  }
};

/**
 * Testa sequência de comandos como no exemplo Python
 */
export const testCommandSequence = async () => {
  console.log('🔄 Testando sequência de comandos...');
  
  const commands = [
    'INICIAR',
    'Sistema de Recomendação Inteligente para Produtos CAIXA',
    'João Silva Santos',
    'Muitos clientes não conhecem todos os produtos disponíveis que poderiam beneficiá-los',
    'Criar sistema de IA que analisa perfil do cliente e recomenda produtos personalizados',
    'Aumentar a adesão a produtos em 25% através de recomendações personalizadas'
  ];

  const results = [];

  try {
    // Inicia novo thread para esta sequência
    IBMWatsonClient.startNewThread();
    
    for (let i = 0; i < commands.length; i++) {
      console.log(`📤 Enviando comando ${i + 1}: ${commands[i].substring(0, 50)}...`);
      
      const response = await IBMWatsonClient.sendMessage(commands[i], true);
      results.push({
        command: commands[i],
        response: response,
        success: response.success
      });
      
      console.log(`📥 Resposta ${i + 1}: ${response.success ? 'Sucesso' : 'Falha'}`);
      
      // Pausa entre comandos para não sobrecarregar
      if (i < commands.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('✅ Sequência de comandos concluída');
    
    return {
      success: true,
      results: results,
      totalCommands: commands.length,
      successfulCommands: results.filter(r => r.success).length,
      threadId: IBMWatsonClient.getCurrentThreadId()
    };

  } catch (error) {
    console.error('❌ Erro na sequência de comandos:', error);
    return {
      success: false,
      message: error.message,
      results: results,
      error: error
    };
  }
};

/**
 * Executa todos os testes
 */
export const runAllTests = async () => {
  console.log('🚀 Iniciando bateria completa de testes...');
  
  const testResults = {
    basic: null,
    form: null,
    sequence: null,
    summary: {
      totalTests: 3,
      passedTests: 0,
      startTime: new Date(),
      endTime: null
    }
  };

  // Teste 1: Conexão básica
  try {
    testResults.basic = await testBasicConnection();
    if (testResults.basic.success) testResults.summary.passedTests++;
  } catch (error) {
    testResults.basic = { success: false, error: error.message };
  }

  // Teste 2: Processamento de formulário
  try {
    testResults.form = await testFormProcessing();
    if (testResults.form.success) testResults.summary.passedTests++;
  } catch (error) {
    testResults.form = { success: false, error: error.message };
  }

  // Teste 3: Sequência de comandos
  try {
    testResults.sequence = await testCommandSequence();
    if (testResults.sequence.success) testResults.summary.passedTests++;
  } catch (error) {
    testResults.sequence = { success: false, error: error.message };
  }

  testResults.summary.endTime = new Date();
  testResults.summary.duration = testResults.summary.endTime - testResults.summary.startTime;
  testResults.summary.success = testResults.summary.passedTests === testResults.summary.totalTests;

  console.log('📊 Resumo dos testes:', testResults.summary);
  
  return testResults;
};

/**
 * Função para executar no console do navegador
 * Para usar: window.testWatson()
 */
if (typeof window !== 'undefined') {
  window.testWatson = {
    basic: testBasicConnection,
    form: testFormProcessing,
    sequence: testCommandSequence,
    all: runAllTests
  };
  
  console.log('🧪 Testes do Watson disponíveis em window.testWatson');
  console.log('Exemplos:');
  console.log('- window.testWatson.basic() - Teste básico');
  console.log('- window.testWatson.form() - Teste de formulário');
  console.log('- window.testWatson.all() - Todos os testes');
}
