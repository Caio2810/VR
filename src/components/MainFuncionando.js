import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { TextureLoader } from 'three';

const Page = () => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const redirectTimeoutRef = useRef(null);

  useEffect(() => {
    // Configuração da cena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Fundo preto
    sceneRef.current = scene;

    // Configuração da câmera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 3);
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
        camera.position.set(0, 1.5, 3);
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

    const playAudio = (audioFile) => {
      const audio = new Audio(audioFile);
      audio.play();
    };

    if (scene && camera && renderer) {
      // Limpa o conteúdo anterior
      while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
      }

      switch (currentPage) {
        case 1:
          setTimeout(() => {
            playAudio('utils/Audio1.mp3'); // Adicione o caminho correto para o áudio
          }, 5000);

          // Página 1: Animação de cubo com textura
          const cubeGeometry1 = new THREE.BoxGeometry();
          const textureLoader = new TextureLoader();
          const texture = textureLoader.load('utils/moovz.jpg');
          const cubeMaterial1 = new THREE.MeshBasicMaterial({ map: texture });
          const cube1 = new THREE.Mesh(cubeGeometry1, cubeMaterial1);
          cube1.position.set(0, -5, -5);
          scene.add(cube1);

          let startTime;
          let emergingDuration = 3000;
          let floatAmplitude = 0.2;
          let isEmergingComplete = false;

          const startAnimation = () => {
            startTime = Date.now();

            const animateCube1 = () => {
              const elapsedTime = Date.now() - startTime;

              if (elapsedTime < emergingDuration) {
                const progress = elapsedTime / emergingDuration;
                cube1.position.y = -5 + (7 * progress);
              } else {
                if (!isEmergingComplete) {
                  cube1.position.y = 1.9;
                  isEmergingComplete = true;
                }
                cube1.position.y = 2 + Math.sin(Date.now() * 0.001) * floatAmplitude;
              }

              cube1.rotation.x += 0.001;
              cube1.rotation.y += 0.001;

              renderer.render(scene, camera);
              setTimeout(animateCube1, 16); // Atualiza a cada 16ms (~60 FPS)
            };

            setTimeout(animateCube1, 11500);
          };

          startAnimation();

          redirectTimeoutRef.current = setTimeout(() => {
            setCurrentPage(2);
          }, 18000);
          break;

          case 2:
            playAudio('utils/Audio2.mp3');
          
            // Adiciona um atraso de 9 segundos antes de iniciar as animações
            setTimeout(() => {
              // Animação de bolinhas caindo
              const colors = [0x00bfff, 0x0000ff, 0x00ff00, 0xffa500, 0xff0000];
              const numBalls = 350;
              const ballGeometry = new THREE.SphereGeometry(0.1, 16, 16);
              const ballMaterials = colors.map(color => new THREE.MeshStandardMaterial({ color }));
          
              const balls = [];
              for (let i = 0; i < numBalls; i++) {
                const material = ballMaterials[Math.floor(Math.random() * ballMaterials.length)];
                const ball = new THREE.Mesh(ballGeometry, material);
                ball.position.set(
                  (Math.random() - 0.5) * 10,
                  Math.random() * 10 + 10,
                  (Math.random() - 0.5) * 10
                );
                balls.push(ball);
                scene.add(ball);
              }
          
              const fallSpeed = 0.05;
          
              const animateBalls = () => {
                balls.forEach(ball => {
                  ball.position.y -= fallSpeed;
          
                  if (ball.position.y < -10) {
                    ball.position.y = Math.random() * 10 + 10;
                    ball.position.x = (Math.random() - 0.5) * 10;
                    ball.position.z = (Math.random() - 0.5) * 10;
                  }
                });
          
                renderer.render(scene, camera);
                setTimeout(animateBalls, 16); // Atualiza a cada 16ms (~60 FPS)
              };
          
              animateBalls();
          
              // Animação do modelo GLB
              const gltfLoader = new GLTFLoader();
              gltfLoader.load('utils/marca 3d eixo x.glb', (gltf) => {
                const model = gltf.scene;
                scene.add(model);
          
                model.position.set(-20, 0, -15);
          
                const targetPosition = new THREE.Vector3(-8, 0, -15);
                const duration = 3000;
                const startTime = Date.now();
          
                const animateModel = () => {
                  const elapsedTime = Date.now() - startTime;
                  const progress = Math.min(elapsedTime / duration, 1);
          
                  model.position.lerpVectors(new THREE.Vector3(-20, 0, -15), targetPosition, progress);
          
                  renderer.render(scene, camera);
                  if (progress < 1) {
                    setTimeout(animateModel, 16); // Atualiza a cada 16ms (~60 FPS)
                  }
                };
          
                animateModel();
              }, undefined, (error) => {
                console.error('Erro ao carregar o modelo GLB:', error);
              });
            }, 6000); // 9000ms de atraso (9 segundos)
          
            redirectTimeoutRef.current = setTimeout(() => {
              setCurrentPage(3);
            }, 29000);
            break;
          

            case 3:
              // Tocar o primeiro áudio
              const audio1 = new Audio('utils/Audio3.mp3'); // Caminho para o primeiro áudio
              const audio2 = new Audio('utils/Audio3-1.mp3'); // Caminho para o segundo áudio
            
              audio1.play();
            
              // Quando o primeiro áudio terminar, iniciar o segundo
              audio1.addEventListener('ended', () => {
                audio2.play();
              });
            
              // Página 3: Animação de retângulo
              camera.position.set(0, 1.5, 5);
            
              const rectangleGeometry = new THREE.BoxGeometry(2, 1, 0.001); // Retângulo
              const textureLoader2 = new THREE.TextureLoader();
            
              // Carregar as texturas PNG
              const texturePaths = Array.from({ length: 22 }, (_, i) => `utils/ZoneCards/Texture${i + 1}.png`);
              const textures = [];
              let texturesLoaded = 0;
            
              texturePaths.forEach((path, index) => {
                textureLoader2.load(
                  path,
                  (texture) => {
                    textures[index] = texture;
                    texturesLoaded += 1;
            
                    // Quando todas as texturas estiverem carregadas, inicie a animação
                    if (texturesLoaded === texturePaths.length) {
                      const rectangleMaterial = new THREE.MeshBasicMaterial({ map: textures[0] });
                      const rectangle = new THREE.Mesh(rectangleGeometry, rectangleMaterial);
                      rectangle.position.set(0, 1, -2);
                      scene.add(rectangle);
            
                      let currentTextureIndex = 0;
            
                      const changeTexture = () => {
                        currentTextureIndex = (currentTextureIndex + 1) % textures.length;
                        rectangleMaterial.map = textures[currentTextureIndex];
                        rectangleMaterial.needsUpdate = true; // Atualiza a textura
                      };
            
                      const textureChangeInterval = 1000; // Intervalo em milissegundos (5 segundos)
                      setInterval(changeTexture, textureChangeInterval); // Muda a textura a cada `textureChangeInterval` milissegundos
            
                      const rotateRectangle = () => {
                        rectangle.rotation.x += 0.01;
                        rectangle.rotation.y += 0.01;
            
                        renderer.render(scene, camera);
                        setTimeout(rotateRectangle, 16); // Atualiza a cada 16ms (~60 FPS)
                      };
            
                      //rotateRectangle();
                    }
                  },
                  undefined,
                  (error) => {
                    console.error('Erro ao carregar a textura:', error);
                  }
                );
              });
            
              redirectTimeoutRef.current = setTimeout(() => {
                setCurrentPage(1);
              }, 300000);
              break;
            
          


        default:
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

export default Page;
