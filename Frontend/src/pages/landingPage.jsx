import React, { useEffect, useRef, useState, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Sparkles, Environment, Float } from '@react-three/drei';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from "react-router-dom";

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// DNA Helix Component
const DNAHelix = ({ scrollProgress, stage }) => {
    const groupRef = useRef();
    const helixRef = useRef();

    useFrame(({ clock }) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = clock.getElapsedTime() * 0.2;

            // Dynamic scaling and positioning based on scroll stage
            if (stage === 1) {
                groupRef.current.scale.setScalar(2 + scrollProgress * 3);
                groupRef.current.position.z = -scrollProgress * 10;
            } else if (stage === 2) {
                groupRef.current.rotation.x = scrollProgress * Math.PI;
                groupRef.current.scale.setScalar(5 - scrollProgress * 2);
            }
        }
    });

    const createDNAGeometry = () => {
        const points = [];
        const points2 = [];

        for (let i = 0; i < 100; i++) {
            const angle = i * 0.2;
            const y = i * 0.1 - 5;
            const radius = 2;

            points.push(new THREE.Vector3(
                Math.cos(angle) * radius,
                y,
                Math.sin(angle) * radius
            ));

            points2.push(new THREE.Vector3(
                Math.cos(angle + Math.PI) * radius,
                y,
                Math.sin(angle + Math.PI) * radius
            ));
        }

        return { points, points2 };
    };

    const { points, points2 } = createDNAGeometry();

    return (
        <group ref={groupRef}>
            <group ref={helixRef}>
                {/* DNA Strands */}
                <mesh>
                    <tubeGeometry args={[new THREE.CatmullRomCurve3(points), 100, 0.1, 8]} />
                    <meshStandardMaterial color="#00ff88" emissive="#004422" />
                </mesh>
                <mesh>
                    <tubeGeometry args={[new THREE.CatmullRomCurve3(points2), 100, 0.1, 8]} />
                    <meshStandardMaterial color="#0088ff" emissive="#002244" />
                </mesh>

                {/* Base Pairs */}
                {points.map((point, i) => {
                    if (i % 4 === 0) {
                        return (
                            <group key={i}>
                                <mesh position={point}>
                                    <sphereGeometry args={[0.15]} />
                                    <meshStandardMaterial
                                        color={stage === 3 && i === 40 ? "#ff0044" : "#ffaa00"}
                                        emissive={stage === 3 && i === 40 ? "#440011" : "#442200"}
                                    />
                                </mesh>
                                <mesh position={points2[i]}>
                                    <sphereGeometry args={[0.15]} />
                                    <meshStandardMaterial
                                        color={stage === 3 && i === 40 ? "#ff0044" : "#ffaa00"}
                                        emissive={stage === 3 && i === 40 ? "#440011" : "#442200"}
                                    />
                                </mesh>
                                <mesh position={[
                                    (point.x + points2[i].x) / 2,
                                    point.y,
                                    (point.z + points2[i].z) / 2
                                ]}>
                                    <cylinderGeometry args={[0.05, 0.05, 4]} />
                                    <meshStandardMaterial
                                        color={stage === 3 && i === 40 ? "#ff4466" : "#666666"}
                                        opacity={0.8}
                                        transparent
                                    />
                                </mesh>
                            </group>
                        );
                    }
                    return null;
                })}
            </group>

            {/* Particle Effects */}
            <Sparkles count={50} scale={10} size={2} speed={0.5} />
        </group>
    );
};

// Microscope Component
const Microscope = ({ visible }) => {
    const ref = useRef();

    useFrame(() => {
        if (ref.current && visible) {
            ref.current.rotation.y += 0.01;
        }
    });

    return (
        <group ref={ref} visible={visible}>
            <mesh position={[0, -2, 0]}>
                <cylinderGeometry args={[1, 1.5, 3]} />
                <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 1, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 4]} />
                <meshStandardMaterial color="#222222" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[0, 3.5, 0]}>
                <cylinderGeometry args={[0.8, 0.5, 1]} />
                <meshStandardMaterial color="#111111" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Lens with glow effect */}
            <mesh position={[0, 4, 0]}>
                <cylinderGeometry args={[0.4, 0.4, 0.1]} />
                <meshStandardMaterial
                    color="#00ddff"
                    emissive="#0066aa"
                    transparent
                    opacity={0.8}
                />
            </mesh>
        </group>
    );
};

// 3D Scene Component
const Scene3D = ({ stage, scrollProgress }) => {
    const { camera } = useThree();

    useEffect(() => {
        // Camera animations based on scroll stage
        if (stage === 1) {
            gsap.to(camera.position, {
                duration: 2,
                z: 15 - scrollProgress * 10,
                ease: "power2.out"
            });
        } else if (stage === 4) {
            gsap.to(camera.position, {
                duration: 2,
                x: 5,
                y: 2,
                z: 8,
                ease: "power2.out"
            });
        }
    }, [stage, scrollProgress, camera]);

    return (
        <>
            <Environment preset="night" />
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#00ddff" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff6600" />

            {/* DNA Helix - visible in stages 1-3 */}
            {stage <= 3 && (
                <DNAHelix scrollProgress={scrollProgress} stage={stage} />
            )}

            {/* Microscope - visible in stage 4 */}
            {stage === 4 && (
                <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
                    <Microscope visible={true} />
                </Float>
            )}

            {/* Background Stars */}
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />

            {/* Floating Particles */}
            {stage >= 2 && (
                <Sparkles
                    count={stage === 3 ? 200 : 100}
                    scale={20}
                    size={stage === 3 ? 4 : 2}
                    speed={stage === 3 ? 2 : 1}
                    color={stage === 3 ? "#ff4466" : "#00ddff"}
                />
            )}
        </>
    );
};

// Scroll Section Component
const ScrollSection = ({ children, className, id }) => (
    <section
        id={id}
        className={`min-h-screen flex items-center justify-center relative ${className}`}
    >
        {children}
    </section>
);

// Typewriter Effect Component
const TypewriterText = ({ text, delay = 0, speed = 50 }) => {
    const [displayText, setDisplayText] = useState('');

    useEffect(() => {
        let index = 0;
        const timer = setTimeout(() => {
            const interval = setInterval(() => {
                if (index < text.length) {
                    setDisplayText(text.substring(0, index + 1));
                    index++;
                } else {
                    clearInterval(interval);
                }
            }, speed);
            return () => clearInterval(interval);
        }, delay);

        return () => clearTimeout(timer);
    }, [text, delay, speed]);

    return <span>{displayText}</span>;
};

// Main Component
const LandingPage = () => {
    const [currentStage, setCurrentStage] = useState(0);
    const [scrollProgress, setScrollProgress] = useState(0);
    const containerRef = useRef();

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Hero section animations
            gsap.fromTo(".hero-content",
                { opacity: 0, y: 100 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 2,
                    ease: "power3.out",
                    delay: 1
                }
            );

            // Scroll-triggered animations
            ScrollTrigger.create({
                trigger: "#scene1",
                start: "top center",
                end: "bottom center",
                onEnter: () => setCurrentStage(1),
                onUpdate: (self) => setScrollProgress(self.progress)
            });

            ScrollTrigger.create({
                trigger: "#scene2",
                start: "top center",
                end: "bottom center",
                onEnter: () => setCurrentStage(2),
                onUpdate: (self) => setScrollProgress(self.progress)
            });

            ScrollTrigger.create({
                trigger: "#scene3",
                start: "top center",
                end: "bottom center",
                onEnter: () => setCurrentStage(3),
                onUpdate: (self) => setScrollProgress(self.progress)
            });

            ScrollTrigger.create({
                trigger: "#scene4",
                start: "top center",
                end: "bottom center",
                onEnter: () => setCurrentStage(4),
                onUpdate: (self) => setScrollProgress(self.progress)
            });

            // Text animations
            gsap.utils.toArray('.story-text').forEach((text, i) => {
                gsap.fromTo(text,
                    { opacity: 0, y: 50, scale: 0.8 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 1.5,
                        ease: "back.out(1.7)",
                        scrollTrigger: {
                            trigger: text,
                            start: "top 80%",
                            end: "bottom 20%",
                            toggleActions: "play none none reverse"
                        }
                    }
                );
            });

            // CTA button animations
            gsap.fromTo(".cta-button",
                { scale: 1 },
                {
                    scale: 1.05,
                    duration: 1.5,
                    ease: "power2.inOut",
                    yoyo: true,
                    repeat: -1
                }
            );

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="relative bg-black text-white overflow-x-hidden">
            {/* Fixed 3D Canvas */}
            <div className="fixed inset-0 z-0">
                <Canvas
                    camera={{ position: [0, 0, 15], fov: 75 }}
                    gl={{ antialias: true, alpha: true }}
                >
                    <Suspense fallback={null}>
                        <Scene3D stage={currentStage} scrollProgress={scrollProgress} />
                    </Suspense>
                </Canvas>
            </div>

            {/* Scroll Content */}
            <div className="relative z-10">
                {/* Hero Section */}
                <ScrollSection className="hero-section" id="hero">
                    <div className="hero-content text-center max-w-4xl mx-auto px-6">
                        <div className="mb-8">
                            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-6">
                                <TypewriterText text="Mutation Analysis" delay={2000} speed={100} />
                            </h1>
                            <div className="text-xl md:text-2xl text-gray-300 mb-8 h-16">
                                <TypewriterText
                                    text="Decoding DNA, Detecting Variants, Delivering Insights"
                                    delay={4000}
                                    speed={80}
                                />
                            </div>
                        </div>
                        <Link to="/home">

                            <button className="cta-button px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105">
                                Begin Journey
                            </button>
                        </Link>
                    </div>
                </ScrollSection>

                {/* Scene 1: Human to DNA */}
                <ScrollSection className="scene-1" id="scene1">
                    <div className="story-text text-center max-w-3xl mx-auto px-6">
                        <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                            Journey Into Life
                        </h2>
                        <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
                            Every cell in your body contains the blueprint of life.
                            Zoom deeper, beyond the visible, into the molecular realm
                            where your DNA holds the secrets of existence.
                        </p>
                    </div>
                </ScrollSection>

                {/* Scene 2: DNA to Codons */}
                <ScrollSection className="scene-2" id="scene2">
                    <div className="story-text text-center max-w-3xl mx-auto px-6">
                        <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            The Code Unravels
                        </h2>
                        <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
                            Your DNA carries 3 billion letters in an intricate dance of
                            genetic information. Watch as the double helix unzips to reveal
                            the codons that define who you are.
                        </p>
                    </div>
                </ScrollSection>

                {/* Scene 3: SNV Mutation */}
                <ScrollSection className="scene-3" id="scene3">
                    <div className="story-text text-center max-w-3xl mx-auto px-6">
                        <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                            When One Letter Changes Everything
                        </h2>
                        <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
                            This is an SNV — a single nucleotide variant.
                            One letter changed in billions. Small in scale,
                            massive in impact. It can alter disease risk,
                            drug response, and clinical outcomes.
                        </p>
                    </div>
                </ScrollSection>

                {/* Scene 4: Mutation Analysis Solution */}
                <ScrollSection className="scene-4" id="scene4">
                    <div className="story-text text-center max-w-3xl mx-auto px-6">
                        <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                            Precision Through AI Vision
                        </h2>
                        <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8">
                        Mutation Analysis detects SNVs with unprecedented precision,
                            speed, and intelligence. We transform genomic complexity
                            into clear, actionable clinical insights.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105">
                                Get Started
                            </button>
                            <button className="px-8 py-4 border-2 border-cyan-400 rounded-full text-lg font-semibold hover:bg-cyan-400 hover:text-black transition-all duration-300 transform hover:scale-105">
                                Request Demo
                            </button>
                        </div>
                    </div>
                </ScrollSection>

                {/* Final CTA Section */}
                <ScrollSection className="final-cta" id="cta">
                    <div className="text-center max-w-4xl mx-auto px-6">
                        <div className="mb-8">
                            <div className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-6">
                            Mutation Analysis
                            </div>
                            <p className="text-2xl md:text-3xl text-gray-300 mb-8">
                                Turn genomic data into actionable insights. Start today.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <button className="cta-button px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full text-xl font-bold hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300">
                                Transform Your Practice
                            </button>
                            <button className="px-10 py-5 border-2 border-cyan-400 rounded-full text-xl font-bold hover:bg-cyan-400 hover:text-black transition-all duration-300">
                                See It In Action
                            </button>
                        </div>
                    </div>
                </ScrollSection>
            </div>

            {/* Progress Indicator */}
            <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-20">
                <div className="flex flex-col gap-2">
                    {[0, 1, 2, 3, 4].map((stage) => (
                        <div
                            key={stage}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${currentStage === stage
                                ? 'bg-cyan-400 scale-125 shadow-lg shadow-cyan-400/50'
                                : 'bg-gray-600'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LandingPage;