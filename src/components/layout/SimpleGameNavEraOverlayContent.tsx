'use client';

import React from 'react';
import { DesignSystemLab } from '@/components/ui/TimeMachine/components/DesignSystemLab';
import { DesignLabEditor, type LabDesignTokens } from '@/components/ui/TimeMachine/components/DesignLabEditor';
import type { ThemeConfig } from '@/data/portfolio-data';

interface SimpleGameNavEraOverlayContentProps {
  readonly era: ThemeConfig;
  readonly isLabEditorOpen: boolean;
  readonly onOpenLabEditor: () => void;
  readonly onApply: (tokens: LabDesignTokens) => void;
  readonly onCloseLabEditor: () => void;
}

export function SimpleGameNavEraOverlayContent({
  era,
  isLabEditorOpen,
  onOpenLabEditor,
  onApply,
  onCloseLabEditor,
}: SimpleGameNavEraOverlayContentProps) {
  if (isLabEditorOpen) {
    return (
      <DesignLabEditor
        era={era}
        onApply={onApply}
        onClose={onCloseLabEditor}
      />
    );
  }
  return (
    <DesignSystemLab
      era={era}
      onOpenLabEditor={onOpenLabEditor}
    />
  );
}

export default SimpleGameNavEraOverlayContent;
