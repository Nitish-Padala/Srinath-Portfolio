import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Option 5 ("The Storyteller's Cinematic Grid") 3D Atmosphere:
 * - Deep Charcoal & Warm Espresso obsidian backdrop (#14110f -> #1c1512)
 * - Subtle rotating Saffron-Gold & Champagne sacred mandala rings in the background
 * - Warm Marigold, Saffron Gold & Burnt Crimson bokeh embers drifting gently in 3D space
 */
export const SpringBreezeBackground3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 60);
    camera.position.set(0, 0.2, 10.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(width, height);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Subtle warm low-key cinema lighting
    const ambientLight = new THREE.AmbientLight(0xebe0cc, 0.45);
    scene.add(ambientLight);

    const goldLight = new THREE.PointLight(0xd48c29, 1.4, 28);
    goldLight.position.set(5, 6, 4);
    scene.add(goldLight);

    const crimsonLight = new THREE.PointLight(0x7c1d1d, 1.1, 26);
    crimsonLight.position.set(-6, -4, 3);
    scene.add(crimsonLight);

    // 1. Subtle Sacred Mandala Wireframe Rings (Top-Right & Bottom-Left Heritage Motifs)
    const mandalaGroup = new THREE.Group();
    scene.add(mandalaGroup);

    const ringGeo1 = new THREE.RingGeometry(2.6, 4.4, 24, 3);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0xc8a97e,
      wireframe: true,
      transparent: true,
      opacity: 0.055,
    });
    const topMandala = new THREE.Mesh(ringGeo1, ringMat1);
    topMandala.position.set(5.4, 3.8, -3.5);
    mandalaGroup.add(topMandala);

    const ringGeo2 = new THREE.RingGeometry(1.8, 3.6, 20, 2);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xd48c29,
      wireframe: true,
      transparent: true,
      opacity: 0.045,
    });
    const bottomMandala = new THREE.Mesh(ringGeo2, ringMat2);
    bottomMandala.position.set(-5.8, -3.6, -4.0);
    mandalaGroup.add(bottomMandala);

    // 2. Floating Saffron Gold, Marigold & Burnt Crimson Bokeh Embers (InstancedMesh)
    const emberCount = isSoftwareGl ? 32 : 56;
    const emberGeo = new THREE.CircleGeometry(0.09, 12);
    const emberMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.32,
      side: THREE.DoubleSide,
    });

    const embersInstanced = new THREE.InstancedMesh(emberGeo, emberMat, emberCount);
    embersInstanced.frustumCulled = false;

    const emberPalette = [0xd48c29, 0xf59e0b, 0xc8a97e, 0x7c1d1d, 0x991b1b];
    const _dummy = new THREE.Object3D();
    const _color = new THREE.Color();

    const emberState: Array<{
      x: number;
      y: number;
      z: number;
      speedX: number;
      speedY: number;
      phase: number;
      scale: number;
    }> = [];

    for (let i = 0; i < emberCount; i++) {
      const ex = ((i * 3.9) % 20) - 10;
      const ey = ((i * 2.7) % 12) - 6;
      const ez = -3.0 + (i % 5) * 0.6;
      const scale = 0.55 + (i % 4) * 0.35;

      emberState.push({
        x: ex,
        y: ey,
        z: ez,
        speedX: 0.08 + (i % 4) * 0.04,
        speedY: 0.12 + (i % 3) * 0.05,
        phase: i * 0.95,
        scale,
      });

      _color.setHex(emberPalette[i % emberPalette.length]);
      embersInstanced.setColorAt(i, _color);
    }
    if (embersInstanced.instanceColor) embersInstanced.instanceColor.needsUpdate = true;
    scene.add(embersInstanced);

    const clock = new THREE.Clock();
    let frameId = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 110);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function updateScene(elapsed: number) {
      topMandala.rotation.z = elapsed * 0.04;
      bottomMandala.rotation.z = -elapsed * 0.035;

      for (let i = 0; i < emberCount; i++) {
        const em = emberState[i];
        const currX = ((em.x + Math.sin(elapsed * 0.4 + em.phase) * 0.8 + 10) % 20) - 10;
        const currY = ((em.y + elapsed * em.speedY + 6) % 12) - 6;
        const currZ = em.z + Math.cos(elapsed * 0.5 + em.phase) * 0.25;

        _dummy.position.set(currX, currY, currZ);
        _dummy.scale.setScalar(em.scale * (0.85 + 0.2 * Math.sin(elapsed * 1.4 + em.phase)));
        _dummy.rotation.set(0, 0, elapsed * 0.3 + em.phase);
        _dummy.updateMatrix();
        embersInstanced.setMatrixAt(i, _dummy.matrix);
      }
      embersInstanced.instanceMatrix.needsUpdate = true;
    }

    function tick() {
      const elapsed = clock.getElapsedTime();
      updateScene(elapsed);
      renderer.render(scene, camera);
      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
    }

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    tick();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      emberGeo.dispose();
      emberMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-gradient-to-b from-[#14110f] via-[#1b1512] to-[#110e0c]"
    >
      <div ref={mountRef} data-testid="spring-3d-background" className="w-full h-full" />
    </div>
  );
};
