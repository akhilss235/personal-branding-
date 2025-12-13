"use client";
import React, { useEffect, useRef } from "react";
import Header from "../component/Header";
import Home_template from "../component/Home/Home_template";

import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";
import "./globals.css";

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mixersRef = useRef<THREE.AnimationMixer[]>([]);

  function getScrollProgress() {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const scrollHeight = doc.scrollHeight - doc.clientHeight;
    return scrollHeight <= 0 ? 0 : Math.min(Math.max(scrollTop / scrollHeight, 0), 1);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    /** SETUP RENDERER + SCENE + CAMERA **/
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 150);
    camera.position.set(0, 1.2, 7.5);
scene.fog = new THREE.FogExp2(0x003b73, 0.035); // ocean water fog

    /** LIGHTS **/
scene.add(new THREE.HemisphereLight(0x4ecbff, 0x001e2d, 0.85));  // soft blue top, dark deep blue bottom

const key = new THREE.DirectionalLight(0x7feaff, 0.55); 
key.position.set(-2.5, 4.5, 3);
scene.add(key);


    /** BACKGROUND **/
    const bg = new THREE.Mesh(
      new THREE.PlaneGeometry(42, 22),
new THREE.MeshBasicMaterial({ color: 0x005f8f, opacity: 0.45, transparent: true })
    );
    bg.position.set(0, 2, -12);
    scene.add(bg);

    /** PARTICLES **/
    const particleCount = 1200;
    const pGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() * 2 - 1) * 12;
      positions[i * 3 + 1] = (Math.random() * 2 - 1) * 9;
      positions[i * 3 + 2] = (Math.random() * 2 - 1) * 16 - 3;
      speeds[i] = 0.004 + Math.random() * 0.014;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const points = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({ color: 0x9ef3f0, size: 0.04, opacity: 0.55, transparent: true })
    );
    scene.add(points);

    /** DIVER MODEL **/
    const diver = new THREE.Group();
    scene.add(diver);

    const loader = new GLTFLoader();
    loader.load("/models/scuba_diver.glb", (gltf) => {
      const model = gltf.scene;
      model.scale.set(1.18, 1.18, 1.18);
      model.position.set(3.5, -1, 2);
      model.rotation.y = Math.PI * 0.1;
      diver.add(model);

      if (gltf.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
        mixersRef.current.push(mixer);
      }
    });

    /** BUBBLES **/
    const bubbleCount = 600;
    const bGeo = new THREE.BufferGeometry();
    const bPos = new Float32Array(bubbleCount * 3);
    const bSeed = new Float32Array(bubbleCount);

    const setBubbleStartPos = (i: number) => {
      const i3 = i * 3;
      bPos[i3] = diver.position.x + 5.05 + (Math.random() * 2 - 1) * 0.08;
      bPos[i3 + 1] = diver.position.y + 0.7 + Math.random() * 0.6;
      bPos[i3 + 2] = diver.position.z + 0.2 + (Math.random() * 2 - 1) * 0.1;
      bSeed[i] = Math.random() * 1000;
    };
    for (let i = 0; i < bubbleCount; i++) setBubbleStartPos(i);

    bGeo.setAttribute("position", new THREE.BufferAttribute(bPos, 3));
    const bubbles = new THREE.Points(
      bGeo,
      new THREE.PointsMaterial({
        color: 0xdefefe,
        size: 0.055,
        opacity: 0.44,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    scene.add(bubbles);

    /** MOUSE INTERACTION **/
    const mouse = new THREE.Vector2(0, 0);
    window.addEventListener("mousemove", (e) => {
      // mouse.x = (e.clientX / window.innerWidth) * 1 - 0;
      // mouse.y = -(e.clientY / window.innerHeight) * 1 + 0;
    });

    /** ANIMATION LOOP **/
    let t0 = performance.now();
    function animate() {
      requestAnimationFrame(animate);
      const t = performance.now();
      const dt = Math.min(0.05, (t - t0) / 1000);
      t0 = t;

      const p = getScrollProgress();

      camera.position.y = 1.3 - p * 2.6;
      camera.position.z = 7.4 - p * 5;
      diver.position.y = 1.3 - p * 4;
      diver.position.z = 1.2 - p * 6;

      /** PARTICLE FLOAT **/
      const pos = pGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3 + 1] += speeds[i] * (1 + p * 1.6);
        if (pos[i * 3 + 1] > 8) pos[i * 3 + 1] = -6;
      }
      pGeo.attributes.position.needsUpdate = true;

      /** BUBBLE FLOAT **/
      const bp = bGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < bubbleCount; i++) {
        const id = i * 3;
        bp[id + 1] += 0.016 + Math.sin(t * 0.001 + bSeed[i]) * 0.002;
        if (bp[id + 1] > diver.position.y + 3) setBubbleStartPos(i);
      }
      bGeo.attributes.position.needsUpdate = true;

      /** MOUSE HOVER SWIM EFFECT **/
      diver.rotation.y += (mouse.x * 0.6 - diver.rotation.y) * 0.04;
      diver.position.x += (mouse.x * 1.5 - diver.position.x) * 0.015;
      diver.rotation.z = Math.sin(t * 0.0015) * 0.06;

      mixersRef.current.forEach((m) => m.update(dt));
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      renderer.dispose();
    };
  }, []);

  return (
    <>
      <div id="stage" className="fixed inset-0 z-0 pointer-events-none">
        <canvas ref={canvasRef} />
      </div>

      <aside><Header /></aside>

      <main className="shell container relative z-10">
        <section id="top" className="min-h-[100vh] flex items-center py-20">
          <Home_template />
        </section>
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

      <style 
      jsx global>{`
  body {
   background: linear-gradient(180deg, #000 0%, #031411 18%, #061f1b 45%, #05231f 65%, #021311 100%);
    color: #fff;
    margin: 0;
    overflow-x: hidden;
  }
  canvas { width:100vw; height:100vh; display:block; }

  
      `}</style>
    </>
  );
}
