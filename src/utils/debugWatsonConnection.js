/**
 * Debug específico para conexão Watson
 * Teste isolado da configuração e conectividade
 */

import IBMConfig from '../config/ibmConfig';

export const debugWatsonConnection = async () => {
  console.log('🔍 Debug Watson Connection');
  console.log('📋 Configuração atual:', {
    apiKey: IBMConfig.apiKey ? `${IBMConfig.apiKey.substring(0, 20)}...` : 'MISSING',
    baseUrl: IBMConfig.baseUrl,
    agentId: IBMConfig.agentId,
    iamUrl: IBMConfig.iamUrl
  });

  try {
    // Teste 1: Obter token IAM
    console.log('🔑 Testando obtenção de token IAM...');
    
    const tokenResponse = await fetch(IBMConfig.iamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'grant_type': 'urn:ibm:params:oauth:grant-type:apikey',
        'apikey': IBMConfig.apiKey,
      }),
    });

    console.log('🔑 Token response status:', tokenResponse.status);
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ Erro no token:', errorText);
      return { step: 'token', success: false, error: errorText };
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ Token obtido com sucesso');

    // Teste 2: Testar conectividade com Watson
    console.log('🌐 Testando conectividade com Watson...');
    
    const testPayload = {
      agent_id: IBMConfig.agentId,
      message: {
        role: 'user',
        content: 'teste de conexão'
      }
    };

    const watsonUrl = `${IBMConfig.baseUrl}/orchestrate/runs`;
    console.log('📡 URL Watson:', watsonUrl);
    console.log('📦 Payload:', testPayload);

    const watsonResponse = await fetch(watsonUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    console.log('📡 Watson response status:', watsonResponse.status);
    
    if (!watsonResponse.ok) {
      const errorText = await watsonResponse.text();
      console.error('❌ Erro no Watson:', errorText);
      
      // Tentar outras URLs possíveis
      const alternativeUrls = [
        'https://us-south.ml.cloud.ibm.com/v1/orchestrate/runs',
        'https://us-south.ml.cloud.ibm.com/ml/v1/orchestrate/runs',
        'https://us-south.ml.cloud.ibm.com/orchestrate/runs'
      ];

      console.log('🔄 Testando URLs alternativas...');
      for (const altUrl of alternativeUrls) {
        try {
          console.log(`🧪 Testando: ${altUrl}`);
          const altResponse = await fetch(altUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(testPayload),
          });
          console.log(`📊 ${altUrl} - Status: ${altResponse.status}`);
          
          if (altResponse.ok) {
            console.log(`✅ URL funcionando: ${altUrl}`);
            return { 
              step: 'watson', 
              success: true, 
              workingUrl: altUrl,
              suggestion: `Altere baseUrl para: ${altUrl.replace('/orchestrate/runs', '')}`
            };
          }
        } catch (altError) {
          console.log(`❌ ${altUrl} - Erro:`, altError.message);
        }
      }
      
      return { step: 'watson', success: false, error: errorText };
    }

    const watsonData = await watsonResponse.json();
    console.log('✅ Watson respondeu com sucesso:', watsonData);

    return { 
      step: 'complete', 
      success: true, 
      data: watsonData,
      token: tokenData
    };

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return { step: 'general', success: false, error: error.message };
  }
};

// Disponibilizar no window para teste manual
if (typeof window !== 'undefined') {
  window.debugWatsonConnection = debugWatsonConnection;
  console.log('🧪 Debug disponível em window.debugWatsonConnection()');
}
