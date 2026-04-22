import type { TreeNode } from '../types';
import { interpolate } from 'flubber';

// Helper function to apply icon animation
function applyIconAnimation(iconWrapper: HTMLElement, newIcon: string, animationType: string, animationDuration: string) {
  const duration = parseInt(animationDuration);

  switch (animationType) {
    case 'fade':
      iconWrapper.style.transition = `opacity ${duration}ms ease`;
      iconWrapper.style.opacity = '0';
      setTimeout(() => {
        iconWrapper.innerHTML = newIcon;
        iconWrapper.style.opacity = '1';
      }, duration / 2);
      break;

    case 'morph':
      // Extract SVG paths from old and new icons
      const oldSvg = iconWrapper.querySelector('svg');
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = newIcon;
      const newSvg = tempDiv.querySelector('svg');

      if (!oldSvg || !newSvg) {
        // Fallback to fade if not SVG
        iconWrapper.innerHTML = newIcon;
        return;
      }

      const oldPath = oldSvg.querySelector('path');
      const newPath = newSvg.querySelector('path');

      if (!oldPath || !newPath) {
        // Fallback if no paths found
        iconWrapper.innerHTML = newIcon;
        return;
      }

      const oldD = oldPath.getAttribute('d');
      const newD = newPath.getAttribute('d');

      if (!oldD || !newD) {
        iconWrapper.innerHTML = newIcon;
        return;
      }

      try {
        // Create interpolator
        const interpolator = interpolate(oldD, newD, { maxSegmentLength: 2 });

        // Animate the path
        const startTime = performance.now();
        const animate = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Easing function (ease-in-out)
          const eased = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

          const morphedPath = interpolator(eased);
          oldPath.setAttribute('d', morphedPath);

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            // Replace with final icon
            iconWrapper.innerHTML = newIcon;
          }
        };

        requestAnimationFrame(animate);
      } catch (error) {
        // Fallback on error
        console.warn('Flubber morph failed:', error);
        iconWrapper.innerHTML = newIcon;
      }
      break;

    default:
      iconWrapper.innerHTML = newIcon;
  }
}

export function enableTestMode(tree: TreeNode[], videoElement: HTMLVideoElement | null) {
  if (!videoElement) return;

  // Sync buttons with video state on play/pause events
  const syncButtonsWithVideo = () => {
    tree.forEach(node => {
      if (node.type === 'Button' && node.props.sync_with_video === 'true') {
        const el = document.getElementById(`node_${node.id}`);
        if (!el) return;

        const iconWrapper = el.querySelector('.btn-icon-wrapper') as HTMLElement;
        if (!iconWrapper || !iconWrapper.dataset.iconToggle) return;

        const isPlaying = !videoElement.paused;
        const isToggled = iconWrapper.dataset.toggled === 'true';

        // Sync state: playing = toggled, paused = not toggled
        if (isPlaying && !isToggled) {
          // Switch to toggle icon (pause)
          const newIcon = iconWrapper.dataset.iconToggle;
          const animationType = iconWrapper.dataset.animationType || 'none';
          const animationDuration = iconWrapper.dataset.animationDuration || '300';

          applyIconAnimation(iconWrapper, newIcon, animationType, animationDuration);
          iconWrapper.dataset.toggled = 'true';
        } else if (!isPlaying && isToggled) {
          // Switch to default icon (play)
          const newIcon = iconWrapper.dataset.iconDefault;
          const animationType = iconWrapper.dataset.animationType || 'none';
          const animationDuration = iconWrapper.dataset.animationDuration || '300';

          applyIconAnimation(iconWrapper, newIcon, animationType, animationDuration);
          iconWrapper.dataset.toggled = 'false';
        }
      }
    });
  };

  // Listen to video events
  videoElement.addEventListener('play', syncButtonsWithVideo);
  videoElement.addEventListener('pause', syncButtonsWithVideo);

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
          } else {
            videoElement.pause();
          }
          // State sync happens automatically via video events if sync_with_video is enabled
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
