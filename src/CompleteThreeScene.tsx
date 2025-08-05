import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

const CompleteThreeScene = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationMixerRef = useRef<THREE.AnimationMixer | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const cubeRef = useRef<THREE.Mesh | null>(null);
  const torusRef = useRef<THREE.Mesh | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const keysRef = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (!mountRef.current) return;

    const mountElement = mountRef.current;

    // 1. Escena
    const scene = new THREE.Scene();

    // 2. Cámara Personalizada (Requisito 4)
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 8);
    cameraRef.current = camera;

    // 3. Renderizador
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    mountElement.appendChild(renderer.domElement);

    // 4. Skybox como Esfera (Requisito 1)
    console.log("Creando skybox esférico...");
    const skyboxGeometry = new THREE.SphereGeometry(80, 64, 64);
    const skyboxMaterial = new THREE.MeshBasicMaterial({
      color: 0x001133,
      side: THREE.BackSide,
    });
    const skyboxMesh = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
    scene.add(skyboxMesh);

    // Cargar textura del skybox
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      "/images/cielo_tormentoso.jpg",
      (texture) => {
        console.log("[+] Textura de skybox cargada exitosamente");
        texture.mapping = THREE.EquirectangularReflectionMapping;
        skyboxMaterial.map = texture;
        skyboxMaterial.color.setHex(0xffffff);
        skyboxMaterial.needsUpdate = true;
      },
      (progress) => {
        console.log(
          `Cargando textura: ${Math.round(
            (progress.loaded / progress.total) * 100
          )}%`
        );
      },
      (error) => {
        console.error("[-] Error cargando textura skybox:", error);
        // Crear textura procedural como fallback
        const canvas = document.createElement("canvas");
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext("2d")!;

        // Gradiente de cielo tormentoso
        const gradient = ctx.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, "#0a0a1a");
        gradient.addColorStop(0.3, "#1a1a3a");
        gradient.addColorStop(0.6, "#2a2a4a");
        gradient.addColorStop(1, "#1a1a2a");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1024, 512);

        // Añadir algunas "nubes" oscuras
        ctx.fillStyle = "rgba(40, 40, 60, 0.8)";
        for (let i = 0; i < 20; i++) {
          const x = Math.random() * 1024;
          const y = Math.random() * 512;
          const w = 50 + Math.random() * 100;
          const h = 20 + Math.random() * 40;
          ctx.beginPath();
          ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        const fallbackTexture = new THREE.CanvasTexture(canvas);
        fallbackTexture.mapping = THREE.EquirectangularReflectionMapping;
        skyboxMaterial.map = fallbackTexture;
        skyboxMaterial.color.setHex(0xffffff);
        skyboxMaterial.needsUpdate = true;
        console.log("Usando textura procedural como skybox");
      }
    );

    // 5. Controles de Órbita (Requisito 4 - Movimiento controlado)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 40;

    // 6. Iluminación dramática
    const ambientLight = new THREE.AmbientLight(0x2a2a4a, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    scene.add(directionalLight);

    // Luz de relleno azul
    const fillLight = new THREE.DirectionalLight(0x4a6fa5, 0.6);
    fillLight.position.set(-10, 5, -5);
    scene.add(fillLight);

    // Luz puntual para dramatismo
    const pointLight = new THREE.PointLight(0x87ceeb, 1, 100);
    pointLight.position.set(0, 8, 0);
    pointLight.castShadow = true;
    scene.add(pointLight);

    // 7. Modelo Simple Principal - Toroide (Requisito 2 alternativo)
    console.log("🍩 Creando modelo principal (toroide)...");
    const torusGeometry = new THREE.TorusGeometry(2, 0.6, 16, 100);
    const torusMaterial = new THREE.MeshPhongMaterial({
      color: 0xff4500,
      emissive: 0x441100,
      shininess: 100,
      transparent: true,
      opacity: 0.9,
    });
    const torusMesh = new THREE.Mesh(torusGeometry, torusMaterial);
    torusMesh.position.set(0, 0, 0);
    torusMesh.castShadow = true;
    torusMesh.receiveShadow = true;
    scene.add(torusMesh);
    torusRef.current = torusMesh;

    // 8. Intentar cargar modelo GLTF (Requisito 2)
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      "/models/scene.gltf",
      (gltf) => {
        console.log("[+] Modelo GLTF cargado exitosamente");
        const model = gltf.scene;

        // Calcular el bounding box del modelo para escalarlo apropiadamente
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3()).length();
        const scale = 3 / size; // Escalar para que tenga 3 unidades de tamaño

        model.scale.set(scale, scale, scale);
        model.position.set(-4, 0, 0); // Posicionar a un lado

        // Configurar materiales y sombras
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            // Mejorar materiales si es necesario
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((mat) => {
                  if (mat instanceof THREE.MeshStandardMaterial) {
                    mat.envMapIntensity = 1;
                  }
                });
              } else if (child.material instanceof THREE.MeshStandardMaterial) {
                child.material.envMapIntensity = 1;
              }
            }
          }
        });

        scene.add(model);

        // Configurar AnimationMixer para las animaciones del modelo
        if (gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          animationMixerRef.current = mixer;

          console.log(
            `🎬 Reproduciendo ${gltf.animations.length} animación(es)`
          );
          gltf.animations.forEach((clip, index) => {
            const action = mixer.clipAction(clip);
            action.play();
            console.log(
              `   - Animación ${index + 1}: ${
                clip.name || "Sin nombre"
              } (${clip.duration.toFixed(2)}s)`
            );
          });
        }
      },
      (progress) => {
        const percent = Math.round((progress.loaded / progress.total) * 100);
        console.log(`📥 Cargando modelo GLTF: ${percent}%`);
      },
      (error) => {
        console.error("❌ Error cargando modelo GLTF:", error);
        console.log("💡 Continuando solo con el modelo toroide");
      }
    );

    // 9. Animación Programada - Cubo orbital (Requisito 3)
    console.log("📦 Creando cubo con animación programada...");
    const cubeGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const cubeMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ff88,
      emissive: 0x002211,
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(4, 0, 0);
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);
    cubeRef.current = cube;

    // 10. Efecto de Postprocesado (Requisito 5)
    console.log("✨ Configurando efectos de postprocesado...");
    try {
      const composer = new EffectComposer(renderer);

      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.6, // strength
        0.4, // radius
        0.8 // threshold
      );
      composer.addPass(bloomPass);

      composerRef.current = composer;
      console.log("✅ Postprocesado configurado exitosamente");
    } catch (error) {
      console.error("❌ Error configurando postprocesado:", error);
      console.log("💡 Usando renderizado directo");
    }

    // 11. Interacción con Teclado (Requisito 6)
    const handleKeyDown = (event: KeyboardEvent) => {
      keysRef.current[event.code] = true;
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keysRef.current[event.code] = false;
    };

    const updateCameraWithKeys = () => {
      const keys = keysRef.current;
      const speed = 0.1;

      if (keys["KeyW"]) camera.position.z -= speed;
      if (keys["KeyS"]) camera.position.z += speed;
      if (keys["KeyA"]) camera.position.x -= speed;
      if (keys["KeyD"]) camera.position.x += speed;
      if (keys["KeyQ"]) camera.position.y -= speed;
      if (keys["KeyE"]) camera.position.y += speed;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // 12. Loop de Animación Principal
    const animate = () => {
      requestAnimationFrame(animate);

      const deltaTime = clockRef.current.getDelta();
      const elapsedTime = clockRef.current.getElapsedTime();

      // Actualizar AnimationMixer del modelo GLTF
      if (animationMixerRef.current) {
        animationMixerRef.current.update(deltaTime);
      }

      // Animación del toroide central
      if (torusRef.current) {
        torusRef.current.rotation.x += 0.008;
        torusRef.current.rotation.y += 0.012;
        torusRef.current.rotation.z += 0.004;
      }

      // Animación programada del cubo (Requisito 3)
      if (cubeRef.current) {
        cubeRef.current.rotation.x += 0.015;
        cubeRef.current.rotation.y += 0.015;

        // Movimiento orbital complejo
        const radius = 5;
        cubeRef.current.position.x = Math.cos(elapsedTime * 0.8) * radius;
        cubeRef.current.position.z = Math.sin(elapsedTime * 0.8) * radius;
        cubeRef.current.position.y = Math.sin(elapsedTime * 1.2) * 1.5 + 1;

        // Escala pulsante
        const scale = 1 + Math.sin(elapsedTime * 3) * 0.1;
        cubeRef.current.scale.set(scale, scale, scale);
      }

      // Actualizar controles
      controls.update();

      // Actualizar posición de cámara con teclado
      updateCameraWithKeys();

      // Renderizar con postprocesado si está disponible
      if (composerRef.current) {
        composerRef.current.render();
      } else {
        renderer.render(scene, camera);
      }
    };

    console.log("🎬 Iniciando loop de animación...");
    animate();

    // 13. Manejo de redimensionamiento
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);

      if (composerRef.current) {
        composerRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      console.log("🧹 Limpiando recursos...");
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);

      if (mountElement?.contains(renderer.domElement)) {
        mountElement.removeChild(renderer.domElement);
      }

      renderer.dispose();

      if (composerRef.current) {
        composerRef.current.dispose();
      }
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />

      {/* Panel de controles e información */}
      <div
        style={{
          position: "absolute",
          top: "15px",
          left: "15px",
          color: "white",
          fontFamily: "Arial, sans-serif",
          fontSize: "13px",
          background: "rgba(0,15,30,0.9)",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,0.1)",
          zIndex: 1000,
          maxWidth: "320px",
          backdropFilter: "blur(10px)",
        }}
      >
        <h2
          style={{
            margin: "0 0 15px 0",
            color: "#00ff88",
            fontSize: "16px",
            textShadow: "0 0 10px rgba(0,255,136,0.5)",
          }}
        >
          Escena Tormentosa 3D
        </h2>

        <div style={{ marginBottom: "15px" }}>
          <h4
            style={{ margin: "0 0 8px 0", color: "#87ceeb", fontSize: "14px" }}
          >
            Controles:
          </h4>
          <p style={{ margin: "3px 0", fontSize: "11px" }}>
            🖱️ <strong>Mouse:</strong> Rotar y hacer zoom
          </p>
          <p style={{ margin: "3px 0", fontSize: "11px" }}>
            ⌨️ <strong>WASD:</strong> Mover cámara
          </p>
          <p style={{ margin: "3px 0", fontSize: "11px" }}>
            ⌨️ <strong>Q/E:</strong> Subir/bajar
          </p>
        </div>

        <div>
          <h4
            style={{ margin: "0 0 8px 0", color: "#ffa500", fontSize: "14px" }}
          >
            Elementos:
          </h4>
          <p style={{ margin: "3px 0", fontSize: "11px" }}>
            <strong>Skybox:</strong> Esfera con textura
          </p>
          <p style={{ margin: "3px 0", fontSize: "11px" }}>
            <strong>Centro:</strong> Toroide animado
          </p>
          <p style={{ margin: "3px 0", fontSize: "11px" }}>
            <strong>Verde:</strong> Cubo orbital
          </p>
          <p style={{ margin: "3px 0", fontSize: "11px" }}>
            <strong>GLTF:</strong> Modelo externo
          </p>
          <p style={{ margin: "3px 0", fontSize: "11px" }}>
            <strong>FX:</strong> Bloom + Sombras
          </p>
        </div>
      </div>

      {/* Indicador de carga */}
      <div
        style={{
          position: "absolute",
          bottom: "15px",
          right: "15px",
          color: "rgba(255,255,255,0.7)",
          fontSize: "11px",
          background: "rgba(0,0,0,0.5)",
          padding: "8px 12px",
          borderRadius: "6px",
          fontFamily: "monospace",
        }}
      >
        Made By Byron Serrano
      </div>
    </div>
  );
};

export default CompleteThreeScene;
