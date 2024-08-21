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
            playAudio('utils/Intro.wav'); // Adicione o caminho correto para o áudio
          }, 5000);
        
          // Página 1: Animação de cubo com textura
          const cubeGeometry1 = new THREE.BoxGeometry();
          const textureLoader = new THREE.TextureLoader();
        
          // Carregar as duas texturas
          const blackTexture = textureLoader.load('utils/preto.jpg');
          const moovzTexture = textureLoader.load('utils/moovz.jpg');
        
          // Começa com a textura preta
          const cubeMaterial1 = new THREE.MeshBasicMaterial({ map: blackTexture });
          const cube1 = new THREE.Mesh(cubeGeometry1, cubeMaterial1);
          cube1.position.set(0, -5, -5);
          scene.add(cube1);
        
          const emergingDuration = 3000;
          const floatAmplitude = 0.2;
          let isEmergingComplete = false;
          let startTime;
        
          const animateCube1 = () => {
            const elapsedTime = Date.now() - startTime;
        
            if (elapsedTime < emergingDuration) {
              const progress = elapsedTime / emergingDuration;
              cube1.position.y = -5 + (7 * progress); // Transição suave
            } else {
              if (!isEmergingComplete) {
                cube1.position.y = 1.9;
                isEmergingComplete = true;
              }
              cube1.position.y = 2 + Math.sin(Date.now() * 0.001) * floatAmplitude; // Flutuação suave
            }
        
            cube1.rotation.x += 0.001;
            cube1.rotation.y += 0.001;
        
            renderer.render(scene, camera);
            requestAnimationFrame(animateCube1); // Usa requestAnimationFrame para otimizar a animação
          };
        
          // Espera 12 segundos antes de trocar a textura para moovz.jpg
          setTimeout(() => {
            cubeMaterial1.map = moovzTexture;
            cubeMaterial1.needsUpdate = true; // Atualiza a textura
          }, 12000);
        
          // Espera o tempo determinado antes de iniciar a animação
          setTimeout(() => {
            startTime = Date.now(); // Marca o tempo de início quando a animação começa
            animateCube1(); // Inicia a animação
          }, 11500);
        
          redirectTimeoutRef.current = setTimeout(() => {
            setCurrentPage(2);
          }, 18000);
          break;
        
        

          case 2:
            playAudio('utils/Apresentação (Audio 02).wav');
          
            // Adiciona um atraso de 9 segundos antes de iniciar as animações
            setTimeout(() => {
              // Animação de bolinhas caindo
              const colors = [
                { color: 0xffa500, size: 0.3 }, // Laranja: maior
                { color: 0xff0000, size: 0.2 }, // Vermelho: segunda maior
                { color: 0x00ff00, size: 0.2 }, // Verde: segunda maior
                { color: 0x0000ff, size: 0.15 }, // Azul escuro: terceira maior
                { color: 0x00bfff, size: 0.1 }  // Azul claro: menor
              ];
          
              const numBalls = 200;
          
              const balls = [];
              for (let i = 0; i < numBalls; i++) {
                const colorConfig = colors[Math.floor(Math.random() * colors.length)];
                const ballGeometry = new THREE.SphereGeometry(colorConfig.size, 16, 16);
                const ballMaterial = new THREE.MeshStandardMaterial({ color: colorConfig.color });
                const ball = new THREE.Mesh(ballGeometry, ballMaterial);
          
                ball.position.set(
                  (Math.random() - 0.5) * 10,
                  Math.random() * 10 + 10,
                  (Math.random() - 0.5) * 10
                );
                balls.push(ball);
                scene.add(ball);
              }
          
              const fallSpeed = 0.1;
          
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
          
              // Carregamento do modelo GLB diretamente na posição final
              const gltfLoader = new GLTFLoader();
              gltfLoader.load('utils/marca 3d eixo x.glb', (gltf) => {
                const model = gltf.scene;
                scene.add(model);
          
                // Define a posição final do modelo diretamente
                model.position.set(-8, 0, -15);
          
                // Adiciona a animação de flutuação no eixo Y
                const floatAmplitude = 0.5; // Amplitude da flutuação
                const floatSpeed = 0.001; // Velocidade da flutuação
          
                const animateModelFloat = () => {
                  model.position.y = 0 + Math.sin(Date.now() * floatSpeed) * floatAmplitude;
          
                  // Renderiza a cena após aplicar a flutuação
                  renderer.render(scene, camera);
                  requestAnimationFrame(animateModelFloat);
                };
          
                animateModelFloat();
              }, undefined, (error) => {
                console.error('Erro ao carregar o modelo GLB:', error);
              });
            }, 4000);
          
            redirectTimeoutRef.current = setTimeout(() => {
              setCurrentPage(3);
            }, 23000);
            break;

            case 3:
              // Tocar o áudio
              playAudio('utils/Instruções (Audio 03).wav'); // Caminho para o áudio
            
              // Página 3: Animação de retângulo
              camera.position.set(9, 1.5, 9);
            
              const rectangleGeometry = new THREE.BoxGeometry(2, 1, 0.005); // Retângulo
              const textureLoader2 = new THREE.TextureLoader();
            
              // Carregar as texturas PNG
              const texturePaths = [
                'utils/ZoneCards/Texture1.png',
                'utils/ZoneCards/Texture2.png',
                'utils/ZoneCards/Texture3.png',
                'utils/ZoneCards/Texture4.png',
                'utils/ZoneCards/Texture5.png',
                'utils/ZoneCards/Texture6.png',
                'utils/ZoneCards/Texture7.png',
                'utils/ZoneCards/Texture8.png',
                'utils/ZoneCards/Texture9.png',
                'utils/ZoneCards/Texture10.png',
                'utils/ZoneCards/Texture11.png',
                'utils/ZoneCards/Texture12.png',
                'utils/ZoneCards/Texture13.png',
                'utils/ZoneCards/Texture14.png',
                'utils/ZoneCards/Texture15.png',
                'utils/ZoneCards/Texture16.png',
                'utils/ZoneCards/Texture17.png',
                'utils/ZoneCards/Texture18.png',
                'utils/ZoneCards/Texture19.png',
                'utils/ZoneCards/Texture20.png',
                'utils/ZoneCards/Texture21.png',
                'utils/ZoneCards/Texture22.png',
                'utils/ZoneCards/Texture0.png', //Não mudar posição para não estragar array
                'utils/ZoneCards/Texture3-1.png', //Não mudar posição para não estragar array


                          ];
                        
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
                    const rectangleMaterial = new THREE.MeshBasicMaterial({ map: textures[22] });
                    const rectangle = new THREE.Mesh(rectangleGeometry, rectangleMaterial);
                    rectangle.position.set(0, 1, -2);
                    scene.add(rectangle);
          
                    // Função para trocar a textura
                    const changeTexture = (textureIndex) => {
                      rectangleMaterial.map = textures[textureIndex];
                      rectangleMaterial.needsUpdate = true; // Atualiza a textura
                    };
          
                    // Sequência de mudanças de textura com base nos tempos especificados
                    setTimeout(() => changeTexture(0), 35650);   // Muda para Texture1.png em 0:35:65 - Repouso 2
                    setTimeout(() => changeTexture(1), 40860);   // Muda para Texture2.png em 0:40:86 - Repouso 2

                    setTimeout(() => changeTexture(2), 45880);   // Muda para Texture3.png em 0:45:88 - Zona 1 / 1
                    setTimeout(() => changeTexture(2), 47530);   // Muda para Texture3-1.png em 0:47:53 - Zona 1 / 2
                    setTimeout(() => changeTexture(3), 50230);   // Muda para Texture4.png em 0:50:23  - Zona 1 / 3

                    setTimeout(() => changeTexture(4), 56460);   // Muda para Texture5.png em 0:56:46 - Zona 2 / 1
                    setTimeout(() => changeTexture(5), 61000);   // Muda para Texture6.png em 1:01:00 - Zona 2 / 2
                    setTimeout(() => changeTexture(6), 64500);   // Muda para Texture7.png em 1:04:50 - Zona 2 / 3

                    setTimeout(() => changeTexture(7), 67090);   // Muda para Texture8.png em 1:07:09 - Zona 3 / 1
                    setTimeout(() => changeTexture(8), 67090);   // Muda para Texture9.png em 1:07:09 - Zona 3 / 2
                    setTimeout(() => changeTexture(9), 73130);   // Muda para Texture10.png em 1:12:13 - Zona 3 / 3
                    setTimeout(() => changeTexture(10), 75850);   // Muda para Texture11.png em 1:15:85 - Zona 3 / 4
                    setTimeout(() => changeTexture(11), 78090);   // Muda para Texture12.png em 1:18:09 - Zona 3 / 5

                    setTimeout(() => changeTexture(12), 80320);   // Muda para Texture13.png em 1:20:32 - Zona 4 / 1
                    setTimeout(() => changeTexture(13), 82320);   // Muda para Texture14.png em 1:22:32 - Zona 4 / 2
                    setTimeout(() => changeTexture(14), 83000);   // Muda para Texture15.png em 1:23:00 - Zona 4 / 3
                    setTimeout(() => changeTexture(15), 85320);   // Muda para Texture16.png em 1:25:32 - Zona 4 / 4
                    setTimeout(() => changeTexture(16), 87700);   // Muda para Texture17.png em 1:27:57 - Zona 4 / 5
                    setTimeout(() => changeTexture(17), 89180);   // Muda para Texture18.png em 1:29:18 - Zona 4 / 6 
                    setTimeout(() => changeTexture(18), 90564);   // Muda para Texture19.png em 1:xx:xx - Zona 4 / 7

                    setTimeout(() => changeTexture(19), 92890);   // Muda para Texture20.png em 1:32:89 - Zona 5 / 1
                    setTimeout(() => changeTexture(20), 108980);  // Muda para Texture22.png em 1:48:98 - Zona 4 / 9
                    setTimeout(() => changeTexture(21), 112560);  // Muda para Texture22.png em x:xx:xx - Zona 4 / 10
            
                      // Função para criar um efeito de flutuação
                      const floatAmplitude = 0.05; // Amplitude da flutuação
                      const floatSpeed = 0.001; // Velocidade da flutuação
            
                      const animate = () => {
                        const time = Date.now() * floatSpeed;
                        rectangle.position.y = 1 + Math.sin(time) * floatAmplitude; // Anima a posição Y
                        
                        // Renderizar a cena
                        renderer.render(scene, camera);
            
                        // Solicita o próximo frame de animação
                        renderer.setAnimationLoop(animate);
                      };
            
                      animate(); // Inicia a animação e o loop de renderização
                    }
                  },
                  undefined,
                  (error) => {
                    console.error('Erro ao carregar a textura:', error);
                  }
                );
              });
              
              // Redirecionamento após o case 3
              //redirectTimeoutRef.current = setTimeout(() => {
              //  setCurrentPage(1);
              //}, 300000);
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