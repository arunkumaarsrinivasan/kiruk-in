'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DraggableItem } from '@/components/interactive/draggable-notebook';

interface UseInteractiveModeOptions {
  initialItems?: DraggableItem[];
  storageKey?: string;
}

export const useInteractiveMode = (options: UseInteractiveModeOptions = {}) => {
  const { initialItems = [], storageKey = 'interactive-mode' } = options;
  const [isInteractive, setIsInteractive] = useState(false);
  const [items, setItems] = useState<DraggableItem[]>(initialItems);
  const router = useRouter();
  const [lastPath, setLastPath] = useState<string | null>(null);

  const enableInteractiveMode = useCallback(() => {
    setIsInteractive(true);
    if (typeof window !== 'undefined') {
      setLastPath(window.location.pathname);
    }
    // Load saved items from localStorage if available
    if (typeof window !== 'undefined' && storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const savedItems = JSON.parse(saved);
          setItems(savedItems);
        } else if (initialItems.length > 0) {
          setItems(initialItems);
        }
      } catch (error) {
        console.error('Failed to load interactive items:', error);
        setItems(initialItems);
      }
    }
  }, [initialItems, storageKey]);

  const disableInteractiveMode = useCallback(() => {
    setIsInteractive(false);
    if (lastPath && typeof window !== 'undefined' && window.location.pathname !== lastPath) {
      router.push(lastPath);
    }
    // Do NOT clear items here; just exit interactive mode
  }, [lastPath, router]);

  const toggleInteractiveMode = useCallback(() => {
    if (isInteractive) {
      disableInteractiveMode();
    } else {
      enableInteractiveMode();
    }
  }, [isInteractive, enableInteractiveMode, disableInteractiveMode]);

  const updateItems = useCallback((newItems: DraggableItem[]) => {
    setItems(newItems);
    // Save to localStorage if available
    if (typeof window !== 'undefined' && storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(newItems));
      } catch (error) {
        console.error('Failed to save interactive items:', error);
      }
    }
  }, [storageKey]);

  const resetItems = useCallback(() => {
    setItems(initialItems);
    if (typeof window !== 'undefined' && storageKey) {
      try {
        localStorage.removeItem(storageKey);
      } catch (error) {
        console.error('Failed to clear interactive items:', error);
      }
    }
  }, [initialItems, storageKey]);

  return {
    isInteractive,
    items,
    enableInteractiveMode,
    disableInteractiveMode,
    toggleInteractiveMode,
    updateItems,
    resetItems
  };
};
