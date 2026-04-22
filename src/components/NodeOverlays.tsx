import { useEffect, useState } from 'react';
import useStore from '../store/useStore';
import './NodeOverlays.css';

export default function NodeOverlays() {
  const tree = useStore(state => state.tree);
  const selectedNodeId = useStore(state => state.selectedNodeId);
  const selectNode = useStore(state => state.selectNode);
  const zoom = useStore(state => state.zoom);
  const pan = useStore(state => state.pan);
  const [overlays, setOverlays] = useState<Array<{
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    label: string;
  }>>([]);

  useEffect(() => {
    const viewport = document.getElementById('canvasFrame');
    if (!viewport) return;

    const newOverlays: typeof overlays = [];

    tree.forEach(node => {
      if (node.visible === false || node.visible === 'false') return;
      if (node.type === 'ColorRect') return;
      if (node.locked) return;

      const element = document.getElementById(`node_${node.id}`);
      if (!element) return;

      const nodeRect = element.getBoundingClientRect();
      const viewportRect = viewport.getBoundingClientRect();

      // Calculate position relative to viewport and compensate for zoom
      const x = (nodeRect.left - viewportRect.left) / zoom;
      const y = (nodeRect.top - viewportRect.top) / zoom;
      const w = nodeRect.width / zoom;
      const h = nodeRect.height / zoom;

      if (w < 2 || h < 2) return;

      newOverlays.push({
        id: node.id,
        x,
        y,
        w,
        h,
        label: node.label || node.type
      });
    });

    setOverlays(newOverlays);
  }, [tree, zoom, pan]);

  const handleOverlayClick = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    selectNode(nodeId);
  };

  const handleBackgroundClick = () => {
    selectNode(null);
  };

  return (
    <div
      className="node-overlays"
      style={{
        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        transformOrigin: '0 0'
      }}
      onClick={handleBackgroundClick}
    >
      {overlays.map(overlay => (
        <div
          key={overlay.id}
          className={`nov ${overlay.id === selectedNodeId ? 'sel' : ''}`}
          data-nid={overlay.id}
          style={{
            left: `${overlay.x}px`,
            top: `${overlay.y}px`,
            width: `${overlay.w}px`,
            height: `${overlay.h}px`
          }}
          onClick={(e) => handleOverlayClick(e, overlay.id)}
        >
          <div className="nlbl">{overlay.label}</div>
          {overlay.id === selectedNodeId && (
            <>
              <div className="rh rh-tl" />
              <div className="rh rh-tr" />
              <div className="rh rh-bl" />
              <div className="rh rh-br" />
              <div className="rh rh-tm" />
              <div className="rh rh-bm" />
              <div className="rh rh-ml" />
              <div className="rh rh-mr" />
            </>
          )}
        </div>
      ))}
    </div>
  );
}
