import { getUIIcon } from '../data/icons';
import type { TreeNode } from '../types';
import { interpolate } from 'flubber';

function hexToRgba(hex: string, alpha: number): string {
  // Remove # if present
  hex = hex.replace('#', '');

  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function createNodeElement(node: TreeNode, tree: TreeNode[]): HTMLElement {
  const nodeType = node.type;
  let element;
  const props = node.props || {};

  switch (nodeType) {
    case 'CanvasLayer':
      element = document.createElement('div');
      element.style.position = 'absolute';
      element.style.inset = '0';
      break;

    case 'VideoStreamPlayer':
      element = document.createElement('video');
      element.style.width = '100%';
      element.style.height = '100%';
      element.style.objectFit = 'contain';
      element.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)';
      (element as HTMLVideoElement).controls = false;
      (element as HTMLVideoElement).playsInline = true;
      // Add placeholder text for edit mode
      element.setAttribute('poster', 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080"%3E%3Crect width="1920" height="1080" fill="%231a1a1a"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="rgba(255,255,255,0.05)" font-size="48" font-weight="700" letter-spacing="8"%3EVIDEO STREAM%3C/text%3E%3C/svg%3E');
      break;

    case 'AutoHideContainer':
      element = document.createElement('div');
      element.style.position = 'relative';
      element.style.display = 'flex';
      element.style.flexDirection = 'column';

      const transitionDuration = props.transition_duration || '300';
      element.style.transition = `opacity ${transitionDuration}ms ease`;

      if (props.mouse_filter === 'IGNORE') {
        element.style.opacity = '0';
        element.addEventListener('mouseenter', () => {
          element.style.opacity = '1';
        });
        element.addEventListener('mouseleave', () => {
          element.style.opacity = '0';
        });
      } else {
        element.style.opacity = '1';
      }
      break;

    case 'MarginContainer':
      element = document.createElement('div');
      element.style.position = 'relative';
      element.style.boxSizing = 'border-box';

      // Create inner container
      const inner = document.createElement('div');
      inner.id = `inner_${node.id}`;
      inner.style.position = 'absolute';
      inner.style.display = 'flex';
      inner.style.flexDirection = 'column';
      inner.style.alignItems = 'stretch';
      inner.style.justifyContent = 'center';

      const ml = parseFloat(props.margin_left || 0);
      const mt = parseFloat(props.margin_top || 0);
      const mr = parseFloat(props.margin_right || 0);
      const mb = parseFloat(props.margin_bottom || 0);
      inner.style.left = `${ml}px`;
      inner.style.top = `${mt}px`;
      inner.style.right = `${mr}px`;
      inner.style.bottom = `${mb}px`;

      element.appendChild(inner);
      break;

    case 'HBoxContainer':
      element = document.createElement('div');
      element.style.display = 'flex';
      element.style.flexDirection = 'row';
      element.style.gap = (props.separation || '10') + 'px';
      element.style.alignItems = 'center';
      element.style.position = 'relative';
      element.style.minWidth = '200px';
      element.style.minHeight = '80px';
      element.style.overflow = props.clip_contents === 'true' ? 'hidden' : 'visible';

      const hAlign = props.alignment || 'BEGIN';
      if (hAlign === 'BEGIN') element.style.justifyContent = 'flex-start';
      else if (hAlign === 'CENTER') element.style.justifyContent = 'center';
      else if (hAlign === 'END') element.style.justifyContent = 'flex-end';
      break;

    case 'VBoxContainer':
      element = document.createElement('div');
      element.style.display = 'flex';
      element.style.flexDirection = 'column';
      element.style.gap = (props.separation || '10') + 'px';
      element.style.position = 'relative';
      element.style.minWidth = '200px';
      element.style.minHeight = '200px';
      element.style.overflow = props.clip_contents === 'true' ? 'hidden' : 'visible';

      const vAlign = props.alignment || 'BEGIN';
      if (vAlign === 'BEGIN') element.style.justifyContent = 'flex-start';
      else if (vAlign === 'CENTER') element.style.justifyContent = 'center';
      else if (vAlign === 'END') element.style.justifyContent = 'flex-end';
      break;

    case 'PanelContainer':
      element = document.createElement('div');

      // Check panel mode
      const panelMode = props.panel_mode || 'legacy';

      if (panelMode === 'svg') {
        // SVG mode - pure SVG panel
        element.className = 'vppanel-svg';
        element.style.background = 'transparent';
        element.style.border = 'none';
        element.style.padding = '0';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.position = 'relative';
        element.style.minWidth = '150px';
        element.style.minHeight = '100px';
        element.style.overflow = props.clip_contents === 'true' ? 'hidden' : 'visible';

        // Insert SVG content
        const svgContent = props.svg_content || '<svg viewBox="0 0 100 100" fill="none"><rect width="100" height="100" fill="rgba(37,39,41,0.8)" rx="8"/></svg>';
        element.innerHTML = svgContent;
      } else {
        // Legacy mode - styled panel
        element.className = 'vppanel';
        element.style.background = props.bg_color || 'rgba(37,39,41,0.8)';
        element.style.borderRadius = (props.border_radius || '8') + 'px';
        element.style.padding = (props.padding || '8') + 'px';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.position = 'relative';
        element.style.minWidth = '150px';
        element.style.minHeight = '100px';
        element.style.overflow = props.clip_contents === 'true' ? 'hidden' : 'visible';
        if (props.border_color) {
          element.style.border = `1px solid ${props.border_color}`;
        }
      }
      break;

    case 'Button':
      element = document.createElement('button');

      // Check button mode
      const buttonMode = props.button_mode || 'legacy';

      if (buttonMode === 'svg') {
        // SVG mode - pure SVG button
        element.className = 'vpbtn-svg';
        element.style.background = 'transparent';
        element.style.border = 'none';
        element.style.cursor = 'pointer';
        element.style.padding = '0';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.position = 'relative';
        element.style.minWidth = '48px';
        element.style.minHeight = '48px';
        element.style.transition = 'transform 0.2s ease, opacity 0.2s ease';

        // Disabled state
        if (props.disabled === 'true') {
          element.disabled = true;
          element.style.cursor = 'not-allowed';
          element.style.opacity = '0.4';
        } else {
          // Hover effect
          element.addEventListener('mouseenter', () => {
            element.style.transform = 'scale(1.05)';
            element.style.opacity = '0.8';
          });
          element.addEventListener('mouseleave', () => {
            element.style.transform = 'scale(1)';
            element.style.opacity = '1';
          });

          // Active effect
          element.addEventListener('mousedown', () => {
            element.style.transform = 'scale(0.95)';
          });
          element.addEventListener('mouseup', () => {
            element.style.transform = 'scale(1.05)';
          });
        }

        // Insert SVG content
        const svgContent = props.svg_content || '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
        element.innerHTML = svgContent;
      } else {
        // Legacy mode - styled button
        element.className = 'vpbtn';
        element.style.background = props.bg_color || 'rgba(255,255,255,0.1)';
        element.style.borderRadius = (props.border_radius || '100') + 'px';
        element.style.color = props.font_color || '#ffffff';
        element.style.fontSize = (props.font_size || '15') + 'px';
        element.style.fontFamily = props.font_family || 'Montserrat';
        element.style.minWidth = '120px';
        element.style.minHeight = '54px';
        element.style.border = 'none';
        element.style.cursor = 'pointer';
        element.style.fontWeight = props.font_weight || '600';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.gap = (props.gap || '8') + 'px';
        element.style.transition = 'all 0.2s ease';
        element.style.position = 'relative';
        element.style.overflow = 'hidden';

        // Store original colors in dataset
        element.dataset.bgColor = props.bg_color || 'rgba(255,255,255,0.1)';
        element.dataset.fontColor = props.font_color || '#ffffff';
        element.dataset.hoverBg = props.hover_bg_color || 'rgba(255,255,255,0.2)';
        element.dataset.activeBg = props.active_bg_color || 'rgba(255,255,255,0.15)';
        element.dataset.disabledBg = props.disabled_bg_color || 'rgba(255,255,255,0.05)';
        element.dataset.disabledColor = props.disabled_font_color || 'rgba(255,255,255,0.3)';

        // Hover effect
        element.addEventListener('mouseenter', () => {
          if (element.disabled) return;
          element.style.background = element.dataset.hoverBg;
          element.style.transform = 'scale(1.02)';
        });
        element.addEventListener('mouseleave', () => {
          if (element.disabled) return;
          element.style.background = element.dataset.bgColor;
          element.style.transform = 'scale(1)';
        });

        // Active effect
        element.addEventListener('mousedown', () => {
          if (element.disabled) return;
          element.style.background = element.dataset.activeBg;
          element.style.transform = 'scale(0.98)';
        });
        element.addEventListener('mouseup', () => {
          if (element.disabled) return;
          element.style.background = element.dataset.hoverBg;
          element.style.transform = 'scale(1.02)';
        });

        // Disabled state
        if (props.disabled === 'true') {
          element.disabled = true;
          element.style.background = element.dataset.disabledBg;
          element.style.color = element.dataset.disabledColor;
          element.style.cursor = 'not-allowed';
          element.style.opacity = '0.5';
        }

        // Show icon if available
        if (props.icon) {
          const iconSvg = getUIIcon(props.icon);
          if (iconSvg) {
            // Use icon_position to determine layout (row or column)
            const iconPosition = props.icon_position || 'row';

            if (iconPosition === 'column' || props.icon_label) {
              element.style.flexDirection = 'column';
              element.style.gap = (props.icon_label_gap || '4') + 'px';

              const iconWrapper = document.createElement('div');
              iconWrapper.className = 'btn-icon-wrapper';
              iconWrapper.style.display = 'flex';
              iconWrapper.style.alignItems = 'center';
              iconWrapper.style.justifyContent = 'center';
              iconWrapper.style.position = 'relative';

              // Setup animation
              const animationType = props.icon_animation || 'none';
              const animationDuration = props.animation_duration || '300';

              if (animationType !== 'none') {
                iconWrapper.style.transition = `all ${animationDuration}ms ease`;
              }

              iconWrapper.innerHTML = iconSvg;

              // Store toggle state and icons
              if (props.toggle_mode === 'true' && props.toggle_icon) {
                const toggleIconSvg = getUIIcon(props.toggle_icon);
                const initiallyPressed = props.toggle_pressed === 'true';

                iconWrapper.dataset.iconDefault = iconSvg;
                iconWrapper.dataset.iconToggle = toggleIconSvg || iconSvg;
                iconWrapper.dataset.animationType = animationType;
                iconWrapper.dataset.animationDuration = animationDuration;
                iconWrapper.dataset.toggled = initiallyPressed ? 'true' : 'false';
                iconWrapper.dataset.syncWithVideo = props.sync_with_video || 'false';

                // Set initial icon based on toggle state
                if (initiallyPressed && toggleIconSvg) {
                  iconWrapper.innerHTML = toggleIconSvg;
                }

                // Add click handler for toggle
                element.addEventListener('click', () => {
                  const isToggled = iconWrapper.dataset.toggled === 'true';
                  const newIcon = isToggled ? iconWrapper.dataset.iconDefault : iconWrapper.dataset.iconToggle;
                  const duration = parseInt(animationDuration);

                  // Apply animation
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
                        break;
                      }

                      const oldPath = oldSvg.querySelector('path');
                      const newPath = newSvg.querySelector('path');

                      if (!oldPath || !newPath) {
                        // Fallback if no paths found
                        iconWrapper.innerHTML = newIcon;
                        break;
                      }

                      const oldD = oldPath.getAttribute('d');
                      const newD = newPath.getAttribute('d');

                      if (!oldD || !newD) {
                        iconWrapper.innerHTML = newIcon;
                        break;
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
                  }

                  iconWrapper.dataset.toggled = isToggled ? 'false' : 'true';
                });
              }

              element.appendChild(iconWrapper);

              const labelSpan = document.createElement('span');
              labelSpan.textContent = props.icon_label || props.text || '';
              labelSpan.style.fontSize = (props.icon_label_size || '10') + 'px';
              labelSpan.style.fontWeight = '500';
              element.appendChild(labelSpan);
            } else {
              // Row layout
              const iconWrapper = document.createElement('div');
              iconWrapper.className = 'btn-icon-wrapper';
              iconWrapper.style.display = 'flex';
              iconWrapper.style.alignItems = 'center';
              iconWrapper.style.justifyContent = 'center';
              iconWrapper.style.position = 'relative';

              // Setup animation
              const animationType = props.icon_animation || 'none';
              const animationDuration = props.animation_duration || '300';

              if (animationType !== 'none') {
                iconWrapper.style.transition = `all ${animationDuration}ms ease`;
              }

              iconWrapper.innerHTML = iconSvg;

              // Store toggle state and icons
              if (props.toggle_mode === 'true' && props.toggle_icon) {
                const toggleIconSvg = getUIIcon(props.toggle_icon);
                const initiallyPressed = props.toggle_pressed === 'true';

                iconWrapper.dataset.iconDefault = iconSvg;
                iconWrapper.dataset.iconToggle = toggleIconSvg || iconSvg;
                iconWrapper.dataset.animationType = animationType;
                iconWrapper.dataset.animationDuration = animationDuration;
                iconWrapper.dataset.toggled = initiallyPressed ? 'true' : 'false';
                iconWrapper.dataset.syncWithVideo = props.sync_with_video || 'false';

                // Set initial icon based on toggle state
                if (initiallyPressed && toggleIconSvg) {
                  iconWrapper.innerHTML = toggleIconSvg;
                }

                // Add click handler for toggle
                element.addEventListener('click', () => {
                  const isToggled = iconWrapper.dataset.toggled === 'true';
                  const newIcon = isToggled ? iconWrapper.dataset.iconDefault : iconWrapper.dataset.iconToggle;
                  const duration = parseInt(animationDuration);

                  // Apply animation
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
                        break;
                      }

                      const oldPath = oldSvg.querySelector('path');
                      const newPath = newSvg.querySelector('path');

                      if (!oldPath || !newPath) {
                        // Fallback if no paths found
                        iconWrapper.innerHTML = newIcon;
                        break;
                      }

                      const oldD = oldPath.getAttribute('d');
                      const newD = newPath.getAttribute('d');

                      if (!oldD || !newD) {
                        iconWrapper.innerHTML = newIcon;
                        break;
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
                  }

                  iconWrapper.dataset.toggled = isToggled ? 'false' : 'true';
                });
              }

              element.appendChild(iconWrapper);

              // Add text if present alongside icon
              if (props.text) {
                const textSpan = document.createElement('span');
                textSpan.textContent = props.text;
                element.appendChild(textSpan);
              }
            }
          }
        } else {
          element.textContent = props.text || 'Button';
        }

        // Apply size_flags for alignment
        const sizeFlag = props.size_flags_horizontal || 'FILL';
        if (sizeFlag === 'SHRINK_BEGIN') {
          element.style.flexShrink = '0';
          element.style.marginRight = 'auto';
        } else if (sizeFlag === 'SHRINK_END') {
          element.style.flexShrink = '0';
          element.style.marginLeft = 'auto';
        } else if (sizeFlag === 'SHRINK_CENTER') {
          element.style.flexShrink = '0';
          element.style.margin = '0 auto';
        } else if (sizeFlag === 'EXPAND_FILL') {
          element.style.flex = '1';
        }
      }
      break;

    case 'SVGButton':
      element = document.createElement('button');
      element.className = 'vpbtn-svg';
      element.style.background = 'transparent';
      element.style.border = 'none';
      element.style.cursor = 'pointer';
      element.style.padding = '0';
      element.style.display = 'flex';
      element.style.alignItems = 'center';
      element.style.justifyContent = 'center';
      element.style.position = 'relative';
      element.style.minWidth = '48px';
      element.style.minHeight = '48px';
      element.style.transition = 'transform 0.2s ease, opacity 0.2s ease';

      // Disabled state
      if (props.disabled === 'true') {
        element.disabled = true;
        element.style.cursor = 'not-allowed';
        element.style.opacity = '0.4';
      } else {
        // Hover effect
        element.addEventListener('mouseenter', () => {
          element.style.transform = 'scale(1.05)';
          element.style.opacity = '0.8';
        });
        element.addEventListener('mouseleave', () => {
          element.style.transform = 'scale(1)';
          element.style.opacity = '1';
        });

        // Active effect
        element.addEventListener('mousedown', () => {
          element.style.transform = 'scale(0.95)';
        });
        element.addEventListener('mouseup', () => {
          element.style.transform = 'scale(1.05)';
        });
      }

      // Insert SVG content
      const svgContent = props.svg_content || '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
      element.innerHTML = svgContent;

      break;

    case 'Label':
      element = document.createElement('div');

      // Handle display mode
      if (props.display_mode === 'time_remaining') {
        // Calculate time remaining (placeholder logic)
        const totalSeconds = 3838; // From timeline max_value
        const currentSeconds = 677; // From timeline value
        const remainingSeconds = totalSeconds - currentSeconds;
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        element.textContent = `-${minutes}:${seconds.toString().padStart(2, '0')}`;
      } else {
        element.textContent = props.text || 'Label';
      }

      element.style.color = props.font_color || '#ffffff';
      element.style.fontSize = (props.font_size || '14') + 'px';
      element.style.fontFamily = 'Montserrat, sans-serif';
      element.style.fontWeight = props.font_weight || '500';
      element.style.textAlign = (props.horizontal_alignment || 'LEFT').toLowerCase();
      element.style.display = 'flex';
      element.style.alignItems = 'center';
      break;

    case 'HSlider':
      // Container for icon + slider
      const container = document.createElement('div');
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.gap = (props.icon_gap || '12') + 'px';

      // Add icon if specified
      if (props.icon) {
        const iconSvg = getUIIcon(props.icon);
        if (iconSvg) {
          const iconWrapper = document.createElement('div');
          iconWrapper.style.display = 'flex';
          iconWrapper.style.alignItems = 'center';
          iconWrapper.style.justifyContent = 'center';
          iconWrapper.style.flexShrink = '0';
          const iconSize = props.icon_size || '20';
          iconWrapper.style.width = iconSize + 'px';
          iconWrapper.style.height = iconSize + 'px';
          iconWrapper.innerHTML = iconSvg;
          container.appendChild(iconWrapper);
        }
      }

      // Slider track
      const track = document.createElement('div');
      track.style.height = (props.track_height || '7') + 'px';
      track.style.background = props.track_color || 'rgba(255,255,255,0.2)';
      track.style.borderRadius = (props.track_radius || '49') + 'px';
      track.style.cursor = 'pointer';
      track.style.minWidth = '150px';
      track.style.flex = '1';
      track.style.position = 'relative';

      const fill = document.createElement('div');
      fill.id = 'fill_' + node.id;
      fill.style.height = '100%';
      fill.style.background = props.fill_color || '#ffffff';
      fill.style.borderRadius = (props.track_radius || '49') + 'px';
      const val = parseFloat(props.value || 50);
      const min = parseFloat(props.min_value || 0);
      const max = parseFloat(props.max_value || 100);
      fill.style.width = ((val - min) / (max - min) * 100) + '%';
      fill.style.position = 'relative';

      const thumb = document.createElement('div');
      const thumbSize = parseFloat(props.thumb_size || '15');
      thumb.style.width = thumbSize + 'px';
      thumb.style.height = thumbSize + 'px';
      thumb.style.background = props.thumb_color || '#ffffff';
      thumb.style.borderRadius = '50%';
      thumb.style.position = 'absolute';
      thumb.style.right = (-thumbSize / 2) + 'px';
      thumb.style.top = '50%';
      thumb.style.transform = 'translateY(-50%)';
      thumb.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
      fill.appendChild(thumb);
      track.appendChild(fill);

      container.appendChild(track);
      element = container;
      break;

    case 'VolumeButton':
      const btnSize = 54;
      const sliderWidth = parseFloat(props.slider_width || '200');
      const sliderGap = parseFloat(props.button_slider_gap || '10');
      const expandDuration = parseFloat(props.expand_duration || '200');
      const btnRadius = parseFloat(props.border_radius || '100');
      const isExpanded = props.always_show_slider === 'true';

      const collapsedWidth = btnSize;
      const expandedWidth = btnSize + sliderGap + sliderWidth;

      element = document.createElement('div');
      element.style.position = 'relative';
      element.style.display = 'inline-flex';
      element.style.alignItems = 'center';
      element.style.justifyContent = 'flex-start';
      element.style.width = (isExpanded ? expandedWidth : collapsedWidth) + 'px';
      element.style.height = btnSize + 'px';
      element.style.transition = `width ${expandDuration}ms ease`;
      element.style.flexShrink = '0';

      element.dataset.bgColor = props.bg_color || 'rgba(255,255,255,0.1)';
      element.dataset.hoverBg = props.hover_bg_color || 'rgba(255,255,255,0.18)';
      element.dataset.sliderWidth = sliderWidth;
      element.dataset.gap = sliderGap;
      element.dataset.borderRadius = btnRadius;
      element.dataset.expandDuration = expandDuration;

      const bg = document.createElement('div');
      bg.id = 'volbg_' + node.id;
      bg.style.position = 'absolute';
      bg.style.left = '0';
      bg.style.top = '0';
      bg.style.width = '100%';
      bg.style.height = '100%';
      bg.style.background = isExpanded ? (props.hover_bg_color || 'rgba(255,255,255,0.18)') : (props.bg_color || 'rgba(255,255,255,0.1)');
      bg.style.borderRadius = (btnRadius > 50 ? '27px' : btnRadius + 'px');
      bg.style.transition = `background ${expandDuration}ms ease`;
      bg.style.pointerEvents = 'none';
      bg.style.zIndex = '1';

      const contentWrap = document.createElement('div');
      contentWrap.id = 'volcontent_' + node.id;
      contentWrap.style.position = 'relative';
      contentWrap.style.display = 'flex';
      contentWrap.style.alignItems = 'center';
      contentWrap.style.width = '100%';
      contentWrap.style.height = btnSize + 'px';
      contentWrap.style.zIndex = '2';

      const btn = document.createElement('button');
      btn.id = 'btn_' + node.id;
      btn.style.position = 'relative';
      btn.style.width = btnSize + 'px';
      btn.style.height = btnSize + 'px';
      btn.style.minWidth = btnSize + 'px';
      btn.style.minHeight = btnSize + 'px';
      btn.style.background = 'transparent';
      btn.style.border = 'none';
      btn.style.cursor = 'pointer';
      btn.style.display = 'flex';
      btn.style.alignItems = 'center';
      btn.style.justifyContent = 'center';
      btn.style.color = props.font_color || '#ffffff';
      btn.style.flexShrink = '0';
      btn.style.padding = '0';
      btn.style.paddingTop = (props.button_padding_top || '0') + 'px';
      btn.style.paddingRight = (props.button_padding_right || '0') + 'px';
      btn.style.paddingBottom = (props.button_padding_bottom || '0') + 'px';
      btn.style.paddingLeft = (props.button_padding_left || '0') + 'px';

      const iconSvg = getUIIcon(props.icon || 'volume-2');
      if (iconSvg) btn.innerHTML = iconSvg;

      const sliderWrap = document.createElement('div');
      sliderWrap.id = 'slider_' + node.id;
      sliderWrap.style.position = 'relative';
      sliderWrap.style.display = 'flex';
      sliderWrap.style.alignItems = 'center';
      sliderWrap.style.marginLeft = sliderGap + 'px';
      sliderWrap.style.width = isExpanded ? sliderWidth + 'px' : '0px';
      sliderWrap.style.overflow = 'hidden';
      sliderWrap.style.transition = `width ${expandDuration}ms ease`;
      sliderWrap.style.flexShrink = '0';

      const vTrack = document.createElement('div');
      vTrack.className = 'volumebutton-track';
      vTrack.style.position = 'relative';
      vTrack.style.width = '100%';
      vTrack.style.height = (props.track_height || '4') + 'px';
      vTrack.style.background = props.track_color || 'rgba(255,255,255,0.25)';
      vTrack.style.borderRadius = (props.track_radius || '49') + 'px';
      vTrack.style.cursor = 'pointer';

      const vFill = document.createElement('div');
      vFill.id = 'fill_' + node.id;
      vFill.style.position = 'relative';
      vFill.style.height = '100%';
      vFill.style.background = props.fill_color || '#ffffff';
      vFill.style.borderRadius = (props.track_radius || '49') + 'px';
      const v = parseFloat(props.value || 65);
      const vMin = parseFloat(props.min_value || 0);
      const vMax = parseFloat(props.max_value || 100);
      vFill.style.width = ((v - vMin) / (vMax - vMin) * 100) + '%';

      const vThumbSize = parseFloat(props.thumb_size || '14');
      const vThumb = document.createElement('div');
      vThumb.style.position = 'absolute';
      vThumb.style.right = (-vThumbSize / 2) + 'px';
      vThumb.style.top = '50%';
      vThumb.style.transform = 'translateY(-50%)';
      vThumb.style.width = vThumbSize + 'px';
      vThumb.style.height = vThumbSize + 'px';
      vThumb.style.background = props.thumb_color || '#ffffff';
      vThumb.style.borderRadius = '50%';
      vThumb.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

      vFill.appendChild(vThumb);
      vTrack.appendChild(vFill);
      sliderWrap.appendChild(vTrack);
      contentWrap.appendChild(btn);
      contentWrap.appendChild(sliderWrap);
      element.appendChild(bg);
      element.appendChild(contentWrap);

      element.addEventListener('mouseenter', () => {
        if (props.always_show_slider !== 'true') {
          element.style.width = expandedWidth + 'px';
          sliderWrap.style.width = sliderWidth + 'px';
          bg.style.background = element.dataset.hoverBg;
        }
      });
      element.addEventListener('mouseleave', () => {
        if (props.always_show_slider !== 'true') {
          element.style.width = collapsedWidth + 'px';
          sliderWrap.style.width = '0';
          bg.style.background = element.dataset.bgColor;
        }
      });

      vTrack.addEventListener('click', (e) => {
        const rect = vTrack.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = Math.max(0, Math.min(1, x / rect.width));
        const newValue = vMin + (vMax - vMin) * percent;
        vFill.style.width = (percent * 100) + '%';
      });
      break;

    case 'ColorRect':
      element = document.createElement('div');
      if (props.gradient_enabled === 'true') {
        const angle = props.gradient_angle || '180';

        // Apply alpha to gradient colors
        const startColor = props.gradient_start || '#000000';
        const startAlpha = props.gradient_start_alpha || '0.9';
        const startRgba = hexToRgba(startColor, parseFloat(startAlpha));

        const endColor = props.gradient_end || '#000000';
        const endAlpha = props.gradient_end_alpha || '0';
        const endRgba = hexToRgba(endColor, parseFloat(endAlpha));

        const startPos = props.gradient_start_pos || '0';
        const endPos = props.gradient_end_pos || '50';
        element.style.background = `linear-gradient(${angle}deg, ${startRgba} ${startPos}%, ${endRgba} ${endPos}%)`;
      } else {
        const color = props.color || '#000000';
        const alpha = props.color_alpha || '0.5';
        element.style.background = hexToRgba(color, parseFloat(alpha));
      }
      element.style.pointerEvents = 'none';
      break;

    case 'TextureRect':
      element = document.createElement('div');
      if (props.texture && props.texture !== 'null') {
        element.style.backgroundImage = `url(${props.texture})`;
        element.style.backgroundSize = 'cover';
        element.style.backgroundPosition = 'center';
      }
      break;

    case 'Separator':
      element = document.createElement('div');
      element.style.display = 'flex';
      element.style.alignItems = 'center';
      element.style.justifyContent = 'center';
      element.style.position = 'relative';
      element.style.flexShrink = '0';

      const separation = parseFloat(props.separation || '8');
      const showLine = props.show_line !== 'false';

      // Set height based on separation
      element.style.height = separation + 'px';
      element.style.minHeight = separation + 'px';
      element.style.width = '100%';

      if (showLine) {
        const line = document.createElement('div');
        line.style.background = props.line_color || 'rgba(255,255,255,0.2)';
        line.style.position = 'absolute';

        const lineThickness = parseFloat(props.line_thickness || '1');

        // Horizontal line
        line.style.width = '100%';
        line.style.height = lineThickness + 'px';
        line.style.left = '0';
        line.style.top = '50%';
        line.style.transform = 'translateY(-50%)';

        element.appendChild(line);
      }
      break;

    default:
      element = document.createElement('div');
      break;
  }

  element.id = `node_${node.id}`;
  element.dataset.nodeId = node.id;

  // Apply anchors and positioning
  applyNodeStyles(element, node, tree);

  return element;
}

export function applyNodeStyles(element: HTMLElement, node: TreeNode, tree: TreeNode[]): void {
  const props = node.props || {};

  // Visibility
  if (node.visible === false || node.visible === 'false') {
    element.style.visibility = 'hidden';
    return;
  }

  // Determine parent and positioning mode
  const parent = node.pid ? tree.find(n => n.id === node.pid) : null;
  const parentIsFlexContainer = parent && ['HBoxContainer', 'VBoxContainer', 'PanelContainer', 'MarginContainer'].includes(parent.type);

  // Anchors and offsets
  const al = parseFloat(props.anchor_left || 0);
  const at = parseFloat(props.anchor_top || 0);
  const ar = parseFloat(props.anchor_right || 0);
  const ab = parseFloat(props.anchor_bottom || 0);
  const ol = parseFloat(props.offset_left || 0);
  const ot = parseFloat(props.offset_top || 0);
  const or = parseFloat(props.offset_right || 0);
  const ob = parseFloat(props.offset_bottom || 0);

  // Check if anchors are explicitly set
  const hasExplicitAnchors = props.anchor_left !== undefined || props.anchor_top !== undefined ||
                              props.anchor_right !== undefined || props.anchor_bottom !== undefined;

  if (parentIsFlexContainer && !hasExplicitAnchors) {
    // Flex positioning - no explicit anchors in flex container
    element.style.position = 'relative';

    // Apply offsets as margins in flex containers
    if (ol !== 0) element.style.marginLeft = `${ol}px`;
    if (ot !== 0) element.style.marginTop = `${ot}px`;
    if (or !== 0) element.style.marginRight = `${or}px`;
    if (ob !== 0) element.style.marginBottom = `${ob}px`;

    // Apply size_flags for flex children
    const sizeH = props.size_flags_horizontal || 'FILL';
    const sizeV = props.size_flags_vertical || 'FILL';

    if (sizeH === 'EXPAND_FILL' || sizeH === 'FILL') {
      element.style.flexGrow = '1';
      element.style.flexShrink = '1';
    } else if (sizeH === 'SHRINK_BEGIN') {
      element.style.flexShrink = '0';
      element.style.marginRight = 'auto';
    } else if (sizeH === 'SHRINK_END') {
      element.style.flexShrink = '0';
      element.style.marginLeft = 'auto';
    } else if (sizeH === 'SHRINK_CENTER') {
      element.style.flexShrink = '0';
      element.style.margin = '0 auto';
    } else {
      element.style.flexShrink = '0';
    }

    if (sizeV === 'EXPAND_FILL') {
      element.style.alignSelf = 'stretch';
    } else if (sizeV === 'SHRINK_CENTER') {
      element.style.alignSelf = 'center';
    } else if (sizeV === 'FILL' && parent && parent.type === 'PanelContainer') {
      element.style.alignSelf = 'center';
    }

    // Apply custom_minimum_size
    const cms = props.custom_minimum_size || '(0,0)';
    const match = cms.match(/\((\d+),(\d+)\)/);
    if (match) {
      const w = parseInt(match[1]);
      const h = parseInt(match[2]);
      if (w > 0) element.style.minWidth = w + 'px';
      if (h > 0) {
        element.style.minHeight = h + 'px';
        element.style.maxHeight = h + 'px';
      }
    }
  } else {
    // Absolute positioning with anchors
    element.style.position = 'absolute';
    if (!parentIsFlexContainer) {
      element.style.zIndex = '1';
    }

    if (al === ar && at === ab) {
      // Point anchor - element positioned by anchor point
      const leftPos = al * 100;
      const topPos = at * 100;
      const translateX = -al * 100;
      const translateY = -at * 100;

      element.style.left = `${leftPos}%`;
      element.style.top = `${topPos}%`;
      element.style.right = 'auto';
      element.style.bottom = 'auto';

      // Combine transform and offset
      if (ol !== 0 || ot !== 0) {
        element.style.transform = `translate(calc(${translateX}% + ${ol}px), calc(${translateY}% + ${ot}px))`;
      } else {
        element.style.transform = `translate(${translateX}%, ${translateY}%)`;
      }

      // Apply custom_minimum_size
      const cms = props.custom_minimum_size || '(0,0)';
      const match = cms.match(/\((\d+),(\d+)\)/);
      if (match) {
        const w = parseInt(match[1]);
        const h = parseInt(match[2]);
        if (w > 0) element.style.width = w + 'px';
        if (h > 0) element.style.height = h + 'px';
      }
    } else {
      // Stretch anchor - element stretches to fill
      element.style.left = `calc(${al * 100}% + ${ol}px)`;
      element.style.top = `calc(${at * 100}% + ${ot}px)`;
      element.style.right = `calc(${(1 - ar) * 100}% - ${or}px)`;
      element.style.bottom = `calc(${(1 - ab) * 100}% - ${ob}px)`;
      element.style.width = 'auto';
      element.style.height = 'auto';
      element.style.transform = '';
    }
  }

  // Check parent visibility
  let shouldBeVisible = node.visible === true || node.visible === 'true';
  if (node.pid) {
    let p = parent;
    while (p) {
      if (p.visible === false || p.visible === 'false') {
        shouldBeVisible = false;
        break;
      }
      p = p.pid ? tree.find(n => n.id === p.pid) : null;
    }
  }

  element.style.visibility = shouldBeVisible ? 'visible' : 'hidden';

  // Clip contents
  if (props.clip_contents === 'true') {
    element.style.overflow = 'hidden';
  } else {
    element.style.overflow = 'visible';
  }

  // Modulate (tint)
  if (props.modulate && props.modulate !== '#ffffff') {
    element.style.opacity = '0.8';
  }
}

export function renderNodeTree(tree: TreeNode[], parentElement: HTMLElement): void {
  parentElement.innerHTML = '';

  const rootNodes = tree.filter(n => !n.pid);

  rootNodes.forEach(node => {
    renderNodeRecursive(node, tree, parentElement);
  });
}

function renderNodeRecursive(node: TreeNode, tree: TreeNode[], parentElement: HTMLElement): void {
  // Check visibility - handle both boolean and string
  const isVisible = node.visible === true || node.visible === 'true';
  if (!isVisible) return;

  const element = createNodeElement(node, tree);

  // For MarginContainer, append children to inner container
  let containerForChildren = element;
  if (node.type === 'MarginContainer') {
    containerForChildren = element.querySelector(`#inner_${node.id}`);
  }

  parentElement.appendChild(element);

  // Render children
  if (node.children && node.children.length > 0) {
    node.children.forEach(childId => {
      const child = tree.find(n => n.id === childId);
      if (child) {
        renderNodeRecursive(child, tree, containerForChildren);
      }
    });
  }
}
