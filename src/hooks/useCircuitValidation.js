import { useCallback } from 'react';
import useCircuitStore from '../store/useCircuitStore';

const useCircuitValidation = () => {
  const { nodes, edges } = useCircuitStore();

  const validateCircuit = useCallback(() => {
    const errors = [];
    const warnings = [];

    // 1. Check for disconnected components
    const connectedNodes = new Set();
    edges.forEach(edge => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });

    // Find disconnected nodes
    const disconnectedNodes = nodes.filter(node => {
      // Input nodes don't need to be connected as targets
      if (node.data.label === 'INPUT') return false;
      // Output nodes don't need to be connected as sources
      if (node.data.label === 'OUTPUT') return false;
      // Check if node has any connections
      return !connectedNodes.has(node.id);
    });

    if (disconnectedNodes.length > 0) {
      warnings.push({
        type: 'disconnected',
        message: `${disconnectedNodes.length} gate(s) are not connected to the circuit`,
        nodes: disconnectedNodes.map(n => n.id)
      });
    }

    // 2. Check for gates with insufficient inputs
    const inputCounts = {};
    edges.forEach(edge => {
      if (!inputCounts[edge.target]) {
        inputCounts[edge.target] = 0;
      }
      inputCounts[edge.target]++;
    });

    nodes.forEach(node => {
      const requiredInputs = getRequiredInputs(node.data.label);
      const actualInputs = inputCounts[node.id] || 0;
      
      if (actualInputs < requiredInputs) {
        errors.push({
          type: 'insufficient_inputs',
          message: `${node.data.label} gate at position (${Math.round(node.position.x)}, ${Math.round(node.position.y)}) needs ${requiredInputs} input(s) but has ${actualInputs}`,
          nodeId: node.id
        });
      }
    });

    // 3. Check for gates with too many inputs
    nodes.forEach(node => {
      const maxInputs = getMaxInputs(node.data.label);
      const actualInputs = inputCounts[node.id] || 0;
      
      if (actualInputs > maxInputs) {
        warnings.push({
          type: 'too_many_inputs',
          message: `${node.data.label} gate has ${actualInputs} inputs but only ${maxInputs} are functional`,
          nodeId: node.id
        });
      }
    });

    // 4. Check for invalid connections
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (!sourceNode || !targetNode) {
        errors.push({
          type: 'invalid_connection',
          message: 'Connection references non-existent gate',
          edgeId: edge.id
        });
        return;
      }

      const sourceType = sourceNode.data.label;
      const targetType = targetNode.data.label;

      // Check for invalid connection types
      if (sourceType === 'OUTPUT') {
        errors.push({
          type: 'invalid_connection',
          message: 'Cannot connect FROM an OUTPUT gate',
          edgeId: edge.id,
          nodeId: sourceNode.id
        });
      }

      if (targetType === 'INPUT') {
        errors.push({
          type: 'invalid_connection',
          message: 'Cannot connect TO an INPUT gate',
          edgeId: edge.id,
          nodeId: targetNode.id
        });
      }

      if (sourceType === 'INPUT' && targetType === 'INPUT') {
        errors.push({
          type: 'invalid_connection',
          message: 'Cannot connect INPUT to INPUT',
          edgeId: edge.id
        });
      }

      if (sourceType === 'INPUT' && targetType === 'OUTPUT') {
        warnings.push({
          type: 'direct_connection',
          message: 'INPUT directly connected to OUTPUT - consider adding logic gates between',
          edgeId: edge.id
        });
      }
    });

    // 5. Check for floating gates (gates with no inputs or outputs)
    const floatingGates = nodes.filter(node => {
      if (node.data.label === 'INPUT') return false;
      
      const hasInputs = edges.some(e => e.target === node.id);
      const hasOutputs = edges.some(e => e.source === node.id);
      
      return !hasInputs && !hasOutputs;
    });

    if (floatingGates.length > 0) {
      warnings.push({
        type: 'floating_gate',
        message: `${floatingGates.length} gate(s) are floating (no inputs or outputs)`,
        nodes: floatingGates.map(n => n.id)
      });
    }

    // 6. Check for potential infinite loops
    const hasLoop = detectLoop(nodes, edges);
    if (hasLoop) {
      errors.push({
        type: 'infinite_loop',
        message: 'Circuit contains potential infinite loop - this may cause simulation issues',
        severity: 'high'
      });
    }

    // 7. Check for missing outputs
    const hasOutput = nodes.some(node => node.data.label === 'OUTPUT');
    const hasInput = nodes.some(node => node.data.label === 'INPUT');
    
    if (hasInput && !hasOutput) {
      warnings.push({
        type: 'no_output',
        message: 'Circuit has inputs but no output gate - signal has nowhere to go'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        errors: errors.length,
        warnings: warnings.length
      }
    };
  }, [nodes, edges]);

  return {
    validateCircuit,
    validationErrors: validateCircuit()
  };
};

// Helper functions
function getRequiredInputs(gateType) {
  switch (gateType) {
    case 'INPUT':
      return 0;
    case 'OUTPUT':
      return 1;
    case 'NOT':
      return 1;
    case 'AND':
    case 'OR':
    case 'XOR':
      return 2;
    default:
      return 1;
  }
}

function getMaxInputs(gateType) {
  switch (gateType) {
    case 'INPUT':
      return 0;
    case 'OUTPUT':
      return Infinity;
    case 'NOT':
      return 1;
    case 'AND':
    case 'OR':
    case 'XOR':
      return 2;
    default:
      return 1;
  }
}

function detectLoop(nodes, edges) {
  // Simple cycle detection using DFS
  const visited = new Set();
  const recursionStack = new Set();

  const hasCycle = (nodeId) => {
    if (recursionStack.has(nodeId)) {
      return true;
    }
    if (visited.has(nodeId)) {
      return false;
    }

    visited.add(nodeId);
    recursionStack.add(nodeId);

    const outgoingEdges = edges.filter(e => e.source === nodeId);
    for (const edge of outgoingEdges) {
      if (hasCycle(edge.target)) {
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  };

  // Check each node for cycles
  for (const node of nodes) {
    if (hasCycle(node.id)) {
      return true;
    }
  }

  return false;
}

export default useCircuitValidation;
