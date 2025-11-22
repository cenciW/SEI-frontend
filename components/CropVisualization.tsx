"use client";

import React, { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// --- Plant Models (Procedural) ---

// Componente procedural de Milho (usado como fallback)
const ProceduralCorn = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      {/* Stalk - mais grosso e com segmentos */}
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.09, 2, 12]} />
        <meshStandardMaterial 
          color="#4a7c2a" 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Nós do caule */}
      {[0.5, 1.0, 1.5].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} castShadow>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#3a6c1a" roughness={0.9} />
        </mesh>
      ))}
      
      {/* Folhas - múltiplas e mais realistas */}
      {[
        { y: 0.6, rot: 0, dir: 1 },
        { y: 0.9, rot: Math.PI / 3, dir: -1 },
        { y: 1.2, rot: Math.PI / 1.5, dir: 1 },
        { y: 1.5, rot: Math.PI, dir: -1 },
        { y: 1.8, rot: Math.PI / 2.5, dir: 1 },
      ].map((leaf, i) => (
        <group key={i} position={[0, leaf.y, 0]} rotation={[0, leaf.rot, 0]}>
          <mesh position={[leaf.dir * 0.3, 0, 0]} rotation={[0, 0, leaf.dir * -0.4]} castShadow>
            <boxGeometry args={[0.6, 0.03, 0.15]} />
            <meshStandardMaterial 
              color="#5a9c3a" 
              roughness={0.7}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
      
      {/* Corn Cobs - 2 espigas */}
      <mesh position={[0.12, 1.4, 0.08]} rotation={[0.3, 0.2, 0]} castShadow>
        <capsuleGeometry args={[0.07, 0.35, 6, 12]} />
        <meshStandardMaterial color="#f2d03b" roughness={0.6} />
      </mesh>
      <mesh position={[-0.08, 1.3, 0.1]} rotation={[0.2, -0.3, 0]} castShadow>
        <capsuleGeometry args={[0.06, 0.3, 6, 12]} />
        <meshStandardMaterial color="#e8c030" roughness={0.6} />
      </mesh>
    </group>
  );
};

const CornPlant = ({ position, mode }: { position: [number, number, number]; mode?: "pot" | "field" }) => {
  return (
    <Plant3D
      cropName="corn"
      mode={mode || "pot"}
      position={position}
      potScale={0.6}
      fieldScale={1.2}
      positionOffset={mode === "field" ? [0, 0.42, 0] : [0, 0, 0]}
      fallback={<ProceduralCorn position={position} />}
    />
  );
};


// Componente procedural de Tomate (usado como fallback)
const ProceduralTomato = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      {/* Main Stem - mais detalhado */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.045, 1.2, 10]} />
        <meshStandardMaterial color="#3a5c2a" roughness={0.85} />
      </mesh>
      
      {/* Ramos secundários */}
      {[
        { y: 0.4, angle: 0.3, x: 0.15 },
        { y: 0.7, angle: -0.3, x: -0.15 },
        { y: 1.0, angle: 0.4, x: 0.12 },
      ].map((branch, i) => (
        <mesh 
          key={i} 
          position={[branch.x, branch.y, 0]} 
          rotation={[0, 0, branch.angle]}
          castShadow
        >
          <cylinderGeometry args={[0.02, 0.025, 0.3, 8]} />
          <meshStandardMaterial color="#4a6c3a" roughness={0.85} />
        </mesh>
      ))}
      
      {/* Folhagem - mais densa */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <dodecahedronGeometry args={[0.45, 0]} />
        <meshStandardMaterial 
          color="#2a4c1a" 
          transparent 
          opacity={0.85}
          roughness={0.9}
        />
      </mesh>
      <mesh position={[0.15, 0.7, 0.1]} castShadow>
        <dodecahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial 
          color="#3a5c2a" 
          transparent 
          opacity={0.8}
          roughness={0.9}
        />
      </mesh>
      
      {/* Tomates - diferentes estágios de maturação */}
      {[
        { pos: [0.22, 0.75, 0.12], color: "#ff4433", size: 0.09 },
        { pos: [-0.18, 0.95, 0.18], color: "#ff5544", size: 0.08 },
        { pos: [0.12, 0.55, -0.15], color: "#ee3322", size: 0.085 },
        { pos: [-0.1, 0.65, 0.2], color: "#ff9955", size: 0.06 },
        { pos: [0.18, 0.85, -0.1], color: "#ff6644", size: 0.075 },
      ].map((tomato, i) => (
        <group key={i}>
          <mesh position={tomato.pos as [number, number, number]} castShadow>
            <sphereGeometry args={[tomato.size, 16, 16]} />
            <meshStandardMaterial 
              color={tomato.color} 
              roughness={0.4}
              metalness={0.1}
            />
          </mesh>
          {/* Cabinho do tomate */}
          <mesh 
            position={[tomato.pos[0], tomato.pos[1] + tomato.size, tomato.pos[2]]} 
            rotation={[0.2, 0, 0]}
          >
            <cylinderGeometry args={[0.01, 0.015, 0.05, 6]} />
            <meshStandardMaterial color="#2a4c1a" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const TomatoPlant = ({ position, mode }: { position: [number, number, number]; mode?: "pot" | "field" }) => {
  return (
    <Plant3D
      cropName="tomato"
      mode={mode || "pot"}
      position={position}
      potScale={1.3}
      fieldScale={1.1}
      positionOffset={mode === "field" ? [0, -0.15, 0] : [0, -0.3, 0]}
      fallback={<ProceduralTomato position={position} />}
    />
  );
};


// Componente procedural de Trigo (usado como fallback)
const ProceduralWheat = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      {/* Múltiplos talos agrupados - mais denso */}
      {[
        { x: -0.06, z: -0.04, h: 1.25, rot: 0.05 },
        { x: -0.02, z: 0.02, h: 1.3, rot: -0.03 },
        { x: 0.02, z: -0.02, h: 1.2, rot: 0.02 },
        { x: 0.06, z: 0.04, h: 1.28, rot: -0.04 },
        { x: 0, z: 0, h: 1.35, rot: 0 },
        { x: -0.04, z: 0.05, h: 1.22, rot: 0.03 },
        { x: 0.04, z: -0.05, h: 1.27, rot: -0.02 },
      ].map((stalk, i) => (
        <group key={i} position={[stalk.x, 0, stalk.z]} rotation={[0, stalk.rot, 0]}>
          {/* Talo */}
          <mesh position={[0, stalk.h / 2, 0]} castShadow>
            <cylinderGeometry args={[0.012, 0.018, stalk.h, 8]} />
            <meshStandardMaterial 
              color="#d4b86a" 
              roughness={0.85}
            />
          </mesh>
          {/* Espiga */}
          <mesh position={[0, stalk.h, 0]} castShadow>
            <capsuleGeometry args={[0.035, 0.25, 8, 12]} />
            <meshStandardMaterial 
              color="#f0d070" 
              roughness={0.7}
            />
          </mesh>
          {/* Aristas (pelos da espiga) */}
          {[0, 0.1, -0.1, 0.05, -0.05].map((offset, j) => (
            <mesh 
              key={j}
              position={[offset * 0.3, stalk.h + 0.15, offset * 0.2]} 
              rotation={[offset * 0.5, 0, offset * 0.3]}
            >
              <cylinderGeometry args={[0.002, 0.001, 0.15, 4]} />
              <meshStandardMaterial color="#e8c060" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};

const WheatPlant = ({ position, mode }: { position: [number, number, number]; mode?: "pot" | "field" }) => {
  return (
    <Plant3D
      cropName="wheat"
      mode={mode || "pot"}
      position={position}
      potScale={0.6}
      fieldScale={1.0}
      positionOffset={mode === "pot" ? [0, 0.6, 0] : [0, 1.05, 0]}
      useSameModel={true}
      fallback={<ProceduralWheat position={position} />}
    />
  );
};


// Componente procedural de Alface (usado como fallback)
const ProceduralLettuce = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      {/* Camadas de folhas - mais realista */}
      {[
        { y: 0.08, size: 0.28, color: "#7aaf3a", segments: 12 },
        { y: 0.14, size: 0.22, color: "#8abf4a", segments: 10 },
        { y: 0.18, size: 0.16, color: "#9acf5a", segments: 8 },
        { y: 0.21, size: 0.11, color: "#aacf6a", segments: 8 },
      ].map((layer, i) => (
        <mesh key={i} position={[0, layer.y, 0]} castShadow>
          <sphereGeometry 
            args={[layer.size, layer.segments, layer.segments, 0, Math.PI * 2, 0, Math.PI / 2]} 
          />
          <meshStandardMaterial 
            color={layer.color} 
            side={THREE.DoubleSide}
            roughness={0.8}
          />
        </mesh>
      ))}
      
      {/* Folhas individuais para mais detalhe */}
      {[0, Math.PI / 3, Math.PI * 2 / 3, Math.PI, Math.PI * 4 / 3, Math.PI * 5 / 3].map((angle, i) => (
        <mesh 
          key={`leaf-${i}`}
          position={[
            Math.cos(angle) * 0.2,
            0.12,
            Math.sin(angle) * 0.2
          ]}
          rotation={[0, angle, Math.PI / 6]}
          castShadow
        >
          <boxGeometry args={[0.15, 0.02, 0.25]} />
          <meshStandardMaterial 
            color="#8abf4a" 
            side={THREE.DoubleSide}
            roughness={0.75}
          />
        </mesh>
      ))}
    </group>
  );
};

const LettucePlant = ({ position, mode }: { position: [number, number, number]; mode?: "pot" | "field" }) => {
  // Usando apenas geometria procedural devido a problemas com texturas do modelo 3D
  return <ProceduralLettuce position={position} />;
};

// Componente genérico para carregar modelo 3D de qualquer planta
const Model3D = ({ 
  modelPath, 
  position,
  scale = 1,
  useOriginal = false
}: { 
  modelPath: string; 
  position: [number, number, number];
  scale?: number;
  useOriginal?: boolean;
}) => {
  const { scene } = useGLTF(modelPath);
  
  // Clone the scene properly with materials (or use original if specified)
  const processedScene = React.useMemo(() => {
    if (useOriginal) {
      // Use original scene without cloning (for models with texture issues)
      return scene;
    }
    
    const clone = scene.clone(true);
    // Traverse and clone materials to avoid shared material issues
    clone.traverse((child: any) => {
      if (child.isMesh && child.material) {
        // Clone the material
        child.material = child.material.clone();
        
        // Force material to update and ensure it's not transparent
        if (child.material) {
          child.material.needsUpdate = true;
          
          // Ensure the material has proper color
          if (child.material.color) {
            child.material.color.needsUpdate = true;
          }
          
          // If material has a map (texture), ensure it's loaded
          if (child.material.map) {
            child.material.map.needsUpdate = true;
          }
        }
      }
    });
    return clone;
  }, [scene, useOriginal]);
  
  return (
    <primitive 
      object={processedScene} 
      position={position} 
      scale={scale}
      castShadow
      receiveShadow
    />
  );
};

// Componente genérico para plantas com modelo 3D e fallback procedural
const Plant3D = ({
  cropName,
  mode,
  position,
  potScale = 1.0,
  fieldScale = 0.3,
  positionOffset = [0, 0, 0],
  useSameModel = false,
  useOriginal = false,
  fallback
}: {
  cropName: string;
  mode: "pot" | "field";
  position: [number, number, number];
  potScale?: number;
  fieldScale?: number;
  positionOffset?: [number, number, number];
  useSameModel?: boolean;
  useOriginal?: boolean;
  fallback: React.ReactNode;
}) => {
  const modelPath = useSameModel || mode === "pot"
    ? `/models/${cropName}.glb` 
    : `/models/${cropName}_field.glb`;
  
  const modelScale = mode === "field" ? fieldScale : potScale;
  
  // Ajusta a posição com offset
  const adjustedPosition: [number, number, number] = [
    position[0] + positionOffset[0],
    position[1] + positionOffset[1],
    position[2] + positionOffset[2]
  ];

  return (
    <Suspense fallback={fallback}>
      <Model3D 
        modelPath={modelPath}
        position={adjustedPosition}
        scale={modelScale}
        useOriginal={useOriginal}
      />
    </Suspense>
  );
};

// Preload de todos os modelos GLB
const cropModels = ['cannabis', 'corn', 'tomato', 'wheat', 'lettuce'];
cropModels.forEach(crop => {
  useGLTF.preload(`/models/${crop}.glb`);
  useGLTF.preload(`/models/${crop}_field.glb`);
});


const CannabisPlant = ({ position, mode }: { position: [number, number, number]; mode?: "pot" | "field" }) => {
  // Função para criar folha palmada (5-7 dedos) - FALLBACK
  const PalmateLeaf = ({ 
    position, 
    rotation, 
    scale = 1 
  }: { 
    position: [number, number, number]; 
    rotation: [number, number, number];
    scale?: number;
  }) => (
    <group position={position} rotation={rotation}>
      {/* 7 "dedos" da folha */}
      {[
        { angle: 0, length: 0.35, width: 0.04 },           // Centro
        { angle: -0.3, length: 0.32, width: 0.035 },       // Esquerda 1
        { angle: 0.3, length: 0.32, width: 0.035 },        // Direita 1
        { angle: -0.5, length: 0.28, width: 0.03 },        // Esquerda 2
        { angle: 0.5, length: 0.28, width: 0.03 },         // Direita 2
        { angle: -0.7, length: 0.22, width: 0.025 },       // Esquerda 3
        { angle: 0.7, length: 0.22, width: 0.025 },        // Direita 3
      ].map((finger, i) => (
        <mesh 
          key={i}
          position={[
            Math.sin(finger.angle) * 0.05,
            finger.length * scale / 2,
            0
          ]}
          rotation={[0, 0, finger.angle]}
          castShadow
        >
          <boxGeometry args={[finger.width * scale, finger.length * scale, 0.01]} />
          <meshStandardMaterial 
            color="#4a7c3a" 
            roughness={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );

  // Geometria procedural como fallback
  const ProceduralCannabis = () => (
    <group position={position}>
      {/* Caule principal */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.055, 1.5, 12]} />
        <meshStandardMaterial 
          color="#5a7c4a" 
          roughness={0.85}
        />
      </mesh>
      
      {/* Nós com pares de folhas */}
      {[
        { y: 0.3, scale: 0.6, angle: 0 },
        { y: 0.5, scale: 0.75, angle: Math.PI / 2 },
        { y: 0.7, scale: 0.9, angle: 0 },
        { y: 0.9, scale: 1.0, angle: Math.PI / 2 },
        { y: 1.1, scale: 1.0, angle: 0 },
        { y: 1.3, scale: 0.85, angle: Math.PI / 2 },
      ].map((node, i) => (
        <group key={i} position={[0, node.y, 0]} rotation={[0, node.angle, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshStandardMaterial color="#4a6c3a" roughness={0.9} />
          </mesh>
          
          <PalmateLeaf 
            position={[0.15, 0, 0]} 
            rotation={[0, 0, -0.2]} 
            scale={node.scale}
          />
          <PalmateLeaf 
            position={[-0.15, 0, 0]} 
            rotation={[0, Math.PI, 0.2]} 
            scale={node.scale}
          />
        </group>
      ))}
      
      {/* Topo com folhas menores e mais densas */}
      <group position={[0, 1.45, 0]}>
        {[0, Math.PI / 3, Math.PI * 2 / 3, Math.PI, Math.PI * 4 / 3, Math.PI * 5 / 3].map((angle, i) => (
          <PalmateLeaf 
            key={i}
            position={[
              Math.cos(angle) * 0.08,
              0,
              Math.sin(angle) * 0.08
            ]} 
            rotation={[0, angle, -0.3]} 
            scale={0.5}
          />
        ))}
      </group>
      
      {/* Flores/Buds */}
      {[
        { x: 0.12, y: 1.35, z: 0.08, size: 0.06 },
        { x: -0.1, y: 1.25, z: 0.1, size: 0.055 },
        { x: 0.08, y: 1.15, z: -0.09, size: 0.05 },
        { x: -0.11, y: 1.05, z: -0.08, size: 0.05 },
        { x: 0, y: 1.5, z: 0, size: 0.07 },
      ].map((bud, i) => (
        <group key={`bud-${i}`} position={[bud.x, bud.y, bud.z]}>
          <mesh castShadow>
            <sphereGeometry args={[bud.size, 8, 8]} />
            <meshStandardMaterial 
              color="#6a9c5a" 
              roughness={0.5}
            />
          </mesh>
          {[0, 1, 2].map((j) => (
            <mesh 
              key={j}
              position={[
                (Math.random() - 0.5) * bud.size,
                (Math.random() - 0.5) * bud.size,
                (Math.random() - 0.5) * bud.size
              ]}
            >
              <sphereGeometry args={[bud.size * 0.3, 6, 6]} />
              <meshStandardMaterial 
                color="#7aac6a" 
                roughness={0.4}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );

  // Se for modo field, cria um grid de plantas usando cannabis.glb
  if (mode === "field") {
    const gridPositions: [number, number, number][] = [];
    const spacing = 10; // Espaçamento entre plantas
    const gridSize = 1; // 3x3 = 9 plantas
    const scale = 1;
    
    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        gridPositions.push([
          (x - gridSize / 2 + 0.5) * spacing,
          0,
          (z - gridSize / 2 + 0.5) * spacing
        ]);
      }
    }

    return (
      <group>
        {gridPositions.map((pos, index) => (
          <Suspense key={index} fallback={null}>
            <Model3D
              modelPath="/models/cannabis.glb"
              position={pos}
              scale={scale}
            />
          </Suspense>
        ))}
      </group>
    );
  }

  // Modo pot: usa o modelo com vaso (cannabis.glb já tem vaso)
  return (
    <Suspense fallback={<ProceduralCannabis />}>
      <Model3D 
        modelPath="/models/cannabis.glb"
        position={position}
        scale={1.2}
      />
    </Suspense>
  );
};

// --- Container / Environment ---

const Pot = ({ children }: { children: React.ReactNode }) => {
  return (
    <group>
      {/* Pot Body - terracota realista */}
      <mesh position={[0, 0.0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.3, 0.6, 32]} />
        <meshStandardMaterial 
          color="#a0522d" 
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>
      {/* Soil */}
      <mesh position={[0, 0.28, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.38, 32]} />
        <meshStandardMaterial 
          color="#3d2817" 
          roughness={1.0}
        />
      </mesh>
      {/* Plant Position */}
      <group position={[0, 0.28, 0]}>{children}</group>
    </group>
  );
};

const Field = ({ children }: { children: React.ReactNode }) => {
  return (
    <group>
      {/* Ground - solo mais bonito e maior */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[5, 5, 20, 20]} />
        <meshStandardMaterial 
          color="#4a3828" 
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>
      
      {/* Camada de textura do solo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[4.8, 4.8, 15, 15]} />
        <meshStandardMaterial 
          color="#6b5a4a" 
          roughness={1.0}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Bordas do campo - mais sutis */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.3, 2.5, 64]} />
        <meshStandardMaterial color="#2a1808" roughness={0.9} />
      </mesh>
      
      {/* Plants Grid - 3x3 */}
      <group position={[-0.5, 0, -0.5]}>
        {Array.from({ length: 3 }).map((_, row) =>
          Array.from({ length: 3 }).map((_, col) => (
            <group key={`${row}-${col}`} position={[row * 0.5, 0, col * 0.5]}>
              {children}
            </group>
          ))
        )}
      </group>
    </group>
  );
};

// --- Main Component ---

interface CropVisualizationProps {
  crop: string;
  mode: "pot" | "field";
}

export default function CropVisualization({ crop, mode }: CropVisualizationProps) {
  const getPlant = () => {
    const lowerCrop = crop.toLowerCase();
    const pos: [number, number, number] = [0, 0, 0];
    
    if (lowerCrop.includes("corn") || lowerCrop.includes("milho")) {
      return <CornPlant position={pos} mode={mode} />;
    } else if (lowerCrop.includes("tomato") || lowerCrop.includes("tomate")) {
      return <TomatoPlant position={pos} mode={mode} />;
    } else if (lowerCrop.includes("wheat") || lowerCrop.includes("trigo")) {
      return <WheatPlant position={pos} mode={mode} />;
    } else if (lowerCrop.includes("lettuce") || lowerCrop.includes("alface")) {
      return <LettucePlant position={pos} mode={mode} />;
    } else if (lowerCrop.includes("cannabis") || lowerCrop.includes("maconha")) {
      return <CannabisPlant position={pos} mode={mode} />;
    }
    return <CornPlant position={pos} mode={mode} />;
  };

  // Verifica se é Cannabis para não renderizar o vaso (modelo 3D já tem vaso)
  const isCannabis = crop.toLowerCase().includes("cannabis") || crop.toLowerCase().includes("maconha");

  return (
    <div className="w-full h-full bg-slate-900/50 rounded-lg overflow-hidden border border-slate-800 relative">
      <Canvas dpr={[1, 2]} className="absolute inset-0" style={{ background: '#4a5568' }}>
        {/* Camera - Vista frontal com planta na parte inferior */}
        <PerspectiveCamera 
          makeDefault
          position={[0, 1.2, 3.5]}
          fov={45}
        />
        {/* Controlador da câmera */}
        <OrbitControls 
          enableZoom={true}
          minPolarAngle={0.3}
          maxPolarAngle={Math.PI / 2}
          target={[0, 0.8, 0]}
        />
        
        {/* Iluminação melhorada - sem sombras */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[4, 8, 8]} intensity={1.5} />
        <directionalLight position={[-4, 6, -4]} intensity={0.8} />
        <pointLight position={[0, 5, 0]} intensity={0.5} />
        
        {/* Ambiente HDR */}
        <Environment preset="sunset" />

        {mode === "pot" ? (
          // Se for Cannabis, renderiza direto sem vaso (modelo 3D já tem vaso)
          isCannabis ? getPlant() : <Pot>{getPlant()}</Pot>
        ) : (
          <Field>{getPlant()}</Field>
        )}
      </Canvas>
    </div>
  );
}
