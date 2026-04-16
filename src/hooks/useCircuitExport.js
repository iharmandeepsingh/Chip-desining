import { useCallback } from 'react';
import useCircuitStore from '../store/useCircuitStore';
import { useTheme } from '../contexts/ThemeContext';

const useCircuitExport = () => {
  const { nodes, edges } = useCircuitStore();
  const { currentTheme } = useTheme();

  const exportAsSVG = useCallback(() => {
    // Calculate canvas bounds
    const padding = 50;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    nodes.forEach(node => {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + 100); // Approximate node width
      maxY = Math.max(maxY, node.position.y + 60); // Approximate node height
    });

    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;
    const offsetX = -minX + padding;
    const offsetY = -minY + padding;

    // Generate SVG content
    let svgContent = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="2" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <!-- Background -->
        <rect width="${width}" height="${height}" fill="${currentTheme.surface}" stroke="${currentTheme.border}" stroke-width="2"/>
        
        <!-- Edges (wires) -->
        ${edges.map(edge => {
          const sourceNode = nodes.find(n => n.id === edge.source);
          const targetNode = nodes.find(n => n.id === edge.target);
          
          if (!sourceNode || !targetNode) return '';
          
          const x1 = sourceNode.position.x + 50 + offsetX;
          const y1 = sourceNode.position.y + 30 + offsetY;
          const x2 = targetNode.position.x + offsetX;
          const y2 = targetNode.position.y + 30 + offsetY;
          
          return `
            <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
                  stroke="${currentTheme.text.secondary}" stroke-width="3" 
                  stroke-linecap="round" filter="url(#shadow)"/>
          `;
        }).join('\n        ')}
        
        <!-- Nodes -->
        ${nodes.map(node => {
          const x = node.position.x + offsetX;
          const y = node.position.y + offsetY;
          const gateColor = currentTheme.gateColors[node.data.label] || '#666';
          
          return `
            <g transform="translate(${x}, ${y})">
              <!-- Node background -->
              <rect x="0" y="0" width="100" height="60" 
                    fill="${gateColor}" stroke="${gateColor}" stroke-width="2" 
                    rx="8" filter="url(#shadow)"/>
              
              <!-- Node label -->
              <text x="50" y="25" text-anchor="middle" 
                    fill="white" font-family="Arial, sans-serif" 
                    font-size="14" font-weight="bold">
                ${node.data.label}
              </text>
              
              <!-- Node value indicator -->
              <text x="50" y="45" text-anchor="middle" 
                    fill="white" font-family="Arial, sans-serif" 
                    font-size="12" opacity="${node.data.value ? '1' : '0.3'}">
                ${node.data.value ? '●' : '○'}
              </text>
              
              <!-- Connection handles -->
              ${node.data.label !== 'INPUT' ? `
                <circle cx="0" cy="30" r="5" fill="${gateColor}" stroke="white" stroke-width="2"/>
              ` : ''}
              
              ${node.data.label !== 'OUTPUT' ? `
                <circle cx="100" cy="30" r="5" fill="${gateColor}" stroke="white" stroke-width="2"/>
              ` : ''}
            </g>
          `;
        }).join('\n        ')}
        
        <!-- Title -->
        <text x="${width/2}" y="25" text-anchor="middle" 
              fill="${currentTheme.text.primary}" font-family="Arial, sans-serif" 
              font-size="18" font-weight="bold">
          Circuit Design
        </text>
        
        <!-- Metadata -->
        <text x="20" y="${height - 20}" fill="${currentTheme.text.secondary}" 
              font-family="Arial, sans-serif" font-size="12">
          Nodes: ${nodes.length} | Edges: ${edges.length}
        </text>
      </svg>
    `;

    // Create SVG blob and download
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `circuit-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [nodes, edges, currentTheme]);

  const exportAsPNG = useCallback(() => {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Calculate canvas bounds
    const padding = 50;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    nodes.forEach(node => {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + 100);
      maxY = Math.max(maxY, node.position.y + 60);
    });

    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;
    const offsetX = -minX + padding;
    const offsetY = -minY + padding;

    canvas.width = width;
    canvas.height = height;

    // Set background
    ctx.fillStyle = currentTheme.surface;
    ctx.fillRect(0, 0, width, height);

    // Draw title
    ctx.fillStyle = currentTheme.text.primary;
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Circuit Design', width / 2, 25);

    // Draw edges (wires)
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (!sourceNode || !targetNode) return;
      
      const x1 = sourceNode.position.x + 50 + offsetX;
      const y1 = sourceNode.position.y + 30 + offsetY;
      const x2 = targetNode.position.x + offsetX;
      const y2 = targetNode.position.y + 30 + offsetY;
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = currentTheme.text.secondary;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();
    });

    // Draw nodes
    nodes.forEach(node => {
      const x = node.position.x + offsetX;
      const y = node.position.y + offsetY;
      const gateColor = currentTheme.gateColors[node.data.label] || '#666';
      
      // Draw shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      // Draw node background
      ctx.fillStyle = gateColor;
      ctx.strokeStyle = gateColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x, y, 100, 60, 8);
      ctx.fill();
      ctx.stroke();
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // Draw label
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.data.label, x + 50, y + 25);
      
      // Draw value indicator
      ctx.font = '12px Arial, sans-serif';
      ctx.globalAlpha = node.data.value ? 1 : 0.3;
      ctx.fillText(node.data.value ? '●' : '○', x + 50, y + 45);
      ctx.globalAlpha = 1;
      
      // Draw connection handles
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      
      if (node.data.label !== 'INPUT') {
        ctx.beginPath();
        ctx.arc(x, y + 30, 5, 0, Math.PI * 2);
        ctx.fillStyle = gateColor;
        ctx.fill();
        ctx.stroke();
      }
      
      if (node.data.label !== 'OUTPUT') {
        ctx.beginPath();
        ctx.arc(x + 100, y + 30, 5, 0, Math.PI * 2);
        ctx.fillStyle = gateColor;
        ctx.fill();
        ctx.stroke();
      }
    });

    // Draw metadata
    ctx.fillStyle = currentTheme.text.secondary;
    ctx.font = '12px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Nodes: ${nodes.length} | Edges: ${edges.length}`, 20, height - 20);

    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `circuit-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/png');
  }, [nodes, edges, currentTheme]);

  const exportAsJSON = useCallback(() => {
    const circuitData = {
      metadata: {
        name: `Circuit Design ${new Date().toISOString()}`,
        version: '1.0',
        created: Date.now(),
        theme: currentTheme.name
      },
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type
      }))
    };

    const blob = new Blob([JSON.stringify(circuitData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `circuit-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [nodes, edges, currentTheme]);

  return {
    exportAsSVG,
    exportAsPNG,
    exportAsJSON,
    canExport: nodes.length > 0
  };
};

export default useCircuitExport;
