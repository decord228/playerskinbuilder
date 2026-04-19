import React, { useState } from 'react';
import { assetManager } from '../store/assetStore';
import './GlobalDropZone.css';

export default function GlobalDropZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);

  React.useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      // Ignore internal asset drags
      if (e.dataTransfer?.types.includes('asset-id')) {
        return;
      }
      dragCounter++;
      if (e.dataTransfer?.types.includes('Files')) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      // Ignore internal asset drags
      if (e.dataTransfer?.types.includes('asset-id')) {
        return;
      }
      dragCounter--;
      if (dragCounter === 0) {
        setIsDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      // Ignore internal asset drags
      if (e.dataTransfer?.types.includes('asset-id')) {
        return;
      }
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();

      // Ignore internal asset drags
      if (e.dataTransfer?.types.includes('asset-id')) {
        return;
      }

      dragCounter = 0;
      setIsDragging(false);

      const files = Array.from(e.dataTransfer?.files || []);
      const imageFiles = files.filter(f => f.type.startsWith('image/'));

      if (imageFiles.length === 0) {
        return;
      }

      setUploadCount(imageFiles.length);

      for (const file of imageFiles) {
        try {
          await assetManager.addAsset(file);
        } catch (error) {
          console.error('Failed to upload file:', file.name, error);
        }
      }

      // Trigger refresh of FileBrowser
      window.dispatchEvent(new CustomEvent('assets-updated'));

      // Hide upload notification after 2 seconds
      setTimeout(() => {
        setUploadCount(0);
      }, 2000);
    };

    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, []);

  if (!isDragging && uploadCount === 0) return null;

  return (
    <>
      {isDragging && (
        <div className="global-drop-overlay">
          <div className="global-drop-content">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span>Drop files to upload</span>
          </div>
        </div>
      )}
      {uploadCount > 0 && (
        <div className="upload-notification">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span>{uploadCount} file{uploadCount > 1 ? 's' : ''} uploaded</span>
        </div>
      )}
    </>
  );
}
