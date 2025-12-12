/**
 * Form Mockup Service
 * Gerencia o mockup do formulário e sincronização com a IA
 */

class FormMockupService {
  constructor() {
    this.mockupKey = 'sandbox_form_mockup';
    this.changesKey = 'sandbox_pending_changes';
  }

  /**
   * Cria mockup inicial baseado nos dados do formulário
   */
  createMockup(formData) {
    const mockup = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      data: { ...formData },
      pendingChanges: [],
      aiSuggestions: [],
      version: 1,
      lastUpdated: new Date().toISOString()
    };

    this.saveMockup(mockup);
    return mockup;
  }

  /**
   * Obtém o mockup atual
   */
  getCurrentMockup() {
    try {
      const stored = localStorage.getItem(this.mockupKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Erro ao carregar mockup:', error);
      return null;
    }
  }

  /**
   * Salva o mockup no localStorage
   */
  saveMockup(mockup) {
    try {
      mockup.lastUpdated = new Date().toISOString();
      localStorage.setItem(this.mockupKey, JSON.stringify(mockup));
      return true;
    } catch (error) {
      console.error('Erro ao salvar mockup:', error);
      return false;
    }
  }

  /**
   * Atualiza um campo específico do mockup
   */
  updateMockupField(fieldName, newValue, source = 'user') {
    const mockup = this.getCurrentMockup();
    if (!mockup) return null;

    // Registra a mudança
    const change = {
      id: Date.now(),
      field: fieldName,
      oldValue: mockup.data[fieldName] || '',
      newValue: newValue,
      source: source, // 'user' ou 'ai'
      timestamp: new Date().toISOString(),
      applied: source === 'user' // Mudanças do usuário são aplicadas imediatamente
    };

    mockup.data[fieldName] = newValue;
    mockup.pendingChanges.push(change);
    mockup.version += 1;

    this.saveMockup(mockup);
    return mockup;
  }

  /**
   * Adiciona sugestões da IA ao mockup
   */
  addAISuggestions(suggestions) {
    const mockup = this.getCurrentMockup();
    if (!mockup) return null;

    const aiSuggestions = suggestions.map(suggestion => ({
      id: Date.now() + Math.random(),
      ...suggestion,
      status: 'pending', // 'pending', 'approved', 'rejected'
      timestamp: new Date().toISOString()
    }));

    mockup.aiSuggestions = [...mockup.aiSuggestions, ...aiSuggestions];
    this.saveMockup(mockup);

    return mockup;
  }

  /**
   * Aprova uma sugestão da IA
   */
  approveSuggestion(suggestionId) {
    const mockup = this.getCurrentMockup();
    if (!mockup) return null;

    const suggestion = mockup.aiSuggestions.find(s => s.id === suggestionId);
    if (!suggestion) return null;

    // Atualiza o status da sugestão
    suggestion.status = 'approved';
    suggestion.appliedAt = new Date().toISOString();

    // Aplica a mudança no mockup
    const change = {
      id: Date.now(),
      field: suggestion.field,
      oldValue: mockup.data[suggestion.field] || '',
      newValue: suggestion.suggestedValue,
      source: 'ai_approved',
      timestamp: new Date().toISOString(),
      applied: true,
      suggestionId: suggestionId
    };

    mockup.data[suggestion.field] = suggestion.suggestedValue;
    mockup.pendingChanges.push(change);
    mockup.version += 1;

    this.saveMockup(mockup);
    return mockup;
  }

  /**
   * Rejeita uma sugestão da IA
   */
  rejectSuggestion(suggestionId, reason = '') {
    const mockup = this.getCurrentMockup();
    if (!mockup) return null;

    const suggestion = mockup.aiSuggestions.find(s => s.id === suggestionId);
    if (!suggestion) return null;

    suggestion.status = 'rejected';
    suggestion.rejectedAt = new Date().toISOString();
    suggestion.rejectionReason = reason;

    this.saveMockup(mockup);
    return mockup;
  }

  /**
   * Obtém diferenças entre o mockup e os dados do formulário original
   */
  getMockupDifferences(originalFormData) {
    const mockup = this.getCurrentMockup();
    if (!mockup) return [];

    const differences = [];
    const mockupData = mockup.data;

    Object.keys(mockupData).forEach(field => {
      const originalValue = originalFormData[field] || '';
      const mockupValue = mockupData[field] || '';

      if (originalValue !== mockupValue) {
        differences.push({
          field: field,
          originalValue: originalValue,
          mockupValue: mockupValue,
          hasChanged: true
        });
      }
    });

    return differences;
  }

  /**
   * Sincroniza o mockup com o formulário real
   */
  syncWithForm(formData) {
    const mockup = this.getCurrentMockup();
    if (!mockup) {
      return this.createMockup(formData);
    }

    // Atualiza apenas os campos que foram alterados pelo usuário
    const changes = [];
    Object.keys(formData).forEach(field => {
      const formValue = formData[field] || '';
      const mockupValue = mockup.data[field] || '';

      if (formValue !== mockupValue) {
        changes.push({
          field: field,
          oldValue: mockupValue,
          newValue: formValue
        });
        mockup.data[field] = formValue;
      }
    });

    if (changes.length > 0) {
      changes.forEach(change => {
        mockup.pendingChanges.push({
          id: Date.now() + Math.random(),
          ...change,
          source: 'form_sync',
          timestamp: new Date().toISOString(),
          applied: true
        });
      });

      mockup.version += 1;
      this.saveMockup(mockup);
    }

    return mockup;
  }

  /**
   * Obtém sugestões pendentes
   */
  getPendingSuggestions() {
    const mockup = this.getCurrentMockup();
    if (!mockup) return [];

    return mockup.aiSuggestions.filter(s => s.status === 'pending');
  }

  /**
   * Limpa o mockup (usado quando o formulário é enviado)
   */
  clearMockup() {
    try {
      localStorage.removeItem(this.mockupKey);
      localStorage.removeItem(this.changesKey);
      return true;
    } catch (error) {
      console.error('Erro ao limpar mockup:', error);
      return false;
    }
  }

  /**
   * Exporta o mockup para envio
   */
  exportMockup() {
    const mockup = this.getCurrentMockup();
    if (!mockup) return null;

    return {
      formData: mockup.data,
      metadata: {
        version: mockup.version,
        timestamp: mockup.timestamp,
        lastUpdated: mockup.lastUpdated,
        totalChanges: mockup.pendingChanges.length,
        aiSuggestionsApplied: mockup.aiSuggestions.filter(s => s.status === 'approved').length,
        completionScore: this.calculateCompletionScore(mockup.data)
      },
      history: {
        changes: mockup.pendingChanges,
        suggestions: mockup.aiSuggestions
      }
    };
  }

  /**
   * Calcula score de completude do formulário
   */
  calculateCompletionScore(formData) {
    const requiredFields = ['ideaTitle', 'ideaDescription', 'objetivos', 'faseDesejada'];
    const optionalFields = ['problema', 'publicoAlvo', 'metricas', 'cronograma', 'recursos', 'desafios'];
    
    let score = 0;
    let maxScore = requiredFields.length * 10 + optionalFields.length * 5;

    // Campos obrigatórios valem mais
    requiredFields.forEach(field => {
      if (formData[field] && formData[field].length > 10) {
        score += 10;
      } else if (formData[field] && formData[field].length > 0) {
        score += 5;
      }
    });

    // Campos opcionais
    optionalFields.forEach(field => {
      if (formData[field] && formData[field].length > 10) {
        score += 5;
      } else if (formData[field] && formData[field].length > 0) {
        score += 2;
      }
    });

    return Math.round((score / maxScore) * 100);
  }

  /**
   * Gera estatísticas do mockup
   */
  getMockupStats() {
    const mockup = this.getCurrentMockup();
    if (!mockup) return null;

    const pendingSuggestions = mockup.aiSuggestions.filter(s => s.status === 'pending').length;
    const approvedSuggestions = mockup.aiSuggestions.filter(s => s.status === 'approved').length;
    const rejectedSuggestions = mockup.aiSuggestions.filter(s => s.status === 'rejected').length;

    return {
      version: mockup.version,
      completionScore: this.calculateCompletionScore(mockup.data),
      totalChanges: mockup.pendingChanges.length,
      aiInteractions: mockup.aiSuggestions.length,
      pendingSuggestions,
      approvedSuggestions,
      rejectedSuggestions,
      lastUpdated: mockup.lastUpdated,
      fieldsCompleted: Object.keys(mockup.data).filter(k => mockup.data[k] && mockup.data[k].length > 0).length
    };
  }
}

const formMockupServiceInstance = new FormMockupService();
export default formMockupServiceInstance;
