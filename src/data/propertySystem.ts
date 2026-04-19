import type { TreeNode, PropertySection } from '../types';

export function getPropSections(node: TreeNode): PropertySection[] {
  const base = [
    {
      name: 'Node',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m8.66-15.66l-4.24 4.24m-4.84 4.84l-4.24 4.24M23 12h-6m-6 0H1m20.66 8.66l-4.24-4.24m-4.84-4.84l-4.24-4.24"/></svg>',
      fields: [
        { key: 'label', label: 'name', type: 'text', def: node.label },
        { key: 'visible', type: 'bool', def: 'true' },
      ]
    },
    {
      name: 'Control — Anchor',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>',
      fields: [
        { type: 'anchor' },
        { key: 'anchor_left', type: 'text', def: '0' },
        { key: 'anchor_top', type: 'text', def: '0' },
        { key: 'anchor_right', type: 'text', def: '0' },
        { key: 'anchor_bottom', type: 'text', def: '0' },
      ]
    },
    {
      name: 'Control — Rect',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>',
      fields: [
        { key: 'offset_left', type: 'text', def: '0' },
        { key: 'offset_top', type: 'text', def: '0' },
        { key: 'offset_right', type: 'text', def: '0' },
        { key: 'offset_bottom', type: 'text', def: '0' },
        { key: 'custom_minimum_size', type: 'text', def: '(0,0)' },
        { key: 'size_flags_horizontal', type: 'size_flags', def: 'FILL', opts: ['FILL', 'EXPAND', 'EXPAND_FILL', 'SHRINK_BEGIN', 'SHRINK_CENTER', 'SHRINK_END'] },
        { key: 'size_flags_vertical', type: 'size_flags', def: 'FILL', opts: ['FILL', 'EXPAND', 'EXPAND_FILL', 'SHRINK_BEGIN', 'SHRINK_CENTER', 'SHRINK_END'] },
      ]
    },
    {
      name: 'Appearance',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 0 0 20"/></svg>',
      fields: [
        { key: 'modulate', label: 'modulate (tint)', type: 'color', def: '#ffffff' },
      ]
    },
  ];

  const extra = {
    'CanvasLayer': [{
      name: 'CanvasLayer',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M2 8h20M8 2v20"/></svg>',
      fields: [
        { key: 'layer', type: 'text', def: '1' },
        { key: 'follow_viewport', type: 'bool', def: 'false' }
      ]
    }],
    'AutoHideContainer': [{
      name: 'AutoHide',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8" opacity="0.5"/></svg>',
      fields: [
        { key: 'auto_hide_enabled', label: 'enable auto-hide', type: 'bool', def: 'true' },
        { key: 'hide_delay', label: 'hide delay (s)', type: 'text', def: '3' },
        { key: 'fade_duration', label: 'fade duration (s)', type: 'text', def: '0.3' },
        { key: 'show_on_input', label: 'show on input', type: 'bool', def: 'true' },
      ]
    }],
    'MarginContainer': [{
      name: 'Margins',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="7" y="7" width="10" height="10" rx="1" stroke-dasharray="2 2"/></svg>',
      fields: [
        { key: 'margin_left', type: 'text', def: '0' },
        { key: 'margin_top', type: 'text', def: '0' },
        { key: 'margin_right', type: 'text', def: '0' },
        { key: 'margin_bottom', type: 'text', def: '0' },
        { type: 'margin_preview' },
        { key: 'clip_contents', type: 'bool', def: 'false' },
      ]
    }],
    'HBoxContainer': [{
      name: 'HBoxContainer',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="5" height="14" rx="1"/><rect x="10" y="5" width="5" height="14" rx="1"/><rect x="17" y="5" width="4" height="14" rx="1"/></svg>',
      fields: [
        { key: 'alignment', type: 'select', def: 'BEGIN', opts: ['BEGIN', 'CENTER', 'END'] },
        { key: 'separation', type: 'text', def: '4' },
        { key: 'clip_contents', type: 'bool', def: 'false' },
      ]
    }],
    'VBoxContainer': [{
      name: 'VBoxContainer',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="3" width="14" height="5" rx="1"/><rect x="5" y="10" width="14" height="5" rx="1"/><rect x="5" y="17" width="14" height="4" rx="1"/></svg>',
      fields: [
        { key: 'alignment', type: 'select', def: 'BEGIN', opts: ['BEGIN', 'CENTER', 'END'] },
        { key: 'separation', type: 'text', def: '4' },
        { key: 'clip_contents', type: 'bool', def: 'false' },
      ]
    }],
    'PanelContainer': [{
      name: 'Panel Style',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" opacity="0.2"/><rect x="3" y="3" width="18" height="18" rx="3"/></svg>',
      fields: [
        { key: 'bg_color', label: 'background', type: 'color', def: '#252729' },
        { key: 'border_color', label: 'border', type: 'color', def: '#333537' },
        { key: 'border_radius', type: 'text', def: '0' },
        { key: 'padding', type: 'text', def: '8' },
        { key: 'clip_contents', type: 'bool', def: 'false' },
      ]
    }],
    'Button': [
      {
        name: 'Button Style',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="8" width="16" height="8" rx="4"/></svg>',
        fields: [
          { key: 'bg_color', label: 'background', type: 'color', def: 'rgba(255,255,255,0.1)' },
          { key: 'hover_bg_color', label: 'hover bg', type: 'color', def: 'rgba(255,255,255,0.2)' },
          { key: 'active_bg_color', label: 'active bg', type: 'color', def: 'rgba(255,255,255,0.15)' },
          { key: 'disabled_bg_color', label: 'disabled bg', type: 'color', def: 'rgba(255,255,255,0.05)' },
          { key: 'border_radius', label: 'border radius', type: 'text', def: '100' },
          { key: 'font_color', label: 'font color', type: 'color', def: '#ffffff' },
          { key: 'disabled_font_color', label: 'disabled font', type: 'color', def: 'rgba(255,255,255,0.3)' },
          { key: 'font_size', type: 'text', def: '14' },
          { key: 'font_family', type: 'select', def: 'Montserrat', opts: ['Montserrat', 'JetBrains Mono', 'Rajdhani', 'system-ui'] },
        ]
      },
      {
        name: 'Button',
        fields: [
          { key: 'text', type: 'text', def: 'Button' },
          { key: 'icon', type: 'text', def: '' },
          { key: 'icon_label', type: 'text', def: '' },
          { key: 'icon_label_size', type: 'text', def: '15' },
          { key: 'icon_label_gap', type: 'text', def: '0' },
          { key: 'flat', type: 'bool', def: 'false' },
          { key: 'disabled', type: 'bool', def: 'false' },
          { key: 'toggle_mode', type: 'bool', def: 'false' },
          { key: 'alignment', type: 'select', def: 'CENTER', opts: ['LEFT', 'CENTER', 'RIGHT'] },
          { key: 'gap', type: 'text', def: '8' },
          { key: 'font_weight', type: 'text', def: '600' },
        ]
      },
    ],
    'Label': [{
      name: 'Label',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h10M4 17h14"/></svg>',
      fields: [
        { key: 'text', type: 'text', def: 'Label' },
        { key: 'font_color', label: 'font color', type: 'color', def: '#ffffff' },
        { key: 'font_size', type: 'text', def: '14' },
        { key: 'font_weight', type: 'text', def: '500' },
        { key: 'horizontal_alignment', type: 'select', def: 'LEFT', opts: ['LEFT', 'CENTER', 'RIGHT', 'FILL'] },
        { key: 'autowrap_mode', type: 'select', def: 'OFF', opts: ['OFF', 'WORD', 'WORD_SMART'] },
      ]
    }],
    'HSlider': [{
      name: 'Slider',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="12" x2="20" y2="12"/><circle cx="14" cy="12" r="3" fill="currentColor"/></svg>',
      fields: [
        { key: 'min_value', type: 'text', def: '0' },
        { key: 'max_value', type: 'text', def: '100' },
        { key: 'value', type: 'text', def: '0' },
        { key: 'step', type: 'text', def: '1' },
        { key: 'track_color', label: 'track color', type: 'color', def: 'rgba(255,255,255,0.2)' },
        { key: 'fill_color', label: 'fill color', type: 'color', def: '#ffffff' },
        { key: 'icon', type: 'text', def: '' },
        { key: 'icon_size', type: 'text', def: '20' },
        { key: 'icon_gap', type: 'text', def: '12' },
        { key: 'track_height', type: 'text', def: '7' },
        { key: 'track_radius', type: 'text', def: '49' },
        { key: 'thumb_size', type: 'text', def: '15' },
        { key: 'thumb_color', label: 'thumb color', type: 'color', def: '#ffffff' },
      ]
    }],
    'VolumeButton': [
      {
        name: 'Button Style',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="8" width="16" height="8" rx="4"/></svg>',
        fields: [
          { key: 'bg_color', label: 'background', type: 'color', def: 'rgba(255,255,255,0.1)' },
          { key: 'hover_bg_color', label: 'hover bg', type: 'color', def: 'rgba(255,255,255,0.18)' },
          { key: 'border_radius', label: 'border radius', type: 'text', def: '100' },
          { key: 'font_color', label: 'font color', type: 'color', def: '#ffffff' },
        ]
      },
      {
        name: 'Button',
        fields: [
          { key: 'icon', type: 'text', def: 'volume-2' },
          { key: 'flat', type: 'bool', def: 'false' },
          { key: 'disabled', type: 'bool', def: 'false' },
        ]
      },
      {
        name: 'Slider',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="12" x2="20" y2="12"/><circle cx="14" cy="12" r="3" fill="currentColor"/></svg>',
        fields: [
          { key: 'min_value', type: 'text', def: '0' },
          { key: 'max_value', type: 'text', def: '100' },
          { key: 'value', type: 'text', def: '65' },
          { key: 'step', type: 'text', def: '1' },
          { key: 'track_color', label: 'track color', type: 'color', def: 'rgba(255,255,255,0.25)' },
          { key: 'fill_color', label: 'fill color', type: 'color', def: '#ffffff' },
          { key: 'track_height', type: 'text', def: '4' },
          { key: 'track_radius', type: 'text', def: '49' },
          { key: 'thumb_size', type: 'text', def: '14' },
          { key: 'thumb_color', label: 'thumb color', type: 'color', def: '#ffffff' },
        ]
      },
      {
        name: 'VolumeButton',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h8"/></svg>',
        fields: [
          { key: 'button_slider_gap', label: 'gap between button & slider', type: 'text', def: '10' },
          { key: 'always_show_slider', label: 'always show slider', type: 'bool', def: 'false' },
          { key: 'expand_duration', label: 'expand duration (ms)', type: 'text', def: '200' },
          { key: 'slider_width', label: 'slider width', type: 'text', def: '200' },
        ]
      },
    ],
    'ColorRect': [{
      name: 'ColorRect',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" opacity="0.3"/><path d="M3 21L21 3" stroke="currentColor" stroke-width="2"/></svg>',
      fields: [
        { key: 'color', type: 'color', def: 'rgba(0,0,0,0.5)' },
        { key: 'gradient_enabled', type: 'bool', def: 'false' },
        { type: 'gradient_editor' },
      ]
    }],
    'TextureRect': [{
      name: 'TextureRect',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><path d="M21 15l-5-5L5 21"/></svg>',
      fields: [
        { key: 'texture', type: 'text', def: 'null' },
        { key: 'expand_mode', type: 'select', def: 'KEEP_SIZE', opts: ['KEEP_SIZE', 'IGNORE_SIZE', 'FIT_WIDTH', 'FIT_HEIGHT'] },
        { key: 'stretch_mode', type: 'select', def: 'SCALE', opts: ['SCALE', 'TILE', 'KEEP', 'KEEP_CENTERED', 'KEEP_ASPECT', 'KEEP_ASPECT_CENTERED'] },
      ]
    }],
    'VideoStreamPlayer': [{
      name: 'VideoStreamPlayer',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2"/><polygon points="10,8 16,12 10,16" fill="currentColor"/></svg>',
      fields: [
        { key: 'stream', type: 'text', def: 'null' },
        { key: 'autoplay', type: 'bool', def: 'false' },
        { key: 'paused', type: 'bool', def: 'false' },
        { key: 'volume_db', type: 'text', def: '0.0' },
        { key: 'expand', type: 'bool', def: 'true' },
        { key: 'bus', type: 'text', def: 'Master' },
      ]
    }],
  };

  return [...base, ...(extra[node.type] || [])];
}
