import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import ThreeMeshUI from 'three-mesh-ui';
import ImageSrc from './assets/moovz.jpg'; // Caminho da imagem para a página 2

const Page = () => {
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = useRef(null);
  const redirectTimeoutRef = useRef(null);

  useEffect(() => {
    // Configurações iniciais de Three.js e WebXR
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 1);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    document.body.appendChild(VRButton.createButton(renderer));
    document.body.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.6, -1.8);
    controls.update();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onResize);

    const animate = () => {
      controls.update();
      ThreeMeshUI.update();
      renderer.render(scene, camera);
    };

    renderer.setAnimationLoop(animate);

    return () => {
      window.removeEventListener('resize', onResize);
      renderer.setAnimationLoop(null);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Renderiza o conteúdo de acordo com a página atual
  useEffect(() => {
    const scene = sceneRef.current;

    if (scene) {
      // Limpa o conteúdo anterior
      while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
      }

      switch (currentPage) {
        case 1:
          // Página 1 - Exemplo de Texto com animação e áudio
          const container = new ThreeMeshUI.Block({
            width: 2,
            height: 0.5,
            padding: 0.05,
            fontFamily: './assets/Poppins-msdf.json',
            fontTexture: './assets/Poppins.png',
            backgroundColor: new THREE.Color(0x000000),
            justifyContent: 'center',
            textAlign: 'center',
            fontColor: new THREE.Color(0xffffff),
            fontSize: 0.2,
          });

          const text = new ThreeMeshUI.Text({ content: '' });
          container.add(text);
          container.position.set(0, 1.5, -2);
          scene.add(container);
          containerRef.current = container;

          const audio = new Audio('assets/welcome_audio (1).mp3');

          const startVRSession = () => {
            audio.play().catch(error => {
              console.error('Erro ao tentar reproduzir o áudio:', error);
            });

            const fullText = 'Olá, Usuário!';
            let currentText = '';
            let charIndex = 0;
            const typingSpeed = 150;

            setTimeout(() => {
              const typeText = () => {
                if (charIndex < fullText.length) {
                  currentText += fullText[charIndex];
                  text.set({ content: currentText });
                  charIndex++;
                  setTimeout(typeText, typingSpeed);
                } else {
                  setTimeout(() => {
                    let startTime = null;
                    const duration = 750;
                    const initialPosition = container.position.x;
                    const distanceToMove = 5;

                    const animateMovement = (timestamp) => {
                      if (!startTime) startTime = timestamp;
                      const elapsed = timestamp - startTime;
                      const progress = Math.min(elapsed / duration, 1);

                      container.position.x = initialPosition + distanceToMove * progress;

                      if (progress < 1) {
                        requestAnimationFrame(animateMovement);
                      } else {
                        setTimeout(() => {
                          setCurrentPage(2); // Transição para a página 2
                        }, 30000);
                      }
                    };

                    requestAnimationFrame(animateMovement);
                  }, 7000);
                }
              };

              typeText();
            }, 6000);

            redirectTimeoutRef.current = setTimeout(() => {
              setCurrentPage(2); // Mudar para a página 2
            }, 20000);
          };

          rendererRef.current.xr.addEventListener('sessionstart', startVRSession);
          break;

          case 2:
            // Página 2 - Exibindo uma imagem e áudio
            const audioPage2 = new Audio('assets/welcome_audio (1).mp3');
            audioPage2.play().catch(error => {
              console.error('Erro ao tentar reproduzir o áudio:', error);
            });
          
            const imageContainer = new ThreeMeshUI.Block({
              height: 1,
              width: 1,
              backgroundOpacity: 0,
            });
            imageContainer.position.set(0, -1, -2.5); // Começa abaixo do chão
            scene.add(imageContainer);
          
            const imageBlock = new ThreeMeshUI.Block({
              height: 1,
              width: 1,
            });
            imageContainer.add(imageBlock);
          
            const loader = new THREE.TextureLoader();
            loader.load(ImageSrc, (texture) => {
              imageBlock.set({ backgroundTexture: texture });
            });
          
            // Animação de subida
            const animateImage = () => {
              let startTime = null;
              const duration = 1000; // Duração da animação em milissegundos
              const targetY = 2; // Novo valor final para a posição Y
          
              const animateMovement = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;
                const progress = Math.min(elapsed / duration, 1);
          
                // Interpolação linear da posição Y
                imageContainer.position.y = -1 + (targetY + 1) * progress;
          
                if (progress < 1) {
                  requestAnimationFrame(animateMovement);
                } else {
                  // Ação ao terminar a animação, se necessário
                }
              };
          
              requestAnimationFrame(animateMovement);
            };
          
            animateImage(); // Inicia a animação
            break;
          
          

        default:
          break;
      }
    }
  }, [currentPage]);

  return null;
};

export default Page;
