import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  CameraControls,
  CameraControlsImpl,
  Html,
  useGLTF,
  useProgress,
} from "@react-three/drei";
import { Box3, Vector3, Euler } from "three";
import { sceneConfig as cfg } from "./sceneConfig";
import Desktop from "../desktop/Desktop";
import LoadingScreen from "./LoadingScreen";
function Scene({
  active,
  enter,
  onBusy,
  onReady,
}: {
  active: boolean;
  enter: () => void;
  onBusy: (b: boolean) => void;
  onReady: () => void;
}) {
  const { scene } = useGLTF(cfg.model);
  const controls = useRef<CameraControls>(null);
  const initialized = useRef(false);
  const [moving, setMoving] = useState(true);
  const transition = useRef<{
    from: Vector3;
    fromTarget: Vector3;
    to: Vector3;
    target: Vector3;
    elapsed: number;
  } | null>(null);
  const { size, invalidate } = useThree();
  const [hover, setHover] = useState(false);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.scale.setScalar(cfg.scale);
    clone.updateMatrixWorld(true);
    const b = new Box3().setFromObject(clone);
    const c = b.getCenter(new Vector3());
    clone.position.set(-c.x, -b.min.y, -c.z);
    clone.updateMatrixWorld(true);
    return clone;
  }, [scene]);
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    onBusy(true);
    setMoving(true);
    const s = cfg.screen;
    const distance =
      Math.max(
        s.height / 2 / Math.tan((cfg.fov * Math.PI) / 360),
        s.width /
          2 /
          Math.tan((cfg.fov * Math.PI) / 360) /
          (size.width / size.height),
      ) * 1.23;
    const normal = new Vector3(0, 0, 1).applyEuler(new Euler(...s.rotation));
    const p = new Vector3(...s.position).addScaledVector(normal, distance);
    const target = active ? s.position : cfg.room.target;
    const pos = active ? p.toArray() : cfg.room.position;
    const to = new Vector3(...(pos as [number, number, number]));
    const targetVector = new Vector3(...target);
    if (
      !initialized.current ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      void c.setLookAt(
        ...(to.toArray() as [number, number, number]),
        ...target,
        false,
      );
      transition.current = null;
      setMoving(false);
      onBusy(false);
    } else {
      transition.current = {
        from: c.getPosition(new Vector3()),
        fromTarget: c.getTarget(new Vector3()),
        to,
        target: targetVector,
        elapsed: 0,
      };
      invalidate();
    }
    initialized.current = true;
    onReady();
    return () => {
      transition.current = null;
    };
  }, [active, size.width, size.height, onBusy, invalidate, onReady]);
  useFrame((_, delta) => {
    const t = transition.current;
    const c = controls.current;
    if (!t || !c) return;
    t.elapsed += delta;
    const progress = Math.min(t.elapsed / cfg.transitionSeconds, 1);
    const eased = progress * progress * (3 - 2 * progress);
    const position = t.from.clone().lerp(t.to, eased);
    const target = t.fromTarget.clone().lerp(t.target, eased);
    void c.setLookAt(
      ...(position.toArray() as [number, number, number]),
      ...(target.toArray() as [number, number, number]),
      false,
    );
    if (progress === 1) {
      transition.current = null;
      setMoving(false);
      onBusy(false);
    } else invalidate();
  });
  return (
    <>
      <ambientLight intensity={1.8} />
      <directionalLight position={[3, 8, 5]} intensity={2} />
      <primitive
        object={model}
        dispose={null}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          if (!active && !moving && e.delta < 5) enter();
        }}
        onPointerOver={() => {
          if (!active && !moving) document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      />
      <CameraControls
        ref={controls}
        enabled={!active && !moving}
        minDistance={8}
        maxDistance={25}
        minPolarAngle={0.25}
        maxPolarAngle={Math.PI / 2 - 0.05}
        mouseButtons={{
          left: CameraControlsImpl.ACTION.ROTATE,
          middle: CameraControlsImpl.ACTION.NONE,
          right: CameraControlsImpl.ACTION.NONE,
          wheel: CameraControlsImpl.ACTION.DOLLY,
        }}
        touches={{
          one: CameraControlsImpl.ACTION.TOUCH_ROTATE,
          two: CameraControlsImpl.ACTION.TOUCH_DOLLY,
          three: CameraControlsImpl.ACTION.NONE,
        }}
      />
      <group position={cfg.screen.position} rotation={cfg.screen.rotation}>
        <mesh
          position={[0, 0, 0.008]}
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
            if (!active && !moving && e.delta < 5) enter();
          }}
          onPointerOver={() => {
            setHover(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHover(false);
            document.body.style.cursor = "auto";
          }}
        >
          <planeGeometry args={[cfg.screen.width, cfg.screen.height]} />
          <meshBasicMaterial color={hover ? "#66edd0" : "#122e35"} />
        </mesh>
        <Html
          pointerEvents={active && !moving ? "auto" : "none"}
          transform
          distanceFactor={1}
          zIndexRange={[50, 0]}
          position={[0, 0, 0.018]}
          scale={(cfg.screen.width / cfg.desktop.width) * 400}
          occlude={[{ current: model }]}
          style={{
            width: cfg.desktop.width,
            height: cfg.desktop.height,
            boxShadow: hover && !active ? "0 0 0 5px #8ef5c7" : undefined,
            pointerEvents: active && !moving ? "auto" : "none",
          }}
        >
          <Desktop embedded enabled={active && !moving} />
        </Html>
      </group>
      {new URLSearchParams(location.search).has("debug") && (
        <>
          <axesHelper args={[5]} />
          <gridHelper args={[12, 12]} />
        </>
      )}
    </>
  );
}
export default function Room({
  active,
  enter,
  onBusy,
  onFailure,
}: {
  active: boolean;
  enter: () => void;
  onBusy: (b: boolean) => void;
  onFailure: () => void;
}) {
  const [ready, setReady] = useState(false);
  const { progress } = useProgress();
  const onReady = useCallback(() => setReady(true), []);
  return (
    <>
      {!ready && (
        <LoadingScreen
          progress={progress}
          status={
            progress >= 100 ? "Preparing the room" : "Loading room assets"
          }
        />
      )}
      <Canvas
        frameloop="demand"
        camera={{
          position: cfg.room.position,
          fov: cfg.fov,
          near: 0.01,
          far: 100,
        }}
        dpr={[1, 1.5]}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", onFailure);
        }}
      >
        <color attach="background" args={["#102b32"]} />
        <Suspense fallback={null}>
          <Scene
            active={active}
            enter={enter}
            onBusy={onBusy}
            onReady={onReady}
          />
        </Suspense>
      </Canvas>
    </>
  );
}
