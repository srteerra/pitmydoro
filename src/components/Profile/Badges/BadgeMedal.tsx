'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Box, Center, Text } from '@chakra-ui/react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import tinycolor from 'tinycolor2';
import { BadgeGlyph } from '@/interfaces/Badge.interface';

interface Props {
  color: string;
  glyph: BadgeGlyph;
  label: string;
  locked?: boolean;
}

const GLYPH_SIZE = 512;
const VIEW_BOX = 24;
const IDLE_RESUME_MS = 2500;

const HEX_VERTICES: [number, number][] = [
  [0, 1],
  [0.866, 0.5],
  [0.866, -0.5],
  [0, -1],
  [-0.866, -0.5],
  [-0.866, 0.5],
];

const FACE_Z = 0.115;

const traceHex = <T extends THREE.Path>(path: T, radius: number): T => {
  HEX_VERTICES.forEach(([x, y], index) => {
    if (index === 0) path.moveTo(x * radius, y * radius);
    else path.lineTo(x * radius, y * radius);
  });

  path.closePath();
  return path;
};

const hexShape = (radius: number): THREE.Shape => traceHex(new THREE.Shape(), radius);

const hexRingShape = (outer: number, inner: number): THREE.Shape => {
  const shape = hexShape(outer);
  shape.holes.push(traceHex(new THREE.Path(), inner));
  return shape;
};

const drawGlyph = (glyph: BadgeGlyph): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = GLYPH_SIZE;
  canvas.height = GLYPH_SIZE;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const scale = GLYPH_SIZE / VIEW_BOX;
  ctx.scale(scale, scale);
  ctx.strokeStyle = '#ffffff';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = 1.85;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  glyph.paths?.forEach((path) => {
    const shape = new Path2D(path.d);
    if (path.fill) ctx.fill(shape);
    else ctx.stroke(shape);
  });

  glyph.circles?.forEach((circle) => {
    ctx.beginPath();
    ctx.arc(circle.cx, circle.cy, circle.r, 0, Math.PI * 2);
    if (circle.fill) ctx.fill();
    else ctx.stroke();
  });

  return canvas;
};

export const BadgeMedal = ({ color, glyph, label, locked = false }: Props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setFailed(true);
      return;
    }

    const width = mount.clientWidth || 320;
    const height = mount.clientHeight || 260;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = locked ? 0.82 : 1.05;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
    camera.position.set(0, 0.28, 4.5);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = environment.texture;

    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(2.5, 3, 4);
    scene.add(key);

    const rim = new THREE.DirectionalLight(0xffffff, 1.4);
    rim.position.set(-3, -1.5, -2);
    scene.add(rim);

    scene.add(new THREE.AmbientLight(0xffffff, 0.35));

    const medal = new THREE.Group();

    const surface = locked ? tinycolor(color).desaturate(88).darken(4).toString() : color;

    const bodyGeometry = new THREE.ExtrudeGeometry(hexShape(1), {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.045,
      bevelSize: 0.07,
      bevelSegments: 3,
      curveSegments: 1,
    });
    bodyGeometry.center();

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(surface),
      metalness: 0.92,
      roughness: locked ? 0.42 : 0.24,
    });
    medal.add(new THREE.Mesh(bodyGeometry, bodyMaterial));

    const ringGeometry = new THREE.ExtrudeGeometry(hexRingShape(0.82, 0.755), {
      depth: 0.025,
      bevelEnabled: false,
      curveSegments: 1,
    });
    ringGeometry.center();

    const ringMaterial = new THREE.MeshStandardMaterial({
      color: locked ? 0xb9bcc0 : 0xffffff,
      metalness: 1,
      roughness: locked ? 0.34 : 0.16,
    });

    const frontRing = new THREE.Mesh(ringGeometry, ringMaterial);
    frontRing.position.z = FACE_Z + 0.012;
    medal.add(frontRing);

    const backRing = new THREE.Mesh(ringGeometry, ringMaterial);
    backRing.position.z = -(FACE_Z + 0.012);
    medal.add(backRing);

    const glyphTexture = new THREE.CanvasTexture(drawGlyph(glyph));
    glyphTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    glyphTexture.colorSpace = THREE.SRGBColorSpace;

    const emblemGeometry = new THREE.PlaneGeometry(0.98, 0.98);
    const emblemMaterial = new THREE.MeshStandardMaterial({
      map: glyphTexture,
      color: new THREE.Color(locked ? 0xc4c8cc : 0xffffff),
      transparent: true,
      opacity: locked ? 0.8 : 1,
      metalness: 0.35,
      roughness: 0.3,
      depthWrite: false,
    });

    const frontEmblem = new THREE.Mesh(emblemGeometry, emblemMaterial);
    frontEmblem.position.z = FACE_Z + 0.03;
    medal.add(frontEmblem);

    const backEmblem = new THREE.Mesh(emblemGeometry, emblemMaterial);
    backEmblem.position.z = -(FACE_Z + 0.03);
    backEmblem.rotation.y = Math.PI;
    medal.add(backEmblem);

    medal.rotation.set(-0.16, -0.5, 0);
    scene.add(medal);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.9;
    controls.autoRotate = !reduceMotion;
    controls.autoRotateSpeed = 2.4;
    controls.minPolarAngle = Math.PI * 0.22;
    controls.maxPolarAngle = Math.PI * 0.78;

    let idleTimer: ReturnType<typeof setTimeout> | undefined;

    const pause = () => {
      controls.autoRotate = false;
      clearTimeout(idleTimer);
    };

    const resume = () => {
      clearTimeout(idleTimer);
      if (reduceMotion) return;
      idleTimer = setTimeout(() => {
        controls.autoRotate = true;
      }, IDLE_RESUME_MS);
    };

    controls.addEventListener('start', pause);
    controls.addEventListener('end', resume);

    let frame = 0;

    const animate = () => {
      frame = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const observer = new ResizeObserver(() => {
      const nextWidth = mount.clientWidth || width;
      const nextHeight = mount.clientHeight || height;
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    });

    observer.observe(mount);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(idleTimer);
      observer.disconnect();
      controls.removeEventListener('start', pause);
      controls.removeEventListener('end', resume);
      controls.dispose();
      bodyGeometry.dispose();
      ringGeometry.dispose();
      emblemGeometry.dispose();
      bodyMaterial.dispose();
      ringMaterial.dispose();
      emblemMaterial.dispose();
      glyphTexture.dispose();
      environment.texture.dispose();
      pmrem.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [color, glyph, locked]);

  if (failed) {
    return (
      <Center h='260px' borderRadius='2xl' bg='bg.muted'>
        <Text fontSize='sm' color='fg.muted'>
          {label}
        </Text>
      </Center>
    );
  }

  return (
    <Box
      ref={mountRef}
      data-pw-id='badge-medal-canvas'
      data-locked={locked}
      h={{ base: '240px', md: '280px' }}
      w='full'
      cursor='grab'
      _active={{ cursor: 'grabbing' }}
      css={{ '& canvas': { display: 'block', touchAction: 'none' } }}
    />
  );
};

export default BadgeMedal;
