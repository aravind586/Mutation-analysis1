// SplashScreen.jsx
import React, { useEffect, useState, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";

// 3D
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Center } from "@react-three/drei";
import { EffectComposer, Bloom, DepthOfField } from "@react-three/postprocessing";

/** --------------------------------
 * DNA model that auto-fits the pane
 * -------------------------------- */
function DNAModelScene() {
    const { scene } = useGLTF("/models/dna.glb");
    const group = useRef();

    // Auto-scale the imported model to a target height (so it always fits)
    useEffect(() => {
        if (!scene || !group.current) return;

        // Enable shadows (if the model supports it)
        scene.traverse((o) => {
            if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;
            }
        });

        // Compute bounding box size and scale to target height
        const box = new THREE.Box3().setFromObject(scene);
        const size = new THREE.Vector3();
        box.getSize(size);

        const targetHeight = 4; // world units to fit nicely in left column
        const scale = size.y > 0 ? targetHeight / size.y : 1;

        group.current.scale.setScalar(scale);
        // Slight initial offset for composition
        group.current.position.set(0, 0.2, 0);
    }, [scene]);

    // Animate (rotate + drift downward, loop)
    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        if (group.current) {
            group.current.rotation.y = t * 0.25;
            // drift down and loop smoothly in a short range
            const range = 0.8; // total vertical travel
            group.current.position.y = 0.2 - (t * 0.2) % range;
        }
    });

    return (
        <group ref={group}>
            {/* Center recenters model origin; we still control final scale/position on parent group */}
            <Center disableZ>
                <primitive object={scene} />
            </Center>
        </group>
    );
}
useGLTF.preload("/models/dna.glb");

/** --------------------------------
 * Splash Screen
 * -------------------------------- */
export default function SplashScreen({ onFinish, duration = 4000 }) {
    const [visible, setVisible] = useState(true);
    const [mutated, setMutated] = useState(false);

    useEffect(() => {
        // Flip the status text halfway for a bit of “story”
        const story = setTimeout(() => setMutated(true), Math.min(1200, duration - 600));
        const t = setTimeout(() => {
            setVisible(false);
            onFinish?.();
        }, duration);
        return () => {
            clearTimeout(t);
            clearTimeout(story);
        };
    }, [duration, onFinish]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="fixed inset-0 z-[9999] bg-white text-slate-900"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2">
                        {/* LEFT: 3D DNA */}
                        <div className="relative w-full h-full bg-white">
                            <Canvas
                                shadows
                                dpr={[1, 2]}
                                camera={{ position: [0.9, 0.6, 3.2], fov: 45 }}
                            >
                                <ambientLight intensity={0.7} />
                                <directionalLight
                                    position={[3, 3, 4]}
                                    intensity={1.2}
                                    castShadow
                                    shadow-mapSize={1024}
                                />
                                <directionalLight position={[-4, 2, -2]} intensity={0.5} />

                                <Suspense
                                    fallback={null /* you can add a minimal loader if desired */}
                                >
                                    <DNAModelScene />
                                    <OrbitControls
                                        makeDefault
                                        enableZoom={false}
                                        enablePan={false}
                                        autoRotate
                                        autoRotateSpeed={0.4}
                                    />
                                    <EffectComposer multisampling={4}>
                                        <Bloom
                                            intensity={0.35}
                                            luminanceThreshold={0.2}
                                            luminanceSmoothing={0.2}
                                        />
                                        <DepthOfField
                                            focusDistance={0.01}
                                            focalLength={0.02}
                                            bokehScale={1.2}
                                        />
                                    </EffectComposer>
                                </Suspense>
                            </Canvas>

                            {/* Subtle overlay grid */}
                            <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background:radial-gradient(circle_at_1px_1px,#1e3a8a_1px,transparent_1px)] [background-size:22px_22px]" />
                        </div>

                        {/* RIGHT: Brand + Micro-copy */}
                        <div className="relative flex h-full w-full items-center justify-center">
                            <div className="max-w-lg px-8">
                                <motion.h1
                                    initial={{ y: 24, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.7, ease: "easeOut", delay: 0.4 }}
                                    className="text-5xl md:text-6xl font-extrabold tracking-tight text-[#0B63F6]"
                                >
                                    Mutation Analysis<span className="text-slate-800"></span>
                                </motion.h1>

                                <motion.p
                                    initial={{ y: 16, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.7, ease: "easeOut", delay: 0.7 }}
                                    className="mt-4 text-base md:text-lg text-slate-600"
                                >
                                    See Beyond the Microscope — Diagnose with Precision
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.1, duration: 0.5 }}
                                    className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm"
                                >
                                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
                                    <span className="text-sm font-medium text-slate-700">
                                        {mutated ? "SNV detected • Evo2 analyzing…" : "Initializing…"}
                                    </span>
                                </motion.div>

                                {/* Bottom progress bar */}
                                <motion.div
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{
                                        duration: (duration - 400) / 1000,
                                        ease: "easeInOut",
                                        delay: 0.2,
                                    }}
                                    className="mt-8 h-1 origin-left rounded-full bg-gradient-to-r from-slate-200 via-blue-400 to-blue-600"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
