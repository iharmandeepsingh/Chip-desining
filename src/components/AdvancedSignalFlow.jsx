import React, { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import useCircuitStore from '../../store/useCircuitStore';

const AdvancedSignalFlow = () => {
  const { currentTheme } = useTheme();
  const { nodes, edges } = useCircuitStore();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw animated signal flow
    edges.forEach((edge, index) => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (!sourceNode || !targetNode) return;
      
      const isSignalActive = sourceNode.data.value;
      
      // Calculate edge path
      const path = new Path2D();
      path.moveTo(sourceNode.position.x + 50, sourceNode.position.y + 25);
      
      // Create curved path for better visualization
      const midX = (sourceNode.position.x + targetNode.position.x) / 2 + 50;
      const midY = (sourceNode.position.y + targetNode.position.y) / 2 + 25;
      const controlX = midX;
      const controlY = midY - 20;
      
      path.quadraticCurveTo(controlX, controlY, targetNode.position.x + 50, targetNode.position.y + 25);
      
      // Draw the edge
      ctx.beginPath();
      ctx.strokeStyle = isSignalActive ? currentTheme.success : currentTheme.border;
      ctx.lineWidth = isSignalActive ? 3 : 2;
      ctx.setLineDash(isSignalActive ? [8, 4] : [0, 0]);
      ctx.lineDashOffset = Date.now() / 100; // Animation offset
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Draw the path
      ctx.stroke(path);
      
      // Draw arrow head
      const angle = Math.atan2(
        targetNode.position.y - sourceNode.position.y,
        targetNode.position.x - sourceNode.position.x
      );
      
      ctx.save();
      ctx.translate(targetNode.position.x + 50, targetNode.position.y + 25);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(0, 0);
      ctx.lineTo(-10, -5);
      ctx.lineTo(-10, 5);
      ctx.closePath();
      ctx.fillStyle = isSignalActive ? currentTheme.success : currentTheme.border;
      ctx.fill();
      ctx.restore();
      
      // Draw signal flow particles for active signals
      if (isSignalActive) {
        const particleCount = 3;
        for (let i = 0; i < particleCount; i++) {
          const t = (Date.now() / 1000 + i * 0.3) % 1;
          const x = sourceNode.position.x + 50 + (targetNode.position.x - sourceNode.position.x) * t;
          const y = sourceNode.position.y + 25 + (targetNode.position.y - sourceNode.position.y) * t;
          
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = currentTheme.success;
          ctx.shadowColor = currentTheme.success;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    });
    
    // Draw node halos for active nodes
    nodes.forEach(node => {
      if (node.data.value) {
        // Animated glow effect
        const pulseSize = 8 + Math.sin(Date.now() / 300) * 3;
        
        ctx.beginPath();
        ctx.arc(node.position.x + 50, node.position.y + 25, pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = `${currentTheme.gateColors[node.data.label]}20`;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(node.position.x + 50, node.position.y + 25, pulseSize * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = currentTheme.gateColors[node.data.label];
        ctx.fill();
      }
    });
    
  }, [nodes, edges, currentTheme]);

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 10,
        opacity: 0.8,
      }}
    />
  );
};

export default AdvancedSignalFlow;
