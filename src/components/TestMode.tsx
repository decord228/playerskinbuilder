import React, { useRef, useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { renderNodeTree } from '../utils/nodeRenderer';
import { enableTestMode, disableTestMode } from '../utils/testModeUtils';
import './TestMode.css';

export default function TestMode() {
  const { tree } = useStore();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [videoFile, setVideoFile] = useState<string | null>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

  // Render nodes when tree changes
  useEffect(() => {
    if (canvasRef.current && tree.length > 0) {
      console.log('Rendering tree in test mode');
      renderNodeTree(tree, canvasRef.current);

      // Find VideoStreamPlayer node and get its video element
      setTimeout(() => {
        const videoNode = tree.find(n => n.type === 'VideoStreamPlayer');
        console.log('VideoStreamPlayer node:', videoNode);
        if (videoNode) {
          const videoEl = document.getElementById(`node_${videoNode.id}`) as HTMLVideoElement;
          console.log('Video element found:', videoEl, 'Tag:', videoEl?.tagName);
          if (videoEl && videoEl.tagName === 'VIDEO') {
            setVideoElement(videoEl);
            console.log('Video element set!');
          }
        }
      }, 100);
    }
  }, [tree]);

  // Enable test mode interactions when video is loaded
  useEffect(() => {
    if (videoElement && videoFile) {
      console.log('Enabling test mode interactions');
      enableTestMode(tree, videoElement);
    }

    return () => {
      disableTestMode(tree);
    };
  }, [videoElement, videoFile, tree]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('File selected:', file?.name, 'Video element:', videoElement);
    if (file) {
      if (!videoElement) {
        console.error('Video element not found yet!');
        alert('Video player not ready. Please wait a moment and try again.');
        return;
      }
      const url = URL.createObjectURL(file);
      setVideoFile(url);
      videoElement.src = url;
      videoElement.load();
      videoElement.play().catch(err => console.log('Autoplay blocked:', err));
    }
  };

  return (
    <div className="test-mode">
      <div className="test-viewport">
        <div className="test-canvas-wrap">
          <div className="test-canvas" id="canvasFrame" ref={canvasRef} />

          {!videoFile && (
            <div className="test-placeholder">
              <div className="test-placeholder-content">
                <div className="test-placeholder-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                    <path d="M10 9l6 3.5-6 3.5z" fill="currentColor" stroke="none"/>
                  </svg>
                </div>
                <h3>Select a video to preview</h3>
                <p>Choose a video file to test your player skin</p>
                <label className="test-file-btn">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  Choose Video
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
