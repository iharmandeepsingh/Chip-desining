import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import useCircuitStore from '../../store/useCircuitStore';

const VLSILayoutView = () => {
  const { currentTheme } = useTheme();
  const { nodes, edges } = useCircuitStore();
  
  const [layoutData, setLayoutData] = useState({
    cells: [],
    wires: [],
    vias: [],
    layers: ['metal1', 'metal2', 'poly', 'diffusion'],
    activeLayer: 'metal1',
    gridSize: 10,
    cellSize: 40
  });
  
  const [viewSettings, setViewSettings] = useState({
    showGrid: true,
    showLabels: true,
    showVias: true,
    showPower: true,
    showGround: true,
    zoom: 1,
    panX: 0,
    panY: 0
  });

  // Standard cell library
  const standardCells = [
    {
      type: 'AND',
      name: 'AND2',
      width: 2,
      height: 4,
      pins: [
        { name: 'A', side: 'left', position: 1, layer: 'metal1' },
        { name: 'B', side: 'left', position: 3, layer: 'metal1' },
        { name: 'Y', side: 'right', position: 2, layer: 'metal1' }
      ],
      power: { vdd: { side: 'top', position: 1 }, gnd: { side: 'bottom', position: 1 } }
    },
    {
      type: 'OR',
      name: 'OR2',
      width: 2,
      height: 4,
      pins: [
        { name: 'A', side: 'left', position: 1, layer: 'metal1' },
        { name: 'B', side: 'left', position: 3, layer: 'metal1' },
        { name: 'Y', side: 'right', position: 2, layer: 'metal1' }
      ],
      power: { vdd: { side: 'top', position: 1 }, gnd: { side: 'bottom', position: 1 } }
    },
    {
      type: 'NOT',
      name: 'INV',
      width: 1,
      height: 4,
      pins: [
        { name: 'A', side: 'left', position: 2, layer: 'metal1' },
        { name: 'Y', side: 'right', position: 2, layer: 'metal1' }
      ],
      power: { vdd: { side: 'top', position: 0.5 }, gnd: { side: 'bottom', position: 0.5 } }
    },
    {
      type: 'XOR',
      name: 'XOR2',
      width: 3,
      height: 4,
      pins: [
        { name: 'A', side: 'left', position: 1, layer: 'metal1' },
        { name: 'B', side: 'left', position: 3, layer: 'metal1' },
        { name: 'Y', side: 'right', position: 2, layer: 'metal1' }
      ],
      power: { vdd: { side: 'top', position: 1.5 }, gnd: { side: 'bottom', position: 1.5 } }
    },
    {
      type: 'NAND',
      name: 'NAND2',
      width: 2,
      height: 4,
      pins: [
        { name: 'A', side: 'left', position: 1, layer: 'metal1' },
        { name: 'B', side: 'left', position: 3, layer: 'metal1' },
        { name: 'Y', side: 'right', position: 2, layer: 'metal1' }
      ],
      power: { vdd: { side: 'top', position: 1 }, gnd: { side: 'bottom', position: 1 } }
    },
    {
      type: 'NOR',
      name: 'NOR2',
      width: 2,
      height: 4,
      pins: [
        { name: 'A', side: 'left', position: 1, layer: 'metal1' },
        { name: 'B', side: 'left', position: 3, layer: 'metal1' },
        { name: 'Y', side: 'right', position: 2, layer: 'metal1' }
      ],
      power: { vdd: { side: 'top', position: 1 }, gnd: { side: 'bottom', position: 1 } }
    }
  ];

  // Layer colors
  const layerColors = {
    metal1: '#FFD700',    // Gold
    metal2: '#C0C0C0',    // Silver
    poly: '#8B4513',      // Brown
    diffusion: '#FF6B6B', // Red
    via: '#4169E1',      // Blue
    power: '#32CD32',    // Green
    ground: '#8B0000'     // Dark Red
  };

  // Generate VLSI layout from circuit
  const generateVLSILayout = () => {
    const cells = [];
    const wires = [];
    const vias = [];
    
    // Place cells in a grid layout
    const cellGrid = {};
    let nextX = 0;
    let nextY = 0;
    const maxRowWidth = 10;
    
    nodes.forEach((node, index) => {
      const cellType = standardCells.find(cell => cell.type === node.data.label);
      if (!cellType) return;
      
      // Calculate position
      const row = Math.floor(index / maxRowWidth);
      const col = index % maxRowWidth;
      const x = col * 4; // 4 grid units spacing
      const y = row * 6; // 6 grid units height
      
      const cell = {
        id: node.id,
        type: cellType,
        x: x,
        y: y,
        width: cellType.width,
        height: cellType.height,
        name: `${cellType.name}_${index}`,
        nodeData: node.data
      };
      
      cells.push(cell);
      cellGrid[node.id] = cell;
    });
    
    // Generate wires from edges
    edges.forEach((edge, index) => {
      const sourceCell = cellGrid[edge.source];
      const targetCell = cellGrid[edge.target];
      
      if (!sourceCell || !targetCell) return;
      
      // Find source and target pins
      const sourcePin = sourceCell.type.pins.find(pin => 
        pin.name === (edge.sourceHandle || 'Y')
      ) || sourceCell.type.pins[0];
      
      const targetPin = targetCell.type.pins.find(pin => 
        pin.name === (edge.targetHandle || 'A')
      ) || targetCell.type.pins[0];
      
      if (sourcePin && targetPin) {
        const wire = {
          id: `wire_${index}`,
          source: {
            cellId: sourceCell.id,
            pin: sourcePin,
            x: sourceCell.x + getPinX(sourceCell, sourcePin),
            y: sourceCell.y + getPinY(sourceCell, sourcePin)
          },
          target: {
            cellId: targetCell.id,
            pin: targetPin,
            x: targetCell.x + getPinX(targetCell, targetPin),
            y: targetCell.y + getPinY(targetCell, targetPin)
          },
          layer: 'metal1',
          width: 1
        };
        
        wires.push(wire);
        
        // Add vias for layer changes if needed
        if (wire.source.y !== wire.target.y) {
          vias.push({
            id: `via_${index}`,
            x: (wire.source.x + wire.target.x) / 2,
            y: (wire.source.y + wire.target.y) / 2,
            layers: ['metal1', 'metal2']
          });
        }
      }
    });
    
    // Add power and ground rails
    const powerRails = generatePowerRails(cells);
    wires.push(...powerRails.wires);
    vias.push(...powerRails.vias);
    
    setLayoutData(prev => ({
      ...prev,
      cells,
      wires,
      vias
    }));
  };

  // Get pin X position
  const getPinX = (cell, pin) => {
    switch (pin.side) {
      case 'left': return 0;
      case 'right': return cell.width;
      default: return cell.width / 2;
    }
  };

  // Get pin Y position
  const getPinY = (cell, pin) => {
    switch (pin.side) {
      case 'top': return 0;
      case 'bottom': return cell.height;
      default: return pin.position;
    }
  };

  // Generate power rails
  const generatePowerRails = (cells) => {
    const wires = [];
    const vias = [];
    
    if (cells.length === 0) return { wires, vias };
    
    // Find layout bounds
    const bounds = {
      minX: Math.min(...cells.map(c => c.x)),
      maxX: Math.max(...cells.map(c => c.x + c.width)),
      minY: Math.min(...cells.map(c => c.y)),
      maxY: Math.max(...cells.map(c => c.y + c.height))
    };
    
    // Add VDD rail at top
    wires.push({
      id: 'vdd_rail',
      source: { x: bounds.minX - 1, y: bounds.minY - 1 },
      target: { x: bounds.maxX + 1, y: bounds.minY - 1 },
      layer: 'metal1',
      width: 2,
      type: 'power'
    });
    
    // Add GND rail at bottom
    wires.push({
      id: 'gnd_rail',
      source: { x: bounds.minX - 1, y: bounds.maxY + 1 },
      target: { x: bounds.maxX + 1, y: bounds.maxY + 1 },
      layer: 'metal1',
      width: 2,
      type: 'ground'
    });
    
    // Connect cells to power rails
    cells.forEach(cell => {
      if (cell.type.power.vdd) {
        wires.push({
          id: `vdd_${cell.id}`,
          source: { x: cell.x + cell.type.power.vdd.position, y: cell.y },
          target: { x: cell.x + cell.type.power.vdd.position, y: bounds.minY - 1 },
          layer: 'metal1',
          width: 1,
          type: 'power'
        });
      }
      
      if (cell.type.power.gnd) {
        wires.push({
          id: `gnd_${cell.id}`,
          source: { x: cell.x + cell.type.power.gnd.position, y: cell.y + cell.height },
          target: { x: cell.x + cell.type.power.gnd.position, y: bounds.maxY + 1 },
          layer: 'metal1',
          width: 1,
          type: 'ground'
        });
      }
    });
    
    return { wires, vias };
  };

  // Get layer color
  const getLayerColor = (layer) => {
    return layerColors[layer] || '#666666';
  };

  // Convert grid coordinates to screen coordinates
  const gridToScreen = (x, y) => {
    const { cellSize, gridSize } = layoutData;
    const { zoom, panX, panY } = viewSettings;
    
    return {
      x: (x * cellSize * zoom) + panX,
      y: (y * cellSize * zoom) + panY
    };
  };

  // Render cell
  const renderCell = (cell) => {
    const { x, y } = gridToScreen(cell.x, cell.y);
    const { cellSize, gridSize, zoom } = layoutData;
    
    return (
      <g key={cell.id}>
        {/* Cell body */}
        <rect
          x={x}
          y={y}
          width={cell.width * cellSize * zoom}
          height={cell.height * cellSize * zoom}
          fill={currentTheme.surface}
          stroke={currentTheme.border}
          strokeWidth={1}
          rx={2}
        />
        
        {/* Cell type indicator */}
        <rect
          x={x + 2}
          y={y + 2}
          width={cell.width * cellSize * zoom - 4}
          height={cell.height * cellSize * zoom - 4}
          fill={`${currentTheme.primary}20`}
          stroke="none"
        />
        
        {/* Cell label */}
        {viewSettings.showLabels && zoom > 0.5 && (
          <text
            x={x + (cell.width * cellSize * zoom) / 2}
            y={y + (cell.height * cellSize * zoom) / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={Math.max(8, 10 * zoom)}
            fill={currentTheme.text.primary}
            fontWeight="600"
          >
            {cell.type.name}
          </text>
        )}
        
        {/* Pins */}
        {cell.type.pins.map((pin, index) => {
          const pinX = x + getPinX(cell, pin) * cellSize * zoom;
          const pinY = y + getPinY(cell, pin) * cellSize * zoom;
          
          return (
            <circle
              key={index}
              cx={pinX}
              cy={pinY}
              r={Math.max(2, 3 * zoom)}
              fill={getLayerColor(pin.layer)}
              stroke={currentTheme.border}
              strokeWidth={1}
            />
          );
        })}
        
        {/* Power connections */}
        {viewSettings.showPower && cell.type.power.vdd && (
          <line
            x1={x + cell.type.power.vdd.position * cellSize * zoom}
            y1={y}
            x2={x + cell.type.power.vdd.position * cellSize * zoom}
            y2={y - 5 * zoom}
            stroke={layerColors.power}
            strokeWidth={2 * zoom}
          />
        )}
        
        {viewSettings.showGround && cell.type.power.gnd && (
          <line
            x1={x + cell.type.power.gnd.position * cellSize * zoom}
            y1={y + cell.height * cellSize * zoom}
            x2={x + cell.type.power.gnd.position * cellSize * zoom}
            y2={y + (cell.height + 1) * cellSize * zoom}
            stroke={layerColors.ground}
            strokeWidth={2 * zoom}
          />
        )}
      </g>
    );
  };

  // Render wire
  const renderWire = (wire) => {
    const { x: x1, y: y1 } = gridToScreen(wire.source.x, wire.source.y);
    const { x: x2, y: y2 } = gridToScreen(wire.target.x, wire.target.y);
    const { zoom } = viewSettings;
    
    // Simple Manhattan routing
    const midX = (x1 + x2) / 2;
    
    return (
      <g key={wire.id}>
        <polyline
          points={`${x1},${y1} ${midX},${y1} ${midX},${y2} ${x2},${y2}`}
          fill="none"
          stroke={getLayerColor(wire.layer)}
          strokeWidth={Math.max(1, wire.width * zoom)}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    );
  };

  // Render via
  const renderVia = (via) => {
    const { x, y } = gridToScreen(via.x, via.y);
    const { zoom } = viewSettings;
    
    if (!viewSettings.showVias) return null;
    
    return (
      <g key={via.id}>
        <circle
          cx={x}
          cy={y}
          r={Math.max(3, 4 * zoom)}
          fill={layerColors.via}
          stroke={currentTheme.border}
          strokeWidth={1}
        />
        <circle
          cx={x}
          cy={y}
          r={Math.max(1, 2 * zoom)}
          fill={currentTheme.background}
        />
      </g>
    );
  };

  // Render grid
  const renderGrid = () => {
    if (!viewSettings.showGrid) return null;
    
    const { cellSize, gridSize } = layoutData;
    const { zoom, panX, panY } = viewSettings;
    
    const gridLines = [];
    const step = cellSize * zoom;
    
    // Vertical lines
    for (let x = panX % step; x < 800; x += step) {
      gridLines.push(
        <line
          key={`v_${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={600}
          stroke={`${currentTheme.border}30`}
          strokeWidth={0.5}
        />
      );
    }
    
    // Horizontal lines
    for (let y = panY % step; y < 600; y += step) {
      gridLines.push(
        <line
          key={`h_${y}`}
          x1={0}
          y1={y}
          x2={800}
          y2={y}
          stroke={`${currentTheme.border}30`}
          strokeWidth={0.5}
        />
      );
    }
    
    return <g>{gridLines}</g>;
  };

  // Initialize layout
  useEffect(() => {
    generateVLSILayout();
  }, [nodes, edges]);

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
          <span style={{ fontSize: '20px' }}>VLSI</span>
          VLSI Layout View
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={generateVLSILayout}
            style={{
              padding: '6px 12px',
              backgroundColor: currentTheme.primary,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
          >
            Regenerate Layout
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <label
              style={{
                fontSize: '11px',
                color: currentTheme.text.secondary,
              }}
            >
              Layer:
            </label>
            <select
              value={layoutData.activeLayer}
              onChange={(e) => setLayoutData(prev => ({ ...prev, activeLayer: e.target.value }))}
              style={{
                padding: '4px 8px',
                backgroundColor: currentTheme.surface,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '4px',
                fontSize: '11px',
                color: currentTheme.text.primary,
              }}
            >
              {layoutData.layers.map(layer => (
                <option key={layer} value={layer}>{layer}</option>
              ))}
            </select>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <label
              style={{
                fontSize: '11px',
                color: currentTheme.text.secondary,
              }}
            >
              Zoom:
            </label>
            <button
              onClick={() => setViewSettings(prev => ({ ...prev, zoom: prev.zoom * 1.2 }))}
              style={{
                padding: '4px 8px',
                backgroundColor: currentTheme.surface,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
                color: currentTheme.text.primary,
              }}
            >
              +
            </button>
            <button
              onClick={() => setViewSettings(prev => ({ ...prev, zoom: prev.zoom / 1.2 }))}
              style={{
                padding: '4px 8px',
                backgroundColor: currentTheme.surface,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
                color: currentTheme.text.primary,
              }}
            >
              -
            </button>
            <span
              style={{
                fontSize: '11px',
                color: currentTheme.text.secondary,
                minWidth: '40px',
                textAlign: 'center',
              }}
            >
              {(viewSettings.zoom * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* View Controls */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${currentTheme.border}`,
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            color: currentTheme.text.secondary,
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={viewSettings.showGrid}
            onChange={(e) => setViewSettings(prev => ({ ...prev, showGrid: e.target.checked }))}
          />
          Grid
        </label>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            color: currentTheme.text.secondary,
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={viewSettings.showLabels}
            onChange={(e) => setViewSettings(prev => ({ ...prev, showLabels: e.target.checked }))}
          />
          Labels
        </label>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            color: currentTheme.text.secondary,
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={viewSettings.showVias}
            onChange={(e) => setViewSettings(prev => ({ ...prev, showVias: e.target.checked }))}
          />
          Vias
        </label>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            color: currentTheme.text.secondary,
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={viewSettings.showPower}
            onChange={(e) => setViewSettings(prev => ({ ...prev, showPower: e.target.checked }))}
          />
          Power
        </label>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            color: currentTheme.text.secondary,
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={viewSettings.showGround}
            onChange={(e) => setViewSettings(prev => ({ ...prev, showGround: e.target.checked }))}
          />
          Ground
        </label>
      </div>

      {/* Layout Canvas */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: currentTheme.canvas,
        }}
      >
        <svg
          width="100%"
          height="100%"
          style={{
            backgroundColor: currentTheme.background,
          }}
        >
          {/* Grid */}
          {renderGrid()}
          
          {/* Wires */}
          {layoutData.wires
            .filter(wire => wire.layer === layoutData.activeLayer || wire.type === 'power' || wire.type === 'ground')
            .map(wire => renderWire(wire))}
          
          {/* Cells */}
          {layoutData.cells.map(cell => renderCell(cell))}
          
          {/* Vias */}
          {layoutData.vias.map(via => renderVia(via))}
        </svg>
        
        {/* Layer Legend */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: currentTheme.surface,
            border: `1px solid ${currentTheme.border}`,
            borderRadius: '6px',
            padding: '8px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: '600',
              color: currentTheme.text.primary,
              marginBottom: '6px',
            }}
          >
            Layers
          </div>
          {layoutData.layers.map(layer => (
            <div
              key={layer}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '4px',
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: getLayerColor(layer),
                  borderRadius: '2px',
                }}
              />
              <span
                style={{
                  fontSize: '10px',
                  color: currentTheme.text.secondary,
                }}
              >
                {layer}
              </span>
            </div>
          ))}
        </div>
        
        {/* Statistics */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            backgroundColor: currentTheme.surface,
            border: `1px solid ${currentTheme.border}`,
            borderRadius: '6px',
            padding: '8px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: '600',
              color: currentTheme.text.primary,
              marginBottom: '6px',
            }}
          >
            Statistics
          </div>
          <div
            style={{
              fontSize: '10px',
              color: currentTheme.text.secondary,
            }}
          >
            Cells: {layoutData.cells.length}
          </div>
          <div
            style={{
              fontSize: '10px',
              color: currentTheme.text.secondary,
            }}
          >
            Wires: {layoutData.wires.length}
          </div>
          <div
            style={{
              fontSize: '10px',
              color: currentTheme.text.secondary,
            }}
          >
            Vias: {layoutData.vias.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VLSILayoutView;
