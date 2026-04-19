import type { TreeNode, NodeType } from '../types';
import { assetManager } from '../store/assetStore';

function getAssetByName(name: string): string {
  const assets = assetManager.listAssets();
  const asset = assets.find(a => a.name === name);
  const result = asset ? `asset:${asset.id}` : '';
  console.log(`getAssetByName("${name}"):`, result, asset ? 'found' : 'NOT FOUND');
  return result;
}

export function buildDefaultScene(): TreeNode[] {
  const tree: TreeNode[] = [];
  let nidCounter = 500;

  const mk = (id: string, label: string, type: NodeType, pid: string | null, open = true): TreeNode => {
    const n = {
      id: id || `n${nidCounter++}`,
      label,
      type,
      open,
      visible: true,
      pid: pid || null,
      children: [],
      props: {}
    };
    if (pid) {
      const p = tree.find(x => x.id === pid);
      if (p) p.children.push(n.id);
    }
    tree.push(n);
    return n;
  };

  // Canvas layer
  const cv = mk('canvas', 'Canvas', 'CanvasLayer', null, true);
  cv.props = {
    layer: '1',
    visible: 'true',
    follow_viewport: 'false',
    anchor_left: '0',
    anchor_top: '0',
    anchor_right: '1',
    anchor_bottom: '1',
    offset_left: '0',
    offset_top: '0',
    offset_right: '0',
    offset_bottom: '0'
  };

  // Video player background
  const vsp = mk('videostream', 'VideoStreamPlayer', 'VideoStreamPlayer', cv.id, false);
  vsp.props = {
    stream: 'null',
    autoplay: 'false',
    paused: 'false',
    volume_db: '0.0',
    expand: 'true',
    bus: 'Master',
    visible: 'true',
    anchor_left: '0',
    anchor_top: '0',
    anchor_right: '1',
    anchor_bottom: '1',
    offset_left: '0',
    offset_top: '0',
    offset_right: '0',
    offset_bottom: '0'
  };

  // AutoHideContainer
  const ahc = mk('autohide', 'AutoHideContainer', 'AutoHideContainer', cv.id, true);
  ahc.props = {
    anchor_left: '0',
    anchor_top: '0',
    anchor_right: '1',
    anchor_bottom: '1',
    offset_left: '0',
    offset_top: '0',
    offset_right: '0',
    offset_bottom: '0',
    auto_hide_enabled: 'true',
    hide_delay: '3',
    fade_duration: '0.3',
    show_on_input: 'true',
    visible: 'true',
    modulate: '#ffffff'
  };

  // Gradient overlay
  const go = mk('gradient', 'GradientOverlay', 'ColorRect', ahc.id, false);
  go.props = {
    color: '#000000',
    color_alpha: '0.5',
    gradient_enabled: 'true',
    gradient_angle: '0',
    gradient_start: '#000000',
    gradient_start_alpha: '0.9',
    gradient_start_pos: '0',
    gradient_end: '#000000',
    gradient_end_alpha: '0',
    gradient_end_pos: '50',
    visible: 'true',
    anchor_left: '0',
    anchor_top: '0',
    anchor_right: '1',
    anchor_bottom: '1',
    offset_left: '0',
    offset_top: '0',
    offset_right: '0',
    offset_bottom: '0'
  };

  // Main margin container
  const mc = mk('margincontainer', 'MarginContainer', 'MarginContainer', ahc.id, true);
  mc.props = {
    anchor_left: '0',
    anchor_top: '0',
    anchor_right: '1',
    anchor_bottom: '1',
    offset_left: '0',
    offset_top: '0',
    offset_right: '0',
    offset_bottom: '0',
    margin_left: '40',
    margin_top: '60',
    margin_right: '40',
    margin_bottom: '22',
    custom_minimum_size: '(0,0)',
    size_flags_horizontal: 'FILL',
    size_flags_vertical: 'FILL',
    visible: 'true',
    modulate: '#ffffff'
  };

  // HUD container
  const hud = mk('hud', 'HUD', 'VBoxContainer', mc.id, true);
  hud.props = {
    anchor_left: '0',
    anchor_top: '0',
    anchor_right: '1',
    anchor_bottom: '1',
    offset_left: '0',
    offset_top: '0',
    offset_right: '0',
    offset_bottom: '0',
    alignment: 'END',
    separation: '18',
    visible: 'true',
    modulate: '#ffffff'
  };

  // Skip buttons row
  const skipRow = mk('skiprow', 'SkipRow', 'HBoxContainer', hud.id, true);
  skipRow.props = {
    alignment: 'BEGIN',
    separation: '0',
    visible: 'true',
    custom_minimum_size: '(0,54)',
    modulate: '#ffffff',
    size_flags_horizontal: 'FILL'
  };

  const sb1 = mk('skipbtn1', 'SkipOpening1', 'Button', skipRow.id, false);
  sb1.props = {
    text: 'Пропустить опенинг',
    disabled: 'false',
    flat: 'false',
    alignment: 'CENTER',
    visible: 'true',
    custom_minimum_size: '(286,54)',
    border_radius: '100',
    bg_color: 'rgba(255,255,255,0.1)',
    font_color: '#ffffff',
    font_size: '16',
    font_family: 'Montserrat',
    size_flags_horizontal: 'SHRINK_BEGIN',
    size_flags_vertical: 'SHRINK_CENTER'
  };

  const sb2 = mk('skipbtn2', 'SkipOpening2', 'Button', skipRow.id, false);
  sb2.props = {
    text: 'Пропустить опенинг',
    disabled: 'false',
    flat: 'false',
    alignment: 'CENTER',
    visible: 'true',
    custom_minimum_size: '(286,54)',
    border_radius: '100',
    bg_color: 'rgba(255,255,255,0.1)',
    font_color: '#ffffff',
    font_size: '16',
    font_family: 'Montserrat',
    size_flags_horizontal: 'SHRINK_END',
    size_flags_vertical: 'SHRINK_CENTER'
  };

  // Timeline row
  const timelineRow = mk('timelinerow', 'TimelineRow', 'HBoxContainer', hud.id, true);
  timelineRow.props = {
    alignment: 'BEGIN',
    separation: '12',
    visible: 'true',
    custom_minimum_size: '(0,24)',
    modulate: '#ffffff',
    size_flags_horizontal: 'FILL'
  };

  const tln = mk('timeline', 'Timeline', 'HSlider', timelineRow.id, false);
  tln.props = {
    min_value: '0',
    max_value: '3838',
    value: '677',
    step: '1',
    visible: 'true',
    custom_minimum_size: '(0,7)',
    track_color: 'rgba(255,255,255,0.25)',
    fill_color: '#ffffff',
    size_flags_horizontal: 'FILL'
  };

  const timeLabel = mk('timelabel', 'TimeLabel', 'Label', timelineRow.id, false);
  timeLabel.props = {
    text: '-36:38',
    display_mode: 'time_remaining',
    visible: 'true',
    font_color: '#ffffff',
    font_size: '16',
    font_family: 'Montserrat',
    horizontal_alignment: 'RIGHT',
    size_flags_horizontal: 'SHRINK_END',
    custom_minimum_size: '(48,24)'
  };

  // Video controls container
  const vc = mk('videocontrols', 'Controls', 'HBoxContainer', hud.id, true);
  vc.props = {
    alignment: 'BEGIN',
    separation: '19',
    visible: 'true',
    custom_minimum_size: '(0,54)',
    modulate: '#ffffff',
    size_flags_horizontal: 'FILL'
  };

  // Left buttons container
  const lbc = mk('leftbuttons', 'LeftButtons', 'HBoxContainer', vc.id, true);
  lbc.props = {
    alignment: 'CENTER',
    separation: '19',
    visible: 'true',
    custom_minimum_size: '(0,54)',
    modulate: '#ffffff',
    size_flags_horizontal: 'SHRINK_BEGIN',
    size_flags_vertical: 'SHRINK_CENTER'
  };

  const pp = mk('playpause', 'PlayPause', 'Button', lbc.id, false);
  pp.props = {
    text: '',
    action: 'play',
    disabled: 'false',
    flat: 'false',
    alignment: 'CENTER',
    visible: 'true',
    custom_minimum_size: '(54,54)',
    border_radius: '100',
    bg_color: 'rgba(255,255,255,0.1)',
    font_color: '#ffffff',
    font_size: '18',
    font_family: 'Montserrat',
    size_flags_horizontal: 'SHRINK_CENTER',
    size_flags_vertical: 'SHRINK_CENTER',
    icon: getAssetByName('play.svg'),
    icon_toggle: getAssetByName('Vector.svg'),
    icon_animation: 'morph',
    icon_animation_duration: '400',
    sync_with_video: 'true'
  };

  const rw = mk('secback', 'Rewind10', 'Button', lbc.id, false);
  rw.props = {
    text: '',
    action: 'rewind',
    disabled: 'false',
    flat: 'false',
    alignment: 'CENTER',
    visible: 'true',
    custom_minimum_size: '(54,54)',
    border_radius: '100',
    bg_color: 'rgba(255,255,255,0.1)',
    font_color: '#ffffff',
    font_family: 'Montserrat',
    size_flags_horizontal: 'SHRINK_CENTER',
    size_flags_vertical: 'SHRINK_CENTER',
    icon: getAssetByName('timeback.svg'),
    icon_position: 'column',
    icon_label: '10',
    icon_label_size: '15',
    icon_label_gap: '0'
  };

  const fw = mk('secforward', 'Forward10', 'Button', lbc.id, false);
  fw.props = {
    text: '',
    action: 'forward',
    disabled: 'false',
    flat: 'false',
    alignment: 'CENTER',
    visible: 'true',
    custom_minimum_size: '(54,54)',
    border_radius: '100',
    bg_color: 'rgba(255,255,255,0.1)',
    font_color: '#ffffff',
    font_family: 'Montserrat',
    size_flags_horizontal: 'SHRINK_CENTER',
    size_flags_vertical: 'SHRINK_CENTER',
    icon: getAssetByName('timeforward.svg'),
    icon_position: 'column',
    icon_label: '10',
    icon_label_size: '15',
    icon_label_gap: '0'
  };

  const ne = mk('nextep', 'NextEpisode', 'Button', lbc.id, false);
  ne.props = {
    text: '',
    disabled: 'false',
    flat: 'false',
    alignment: 'CENTER',
    visible: 'true',
    custom_minimum_size: '(54,54)',
    border_radius: '100',
    bg_color: 'rgba(255,255,255,0.1)',
    font_color: '#ffffff',
    font_size: '18',
    font_family: 'Montserrat',
    size_flags_horizontal: 'SHRINK_CENTER',
    size_flags_vertical: 'SHRINK_CENTER',
    icon: getAssetByName('nextep.svg')
  };

  // Volume button
  const vb = mk('volumebtn', 'Volume', 'VolumeButton', lbc.id, false);
  vb.props = {
    bg_color: 'rgba(255,255,255,0.1)',
    hover_bg_color: 'rgba(255,255,255,0.18)',
    border_radius: '100',
    font_color: '#ffffff',
    icon: getAssetByName('volume.svg'),
    min_value: '0',
    max_value: '100',
    value: '65',
    step: '1',
    track_color: 'rgba(255,255,255,0.25)',
    fill_color: '#ffffff',
    track_height: '4',
    track_radius: '49',
    thumb_size: '14',
    thumb_color: '#ffffff',
    button_slider_gap: '10',
    always_show_slider: 'false',
    expand_duration: '200',
    slider_width: '200',
    custom_minimum_size: '(273,54)',
    size_flags_horizontal: 'SHRINK_CENTER',
    size_flags_vertical: 'SHRINK_CENTER',
    visible: 'true'
  };

  // Right buttons container
  const rbc = mk('rightbuttons', 'RightButtons', 'HBoxContainer', vc.id, true);
  rbc.props = {
    alignment: 'CENTER',
    separation: '19',
    visible: 'true',
    custom_minimum_size: '(0,54)',
    modulate: '#ffffff',
    size_flags_horizontal: 'SHRINK_END',
    size_flags_vertical: 'SHRINK_CENTER'
  };

  const seas = mk('seasons_eps', 'Seasons', 'Button', rbc.id, false);
  seas.props = {
    text: 'Сезоны и серии',
    disabled: 'false',
    flat: 'false',
    alignment: 'CENTER',
    visible: 'true',
    custom_minimum_size: '(223,54)',
    border_radius: '100',
    bg_color: 'rgba(255,255,255,0.1)',
    font_color: '#ffffff',
    font_size: '16',
    font_family: 'Montserrat',
    size_flags_horizontal: 'SHRINK_CENTER',
    size_flags_vertical: 'SHRINK_CENTER',
    icon: getAssetByName('seasonsandeps.svg'),
    icon_position: 'row'
  };

  const winp = mk('windowplayback', 'PiP', 'Button', rbc.id, false);
  winp.props = {
    text: '',
    disabled: 'false',
    flat: 'false',
    alignment: 'CENTER',
    visible: 'true',
    custom_minimum_size: '(54,54)',
    border_radius: '100',
    bg_color: 'rgba(255,255,255,0.1)',
    font_color: '#ffffff',
    font_size: '18',
    font_family: 'Montserrat',
    size_flags_horizontal: 'SHRINK_CENTER',
    size_flags_vertical: 'SHRINK_CENTER',
    icon: getAssetByName('overlay.svg')
  };

  const aud = mk('audioline', 'Audio', 'Button', rbc.id, false);
  aud.props = {
    text: '',
    disabled: 'false',
    flat: 'false',
    alignment: 'CENTER',
    visible: 'true',
    custom_minimum_size: '(54,54)',
    border_radius: '100',
    bg_color: 'rgba(255,255,255,0.1)',
    font_color: '#ffffff',
    font_size: '18',
    font_family: 'Montserrat',
    size_flags_horizontal: 'SHRINK_CENTER',
    size_flags_vertical: 'SHRINK_CENTER',
    icon: getAssetByName('mic.svg')
  };

  const subs = mk('subtitles', 'Subtitles', 'Button', rbc.id, false);
  subs.props = {
    text: '',
    disabled: 'false',
    flat: 'false',
    alignment: 'CENTER',
    visible: 'true',
    custom_minimum_size: '(54,54)',
    border_radius: '100',
    bg_color: 'rgba(255,255,255,0.1)',
    font_color: '#ffffff',
    font_size: '18',
    font_family: 'Montserrat',
    size_flags_horizontal: 'SHRINK_CENTER',
    size_flags_vertical: 'SHRINK_CENTER',
    icon: getAssetByName('settings.svg')
  };

  const fs = mk('fullscreen', 'Fullscreen', 'Button', rbc.id, false);
  fs.props = {
    text: '',
    action: 'fullscreen',
    disabled: 'false',
    flat: 'false',
    alignment: 'CENTER',
    visible: 'true',
    custom_minimum_size: '(54,54)',
    border_radius: '100',
    bg_color: 'rgba(255,255,255,0.1)',
    font_color: '#ffffff',
    font_size: '18',
    font_family: 'Montserrat',
    size_flags_horizontal: 'SHRINK_CENTER',
    size_flags_vertical: 'SHRINK_CENTER',
    icon: getAssetByName('fullscreen.svg')
  };

  return tree;
}
