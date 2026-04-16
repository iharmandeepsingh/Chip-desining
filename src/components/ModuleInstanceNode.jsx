import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { useTheme } from '../../contexts/ThemeContext';

const ModuleInstanceNode = ({ data, selected }) => {
  const { currentTheme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredPort, setHoveredPort] = useState(null);

  const { instance, module } = data;

  const handlePortHover = (portId, isHovering) => {
    setHoveredPort(isHovering ? portId : null);
  };

  const renderPort = (port, index, isInput) => (
    <div
      key={port.name}
      style={{
        position: 'absolute',
        [isInput ? 'left' : 'right']: isInput ? '-8px' : '-8px',
        top: `${20 + index * 25}px`,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      <Handle
        type={isInput ? 'target' : 'source'}
        position={isInput ? Position.Left : Position.Right}
        id={port.name}
        style={{
          width: '8px',
          height: '8px',
          backgroundColor: hoveredPort === port.name ? currentTheme.primary : 
                          isInput ? currentTheme.success : currentTheme.error,
          border: `1px solid ${currentTheme.border}`,
          cursor: 'pointer',
        }}
        onMouseEnter={() => handlePortHover(port.name, true)}
        onMouseLeave={() => handlePortHover(port.name, false)}
      />
      
      {isExpanded && (
        <div
          style={{
            fontSize: '8px',
            color: currentTheme.text.secondary,
            [isInput ? 'marginRight' : 'marginLeft']: '4px',
            whiteSpace: 'nowrap',
          }}
        >
          {port.name}
        </div>
      )}
    </div>
  );

  return (
    <div
      style={{
        backgroundColor: currentTheme.surface,
        border: selected ? `2px solid ${currentTheme.primary}` : `1px solid ${module.color || currentTheme.border}`,
        borderRadius: '12px',
        padding: '16px',
        minWidth: '200px',
        minHeight: `${Math.max(120, instance.ports.inputs.length * 25 + instance.ports.outputs.length * 25 + 40)}px`,
        transition: 'all 0.2s ease',
        boxShadow: selected ? `0 4px 12px ${currentTheme.primary}40` : `0 2px 8px ${currentTheme.shadow}`,
        position: 'relative',
        cursor: 'pointer',
      }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Module Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: module.color || currentTheme.primary,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '600',
              color: 'white',
            }}
          >
            {data.icon || 'MOD'}
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
              {instance.name}
            </div>
            <div
              style={{
                fontSize: '10px',
                color: currentTheme.text.secondary,
              }}
            >
              {module.type}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '4px',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              backgroundColor: currentTheme.success,
              borderRadius: '50%',
            }}
          />
          <div
            style={{
              fontSize: '10px',
              color: currentTheme.text.secondary,
            }}
          >
            {module.version || '1.0'}
          </div>
        </div>
      </div>

      {/* Module Description */}
      {isExpanded && (
        <div
          style={{
            fontSize: '10px',
            color: currentTheme.text.secondary,
            marginBottom: '12px',
            lineHeight: '1.4',
          }}
        >
          {module.description}
        </div>
      )}

      {/* Module Statistics */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          fontSize: '9px',
          color: currentTheme.text.secondary,
          marginBottom: '12px',
        }}
      >
        <div>
          <span style={{ fontWeight: '600' }}>{instance.ports.inputs.length}</span> inputs
        </div>
        <div>
          <span style={{ fontWeight: '600' }}>{instance.ports.outputs.length}</span> outputs
        </div>
        <div>
          <span style={{ fontWeight: '600' }}>{module.nodes?.length || 0}</span> internal nodes
        </div>
      </div>

      {/* Input Ports */}
      {instance.ports.inputs.map((port, index) => renderPort(port, index, true))}

      {/* Output Ports */}
      {instance.ports.outputs.map((port, index) => renderPort(port, index, false))}

      {/* Expand/Collapse Indicator */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          fontSize: '12px',
          color: currentTheme.text.secondary,
          transition: 'transform 0.2s ease',
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
        }}
      >
        {'\u25bc'}
      </div>

      {/* Module Type Badge */}
      <div
        style={{
          position: 'absolute',
          top: '-8px',
          left: '16px',
          backgroundColor: module.color || currentTheme.primary,
          color: 'white',
          fontSize: '8px',
          fontWeight: '600',
          padding: '2px 6px',
          borderRadius: '4px',
          textTransform: 'uppercase',
        }}
      >
        {module.type}
      </div>

      {/* Hover Effect */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: selected ? `${currentTheme.primary}10` : 'transparent',
          borderRadius: '12px',
          pointerEvents: 'none',
          transition: 'background-color 0.2s ease',
        }}
      />
    </div>
  );
};

export default ModuleInstanceNode;
