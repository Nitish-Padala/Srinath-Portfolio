import React, { useEffect, useRef, useState } from 'react';
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
 * 150-Photo Concentric Ring 3D Globe:
 * - 9 neat horizontal circular rings (latitudes) where photos sit side-by-side with zero corner overlap.
 * - Center Focal Reticle: tracks whichever photo faces the camera in real time with an interactive glass pill.
 * - Single-Tap / 1-Click to Open: Instant photo opening on mobile and desktop without long-press delay.
 * - Smooth Mobile Scrolling: Vertical swipe gestures naturally scroll the page without getting stuck.
 * - Default 80% zoom on page load with smooth zoom-in up to 200%.
 */
export const OrbGlobeGallery3D: React.FC<OrbGlobeGallery3DProps> = ({
  photos,
  onSelectPhotoFullscreen,
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const [centerPhoto, setCenterPhoto] = useState<PortfolioPhoto | null>(null);

  const callbacksRef = useRef({
    onSelectPhotoFullscreen,
    photos,
  });

  const activeCenterIdRef = useRef<string | null>(null);

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

    // Dark Obsidian Inner Core Sphere
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
      opacity: 0.15,
    });
    const innerWireSphere = new THREE.Mesh(new THREE.IcosahedronGeometry(6.28, 3), wireCoreMat);
    orbCoreGroup.add(innerWireSphere);

    // 150 Photo Tiles on Concentric Circular Rings
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

      // Unlit sRGB material with luminous 0xfbf4ea reflectance for vibrant photography
      const mat = new THREE.MeshBasicMaterial({
        color: 0xfbf4ea,
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
      tileHolder.position.set(node.x, node.y, node.z);
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
    controls.minDistance = 7.0;
    controls.maxDistance = 24.0;
    controls.enablePan = false;

    // Center photo raycaster
    const centerRaycaster = new THREE.Raycaster();
    centerRaycaster.layers.set(1);
    const centerNdc = new THREE.Vector2(0, 0);

    // Bounding sphere for circular boundary check
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

    function updateCenterPhoto() {
      centerRaycaster.setFromCamera(centerNdc, camera);
      const hits = centerRaycaster.intersectObjects(interactables, false);
      if (hits.length > 0) {
        const hitPhoto = hits[0].object.userData?.photo as PortfolioPhoto;
        if (hitPhoto && hitPhoto.id !== activeCenterIdRef.current) {
          activeCenterIdRef.current = hitPhoto.id;
          setCenterPhoto(hitPhoto);
        }
      }
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
        updateCenterPhoto();
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
    let touchStartX = 0;
    let touchStartY = 0;

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

    // Pointer events for desktop and precise taps
    const onPointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
      downTime = performance.now();
      const inside = isInsideGlobeCircle(e.clientX, e.clientY);
      controls.enabled = inside;
    };

    const onPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - downX, e.clientY - downY);
      const elapsed = performance.now() - downTime;

      // Single Click / Instant Tap: opens immediately on 1 click
      if (dist < 18 && elapsed < 380) {
        const picked = pickPhotoAtEvent(e.clientX, e.clientY);
        if (picked) {
          callbacksRef.current.onSelectPhotoFullscreen(picked);
        }
      }
      controls.enabled = true;
    };

    // Mobile touch handling: differentiate between vertical page scroll and horizontal globe spin
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        downX = touchStartX;
        downY = touchStartY;
        downTime = performance.now();
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const dx = Math.abs(e.touches[0].clientX - touchStartX);
        const dy = Math.abs(e.touches[0].clientY - touchStartY);

        // Vertical swipe on mobile: allow smooth page scroll without getting stuck
        if (dy > dx * 1.15 && dy > 8) {
          controls.enabled = false;
          return;
        }

        // Horizontal swipe: rotate the 3D globe
        if (dx > dy * 1.15 && dx > 8) {
          controls.enabled = true;
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 1) {
        const t = e.changedTouches[0];
        const dist = Math.hypot(t.clientX - downX, t.clientY - downY);
        const elapsed = performance.now() - downTime;

        // Instant 1-tap photo opening on mobile
        if (dist < 18 && elapsed < 380) {
          const picked = pickPhotoAtEvent(t.clientX, t.clientY);
          if (picked) {
            callbacksRef.current.onSelectPhotoFullscreen(picked);
          }
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
    domElem.addEventListener('pointerup', onPointerUp);
    domElem.addEventListener('touchstart', onTouchStart, { passive: true });
    domElem.addEventListener('touchmove', onTouchMove, { passive: true });
    domElem.addEventListener('touchend', onTouchEnd, { passive: true });
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
    updateCenterPhoto();

    return () => {
      isDisposed = true;
      window.removeEventListener('resize', handleResize);
      controls.removeEventListener('change', requestRender);
      domElem.removeEventListener('pointerdown', onPointerDown, { capture: true });
      domElem.removeEventListener('pointerup', onPointerUp);
      domElem.removeEventListener('touchstart', onTouchStart);
      domElem.removeEventListener('touchmove', onTouchMove);
      domElem.removeEventListener('touchend', onTouchEnd);
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

        {/* Center Optical Reticle */}
        <div
          aria-hidden="true"
          className="absolute pointer-events-none w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[#d48c29]/50 flex items-center justify-center z-15 shadow-[0_0_20px_rgba(212,140,41,0.25)]"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#d48c29]/70" />
        </div>

        {/* 3D WebGL Canvas */}
        <div
          ref={canvasMountRef}
          data-testid="orb-globe-canvas"
          data-default-zoom="80%"
          className="w-full h-full cursor-grab active:cursor-grabbing"
        />

        {/* Floating Center Photo Capsule Button: Updates as the Globe Spins */}
        {centerPhoto && (
          <div className="absolute bottom-6 sm:bottom-8 inset-x-0 flex justify-center z-20 pointer-events-auto px-4">
            <button
              type="button"
              onClick={() => callbacksRef.current.onSelectPhotoFullscreen(centerPhoto)}
              aria-label={`Open ${centerPhoto.title} in full screen`}
              className="px-5 py-2.5 rounded-full bg-[#14110f]/90 border border-[#d48c29]/70 backdrop-blur-md text-[#ebe0cc] shadow-2xl flex items-center gap-2.5 hover:bg-[#d48c29] hover:text-[#14110f] transition-all cursor-pointer group"
            >
              <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-ping" />
              <span className="font-serif font-medium text-xs sm:text-sm tracking-wide group-hover:text-[#14110f] transition-colors truncate max-w-[220px] sm:max-w-md">
                {centerPhoto.title}
              </span>
              <span className="text-[11px] font-sans text-[#c8a97e] group-hover:text-[#14110f] transition-colors border-l border-[#c8a97e]/40 pl-2">
                Click to View
              </span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
