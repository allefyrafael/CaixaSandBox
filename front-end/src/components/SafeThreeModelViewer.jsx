import React, { useState } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import ThreeModelViewer from './ThreeModelViewer';
function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!context) return false;
    context.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch { return false; }
}
function Illustration({ width = 400, height = 400, className, style }) {
  return <div className={className} style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth: '100%', ...style }} role="img" aria-label="Assistente do Sandbox CAIXA">
    <div className="relative rounded-full bg-gradient-to-br from-blue-100 to-orange-100 p-12 shadow-xl border border-white">
      <Bot className="w-32 h-32 text-caixa-blue" strokeWidth={1.3} />
      <Sparkles className="absolute right-7 top-7 w-9 h-9 text-caixa-orange" />
    </div>
  </div>;
}
class ModelBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <Illustration {...this.props.viewerProps} /> : this.props.children; }
}
export default function SafeThreeModelViewer(props) {
  const [available] = useState(supportsWebGL);
  if (!available) return <Illustration {...props} />;
  return <ModelBoundary viewerProps={props}><ThreeModelViewer {...props} /></ModelBoundary>;
}
