import React, { useState, useRef } from 'react';
import { assetManager } from '../store/assetStore';
import './IconPicker.css';

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export default function IconPicker({ value, onChange }: IconPickerProps) {
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
      // Store the file path directly (e.g., "Frame 2147226027.svg" or "folder/file.svg")
      onChange(assetId);
    }
  };

  const handleClear = () => {
    onChange('');
  };

  const handleSelectAsset = (assetId: string) => {
    onChange(`asset:${assetId}`);
    setShowAssetPicker(false);
  };

  const getPreviewUrl = (): string | null => {
    if (!value) return null;

    if (value.startsWith('asset:')) {
      const assetId = value.replace('asset:', '');
      const asset = assetManager.getAsset(assetId);
      return asset ? asset.data : null;
    }

    // Check if it's a file path (e.g., "Frame 2147226027.svg")
    if (!value.startsWith('data:') && !value.startsWith('http') && !value.startsWith('<svg')) {
      const asset = assetManager.getAsset(value);
      return asset ? asset.data : null;
    }

    // Legacy: direct SVG or URL
    if (value.startsWith('data:') || value.startsWith('http')) {
      return value;
    }

    return null;
  };

  const previewUrl = getPreviewUrl();
  const assets = assetManager.listAssets();

  return (
    <div className="icon-picker">
      <div
        className={`icon-picker-dropzone ${isDragging ? 'dragging' : ''} ${previewUrl ? 'has-preview' : ''}`}
        onClick={() => setShowAssetPicker(true)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <div className="icon-preview">
            <img src={previewUrl} alt="Icon preview" />
            <button
              className="icon-clear"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              title="Clear icon"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        ) : (
          <div className="icon-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>Select from files</span>
          </div>
        )}
      </div>

      {showAssetPicker && (
        <div className="asset-picker-modal" onClick={() => setShowAssetPicker(false)}>
          <div className="asset-picker-content" onClick={(e) => e.stopPropagation()}>
            <div className="asset-picker-header">
              <span>Select Image</span>
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
                  <span>No files available. Drag files into the window to upload.</span>
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
