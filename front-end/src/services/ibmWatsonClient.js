/** IBM Cloud authentication is restricted to the backend. */
const unavailable = () => { throw new Error('A integração IBM Watson requer um backend seguro. Autenticação direta no navegador está desativada.'); };
const client = {
  getAccessToken: async () => unavailable(),
  sendMessage: async () => unavailable(),
  processFormData: async () => unavailable(),
  startNewThread: () => {},
  getCurrentThreadId: () => null
};
export default client;
