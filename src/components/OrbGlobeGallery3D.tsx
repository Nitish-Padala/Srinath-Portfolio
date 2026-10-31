import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  PortfolioPhoto,
  computeOrbPositions,
  getInterleavedGlobePhotos,
} from '../utils/portfolioLogic';
import { renderEditedGlobeTileCanvas } from '../utils/proceduralPhotos';

interface OrbGlobeGallery3DProps {
  photos: PortfolioPhoto[];
  onSelectPhotoFullscreen: (photo: PortfolioPhoto) => void;
}

/**
 * 150-Photo 3D Fibonacci Globe:
 * - Renders all 150 curated photographs tightly packed across the Fibonacci sphere
 * - Calibrated per-aspect-ratio tile dimensions (1:1, 3:4, 4:3, 9:16, 16:9 on radius 6.4)
 *   so photos meet edge-to-edge seamlessly without empty black gaps.
 * - Circular Touch/Scroll Boundary:
 *   Touching or dragging inside the circular globe area rotates or zooms the 3D globe.
 *   Touching outside the circular globe boundary in the section margins allows natural vertical page scrolling.
 * - Default 80% zoom on page load with smooth 200% zoom-in capability.
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

    // Dark Obsidian Inner Core Sphere so back-facing tiles never show through
    const orbCoreGroup = new THREE.Group();
    scene.add(orbCoreGroup);

    const darkCoreMat = new THREE.MeshBasicMaterial({
      color: 0x120f0d,
      transparent: true,
      opacity: 0.98,
    });
    const innerOccluder = new THREE.Mesh(new THREE.SphereGeometry(6.22, 40, 40), darkCoreMat);
    orbCoreGroup.add(innerOccluder);

    const wireCoreMat = new THREE.MeshBasicMaterial({
      color: 0xc8a97e,
      wireframe: true,
      transparent: true,
      opacity: 0.14,
    });
    const innerWireSphere = new THREE.Mesh(new THREE.IcosahedronGeometry(6.28, 3), wireCoreMat);
    orbCoreGroup.add(innerWireSphere);

    // 150 Photo Tiles on the Fibonacci Sphere with Native Aspect Ratios
    const tilesGroup = new THREE.Group();
    scene.add(tilesGroup);

    const interactables: THREE.Mesh[] = [];
    const globeRadius = 6.4;
    const globePhotos = getInterleavedGlobePhotos(photos);
    const nodes = computeOrbPositions(globePhotos, globeRadius);

    const geometriesCache = new Map<string, THREE.PlaneGeometry>();
    const materialsList: THREE.MeshBasicMaterial[] = [];

    const dummyTarget = new THREE.Vector3();
    let isDisposed = false;

    nodes.forEach((node, idx) => {
      const photo = globePhotos[idx];
      if (!photo) return;

      const geoKey = `${node.tileW.toFixed(2)}x${node.tileH.toFixed(2)}`;
      let planeGeo = geometriesCache.get(geoKey);
      if (!planeGeo) {
        planeGeo = new THREE.PlaneGeometry(node.tileW, node.tileH);
        geometriesCache.set(geoKey, planeGeo);
      }

      // Unlit sRGB material with warm 0xe8dccb multiplier prevents highlight blowout
      const mat = new THREE.MeshBasicMaterial({
        color: 0xe8dccb,
        side: THREE.DoubleSide,
      });
      materialsList.push(mat);

      renderEditedGlobeTileCanvas(photo, 520, 520).then((tileCanvas) => {
        if (isDisposed) return;
        const tex = new THREE.CanvasTexture(tileCanvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        mat.map = tex;
        mat.needsUpdate = true;
        requestRender();
      });

      const tileHolder = new THREE.Group();
      // Slight radial stagger (0..0.03) prevents edge z-fighting between neighboring tiles
      const rScale = 1 + (idx % 5) * 0.0025;
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
    controls.maxDistance = 24.0;
    controls.enablePan = false;

    // Mathematical Circular Hit-Test Boundary:
    // Radius ~6.9 in world space accurately encompasses the rotating spherical globe
    const globeBoundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0.15, 0), 7.0);
    const testRay = new THREE.Ray();
    const ndcVec = new THREE.Vector2();

    function isInsideGlobeCircle(clientX: number, clientY: number): boolean {
      const rect = renderer.domElement.getBoundingClientRect();
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        return false;
      }
      ndcVec.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      ndcVec.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      testRay.origin.setFromMatrixPosition(camera.matrixWorld);
      testRay.direction.set(ndcVec.x, ndcVec.y, 0.5).unproject(camera).sub(testRay.origin).normalize();
      return testRay.intersectsSphere(globeBoundingSphere);
    }

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
    let pointerInsideGlobe = false;

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

    // Capture pointerdown: enable OrbitControls ONLY if inside the circular globe
    const onPointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
      downTime = performance.now();
      pointerInsideGlobe = isInsideGlobeCircle(e.clientX, e.clientY);

      if (!pointerInsideGlobe) {
        // Outside the circular globe area: disable controls so touch/drag scrolls page normally
        controls.enabled = false;
        return;
      }

      controls.enabled = true;

      if (holdTimer) window.clearTimeout(holdTimer);
      holdTimer = window.setTimeout(() => {
        const picked = pickPhotoAtEvent(downX, downY);
        if (picked) {
          callbacksRef.current.onSelectPhotoFullscreen(picked);
        }
      }, 420);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!pointerInsideGlobe) return;
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
      if (!pointerInsideGlobe) {
        controls.enabled = true;
        return;
      }
      const dist = Math.hypot(e.clientX - downX, e.clientY - downY);
      const elapsed = performance.now() - downTime;
      if (dist < 10 && elapsed < 420) {
        const picked = pickPhotoAtEvent(e.clientX, e.clientY);
        if (picked) {
          callbacksRef.current.onSelectPhotoFullscreen(picked);
        }
      }
      controls.enabled = true;
    };

    // Wheel event: zoom globe if cursor is inside the circle; scroll page if outside
    const onWheel = (e: WheelEvent) => {
      const inside = isInsideGlobeCircle(e.clientX, e.clientY);
      controls.enableZoom = inside;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('pointerdown', onPointerDown, { capture: true });
    domElem.addEventListener('pointermove', onPointerMove);
    domElem.addEventListener('pointerup', onPointerUp);
    domElem.addEventListener('wheel', onWheel, { passive: true, capture: true });

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
      domElem.removeEventListener('pointerdown', onPointerDown, { capture: true });
      domElem.removeEventListener('pointermove', onPointerMove);
      domElem.removeEventListener('pointerup', onPointerUp);
      domElem.removeEventListener('wheel', onWheel, { capture: true });
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      controls.dispose();
      geometriesCache.forEach((geo) => geo.dispose());
      geometriesCache.clear();
      materialsList.forEach((m) => {
        m.map?.dispose();
        m.dispose();
      });
      darkCoreMat.dispose();
      wireCoreMat.dispose();
      innerOccluder.geometry.dispose();
      innerWireSphere.geometry.dispose();
      renderer.dispose();
    };
  }, [photos]);

  return (
    <section
      id="orb-section"
      aria-label="3D Photo Globe"
      className="relative z-10 py-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="relative w-full h-[640px] sm:h-[740px] lg:h-[820px] flex items-center justify-center overflow-hidden">
        {/* Subtle celestial guide ring highlighting the interactive circular globe boundary */}
        <div
          aria-hidden="true"
          className="absolute pointer-events-none w-[520px] h-[520px] sm:w-[630px] sm:h-[630px] lg:w-[710px] lg:h-[710px] rounded-full border border-[#c8a97e]/15 shadow-[0_0_100px_rgba(200,169,126,0.06)] opacity-70"
        />
        <div
          ref={canvasMountRef}
          data-testid="orb-globe-canvas"
          data-default-zoom="80%"
          className="w-full h-full cursor-grab active:cursor-grabbing"
        />
      </div>
    </section>
  );
};
