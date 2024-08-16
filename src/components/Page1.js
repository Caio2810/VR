import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import ThreeMeshUI from 'three-mesh-ui';

const Page1 = () => {
  const navigate = useNavigate();
  const rendererRef = useRef(null);
  const containerRef = useRef(null);
  const redirectTimeoutRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

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
      fontSize: 0.2
    });

    const text = new ThreeMeshUI.Text({
      content: ''
    });

    container.add(text);
    scene.add(container);
    container.position.set(0, 1.5, -2);
    containerRef.current = container;

    const loop = () => {
      controls.update();
      ThreeMeshUI.update();
      renderer.render(scene, camera);
    };

    renderer.setAnimationLoop(loop);

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
                    navigate('/page2');
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
        navigate('/page2');
      }, 30000);
    };

    renderer.xr.addEventListener('sessionstart', startVRSession);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      renderer.setAnimationLoop(null);

      if (rendererRef.current && rendererRef.current.domElement.parentNode) {
        rendererRef.current.domElement.parentNode.removeChild(rendererRef.current.domElement);
      }

      audio.pause();
      clearTimeout(redirectTimeoutRef.current);
    };
  }, [navigate]);

  return null;
};

export default Page1;
