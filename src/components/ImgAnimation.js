import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

const FodaseAnimation = () => {
  const sceneRef = useRef(null);
  const balls = useRef([]);

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

    // Criar bolinhas
    const numBalls = 100; // Número de bolinhas
    const geometry = new THREE.SphereGeometry(0.1, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const ballArray = [];

    for (let i = 0; i < numBalls; i++) {
      const ball = new THREE.Mesh(geometry, material);
      ball.position.set(Math.random() * 10 - 5, Math.random() * 10 + 5, Math.random() * 10 - 5);
      scene.add(ball);
      ballArray.push(ball);
    }

    balls.current = ballArray;

    // Carregar o modelo GLB
    const loader = new GLTFLoader();
    loader.load('utils/marca 3d eixo x.glb', (gltf) => {
      const model = gltf.scene;
      scene.add(model);

      // Ajustar a posição do modelo
      model.position.set(5, 1, -5); // Move o modelo mais para a direita e para baixo

      // Animação
      const animate = () => {
        model.rotation.y -= 0.01;

        // Atualizar a posição das bolinhas
        balls.current.forEach(ball => {
          ball.position.y -= 0.05; // Velocidade de queda
          if (ball.position.y < -5) ball.position.y = 5; // Reposiciona a bolinha se sair da tela
        });

        renderer.render(scene, camera);
        renderer.setAnimationLoop(() => {
          model.rotation.y -= 0.01;
          balls.current.forEach(ball => {
            ball.position.y -= 0.05; // Velocidade de queda
            if (ball.position.y < -5) ball.position.y = 5; // Reposiciona a bolinha se sair da tela
          });
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
        // Ajustar a posição da câmera e do modelo quando estiver no VR
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

export default FodaseAnimation;
