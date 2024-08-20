import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

const ImgAnimation = () => {
  const sceneRef = useRef(null);
  const meshRef = useRef(null);

  useEffect(() => {
    // Configuração inicial
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    sceneRef.current.appendChild(renderer.domElement);

    scene.background = new THREE.Color(0x111111);

    // Adicionar o botão VR
    document.body.appendChild(VRButton.createButton(renderer));

    // Carregar as texturas
    const textureLoader = new THREE.TextureLoader();
    const textures = [
      'utils/ZoneCards/RepousoCard.png',
      'utils/ZoneCards/Zona2Card.png',
      'utils/ZoneCards/Zona3Card.png',
    ];

    let currentTextureIndex = 0;

    const updateTexture = () => {
      textureLoader.load(textures[currentTextureIndex], (texture) => {
        if (meshRef.current) {
          meshRef.current.material.map = texture;
          meshRef.current.material.needsUpdate = true;
        }
      });
      currentTextureIndex = (currentTextureIndex + 1) % textures.length;
    };

    // Configuração inicial do mesh
    const geometry = new THREE.BoxGeometry(2, 1, 0.001); // Retângulo
    const material = new THREE.MeshStandardMaterial({ roughness: 0 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    mesh.position.set(0, -2, -2); // Inicialmente abaixo da tela
    meshRef.current = mesh;

    // Atualizar a textura a cada 5 segundos
    updateTexture();
    const textureInterval = setInterval(updateTexture, 5000);

    // Animação de subida
    let startTime = Date.now();
    const animationDuration = 2000; // Duração da animação em milissegundos
    const initialPosition = -2; // Posição inicial no eixo Y
    const finalPosition = 1; // Posição final no eixo Y
    const floatAmplitude = 0.5; // Amplitude da flutuação
    const floatSpeed = 0.05; // Velocidade da flutuação

    const animate = () => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / animationDuration, 1); // Progresso da animação

      if (meshRef.current) {
        // Interpolação linear entre a posição inicial e final
        meshRef.current.position.y = initialPosition + (finalPosition - initialPosition) * progress;

        // Animação de flutuação suave
        let floatTime = elapsedTime * floatSpeed; // Calcula o tempo de flutuação baseado no tempo decorrido
        meshRef.current.position.y += Math.sin(floatTime) * floatAmplitude;
      }
      
      renderer.render(scene, camera);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate(); // Iniciar a animação de subida

    // Configurar ambiente
    const environment = new RoomEnvironment(renderer);
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(environment).texture;

    // Configurar controles de órbita
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    // Ajustar o tamanho da tela
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onWindowResize);

    // Atualizar a cena para VR
    const animateScene = () => {
      if (renderer.xr.isPresenting) {
        camera.position.set(0, 1.5, 3);
        controls.enabled = false;
      } else {
        controls.update();
      }
      renderer.render(scene, camera);
    };
    renderer.setAnimationLoop(animateScene);

    return () => {
      clearInterval(textureInterval);
      window.removeEventListener('resize', onWindowResize);
      sceneRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={sceneRef} style={{ width: '100vw', height: '100vh' }}></div>;
};

export default ImgAnimation;
