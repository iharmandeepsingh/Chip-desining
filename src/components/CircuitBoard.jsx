import React, { useCallback, useEffect } from "react";
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import GateNode from "./GateNode";
import AnimatedEdge from "./AnimatedEdge";
import useCircuitStore from "../store/useCircuitStore";
import { useTheme } from "../contexts/ThemeContext";
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts";
import CircuitValidation from "./CircuitValidation";
import CircuitExport from "./CircuitExport";
import AICircuitGenerator from "./AICircuitGenerator";
import CollaborationPanel from "./CollaborationPanel";
import useTimingSimulation from "../hooks/useTimingSimulation";
import useCollaboration from "../hooks/useCollaboration";

const nodeTypes = {
  gate: GateNode,
};

const edgeTypes = {
  animated: AnimatedEdge,
};

const CircuitBoard = () => {
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
      if (sourceType === "OUTPUT") {
        alert(" Cannot connect FROM OUTPUT");
        return;
      }

      if (targetType === "INPUT") {
        alert(" Cannot connect TO INPUT");
        return;
      }

      if (sourceType === "INPUT" && targetType === "INPUT") {
        alert(" INPUT  INPUT not allowed");
        return;
      }

      if (sourceType === "INPUT" && targetType === "OUTPUT") {
        alert(" Connect INPUT  GATE first");
        return;
      }

      // Valid connection
      addStoreEdge(params);
    },
    [nodes, addStoreEdge]
  );

  // Add new gate/node
  const addGate = (type) => {
    const newNode = {
      id: Date.now().toString(), // unique id
      type: "gate",
      position: {
        x: Math.random() * 500,
        y: Math.random() * 400,
      },
      data: {
        label: type,
        value: type === "INPUT" ? false : false,
      },
    };

    addNode(newNode);
  };

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
    <div style={{ height: "100vh", width: "100%" }}>
      
      {/* Toolbar */}
      <div
        style={{
          padding: 10,
          display: "flex",
          gap: "10px",
          borderBottom: `2px solid ${currentTheme.border}`,
          backgroundColor: currentTheme.surface,
        }}
      >
        <button 
          onClick={() => addGate("INPUT")}
          style={{
            padding: "8px 16px",
            backgroundColor: currentTheme.gateColors.INPUT,
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = `0 4px 8px ${currentTheme.shadow}`;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = 'none';
          }}
        >
          INPUT
        </button>
        <button 
          onClick={() => addGate("AND")}
          style={{
            padding: "8px 16px",
            backgroundColor: currentTheme.gateColors.AND,
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = `0 4px 8px ${currentTheme.shadow}`;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = 'none';
          }}
        >
          AND
        </button>
        <button 
          onClick={() => addGate("OR")}
          style={{
            padding: "8px 16px",
            backgroundColor: currentTheme.gateColors.OR,
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = `0 4px 8px ${currentTheme.shadow}`;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = 'none';
          }}
          title="OR Gate (Ctrl+O)"
        >
          OR
        </button>
        <button 
          onClick={() => addGate("NOT")}
          style={{
            padding: "8px 16px",
            backgroundColor: currentTheme.gateColors.NOT,
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = `0 4px 8px ${currentTheme.shadow}`;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = 'none';
          }}
          title="NOT Gate (Ctrl+N)"
        >
          NOT
        </button>
        <button 
          onClick={() => addGate("OUTPUT")}
          style={{
            padding: "8px 16px",
            backgroundColor: currentTheme.gateColors.OUTPUT,
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = `0 4px 8px ${currentTheme.shadow}`;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = 'none';
          }}
          title="OUTPUT Gate (Ctrl+X)"
        >
          OUTPUT
        </button>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '80px',
          backgroundColor: currentTheme.surface,
          border: `2px solid ${currentTheme.border}`,
          borderRadius: '8px',
          padding: '10px',
          fontSize: '12px',
          color: currentTheme.text.primary,
          boxShadow: `0 4px 12px ${currentTheme.shadow}`,
          zIndex: 1000,
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Keyboard Shortcuts</div>
        <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
          <div><strong>Gates:</strong></div>
          <div>INPUT: Ctrl+I</div>
          <div>AND: Ctrl+A</div>
          <div>OR: Ctrl+O</div>
          <div>NOT: Ctrl+N</div>
          <div>OUTPUT: Ctrl+X</div>
          <div style={{ marginTop: '8px' }}><strong>History:</strong></div>
          <div>Undo: Ctrl+Z</div>
          <div>Redo: Ctrl+Y</div>
          <div>Save: Ctrl+S</div>
          <div style={{ marginTop: '8px' }}><strong>Simulation:</strong></div>
          <div>Run: Ctrl+R</div>
          <div>Step: Space</div>
          <div>Reset: Ctrl+Shift+R</div>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ height: "85%" }}>
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
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>

      {/* Simulation Controls */}
      <div
        style={{
          padding: "10px",
          backgroundColor: currentTheme.surface,
          borderTop: `2px solid ${currentTheme.border}`,
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <span style={{ fontWeight: "bold", color: currentTheme.text.primary }}>Simulation:</span>
        
        <button
          onClick={() => {
            const { propagateValues } = useCircuitStore.getState();
            propagateValues();
          }}
          style={{
            padding: "6px 12px",
            backgroundColor: currentTheme.primary,
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = `0 2px 6px ${currentTheme.shadow}`;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = 'none';
          }}
        >
          Run
        </button>

        <button
          onClick={() => {
            const { nodes, stepPropagation } = useCircuitStore.getState();
            const nodeOrder = topologicalSort(nodes, []);
            nodeOrder.forEach((nodeId, index) => {
              setTimeout(() => stepPropagation(nodeId), index * 600);
            });
          }}
          style={{
            padding: "6px 12px",
            backgroundColor: currentTheme.secondary,
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = `0 2px 6px ${currentTheme.shadow}`;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = 'none';
          }}
        >
          Step Mode
        </button>

        <button
          onClick={() => {
            const { setNodes, nodes } = useCircuitStore.getState();
            nodes.forEach((node) => {
              if (node.data.label === 'INPUT') {
                useCircuitStore.getState().updateNode(node.id, { 
                  data: { ...node.data, value: false }
                });
              }
            });
          }}
          style={{
            padding: "6px 12px",
            backgroundColor: currentTheme.accent,
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = `0 2px 6px ${currentTheme.shadow}`;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = 'none';
          }}
        >
          Reset
        </button>
      </div>

      <CircuitValidation />
      <CircuitExport />
      <AICircuitGenerator />
      <CollaborationPanel />
    </div>
  );
};

// Helper function for topological sort to ensure proper propagation order
function topologicalSort(nodes, edges) {
  const graph = {};
  const inDegree = {};
  const result = [];
  
  // Initialize graph
  nodes.forEach(node => {
    graph[node.id] = [];
    inDegree[node.id] = 0;
  });
  
  // Build graph and calculate in-degrees
  edges.forEach(edge => {
    if (graph[edge.source]) {
      graph[edge.source].push(edge.target);
      inDegree[edge.target] = (inDegree[edge.target] || 0) + 1;
    }
  });
  
  // Queue nodes with no dependencies
  const queue = Object.keys(inDegree).filter(id => inDegree[id] === 0);
  
  while (queue.length > 0) {
    const current = queue.shift();
    result.push(current);
    
    graph[current].forEach(neighbor => {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    });
  }
  
  return result;
}

export default CircuitBoard;