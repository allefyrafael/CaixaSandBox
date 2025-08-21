import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function ThreeModelViewer({
  modelUrl = "/sandBOX.glb",
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
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(fov, width / height, near, far);
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    cameraRef.current = camera;

    // Renderer transparente
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(dpr);
    renderer.setClearAlpha(0); // importante para transparência real
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Lights (mantendo o "look" do código definitivo)
    if (lights) {
      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
      scene.add(hemiLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight.position.set(5, 10, 7.5);
      dirLight.castShadow = true;
      scene.add(dirLight);
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
            obj.castShadow = true;
            obj.receiveShadow = true;
            // aparência suave + color management coerente
            if (obj.material) {
              const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
              mats.forEach((m) => {
                if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
                if (m.emissiveMap) m.emissiveMap.colorSpace = THREE.SRGBColorSpace;
                m.flatShading = false;
                m.needsUpdate = true;
              });
            }
            if (obj.geometry?.attributes?.normal) {
              obj.geometry.computeVertexNormals();
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
