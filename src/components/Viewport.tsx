import React, { useRef, useEffect, useState } from 'react';
import useStore from '../store/useStore';
import { renderNodeTree } from '../utils/nodeRenderer';
import NodeOverlays from './NodeOverlays';
import ContainerOverlays from './ContainerOverlays';
import TestMode from './TestMode';
import './Viewport.css';
import './NodeStyles.css';

export default function Viewport() {
  const { tree, mode, zoom, pan, setZoom, setPan, showContainerOverlays, toggleContainerOverlays } = useStore();
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [spacePressed, setSpacePressed] = useState(false);

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.1, 3));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.1, 0.1));
  const handleZoomReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Wheel zoom
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        // Zoom with Ctrl/Cmd + wheel
        e.preventDefault();
        const delta = -e.deltaY * 0.001;
        const newZoom = Math.max(0.1, Math.min(3, zoom + delta));
        setZoom(newZoom);
      } else if (e.shiftKey) {
        // Horizontal pan with Shift + wheel
        e.preventDefault();
        setPan({ x: pan.x - e.deltaY, y: pan.y });
      } else {
        // Vertical pan with wheel
        e.preventDefault();
        setPan({ x: pan.x - e.deltaX, y: pan.y - e.deltaY });
      }
    };

    wrapper.addEventListener('wheel', handleWheel, { passive: false });
    return () => wrapper.removeEventListener('wheel', handleWheel);
  }, [zoom, pan, setZoom, setPan]);

  // Pan with middle mouse button or Space + drag
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleMouseDown = (e) => {
      if (e.button === 1 || (e.button === 0 && spacePressed)) {
        e.preventDefault();
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        wrapper.style.cursor = 'grabbing';
      }
    };

    const handleMouseMove = (e) => {
      if (isPanning) {
        setPan({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y
        });
      } else if (spacePressed) {
        wrapper.style.cursor = 'grab';
      }
    };

    const handleMouseUp = (e) => {
      if (e.button === 1 || e.button === 0) {
        setIsPanning(false);
        wrapper.style.cursor = spacePressed ? 'grab' : 'default';
      }
    };

    wrapper.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      wrapper.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, panStart, pan, setPan, spacePressed]);

  // Space key for pan mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !e.repeat && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setSpacePressed(true);
        if (wrapperRef.current) {
          wrapperRef.current.style.cursor = 'grab';
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        setSpacePressed(false);
        if (wrapperRef.current && !isPanning) {
          wrapperRef.current.style.cursor = 'default';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPanning]);

  // Render nodes when tree changes or mode changes
  useEffect(() => {
    if (canvasRef.current && tree.length > 0 && mode === 'edit') {
      console.log('Rendering tree:', tree.length, 'nodes');
      try {
        renderNodeTree(tree, canvasRef.current);
        console.log('Render complete');
      } catch (error) {
        console.error('Render error:', error);
      }
    }
  }, [tree, mode]);

  // Show TestMode when in test mode
  if (mode === 'test') {
    return <TestMode />;
  }

  return (
    <div className="viewport-container">
      <div className="viewport-toolbar">
        <div className="vtb-group">
          <button className="vtb" onClick={handleZoomOut} title="Zoom Out (Ctrl + Wheel)">−</button>
          <span className="zdsp">{Math.round(zoom * 100)}%</span>
          <button className="vtb" onClick={handleZoomIn} title="Zoom In (Ctrl + Wheel)">+</button>
          <button className="vtb" onClick={handleZoomReset} title="Reset View (Ctrl + 0)">Reset</button>
        </div>
        <div className="vsep" />
        <div className="vtb-group">
          <button
            className={`vtb ${showContainerOverlays ? 'active' : ''}`}
            onClick={toggleContainerOverlays}
            title="Show container overlays"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M9 3v18M15 3v18M3 9h18M3 15h18" opacity="0.5"/>
            </svg>
          </button>
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          1920 × 1080 | Pan: {Math.round(pan.x)}, {Math.round(pan.y)}
        </div>
      </div>
      <div className="varea" ref={wrapperRef}>
        <div className="cwrap">
          <div
            className="cframe"
            id="canvasFrame"
            ref={canvasRef}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0'
            }}
          >
          </div>
          <ContainerOverlays />
          <NodeOverlays />
        </div>
      </div>
    </div>
  );
}
