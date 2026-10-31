import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PortfolioPhoto, computeOrbPositions } from '../utils/portfolioLogic';
import { renderEditedGlobeTileCanvas } from '../utils/proceduralPhotos';

interface OrbGlobeGallery3DProps {
  photos: PortfolioPhoto[];
  onSelectPhotoFullscreen: (photo: PortfolioPhoto) => void;
}

/**
 * Option 5 Low-Key 108-Photo 3D Globe:
 * - Renders all 108 curated photographs evenly and tightly packed across the Fibonacci sphere
 * - Calibrated tile dimensions (1.66 x 1.26 on radius 6.2) and camera distance (14.0 desktop / 16.2 mobile)
 *   so the full 3D globe fits cleanly on a laptop screen with minimal gap and zero corner clipping
 * - Uses unlit sRGB MeshBasicMaterial (with warm 0xe8dccb reflectance) so highlights never blow out
 */
export const OrbGlobeGallery3D: React.FC<OrbGlobeGallery3DProps> = ({
  photos,
  onSelectPhotoFullscreen,
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  const callbacksRef = useRef({
    onSelectPhotoFullscreen,
    photos,
  });

  useEffect(() => {
    callbacksRef.current.onSelectPhotoFullscreen = onSelectPhotoFullscreen;
    callbacksRef.current.photos = photos;
  }, [onSelectPhotoFullscreen, photos]);

  useEffect(() => {
    const container = canvasMountRef.current;
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
    const height = container.clientHeight || 760;
    const isNarrow = width < 640;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    // Default 80% zoom on page load (100% base distance 14.0 / 0.80 = 17.5 desktop; 16.2 / 0.80 = 20.25 mobile)
    camera.position.set(0, 0.15, isNarrow ? 20.25 : 17.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Dark Obsidian Inner Core Sphere so back-facing tiles never show through narrow gaps
    const orbCoreGroup = new THREE.Group();
    scene.add(orbCoreGroup);

    const darkCoreMat = new THREE.MeshBasicMaterial({
      color: 0x14110f,
      transparent: true,
      opacity: 0.95,
    });
    const innerOccluder = new THREE.Mesh(new THREE.SphereGeometry(5.92, 36, 36), darkCoreMat);
    orbCoreGroup.add(innerOccluder);

    const wireCoreMat = new THREE.MeshBasicMaterial({
      color: 0xc8a97e,
      wireframe: true,
      transparent: true,
      opacity: 0.16,
    });
    const innerWireSphere = new THREE.Mesh(new THREE.IcosahedronGeometry(5.98, 3), wireCoreMat);
    orbCoreGroup.add(innerWireSphere);

    // 108 Tightly Packed Photo Tiles on the Fibonacci Sphere
    const tilesGroup = new THREE.Group();
    scene.add(tilesGroup);

    const interactables: THREE.Mesh[] = [];
    const globeRadius = 6.2;
    const nodes = computeOrbPositions(photos, globeRadius);

    const tileW = 1.66;
    const tileH = 1.26;
    const planeGeo = new THREE.PlaneGeometry(tileW, tileH);

    const dummyTarget = new THREE.Vector3();
    let isDisposed = false;

    nodes.forEach((node, idx) => {
      const photo = photos[idx];
      if (!photo) return;

      // Unlit sRGB material with warm 0xe8dccb multiplier prevents any highlight blowout
      const mat = new THREE.MeshBasicMaterial({
        color: 0xe8dccb,
        side: THREE.DoubleSide,
      });

      renderEditedGlobeTileCanvas(photo, 520, 400).then((tileCanvas) => {
        if (isDisposed) return;
        const tex = new THREE.CanvasTexture(tileCanvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        mat.map = tex;
        mat.needsUpdate = true;
        requestRender();
      });

      const tileHolder = new THREE.Group();
      // Slight radial stagger (0..0.04) prevents any edge z-fighting between neighboring tiles
      const rScale = 1 + (idx % 5) * 0.003;
      tileHolder.position.set(node.x * rScale, node.y * rScale, node.z * rScale);
      dummyTarget.set(node.x * 2, node.y * 2, node.z * 2);
      tileHolder.lookAt(dummyTarget);

      const frontPhotoMesh = new THREE.Mesh(planeGeo, mat);
      frontPhotoMesh.layers.enable(1);
      frontPhotoMesh.userData = { photo, index: idx };
      tileHolder.add(frontPhotoMesh);

      tilesGroup.add(tileHolder);
      interactables.push(frontPhotoMesh);
    });

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.rotateSpeed = 0.72;
    controls.enableZoom = true;
    // Allow zooming in up to 200% (14.0 / 2.0 = 7.0) and zooming out smoothly
    controls.minDistance = 7.0;
    controls.maxDistance = 23.0;
    controls.enablePan = false;

    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;

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
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function requestRender() {
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        renderDirty = false;
        controls.update();
        renderer.render(scene, camera);
        const done = () => {
          renderBusy = false;
          if (renderDirty) requestRender();
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    }

    controls.addEventListener('change', requestRender);

    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointerVec = new THREE.Vector2();
    let downX = 0;
    let downY = 0;
    let downTime = 0;
    let holdTimer: number | null = null;

    function pickPhotoAtEvent(clientX: number, clientY: number): PortfolioPhoto | null {
      const rect = renderer.domElement.getBoundingClientRect();
      pointerVec.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerVec.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointerVec, camera);
      const hits = raycaster.intersectObjects(interactables, false);
      if (hits.length > 0) {
        return (hits[0].object.userData?.photo as PortfolioPhoto) || null;
      }
      return null;
    }

    const onPointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
      downTime = performance.now();

      if (holdTimer) window.clearTimeout(holdTimer);
      holdTimer = window.setTimeout(() => {
        const picked = pickPhotoAtEvent(downX, downY);
        if (picked) {
          callbacksRef.current.onSelectPhotoFullscreen(picked);
        }
      }, 420);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 10 && holdTimer) {
        window.clearTimeout(holdTimer);
        holdTimer = null;
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (holdTimer) {
        window.clearTimeout(holdTimer);
        holdTimer = null;
      }
      const dist = Math.hypot(e.clientX - downX, e.clientY - downY);
      const elapsed = performance.now() - downTime;
      if (dist < 10 && elapsed < 420) {
        const picked = pickPhotoAtEvent(e.clientX, e.clientY);
        if (picked) {
          callbacksRef.current.onSelectPhotoFullscreen(picked);
        }
      }
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('pointerdown', onPointerDown);
    domElem.addEventListener('pointermove', onPointerMove);
    domElem.addEventListener('pointerup', onPointerUp);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || 760;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    };
    window.addEventListener('resize', handleResize);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }
    requestRender();

    return () => {
      isDisposed = true;
      if (holdTimer) window.clearTimeout(holdTimer);
      window.removeEventListener('resize', handleResize);
      controls.removeEventListener('change', requestRender);
      domElem.removeEventListener('pointerdown', onPointerDown);
      domElem.removeEventListener('pointermove', onPointerMove);
      domElem.removeEventListener('pointerup', onPointerUp);
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      controls.dispose();
      planeGeo.dispose();
      darkCoreMat.dispose();
      wireCoreMat.dispose();
      renderer.dispose();
    };
  }, [photos]);

  return (
    <section
      id="orb-section"
      aria-label="3D Photo Globe"
      className="relative z-10 py-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div
        ref={canvasMountRef}
        data-testid="orb-globe-canvas"
        data-default-zoom="80%"
        className="w-full h-[640px] sm:h-[740px] lg:h-[820px] cursor-grab active:cursor-grabbing"
      />
    </section>
  );
};
