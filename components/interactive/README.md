# Interactive Components

This folder contains all interactive React components used throughout the portfolio application.

## Structure

### 📁 `/work`
Components related to work experience and professional content:
- `ConstellationSkills.tsx` - Interactive skill visualization with constellation theme
- `InvolvementSection.tsx` - Professional involvement and contributions section

### 📁 `/portfolio` 
Core portfolio interactive features:
- `interactive-portfolio-section.tsx` - Main interactive portfolio component
- `draggable-notebook.tsx` - Draggable notebook interface 
- `scribble-workspace.tsx` - Interactive scribble/drawing workspace
- `scribble-pad.tsx` - Drawing pad component
- `EnhancedHighlighterMark.tsx` - Highlighted text effects
- `interactive-toggle.tsx` - Interactive toggle controls
- `interactive-overlay.tsx` - Overlay interactive elements
- `draggable-component.tsx` - Base draggable component

### 📁 `/vlogs`
Video blog related components:
- `VlogGallery.tsx` - Gallery view for video blogs
- `VlogCard.tsx` - Individual vlog card component

### 📁 `/unused`
Components that are not currently in use but kept for potential future use:
- Various experimental and alternative implementations

## Usage

Import components from their organized locations:

```typescript
// Work components
import { ConstellationSkills } from '@/components/interactive/work/ConstellationSkills';

// Portfolio components
import InteractivePortfolioSection from '@/components/interactive/portfolio/interactive-portfolio-section';

// Vlog components
import { VlogGallery } from '@/components/interactive/vlogs/VlogGallery';

// Or use the index exports
import { ConstellationSkills, VlogGallery } from '@/components/interactive';
```

## Maintenance

- **Active components**: Currently used components are organized by feature area
- **Unused components**: Moved to `/unused` folder to declutter but preserve for future use
- **Import paths**: Updated throughout the codebase to reflect the new organization
