import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

const BreathingBackground = ({ phase, seconds }) => {
  const mountRef = useRef(null);

  // 1. Controls Size (Expansion)
  const breathValue = useRef({ value: 0.2 });

  // 2. Controls Wiggle Speed (Liquid Motion)
  const speedValue = useRef({ value: 1.0 });

  // Internal time tracker to allow slowing down time
  const localTime = useRef(0);

  const materialRef = useRef(null);
  const prevPhase = useRef(null);

  useEffect(() => {
    // --- SETUP ---
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.zIndex = "0";

    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    // --- SHADER ---
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float u_time;
      uniform float u_breath;
      uniform vec2 u_resolution;

      float random (in vec2 _st) {
        return fract(sin(dot(_st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }
      float noise (in vec2 _st) {
        vec2 i = floor(_st);
        vec2 f = fract(_st);
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        
        // Distortion based on u_time
        float distortion = noise(st * 2.5 + u_time * 0.2) * 0.2;
        float dist = distance(st + distortion, vec2(0.5));
        
        float radius = 0.15 + (u_breath * 0.95);
        float mask = smoothstep(radius, radius - 0.5, dist);

        vec3 colorBg = vec3(1.0, 1.0, 1.0); 
        vec3 colorBreath = vec3(0.7, 0.85, 1.0); 

        vec3 finalColor = mix(colorBg, colorBreath, mask);
        float grain = random(st * u_time) * 0.02;

        gl_FragColor = vec4(finalColor - grain, 1.0);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        u_time: { value: 0 },
        u_breath: { value: 0.2 },
        u_resolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
      },
    });
    materialRef.current = material;

    const geometry = new THREE.PlaneGeometry(2, 2);
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    // --- RENDER LOOP WITH TIME SCALING ---
    const clock = new THREE.Clock();
    const animate = () => {
      // Instead of raw time, we add (delta * speed)
      // This lets us "slow down time" during holds
      const delta = clock.getDelta();
      localTime.current += delta * speedValue.current.value;

      material.uniforms.u_time.value = localTime.current;
      material.uniforms.u_breath.value = breathValue.current.value;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      material.uniforms.u_resolution.value.set(
        window.innerWidth,
        window.innerHeight
      );
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  // --- ANIMATION LOGIC ---
  useEffect(() => {
    // 1. Define Helper Functions
    const startCalmLoop = () => {
      gsap.killTweensOf(breathValue.current);
      gsap.fromTo(
        breathValue.current,
        { value: 0.2 },
        { value: 0.65, duration: 6, ease: "sine.inOut", yoyo: true, repeat: -1 }
      );
      // Ensure liquid moves at normal speed
      gsap.to(speedValue.current, { value: 1.0, duration: 2 });
    };

    // 2. First Load
    if (prevPhase.current === null && phase === "rest") {
      startCalmLoop();
      prevPhase.current = phase;
      return;
    }

    // 3. Phase Changes
    if (phase !== prevPhase.current) {
      if (prevPhase.current === "hold" && phase === "rest") {
        // HOLD -> REST (Release)
        gsap.killTweensOf(breathValue.current);
        // Exhale
        gsap.fromTo(
          breathValue.current,
          { value: 1.0 },
          {
            value: 0.2,
            duration: 8,
            ease: "power2.out",
            onComplete: startCalmLoop,
          }
        );
        // Speed up the liquid again
        gsap.to(speedValue.current, { value: 1.0, duration: 2 });
      } else if (phase === "hold") {
        // REST -> HOLD (Freeze)
        gsap.killTweensOf(breathValue.current);
        // Expand to full
        gsap.to(breathValue.current, {
          value: 1.0,
          duration: 1,
          ease: "power2.out",
        });
        // ❄️ FREEZE THE LIQUID (Slow it down to 10%)
        gsap.to(speedValue.current, {
          value: 0.1,
          duration: 1.5,
          ease: "power2.out",
        });
      }

      prevPhase.current = phase;
    }

    // 4. "Deep Breath" Warning (6 seconds left)
    if (phase === "rest" && seconds === 6) {
      gsap.killTweensOf(breathValue.current);
      gsap.to(breathValue.current, {
        value: 1.0,
        duration: 6,
        ease: "sine.inOut",
      });
      // Keep speed normal during inhale
      gsap.to(speedValue.current, { value: 1.0, duration: 1 });
    }
  }, [phase, seconds]);

  return (
    <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-none" />
  );
};

export default BreathingBackground;
