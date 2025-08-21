import React from 'react'
import ThreeModelViewer from './ThreeModelViewer.jsx';

export default function Hero() {
  return (
    <div style={{ width: '100%', height: 560, position: 'relative' }}>
      <ThreeModelViewer
        modelUrl="/sandBOX.glb"             // seu GLB definitivo
        width={920}                         // ajuste no código
        height={560}
        cameraPosition={{ x: 15, y: 5, z: 15 }}
        modelPosition={{ x: 0, y: -1, z: 0 }}
        modelRotation={{ x: 0, y: 0, z: 0 }}
        modelScale={{ x: 1, y: 1, z: 1 }}
        enableControls
        autoRotate={false}
        style={{ position: 'absolute', inset: 0, background: 'transparent', border: 'none' }}
      />
    </div>
  );
}

