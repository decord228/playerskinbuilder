import { useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import './ContainerOverlays.css';

export default function ContainerOverlays() {
  const tree = useStore(state => state.tree);
  const showContainerOverlays = useStore(state => state.showContainerOverlays);
  const selectedNodeId = useStore(state => state.selectedNodeId);
  const zoom = useStore(state => state.zoom);
  const pan = useStore(state => state.pan);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const viewport = document.getElementById('canvasFrame');

    if (!viewport) return;

    // Set canvas size to match canvas frame (1920x1080)
    canvas.width = 1920;
    canvas.height = 1080;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // If overlays are disabled, just clear and return
    if (!showContainerOverlays) return;

    // Container types to visualize
    const containerTypes = ['HBoxContainer', 'VBoxContainer', 'PanelContainer', 'MarginContainer', 'AutoHideContainer'];

    // Draw overlays for all containers
    tree.forEach(node => {
      if (!containerTypes.includes(node.type)) return;
      if (node.visible === false || node.visible === 'false') return;

      // Check parent visibility
      let parentVisible = true;
      let parent = node.pid ? tree.find(n => n.id === node.pid) : null;
      while (parent) {
        if (parent.visible === false || parent.visible === 'false') {
          parentVisible = false;
          break;
        }
        parent = parent.pid ? tree.find(n => n.id === parent.pid) : null;
      }
      if (!parentVisible) return;

      const element = document.getElementById(`node_${node.id}`);
      if (!element) return;

      const nodeRect = element.getBoundingClientRect();
      const viewportRect = viewport.getBoundingClientRect();

      // Calculate position relative to viewport (in canvas coordinates)
      const x = nodeRect.left - viewportRect.left;
      const y = nodeRect.top - viewportRect.top;
      const w = nodeRect.width;
      const h = nodeRect.height;

      // Skip if element is outside viewport or has invalid dimensions
      if (w <= 0 || h <= 0 || x + w < 0 || y + h < 0 || x > canvas.width || y > canvas.height) return;

      const isSelected = node.id === selectedNodeId;

      // Draw container border with type-specific color
      let borderColor;
      switch (node.type) {
        case 'HBoxContainer':
          borderColor = 'rgba(255, 100, 100, 0.6)';
          break;
        case 'VBoxContainer':
          borderColor = 'rgba(100, 255, 100, 0.6)';
          break;
        case 'PanelContainer':
          borderColor = 'rgba(100, 100, 255, 0.6)';
          break;
        case 'MarginContainer':
          borderColor = 'rgba(255, 200, 100, 0.6)';
          break;
        case 'AutoHideContainer':
          borderColor = 'rgba(200, 100, 255, 0.6)';
          break;
        default:
          borderColor = 'rgba(255, 255, 255, 0.4)';
      }

      // Draw dashed border
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);

      // Draw corner markers
      const markerSize = 8;
      ctx.fillStyle = borderColor;
      // Top-left
      ctx.fillRect(x - 1, y - 1, markerSize, 2);
      ctx.fillRect(x - 1, y - 1, 2, markerSize);
      // Top-right
      ctx.fillRect(x + w - markerSize + 1, y - 1, markerSize, 2);
      ctx.fillRect(x + w - 1, y - 1, 2, markerSize);
      // Bottom-left
      ctx.fillRect(x - 1, y + h - 1, markerSize, 2);
      ctx.fillRect(x - 1, y + h - markerSize + 1, 2, markerSize);
      // Bottom-right
      ctx.fillRect(x + w - markerSize + 1, y + h - 1, markerSize, 2);
      ctx.fillRect(x + w - 1, y + h - markerSize + 1, 2, markerSize);

      // Draw type label
      ctx.fillStyle = borderColor;
      ctx.font = 'bold 10px Montserrat, sans-serif';
      const labelText = node.type.replace('Container', '');
      const labelWidth = ctx.measureText(labelText).width + 8;
      const labelHeight = 16;

      ctx.fillRect(x, y - labelHeight - 2, labelWidth, labelHeight);
      ctx.fillStyle = '#000000';
      ctx.fillText(labelText, x + 4, y - 6);

      // Draw separation lines for HBox/VBox
      if (node.type === 'HBoxContainer' || node.type === 'VBoxContainer') {
        const separation = parseFloat(node.props?.separation || 10);
        const children = node.children || [];

        // Filter only visible children
        const visibleChildren = children.filter(childId => {
          const child = tree.find(n => n.id === childId);
          if (!child || child.visible === false || child.visible === 'false') return false;
          const childEl = document.getElementById(`node_${childId}`);
          return childEl !== null;
        });

        if (visibleChildren.length > 1) {
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 2]);

          visibleChildren.forEach((childId, idx) => {
            if (idx === 0) return;
            const childEl = document.getElementById(`node_${childId}`);
            if (!childEl) return;

            const childRect = childEl.getBoundingClientRect();
            const viewportRect = viewport.getBoundingClientRect();
            const cx = childRect.left - viewportRect.left;
            const cy = childRect.top - viewportRect.top;

            // Get previous visible child for accurate gap calculation
            const prevChildId = visibleChildren[idx - 1];
            const prevChildEl = document.getElementById(`node_${prevChildId}`);
            if (!prevChildEl) return;

            const prevChildRect = prevChildEl.getBoundingClientRect();

            if (node.type === 'HBoxContainer') {
              // Vertical line between children
              const prevRight = prevChildRect.right - viewportRect.left;
              const actualGap = cx - prevRight;

              if (actualGap > 1) {
                const lineX = prevRight + actualGap / 2;
                ctx.beginPath();
                ctx.moveTo(lineX, y + 5);
                ctx.lineTo(lineX, y + h - 5);
                ctx.stroke();

                // Draw separation value
                ctx.fillStyle = borderColor;
                ctx.font = '9px Montserrat, sans-serif';
                const sepText = `${Math.round(actualGap)}px`;
                const sepWidth = ctx.measureText(sepText).width;
                ctx.fillRect(lineX - sepWidth / 2 - 2, y + h / 2 - 6, sepWidth + 4, 12);
                ctx.fillStyle = '#000000';
                ctx.fillText(sepText, lineX - sepWidth / 2, y + h / 2 + 3);
              }
            } else {
              // Horizontal line between children
              const prevBottom = prevChildRect.bottom - viewportRect.top;
              const actualGap = cy - prevBottom;

              if (actualGap > 1) {
                const lineY = prevBottom + actualGap / 2;
                ctx.beginPath();
                ctx.moveTo(x + 5, lineY);
                ctx.lineTo(x + w - 5, lineY);
                ctx.stroke();

                // Draw separation value
                ctx.fillStyle = borderColor;
                ctx.font = '9px Montserrat, sans-serif';
                const sepText = `${Math.round(actualGap)}px`;
                const sepWidth = ctx.measureText(sepText).width;
                ctx.fillRect(x + w / 2 - sepWidth / 2 - 2, lineY - 6, sepWidth + 4, 12);
                ctx.fillStyle = '#000000';
                ctx.fillText(sepText, x + w / 2 - sepWidth / 2, lineY + 3);
              }
            }
          });

          ctx.setLineDash([]);
        }
      }

      // Draw margin indicators for MarginContainer
      if (node.type === 'MarginContainer') {
        const ml = parseFloat(node.props?.margin_left || 0);
        const mt = parseFloat(node.props?.margin_top || 0);
        const mr = parseFloat(node.props?.margin_right || 0);
        const mb = parseFloat(node.props?.margin_bottom || 0);

        ctx.strokeStyle = 'rgba(255, 200, 100, 0.4)';
        ctx.fillStyle = 'rgba(255, 200, 100, 0.1)';
        ctx.lineWidth = 1;

        // Left margin
        if (ml > 0) {
          ctx.fillRect(x, y, ml, h);
          ctx.strokeRect(x, y, ml, h);
        }
        // Top margin
        if (mt > 0) {
          ctx.fillRect(x, y, w, mt);
          ctx.strokeRect(x, y, w, mt);
        }
        // Right margin
        if (mr > 0) {
          ctx.fillRect(x + w - mr, y, mr, h);
          ctx.strokeRect(x + w - mr, y, mr, h);
        }
        // Bottom margin
        if (mb > 0) {
          ctx.fillRect(x, y + h - mb, w, mb);
          ctx.strokeRect(x, y + h - mb, w, mb);
        }

        // Draw margin values
        ctx.fillStyle = borderColor;
        ctx.font = 'bold 9px Montserrat, sans-serif';
        if (ml > 5) ctx.fillText(`L:${ml}`, x + 2, y + h / 2);
        if (mt > 5) ctx.fillText(`T:${mt}`, x + w / 2 - 10, y + 10);
        if (mr > 5) ctx.fillText(`R:${mr}`, x + w - mr + 2, y + h / 2);
        if (mb > 5) ctx.fillText(`B:${mb}`, x + w / 2 - 10, y + h - 4);
      }
    });
  }, [tree, showContainerOverlays, selectedNodeId, zoom, pan]);

  // Don't render canvas if overlays are disabled
  if (!showContainerOverlays) return null;

  return (
    <canvas
      ref={canvasRef}
      id="containerOverlaysCanvas"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 999,
        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        transformOrigin: '0 0'
      }}
    />
  );
}
