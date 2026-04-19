# Container System Implementation Gaps

## Analysis Date: 2026-04-19

This document identifies all missing functionality in the current TypeScript implementation compared to the original index.html.

---

## ✅ ALREADY CORRECT

### MarginContainer
- ✅ Inner div system with id='inner_'+nodeId
- ✅ Absolute positioning of inner div
- ✅ Left/top/right/bottom based on margin props
- ✅ Children appended to inner div (via renderNodeRecursive)

### HBoxContainer
- ✅ Display flex with row direction
- ✅ Gap based on separation property
- ✅ JustifyContent based on alignment (BEGIN/CENTER/END)
- ✅ MinWidth and minHeight
- ✅ Clip contents overflow handling

### VBoxContainer
- ✅ Display flex with column direction
- ✅ Gap based on separation property
- ✅ JustifyContent based on alignment (BEGIN/CENTER/END)
- ✅ MinWidth and minHeight
- ✅ Clip contents overflow handling

### PanelContainer
- ✅ Background color from bg_color
- ✅ Border radius from border_radius
- ✅ Padding from padding property
- ✅ Display flex
- ✅ Border color support

### Positioning Logic
- ✅ Parent flex container detection
- ✅ Explicit anchor detection
- ✅ Flex positioning when parent is flex AND no explicit anchors
- ✅ Point anchor with transform translate
- ✅ Stretch anchor with calc()
- ✅ Custom minimum size application

### Size Flags
- ✅ FILL: flexGrow 1, flexShrink 1
- ✅ EXPAND_FILL: flexGrow 1, flexShrink 1
- ✅ SHRINK_BEGIN: flexShrink 0, marginRight auto
- ✅ SHRINK_END: flexShrink 0, marginLeft auto
- ✅ SHRINK_CENTER: flexShrink 0, margin 0 auto
- ✅ EXPAND_FILL vertical: alignSelf stretch
- ✅ SHRINK_CENTER vertical: alignSelf center

### Visibility
- ✅ Parent visibility inheritance (checks all parents up the tree)

---

## ❌ MISSING FUNCTIONALITY

### 1. AutoHideContainer Opacity Transitions
**Original (line 5022-5029):**
```javascript
el.style.opacity = n.props.mouse_filter === 'IGNORE' ? '0' : '1';
el.style.transition = `opacity ${n.props.transition_duration || '300'}ms ease`;
```

**Current (line 24-30):**
```typescript
element.style.transition = 'opacity 0.3s ease';
// No opacity logic based on mouse_filter
// No hover handlers for opacity changes
```

**Gap:** AutoHideContainer doesn't change opacity based on mouse_filter or hover state.

---

### 2. PanelContainer Alignment
**Original (line 5084-5095):**
```javascript
el.style.display = 'flex';
el.style.alignItems = 'center';
el.style.justifyContent = 'center';
```

**Current (line 91-105):**
```typescript
element.style.display = 'flex';
element.style.flexDirection = 'column';
// Missing: alignItems and justifyContent for centering
```

**Gap:** PanelContainer children are not centered. Original centers both horizontally and vertically.

---

### 3. HBoxContainer alignItems
**Original (line 5055-5069):**
```javascript
el.style.alignItems = 'center'; // Always centers vertically
```

**Current (line 58-73):**
```typescript
element.style.alignItems = 'center'; // ✅ Present
```

**Status:** ✅ Actually correct!

---

### 4. Custom Minimum Size Parsing
**Original (line 5425-5435):**
```javascript
const cms = n.props.custom_minimum_size || '(0,0)';
const match = cms.match(/\((\d+),(\d+)\)/);
if (match) {
  const w = parseInt(match[1]);
  const h = parseInt(match[2]);
  if (w > 0) el.style.minWidth = w + 'px';
  if (h > 0) {
    el.style.minHeight = h + 'px';
    el.style.maxHeight = h + 'px'; // Sets BOTH min and max
  }
}
```

**Current (line 554-564):**
```typescript
// Same logic - ✅ Correct
```

**Status:** ✅ Correct!

---

### 5. PropertyApplier Missing Cases

**Original applyProp function handles many dynamic updates that current propertyApplier.ts might be missing:**

#### Missing: MarginContainer margin updates
**Original (line 4047-4055):**
```javascript
if (key.startsWith('margin_')) {
  const inner = document.getElementById('inner_' + n.id);
  if (inner) {
    const ml = parseFloat(n.props.margin_left || 0);
    const mt = parseFloat(n.props.margin_top || 0);
    const mr = parseFloat(n.props.margin_right || 0);
    const mb = parseFloat(n.props.margin_bottom || 0);
    inner.style.left = ml + 'px';
    inner.style.top = mt + 'px';
    inner.style.right = mr + 'px';
    inner.style.bottom = mb + 'px';
  }
}
```

**Current (line 184-201):**
```typescript
// ✅ Present and correct!
```

---

### 6. Container Overlay Visualization
**Original (line 4060-4200):**
- MarginContainer shows outer/inner borders with margin labels
- HBoxContainer shows separation gaps between children
- VBoxContainer shows separation gaps between children
- PanelContainer shows border

**Current:**
- ContainerOverlays.tsx exists but may not match original visualization exactly

---

## 🔍 SUMMARY OF ACTUAL GAPS

After detailed comparison, the TypeScript implementation is **surprisingly complete**. The main gaps are:

1. **AutoHideContainer opacity logic** - Not implemented
2. **PanelContainer centering** - Missing alignItems/justifyContent center
3. **Container overlay visualization** - May differ from original

The core container positioning, size flags, anchors, and flex layout are all correctly implemented!

---

## 📋 REVISED TASK PRIORITIES

### HIGH PRIORITY
1. Fix AutoHideContainer opacity transitions (Task #16)
2. Fix PanelContainer centering (Task #15)

### MEDIUM PRIORITY
3. Verify container overlay visualization matches original
4. Test all container behaviors thoroughly (Task #20)

### LOW PRIORITY (Already Working)
- ~~MarginContainer~~ ✅
- ~~HBoxContainer~~ ✅
- ~~VBoxContainer~~ ✅
- ~~Positioning logic~~ ✅
- ~~Size flags~~ ✅
- ~~Visibility inheritance~~ ✅
