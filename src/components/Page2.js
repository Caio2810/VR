import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import ThreeMeshUI from 'three-mesh-ui';
import ImageSrc from './assets/moovz.jpg'; // Substitua pelo caminho da sua imagem

const Page2 = () => {
  const rendererRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.6, 2);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    const container = new ThreeMeshUI.Block({
      height: 1,
      width: 1,
      backgroundOpacity: 0,
    });

    container.position.set(0, 1, -2.5); // Ajuste de posição

    scene.add(container);

    const imageBlock = new ThreeMeshUI.Block({
      height: 1,
      width: 1,
    });

    container.add(imageBlock);

    const loader = new THREE.TextureLoader();
    loader.load(ImageSrc, (texture) => {
      imageBlock.set({ backgroundTexture: texture });
    });

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onResize);

    renderer.setAnimationLoop(() => {
      controls.update();
      ThreeMeshUI.update();
      renderer.render(scene, camera);
    });

    const startVRSession = () => {
      if (renderer.xr.getSession() === null) {
        renderer.xr.getSession().then((session) => {
          if (!session) {
            renderer.xr.setSession(session);
          }
        });
      }
    };

    document.addEventListener('click', startVRSession); // Interação para iniciar VR

    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('click', startVRSession);
      renderer.setAnimationLoop(null);
      if (rendererRef.current && document.body.contains(rendererRef.current.domElement)) {
        document.body.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  return null;
};

export default Page2;
