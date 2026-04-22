import { applyNodeStyles } from './nodeRenderer';
import { getUIIcon } from '../data/icons';
import type { TreeNode } from '../types';

function applyAlphaToColor(color: string, alpha: number): string {
  // Parse hex color
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Parse rgba/rgb color
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (rgbaMatch) {
    return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${alpha})`;
  }

  return color;
}

export function applyPropertyChange(nodeId: string, key: string, value: string, tree: TreeNode[]): void {
  const element = document.getElementById(`node_${nodeId}`);
  const node = tree.find(n => n.id === nodeId);

  if (!element || !node) return;

  const props = node.props;

  // Handle specific property changes
  switch (key) {
    // Text properties
    case 'text':
    case 'display_mode':
      if (node.type === 'Label') {
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
      } else if (node.type === 'Button') {
        // Rebuild button content
        element.innerHTML = '';
        if (props.icon) {
          const iconSvg = getUIIcon(props.icon);
          if (iconSvg) {
            if (props.icon_label) {
              element.style.flexDirection = 'column';
              const iconWrapper = document.createElement('div');
              iconWrapper.innerHTML = iconSvg;
              iconWrapper.style.display = 'flex';
              element.appendChild(iconWrapper);
              const label = document.createElement('span');
              label.textContent = props.icon_label;
              label.style.fontSize = (props.icon_label_size || '10') + 'px';
              element.appendChild(label);
            } else {
              const iconWrapper = document.createElement('div');
              iconWrapper.innerHTML = iconSvg;
              iconWrapper.style.display = 'flex';
              element.appendChild(iconWrapper);
              if (value) {
                const textSpan = document.createElement('span');
                textSpan.textContent = value;
                element.appendChild(textSpan);
              }
            }
          }
        } else {
          element.textContent = value || 'Button';
        }
      }
      break;

    // Color properties
    case 'bg_color':
      element.style.background = value;
      break;

    case 'font_color':
      element.style.color = value;
      break;

    case 'border_color':
      if (value) {
        element.style.border = `1px solid ${value}`;
      } else {
        element.style.border = 'none';
      }
      break;

    case 'track_color':
      if (node.type === 'HSlider') {
        const track = element.querySelector('div:first-child');
        if (track) track.style.background = value;
      } else if (node.type === 'VolumeButton') {
        const track = element.querySelector('div:nth-child(2) div:first-child');
        if (track) track.style.background = value;
      }
      break;

    case 'fill_color':
      if (node.type === 'HSlider') {
        const fill = element.querySelector(`#fill_${nodeId}`);
        if (fill) fill.style.background = value;
      } else if (node.type === 'VolumeButton') {
        const fill = element.querySelector('div:nth-child(2) div:nth-child(2)');
        if (fill) fill.style.background = value;
      }
      break;

    case 'thumb_color':
      if (node.type === 'HSlider') {
        const thumb = element.querySelector('div:last-child');
        if (thumb) thumb.style.background = value;
      } else if (node.type === 'VolumeButton') {
        const thumb = element.querySelector('div:nth-child(2) div:last-child');
        if (thumb) thumb.style.background = value;
      }
      break;

    case 'color':
    case 'color_alpha':
      if (node.type === 'ColorRect') {
        if (props.gradient_enabled === 'true') {
          const angle = props.gradient_angle || '180';

          // Parse start color and apply alpha
          let startColor = props.gradient_start || '#000000';
          const startAlpha = props.gradient_start_alpha || '0.9';
          startColor = applyAlphaToColor(startColor, parseFloat(startAlpha));

          // Parse end color and apply alpha
          let endColor = props.gradient_end || '#000000';
          const endAlpha = props.gradient_end_alpha || '0';
          endColor = applyAlphaToColor(endColor, parseFloat(endAlpha));

          const startPos = props.gradient_start_pos || '0';
          const endPos = props.gradient_end_pos || '50';
          element.style.background = `linear-gradient(${angle}deg, ${startColor} ${startPos}%, ${endColor} ${endPos}%)`;
        } else {
          const color = props.color || '#000000';
          const alpha = props.color_alpha || '0.5';
          element.style.background = applyAlphaToColor(color, parseFloat(alpha));
        }
      }
      break;

    // Size properties
    case 'font_size':
      element.style.fontSize = value + 'px';
      break;

    case 'border_radius':
      element.style.borderRadius = value + 'px';
      break;

    case 'padding':
      if (node.type === 'PanelContainer') {
        element.style.padding = value + 'px';
      }
      break;

    case 'thumb_size':
      if (node.type === 'HSlider') {
        const thumb = element.querySelector('div:last-child');
        if (thumb) {
          thumb.style.width = value + 'px';
          thumb.style.height = value + 'px';
        }
      } else if (node.type === 'VolumeButton') {
        const thumb = element.querySelector('div:nth-child(2) div:last-child');
        if (thumb) {
          thumb.style.width = value + 'px';
          thumb.style.height = value + 'px';
        }
      }
      break;

    case 'track_height':
      if (node.type === 'HSlider') {
        const track = element.querySelector('div:first-child');
        const fill = element.querySelector(`#fill_${nodeId}`);
        if (track) track.style.height = value + 'px';
        if (fill) fill.style.height = value + 'px';
      } else if (node.type === 'VolumeButton') {
        const track = element.querySelector('div:nth-child(2) div:first-child');
        const fill = element.querySelector('div:nth-child(2) div:nth-child(2)');
        if (track) track.style.height = value + 'px';
        if (fill) fill.style.height = value + 'px';
      }
      break;

    // Container properties
    case 'separation':
      if (['HBoxContainer', 'VBoxContainer'].includes(node.type)) {
        element.style.gap = value + 'px';
      }
      break;

    case 'alignment':
      if (node.type === 'HBoxContainer') {
        if (value === 'BEGIN') element.style.justifyContent = 'flex-start';
        else if (value === 'CENTER') element.style.justifyContent = 'center';
        else if (value === 'END') element.style.justifyContent = 'flex-end';
      } else if (node.type === 'VBoxContainer') {
        if (value === 'BEGIN') element.style.justifyContent = 'flex-start';
        else if (value === 'CENTER') element.style.justifyContent = 'center';
        else if (value === 'END') element.style.justifyContent = 'flex-end';
      }
      break;

    case 'clip_contents':
      element.style.overflow = value === 'true' ? 'hidden' : 'visible';
      break;

    // MarginContainer margins
    case 'margin_left':
    case 'margin_top':
    case 'margin_right':
    case 'margin_bottom':
      if (node.type === 'MarginContainer') {
        const inner = element.querySelector(`#inner_${nodeId}`);
        if (inner) {
          const ml = parseFloat(props.margin_left || 0);
          const mt = parseFloat(props.margin_top || 0);
          const mr = parseFloat(props.margin_right || 0);
          const mb = parseFloat(props.margin_bottom || 0);
          inner.style.left = `${ml}px`;
          inner.style.top = `${mt}px`;
          inner.style.right = `${mr}px`;
          inner.style.bottom = `${mb}px`;
        }
      }
      break;

    // Slider value
    case 'value':
      if (node.type === 'HSlider') {
        const fill = element.querySelector(`#fill_${nodeId}`);
        const thumb = element.querySelector('div:last-child');
        const max = parseFloat(props.max_value || 100);
        const percent = (parseFloat(value) / max) * 100;
        if (fill) fill.style.width = `${percent}%`;
        if (thumb) thumb.style.left = `${percent}%`;
      } else if (node.type === 'VolumeButton') {
        const fill = element.querySelector('div:nth-child(2) div:nth-child(2)');
        const thumb = element.querySelector('div:nth-child(2) div:last-child');
        const max = parseFloat(props.max_value || 100);
        const percent = (parseFloat(value) / max) * 100;
        if (fill) fill.style.width = `${percent}%`;
        if (thumb) thumb.style.left = `${percent}%`;
      }
      break;

    // Gradient properties
    case 'gradient_enabled':
    case 'gradient_angle':
    case 'gradient_start':
    case 'gradient_end':
    case 'gradient_start_pos':
    case 'gradient_end_pos':
    case 'gradient_start_alpha':
    case 'gradient_end_alpha':
      if (node.type === 'ColorRect') {
        if (props.gradient_enabled === 'true') {
          const angle = props.gradient_angle || '180';

          // Parse start color and apply alpha
          let startColor = props.gradient_start || '#000000';
          const startAlpha = props.gradient_start_alpha || '0.9';
          startColor = applyAlphaToColor(startColor, parseFloat(startAlpha));

          // Parse end color and apply alpha
          let endColor = props.gradient_end || '#000000';
          const endAlpha = props.gradient_end_alpha || '0';
          endColor = applyAlphaToColor(endColor, parseFloat(endAlpha));

          const startPos = props.gradient_start_pos || '0';
          const endPos = props.gradient_end_pos || '50';
          element.style.background = `linear-gradient(${angle}deg, ${startColor} ${startPos}%, ${endColor} ${endPos}%)`;
        } else {
          const color = props.color || '#000000';
          const alpha = props.color_alpha || '0.5';
          element.style.background = applyAlphaToColor(color, parseFloat(alpha));
        }
      }
      break;

    // Texture
    case 'texture':
      if (node.type === 'TextureRect') {
        if (value && value !== 'null') {
          element.style.backgroundImage = `url(${value})`;
          element.style.backgroundSize = 'cover';
          element.style.backgroundPosition = 'center';
        } else {
          element.style.backgroundImage = 'none';
        }
      }
      break;

    // Anchors and offsets - re-apply all positioning
    case 'anchor_left':
    case 'anchor_top':
    case 'anchor_right':
    case 'anchor_bottom':
    case 'offset_left':
    case 'offset_top':
    case 'offset_right':
    case 'offset_bottom':
    case 'custom_minimum_size':
      applyNodeStyles(element, node, tree);
      break;

    // Size flags - re-apply flex properties
    case 'size_flags_horizontal':
      applyNodeStyles(element, node, tree);
      break;

    // AutoHideContainer properties
    case 'mouse_filter':
      if (node.type === 'AutoHideContainer') {
        if (value === 'IGNORE') {
          element.style.opacity = '0';
          // Remove old listeners and add new ones
          const newElement = element.cloneNode(true) as HTMLElement;
          element.parentNode?.replaceChild(newElement, element);
          newElement.addEventListener('mouseenter', () => {
            newElement.style.opacity = '1';
          });
          newElement.addEventListener('mouseleave', () => {
            newElement.style.opacity = '0';
          });
        } else {
          element.style.opacity = '1';
          // Remove listeners by cloning
          const newElement = element.cloneNode(true) as HTMLElement;
          element.parentNode?.replaceChild(newElement, element);
        }
      }
      break;

    case 'transition_duration':
      if (node.type === 'AutoHideContainer') {
        element.style.transition = `opacity ${value}ms ease`;
      }
      break;

    // Icon change
    case 'icon':
    case 'icon_position':
      if (node.type === 'Button') {
        element.innerHTML = '';
        const iconSvg = getUIIcon(props.icon);
        const iconPosition = props.icon_position || 'row';

        if (iconSvg) {
          if (iconPosition === 'column' || props.icon_label) {
            element.style.flexDirection = 'column';
            element.style.gap = (props.icon_label_gap || '4') + 'px';

            const iconWrapper = document.createElement('div');
            iconWrapper.innerHTML = iconSvg;
            iconWrapper.style.display = 'flex';
            element.appendChild(iconWrapper);

            const label = document.createElement('span');
            label.textContent = props.icon_label || props.text || '';
            label.style.fontSize = (props.icon_label_size || '10') + 'px';
            label.style.fontWeight = '500';
            element.appendChild(label);
          } else {
            element.style.flexDirection = 'row';
            element.style.gap = (props.gap || '8') + 'px';

            const iconWrapper = document.createElement('div');
            iconWrapper.innerHTML = iconSvg;
            iconWrapper.style.display = 'flex';
            element.appendChild(iconWrapper);

            if (props.text) {
              const textSpan = document.createElement('span');
              textSpan.textContent = props.text;
              element.appendChild(textSpan);
            }
          }
        } else {
          element.textContent = props.text || 'Button';
        }
      }
      break;

    default:
      // For any other property, try re-applying all styles
      applyNodeStyles(element, node, tree);
      break;
  }
}
