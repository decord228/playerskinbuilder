import React, { useState } from 'react';
import { assetManager } from '../store/assetStore';
import './SVGPicker.css';

interface SVGPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SVGPicker({ value, onChange }: SVGPickerProps) {
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const assetId = e.dataTransfer.getData('asset-id');
    if (assetId) {
      const asset = assetManager.getAsset(assetId);
      if (asset && asset.type === 'svg') {
        // Extract SVG content from data URL
        const svgContent = atob(asset.data.split(',')[1]);
        onChange(svgContent);
      }
    }
  };

  const handleClear = () => {
    onChange('<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>');
  };

  const handleSelectAsset = (assetId: string) => {
    const asset = assetManager.getAsset(assetId);
    if (asset && asset.type === 'svg') {
      const svgContent = atob(asset.data.split(',')[1]);
      onChange(svgContent);
      setShowAssetPicker(false);
    }
  };

  const getSvgPreview = (): string | null => {
    if (!value) return null;

    // Convert SVG string to data URL for preview
    const encoded = btoa(value);
    return `data:image/svg+xml;base64,${encoded}`;
  };

  const previewUrl = getSvgPreview();
  const assets = assetManager.listAssets().filter(a => a.type === 'svg');

  return (
    <div className="svg-picker">
      <div
        className={`svg-picker-dropzone ${isDragging ? 'dragging' : ''} ${previewUrl ? 'has-preview' : ''}`}
        onClick={() => setShowAssetPicker(true)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <div className="svg-preview">
            <img src={previewUrl} alt="SVG preview" />
            <button
              className="svg-clear"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              title="Reset to default"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
              </svg>
            </button>
          </div>
        ) : (
          <div className="svg-placeholder">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <span>Drag SVG from files</span>
          </div>
        )}
      </div>

      {showAssetPicker && (
        <div className="asset-picker-modal" onClick={() => setShowAssetPicker(false)}>
          <div className="asset-picker-content" onClick={(e) => e.stopPropagation()}>
            <div className="asset-picker-header">
              <span>Select SVG</span>
              <button onClick={() => setShowAssetPicker(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="asset-picker-grid">
              {assets.length === 0 ? (
                <div className="asset-picker-empty">
                  <span>No SVG files available. Drag SVG files into the window to upload.</span>
                </div>
              ) : (
                assets.map(asset => (
                  <div
                    key={asset.id}
                    className="asset-picker-item"
                    onClick={() => handleSelectAsset(asset.id)}
                  >
                    <img src={asset.data} alt={asset.name} />
                    <span>{asset.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
