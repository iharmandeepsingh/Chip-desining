import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import useCircuitStore from '../../store/useCircuitStore';

const HierarchicalDesignManager = () => {
  const { currentTheme } = useTheme();
  const { nodes, edges, addNode, addEdge, setNodes, setEdges } = useCircuitStore();
  
  const [hierarchy, setHierarchy] = useState({
    layers: [
      {
        id: 'layer_0',
        name: 'Logic Layer',
        type: 'logic',
        visible: true,
        locked: false,
        color: '#3b82f6',
        nodes: [],
        edges: [],
        zIndex: 0
      },
      {
        id: 'layer_1',
        name: 'Timing Layer',
        type: 'timing',
        visible: true,
        locked: false,
        color: '#10b981',
        nodes: [],
        edges: [],
        zIndex: 1
      },
      {
        id: 'layer_2',
        name: 'Physical Layer',
        type: 'physical',
        visible: false,
        locked: true,
        color: '#f59e0b',
        nodes: [],
        edges: [],
        zIndex: 2
      }
    ],
    modules: [],
    currentModule: 'root',
    moduleHierarchy: {}
  });

  const [selectedLayer, setSelectedLayer] = useState('layer_0');
  const [showModuleExplorer, setShowModuleExplorer] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  // Module templates for hierarchical design
  const moduleTemplates = [
    {
      id: 'adder_module',
      name: 'Adder Module',
      description: '4-bit adder with carry',
      inputs: ['A[3:0]', 'B[3:0]', 'CIN'],
      outputs: ['SUM[3:0]', 'COUT'],
      subModules: ['full_adder'],
      nodes: 12,
      icon: 'ADD'
    },
    {
      id: 'multiplier_module',
      name: 'Multiplier Module',
      description: '4x4 bit multiplier',
      inputs: ['A[3:0]', 'B[3:0]'],
      outputs: ['PRODUCT[7:0]'],
      subModules: ['full_adder', 'and_gate'],
      nodes: 20,
      icon: 'MUL'
    },
    {
      id: 'counter_module',
      name: 'Counter Module',
      description: '8-bit synchronous counter',
      inputs: ['CLK', 'RESET', 'ENABLE'],
      outputs: ['COUNT[7:0]', 'CARRY'],
      subModules: ['jk_flip_flop'],
      nodes: 8,
      icon: 'CNT'
    },
    {
      id: 'memory_module',
      name: 'Memory Module',
      description: '256x8 RAM block',
      inputs: ['ADDR[7:0]', 'DATA_IN[7:0]', 'WE', 'CLK'],
      outputs: ['DATA_OUT[7:0]'],
      subModules: ['ram_cell'],
      nodes: 16,
      icon: 'MEM'
    }
  ];

  // Create new module
  const createModule = (template, name) => {
    const newModule = {
      id: `module_${Date.now()}`,
      name: name || template.name,
      type: template.type || 'custom',
      description: template.description,
      inputs: [...template.inputs],
      outputs: [...template.outputs],
      subModules: [...template.subModules],
      nodes: [],
      edges: [],
      parameters: {},
      instances: [],
      createdAt: new Date().toISOString(),
      version: '1.0.0'
    };

    setHierarchy(prev => ({
      ...prev,
      modules: [...prev.modules, newModule]
    }));

    return newModule;
  };

  // Create module instance
  const createModuleInstance = (moduleId, position) => {
    const module = hierarchy.modules.find(m => m.id === moduleId);
    if (!module) return null;

    const instance = {
      id: `instance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      moduleId: moduleId,
      name: `${module.name}_${hierarchy.modules.length + 1}`,
      position: position || { x: 400, y: 200 },
      parameters: { ...module.parameters },
      ports: {
        inputs: module.inputs.map(input => ({
          name: input,
          type: 'input',
          connected: false,
          position: { x: 0, y: 0 }
        })),
        outputs: module.outputs.map(output => ({
          name: output,
          type: 'output',
          connected: false,
          position: { x: 0, y: 0 }
        }))
      }
    };

    // Add instance node to current layer
    const instanceNode = {
      id: instance.id,
      type: 'module_instance',
      position: instance.position,
      data: {
        label: instance.name,
        moduleType: module.type,
        icon: module.icon || 'MOD',
        instance: instance,
        module: module
      }
    };

    addNode(instanceNode);
    
    // Update module instances
    setHierarchy(prev => ({
      ...prev,
      modules: prev.modules.map(m => 
        m.id === moduleId 
          ? { ...m, instances: [...m.instances, instance] }
          : m
      )
    }));

    return instance;
  };

  // Add node to specific layer
  const addNodeToLayer = (node, layerId) => {
    setHierarchy(prev => ({
      ...prev,
      layers: prev.layers.map(layer => 
        layer.id === layerId
          ? { ...layer, nodes: [...layer.nodes, node.id] }
          : layer
      )
    }));
  };

  // Switch between layers
  const switchLayer = (layerId) => {
    setSelectedLayer(layerId);
    const layer = hierarchy.layers.find(l => l.id === layerId);
    
    // Filter nodes and edges for current layer
    const layerNodes = nodes.filter(node => 
      layer.nodes.includes(node.id) || 
      node.data.layer === layerId
    );
    const layerEdges = edges.filter(edge => 
      layer.edges.includes(edge.id) || 
      edge.data.layer === layerId
    );
    
    // Update canvas to show only layer nodes/edges
    setNodes(layerNodes);
    setEdges(layerEdges);
  };

  // Toggle layer visibility
  const toggleLayerVisibility = (layerId) => {
    setHierarchy(prev => ({
      ...prev,
      layers: prev.layers.map(layer => 
        layer.id === layerId
          ? { ...layer, visible: !layer.visible }
          : layer
      )
    }));
  };

  // Toggle layer lock
  const toggleLayerLock = (layerId) => {
    setHierarchy(prev => ({
      ...prev,
      layers: prev.layers.map(layer => 
        layer.id === layerId
          ? { ...layer, locked: !layer.locked }
          : layer
      )
    }));
  };

  // Reorder layers
  const reorderLayers = (fromIndex, toIndex) => {
    setHierarchy(prev => {
      const newLayers = [...prev.layers];
      const [movedLayer] = newLayers.splice(fromIndex, 1);
      newLayers.splice(toIndex, 0, movedLayer);
      
      return {
        ...prev,
        layers: newLayers.map((layer, index) => ({
          ...layer,
          zIndex: index
        }))
      };
    });
  };

  // Export module
  const exportModule = (moduleId) => {
    const module = hierarchy.modules.find(m => m.id === moduleId);
    if (!module) return null;

    const exportData = {
      module: {
        ...module,
        nodes: nodes.filter(n => n.data.moduleId === moduleId),
        edges: edges.filter(e => e.data.moduleId === moduleId)
      },
      version: '1.0',
      timestamp: new Date().toISOString(),
      exportedBy: 'Chip Designer'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${module.name}.json`;
    a.click();
    URL.revokeObjectURL(url);

    return exportData;
  };

  // Import module
  const importModule = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const importedModule = {
          ...data.module,
          id: `imported_${Date.now()}`,
          importedAt: new Date().toISOString()
        };

        setHierarchy(prev => ({
          ...prev,
          modules: [...prev.modules, importedModule]
        }));
      } catch (error) {
        console.error('Failed to import module:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      style={{
        height: '100%',
        backgroundColor: currentTheme.background,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: `1px solid ${currentTheme.border}`,
        }}
      >
        <div
          style={{
            fontSize: '16px',
            fontWeight: '600',
            color: currentTheme.text.primary,
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '20px' }}>Layer</span>
          Hierarchical Design
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => setShowModuleExplorer(!showModuleExplorer)}
            style={{
              padding: '6px 12px',
              backgroundColor: showModuleExplorer ? currentTheme.primary : 'transparent',
              color: showModuleExplorer ? 'white' : currentTheme.text.secondary,
              border: `1px solid ${showModuleExplorer ? currentTheme.primary : currentTheme.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '14px' }}>M</span>
            <span>Modules</span>
          </button>

          <button
            style={{
              padding: '6px 12px',
              backgroundColor: 'transparent',
              color: currentTheme.text.secondary,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '14px' }}>H</span>
            <span>Hierarchy</span>
          </button>
        </div>
      </div>

      {/* Layer Controls */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          padding: '16px',
        }}
      >
        <div
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: currentTheme.text.primary,
            marginBottom: '12px',
          }}
        >
          Circuit Layers
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginBottom: '16px',
          }}
        >
          {hierarchy.layers.map((layer, index) => (
            <div
              key={layer.id}
              style={{
                backgroundColor: currentTheme.surface,
                border: selectedLayer === layer.id ? `2px solid ${currentTheme.primary}` : `1px solid ${currentTheme.border}`,
                borderRadius: '8px',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onClick={() => switchLayer(layer.id)}
            >
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  backgroundColor: layer.color,
                  borderRadius: '4px',
                  opacity: layer.visible ? 1 : 0.3,
                }}
              />
              
              <div
                style={{
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: currentTheme.text.primary,
                    marginBottom: '2px',
                  }}
                >
                  {layer.name}
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    color: currentTheme.text.secondary,
                  }}
                >
                  {layer.nodes.length} nodes, {layer.edges.length} edges
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '4px',
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLayerVisibility(layer.id);
                  }}
                  style={{
                    width: '24px',
                    height: '24px',
                    backgroundColor: layer.visible ? currentTheme.success : currentTheme.text.secondary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {layer.visible ? 'V' : 'H'}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLayerLock(layer.id);
                  }}
                  style={{
                    width: '24px',
                    height: '24px',
                    backgroundColor: layer.locked ? currentTheme.error : currentTheme.text.secondary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {layer.locked ? 'L' : 'U'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Module Explorer */}
        {showModuleExplorer && (
          <div
            style={{
              backgroundColor: `${currentTheme.background}50`,
              borderRadius: '8px',
              padding: '16px',
              border: `1px solid ${currentTheme.border}`,
            }}
          >
            <div
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: currentTheme.text.primary,
                marginBottom: '12px',
              }}
            >
              Module Templates
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '12px',
              }}
            >
              {moduleTemplates.map((template) => (
                <div
                  key={template.id}
                  style={{
                    backgroundColor: currentTheme.surface,
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: '8px',
                    padding: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => createModuleInstance(template.id)}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px',
                    }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: currentTheme.primary,
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: '600',
                        color: 'white',
                      }}
                    >
                      {template.icon}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: currentTheme.text.primary,
                      }}
                    >
                      {template.name}
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: '10px',
                      color: currentTheme.text.secondary,
                      marginBottom: '8px',
                    }}
                  >
                    {template.description}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      fontSize: '9px',
                      color: currentTheme.text.secondary,
                    }}
                  >
                    <span>{template.inputs.length} inputs</span>
                    <span>{template.outputs.length} outputs</span>
                    <span>{template.nodes} nodes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Modules */}
        {hierarchy.modules.length > 0 && (
          <div
            style={{
              marginTop: '16px',
            }}
          >
            <div
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: currentTheme.text.primary,
                marginBottom: '12px',
              }}
            >
              Custom Modules
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '8px',
              }}
            >
              {hierarchy.modules.map((module) => (
                <div
                  key={module.id}
                  style={{
                    backgroundColor: currentTheme.surface,
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: '8px',
                    padding: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: currentTheme.text.primary,
                      }}
                    >
                      {module.name}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: '4px',
                      }}
                    >
                      <button
                        onClick={() => createModuleInstance(module.id)}
                        style={{
                          width: '20px',
                          height: '20px',
                          backgroundColor: currentTheme.primary,
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '10px',
                        }}
                      >
                        +
                      </button>
                      <button
                        onClick={() => exportModule(module.id)}
                        style={{
                          width: '20px',
                          height: '20px',
                          backgroundColor: currentTheme.secondary,
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '10px',
                        }}
                      >
                        E
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: '10px',
                      color: currentTheme.text.secondary,
                    }}
                  >
                    {module.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HierarchicalDesignManager;
