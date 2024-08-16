import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment';
import { LottieLoader } from 'three/examples/jsm/loaders/LottieLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

const JsonAnimation = () => {
  const sceneRef = useRef(null);

  useEffect(() => {
    // Configuração inicial
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 3); // Ajuste a posição da câmera para VR

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true; // Habilita o suporte a VR
    sceneRef.current.appendChild(renderer.domElement);

    scene.background = new THREE.Color(0x111111);

    // Adicionar o botão VR
    document.body.appendChild(VRButton.createButton(renderer));

    // Carregar a animação Lottie
    const loader = new LottieLoader();
    loader.setQuality(2);
    loader.load('utils/splash_animation.json', (texture) => {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial({ roughness: 0.1, map: texture });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      // Ajustar a posição do mesh
      mesh.position.set(0, 1, -2); // Ajuste a posição do mesh conforme necessário

      // Animação
      const animate = () => {
        mesh.rotation.y -= 0.001;
        renderer.render(scene, camera);
        renderer.setAnimationLoop(() => {
          mesh.rotation.y -= 0.001;
          if (controls) controls.update(); // Atualiza os controles se estiver definido
          renderer.render(scene, camera);
        });
      };
      animate();
    });

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
    const animate = () => {
      if (renderer.xr.isPresenting) {
        // Ajustar a posição da câmera e do mesh quando estiver no VR
        camera.position.set(0, 1.5, 3);
        controls.enabled = false; // Desativa os controles de órbita em VR
      } else {
        controls.update();
      }
      renderer.render(scene, camera);
      renderer.setAnimationLoop(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', onWindowResize);
      sceneRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={sceneRef} style={{ width: '100vw', height: '100vh' }}></div>;
};

export default JsonAnimation;
