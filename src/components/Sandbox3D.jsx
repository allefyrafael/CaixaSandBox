import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Grid } from '@react-three/drei';

// Cores para os materiais
const COR_MADEIRA = '#8B4513'; // SaddleBrown
const COR_AREIA = '#C2B280';   // Khaki

function SandBox(props) {
  const { position = [0, 0, 0], size = [4, 0.2, 3] } = props;
  const [width, height, depth] = size;

  const wallThickness = 0.1;
  const wallHeight = 1;

  return (
    <group position={position}>
      {/* Base da Caixa (Madeira) */}
      <mesh position={[0, -height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={COR_MADEIRA} />
      </mesh>

      {/* Areia (um pouco acima da base para evitar z-fighting) */}
      <mesh position={[0, (height / 2) + 0.01, 0]} receiveShadow>
        <boxGeometry args={[width - wallThickness * 2, 0.1, depth - wallThickness * 2]} />
        <meshStandardMaterial color={COR_AREIA} roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Paredes Laterais (Madeira) */}
      {/* Parede Trás */}
      <mesh position={[0, wallHeight / 2, -depth / 2 + wallThickness / 2]} castShadow>
        <boxGeometry args={[width, wallHeight, wallThickness]} />
        <meshStandardMaterial color={COR_MADEIRA} />
      </mesh>
      {/* Parede Frente */}
      <mesh position={[0, wallHeight / 2, depth / 2 - wallThickness / 2]} castShadow>
        <boxGeometry args={[width, wallHeight, wallThickness]} />
        <meshStandardMaterial color={COR_MADEIRA} />
      </mesh>
      {/* Parede Esquerda */}
      <mesh position={[-width / 2 + wallThickness / 2, wallHeight / 2, 0]} castShadow>
        <boxGeometry args={[wallThickness, wallHeight, depth]} />
        <meshStandardMaterial color={COR_MADEIRA} />
      </mesh>
      {/* Parede Direita */}
      <mesh position={[width / 2 - wallThickness / 2, wallHeight / 2, 0]} castShadow>
        <boxGeometry args={[wallThickness, wallHeight, depth]} />
        <meshStandardMaterial color={COR_MADEIRA} />
      </mesh>
    </group>
  );
}

const Sandbox3D = () => {
  return (
    <div className="w-full h-[420px] md:h-[520px] lg:h-[560px] rounded-2xl overflow-hidden shadow-2xl border border-gray-100 bg-white">
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }} shadows>
        {/* Cor de fundo da cena */}
        <color attach="background" args={["#ADD8E6"]} />

        {/* Luzes */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />

        {/* Controles */}
        <OrbitControls enableDamping dampingFactor={0.1} />

        {/* Grid sutil */}
        <Grid infiniteGrid position={[0, -0.01, 0]} fadeDistance={30} cellSize={1} sectionThickness={0.6} sectionColor={'#99ccee'} />

        {/* Caixa de areia */}
        <SandBox position={[0, 0.1, 0]} />

        {/* Título 3D */}
        <Suspense fallback={null}>
          <Text
            position={[0, 2.5, 0]}
            fontSize={0.8}
            color="black"
            anchorX="center"
            anchorY="middle"
          >
            SandBox CAIXA
          </Text>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Sandbox3D;
