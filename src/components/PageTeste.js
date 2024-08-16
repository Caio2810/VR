import * as THREE from 'three';
import React, { useEffect, useRef } from 'react';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import ThreeMeshUI from 'three-mesh-ui';
import ShadowedLight from './utils/ShadowedLight.js';
import VRControl from './utils/VRControl.js';
import FontJSON from './assets/Poppins-msdf.json';
import FontImage from './assets/Poppins.png';

const PageTeste = () => {
	useEffect(() => {
		let scene, camera, renderer, controls, vrControl;
		let meshContainer, meshes, currentMesh;
		const objsToTest = [];


		window.addEventListener('load', init);
		window.addEventListener('resize', onWindowResize);

		const raycaster = new THREE.Raycaster();
		const mouse = new THREE.Vector2();
		mouse.x = mouse.y = null;

		let selectState = false;

		window.addEventListener('pointermove', (event) => {
			mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
			mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
		});

		window.addEventListener('pointerdown', () => {
			selectState = true;
		});

		window.addEventListener('pointerup', () => {
			selectState = false;
		});

		window.addEventListener('touchstart', (event) => {
			selectState = true;
			mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
			mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
		});

		window.addEventListener('touchend', () => {
			selectState = false;
			mouse.x = null;
			mouse.y = null;
		});

		function init() {
			scene = new THREE.Scene();
			scene.background = new THREE.Color(0x505050);

			camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
			renderer = new THREE.WebGLRenderer({ antialias: true });
			renderer.setPixelRatio(window.devicePixelRatio);
			renderer.setSize(window.innerWidth, window.innerHeight);
			renderer.colorSpace = 'srgb';
			renderer.xr.enabled = true;
			document.body.appendChild(VRButton.createButton(renderer));
			document.body.appendChild(renderer.domElement);

			controls = new OrbitControls(camera, renderer.domElement);
			camera.position.set(0, 1.6, 0);
			controls.target = new THREE.Vector3(0, 1, -1.8);

			const room = new THREE.LineSegments(
				new BoxLineGeometry(6, 6, 6, 10, 10, 10).translate(0, 3, 0),
				new THREE.LineBasicMaterial({ color: 0x808080 })
			);

			const roomMesh = new THREE.Mesh(
				new THREE.BoxGeometry(6, 6, 6, 10, 10, 10).translate(0, 3, 0),
				new THREE.MeshBasicMaterial({ side: THREE.BackSide })
			);

			scene.add(room);
			objsToTest.push(roomMesh);

			const light = ShadowedLight({
				z: 10,
				width: 6,
				bias: -0.0001
			});

			const hemLight = new THREE.HemisphereLight(0x808080, 0x606060);
			scene.add(light, hemLight);

			vrControl = VRControl(renderer, camera, scene);
			scene.add(vrControl.controllerGrips[0], vrControl.controllers[0]);

			vrControl.controllers[0].addEventListener('selectstart', () => {
				selectState = true;
			});
			vrControl.controllers[0].addEventListener('selectend', () => {
				selectState = false;
			});

			meshContainer = new THREE.Group();
			meshContainer.position.set(0, 1, -1.9);
			scene.add(meshContainer);

			const sphere = new THREE.Mesh(
				new THREE.IcosahedronGeometry(0.3, 1),
				new THREE.MeshStandardMaterial({ color: 0x3de364, flatShading: true })
			);

			const box = new THREE.Mesh(
				new THREE.BoxGeometry(0.45, 0.45, 0.45),
				new THREE.MeshStandardMaterial({ color: 0x643de3, flatShading: true })
			);

			const cone = new THREE.Mesh(
				new THREE.ConeGeometry(0.28, 0.5, 10),
				new THREE.MeshStandardMaterial({ color: 0xe33d4e, flatShading: true })
			);

			sphere.visible = box.visible = cone.visible = false;
			meshContainer.add(sphere, box, cone);

			meshes = [sphere, box, cone];
			currentMesh = 0;

			showMesh(currentMesh);
			makePanel();
			renderer.setAnimationLoop(loop);
		}

		function showMesh(id) {
			meshes.forEach((mesh, i) => {
				mesh.visible = i === id ? true : false;
			});
		}

		function makePanel() {
			const container = new ThreeMeshUI.Block({
				justifyContent: 'center',
				contentDirection: 'row-reverse',
				fontFamily: FontJSON,
				fontTexture: FontImage,
				fontSize: 0.07,
				padding: 0.02,
				borderRadius: 0.11
			});

			container.position.set(0, 0.6, -1.2);
			container.rotation.x = -0.55;
			scene.add(container);

			const buttonOptions = {
				width: 0.4,
				height: 0.15,
				justifyContent: 'center',
				offset: 0.05,
				margin: 0.02,
				borderRadius: 0.075
			};

			const hoveredStateAttributes = {
				state: 'hovered',
				attributes: {
					offset: 0.035,
					backgroundColor: new THREE.Color(0x999999),
					backgroundOpacity: 1,
					fontColor: new THREE.Color(0xffffff)
				},
			};

			const idleStateAttributes = {
				state: 'idle',
				attributes: {
					offset: 0.035,
					backgroundColor: new THREE.Color(0x666666),
					backgroundOpacity: 0.3,
					fontColor: new THREE.Color(0xffffff)
				},
			};

			const buttonNext = new ThreeMeshUI.Block(buttonOptions);
			const buttonPrevious = new ThreeMeshUI.Block(buttonOptions);

			buttonNext.add(new ThreeMeshUI.Text({ content: 'next' }));
			buttonPrevious.add(new ThreeMeshUI.Text({ content: 'previous' }));
            buttonNext.userData.isUI = true;
            buttonPrevious.userData.isUI = true;

			const selectedAttributes = {
				offset: 0.02,
				backgroundColor: new THREE.Color(0x777777),
				fontColor: new THREE.Color(0x222222)
			};

			buttonNext.setupState({
				state: 'selected',
				attributes: selectedAttributes,
				onSet: () => {
					currentMesh = (currentMesh + 1) % 3;
					showMesh(currentMesh);
				}
			});
			buttonNext.setupState(hoveredStateAttributes);
			buttonNext.setupState(idleStateAttributes);

			buttonPrevious.setupState({
				state: 'selected',
				attributes: selectedAttributes,
				onSet: () => {
					currentMesh -= 1;
					if (currentMesh < 0) currentMesh = 2;
					showMesh(currentMesh);
				}
			});
			buttonPrevious.setupState(hoveredStateAttributes);
			buttonPrevious.setupState(idleStateAttributes);

			container.add(buttonNext, buttonPrevious);
			objsToTest.push(buttonNext, buttonPrevious);
		}

		function onWindowResize() {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		}

		function loop() {
			ThreeMeshUI.update();
			controls.update();
			meshContainer.rotation.z += 0.01;
			meshContainer.rotation.y += 0.01;
			renderer.render(scene, camera);
			updateButtons();
		}

        function updateButtons() {
            let intersect;
        
            if (renderer.xr.isPresenting) {
                const controller = vrControl.controllers[0]; // Get the VR controller
                raycaster.ray.origin.copy(controller.position); // Set the ray origin to the controller position
                raycaster.ray.direction.set(0, 0, -1).applyQuaternion(controller.quaternion); // Set the ray direction based on the controller orientation
                intersect = raycast();
                controls.enabled = false;
        
                // Position the little white dot at the end of the controller pointing ray
                if (intersect) vrControl.setPointerAt(0, intersect.point);
            } else if (mouse.x !== null && mouse.y !== null) {
                raycaster.setFromCamera(mouse, camera);
                intersect = raycast();
                controls.enabled = true;
            }
        
            // Update targeted button state (if any)
            if (intersect && intersect.object.isUI) {
            console.log('Intersected Object:', intersect.object);

                if (selectState) {
                    intersect.object.setState('selected');
                } else {
                    intersect.object.setState('hovered');
                }
            }
            
        
            // Update non-targeted buttons state
            objsToTest.forEach((obj) => {
                if ((!intersect || obj !== intersect.object) && obj.isUI) {
                    obj.setState('idle');
                }
            });
        }
        
        
        //
        
        function raycast() {
        
            return objsToTest.reduce( ( closestIntersection, obj ) => {
        
                const intersection = raycaster.intersectObject( obj, true );
        
                if ( !intersection[ 0 ] ) return closestIntersection;
        
                if ( !closestIntersection || intersection[ 0 ].distance < closestIntersection.distance ) {
        
                    intersection[ 0 ].object = obj;
        
                    return intersection[ 0 ];
        
                }
        
                return closestIntersection;
        
            }, null );
		}

		return () => {
			window.removeEventListener('resize', onWindowResize);
		};
	}, []);

	return null; 
};

export default PageTeste;