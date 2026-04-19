export interface SVGProperties {
  viewBox: string;
  width: string;
  height: string;
  fill: string;
  stroke: string;
  strokeWidth: string;
}

export function parseSVG(svgString: string): SVGProperties {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svg = doc.querySelector('svg');

  if (!svg) {
    throw new Error('Invalid SVG');
  }

  // Get SVG attributes
  const viewBox = svg.getAttribute('viewBox') || '';
  const width = svg.getAttribute('width') || '';
  const height = svg.getAttribute('height') || '';

  // Get fill from first path/element
  const firstPath = svg.querySelector('path, circle, rect, polygon');
  const fill = firstPath?.getAttribute('fill') || 'none';
  const stroke = firstPath?.getAttribute('stroke') || 'none';
  const strokeWidth = firstPath?.getAttribute('stroke-width') || '0';

  return {
    viewBox,
    width,
    height,
    fill,
    stroke,
    strokeWidth
  };
}

export function updateSVG(svgString: string, props: Partial<SVGProperties>): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svg = doc.querySelector('svg');

  if (!svg) {
    throw new Error('Invalid SVG');
  }

  // Update SVG attributes
  if (props.viewBox !== undefined) svg.setAttribute('viewBox', props.viewBox);
  if (props.width !== undefined) svg.setAttribute('width', props.width);
  if (props.height !== undefined) svg.setAttribute('height', props.height);

  // Update all paths/elements
  const elements = svg.querySelectorAll('path, circle, rect, polygon, ellipse, line, polyline');
  elements.forEach(el => {
    if (props.fill !== undefined && props.fill !== 'none') {
      el.setAttribute('fill', props.fill);
    }
    if (props.stroke !== undefined) {
      if (props.stroke === 'none') {
        el.removeAttribute('stroke');
      } else {
        el.setAttribute('stroke', props.stroke);
      }
    }
    if (props.strokeWidth !== undefined) {
      if (props.strokeWidth === '0') {
        el.removeAttribute('stroke-width');
      } else {
        el.setAttribute('stroke-width', props.strokeWidth);
      }
    }
  });

  const serializer = new XMLSerializer();
  return serializer.serializeToString(svg);
}

export function svgToDataUrl(svgString: string): string {
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  return URL.createObjectURL(blob);
}
