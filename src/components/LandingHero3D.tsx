import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Camera, ChevronDown, ChevronUp, Compass, Sparkles, Layers } from 'lucide-react';

interface LandingHero3DProps {
  onEnterPortfolio: () => void;
  onOpenOrbGlobe: () => void;
  cachedCount: number;
  totalPhotos: number;
}

type CameraFinish = 'obsidian-gold' | 'titanium-silver' | 'heritage-bronze';
type CameraAnglePreset = 'signature' | 'lens-macro' | 'orbital-top';

export const LandingHero3D: React.FC<LandingHero3DProps> = ({
  onEnterPortfolio,
  onOpenOrbGlobe,
  cachedCount,
  totalPhotos,
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const [finish, setFinish] = useState<CameraFinish>('obsidian-gold');
  const [anglePreset, setAnglePreset] = useState<CameraAnglePreset>('signature');
  const [explodedAmount, setExplodedAmount] = useState<number>(0);
  const [hudCollapsed, setHudCollapsed] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  const stateRef = useRef({
    finish: 'obsidian-gold' as CameraFinish,
    anglePreset: 'signature' as CameraAnglePreset,
    explodedAmount: 0,
    requestRender: () => {},
  });

  useEffect(() => {
    stateRef.current.finish = finish;
    stateRef.current.anglePreset = anglePreset;
    stateRef.current.explodedAmount = explodedAmount;
    stateRef.current.requestRender();
  }, [finish, anglePreset, explodedAmount]);

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // 1. Software WebGL detection per threejs skill
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
    const height = container.clientHeight || 560;
    const mobileZoomMult = width < 600 ? 1.32 : 1.0;

    const scene = new THREE.Scene();
    const bgHex = 0x09090b;
    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.FogExp2(bgHex, 0.045);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(3.2 * mobileZoomMult, 2.0 * mobileZoomMult, 5.4 * mobileZoomMult);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Studio Environment Map (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3. Balanced Warm/Cool Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x18181b, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffedd5, 2.6);
    keyLight.position.set(5, 7, 5);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 20;
      const d = 5;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xf59e0b, 1.8);
    rimLight.position.set(-5, 3, -4);
    scene.add(rimLight);

    // 4. Procedural Knurled Bump Texture for Camera Grip & Lens Rings
    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 128;
    bumpCanvas.height = 128;
    const bCtx = bumpCanvas.getContext('2d')!;
    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, 128, 128);
    bCtx.fillStyle = '#ffffff';
    for (let y = 0; y < 128; y += 8) {
      for (let x = 0; x < 128; x += 8) {
        if ((x + y) % 16 === 0) bCtx.fillRect(x, y, 4, 4);
      }
    }
    const knurlTexture = new THREE.CanvasTexture(bumpCanvas);
    knurlTexture.wrapS = THREE.RepeatWrapping;
    knurlTexture.wrapT = THREE.RepeatWrapping;
    knurlTexture.repeat.set(8, 4);

    // 5. Composite 10-Part Procedural 3D Cinema Rangefinder Camera & Orbital Gallery Sculpture
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.72,
      metalness: 0.25,
      bumpMap: knurlTexture,
      bumpScale: 0.015,
    });

    const metalTrimMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b,
      roughness: 0.2,
      metalness: 0.92,
      clearcoat: 0.4,
    });

    const darkAlloyMaterial = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.35,
      metalness: 0.85,
    });

    const lensGlassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      roughness: 0.08,
      metalness: 0.1,
      transmission: isSoftwareGl ? 0 : 0.92,
      transparent: true,
      opacity: isSoftwareGl ? 0.55 : 1,
      ior: 1.65,
      clearcoat: 1.0,
    });

    // Part 1: Primary Beveled Rangefinder Body (ExtrudeGeometry)
    const bodyShape = new THREE.Shape();
    const bw = 2.5;
    const bh = 1.45;
    const br = 0.22;
    bodyShape.moveTo(-bw / 2 + br, -bh / 2);
    bodyShape.lineTo(bw / 2 - br, -bh / 2);
    bodyShape.quadraticCurveTo(bw / 2, -bh / 2, bw / 2, -bh / 2 + br);
    bodyShape.lineTo(bw / 2, bh / 2 - br);
    bodyShape.quadraticCurveTo(bw / 2, bh / 2, bw / 2 - br, bh / 2);
    bodyShape.lineTo(-bw / 2 + br, bh / 2);
    bodyShape.quadraticCurveTo(-bw / 2, bh / 2, -bw / 2, bh / 2 - br);
    bodyShape.lineTo(-bw / 2, -bh / 2 + br);
    bodyShape.quadraticCurveTo(-bw / 2, -bh / 2, -bw / 2 + br, -bh / 2);

    const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, {
      depth: 0.9,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.06,
      bevelThickness: 0.06,
    });
    bodyGeo.center();
    const cameraBodyMesh = new THREE.Mesh(bodyGeo, bodyMaterial);
    cameraBodyMesh.castShadow = !isSoftwareGl;
    cameraBodyMesh.receiveShadow = !isSoftwareGl;
    rootGroup.add(cameraBodyMesh);

    // Part 2: Brushed Metallic Top Plate
    const topPlateGeo = new THREE.BoxGeometry(2.52, 0.24, 0.96);
    const topPlateMesh = new THREE.Mesh(topPlateGeo, metalTrimMaterial);
    topPlateMesh.position.set(0, 0.78, 0);
    rootGroup.add(topPlateMesh);

    // Part 3: Ergonomic Right Hand Grip
    const gripGeo = new THREE.CylinderGeometry(0.28, 0.28, 1.48, 24);
    const gripMesh = new THREE.Mesh(gripGeo, bodyMaterial);
    gripMesh.position.set(1.12, -0.02, 0.22);
    rootGroup.add(gripMesh);

    // Part 4: Stepped Prime Lens Barrel (LatheGeometry)
    const lathePoints = [
      new THREE.Vector2(0.0, 0),
      new THREE.Vector2(0.76, 0),
      new THREE.Vector2(0.76, 0.35),
      new THREE.Vector2(0.68, 0.38),
      new THREE.Vector2(0.68, 0.78),
      new THREE.Vector2(0.72, 0.82),
      new THREE.Vector2(0.72, 1.05),
      new THREE.Vector2(0.58, 1.05),
      new THREE.Vector2(0.58, 0.2),
    ];
    const lensBarrelGeo = new THREE.LatheGeometry(lathePoints, 36);
    lensBarrelGeo.rotateX(Math.PI / 2);
    const lensBarrelMesh = new THREE.Mesh(lensBarrelGeo, darkAlloyMaterial);
    lensBarrelMesh.position.set(-0.1, -0.04, 0.48);
    rootGroup.add(lensBarrelMesh);

    // Part 5: Golden Focus & Aperture Ring on Lens
    const focusRingGeo = new THREE.TorusGeometry(0.71, 0.045, 16, 48);
    const focusRingMesh = new THREE.Mesh(focusRingGeo, metalTrimMaterial);
    focusRingMesh.position.set(-0.1, -0.04, 0.98);
    rootGroup.add(focusRingMesh);

    // Part 6: Front Sapphire Optical Glass Element
    const glassGeo = new THREE.SphereGeometry(0.56, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.38);
    glassGeo.rotateX(Math.PI / 2);
    const glassMesh = new THREE.Mesh(glassGeo, lensGlassMaterial);
    glassMesh.position.set(-0.1, -0.04, 1.25);
    rootGroup.add(glassMesh);

    // Part 7 & 8: Tactile Shutter Speed Dial & ISO Dial + Red Release Button
    const dialGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.16, 28);
    const shutterDial = new THREE.Mesh(dialGeo, darkAlloyMaterial);
    shutterDial.position.set(0.68, 0.96, 0.08);
    rootGroup.add(shutterDial);

    const isoDial = new THREE.Mesh(dialGeo, metalTrimMaterial);
    isoDial.position.set(-0.75, 0.96, 0.08);
    rootGroup.add(isoDial);

    const releaseBtnGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.1, 16);
    const releaseBtnMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.25, metalness: 0.6 });
    const releaseBtn = new THREE.Mesh(releaseBtnGeo, releaseBtnMat);
    releaseBtn.position.set(0.68, 1.06, 0.08);
    rootGroup.add(releaseBtn);

    // Part 9: Optical Rangefinder Viewfinder Housing
    const vfGeo = new THREE.BoxGeometry(0.75, 0.34, 0.72);
    const vfMesh = new THREE.Mesh(vfGeo, darkAlloyMaterial);
    vfMesh.position.set(-0.1, 0.98, -0.04);
    rootGroup.add(vfMesh);

    // Part 10: Orbital Floating Golden Aperture Ring & 5 Mood Frame Cards
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    const outerHaloGeo = new THREE.TorusGeometry(2.35, 0.018, 12, 72);
    const outerHaloMesh = new THREE.Mesh(outerHaloGeo, metalTrimMaterial);
    outerHaloMesh.rotation.x = Math.PI * 0.38;
    outerHaloMesh.rotation.y = Math.PI * 0.12;
    orbitGroup.add(outerHaloMesh);

    const frameColors = [0xf59e0b, 0xfb7185, 0x38bdf8, 0xc084fc, 0x34d399];
    const floatingFrames: THREE.Mesh[] = [];
    const frameGeo = new THREE.BoxGeometry(0.68, 0.48, 0.03);
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const fMat = new THREE.MeshPhysicalMaterial({
        color: frameColors[i],
        roughness: 0.22,
        metalness: 0.4,
        clearcoat: 0.8,
      });
      const fMesh = new THREE.Mesh(frameGeo, fMat);
      fMesh.position.set(Math.cos(angle) * 2.55, Math.sin(angle * 2) * 0.45, Math.sin(angle) * 2.55);
      fMesh.lookAt(0, 0, 0);
      orbitGroup.add(fMesh);
      floatingFrames.push(fMesh);
    }

    // 6. Grounding Contact Shadow Disc (y = floorY + 0.015, depthWrite: false)
    const floorY = -1.35;
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d')!;
    const sGrad = sCtx.createRadialGradient(64, 64, 8, 64, 64, 60);
    sGrad.addColorStop(0, 'rgba(0,0,0,0.68)');
    sGrad.addColorStop(1, 'rgba(0,0,0,0)');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 128, 128);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);

    const shadowPlane = new THREE.Mesh(
      new THREE.CircleGeometry(2.6, 32),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.65 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = floorY + 0.015;
    scene.add(shadowPlane);

    // Subtle Pedestal Ring on Floor
    const pedestalRing = new THREE.Mesh(
      new THREE.RingGeometry(1.75, 1.82, 48),
      new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.28,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      })
    );
    pedestalRing.rotation.x = -Math.PI / 2;
    pedestalRing.position.y = floorY + 0.025;
    scene.add(pedestalRing);

    // 7. OrbitControls & On-Demand Render Loop
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 2.8;
    controls.maxDistance = 8.5;
    controls.maxPolarAngle = Math.PI * 0.56;
    controls.target.set(0, 0.05, 0);

    let userInteracting = false;
    controls.addEventListener('start', () => {
      userInteracting = true;
    });

    const targetCamPos = new THREE.Vector3(3.2, 2.1, 5.4);

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

    function applyStateUpdates() {
      const st = stateRef.current;

      // Apply finish preset
      if (st.finish === 'obsidian-gold') {
        bodyMaterial.color.setHex(0x18181b);
        metalTrimMaterial.color.setHex(0xf59e0b);
      } else if (st.finish === 'titanium-silver') {
        bodyMaterial.color.setHex(0x27272a);
        metalTrimMaterial.color.setHex(0xe4e4e7);
      } else {
        bodyMaterial.color.setHex(0x291d12);
        metalTrimMaterial.color.setHex(0xd97706);
      }

      // Apply exploded view separation smoothly
      const exp = st.explodedAmount;
      topPlateMesh.position.y = THREE.MathUtils.lerp(0.78, 1.25, exp);
      lensBarrelMesh.position.z = THREE.MathUtils.lerp(0.48, 1.15, exp);
      focusRingMesh.position.z = THREE.MathUtils.lerp(0.98, 1.88, exp);
      glassMesh.position.z = THREE.MathUtils.lerp(1.25, 2.35, exp);
      vfMesh.position.y = THREE.MathUtils.lerp(0.98, 1.55, exp);

      // Apply camera angle preset if user hasn't overridden with manual drag
      if (!userInteracting) {
        const mult = ((container ? container.clientWidth : 0) || window.innerWidth) < 600 ? 1.32 : 1.0;
        if (st.anglePreset === 'signature') {
          targetCamPos.set(3.2 * mult, 2.0 * mult, 5.4 * mult);
        } else if (st.anglePreset === 'lens-macro') {
          targetCamPos.set(-0.6 * mult, 0.35 * mult, 3.8 * mult);
        } else {
          targetCamPos.set(0.2 * mult, 5.2 * mult, 3.2 * mult);
        }
        camera.position.lerp(targetCamPos, isSoftwareGl ? 1 : 0.18);
      }
    }

    function requestRender() {
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        renderDirty = false;
        applyStateUpdates();
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

    stateRef.current.requestRender = () => {
      userInteracting = false;
      requestRender();
    };

    controls.addEventListener('change', requestRender);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || 560;
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
      window.removeEventListener('resize', handleResize);
      controls.removeEventListener('change', requestRender);
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <section
      aria-label="Srinath 3D Landing Sequence"
      className="relative w-full border-b border-zinc-800/80 bg-[#09090b] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10">
        {/* Split-Screen Hero per Portfolio Design Guidelines */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Editorial Introduction of Srinath & Specialty */}
          <div className="lg:col-span-5 flex flex-col justify-between py-2 lg:py-6 z-10">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-amber-400 tracking-wide">
                <span>SRINATH VISUAL ARCHIVE</span>
                <span aria-hidden="true">·</span>
                <span>3D INTERACTIVE PORTFOLIO</span>
              </div>

              <h1
                className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.06]"
                style={{ textWrap: 'balance' }}
              >
                Capturing Raw Human Emotion in Three Dimensions.
              </h1>

              <p className="mt-5 text-base text-zinc-300 leading-relaxed max-w-xl">
                I am <strong className="text-white font-semibold">Srinath</strong> — a visual storyteller specializing in sacred marriages, candid friendships, electric celebrations, and timeless human portraiture. Filter my 50-frame archive simply by how you feel today, flip through frames like phone tabs, or spin the 3D Orb Globe.
              </p>
            </div>

            {/* Primary Actions */}
            <div className="mt-8 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onEnterPortfolio}
                  className="min-h-[48px] px-6 py-3 rounded-xl bg-amber-500 text-black font-semibold text-sm hover:bg-amber-400 active:scale-[0.99] transition-all flex items-center gap-2 whitespace-nowrap shrink-0 shadow-lg shadow-amber-500/10"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Filter Portfolio by Mood</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenOrbGlobe}
                  className="min-h-[48px] px-5 py-3 rounded-xl bg-zinc-900 text-zinc-100 border border-zinc-700 font-medium text-sm hover:bg-zinc-800 hover:border-zinc-500 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
                >
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>Launch 3D Orb Globe</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono-tabular">
                <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{totalPhotos} Curated Frames</span>
                <span aria-hidden="true">·</span>
                <span>5 Emotion Moods</span>
                <span aria-hidden="true">·</span>
                <span>{cachedCount}/{totalPhotos} Offline Ready</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 3D Rangefinder Camera & Orbital Frames Viewport */}
          <div className="lg:col-span-7 relative min-h-[380px] sm:min-h-[460px] lg:min-h-[520px] rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden flex flex-col">
            {/* Minimal Top-Left Spec Kicker */}
            <div className="absolute top-3 left-4 z-10 pointer-events-none flex items-center gap-2 text-xs text-zinc-300 bg-zinc-950/85 px-3 py-1.5 rounded-lg border border-zinc-800">
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Srinath Signature 3D Optical Rig · Drag to Orbit</span>
            </div>

            {/* Dedicated Empty WebGL Mount Ref (No sibling clutter inside) */}
            <div
              ref={canvasMountRef}
              data-testid="landing-3d-canvas"
              className="w-full flex-1 min-h-[380px] sm:min-h-[460px] cursor-grab active:cursor-grabbing"
            />

            {/* Collapsible Bottom Control Dock (Zero backdrop-filter over WebGL per threejs skill) */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 w-[94%] max-w-xl flex flex-col items-center">
              <button
                type="button"
                onClick={() => setHudCollapsed((prev) => !prev)}
                className="min-h-[36px] px-3 py-1 rounded-t-lg bg-zinc-900 border border-b-0 border-zinc-700 text-[11px] font-medium text-zinc-300 hover:text-white flex items-center gap-1 whitespace-nowrap"
                aria-expanded={!hudCollapsed}
              >
                {hudCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <span>{hudCollapsed ? 'Show 3D Camera Controls' : 'Hide 3D Controls'}</span>
              </button>

              {!hudCollapsed && (
                <div className="w-full rounded-xl bg-zinc-900/95 border border-zinc-700 p-3 shadow-xl flex flex-wrap items-center justify-between gap-3">
                  {/* Camera Angle Presets */}
                  <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                    {(['signature', 'lens-macro', 'orbital-top'] as CameraAnglePreset[]).map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAnglePreset(preset)}
                        className={`min-h-[34px] px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                          anglePreset === preset
                            ? 'bg-amber-500 text-black font-semibold'
                            : 'text-zinc-300 hover:text-white'
                        }`}
                      >
                        {preset === 'signature' ? '3/4 Studio' : preset === 'lens-macro' ? 'Optics Macro' : 'Top Orbit'}
                      </button>
                    ))}
                  </div>

                  {/* Finish Switcher */}
                  <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                    {(['obsidian-gold', 'titanium-silver', 'heritage-bronze'] as CameraFinish[]).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setFinish(item)}
                        className={`min-h-[34px] px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                          finish === item
                            ? 'bg-zinc-800 text-amber-400 border border-amber-500/40'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {item === 'obsidian-gold' ? 'Gold' : item === 'titanium-silver' ? 'Titanium' : 'Bronze'}
                      </button>
                    ))}
                  </div>

                  {/* Exploded Lens Slider */}
                  <label className="flex items-center gap-2 text-xs text-zinc-300 whitespace-nowrap">
                    <span>Explode Optics</span>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={explodedAmount}
                      onChange={(e) => setExplodedAmount( parseFloat(e.target.value) )}
                      className="w-20 accent-amber-500 cursor-pointer"
                      aria-label="Explode 3D camera optics"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full-Width Key Metrics & Specialty Strip Below the Split */}
        <div className="mt-8 pt-6 border-t border-zinc-800/80 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono-tabular">50 Frames</div>
            <div className="mt-1 text-xs text-zinc-400">Emotion-Indexed Visual Catalog · Instant Mood Match</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono-tabular">360° Orb</div>
            <div className="mt-1 text-xs text-zinc-400">Interactive Spherical Gallery · Tap or Hold to Expand</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono-tabular">0ms Cache</div>
            <div className="mt-1 text-xs text-zinc-400">Offline PWA Storage · Instant Touch Deck Transitions</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono-tabular">480+ Shoots</div>
            <div className="mt-1 text-xs text-zinc-400">Marriages, Friendships, Sangeet & Fine-Art Portraits</div>
          </div>
        </div>
      </div>
    </section>
  );
};
