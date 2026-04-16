import React from 'react';
import { BaseEdge, getBezierPath } from 'reactflow';
import useCircuitStore from '../store/useCircuitStore';

const AnimatedEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  const { animatingEdges, nodes } = useCircuitStore();
  const isAnimating = animatingEdges.has(id);
  
  // Get source node value
  const sourceNode = nodes.find(n => n.id === data?.source);
  const isActive = sourceNode?.data?.value || false;
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeStyle = {
    ...style,
    strokeWidth: isAnimating ? 4 : isActive ? 3 : 2,
    stroke: isAnimating 
      ? '#FF6B6B' 
      : isActive 
        ? '#4CAF50' 
        : '#666',
    filter: isAnimating 
      ? 'drop-shadow(0 0 8px rgba(255, 107, 107, 0.8))' 
      : isActive 
        ? 'drop-shadow(0 0 4px rgba(76, 175, 80, 0.6))' 
        : 'none',
    transition: 'all 0.3s ease',
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={edgeStyle}
      />
      
      {/* Animated signal indicator */}
      {isAnimating && (
        <circle r="3" fill="#FF6B6B">
          <animateMotion dur="1s" repeatCount="1">
            <mpath href={`#edge-path-${id}`} />
          </animateMotion>
        </circle>
      )}
      
      <defs>
        <path
          id={`edge-path-${id}`}
          d={edgePath}
          fill="none"
        />
      </defs>
    </>
  );
};

export default AnimatedEdge;
