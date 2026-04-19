import type { TreeNode } from '../types';

export function enableTestMode(tree: TreeNode[], videoElement: HTMLVideoElement | null) {
  if (!videoElement) return;

  tree.forEach(node => {
    const el = document.getElementById(`node_${node.id}`);
    if (!el) return;

    // Handle Buttons
    if (node.type === 'Button') {
      el.style.pointerEvents = 'auto';
      el.style.cursor = 'pointer';

      const action = node.props.action || '';
      const label = node.label.toLowerCase();

      el.onclick = () => {
        if (!videoElement) return;

        // Use action property first, fallback to label
        const buttonAction = action || (label.includes('play') ? 'play' :
                                        label.includes('rewind') ? 'rewind' :
                                        label.includes('forward') ? 'forward' :
                                        label.includes('next') ? 'next' :
                                        label.includes('fullscreen') ? 'fullscreen' : '');

        // Play/Pause button
        if (buttonAction === 'play') {
          if (videoElement.paused) {
            videoElement.play();
            // Change icon to pause
            const iconWrapper = el.querySelector('.btn-icon-wrapper') as HTMLElement;
            if (iconWrapper) {
              iconWrapper.style.opacity = '0';
              setTimeout(() => {
                iconWrapper.innerHTML = '<svg width="22" height="23" viewBox="0 0 22 23" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="4" width="4" height="15" fill="white"/><rect x="13" y="4" width="4" height="15" fill="white"/></svg>';
                iconWrapper.style.opacity = '1';
              }, 100);
            }
          } else {
            videoElement.pause();
            // Change icon to play
            const iconWrapper = el.querySelector('.btn-icon-wrapper') as HTMLElement;
            if (iconWrapper) {
              iconWrapper.style.opacity = '0';
              setTimeout(() => {
                iconWrapper.innerHTML = '<svg width="22" height="23" viewBox="0 0 22 23" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.1584 8.45605C20.7146 8.74977 21.1798 9.18823 21.5042 9.72445C21.8286 10.2607 22 10.8744 22 11.5C22 12.1256 21.8286 12.7394 21.5042 13.2756C21.1798 13.8118 20.7146 14.2503 20.1584 14.544L5.32302 22.5558C2.9342 23.8472 0 22.1682 0 19.513V3.4882C0 0.831779 2.9342 -0.846021 5.32302 0.44309L20.1584 8.45605Z" fill="white"/></svg>';
                iconWrapper.style.opacity = '1';
              }, 100);
            }
          }
        }
        // Rewind button
        else if (buttonAction === 'rewind') {
          videoElement.currentTime = Math.max(0, videoElement.currentTime - 10);
        }
        // Forward button
        else if (buttonAction === 'forward') {
          videoElement.currentTime = Math.min(videoElement.duration, videoElement.currentTime + 10);
        }
        // Next button
        else if (buttonAction === 'next') {
          videoElement.currentTime = videoElement.duration;
        }
        // Fullscreen button
        else if (buttonAction === 'fullscreen') {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            const testWrap = document.querySelector('.test-canvas-wrap') as HTMLElement;
            if (testWrap) {
              testWrap.requestFullscreen();
            }
          }
        }
      };
    }
    // Handle HSlider
    else if (node.type === 'HSlider') {
      const label = node.label.toLowerCase();

      // Volume slider
      if (label.includes('volume')) {
        el.style.pointerEvents = 'auto';
        el.style.cursor = 'pointer';

        const track = el.querySelector('div[style*="cursor: pointer"]') as HTMLElement;
        if (track) {
          track.onclick = (e: MouseEvent) => {
            if (!videoElement) return;
            const rect = track.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percent = Math.max(0, Math.min(1, x / rect.width));
            videoElement.volume = percent;

            // Update slider visual
            const fill = document.getElementById(`fill_${node.id}`);
            if (fill) {
              fill.style.width = `${percent * 100}%`;
            }
          };
        }
      }
      // Timeline slider
      else if (label.includes('timeline') || label.includes('time')) {
        el.style.pointerEvents = 'auto';
        el.style.cursor = 'pointer';

        const track = el.querySelector('div[style*="cursor: pointer"]') as HTMLElement;
        if (track) {
          track.onclick = (e: MouseEvent) => {
            if (!videoElement) return;
            const rect = track.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percent = Math.max(0, Math.min(1, x / rect.width));
            videoElement.currentTime = videoElement.duration * percent;
          };
        }

        // Update timeline during playback
        videoElement.ontimeupdate = () => {
          const fill = document.getElementById(`fill_${node.id}`);
          if (fill && videoElement.duration) {
            fill.style.width = `${(videoElement.currentTime / videoElement.duration) * 100}%`;
          }

          // Update time remaining labels
          tree.forEach(labelNode => {
            if (labelNode.type === 'Label' && labelNode.props.display_mode === 'time_remaining') {
              const labelEl = document.getElementById(`node_${labelNode.id}`);
              if (labelEl && videoElement.duration) {
                const remainingSeconds = Math.floor(videoElement.duration - videoElement.currentTime);
                const minutes = Math.floor(remainingSeconds / 60);
                const seconds = remainingSeconds % 60;
                labelEl.textContent = `-${minutes}:${seconds.toString().padStart(2, '0')}`;
              }
            }
          });
        };
      }
    }
  });
}

export function disableTestMode(tree: TreeNode[]) {
  tree.forEach(node => {
    const el = document.getElementById(`node_${node.id}`);
    if (!el) return;

    if (node.type === 'Button' || node.type === 'HSlider') {
      el.style.pointerEvents = '';
      el.style.cursor = '';
      el.onclick = null;
    }
  });
}
