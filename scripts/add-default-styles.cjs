const fs = require('fs');
const path = require('path');

const projectPath = path.join(__dirname, '../public/default_project/project.json');

// Default style for buttons
const DEFAULT_BUTTON_STYLE = {
  fill: {
    normal: {
      type: 'solid',
      color: '#ffffff',
      opacity: 0.1
    },
    hover: {
      type: 'solid',
      color: '#ffffff',
      opacity: 0.2
    },
    active: {
      type: 'solid',
      color: '#ffffff',
      opacity: 0.15
    }
  },
  stroke: {
    normal: {
      enabled: false,
      type: 'solid',
      color: '#ffffff',
      width: 1,
      opacity: 1
    }
  },
  borderRadius: {
    linked: true,
    all: 50
  },
  effects: {
    normal: {
      backgroundBlur: 0,
      shadows: []
    }
  }
};

// Read project file
const project = JSON.parse(fs.readFileSync(projectPath, 'utf8'));

// Update all Button nodes
let updatedCount = 0;
project.tree.forEach(node => {
  if (node.type === 'Button') {
    // Remove old style props
    delete node.props.bg_color;
    delete node.props.hover_bg_color;
    delete node.props.active_bg_color;
    delete node.props.disabled_bg_color;
    delete node.props.border_radius;

    // Add new style system
    node.props.style = DEFAULT_BUTTON_STYLE;

    updatedCount++;
  }

  if (node.type === 'VolumeButton') {
    // Remove old style props
    delete node.props.bg_color;
    delete node.props.hover_bg_color;
    delete node.props.border_radius;

    // Add new style system
    node.props.style = DEFAULT_BUTTON_STYLE;

    updatedCount++;
  }
});

// Update modified timestamp
project.modified = new Date().toISOString();

// Write back
fs.writeFileSync(projectPath, JSON.stringify(project, null, 2), 'utf8');

console.log(`✓ Updated ${updatedCount} nodes with default styles`);
console.log(`✓ Saved to ${projectPath}`);
