const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
function update(file, transform) {
  const location = path.join(root, file);
  fs.writeFileSync(location, transform(fs.readFileSync(location, 'utf8')));
}
update('src/App.js', source => source
  .replace('BrowserRouter as Router', 'HashRouter as Router')
  .replace('<Router basename="/CaixaSandBox">', '<Router>'));
update('src/components/HeroSection.jsx', source => source.replace("from './ThreeModelViewer'", "from './SafeThreeModelViewer'"));
update('src/services/api.js', source => source
  .replace("const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';", "const API_URL = process.env.REACT_APP_API_URL || ''; ")
  .replace('async function fetchAPI(endpoint, options = {}) {', "async function fetchAPI(endpoint, options = {}) {\n  if (!API_URL) throw new Error('Esta demonstração não está conectada ao serviço de dados.');"));
fs.writeFileSync(path.join(root, 'public/404.html'), [
  '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Sandbox CAIXA</title><script>',
  "const base = '/CaixaSandBox';",
  "const route = location.pathname.startsWith(base) ? location.pathname.slice(base.length) : '/';",
  "location.replace(base + '/#' + route + location.search + location.hash);",
  '</script></head><body>Redirecionando para o Sandbox CAIXA...</body></html>'
].join('\n'));
