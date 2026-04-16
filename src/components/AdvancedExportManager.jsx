import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import useCircuitStore from '../../store/useCircuitStore';

const AdvancedExportManager = () => {
  const { currentTheme } = useTheme();
  const { nodes, edges } = useCircuitStore();
  
  const [exportFormat, setExportFormat] = useState('gerber');
  const [exportSettings, setExportSettings] = useState({
    precision: 6,
    units: 'mm',
    layers: ['copper', 'soldermask', 'silkscreen'],
    includeDrill: true,
    includeOutline: true,
    boardThickness: 1.6,
    copperThickness: 0.035,
    minTraceWidth: 0.1,
    minViaSize: 0.2,
    minClearance: 0.1
  });

  const exportFormats = [
    {
      id: 'gerber',
      name: 'Gerber Files',
      description: 'Standard PCB manufacturing format',
      icon: 'PCB',
      extensions: ['.gbr', '.drl'],
      layers: ['copper', 'soldermask', 'silkscreen', 'drill']
    },
    {
      id: 'pcb',
      name: 'PCB Layout',
      description: 'Complete PCB layout with components',
      icon: 'PCB',
      extensions: ['.pcb', '.json'],
      layers: ['components', 'traces', 'vias', 'pads']
    },
    {
      id: 'spice',
      name: 'SPICE Netlist',
      description: 'Circuit simulation format',
      icon: 'SPICE',
      extensions: ['.cir', '.net'],
      layers: ['netlist']
    },
    {
      id: 'json',
      name: 'JSON Netlist',
      description: 'Structured circuit data format',
      icon: 'JSON',
      extensions: ['.json'],
      layers: ['netlist', 'components']
    },
    {
      id: 'svg',
      name: 'SVG Schematic',
      description: 'Vector graphics schematic',
      icon: 'SVG',
      extensions: ['.svg'],
      layers: ['schematic']
    },
    {
      id: 'pdf',
      name: 'PDF Documentation',
      description: 'Printable circuit documentation',
      icon: 'PDF',
      extensions: ['.pdf'],
      layers: ['documentation']
    }
  ];

  // Generate Gerber files
  const generateGerber = () => {
    const gerberFiles = [];
    
    // Copper layer
    const copperGerber = generateCopperGerber();
    gerberFiles.push({
      name: 'copper_top.gbr',
      content: copperGerber,
      layer: 'copper'
    });
    
    // Solder mask layer
    const solderMaskGerber = generateSolderMaskGerber();
    gerberFiles.push({
      name: 'soldermask_top.gbr',
      content: solderMaskGerber,
      layer: 'soldermask'
    });
    
    // Silkscreen layer
    const silkscreenGerber = generateSilkscreenGerber();
    gerberFiles.push({
      name: 'silkscreen_top.gbr',
      content: silkscreenGerber,
      layer: 'silkscreen'
    });
    
    // Drill file
    if (exportSettings.includeDrill) {
      const drillFile = generateDrillFile();
      gerberFiles.push({
        name: 'drill.drl',
        content: drillFile,
        layer: 'drill'
      });
    }
    
    // Board outline
    if (exportSettings.includeOutline) {
      const outlineGerber = generateOutlineGerber();
      gerberFiles.push({
        name: 'outline.gbr',
        content: outlineGerber,
        layer: 'outline'
      });
    }
    
    return gerberFiles;
  };

  const generateCopperGerber = () => {
    const header = `G04 #@! TF.GenerationSoftware,Chip Designer v1.0*
G04 #@! TF.CreationDate,${new Date().toISOString()}*
G04 #@! TF.ProjectId,Circuit_Export*
G04 #@! TF.FileFunction,Copper,L1,Top*
G04 #@! TF.FilePolarity,Positive*
%FSLAX23*%
%MOMM*%
G01*
G70*
G04 #@! TF.SameCoordinates*
G04 #@! TF.Inch,0.0254*
G04 #@! TF.AperFunction,Profile*
G04 #@! TF.FileFunction,Profile*
`;
    
    let copperContent = header;
    
    // Convert nodes to copper traces
    nodes.forEach((node, index) => {
      const x = (node.position.x * 0.0254).toFixed(exportSettings.precision);
      const y = (node.position.y * 0.0254).toFixed(exportSettings.precision);
      
      // Add pad for component
      copperContent += `X${x}Y${y}D03*\n`;
      
      // Add aperture definition
      if (index === 0) {
        copperContent += `%ADD10C,${(exportSettings.minTraceWidth * 0.0254).toFixed(exportSettings.precision)}*%\n`;
        copperContent += `D10*\n`;
      }
    });
    
    // Convert edges to traces
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        const x1 = (sourceNode.position.x * 0.0254).toFixed(exportSettings.precision);
        const y1 = (sourceNode.position.y * 0.0254).toFixed(exportSettings.precision);
        const x2 = (targetNode.position.x * 0.0254).toFixed(exportSettings.precision);
        const y2 = (targetNode.position.y * 0.0254).toFixed(exportSettings.precision);
        
        copperContent += `X${x1}Y${y1}D02*\n`;
        copperContent += `X${x2}Y${y2}D01*\n`;
      }
    });
    
    copperContent += `M02*\n`;
    
    return copperContent;
  };

  const generateSolderMaskGerber = () => {
    const header = `G04 #@! TF.GenerationSoftware,Chip Designer v1.0*
G04 #@! TF.CreationDate,${new Date().toISOString()}*
G04 #@! TF.ProjectId,Circuit_Export*
G04 #@! TF.FileFunction,Soldermask,Top*
G04 #@! TF.FilePolarity,Negative*
%FSLAX23*%
%MOMM*%
G01*
G70*
`;
    
    let solderMaskContent = header;
    
    // Add solder mask openings for pads
    nodes.forEach((node, index) => {
      const x = (node.position.x * 0.0254).toFixed(exportSettings.precision);
      const y = (node.position.y * 0.0254).toFixed(exportSettings.precision);
      const padSize = (0.1 * 0.0254).toFixed(exportSettings.precision); // 0.1mm clearance
      
      solderMaskContent += `%ADD11R,${padSize}X${padSize}*%\n`;
      solderMaskContent += `D11*\n`;
      solderMaskContent += `X${x}Y${y}D03*\n`;
    });
    
    solderMaskContent += `M02*\n`;
    
    return solderMaskContent;
  };

  const generateSilkscreenGerber = () => {
    const header = `G04 #@! TF.GenerationSoftware,Chip Designer v1.0*
G04 #@! TF.CreationDate,${new Date().toISOString()}*
G04 #@! TF.ProjectId,Circuit_Export*
G04 #@! TF.FileFunction,Legend,Top*
G04 #@! TF.FilePolarity,Positive*
%FSLAX23*%
%MOMM*%
G01*
G70*
`;
    
    let silkscreenContent = header;
    
    // Add component designators
    nodes.forEach((node, index) => {
      const x = (node.position.x * 0.0254).toFixed(exportSettings.precision);
      const y = (node.position.y * 0.0254).toFixed(exportSettings.precision);
      
      silkscreenContent += `%ADD12C,${(0.05 * 0.0254).toFixed(exportSettings.precision)}*%\n`;
      silkscreenContent += `D12*\n`;
      silkscreenContent += `X${x}Y${y}D03*\n`;
      
      // Add text label
      silkscreenContent += `G04 #@! TF.AperFunction,ComponentName*\n`;
      silkscreenContent += `%ADD13C,0.1*%\n`;
      silkscreenContent += `D13*\n`;
      silkscreenContent += `X${x}Y${y}D03*\n`;
      silkscreenContent += `G04 #@! TF.Text,${node.data.label || 'U' + index}*\n`;
    });
    
    silkscreenContent += `M02*\n`;
    
    return silkscreenContent;
  };

  const generateDrillFile = () => {
    const header = `M48
METRIC
VER,1
FMAT,2
`;
    
    let drillContent = header;
    
    // Add drill definitions
    const drillSizes = new Set();
    nodes.forEach(node => {
      drillSizes.add(0.8); // Standard 0.8mm drill for through-hole components
    });
    
    drillContent += 'T01\n';
    drillContent += 'C0.8\n';
    
    drillContent += '%\n';
    drillContent += 'G90\n';
    drillContent += 'G05\n';
    
    // Add drill positions
    nodes.forEach((node, index) => {
      const x = (node.position.x * 0.0254).toFixed(exportSettings.precision);
      const y = (node.position.y * 0.0254).toFixed(exportSettings.precision);
      
      drillContent += `T01\n`;
      drillContent += `X${x}Y${y}\n`;
    });
    
    drillContent += 'T00\n';
    drillContent += 'M30\n';
    
    return drillContent;
  };

  const generateOutlineGerber = () => {
    const header = `G04 #@! TF.GenerationSoftware,Chip Designer v1.0*
G04 #@! TF.CreationDate,${new Date().toISOString()}*
G04 #@! TF.ProjectId,Circuit_Export*
G04 #@! TF.FileFunction,Profile*
G04 #@! TF.FilePolarity,Positive*
%FSLAX23*%
%MOMM*%
G01*
G70*
`;
    
    let outlineContent = header;
    
    // Calculate board bounds
    const bounds = {
      minX: Math.min(...nodes.map(n => n.position.x)),
      maxX: Math.max(...nodes.map(n => n.position.x)),
      minY: Math.min(...nodes.map(n => n.position.y)),
      maxY: Math.max(...nodes.map(n => n.position.y))
    };
    
    // Add 5mm margin
    const margin = 5 * 39.3701; // 5mm in mils
    const outline = [
      { x: bounds.minX - margin, y: bounds.minY - margin },
      { x: bounds.maxX + margin, y: bounds.minY - margin },
      { x: bounds.maxX + margin, y: bounds.maxY + margin },
      { x: bounds.minX - margin, y: bounds.maxY + margin },
      { x: bounds.minX - margin, y: bounds.minY - margin }
    ];
    
    outlineContent += `%ADD10C,${(0.1 * 0.0254).toFixed(exportSettings.precision)}*%\n`;
    outlineContent += `D10*\n`;
    
    outline.forEach((point, index) => {
      const x = (point.x * 0.0254).toFixed(exportSettings.precision);
      const y = (point.y * 0.0254).toFixed(exportSettings.precision);
      
      if (index === 0) {
        outlineContent += `X${x}Y${y}D02*\n`;
      } else {
        outlineContent += `X${x}Y${y}D01*\n`;
      }
    });
    
    outlineContent += `M02*\n`;
    
    return outlineContent;
  };

  // Generate SPICE netlist
  const generateSPICE = () => {
    let spiceContent = `* Circuit exported from Chip Designer
* Generated: ${new Date().toISOString()}
* 
`;

    // Add component definitions
    nodes.forEach((node, index) => {
      const prefix = getSPICEPrefix(node.data.label);
      const refDes = `${prefix}${index + 1}`;
      
      // Get connections
      const inputEdges = edges.filter(e => e.target === node.id);
      const outputEdges = edges.filter(e => e.source === node.id);
      
      let connections = [];
      inputEdges.forEach(edge => {
        const sourceIndex = nodes.findIndex(n => n.id === edge.source);
        connections.push(sourceIndex + 1);
      });
      outputEdges.forEach(edge => {
        const targetIndex = nodes.findIndex(n => n.id === edge.target);
        connections.push(targetIndex + 1);
      });
      
      // Add ground reference if needed
      if (connections.length === 0) {
        connections.push('0');
      }
      
      const value = getSPICEValue(node);
      spiceContent += `${refDes} ${connections.join(' ')} ${value}\n`;
    });
    
    // Add analysis commands
    spiceContent += `
* Analysis commands
.OP
.TRAN 1ns 100ns
.AC DEC 10 1Hz 1GHz
.END
`;
    
    return spiceContent;
  };

  const getSPICEPrefix = (label) => {
    const prefixes = {
      'INPUT': 'V',
      'OUTPUT': 'V',
      'AND': 'U',
      'OR': 'U',
      'NOT': 'U',
      'XOR': 'U',
      'NAND': 'U',
      'NOR': 'U',
      'XNOR': 'U',
      'RESISTOR': 'R',
      'CAPACITOR': 'C',
      'INDUCTOR': 'L',
      'DIODE': 'D',
      'TRANSISTOR': 'Q'
    };
    return prefixes[label] || 'U';
  };

  const getSPICEValue = (node) => {
    const values = {
      'INPUT': node.data.value ? '5' : '0',
      'OUTPUT': '',
      'AND': 'AND_GATE',
      'OR': 'OR_GATE',
      'NOT': 'NOT_GATE',
      'XOR': 'XOR_GATE',
      'NAND': 'NAND_GATE',
      'NOR': 'NOR_GATE',
      'XNOR': 'XNOR_GATE'
    };
    return values[node.data.label] || '';
  };

  // Generate JSON netlist
  const generateJSON = () => {
    const netlist = {
      metadata: {
        version: '1.0',
        created: new Date().toISOString(),
        tool: 'Chip Designer',
        nodes: nodes.length,
        edges: edges.length
      },
      components: nodes.map(node => ({
        id: node.id,
        type: node.data.label,
        position: node.position,
        value: node.data.value,
        properties: node.data
      })),
      connections: edges.map(edge => ({
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle
      })),
      netlist: generateNetlist()
    };
    
    return JSON.stringify(netlist, null, 2);
  };

  const generateNetlist = () => {
    const nets = {};
    let netIndex = 1;
    
    // Create nets from connections
    edges.forEach(edge => {
      const netName = `NET${netIndex++}`;
      nets[netName] = {
        source: edge.source,
        target: edge.target,
        type: 'signal'
      };
    });
    
    return nets;
  };

  // Generate SVG schematic
  const generateSVG = () => {
    const width = 800;
    const height = 600;
    
    let svgContent = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .gate { fill: ${currentTheme.surface}; stroke: ${currentTheme.border}; stroke-width: 2; }
      .wire { stroke: ${currentTheme.primary}; stroke-width: 2; fill: none; }
      .text { fill: ${currentTheme.text.primary}; font-family: Arial, sans-serif; font-size: 12px; }
      .input { fill: ${currentTheme.success}; }
      .output { fill: ${currentTheme.error}; }
    </style>
  </defs>
  <rect width="${width}" height="${height}" fill="${currentTheme.background}"/>
`;
    
    // Draw wires first
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        svgContent += `  <line class="wire" x1="${sourceNode.position.x + 50}" y1="${sourceNode.position.y + 25}" x2="${targetNode.position.x + 50}" y2="${targetNode.position.y + 25}"/>\n`;
      }
    });
    
    // Draw gates
    nodes.forEach(node => {
      const gateClass = node.data.label === 'INPUT' ? 'input' : 
                        node.data.label === 'OUTPUT' ? 'output' : 'gate';
      
      svgContent += `  <rect class="${gateClass}" x="${node.position.x}" y="${node.position.y}" width="100" height="50" rx="5"/>\n`;
      svgContent += `  <text class="text" x="${node.position.x + 50}" y="${node.position.y + 30}" text-anchor="middle">${node.data.label}</text>\n`;
    });
    
    svgContent += '</svg>';
    
    return svgContent;
  };

  // Export files
  const exportFiles = () => {
    let files = [];
    
    switch (exportFormat) {
      case 'gerber':
        files = generateGerber();
        break;
      case 'spice':
        files = [{
          name: 'circuit.cir',
          content: generateSPICE(),
          layer: 'netlist'
        }];
        break;
      case 'json':
        files = [{
          name: 'circuit.json',
          content: generateJSON(),
          layer: 'netlist'
        }];
        break;
      case 'svg':
        files = [{
          name: 'circuit.svg',
          content: generateSVG(),
          layer: 'schematic'
        }];
        break;
      default:
        files = generateGerber();
    }
    
    // Download files
    files.forEach(file => {
      const blob = new Blob([file.content], {
        type: 'text/plain'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    });
    
    return files;
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
          <span style={{ fontSize: '20px' }}>Export</span>
          Advanced Export Manager
        </div>

        <button
          onClick={exportFiles}
          style={{
            padding: '8px 16px',
            backgroundColor: currentTheme.primary,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
          }}
        >
          Export Circuit
        </button>
      </div>

      {/* Export Content */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          padding: '16px',
        }}
      >
        {/* Format Selection */}
        <div
          style={{
            marginBottom: '20px',
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
            Export Format
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '12px',
            }}
          >
            {exportFormats.map((format) => (
              <div
                key={format.id}
                style={{
                  backgroundColor: exportFormat === format.id ? `${currentTheme.primary}15` : currentTheme.surface,
                  border: exportFormat === format.id ? `2px solid ${currentTheme.primary}` : `1px solid ${currentTheme.border}`,
                  borderRadius: '8px',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => setExportFormat(format.id)}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: currentTheme.text.primary,
                        marginBottom: '4px',
                      }}
                    >
                      {format.name}
                    </div>
                    <div
                      style={{
                        fontSize: '10px',
                        color: currentTheme.text.secondary,
                        lineHeight: '1.4',
                      }}
                    >
                      {format.description}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '16px',
                      color: currentTheme.primary,
                    }}
                  >
                    {format.icon}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    fontSize: '9px',
                    color: currentTheme.text.secondary,
                  }}
                >
                  <span>{format.extensions.join(', ')}</span>
                  <span>Layers: {format.layers.length}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Settings */}
        <div
          style={{
            marginBottom: '20px',
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
            Export Settings
          </div>

          <div
            style={{
              backgroundColor: currentTheme.surface,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '8px',
              padding: '16px',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: '500',
                    color: currentTheme.text.secondary,
                    marginBottom: '4px',
                  }}
                >
                  Precision
                </label>
                <select
                  value={exportSettings.precision}
                  onChange={(e) => setExportSettings(prev => ({ ...prev, precision: parseInt(e.target.value) }))}
                  style={{
                    width: '100%',
                    padding: '6px',
                    backgroundColor: currentTheme.background,
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: currentTheme.text.primary,
                  }}
                >
                  <option value={3}>Low (3 decimal places)</option>
                  <option value={6}>Medium (6 decimal places)</option>
                  <option value={9}>High (9 decimal places)</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: '500',
                    color: currentTheme.text.secondary,
                    marginBottom: '4px',
                  }}
                >
                  Units
                </label>
                <select
                  value={exportSettings.units}
                  onChange={(e) => setExportSettings(prev => ({ ...prev, units: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '6px',
                    backgroundColor: currentTheme.background,
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: currentTheme.text.primary,
                  }}
                >
                  <option value="mm">Millimeters (mm)</option>
                  <option value="inches">Inches (in)</option>
                  <option value="mils">Mils (thou)</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: '500',
                    color: currentTheme.text.secondary,
                    marginBottom: '4px',
                  }}
                >
                  Board Thickness (mm)
                </label>
                <input
                  type="number"
                  value={exportSettings.boardThickness}
                  onChange={(e) => setExportSettings(prev => ({ ...prev, boardThickness: parseFloat(e.target.value) }))}
                  step="0.1"
                  min="0.4"
                  max="3.2"
                  style={{
                    width: '100%',
                    padding: '6px',
                    backgroundColor: currentTheme.background,
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: currentTheme.text.primary,
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: '500',
                    color: currentTheme.text.secondary,
                    marginBottom: '4px',
                  }}
                >
                  Copper Thickness (mm)
                </label>
                <input
                  type="number"
                  value={exportSettings.copperThickness}
                  onChange={(e) => setExportSettings(prev => ({ ...prev, copperThickness: parseFloat(e.target.value) }))}
                  step="0.005"
                  min="0.017"
                  max="0.105"
                  style={{
                    width: '100%',
                    padding: '6px',
                    backgroundColor: currentTheme.background,
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: currentTheme.text.primary,
                  }}
                />
              </div>
            </div>

            <div
              style={{
                marginTop: '16px',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '11px',
                  color: currentTheme.text.secondary,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={exportSettings.includeDrill}
                  onChange={(e) => setExportSettings(prev => ({ ...prev, includeDrill: e.target.checked }))}
                  style={{
                    cursor: 'pointer',
                  }}
                />
                Include drill file
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '11px',
                  color: currentTheme.text.secondary,
                  cursor: 'pointer',
                  marginTop: '8px',
                }}
              >
                <input
                  type="checkbox"
                  checked={exportSettings.includeOutline}
                  onChange={(e) => setExportSettings(prev => ({ ...prev, includeOutline: e.target.checked }))}
                  style={{
                    cursor: 'pointer',
                  }}
                />
                Include board outline
              </label>
            </div>
          </div>
        </div>

        {/* Export Preview */}
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
            Export Summary
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              fontSize: '11px',
            }}
          >
            <div>
              <div style={{ color: currentTheme.text.secondary, marginBottom: '4px' }}>
                Components
              </div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: currentTheme.primary }}>
                {nodes.length}
              </div>
            </div>
            
            <div>
              <div style={{ color: currentTheme.text.secondary, marginBottom: '4px' }}>
                Connections
              </div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: currentTheme.primary }}>
                {edges.length}
              </div>
            </div>
            
            <div>
              <div style={{ color: currentTheme.text.secondary, marginBottom: '4px' }}>
                Format
              </div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: currentTheme.primary }}>
                {exportFormats.find(f => f.id === exportFormat)?.name}
              </div>
            </div>
            
            <div>
              <div style={{ color: currentTheme.text.secondary, marginBottom: '4px' }}>
                Files to Generate
              </div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: currentTheme.primary }}>
                {exportFormat === 'gerber' ? '4-5' : '1'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedExportManager;
