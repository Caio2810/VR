import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { TextureLoader } from 'three';
import { FontLoader } from 'three/examples/jsm/Addons.js';
import { TextGeometry } from 'three/examples/jsm/Addons.js';


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

        // OLÁ USUÁRIO
        case 1:
          setTimeout(() => {
            playAudio('utils/Intro.wav'); // Adicione o caminho correto para o áudio
          }, 6000);
        
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
        
        
        //BOLINHAS CAINDO
        case 2:
          playAudio('utils/Apresentação 01 (New).wav');
        
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
          }, 500);
        
          redirectTimeoutRef.current = setTimeout(() => {
            setCurrentPage(3);
          }, 15000);
          break;


        // CARDS ZONAS
        case 3:
          // Tocar o áudio
          playAudio('utils/Apresentação 02 (New).wav'); // Caminho para o áudio
        
          // Página 3: Animação de retângulo
          camera.position.set(9, 1.5, 9);
        
          const rectangleGeometry2 = new THREE.BoxGeometry(2, 1, 0.005); // Retângulo
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
                const rectangle = new THREE.Mesh(rectangleGeometry2, rectangleMaterial);
                rectangle.position.set(0, 1, -2);
                scene.add(rectangle);
      
                // Função para trocar a textura
                const changeTexture = (textureIndex) => {
                  rectangleMaterial.map = textures[textureIndex];
                  rectangleMaterial.needsUpdate = true; // Atualiza a textura
                };
                
                setTimeout(() => changeTexture(1), 12000);
                setTimeout(() => changeTexture(2), 13000);
                setTimeout(() => changeTexture(4), 14000);
                setTimeout(() => changeTexture(7), 15000);
                setTimeout(() => changeTexture(12), 16000);
                setTimeout(() => changeTexture(19), 17000);

                
      
                // Sequência de mudanças de textura com base nos tempos especificados
/*              setTimeout(() => changeTexture(0), 35650);   // Muda para Texture1.png em 0:35:65 - Repouso 2
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
                setTimeout(() => changeTexture(21), 112560);  // Muda para Texture22.png em x:xx:xx - Zona 4 / 10 */
        
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
          redirectTimeoutRef.current = setTimeout(() => {
            setCurrentPage(4);
          }, 24000);

          break;


        //VIDEO DA AULA
        case 4:
          // Tocar o áudio
          //playAudio('utils/Instruções (Audio 03).wav'); // Caminho para o áudio
        
          // Página 3: Animação de retângulo
          camera.position.set(9, 1.5, 9);
        
          // Crie o elemento de vídeo
          const video = document.createElement('video');
          video.src = 'utils/corte vr (3).mp4'; // Caminho para o vídeo MP4
          playAudio('utils/Música Moovz.wav'); // Caminho para o áudio
          video.crossOrigin = 'anonymous';
          video.loop = false;
          video.muted = true;
          video.autoplay = true;
          video.play();
        
          // Crie a textura do vídeo
          const videoTexture = new THREE.VideoTexture(video);
        
          const rectangleGeometry = new THREE.BoxGeometry(2, 1, 0.005); // Retângulo
          const rectangleMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
          const rectangle = new THREE.Mesh(rectangleGeometry, rectangleMaterial);
          rectangle.position.set(0, 1, -2);
          scene.add(rectangle);
        
          // Função para criar um efeito de flutuação
          const floatAmplitude2 = 0.05; // Amplitude da flutuação
          const floatSpeed2 = 0.001; // Velocidade da flutuação
        
          const animate = () => {
            const time = Date.now() * floatSpeed2;
            rectangle.position.y = 1 + Math.sin(time) * floatAmplitude2; // Anima a posição Y
            
            // Renderizar a cena
            renderer.render(scene, camera);
        
            // Solicita o próximo frame de animação
            renderer.setAnimationLoop(animate);
          };
        
          animate(); // Inicia a animação e o loop de renderização
        
          // Redirecionamento após o case 4
          redirectTimeoutRef.current = setTimeout(() => {
            setCurrentPage(6);
          }, 52000);
          break;
            

        // APP ALUNO + TEAMS (deveria ser o case 6)
        case 5:
          // Tocar o áudio (se necessário)
          playAudio('utils/Apresentação 02 (New) (2).wav'); // Caminho para o áudio
        
          // Página 3: Animação de retângulos
          camera.position.set(0, 1.5, 5); // Move a câmera mais próxima dos objetos
        
          // Aumentar a largura e altura dos retângulos
          const rectangleGeometryAluno = new THREE.BoxGeometry(6.5, 5, 0.01); // Geometria do primeiro retângulo (largura e altura aumentadas)
          const rectangleGeometryTimes = new THREE.BoxGeometry(6, 5, 0.01); // Geometria do segundo retângulo (largura e altura aumentadas)
        
          // Caminhos das texturas
          const texturePathAluno = 'utils/TESTE (1).png'; // Primeira textura
          const texturePathTimes = 'utils/TESTE2.jpg'; // Segunda textura
        
          // Cria e adiciona os retângulos à cena
          const createRectangles = () => {
            const rectangleMaterialAluno = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(texturePathAluno)});
            
            const rectangleAluno = new THREE.Mesh(rectangleGeometryAluno, rectangleMaterialAluno);
            rectangleAluno.position.set(-3, -10, -5); // Posição inicial mais afastada do centro
            scene.add(rectangleAluno);
        
            const rectangleMaterialTimes = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(texturePathTimes) });
            const rectangleTimes = new THREE.Mesh(rectangleGeometryTimes, rectangleMaterialTimes);
            rectangleTimes.position.set(3, -10, -5); // Posição inicial mais afastada do centro
            scene.add(rectangleTimes);
        
            return [rectangleAluno, rectangleTimes];
          };
        
          const rectangles = createRectangles();
        
          // Função para animar os retângulos emergindo do chão
          const animateRectangle = (rectangle, targetY, duration) => {
            const startY = rectangle.position.y;
            const startTime = Date.now();
        
            const animate = () => {
              const elapsedTime = Date.now() - startTime;
              const progress = Math.min(elapsedTime / duration, 1);
        
              rectangle.position.y = startY + progress * (targetY - startY);
        
              renderer.render(scene, camera);
        
              if (progress < 1) {
                requestAnimationFrame(animate);
              }
            };
        
            animate();
          };
        
          // Função para animar a flutuação dos retângulos
          const floatAmplitude97 = 0.1; // Amplitude da flutuação
          const floatSpeed = 0.001; // Velocidade da flutuação
        
          const animateFloat = (rectangle) => {
            const animate = () => {
              rectangle.position.y = 1 + Math.sin(Date.now() * floatSpeed) * floatAmplitude97;
              renderer.render(scene, camera);
              requestAnimationFrame(animate);
            };
        
            animate();
          };
        
          // Gerencia as animações com delay usando setTimeout
          setTimeout(() => {
            animateRectangle(rectangles[0], 1, 2000); // Anima o retângulo da esquerda (APP_ALUNO) subindo até Y=1 em 2 segundos
            // Inicia a animação de flutuação para o retângulo da esquerda após 5 segundos
            setTimeout(() => animateFloat(rectangles[0]), 2000);
          }, 0); // Inicia imediatamente
        
          setTimeout(() => {
            animateRectangle(rectangles[1], 1, 2000); // Anima o retângulo da direita (APP_TIMES) subindo até Y=1 em 2 segundos
            // Inicia a animação de flutuação para o retângulo da direita após 5 segundos
            setTimeout(() => animateFloat(rectangles[1]), 2000);
          }, 5000); // Inicia após 5 segundos
        
          // Redirecionamento após o case 6
          redirectTimeoutRef.current = setTimeout(() => {
            setCurrentPage(7);
          }, 22000);
        
          break;
        

        // RANKING E PÓDIO
        case 6:

        playAudio('utils/Apresentação 01 (New) (1).wav'); // Adicione o caminho correto para o áudio
      
        // Página 6: Animação de retângulo com vídeo
        camera.position.set(9, 1.5, 9);
      
        const rectangleGeometry5 = new THREE.BoxGeometry(3, 2, 0.005); // Retângulo
      
        // Criar o elemento de vídeo e a textura do vídeo
        const video2 = document.createElement('video');
        video2.src = 'utils/vr pódio e ranking.mp4'; // Caminho para o vídeo
        video2.crossOrigin = 'anonymous'; // Se necessário
        video2.loop = false;
        video2.muted = true;
      
        const videoTexture3 = new THREE.VideoTexture(video2);
        videoTexture3.minFilter = THREE.LinearFilter;
        videoTexture3.magFilter = THREE.LinearFilter;
        videoTexture3.format = THREE.RGBFormat;
      
        const rectangleMaterial6 = new THREE.MeshBasicMaterial({ map: videoTexture3 });
        const rectangle6 = new THREE.Mesh(rectangleGeometry5, rectangleMaterial6);
        rectangle6.position.set(0, 1, -2);

      
        // Função para criar um efeito de flutuação
        const floatAmplitude5 = 0.05; // Amplitude da flutuação
        const floatSpeed5 = 0.001; // Velocidade da flutuação
      
        const animate11 = () => {
          const time = Date.now() * floatSpeed5;
          rectangle6.position.y = 1 + Math.sin(time) * floatAmplitude5; // Anima a posição Y
      
          // Renderizar a cena
          renderer.render(scene, camera);
      
          // Solicita o próximo frame de animação
          renderer.setAnimationLoop(animate11);
        };
      
        // Atrasar o início do vídeo e da animação por 5 segundos
        setTimeout(() => {
          scene.add(rectangle6);
          animate11(); // Inicia a animação
        }, 5000);

        // Atrasar o início do vídeo e da animação por 5 segundos
        setTimeout(() => {
          video2.play(); // Inicia a reprodução do vídeo após 5 segundos
        }, 8000);
      
        // Redirecionamento após o case 6
        redirectTimeoutRef.current = setTimeout(() => {
          setCurrentPage(5);
        }, 10500);
      
        break;

        
        case 7:
          playAudio('utils/Apresentação 03 (New).wav');
        
          setTimeout(() => {

        
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
          },);

          //Redirecionamento após o case 6
          redirectTimeoutRef.current = setTimeout(() => {
            setCurrentPage(8);
          }, 7000);
          break;


          case 8:
            const loader = new FontLoader();
            loader.load('https://threejs.org/examples/fonts/droid/droid_serif_bold.typeface.json', (font) => {
              const geometry = new TextGeometry('Experiência finalizada, muito obrigado\npor partilhar do futuro conosco!', {
                font: font,
                size: 0.3, // Aumenta o tamanho do texto
                height: 0.01, // Reduz a profundidade para evitar borrões
              });
          
              const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
              const textMesh = new THREE.Mesh(geometry, material);
          
              geometry.center(); // Centraliza o texto na tela
              textMesh.position.set(0, 1.5, -3); // Posição ajustada para aparecer na frente da visão do usuário
              scene.add(textMesh);
            });
          
            // Adiciona o botão
            const button = document.createElement('button');
            button.innerText = 'Reiniciar Experiência';
            button.style.position = 'fixed';
            button.style.bottom = '80px';
            button.style.left = '50%';
            button.style.transform = 'translateX(-50%)';
            button.style.padding = '10px 20px';
            button.style.backgroundColor = 'white';
            button.style.color = 'black';
            button.style.border = 'none';
            button.style.borderRadius = '5px';
            button.style.fontSize = '25px';
            button.style.fontWeight = 'bold';
            button.style.cursor = 'pointer';
          
            button.addEventListener('click', () => {
              window.location.href = '/'; // Redireciona para a página inicial
            });
          
            document.body.appendChild(button);
          
            // Desativa o modo VR após 8 segundos
            setTimeout(() => {
              if (renderer.xr.isPresenting) {
                renderer.xr.getSession().end();
              }
            }, 8000); // 8000 milissegundos = 8 segundos
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