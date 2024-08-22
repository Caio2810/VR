import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

const Pagesssssss = () => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(6);
  const redirectTimeoutRef = useRef(null);

  useEffect(() => {
    // Configuração da cena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Fundo preto
    sceneRef.current = scene;

    // Configuração da câmera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 5); // Ajuste a posição da câmera para se focar no modelo
    camera.lookAt(new THREE.Vector3(0, 0, 0)); // Faz a câmera olhar para o centro da cena
    cameraRef.current = camera;

    // Configuração do renderizador
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    document.body.appendChild(VRButton.createButton(renderer));
    rendererRef.current = renderer;

    if (containerRef.current) {
      containerRef.current.appendChild(renderer.domElement);
    }

    // Adiciona iluminação
    const ambientLight = new THREE.AmbientLight(0x404040); // Luz ambiente
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Luz direcional
    directionalLight.position.set(5, 10, 5).normalize();
    scene.add(directionalLight);

    // Configuração dos controles
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    // Ambiente
    const environment = new RoomEnvironment();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(environment).texture;

    // Atualiza o tamanho da tela quando redimensiona
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onWindowResize);

    // Função de animação
    const animate = () => {
      if (renderer.xr.isPresenting) {
        camera.position.set(0, 1.5, 5);
        controls.enabled = false;
      } else {
        controls.update();
      }
      renderer.render(scene, camera);
    };

    renderer.setAnimationLoop(animate);

    return () => {
      window.removeEventListener('resize', onWindowResize);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    const camera = cameraRef.current;

    if (scene && camera && renderer) {
      // Limpa o conteúdo anterior
      while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
      }

      switch (currentPage) {

        // APP ALUNO + TEAMS ^devia ser o case 6^

        case 5:
          // Tocar o áudio (se necessário)
          //playAudio('utils/Apresentação 02 (New) (1).wav'); // Caminho para o áudio

          // Página 3: Animação de retângulos
          camera.position.set(6, 1.5, 6); // Move a câmera mais próxima dos objetos

          const rectangleGeometry1 = new THREE.BoxGeometry(2, 4, 0.01); // Geometria do primeiro retângulo
          const rectangleGeometry2 = new THREE.BoxGeometry(2, 4, 0.01); // Geometria do segundo retângulo
          
          // Caminhos das texturas
          const texturePath1 = 'utils/APP_ALUNO.jpg'; // Primeira textura
          const texturePath2 = 'utils/APP_TIMES.jpg'; // Segunda textura

          // Cria e adiciona os retângulos à cena
          const createRectangles = () => {
              const rectangleMaterial1 = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(texturePath1) });
              const rectangle1 = new THREE.Mesh(rectangleGeometry1, rectangleMaterial1);
              rectangle1.position.set(-2, -10, -8); // Posição inicial bem abaixo do chão
              scene.add(rectangle1);

              const rectangleMaterial2 = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(texturePath2) });
              const rectangle2 = new THREE.Mesh(rectangleGeometry2, rectangleMaterial2);
              rectangle2.position.set(2, -10, -8); // Posição inicial bem abaixo do chão
              scene.add(rectangle2);

              return [rectangle1, rectangle2];
          };

          const rectangles = createRectangles();

          // Função para animar os retângulos emergindo do chão
          const animateRectangles = (rectangle, delay, targetY) => {
              const floatAmplitude = 0.05; // Amplitude da flutuação
              const floatSpeed = 0.001; // Velocidade da flutuação

              let startTime = Date.now();

              const animate = () => {
                  const elapsedTime = Date.now() - startTime;

                  if (elapsedTime > delay) {
                      // Anima o retângulo emergindo do chão
                      const progress = Math.min(1, (elapsedTime - delay) / 2000); // 2 segundos para a animação
                      rectangle.position.y = -10 + progress * (targetY + 10); // Subir até targetY
                  }

                  // Animação de flutuação
                  rectangle.position.y += Math.sin(Date.now() * floatSpeed) * floatAmplitude;

                  renderer.render(scene, camera);

                  // Verifica se a animação deve continuar
                  if (elapsedTime < 5000) {
                      renderer.setAnimationLoop(animate);
                  }
              };

              animate();
          };

          // Inicia a animação dos retângulos
          animateRectangles(rectangles[0], 0, 1); // Anima o retângulo da esquerda após 0 segundos
          animateRectangles(rectangles[1], 3000, 1); // Anima o retângulo da direita após 3 segundos

          // Redirecionamento após o case 6
          //redirectTimeoutRef.current = setTimeout(() => {
          //    setCurrentPage(7);
          //}, 22000);

          break;

      }
    }

    return () => {
      clearTimeout(redirectTimeoutRef.current);
    };
  }, [currentPage]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
  );
};

export default Pagesssssss;
