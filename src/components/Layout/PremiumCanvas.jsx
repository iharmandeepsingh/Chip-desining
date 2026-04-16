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

const PremiumCanvas = () => {
  const { currentTheme } = useTheme();
  const {
    nodes,
    edges,
    addNode,
    addEdge: addEdgeToStore,
    clearCircuit,
  } = useCircuitStore();

  const [localNodes, setLocalNodes, onNodesChange] = useNodesState(nodes);
  const [localEdges, setLocalEdges, onEdgesChange] = useEdgesState(edges);

  // Sync local state with global store
  useEffect(() => {
    setLocalNodes(nodes);
  }, [nodes, setLocalNodes]);

  useEffect(() => {
    setLocalEdges(edges);
  }, [edges, setLocalEdges]);

  const onConnect = useCallback(
    (params) => addEdgeToStore(params),
    [addEdgeToStore]
  );

  const onNodeClick = useCallback((event, node) => {
    if (node.data.label === 'INPUT') {
      const updatedNodes = nodes.map((n) =>
        n.id === node.id
          ? { ...n, data: { ...n.data, value: !n.data.value } }
          : n
      );
      addNode(updatedNodes);
    }
  }, [nodes, addNode]);

  // Custom keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: currentTheme.canvas,
        backgroundImage: `
          linear-gradient(${currentTheme.grid} 1px, transparent 1px),
          linear-gradient(90deg, ${currentTheme.grid} 1px, transparent 1px),
          linear-gradient(${currentTheme.gridMajor} 1px, transparent 1px),
          linear-gradient(90deg, ${currentTheme.gridMajor} 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px, 20px 20px, 100px 100px, 100px 100px',
        backgroundPosition: '0 0, 0 0, 0 0, 0 0',
        backgroundBlend: 'overlay',
      }}
    >
      <ReactFlow
        nodes={localNodes}
        edges={localEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        style={{
          backgroundColor: 'transparent',
        }}
        defaultViewport={{
          x: 0,
          y: 0,
          zoom: 1,
        }}
        minZoom={0.1}
        maxZoom={4}
        snapToGrid={true}
        snapGrid={[20, 20]}
        connectionLineStyle={{
          stroke: currentTheme.primaryHover,
          strokeWidth: 3,
          strokeDasharray: '5,5',
          animation: 'dash 0.5s linear infinite',
        }}
        connectionLineType="smoothstep"
        defaultEdgeOptions={{
          type: 'animated',
          animated: true,
          style: {
            stroke: currentTheme.primary,
            strokeWidth: 3,
            filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.2))',
          },
          markerEnd: {
            type: 'arrowclosed',
            color: currentTheme.primary,
            strokeWidth: 2,
          },
        }}
        deleteKeyCode={['Delete', 'Backspace']}
        multiSelectionKeyCode="Control"
        selectionKeyCode="Shift"
        panOnDrag={false}
        selectNodesOnDrag={false}
      >
        <Background
          color={currentTheme.grid}
          size={20}
          variant="dots"
          style={{
            opacity: 0.5,
          }}
        />
        
        <MiniMap
          nodeColor={(node) => {
            if (node.data.value) return currentTheme.success;
            return currentTheme.gateColors[node.data.label] || currentTheme.primary;
          }}
          nodeStrokeWidth={2}
          nodeStrokeColor={currentTheme.border}
          maskColor={currentTheme.canvas}
          style={{
            backgroundColor: currentTheme.surface,
            border: `1px solid ${currentTheme.border}`,
            borderRadius: '12px',
            boxShadow: `0 8px 32px ${currentTheme.shadow.lg}`,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
          position="bottom-left"
          zoomable
          pannable
        />
        
        <Controls
          style={{
            backgroundColor: currentTheme.surface,
            border: `1px solid ${currentTheme.border}`,
            borderRadius: '12px',
            boxShadow: `0 8px 32px ${currentTheme.shadow.lg}`,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
          showInteractive={false}
          position="bottom-right"
        />
      </ReactFlow>

      {/* Canvas Info Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          backgroundColor: currentTheme.surface,
          border: `1px solid ${currentTheme.border}`,
          borderRadius: '12px',
          padding: '16px 20px',
          boxShadow: `0 4px 16px ${currentTheme.shadow.md}`,
          fontSize: '12px',
          color: currentTheme.text.secondary,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px) scale(1.02)';
          e.target.style.boxShadow = `0 8px 32px ${currentTheme.shadow.lg}`;
          e.target.style.borderColor = currentTheme.borderLight;
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0) scale(1)';
          e.target.style.boxShadow = `0 4px 16px ${currentTheme.shadow.md}`;
          e.target.style.borderColor = currentTheme.border;
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: '700',
            color: 'white',
            boxShadow: `0 2px 8px ${currentTheme.primary}40`,
          }}
        >
          C
        </div>
        <div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: currentTheme.text.primary,
              marginBottom: '2px',
            }}
          >
            Circuit Canvas
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '11px',
            }}
          >
            <span style={{ 
              color: currentTheme.primary,
              fontWeight: '600',
            }}>
              {nodes.length}
            </span>
            <span style={{ opacity: 0.6 }}>nodes</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span style={{ 
              color: currentTheme.secondary,
              fontWeight: '600',
            }}>
              {edges.length}
            </span>
            <span style={{ opacity: 0.6 }}>connections</span>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          backgroundColor: currentTheme.surface,
          border: `1px solid ${currentTheme.border}`,
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: `0 4px 16px ${currentTheme.shadow.md}`,
          fontSize: '11px',
          color: currentTheme.text.secondary,
          opacity: 0.9,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          minWidth: '200px',
        }}
        onMouseEnter={(e) => {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(-2px) scale(1.02)';
          e.target.style.boxShadow = `0 8px 32px ${currentTheme.shadow.lg}`;
          e.target.style.borderColor = currentTheme.borderLight;
        }}
        onMouseLeave={(e) => {
          e.target.style.opacity = '0.9';
          e.target.style.transform = 'translateY(0) scale(1)';
          e.target.style.boxShadow = `0 4px 16px ${currentTheme.shadow.md}`;
          e.target.style.borderColor = currentTheme.border;
        }}
      >
        <div style={{ 
          marginBottom: '8px', 
          fontWeight: '700',
          fontSize: '12px',
          color: currentTheme.text.primary,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <span style={{ fontSize: '14px' }}>keyboard</span>
          <span>Shortcuts</span>
        </div>
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{ 
              color: currentTheme.primary,
              fontWeight: '600',
              fontSize: '10px',
              backgroundColor: `${currentTheme.primary}15`,
              padding: '2px 6px',
              borderRadius: '4px',
            }}>
              Click
            </span>
            <span>INPUT nodes to toggle</span>
          </div>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{ 
              color: currentTheme.primary,
              fontWeight: '600',
              fontSize: '10px',
              backgroundColor: `${currentTheme.primary}15`,
              padding: '2px 6px',
              borderRadius: '4px',
            }}>
              Drag
            </span>
            <span>to move</span>
            <span style={{ opacity: 0.5 }}>·</span>
            <span style={{ 
              color: currentTheme.secondary,
              fontWeight: '600',
              fontSize: '10px',
              backgroundColor: `${currentTheme.secondary}15`,
              padding: '2px 6px',
              borderRadius: '4px',
            }}>
              Shift+Drag
            </span>
            <span>to connect</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumCanvas;
