import type { TreeNode, PropertySection } from '../types';

export function getPropSections(node: TreeNode): PropertySection[] {
  const buttonMode = node.type === 'Button' ? (node.props.button_mode || 'legacy') : null;
  const panelMode = node.type === 'PanelContainer' ? (node.props.panel_mode || 'legacy') : null;

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
        { key: 'anchor_left', type: 'slider', def: '0', min: 0, max: 1, step: 0.01 },
        { key: 'anchor_top', type: 'slider', def: '0', min: 0, max: 1, step: 0.01 },
        { key: 'anchor_right', type: 'slider', def: '0', min: 0, max: 1, step: 0.01 },
        { key: 'anchor_bottom', type: 'slider', def: '0', min: 0, max: 1, step: 0.01 },
      ]
    },
    {
      name: 'Control — Rect',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>',
      fields: [
        { type: 'rect_offset' },
        { type: 'vector2_size' },
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
        { key: 'hide_delay', label: 'hide delay (s)', type: 'slider', def: '3', min: 0, max: 10, step: 0.1 },
        { key: 'fade_duration', label: 'fade duration (s)', type: 'slider', def: '0.3', min: 0, max: 2, step: 0.1 },
        { key: 'show_on_input', label: 'show on input', type: 'bool', def: 'true' },
      ]
    }],
    'MarginContainer': [{
      name: 'Margins',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="7" y="7" width="10" height="10" rx="1" stroke-dasharray="2 2"/></svg>',
      fields: [
        { key: 'margin_left', type: 'slider', def: '0', min: 0, max: 100 },
        { key: 'margin_top', type: 'slider', def: '0', min: 0, max: 100 },
        { key: 'margin_right', type: 'slider', def: '0', min: 0, max: 100 },
        { key: 'margin_bottom', type: 'slider', def: '0', min: 0, max: 100 },
        { type: 'margin_preview' },
        { key: 'clip_contents', type: 'bool', def: 'false' },
      ]
    }],
    'HBoxContainer': [{
      name: 'HBoxContainer',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="5" height="14" rx="1"/><rect x="10" y="5" width="5" height="14" rx="1"/><rect x="17" y="5" width="4" height="14" rx="1"/></svg>',
      fields: [
        { key: 'alignment', type: 'select', def: 'BEGIN', opts: ['BEGIN', 'CENTER', 'END'] },
        { key: 'separation', type: 'slider', def: '4', min: 0, max: 50 },
        { key: 'clip_contents', type: 'bool', def: 'false' },
      ]
    }],
    'VBoxContainer': [{
      name: 'VBoxContainer',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="3" width="14" height="5" rx="1"/><rect x="5" y="10" width="14" height="5" rx="1"/><rect x="5" y="17" width="14" height="4" rx="1"/></svg>',
      fields: [
        { key: 'alignment', type: 'select', def: 'BEGIN', opts: ['BEGIN', 'CENTER', 'END'] },
        { key: 'separation', type: 'slider', def: '4', min: 0, max: 50 },
        { key: 'clip_contents', type: 'bool', def: 'false' },
      ]
    }],
    'PanelContainer': [
      {
        name: 'Style',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
        fields: [
          { type: 'style_tab' }
        ]
      },
      {
        name: 'Panel Mode',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/></svg>',
        fields: [
          { type: 'panel_mode_switch' },
        ]
      },
      ...(panelMode === 'svg' ? [
        {
          name: 'SVG Panel',
          icon: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="3"/></svg>',
          fields: [
            { key: 'svg_content', label: 'SVG content', type: 'svg_picker', def: '<svg viewBox="0 0 100 100" fill="none"><rect width="100" height="100" fill="rgba(37,39,41,0.8)" rx="8"/></svg>' },
            { key: 'clip_contents', type: 'bool', def: 'false' },
          ]
        }
      ] : [
        {
          name: 'Panel Style',
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" opacity="0.2"/><rect x="3" y="3" width="18" height="18" rx="3"/></svg>',
          fields: [
            { key: 'border_color', label: 'border', type: 'color', def: '#333537' },
            { key: 'padding', type: 'slider', def: '8', min: 0, max: 50 },
            { key: 'clip_contents', type: 'bool', def: 'false' },
          ]
        }
      ])
    ],
    'Button': [
      {
        name: 'Button Mode',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="8" width="16" height="8" rx="4"/></svg>',
        fields: [
          { type: 'button_mode_switch' },
        ]
      },
      ...(buttonMode === 'svg' ? [
        {
          name: 'SVG Button',
          icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
          fields: [
            { key: 'svg_content', label: 'SVG content', type: 'svg_picker', def: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' },
            { key: 'action', type: 'select', def: 'none', opts: ['none', 'play', 'rewind', 'forward', 'next', 'fullscreen'] },
            { key: 'disabled', type: 'bool', def: 'false' },
          ]
        }
      ] : [
        {
          name: 'Style',
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
          fields: [
            { type: 'style_tab' }
          ]
        },
        {
          name: 'Button',
          fields: [
            { key: 'text', type: 'text', def: 'Button' },
            { key: 'action', type: 'select', def: 'none', opts: ['none', 'play', 'rewind', 'forward', 'next', 'fullscreen'] },
            { key: 'icon', type: 'icon_picker', def: '' },
            { key: 'icon_position', label: 'icon position', type: 'select', def: 'row', opts: ['row', 'column'] },
            { key: 'icon_label', type: 'text', def: '' },
            { key: 'icon_label_size', type: 'slider', def: '15', min: 8, max: 24 },
            { key: 'icon_label_gap', type: 'slider', def: '0', min: 0, max: 20 },
            { key: 'flat', type: 'bool', def: 'false' },
            { key: 'disabled', type: 'bool', def: 'false' },
            { key: 'toggle_mode', type: 'bool', def: 'false' },
            { key: 'toggle_pressed', label: 'initially pressed', type: 'bool', def: 'false' },
            { key: 'toggle_icon', label: 'toggle icon (when pressed)', type: 'icon_picker', def: '' },
            { key: 'icon_animation', label: 'icon animation', type: 'select', def: 'none', opts: ['none', 'fade', 'morph'] },
            { key: 'icon_animation_duration', label: 'icon animation duration (ms)', type: 'slider', def: '300', min: 100, max: 1000, step: 50 },
            { key: 'sync_with_video', label: 'sync with video state', type: 'bool', def: 'false' },
            { key: 'alignment', type: 'select', def: 'CENTER', opts: ['LEFT', 'CENTER', 'RIGHT'] },
            { key: 'gap', type: 'slider', def: '8', min: 0, max: 50 },
          ]
        }
      ]),
    ],
    'Label': [{
      name: 'Label',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h10M4 17h14"/></svg>',
      fields: [
        { key: 'text', type: 'text', def: 'Label' },
        { key: 'display_mode', label: 'display mode', type: 'select', def: 'text', opts: ['text', 'time_remaining'] },
        { key: 'font_color', label: 'font color', type: 'color', def: '#ffffff' },
        { key: 'font_size', type: 'slider', def: '14', min: 8, max: 32 },
        { key: 'font_weight', type: 'slider', def: '500', min: 100, max: 900, step: 100 },
        { key: 'horizontal_alignment', type: 'select', def: 'LEFT', opts: ['LEFT', 'CENTER', 'RIGHT', 'FILL'] },
        { key: 'autowrap_mode', type: 'select', def: 'OFF', opts: ['OFF', 'WORD', 'WORD_SMART'] },
      ]
    }],
    'HSlider': [{
      name: 'Slider',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="12" x2="20" y2="12"/><circle cx="14" cy="12" r="3" fill="currentColor"/></svg>',
      fields: [
        { key: 'min_value', type: 'slider', def: '0', min: 0, max: 1000 },
        { key: 'max_value', type: 'slider', def: '100', min: 0, max: 10000 },
        { key: 'value', type: 'slider', def: '0', min: 0, max: 100 },
        { key: 'step', type: 'slider', def: '1', min: 0.1, max: 100, step: 0.1 },
        { key: 'track_color', label: 'track color', type: 'color', def: 'rgba(255,255,255,0.2)' },
        { key: 'fill_color', label: 'fill color', type: 'color', def: '#ffffff' },
        { key: 'icon', type: 'icon_picker', def: '' },
        { key: 'icon_size', type: 'slider', def: '20', min: 10, max: 50 },
        { key: 'icon_gap', type: 'slider', def: '12', min: 0, max: 50 },
        { key: 'track_height', type: 'slider', def: '7', min: 1, max: 20 },
        { key: 'track_radius', type: 'slider', def: '49', min: 0, max: 50 },
        { key: 'thumb_size', type: 'slider', def: '15', min: 5, max: 30 },
        { key: 'thumb_color', label: 'thumb color', type: 'color', def: '#ffffff' },
      ]
    }],
    'VolumeButton': [
      {
        name: 'Button Style',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="8" width="16" height="8" rx="4"/></svg>',
        fields: [
          { key: 'font_color', label: 'font color', type: 'color', def: '#ffffff' },
        ]
      },
      {
        name: 'Button',
        fields: [
          { key: 'icon', type: 'icon_picker', def: 'volume-2' },
          { key: 'flat', type: 'bool', def: 'false' },
          { key: 'disabled', type: 'bool', def: 'false' },
        ]
      },
      {
        name: 'Slider',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="12" x2="20" y2="12"/><circle cx="14" cy="12" r="3" fill="currentColor"/></svg>',
        fields: [
          { key: 'min_value', type: 'slider', def: '0', min: 0, max: 1000 },
          { key: 'max_value', type: 'slider', def: '100', min: 0, max: 1000 },
          { key: 'value', type: 'slider', def: '65', min: 0, max: 100 },
          { key: 'step', type: 'slider', def: '1', min: 0.1, max: 100, step: 0.1 },
          { key: 'track_color', label: 'track color', type: 'color', def: 'rgba(255,255,255,0.25)' },
          { key: 'fill_color', label: 'fill color', type: 'color', def: '#ffffff' },
          { key: 'track_height', type: 'slider', def: '4', min: 1, max: 20 },
          { key: 'track_radius', type: 'slider', def: '49', min: 0, max: 50 },
          { key: 'thumb_size', type: 'slider', def: '14', min: 5, max: 30 },
          { key: 'thumb_color', label: 'thumb color', type: 'color', def: '#ffffff' },
        ]
      },
      {
        name: 'VolumeButton',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h8"/></svg>',
        fields: [
          { key: 'button_slider_gap', label: 'gap between button & slider', type: 'slider', def: '10', min: 0, max: 50 },
          { key: 'always_show_slider', label: 'always show slider', type: 'bool', def: 'false' },
          { key: 'expand_duration', label: 'expand duration (ms)', type: 'slider', def: '200', min: 0, max: 1000, step: 50 },
          { key: 'slider_width', label: 'slider width', type: 'slider', def: '200', min: 50, max: 500 },
        ]
      },
    ],
    'ColorRect': [{
      name: 'ColorRect',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" opacity="0.3"/><path d="M3 21L21 3" stroke="currentColor" stroke-width="2"/></svg>',
      fields: [
        { key: 'color', type: 'color', def: '#000000' },
        { key: 'color_alpha', label: 'alpha', type: 'slider', def: '0.5', min: 0, max: 1, step: 0.01 },
        { key: 'gradient_enabled', type: 'bool', def: 'false' },
        { key: 'gradient_angle', label: 'angle', type: 'slider', def: '0', min: 0, max: 360 },
        { key: 'gradient_start', label: 'start color', type: 'color', def: '#000000' },
        { key: 'gradient_start_alpha', label: 'start alpha', type: 'slider', def: '0.9', min: 0, max: 1, step: 0.01 },
        { key: 'gradient_start_pos', label: 'start position', type: 'slider', def: '0', min: 0, max: 100 },
        { key: 'gradient_end', label: 'end color', type: 'color', def: '#000000' },
        { key: 'gradient_end_alpha', label: 'end alpha', type: 'slider', def: '0', min: 0, max: 1, step: 0.01 },
        { key: 'gradient_end_pos', label: 'end position', type: 'slider', def: '50', min: 0, max: 100 },
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
        { key: 'volume_db', type: 'slider', def: '0.0', min: -80, max: 0, step: 0.1 },
        { key: 'expand', type: 'bool', def: 'true' },
        { key: 'bus', type: 'text', def: 'Master' },
      ]
    }],
    'Separator': [{
      name: 'Separator',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="12" x2="20" y2="12"/></svg>',
      fields: [
        { key: 'show_line', label: 'show line', type: 'bool', def: 'true' },
        { key: 'line_color', label: 'line color', type: 'color', def: 'rgba(255,255,255,0.2)' },
        { key: 'line_thickness', label: 'line thickness', type: 'slider', def: '1', min: 1, max: 10, step: 0.01 },
        { key: 'separation', label: 'separation (spacing)', type: 'slider', def: '8', min: 0, max: 50, step: 0.01 },
      ]
    }],
  };

  return [...base, ...(extra[node.type] || [])];
}
