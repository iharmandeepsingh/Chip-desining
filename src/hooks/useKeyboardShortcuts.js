import { useEffect, useCallback } from 'react';
import useCircuitStore from '../store/useCircuitStore';

const useKeyboardShortcuts = () => {
  const {
    addNode,
    undo,
    redo,
    canUndo,
    canRedo,
    clearCircuit,
    saveToHistory,
    propagateValues,
  } = useCircuitStore();

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((event) => {
    // Only handle shortcuts when not typing in input fields
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }

    // Prevent default behavior for our shortcuts
    const isModifierKey = event.ctrlKey || event.metaKey || event.altKey;
    
    if (isModifierKey) {
      event.preventDefault();
      
      switch (event.key.toLowerCase()) {
        // Gate creation shortcuts
        case 'i':
          addNode({
            id: Date.now().toString(),
            type: 'gate',
            position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
            data: { label: 'INPUT', value: false }
          });
          break;
          
        case 'a':
          addNode({
            id: Date.now().toString(),
            type: 'gate',
            position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
            data: { label: 'AND', value: false }
          });
          break;
          
        case 'o':
          addNode({
            id: Date.now().toString(),
            type: 'gate',
            position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
            data: { label: 'OR', value: false }
          });
          break;
          
        case 'n':
          addNode({
            id: Date.now().toString(),
            type: 'gate',
            position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
            data: { label: 'NOT', value: false }
          });
          break;
          
        case 'x':
          addNode({
            id: Date.now().toString(),
            type: 'gate',
            position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
            data: { label: 'OUTPUT', value: false }
          });
          break;
          
        // History shortcuts
        case 'z':
          if (event.shiftKey) {
            redo();
          } else {
            undo();
          }
          break;
          
        case 'y':
          if (event.shiftKey) {
            redo();
          } else {
            undo();
          }
          break;
          
        // Circuit operations
        case 's':
          saveToHistory();
          break;
          
        case 'r':
          propagateValues();
          break;
          
        case 'delete':
        case 'backspace':
          if (event.shiftKey) {
            clearCircuit();
          }
          break;
          
        // Simulation controls
        case ' ':
          // Space for step mode would be handled by the Step button
          break;
          
        case 'enter':
          propagateValues();
          break;
      }
    }
  }, [addNode, undo, redo, canUndo, canRedo, clearCircuit, saveToHistory, propagateValues]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    shortcuts: {
      gates: {
        INPUT: 'Ctrl+I',
        AND: 'Ctrl+A', 
        OR: 'Ctrl+O',
        NOT: 'Ctrl+N',
        OUTPUT: 'Ctrl+X',
      },
      history: {
        UNDO: 'Ctrl+Z',
        REDO: 'Ctrl+Y',
        SAVE: 'Ctrl+S',
        CLEAR: 'Shift+Delete',
      },
      simulation: {
        RUN: 'Ctrl+R',
        STEP: 'Space',
        RESET: 'Ctrl+Shift+R',
      }
    }
  };
};

export default useKeyboardShortcuts;
