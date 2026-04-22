import React, { useEffect, useRef, useState, useCallback } from 'react';
import { assetManager } from '../store/assetStore';
import type { Asset } from '../types/assets';
import './SVGAnimator.css';

interface Layer {
  id: number;
  assetId: string;
  x: number;
  y: number;
  w: number;
  h: number;
  opacity: number;
  z: number;
  anim: string;
  animDur: number;
  animDelay: number;
  animEase: string;
}

interface Emitter {
  id: number;
  name: string;
  x: number;
  y: number;
  z: number;
  radius: number;
  variants: Array<{ assetId: string; weight: number }>;
  particles: Particle[];
  _acc: number;
  active: boolean;
  config: EmitterConfig;
}

interface EmitterConfig {
  rate: number;
  burst: number;
  life: number;
  lifeVar: number;
  angle: number;
  angleSpread: number;
  speed: number;
  speedVar: number;
  gravity: number;
  wind: number;
  turb: number;
  damping: number;
  sizeMin: number;
  sizeMax: number;
  rotSpeed: number;
  rotSpeedVar: number;
  fadeIn: number;
  fadeOut: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  rotV: number;
  life: number;
  maxLife: number;
  size: number;
  assetId: string;
  tPhase: number;
}

const ANIMS = {
  pulse: `@keyframes anim_pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}`,
  float: `@keyframes anim_float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}`,
  rotate: `@keyframes anim_rotate{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`,
  shake: `@keyframes anim_shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}`
};

export default function SVGAnimator() {
  const [svgAssets, setSvgAssets] = useState<Asset[]>([]);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [emitters, setEmitters] = useState<Emitter[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<number | null>(null);
  const [selectedEmitterId, setSelectedEmitterId] = useState<number | null>(null);
  const [canvasW, setCanvasW] = useState(800);
  const [canvasH, setCanvasH] = useState(600);
  const [transparentBg, setTransparentBg] = useState(false);
  const [bgColor, setBgColor] = useState('#0d0d1a');
  const [previewMode, setPreviewMode] = useState(false);

  const nextIdRef = useRef(1);
  const canvasFrameRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const draggingAssetIdRef = useRef<string | null>(null);
  const particleImagesRef = useRef<Record<string, HTMLImageElement>>({});
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Inject CSS animations
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.textContent = Object.values(ANIMS).join('\n');
    document.head.appendChild(styleEl);
    return () => styleEl.remove();
  }, []);

  // Load SVG assets from assetManager
  useEffect(() => {
    loadSvgAssets();

    const handleAssetsUpdated = () => {
      loadSvgAssets();
    };

    window.addEventListener('assets-updated', handleAssetsUpdated);
    return () => window.removeEventListener('assets-updated', handleAssetsUpdated);
  }, []);

  const loadSvgAssets = () => {
    const allAssets = assetManager.listAssets();
    const svgs = allAssets.filter(asset => asset.type === 'svg');
    setSvgAssets(svgs);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
        try {
          await assetManager.addAsset(file);
        } catch (error) {
          console.error('Failed to add SVG:', error);
        }
      }
    }

    e.target.value = '';
    loadSvgAssets();
  };

  const handleLibDragStart = (e: React.DragEvent, assetId: string) => {
    draggingAssetIdRef.current = assetId;
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggingAssetIdRef.current === null || !canvasFrameRef.current) return;

    const rect = canvasFrameRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    addLayer(draggingAssetIdRef.current, x, y);
    draggingAssetIdRef.current = null;
  };

  const addLayer = (assetId: string, cx: number, cy: number) => {
    const asset = assetManager.getAsset(assetId);
    if (!asset || !canvasFrameRef.current) return;

    const id = nextIdRef.current++;
    const w = 120, h = 120;
    const x = Math.max(0, cx - w / 2);
    const y = Math.max(0, cy - h / 2);
    const maxZ = layers.reduce((m, l) => Math.max(m, l.z || 0), 0);

    const newLayer: Layer = {
      id,
      assetId,
      x,
      y,
      w,
      h,
      opacity: 1,
      z: maxZ + 1,
      anim: 'none',
      animDur: 2,
      animDelay: 0,
      animEase: 'ease'
    };

    setLayers(prev => [...prev, newLayer]);
    setSelectedLayerId(id);
  };

  const deleteLayer = (id: number) => {
    setLayers(prev => prev.filter(l => l.id !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  const selectLayer = (id: number) => {
    setSelectedLayerId(id);
    setSelectedEmitterId(null);
  };

  const updateLayerAnim = (layerId: number, anim: string) => {
    setLayers(prev => prev.map(l => l.id === layerId ? { ...l, anim } : l));
  };

  const handlePreview = () => {
    setPreviewMode(true);
    startParticles();
  };

  const handleStopPreview = () => {
    setPreviewMode(false);
    stopParticles();
  };

  const startParticles = () => {
    setEmitters(prev => prev.map(em => ({ ...em, active: true, particles: [], _acc: 0 })));
    lastTimeRef.current = performance.now();
    animateParticles();
  };

  const stopParticles = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setEmitters(prev => prev.map(em => ({ ...em, active: false, particles: [], _acc: 0 })));
  };

  const animateParticles = () => {
    animFrameRef.current = requestAnimationFrame(animateParticles);
    const now = performance.now();
    const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
    lastTimeRef.current = now;

    setEmitters(prev => prev.map(em => {
      if (!em.active || !em.variants.length) return em;

      const c = em.config;
      let newAcc = em._acc + c.rate * dt;
      const newParticles = [...em.particles];

      while (newAcc >= 1) {
        newParticles.push(spawnParticle(em));
        newAcc -= 1;
      }

      const updatedParticles = newParticles.map(p => {
        const newP = { ...p };
        newP.life += dt;
        newP.vy += c.gravity * dt;
        newP.vx += c.wind * dt * 0.1;

        if (c.turb > 0) {
          newP.tPhase += dt * 1.8;
          newP.vx += Math.sin(newP.tPhase * 2.1 + newP.x * 0.02) * c.turb * 30 * dt;
          newP.vy += Math.cos(newP.tPhase * 1.7 + newP.y * 0.015) * c.turb * 20 * dt;
        }

        if (c.damping > 0) {
          const d = 1 - c.damping * dt * 3;
          newP.vx *= d;
          newP.vy *= d;
        }

        newP.x += newP.vx * dt;
        newP.y += newP.vy * dt;
        newP.rot += newP.rotV * dt;

        return newP;
      }).filter(p => p.life < p.maxLife);

      return { ...em, particles: updatedParticles, _acc: newAcc };
    }));
  };

  const spawnParticle = (em: Emitter): Particle => {
    const c = em.config;
    const ang = Math.random() * Math.PI * 2;
    const dist = Math.sqrt(Math.random()) * em.radius;
    const x = em.x + Math.cos(ang) * dist;
    const y = em.y + Math.sin(ang) * dist;

    const dir = (c.angle + (Math.random() - 0.5) * c.angleSpread * 2) * Math.PI / 180;
    const dirAdj = dir - Math.PI / 2;
    const speed = c.speed * (1 + (Math.random() - 0.5) * c.speedVar * 2);

    const life = c.life * (1 + (Math.random() - 0.5) * c.lifeVar * 2);
    const rotV = c.rotSpeed * (Math.random() > 0.5 ? 1 : -1) * (1 + (Math.random() - 0.5) * c.rotSpeedVar * 2);
    const size = c.sizeMin + Math.random() * (c.sizeMax - c.sizeMin);

    const assetId = pickVariant(em);

    return {
      x, y,
      vx: Math.cos(dirAdj) * speed,
      vy: Math.sin(dirAdj) * speed,
      rot: Math.random() * 360,
      rotV,
      life: 0,
      maxLife: Math.max(0.1, life),
      size,
      assetId: assetId || '',
      tPhase: Math.random() * Math.PI * 2
    };
  };

  const pickVariant = (em: Emitter): string | null => {
    if (!em.variants.length) return null;
    const total = em.variants.reduce((s, v) => s + v.weight, 0);
    let r = Math.random() * total;
    for (const v of em.variants) {
      r -= v.weight;
      if (r <= 0) return v.assetId;
    }
    return em.variants[0].assetId;
  };

  const getParticleImage = (assetId: string): HTMLImageElement | null => {
    if (particleImagesRef.current[assetId]) return particleImagesRef.current[assetId];
    const dataUrl = assetManager.getAssetDataUrl(assetId);
    if (!dataUrl) return null;
    const img = new Image();
    img.src = dataUrl;
    particleImagesRef.current[assetId] = img;
    return img;
  };

  const selectedLayer = layers.find(l => l.id === selectedLayerId);
  const selectedAsset = selectedLayer ? assetManager.getAsset(selectedLayer.assetId) : null;

  return (
    <div className="svg-animator">
      {/* Header Buttons */}
      <div className="sa-header">
        <button className="sa-header-btn" onClick={handlePreview}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
            <path d="M8 5v14l11-7z"/>
          </svg>
          Preview
        </button>
        <button className="sa-header-btn" onClick={handleStopPreview}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
            <rect x="6" y="6" width="12" height="12"/>
          </svg>
          Stop
        </button>
        <div style={{ flex: 1 }} />
        <button className="sa-header-btn sa-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </svg>
          Export SVG
        </button>
      </div>

      <div className="sa-content">
        {/* Left Panel - Library */}
        <div className="sa-left">
          <div className="sa-panel-header">
            <span>SVG Library</span>
            <button className="sa-header-icon-btn" onClick={() => fileInputRef.current?.click()} title="Add SVG">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".svg,image/svg+xml"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <div className="sa-upload-zone" onClick={() => fileInputRef.current?.click()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
            <span>Drop SVG files here<br/>or click to upload</span>
          </div>
          <div className="sa-library-list">
            {svgAssets.length === 0 ? (
              <p className="sa-no-items">No SVGs uploaded yet</p>
            ) : (
              svgAssets.map(asset => (
                <div
                  key={asset.id}
                  className="sa-lib-item"
                  draggable
                  onDragStart={(e) => handleLibDragStart(e, asset.id)}
                >
                  <div className="sa-lib-thumb">
                    <img src={asset.data} alt={asset.name} />
                  </div>
                  <span className="sa-lib-name">{asset.name}</span>
                </div>
              ))
            )}
          </div>

          <div className="sa-panel-header" style={{ marginTop: 'auto' }}>
            <span>Layers</span>
            <span className="sa-tag">{layers.length}</span>
          </div>
          <div className="sa-layer-list">
            {layers.length === 0 ? (
              <p className="sa-no-items">Drag SVG onto canvas</p>
            ) : (
              [...layers].sort((a, b) => b.z - a.z).map(layer => {
                const asset = assetManager.getAsset(layer.assetId);
                return (
                  <div
                    key={layer.id}
                    className={`sa-layer-item ${selectedLayerId === layer.id ? 'active' : ''}`}
                    onClick={() => selectLayer(layer.id)}
                  >
                    <span className="sa-layer-icon">◧</span>
                    <span className="sa-layer-name">{asset?.name || 'layer'}</span>
                    <span className="sa-layer-z">{layer.z}</span>
                    <button
                      className="sa-layer-del"
                      onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }}
                    >
                      ✕
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="sa-canvas-area" onDragOver={handleCanvasDragOver} onDrop={handleCanvasDrop}>
          <div
            ref={canvasFrameRef}
            className="sa-canvas-frame"
            style={{
              width: `${canvasW}px`,
              height: `${canvasH}px`,
              backgroundColor: transparentBg ? 'transparent' : bgColor
            }}
          >
            {layers.map(layer => {
              const asset = assetManager.getAsset(layer.assetId);
              if (!asset) return null;

              const animStyle = previewMode && layer.anim !== 'none'
                ? { animation: `anim_${layer.anim} ${layer.animDur}s ${layer.animEase} ${layer.animDelay}s infinite` }
                : {};

              return (
                <div
                  key={layer.id}
                  className={`sa-canvas-layer ${selectedLayerId === layer.id ? 'selected' : ''}`}
                  style={{
                    position: 'absolute',
                    left: `${layer.x}px`,
                    top: `${layer.y}px`,
                    width: `${layer.w}px`,
                    height: `${layer.h}px`,
                    opacity: layer.opacity,
                    zIndex: layer.z,
                    cursor: 'move'
                  }}
                  onClick={() => selectLayer(layer.id)}
                >
                  <img
                    src={asset.data}
                    alt={asset.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none',
                      display: 'block',
                      ...animStyle
                    }}
                  />
                </div>
              );
            })}

            {emitters.map(em => (
              <canvas
                key={em.id}
                width={canvasW}
                height={canvasH}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  pointerEvents: 'none',
                  zIndex: em.z
                }}
                ref={(canvas) => {
                  if (!canvas) return;
                  const ctx = canvas.getContext('2d');
                  if (!ctx) return;
                  ctx.clearRect(0, 0, canvasW, canvasH);

                  em.particles.forEach(p => {
                    const img = getParticleImage(p.assetId);
                    if (!img) return;

                    let alpha = 1;
                    const lr = p.life / p.maxLife;
                    const c = em.config;
                    if (c.fadeIn > 0 && lr < c.fadeIn) alpha = lr / c.fadeIn;
                    if (c.fadeOut > 0 && lr > (1 - c.fadeOut)) alpha = (1 - lr) / c.fadeOut;
                    alpha = Math.max(0, Math.min(1, alpha));

                    ctx.save();
                    ctx.globalAlpha = alpha;
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rot * Math.PI / 180);
                    ctx.drawImage(img, -p.size / 2, -p.size / 2, p.size, p.size);
                    ctx.restore();
                  });
                }}
              />
            ))}
          </div>
        </div>

        {/* Right Panel - Properties */}
        <div className="sa-right">
          <div className="sa-panel-header">
            <span>Canvas</span>
          </div>
          <div className="sa-panel-section">
            <div className="sa-row2">
              <div className="sa-field">
                <label>Width</label>
                <input
                  type="number"
                  value={canvasW}
                  min="100"
                  max="3000"
                  onChange={(e) => setCanvasW(parseInt(e.target.value) || 800)}
                />
              </div>
              <div className="sa-field">
                <label>Height</label>
                <input
                  type="number"
                  value={canvasH}
                  min="100"
                  max="3000"
                  onChange={(e) => setCanvasH(parseInt(e.target.value) || 600)}
                />
              </div>
            </div>
            <div className="sa-row2">
              <div className="sa-field">
                <label>Background</label>
                <select
                  value={transparentBg ? 'transparent' : 'color'}
                  onChange={(e) => setTransparentBg(e.target.value === 'transparent')}
                >
                  <option value="color">Color</option>
                  <option value="transparent">Transparent</option>
                </select>
              </div>
              <div className="sa-field">
                <label>Color</label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  disabled={transparentBg}
                />
              </div>
            </div>
          </div>

          {selectedLayer && (
            <>
              <div className="sa-panel-header">
                <span>Layer: {selectedAsset?.name}</span>
              </div>
              <div className="sa-panel-section">
                <div className="sa-section-label">CSS Animation</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
                  {['none', 'pulse', 'float', 'rotate', 'shake'].map(anim => (
                    <button
                      key={anim}
                      className={`sa-anim-chip ${selectedLayer.anim === anim ? 'active' : ''}`}
                      onClick={() => updateLayerAnim(selectedLayer.id, anim)}
                    >
                      {anim}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
