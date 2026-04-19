import { useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import './NodeOverlays.css';

export default function NodeOverlays() {
  const tree = useStore(state => state.tree);
  const selectedNodeId = useStore(state => state.selectedNodeId);
  const zoom = useStore(state => state.zoom);
  const pan = useStore(state => state.pan);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size to match canvas frame (1920x1080)
    canvas.width = 1920;
    canvas.height = 1080;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const viewport = document.getElementById('canvasFrame');
    if (!viewport) return;

    // Draw overlays for all visible nodes
    tree.forEach(node => {
      if (node.visible === false || node.visible === 'false') return;
      if (node.type === 'ColorRect') return;
      if (node.locked) return;

      const element = document.getElementById(`node_${node.id}`);
      if (!element) return;

      const nodeRect = element.getBoundingClientRect();
      const viewportRect = viewport.getBoundingClientRect();

      // Calculate position relative to viewport (in canvas coordinates)
      const x = nodeRect.left - viewportRect.left;
      const y = nodeRect.top - viewportRect.top;
      const w = nodeRect.width;
      const h = nodeRect.height;

      const isSelected = node.id === selectedNodeId;

      if (isSelected) {
        // Draw full border for selected node
        ctx.strokeStyle = '#4a9eff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);

        // Draw label
        ctx.fillStyle = '#4a9eff';
        ctx.font = '11px Montserrat, sans-serif';
        const labelText = node.label || node.type;
        const labelWidth = ctx.measureText(labelText).width + 8;
        const labelHeight = 18;

        ctx.fillRect(x, y - labelHeight, labelWidth, labelHeight);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(labelText, x + 4, y - 5);

        // Draw resize handles
        const handleSize = 8;
        ctx.fillStyle = '#4a9eff';

        // Top-left
        ctx.fillRect(x - handleSize/2, y - handleSize/2, handleSize, handleSize);
        // Top-right
        ctx.fillRect(x + w - handleSize/2, y - handleSize/2, handleSize, handleSize);
        // Bottom-left
        ctx.fillRect(x - handleSize/2, y + h - handleSize/2, handleSize, handleSize);
        // Bottom-right
        ctx.fillRect(x + w - handleSize/2, y + h - handleSize/2, handleSize, handleSize);
        // Top-middle
        ctx.fillRect(x + w/2 - handleSize/2, y - handleSize/2, handleSize, handleSize);
        // Bottom-middle
        ctx.fillRect(x + w/2 - handleSize/2, y + h - handleSize/2, handleSize, handleSize);
        // Middle-left
        ctx.fillRect(x - handleSize/2, y + h/2 - handleSize/2, handleSize, handleSize);
        // Middle-right
        ctx.fillRect(x + w - handleSize/2, y + h/2 - handleSize/2, handleSize, handleSize);
      } else {
        // Draw corner markers for non-selected nodes
        const markerLength = 8;
        const markerThickness = 1;
        ctx.fillStyle = 'rgba(255,255,255,0.3)';

        // Top-left corner
        ctx.fillRect(x, y, markerLength, markerThickness);
        ctx.fillRect(x, y, markerThickness, markerLength);

        // Top-right corner
        ctx.fillRect(x + w - markerLength, y, markerLength, markerThickness);
        ctx.fillRect(x + w - markerThickness, y, markerThickness, markerLength);

        // Bottom-left corner
        ctx.fillRect(x, y + h - markerThickness, markerLength, markerThickness);
        ctx.fillRect(x, y + h - markerLength, markerThickness, markerLength);

        // Bottom-right corner
        ctx.fillRect(x + w - markerLength, y + h - markerThickness, markerLength, markerThickness);
        ctx.fillRect(x + w - markerThickness, y + h - markerLength, markerThickness, markerLength);
      }
    });
  }, [tree, selectedNodeId, zoom, pan]);

  return (
    <canvas
      ref={canvasRef}
      id="nodeOverlaysCanvas"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000,
        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        transformOrigin: '0 0'
      }}
    />
  );
}
