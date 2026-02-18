/**
 * Three.js 3D Logo â€” VERSÃƒO PREMIUM CAKTO-STYLE
 * 
 * Sistema de shader avanÃ§ado com:
 * - DegradÃª vertical (verde claro â†’ escuro) na face frontal
 * - DetecÃ§Ã£o de bordas com material separado (fosco nas laterais)
 * - RectAreaLight para reflexo tipo softbox
 * - Sombras ultra suaves (VSM Shadow Map)
 * - Clearcoat forte para acabamento polido
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';

function mountFallbackLogo(container) {
    if (container.querySelector('.card-3d-logo-fallback')) return;

    const fallback = document.createElement('img');
    fallback.src = '/logo-verde.png';
    fallback.alt = 'VINNX Logo';
    fallback.className = 'card-3d-logo-fallback';
    container.appendChild(fallback);
}

export function initLogo3D() {
    const container = document.getElementById('logo3dCanvas');
    if (!container) return;
    if (container.dataset.initialized === 'true') return;
    container.dataset.initialized = 'true';

    const card = document.getElementById('cardCenter');
    const hasMatchMedia = typeof window.matchMedia === 'function';
    const isMobileView = window.innerWidth < 1024 || (hasMatchMedia && window.matchMedia('(pointer: coarse)').matches);

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // Scene setup
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    const scene = new THREE.Scene();

    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);

    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100);
    camera.position.set(0.8, 0.3, 5.5);
    camera.lookAt(0.8, 0, 0);

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({
            antialias: !isMobileView,
            alpha: true,
            powerPreference: isMobileView ? 'default' : 'high-performance',
        });
    } catch (error) {
        console.warn('Failed to initialize WebGL renderer:', error);
        mountFallbackLogo(container);
        return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobileView ? 1.5 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    container.appendChild(renderer.domElement);

    // Inicializar RectAreaLight
    RectAreaLightUniformsLib.init();

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // Environment Map â€” Imagem de reflexo ou fallback programÃ¡tico
    // Coloque sua imagem equirectangular em: public/env/reflection.jpg
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    // Tenta carregar imagem de reflexo customizada
    function loadReflectionImage() {
        return new Promise((resolve) => {
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(
                '/env/reflection.jpg',
                (texture) => {
                    texture.mapping = THREE.EquirectangularReflectionMapping;
                    texture.colorSpace = THREE.SRGBColorSpace;
                    const processed = pmremGenerator.fromEquirectangular(texture).texture;
                    texture.dispose();
                    resolve(processed);
                },
                undefined,
                () => resolve(null) // Fallback se nÃ£o encontrar
            );
        });
    }

    // Fallback: ambiente programÃ¡tico (gradiente verde)
    function generateFallbackEnv() {
        const envScene = new THREE.Scene();
        envScene.background = new THREE.Color(0x0a0a0a);

        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const radialGradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 180);
        radialGradient.addColorStop(0.0, '#ffffff');
        radialGradient.addColorStop(0.2, '#86efac');
        radialGradient.addColorStop(0.5, '#22c55e');
        radialGradient.addColorStop(0.8, '#15803d');
        radialGradient.addColorStop(1.0, '#0a1810');

        ctx.fillStyle = radialGradient;
        ctx.fillRect(0, 0, 256, 256);

        const gradientTexture = new THREE.CanvasTexture(canvas);
        gradientTexture.colorSpace = THREE.SRGBColorSpace;

        const softbox = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 10),
            new THREE.MeshBasicMaterial({ map: gradientTexture, side: THREE.DoubleSide })
        );
        softbox.position.set(0, 1.5, 4.5);
        softbox.lookAt(0, 0, 0);
        envScene.add(softbox);

        return pmremGenerator.fromScene(envScene, 0.04).texture;
    }

    // Carrega reflexo: imagem customizada ou fallback
    loadReflectionImage().then((customEnv) => {
        const finalEnv = customEnv || generateFallbackEnv();
        if (finalEnv) {
            scene.environment = finalEnv; // Aplica automaticamente a todos os materiais PBR
        }
        pmremGenerator.dispose();
    });

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // IluminaÃ§Ã£o â€” ESTILO CAKTO
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
    scene.add(ambientLight);

    const rectLight = new THREE.RectAreaLight(0xffffff, 5, 3.5, 3.5);
    rectLight.position.set(0, 3, 5);
    rectLight.lookAt(0, 0, 0);
    scene.add(rectLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.1);
    keyLight.position.set(2, 4, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(isMobileView ? 1024 : 2048, isMobileView ? 1024 : 2048);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 15;
    keyLight.shadow.bias = -0.0001;
    keyLight.shadow.radius = 6.5;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x88ffaa, 0.4);
    fillLight.position.set(-3, 1, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xaaffff, 1.0);
    rimLight.position.set(-2, 0.5, -3);
    scene.add(rimLight);

    const topLight = new THREE.DirectionalLight(0xffffff, 0.5);
    topLight.position.set(0, 6, 1);
    scene.add(topLight);

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // Pivot group
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    const pivot = new THREE.Group();
    scene.add(pivot);

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // Load GLB model
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    const loader = new GLTFLoader();
    let model = null;

    const targetRotation = { x: 0, y: 0 };
    const currentRotation = { x: 0, y: 0 };

    let entranceStart = 0;
    let entranceActive = false;
    const ENTRANCE_DURATION = 1.5;
    const BASE_Y_ROT = 0; // Centralizado â€” segue o mouse diretamente

    // Model rotation offsets (from tester)
    const MODEL_ROT_X = 7 * Math.PI / 180;
    const MODEL_ROT_Y = 36 * Math.PI / 180;
    const MODEL_ROT_Z = 3 * Math.PI / 180;
    const MODEL_SCALE = 2.2;

    loader.load(
        '/models/logo-3d.glb',
        (gltf) => {
            model = gltf.scene;

            // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            // Material PREMIUM com Shader AvanÃ§ado
            // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            const material = new THREE.MeshPhysicalMaterial({
                color: 0x22c55e,
                metalness: 0.85,
                roughness: 0.1,
                clearcoat: 1.0,
                clearcoatRoughness: 0.08,
                envMapIntensity: 0.9,
                sheen: 0.6,
                sheenColor: new THREE.Color(0x88ffaa),
                sheenRoughness: 0.3,
                side: THREE.DoubleSide,
            });

            // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            // SHADER â€” DegradÃª Vertical + Bordas Foscas
            // Mesmo sistema do 3D Tester
            // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            material.onBeforeCompile = (shader) => {
                // Uniforms configurÃ¡veis
                shader.uniforms.colorTop = { value: new THREE.Color(0x4ade80) };
                shader.uniforms.colorBottom = { value: new THREE.Color(0x064e3b) };
                shader.uniforms.colorSide = { value: new THREE.Color('#0e3e04') };
                shader.uniforms.gradientEnabled = { value: 1.0 };
                shader.uniforms.sideEnabled = { value: 1.0 };
                shader.uniforms.sideBias = { value: 0.65 };
                shader.uniforms.frontAxis = { value: 2 }; // 0=X, 1=Y, 2=Z
                shader.uniforms.sideRoughness = { value: 0.9 };
                shader.uniforms.sideMetalness = { value: 0.1 };

                // Vertex â€” world position e normal
                shader.vertexShader = shader.vertexShader.replace(
                    '#include <common>',
                    `#include <common>
                    varying vec3 vGradientWorldPos;
                    varying vec3 vWorldNormal;`
                );
                shader.vertexShader = shader.vertexShader.replace(
                    '#include <worldpos_vertex>',
                    `#include <worldpos_vertex>
                    vGradientWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
                    vWorldNormal = normalize(mat3(modelMatrix) * objectNormal);`
                );

                // Fragment â€” declarations + edge helper
                shader.fragmentShader = shader.fragmentShader.replace(
                    '#include <common>',
                    `#include <common>
                    uniform vec3 colorTop;
                    uniform vec3 colorBottom;
                    uniform vec3 colorSide;
                    uniform float gradientEnabled;
                    uniform float sideEnabled;
                    uniform float sideBias;
                    uniform int frontAxis;
                    uniform float sideRoughness;
                    uniform float sideMetalness;
                    varying vec3 vGradientWorldPos;
                    varying vec3 vWorldNormal;

                    float getEdgeFactor(vec3 normal, int axis, float bias) {
                        vec3 axisVec = vec3(0.0, 0.0, 1.0);
                        if (axis == 0) axisVec = vec3(1.0, 0.0, 0.0);
                        if (axis == 1) axisVec = vec3(0.0, 1.0, 0.0);
                        float alignment = abs(dot(normal, axisVec));
                        return 1.0 - smoothstep(bias, bias + 0.1, alignment);
                    }`
                );

                // Fragment â€” roughness per face
                shader.fragmentShader = shader.fragmentShader.replace(
                    '#include <roughnessmap_fragment>',
                    `#include <roughnessmap_fragment>
                    if (sideEnabled > 0.5) {
                        float edge = getEdgeFactor(vWorldNormal, frontAxis, sideBias);
                        roughnessFactor = mix(roughnessFactor, sideRoughness, edge);
                    }`
                );

                // Fragment â€” metalness per face
                shader.fragmentShader = shader.fragmentShader.replace(
                    '#include <metalnessmap_fragment>',
                    `#include <metalnessmap_fragment>
                    if (sideEnabled > 0.5) {
                        float edge = getEdgeFactor(vWorldNormal, frontAxis, sideBias);
                        metalnessFactor = mix(metalnessFactor, sideMetalness, edge);
                    }`
                );

                // Fragment â€” diffuse color with gradient + edge
                shader.fragmentShader = shader.fragmentShader.replace(
                    'vec4 diffuseColor = vec4( diffuse, opacity );',
                    `float isEdge = getEdgeFactor(vWorldNormal, frontAxis, sideBias);
                    float gradFactor = smoothstep(-1.0, 1.0, vGradientWorldPos.y);
                    vec3 gradColor = mix(colorBottom, colorTop, gradFactor);
                    vec3 paintColor = gradColor;
                    if (sideEnabled > 0.5) {
                        paintColor = mix(gradColor, colorSide, isEdge);
                    }
                    vec3 finalBase = mix(diffuse, paintColor, gradientEnabled);
                    vec4 diffuseColor = vec4( finalBase, opacity );`
                );
            };

            model.traverse((child) => {
                if (child.isMesh) {
                    child.material = material;
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            // Centralizar e escalar
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());

            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = MODEL_SCALE / maxDim;
            model.scale.setScalar(scale);

            model.position.x = -center.x * scale;
            model.position.y = -center.y * scale;
            model.position.z = -center.z * scale;

            // Aplicar rotaÃ§Ã£o do modelo (configurado no tester)
            model.rotation.x = MODEL_ROT_X;
            model.rotation.y = MODEL_ROT_Y;
            model.rotation.z = MODEL_ROT_Z;

            pivot.add(model);
            container.classList.add('loaded');

            // AnimaÃ§Ã£o de entrada
            pivot.scale.setScalar(0.001);

            if (!('IntersectionObserver' in window)) {
                entranceStart = performance.now() / 1000;
                entranceActive = true;
            } else {
                const observer = new IntersectionObserver((entries) => {
                    if (entries[0].isIntersecting && !entranceActive) {
                        entranceStart = performance.now() / 1000;
                        entranceActive = true;
                        observer.disconnect();
                    }
                }, { threshold: 0.3 });
                observer.observe(card || container);
            }
        },
        undefined,
        (error) => {
            console.warn('Failed to load 3D logo:', error);
            mountFallbackLogo(container);
        }
    );

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // Mouse follow â€” segue o cursor SEMPRE (global)
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    const MAX_TILT = 0.25;

    function setTargetFromPoint(clientX, clientY) {
        const x = (clientX / Math.max(window.innerWidth, 1)) * 2 - 1;
        const y = (clientY / Math.max(window.innerHeight, 1)) * 2 - 1;
        targetRotation.y = x * MAX_TILT;
        targetRotation.x = y * MAX_TILT;
    }

    if ('onpointermove' in window) {
        document.addEventListener('pointermove', (e) => {
            if (e.pointerType === 'touch') return;
            setTargetFromPoint(e.clientX, e.clientY);
        }, { passive: true });

        document.addEventListener('pointerdown', (e) => {
            if (e.pointerType === 'touch' || e.pointerType === 'pen') {
                setTargetFromPoint(e.clientX, e.clientY);
            }
        }, { passive: true });

        document.addEventListener('pointermove', (e) => {
            if (e.pointerType === 'touch' || e.pointerType === 'pen') {
                setTargetFromPoint(e.clientX, e.clientY);
            }
        }, { passive: true });
    } else {
        document.addEventListener('mousemove', (e) => {
            setTargetFromPoint(e.clientX, e.clientY);
        }, { passive: true });

        document.addEventListener('touchstart', (e) => {
            const touch = e.touches && e.touches[0];
            if (touch) setTargetFromPoint(touch.clientX, touch.clientY);
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            const touch = e.touches && e.touches[0];
            if (touch) setTargetFromPoint(touch.clientX, touch.clientY);
        }, { passive: true });
    }

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // Animation loop
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    function animate() {
        requestAnimationFrame(animate);

        if (model) {
            currentRotation.x += (targetRotation.x - currentRotation.x) * 0.06;
            currentRotation.y += (targetRotation.y - currentRotation.y) * 0.06;

            if (entranceActive) {
                const elapsed = performance.now() / 1000 - entranceStart;
                const t = Math.min(elapsed / ENTRANCE_DURATION, 1);
                const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t) * Math.cos((t * 10 - 0.75) * (2 * Math.PI / 3));
                pivot.scale.setScalar(eased);
                pivot.rotation.x = currentRotation.x;
                pivot.rotation.y = currentRotation.y + BASE_Y_ROT + Math.PI * (1 - eased);
                if (t >= 1) entranceActive = false;
            } else {
                pivot.rotation.x = currentRotation.x;
                pivot.rotation.y = currentRotation.y + BASE_Y_ROT;
            }
        }

        renderer.render(scene, camera);
    }

    animate();

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // Resize handling
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    function updateViewportSize() {
        const w = Math.max(container.clientWidth, 1);
        const h = Math.max(container.clientHeight, 1);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }

    if ('ResizeObserver' in window) {
        const resizeObserver = new ResizeObserver(updateViewportSize);
        resizeObserver.observe(container);
    } else {
        window.addEventListener('resize', updateViewportSize);
    }
}
