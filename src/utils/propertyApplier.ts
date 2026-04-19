import { applyNodeStyles } from './nodeRenderer';
import { getUIIcon } from '../data/icons';
import type { TreeNode } from '../types';

export function applyPropertyChange(nodeId: string, key: string, value: string, tree: TreeNode[]): void {
  const element = document.getElementById(`node_${nodeId}`);
  const node = tree.find(n => n.id === nodeId);

  if (!element || !node) return;

  const props = node.props;

  // Handle specific property changes
  switch (key) {
    // Text properties
    case 'text':
      if (node.type === 'Label') {
        element.textContent = value;
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
      if (node.type === 'ColorRect') {
        if (props.gradient_enabled === 'true') {
          const angle = props.gradient_angle || '180';
          const start = props.gradient_start || 'rgba(0,0,0,0.8)';
          const end = props.gradient_end || 'rgba(0,0,0,0)';
          const startPos = props.gradient_start_pos || '0';
          const endPos = props.gradient_end_pos || '100';
          element.style.background = `linear-gradient(${angle}deg, ${start} ${startPos}%, ${end} ${endPos}%)`;
        } else {
          element.style.background = value;
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
      if (node.type === 'ColorRect') {
        if (props.gradient_enabled === 'true') {
          const angle = props.gradient_angle || '180';
          const start = props.gradient_start || 'rgba(0,0,0,0.8)';
          const end = props.gradient_end || 'rgba(0,0,0,0)';
          const startPos = props.gradient_start_pos || '0';
          const endPos = props.gradient_end_pos || '100';
          element.style.background = `linear-gradient(${angle}deg, ${start} ${startPos}%, ${end} ${endPos}%)`;
        } else {
          element.style.background = props.color || 'rgba(0,0,0,0.5)';
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

    default:
      // For any other property, try re-applying all styles
      applyNodeStyles(element, node, tree);
      break;
  }
}
