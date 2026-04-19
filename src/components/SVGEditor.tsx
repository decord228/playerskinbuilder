import React, { useState, useEffect } from 'react';
import { parseSVG, updateSVG, SVGProperties } from '../utils/svgUtils';

interface SVGEditorProps {
  svgData: string; // Base64 data URL
  onSave?: (newSvgData: string) => void;
}

export default function SVGEditor({ svgData, onSave }: SVGEditorProps) {
  const [svgString, setSvgString] = useState('');
  const [props, setProps] = useState<SVGProperties>({
    viewBox: '',
    width: '',
    height: '',
    fill: 'none',
    stroke: 'none',
    strokeWidth: '0'
  });
  const [previewSvg, setPreviewSvg] = useState('');

  useEffect(() => {
    // Decode base64 data URL to SVG string
    if (svgData.startsWith('data:image/svg+xml')) {
      const base64 = svgData.split(',')[1];
      const decoded = atob(base64);
      setSvgString(decoded);

      try {
        const parsed = parseSVG(decoded);
        setProps(parsed);
        setPreviewSvg(decoded);
      } catch (error) {
        console.error('Failed to parse SVG:', error);
      }
    }
  }, [svgData]);

  const handlePropChange = (key: keyof SVGProperties, value: string) => {
    const newProps = { ...props, [key]: value };
    setProps(newProps);

    try {
      const updated = updateSVG(svgString, { [key]: value });
      setPreviewSvg(updated);
    } catch (error) {
      console.error('Failed to update SVG:', error);
    }
  };

  const handleSave = () => {
    if (onSave && previewSvg) {
      // Convert SVG string to base64 data URL
      const base64 = btoa(previewSvg);
      const dataUrl = `data:image/svg+xml;base64,${base64}`;
      onSave(dataUrl);
    }
  };

  return (
    <>
      <div className="pitem" style={{ marginBottom: '12px' }}>
        <div style={{
          width: '100%',
          height: '80px',
          background: 'var(--bg-darkest)',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px'
        }} dangerouslySetInnerHTML={{ __html: previewSvg }} />
      </div>

      <div className="pitem">
        <label className="plabel">ViewBox</label>
        <input
          className="ptextinput"
          type="text"
          value={props.viewBox}
          onChange={(e) => handlePropChange('viewBox', e.target.value)}
          placeholder="0 0 24 24"
        />
      </div>

      <div className="pitem">
        <label className="plabel">Width</label>
        <input
          className="ptextinput"
          type="text"
          value={props.width}
          onChange={(e) => handlePropChange('width', e.target.value)}
          placeholder="24"
        />
      </div>

      <div className="pitem">
        <label className="plabel">Height</label>
        <input
          className="ptextinput"
          type="text"
          value={props.height}
          onChange={(e) => handlePropChange('height', e.target.value)}
          placeholder="24"
        />
      </div>

      <div className="pitem">
        <label className="plabel">Fill</label>
        <div className="pcolor-wrap">
          <input
            type="color"
            className="pcolor-picker"
            value={props.fill === 'none' ? '#ffffff' : props.fill}
            onChange={(e) => handlePropChange('fill', e.target.value)}
          />
          <input
            className="ptextinput"
            type="text"
            value={props.fill}
            onChange={(e) => handlePropChange('fill', e.target.value)}
            placeholder="none"
            style={{ flex: 1 }}
          />
        </div>
      </div>

      <div className="pitem">
        <label className="plabel">Stroke</label>
        <div className="pcolor-wrap">
          <input
            type="color"
            className="pcolor-picker"
            value={props.stroke === 'none' ? '#000000' : props.stroke}
            onChange={(e) => handlePropChange('stroke', e.target.value)}
          />
          <input
            className="ptextinput"
            type="text"
            value={props.stroke}
            onChange={(e) => handlePropChange('stroke', e.target.value)}
            placeholder="none"
            style={{ flex: 1 }}
          />
        </div>
      </div>

      <div className="pitem">
        <label className="plabel">Stroke Width</label>
        <input
          className="ptextinput"
          type="number"
          min="0"
          max="10"
          step="0.5"
          value={props.strokeWidth}
          onChange={(e) => handlePropChange('strokeWidth', e.target.value)}
        />
      </div>

      {onSave && (
        <div className="pitem">
          <button
            style={{
              width: '100%',
              padding: '6px 12px',
              background: 'var(--accent)',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
            onClick={handleSave}
          >
            Apply Changes
          </button>
        </div>
      )}
    </>
  );
}
