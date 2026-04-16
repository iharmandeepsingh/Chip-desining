import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import GateNode from '../GateNode';
import AnimatedEdge from '../AnimatedEdge';
import useCircuitStore from '../../store/useCircuitStore';
import { useTheme } from '../../contexts/ThemeContext';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';

const nodeTypes = {
  gate: GateNode,
};

const edgeTypes = {
  animated: AnimatedEdge,
};

const Canvas = () => {
  const { currentTheme } = useTheme();
  const {
    nodes,
    edges,
    addNode,
    addEdge: addStoreEdge,
    setNodes,
    setEdges,
    toggleInput,
    propagateValues,
  } = useCircuitStore();

  // Activate keyboard shortcuts
  useKeyboardShortcuts();

  // ReactFlow state for UI updates
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(edges);

  // Sync Zustand state with ReactFlow state
  useEffect(() => {
    setFlowNodes(nodes);
  }, [nodes, setFlowNodes]);

  useEffect(() => {
    setFlowEdges(edges);
  }, [edges, setFlowEdges]);

  // Propagate values when edges change
  useEffect(() => {
    if (edges.length > 0) {
      propagateValues();
    }
  }, [edges, propagateValues]);

  // Smart connection (prevents wrong wiring)
  const onConnect = useCallback(
    (params) => {
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);

      if (!sourceNode || !targetNode) return;

      const sourceType = sourceNode.data.label;
      const targetType = targetNode.data.label;

      // Block invalid connections
      if (sourceType === 'OUTPUT') {
        return; // Cannot connect FROM OUTPUT
      }

      if (targetType === 'INPUT') {
        return; // Cannot connect TO INPUT
      }

      if (sourceType === 'INPUT' && targetType === 'INPUT') {
        return; // INPUT to INPUT not allowed
      }

      if (sourceType === 'INPUT' && targetType === 'OUTPUT') {
        return; // Connect INPUT to GATE first
      }

      // Valid connection
      addStoreEdge(params);
    },
    [nodes, addStoreEdge]
  );

  // Handle INPUT toggle
  const handleValueChange = (id) => {
    toggleInput(id);
  };

  // Handle nodes change (drag, delete, etc.)
  const handleNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      setNodes(flowNodes);
    },
    [onNodesChange, setNodes, flowNodes]
  );

  // Handle edges change (delete, etc.)
  const handleEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
      setEdges(flowEdges);
    },
    [onEdgesChange, setEdges, flowEdges]
  );

  // Inject handlers into each node
  const nodesWithHandlers = flowNodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      onChange: handleValueChange,
    },
  }));

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      <ReactFlow
        nodes={nodesWithHandlers}
        edges={flowEdges.map((edge) => ({
          ...edge,
          type: 'animated',
          data: { source: edge.source },
        }))}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        style={{
          backgroundColor: currentTheme.canvas,
        }}
        attributionPosition="bottom-left"
      >
        {/* Custom Controls */}
        <Controls
          style={{
            backgroundColor: currentTheme.surface,
            border: `1px solid ${currentTheme.border}`,
            borderRadius: '8px',
            boxShadow: `0 2px 8px ${currentTheme.shadow}`,
          }}
          showZoom={true}
          showFitView={true}
          showInteractive={false}
        />

        {/* Custom MiniMap */}
        <MiniMap
          style={{
            backgroundColor: currentTheme.surface,
            border: `1px solid ${currentTheme.border}`,
            borderRadius: '8px',
            boxShadow: `0 2px 8px ${currentTheme.shadow}`,
          }}
          nodeColor={(node) => {
            const gateType = node.data?.label;
            return currentTheme.gateColors[gateType] || '#666';
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />

        {/* Custom Background with Grid */}
        <Background
          color={currentTheme.canvas}
          gap={20}
          size={1}
          style={{
            backgroundColor: currentTheme.canvas,
          }}
        />
      </ReactFlow>

      {/* Canvas Overlay Info */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          backgroundColor: currentTheme.surface,
          border: `1px solid ${currentTheme.border}`,
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '11px',
          color: currentTheme.text.secondary,
          boxShadow: `0 2px 8px ${currentTheme.shadow}`,
          zIndex: 10,
        }}
      >
        <div style={{ fontWeight: '600', color: currentTheme.text.primary, marginBottom: '4px' }}>
          Canvas Info
        </div>
        <div style={{ lineHeight: '1.4' }}>
          <div>Nodes: {nodes.length}</div>
          <div>Edges: {edges.length}</div>
          <div>Zoom: 100%</div>
        </div>
      </div>
    </div>
  );
};

export default Canvas;
