"use client";
import React, { useEffect, useRef, useState } from "react";
import Header from "../component/Header";
import Home_template from "../component/Home/Home_template";

import * as THREE from "three";
import "./globals.css";

// Place this file at /app/page.jsx in a Next.js 14 (App Router) project.
// Requires: TailwindCSS configured in the project.

export default function Page() {
  const canvasRef = useRef(null);
  const [soundOn, setSoundOn] = useState(false);

  // Refs for HUD
  const hudDepthRef = useRef(null);
  const hudLayerRef = useRef(null);
  const hudMeterRef = useRef(null);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.classList.add("in");
        }
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // HUD + scroll progress
  const layers = [
    { id: "top", name: "Surface", depth: 0 },
    { id: "about", name: "The diver-guide", depth: 5 },
    { id: "capabilities", name: "Depth layers", depth: 15 },
    { id: "work", name: "Selected work", depth: 35 },
    { id: "experience", name: "Roles & discipline", depth: 55 },
    { id: "frameworks", name: "Frameworks", depth: 75 },
    { id: "story", name: "Philosophy", depth: 90 },
    { id: "contact", name: "Start a dive", depth: 100 },
  ];

  function getScrollProgress() {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const scrollHeight = doc.scrollHeight - doc.clientHeight;
    return scrollHeight <= 0 ? 0 : Math.min(Math.max(scrollTop / scrollHeight, 0), 1);
  }

  useEffect(() => {
    function updateHUD() {
      const p = getScrollProgress();
      const depth = Math.round(p * 100);
      let active = layers[0];
      for (const l of layers) {
        const el = document.getElementById(l.id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= window.innerHeight * 0.33) active = l;
      }
    }

    window.addEventListener("scroll", updateHUD, { passive: true });
    window.addEventListener("resize", updateHUD);
    updateHUD();
    return () => {
      window.removeEventListener("scroll", updateHUD);
      window.removeEventListener("resize", updateHUD);
    };
  }, []);
  // Three.js scene setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 120);
    camera.position.set(0, 1.2, 7.5);

    const hemi = new THREE.HemisphereLight(0x2fe6d6, 0x04110f, 0.7);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0x9ef8f0, 0.55);
    key.position.set(-2.5, 4.5, 3);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xC9A24D, 0.16);
    rim.position.set(4.5, 1.8, -3.5);
    scene.add(rim);
    scene.fog = new THREE.FogExp2(0x04110f, 0.10);

    const bgGeo = new THREE.PlaneGeometry(40, 22);
    const bgMat = new THREE.MeshBasicMaterial({ color: 0x06231f, transparent: true, opacity: 0.55 });
    const bg = new THREE.Mesh(bgGeo, bgMat);
    bg.position.set(0, 1.2, -10);
    scene.add(bg);

    const beamGeo = new THREE.PlaneGeometry(18, 7);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0x2fe6d6, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(5.5, 3.5, 0.5);
    beam.rotation.z = 1.18;
    scene.add(beam);
    const particleCount = prefersReducedMotion ? 400 : 1100;
    const pGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() * 2 - 1) * 12;
      positions[i * 3 + 1] = (Math.random() * 2 - 1) * 8 + 1.2;
      positions[i * 3 + 2] = (Math.random() * 2 - 1) * 16 - 2;
      speeds[i] = 0.003 + Math.random() * 0.012;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x8ef7ee, size: 0.035, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending });
    const points = new THREE.Points(pGeo, pMat);
    scene.add(points);
    // Diver group
    const diver = new THREE.Group();
    scene.add(diver);
    const matSuit = new THREE.MeshStandardMaterial({ color: 0x061512, roughness: 0.45, metalness: 0.02 });
    const matAqua = new THREE.MeshStandardMaterial({ color: 0x2fe6d6, roughness: 0.35, metalness: 0.06, emissive: 0x0a3a34, emissiveIntensity: 0.35 });
    const matGold = new THREE.MeshStandardMaterial({ color: 0xC9A24D, roughness: 0.32, metalness: 0.25, emissive: 0x201304, emissiveIntensity: 0.18 });
    const matGlass = new THREE.MeshPhysicalMaterial({ color: 0x0b3b33, roughness: 0.08, metalness: 0.0, transmission: 0.9, thickness: 0.8, ior: 1.25, transparent: true, opacity: 0.78 });

    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 0.7, 12, 18), matSuit);
    torso.position.set(0, 0.2, 0);
    diver.add(torso);
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 24), matGlass);
    helmet.position.set(0, 0.82, 0.04);
    diver.add(helmet);
    const visorRing = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.025, 10, 48), matGold);
    visorRing.position.copy(helmet.position);
    visorRing.rotation.x = Math.PI / 2;
    diver.add(visorRing);
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.9, 18), matSuit);
    tank.position.set(0, 0.25, -0.34);
    tank.rotation.x = 0.1;
    diver.add(tank);
    const tankStripe = new THREE.Mesh(new THREE.CylinderGeometry(0.182, 0.182, 0.16, 18), matAqua);
    tankStripe.position.copy(tank.position);
    tankStripe.position.y += 0.10;
    diver.add(tankStripe);

    const armGeo = new THREE.CapsuleGeometry(0.1, 0.45, 10, 16);
    const armL = new THREE.Mesh(armGeo, matSuit);
    armL.position.set(-0.45, 0.28, 0.05);
    armL.rotation.z = 0.65;
    diver.add(armL);
    const armR = new THREE.Mesh(armGeo, matSuit);
    armR.position.set(0.45, 0.28, 0.05);
    armR.rotation.z = -0.65;
    diver.add(armR);

    const legGeo = new THREE.CapsuleGeometry(0.12, 0.5, 10, 16);
    const legL = new THREE.Mesh(legGeo, matSuit);
    legL.position.set(-0.18, -0.52, 0.02);
    legL.rotation.z = 0.06;
    diver.add(legL);
    const legR = new THREE.Mesh(legGeo, matSuit);
    legR.position.set(0.18, -0.52, 0.02);
    legR.rotation.z = -0.06;
    diver.add(legR);

    const finGeo = new THREE.BoxGeometry(0.22, 0.08, 0.46);
    const finL = new THREE.Mesh(finGeo, matAqua);
    finL.position.set(-0.18, -0.92, 0.08);
    finL.rotation.x = 0.15;
    diver.add(finL);
    const finR = new THREE.Mesh(finGeo, matAqua);
    finR.position.set(0.18, -0.92, 0.08);
    finR.rotation.x = 0.15;
    diver.add(finR);

    const torch = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.22, 14), matGold);
    torch.position.set(0.68, 0.14, 0.15);
    torch.rotation.z = -0.45;
    diver.add(torch);

    const torchLight = new THREE.SpotLight(0x2fe6d6, 1.25, 16, Math.PI / 7, 0.55, 1.0);
    torchLight.position.set(0.7, 0.25, 0.25);
    torchLight.target.position.set(3.0, -0.4, -1.5);
    scene.add(torchLight);
    scene.add(torchLight.target);


// --- RESPONSIVE DIVER POSITION ---
function updateDiverPosition() {
  if (window.innerWidth <= 768) {          // MOBILE
    diver.position.x = 1.35;
    diver.position.y = 1.45;
    diver.position.z = 1.2;
  } else if (window.innerWidth <= 1024) {  // TABLET
    diver.position.x = 3.5;
    diver.position.y = 3.45;
    diver.position.z = 3.2;
  } else {                                 // DESKTOP
    diver.position.x = 3.35;
    diver.position.y = 1.45;
    diver.position.z = 1.2;
  }
}

// Initial call
updateDiverPosition();

// Run again on resize
window.addEventListener("resize", updateDiverPosition);


    const bubbleCount = prefersReducedMotion ? 80 : 1890;
    const bGeo = new THREE.BufferGeometry();
    const bPos = new Float32Array(bubbleCount * 3);
    const bSeed = new Float32Array(bubbleCount);
    for (let i = 0; i < bubbleCount; i++) {
      bPos[i * 3] = diver.position.x + 0.05 + (Math.random() * 2 - 1) * 0.08;
      bPos[i * 3 + 1] = diver.position.y + 0.7 + Math.random() * 2.0;
      bPos[i * 3 + 2] = diver.position.z + 0.2 + (Math.random() * 2 - 1) * 0.1;
      bSeed[i] = Math.random() * 1000;
    }
    bGeo.setAttribute("position", new THREE.BufferAttribute(bPos, 3));
    const bMat = new THREE.PointsMaterial({ color: 0xdefefe, size: 0.055, transparent: true, opacity: 0.44, depthWrite: false, blending: THREE.AdditiveBlending });
    const bubbles = new THREE.Points(bGeo, bMat);
    scene.add(bubbles);

    function onResize() {
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", onResize);

    let t0 = performance.now();

    function animate() {
      const t = performance.now();
      const dt = Math.min(0.05, (t - t0) / 1000);
      t0 = t;
      const p = getScrollProgress();

      const floatAmt = prefersReducedMotion ? 0.0 : 0.16;
      camera.position.x = Math.sin(t * 0.00025) * 0.25;
      camera.position.y = 1.25 + Math.sin(t * 0.00018) * 0.14;

      const depthY = 1.6 - p * 3.8;
      const depthZ = 1.2 - p * 5.4;

      diver.position.y = depthY + (prefersReducedMotion ? 0 : Math.sin(t * 0.0012) * floatAmt);
      diver.position.z = depthZ;

      diver.rotation.x = 0.12 + p * 0.35;
      diver.rotation.y = 0.28 + Math.sin(t * 0.00045) * 0.06;
      diver.rotation.z = 0.06 + Math.cos(t * 0.00052) * 0.05;

      torchLight.position.set(diver.position.x + 0.8, diver.position.y + 0.25, diver.position.z + 0.2);
      torchLight.target.position.set(diver.position.x + 3.6, diver.position.y - 0.7, diver.position.z - 2.4 - p * 1.8);

      scene.fog.density = 0.09 + p * 0.12;

      bgMat.opacity = 0.58 - p * 0.25;
      beamMat.opacity = (0.07 - p * 0.02) * (prefersReducedMotion ? 1 : 0.8 + 0.2 * Math.sin(t * 0.0005));

      const pos = pGeo.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3 + 1;
        pos[idx] += speeds[i] * (0.45 + p * 0.85);
        pos[i * 3] += Math.sin(t * 0.00035 + i) * 0.00045;
        if (pos[idx] > 7.2) {
          pos[idx] = -4.5;
          pos[i * 3] = (Math.random() * 2 - 1) * 12;
          pos[i * 3 + 2] = (Math.random() * 2 - 1) * 16 - 2;
        }
      }
      pGeo.attributes.position.needsUpdate = true;

      const bp = bGeo.attributes.position.array;
      for (let i = 0; i < bubbleCount; i++) {
        const i3 = i * 3;
        bp[i3 + 1] += (0.02 + p * 0.016) + (prefersReducedMotion ? 0 : Math.sin(t * 0.001 + bSeed[i]) * 0.002);
        bp[i3] += prefersReducedMotion ? 0 : Math.sin(t * 0.0014 + bSeed[i]) * 0.003;
        bp[i3 + 2] += prefersReducedMotion ? 0 : Math.cos(t * 0.0012 + bSeed[i]) * 0.002;
        if (bp[i3 + 1] > 7.5) {
          bp[i3] = diver.position.x + 0.05 + (Math.random() * 2 - 1) * 0.09;
          bp[i3 + 1] = diver.position.y + 0.72 + Math.random() * 0.4;
          bp[i3 + 2] = diver.position.z + 0.22 + (Math.random() * 2 - 1) * 0.12;
          bSeed[i] = Math.random() * 1000;
        }
      }
      bGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    animate();

    // Tint body background on scroll (simple port)
    function updateBodyTint() {
      const p = getScrollProgress();
      document.body.style.background = `\n        radial-gradient(1200px 800px at 50% 0%, rgba(47,230,214,${(0.1 - p * 0.03).toFixed(3)}), transparent 60%),\n        radial-gradient(900px 700px at 70% ${Math.round(10 + p * 60)}%, rgba(201,162,77,${(0.05 + p * 0.05).toFixed(3)}), transparent 62%),\n        linear-gradient(180deg, #000 0%, #031411 18%, #061f1b 45%, #05231f 65%, #021311 100%)\n      `;
    }
    window.addEventListener("scroll", updateBodyTint, { passive: true });
    updateBodyTint();

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", updateBodyTint);
      renderer.dispose();
    };
  }, []);




const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
    
      <div id="stage" className="pointer-events-none fixed inset-0 z-0">
        <canvas id="three" ref={canvasRef} />

        <div className="caustics" />
        <div className="grain" />
      </div>
<style jsx global>{`
  canvas, #stage canvas {
    position: absolute;
    top: 0 !important;
    right: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    display: flex;
  }
`}
</style>
      <aside >
 <Header />
      </aside>

      <main className="shell  container">
        {/* HERO (Surface) */}
<section id="top" className="min-h-[100svh] container flex items-center py-20">
  <Home_template />
</section>




        {/* Work (35m) */}
        <section id="work" className="py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4">


            <div className="reveal mt-6 cardy p-6">{/* optional banner */}</div>
          </div>
        </section>

        <section id="story" className="py-16 sm:py-20">{/* story */}</section>

        <section id="contact" className="py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4">
            <div className="glass rounded-2xl p-5 sm:p-6 border border-white/10">
              <form id="contactForm" className="mt-5 grid gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input name="name" placeholder="Your name" className="input" />
                  <input name="email" placeholder="Your email" className="input" />
                </div>
                <textarea name="message" placeholder="How can we help?" rows={6} className="input" />

                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-2">
                  <button className="btn btn-gold" type="submit">
                    <span>Generate Email</span>
                    <span className="text-white/70 text-sm">↗</span>
                  </button>
                  <div className="text-xs text-white/60">This opens your email client (no data stored here).</div>
                </div>



                <div id="toast" className="hidden mt-2 text-sm text-white/80">{/* toast placeholder */}</div>
              </form>
            </div>

          </div>
        </section>
      </main>


      <style jsx global>{`
    
        :root { font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; }
        body { margin: 0; background: linear-gradient(180deg, #000 0%, #031411 18%, #061f1b 45%, #05231f 65%, #021311 100%); color: #fff; }
        .shell { position: relative; z-index: 10; }
        .card { background: rgba(255,255,255,0.02); border-radius: 12px; }
        .btn { background: rgba(255,255,255,0.04); padding: 0.5rem 0.75rem; border-radius: 8px; }
        .btn-gold { background: linear-gradient(90deg,#caa24a,#e3c36b); color: #04110f; }
        .pill { background: rgba(255,255,255,0.03); padding: 0.25rem 0.5rem; border-radius: 999px; font-size: 12px; }
        .glass { background: rgba(255,255,255,0.02); }
        .input { background: rgba(255,255,255,0.02); padding: 0.75rem; border-radius: 8px; width: 100%; }
        .meter { height: 6px; background: rgba(255,255,255,0.03); border-radius: 999px; overflow: hidden; }
        #hudMeter { height: 100%; width: 0%; background: linear-gradient(90deg,#2fe6d6,#9ef8f0); }
        .modal-panel { max-width: 1100px; margin: 0 auto; }
        .reveal { transform: translateY(8px); opacity: 0; transition: all 520ms cubic-bezier(.2,.9,.3,1); }
        .reveal.in { transform: none; opacity: 1; }
        canvas { width: 100%; height: 100%; display: block; }
      `}</style>
    </>
  );
}
