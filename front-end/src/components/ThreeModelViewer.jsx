import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function ThreeModelViewer({
  modelUrl = `${process.env.PUBLIC_URL}/Robo_SandBox.glb`,
  width = 800,
  height = 600,
  dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 1,
  cameraPosition = { x: 0, y: 1, z: 3 },
  fov = 30,
  near = 0.1,
  far = 1000,
  modelPosition = { x: 0, y: -1, z: 0 },
  modelRotation = { x: 0, y: 0, z: 0 },
  modelScale = { x: 1, y: 1, z: 1 },
  lights = true,
  enableControls = true,
  controlsTarget = { x: 0, y: 0, z: 0 },
  autoRotate = false,
  style = {},
  className = "",
}) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene transparente
    const scene = new THREE.Scene();
    scene.background = null; // fundo transparente SEMPRE
    scene.fog = null; // Remover qualquer fog que possa causar manchas
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(fov, width / height, near, far);
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    cameraRef.current = camera;

    // Renderer transparente (sem sombras)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(dpr);
    renderer.setClearAlpha(0); // importante para transparência real
    renderer.setClearColor(0x000000, 0); // fundo completamente transparente
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    // Desabilitar completamente sistema de sombras
    renderer.shadowMap.enabled = false;
    renderer.shadowMap.type = THREE.BasicShadowMap; // Tipo mais simples (desabilitado)
    renderer.toneMapping = THREE.NoToneMapping; // Remover tone mapping que pode causar manchas
    renderer.toneMappingExposure = 1.0;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Lights (otimizada para cores vibrantes - sem sombras)
    if (lights) {
      // 1. Luz ambiente forte - garante que todas as partes recebam luz
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
      ambientLight.castShadow = false;
      scene.add(ambientLight);

      // 2. Luz hemisférica - preenche com luz natural
      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x888888, 0.8);
      hemiLight.castShadow = false;
      hemiLight.shadow = null;
      scene.add(hemiLight);

      // 3. Luz direcional principal - ilumina de frente com intensidade alta
      const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.0);
      dirLight1.position.set(10, 10, 5);
      dirLight1.castShadow = false;
      // Desabilitar completamente sistema de sombras
      if (dirLight1.shadow) {
        dirLight1.shadow.enabled = false;
        dirLight1.shadow.map = null;
        dirLight1.shadow.camera = null;
      }
      scene.add(dirLight1);

      // 4. Luz direcional secundária - preenche sombras laterais
      const dirLight2 = new THREE.DirectionalLight(0xffffff, 1.5);
      dirLight2.position.set(-10, 5, -10);
      dirLight2.castShadow = false;
      if (dirLight2.shadow) {
        dirLight2.shadow.enabled = false;
        dirLight2.shadow.map = null;
        dirLight2.shadow.camera = null;
      }
      scene.add(dirLight2);
    }

    // Controls
    let controls = null;
    if (enableControls) {
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.enablePan = false;
      controls.minDistance = 1;
      controls.maxDistance = 10;
      controls.autoRotate = !!autoRotate;
      controls.target.set(controlsTarget.x, controlsTarget.y, controlsTarget.z);
      controls.update();
      controlsRef.current = controls;
    }

    // Loader GLTF (modelo definitivo)
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene || gltf.scenes[0];
        model.scale.set(modelScale.x, modelScale.y, modelScale.z);
        model.position.set(modelPosition.x, modelPosition.y, modelPosition.z);
        model.rotation.set(modelRotation.x, modelRotation.y, modelRotation.z);

        model.traverse((obj) => {
          if (obj.isMesh) {
            // Desabilitar completamente sombras
            obj.castShadow = false;
            obj.receiveShadow = false;
            // Remover shadow do objeto se existir
            if (obj.shadow) {
              obj.shadow = null;
            }
            
            // Tratamento de materiais (limpo, sem efeitos extras)
            if (obj.material) {
              const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
              mats.forEach((m) => {
                // Configurar color space
                if (m.map) {
                  m.map.colorSpace = THREE.SRGBColorSpace;
                }
                if (m.emissiveMap) {
                  m.emissiveMap.colorSpace = THREE.SRGBColorSpace;
                }
                
                // Remover todos os efeitos que podem causar manchas ou sombras
                if (m.isMeshStandardMaterial || m.isMeshPhysicalMaterial) {
                  // Se o material não tem textura, garantir cor base
                  if (!m.map && !m.color) {
                    m.color = new THREE.Color(0xffffff);
                  }
                  // Remover completamente emissão
                  m.emissive = new THREE.Color(0x000000);
                  m.emissiveIntensity = 0;
                  // Remover metalness e roughness excessivos
                  if (m.metalness !== undefined) {
                    m.metalness = 0;
                  }
                  if (m.roughness !== undefined) {
                    m.roughness = 0.5;
                  }
                  // Desabilitar envMap que pode causar reflexos indesejados
                  m.envMap = null;
                  // Remover aoMap (ambient occlusion) que pode criar sombras
                  m.aoMap = null;
                  m.aoMapIntensity = 0;
                }
                
                m.flatShading = false;
                m.needsUpdate = true;
              });
            }
            // Garantir normais calculadas
            if (obj.geometry) {
              if (!obj.geometry.attributes.normal) {
                obj.geometry.computeVertexNormals();
              } else {
                obj.geometry.computeVertexNormals();
              }
            }
          }
        });

        scene.add(model);
        modelRef.current = model;
      },
      undefined,
      (error) => {
        console.error("Erro ao carregar modelo:", error);
      }
    );

    // Loop
    const tick = () => {
      if (controls) controls.update();
      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(tick);
    };
    tick();

    // Cleanup
    return () => {
      cancelAnimationFrame(frameRef.current);
      if (controls) controls.dispose();
      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss?.();
        renderer.domElement && renderer.domElement.remove();
      }
      scene.traverse((obj) => {
        if (obj.isMesh) {
          obj.geometry?.dispose?.();
          if (Array.isArray(obj.material)) obj.material.forEach(disposeMaterial);
          else disposeMaterial(obj.material);
        }
      });
    };
  }, [modelUrl, width, height, dpr, fov, near, far, enableControls]);

  // Updates reativas (sem recriar cena)
  useEffect(() => {
    const camera = cameraRef.current;
    if (camera) camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
  }, [cameraPosition]);

  useEffect(() => {
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    if (renderer && camera) {
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
  }, [width, height]);

  useEffect(() => {
    const model = modelRef.current;
    if (model) {
      model.position.set(modelPosition.x, modelPosition.y, modelPosition.z);
      model.rotation.set(modelRotation.x, modelRotation.y, modelRotation.z);
      model.scale.set(modelScale.x, modelScale.y, modelScale.z);
    }
  }, [modelPosition, modelRotation, modelScale]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (controls) {
      controls.autoRotate = !!autoRotate;
      controls.target.set(controlsTarget.x, controlsTarget.y, controlsTarget.z);
      controls.update();
    }
  }, [autoRotate, controlsTarget]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        position: "relative",
        background: "transparent", // transparente de verdade
        border: "none",
        ...style,
      }}
    />
  );
}

function disposeMaterial(material) {
  if (!material) return;
  const keys = [
    "map",
    "aoMap",
    "emissiveMap",
    "bumpMap",
    "normalMap",
    "displacementMap",
    "roughnessMap",
    "metalnessMap",
    "alphaMap",
    "envMap",
  ];
  keys.forEach((k) => material[k]?.dispose?.());
  material.dispose?.();
}

