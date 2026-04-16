import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { useTheme } from '../contexts/ThemeContext';

const AdvancedSequentialNode = ({ data, selected }) => {
  const { currentTheme } = useTheme();
  const [internalState, setInternalState] = useState(data.currentState || 0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (data.currentState !== internalState) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setInternalState(data.currentState);
        setIsAnimating(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [data.currentState, internalState]);

  const renderSequentialContent = () => {
    const { label, setupTime, holdTime, propagationDelay, memorySize, dataWidth } = data;
    
    switch (label) {
      case 'T_FLIP_FLOP':
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>T-FF</div>
            <div style={{ width: '40px', height: '30px', border: `2px solid ${currentTheme.gateColors[label]}`, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ fontSize: '10px', fontWeight: '600' }}>T</div>
              <div style={{ position: 'absolute', top: '-8px', left: '8px', fontSize: '8px', color: currentTheme.text.secondary }}>CLK</div>
            </div>
            <div style={{ fontSize: '8px', color: currentTheme.text.secondary, marginTop: '4px' }}>
              {propagationDelay}ns
            </div>
          </div>
        );
        
      case 'SR_FLIP_FLOP':
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>SR-FF</div>
            <div style={{ width: '50px', height: '35px', border: `2px solid ${currentTheme.gateColors[label]}`, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ fontSize: '10px', fontWeight: '600' }}>S</div>
                <div style={{ fontSize: '10px', fontWeight: '600' }}>R</div>
              </div>
              <div style={{ position: 'absolute', top: '-8px', left: '12px', fontSize: '8px', color: currentTheme.text.secondary }}>CLK</div>
            </div>
            <div style={{ fontSize: '8px', color: currentTheme.text.secondary, marginTop: '4px' }}>
              {propagationDelay}ns
            </div>
          </div>
        );
        
      case 'JK_FLIP_FLOP_EN':
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>JK-FF</div>
            <div style={{ width: '60px', height: '35px', border: `2px solid ${currentTheme.gateColors[label]}`, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ fontSize: '10px', fontWeight: '600' }}>J</div>
                <div style={{ fontSize: '10px', fontWeight: '600' }}>K</div>
                <div style={{ fontSize: '10px', fontWeight: '600', color: currentTheme.text.secondary }}>EN</div>
              </div>
              <div style={{ position: 'absolute', top: '-8px', left: '15px', fontSize: '8px', color: currentTheme.text.secondary }}>CLK</div>
            </div>
            <div style={{ fontSize: '8px', color: currentTheme.text.secondary, marginTop: '4px' }}>
              {propagationDelay}ns
            </div>
          </div>
        );
        
      case 'RAM_8BIT':
      case 'ROM_16BIT':
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
              {label === 'RAM_8BIT' ? '8-bit RAM' : '16-bit ROM'}
            </div>
            <div style={{ 
              width: '80px', 
              height: '60px', 
              border: `2px solid ${currentTheme.gateColors[label]}`, 
              borderRadius: '4px', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              position: 'relative',
              backgroundColor: `${currentTheme.gateColors[label]}10`
            }}>
              <div style={{ fontSize: '10px', fontWeight: '600', marginBottom: '4px' }}>
                {memorySize}×{dataWidth}
              </div>
              <div style={{ fontSize: '8px', color: currentTheme.text.secondary }}>
                {data.accessTime || 12}ns
              </div>
              <div style={{ position: 'absolute', top: '-8px', left: '20px', fontSize: '8px', color: currentTheme.text.secondary }}>ADDR</div>
              <div style={{ position: 'absolute', top: '-8px', right: '20px', fontSize: '8px', color: currentTheme.text.secondary }}>DATA</div>
            </div>
          </div>
        );
        
      case 'REGISTER_8BIT':
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>8-bit REG</div>
            <div style={{ 
              width: '70px', 
              height: '45px', 
              border: `2px solid ${currentTheme.gateColors[label]}`, 
              borderRadius: '4px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              position: 'relative',
              backgroundColor: `${currentTheme.gateColors[label]}10`
            }}>
              <div style={{ fontSize: '10px', fontWeight: '600' }}>REG</div>
              <div style={{ position: 'absolute', top: '-8px', left: '15px', fontSize: '8px', color: currentTheme.text.secondary }}>DATA</div>
              <div style={{ position: 'absolute', top: '-8px', right: '15px', fontSize: '8px', color: currentTheme.text.secondary }}>CLK</div>
            </div>
            <div style={{ fontSize: '8px', color: currentTheme.text.secondary, marginTop: '4px' }}>
              {propagationDelay}ns
            </div>
          </div>
        );
        
      case 'COUNTER_4BIT_SYNC':
      case 'COUNTER_8BIT':
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
              {label === 'COUNTER_4BIT_SYNC' ? '4-bit CNT' : '8-bit CNT'}
            </div>
            <div style={{ 
              width: '60px', 
              height: '45px', 
              border: `2px solid ${currentTheme.gateColors[label]}`, 
              borderRadius: '4px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              position: 'relative',
              backgroundColor: `${currentTheme.gateColors[label]}10`
            }}>
              <div style={{ fontSize: '10px', fontWeight: '600' }}>CNT</div>
              <div style={{ position: 'absolute', top: '-8px', left: '10px', fontSize: '8px', color: currentTheme.text.secondary }}>CLK</div>
              {internalState !== undefined && (
                <div style={{ 
                  position: 'absolute', 
                  bottom: '-8px', 
                  fontSize: '10px', 
                  fontWeight: '600',
                  color: currentTheme.primary 
                }}>
                  {internalState.toString(16).toUpperCase()}
                </div>
              )}
            </div>
            <div style={{ fontSize: '8px', color: currentTheme.text.secondary, marginTop: '4px' }}>
              {propagationDelay}ns
            </div>
          </div>
        );
        
      case 'SHIFT_REGISTER_4BIT':
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>4-bit SR</div>
            <div style={{ 
              width: '70px', 
              height: '45px', 
              border: `2px solid ${currentTheme.gateColors[label]}`, 
              borderRadius: '4px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              position: 'relative',
              backgroundColor: `${currentTheme.gateColors[label]}10`
            }}>
              <div style={{ fontSize: '10px', fontWeight: '600' }}>SHIFT</div>
              <div style={{ position: 'absolute', top: '-8px', left: '10px', fontSize: '8px', color: currentTheme.text.secondary }}>SER</div>
              <div style={{ position: 'absolute', top: '-8px', right: '10px', fontSize: '8px', color: currentTheme.text.secondary }}>CLK</div>
              {internalState !== undefined && (
                <div style={{ 
                  position: 'absolute', 
                  bottom: '-8px', 
                  fontSize: '10px', 
                  fontWeight: '600',
                  color: currentTheme.primary 
                }}>
                  {internalState.toString(2).padStart(4, '0')}
                </div>
              )}
            </div>
            <div style={{ fontSize: '8px', color: currentTheme.text.secondary, marginTop: '4px' }}>
              {propagationDelay}ns
            </div>
          </div>
        );
        
      case 'STATE_MACHINE_2BIT':
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>SM</div>
            <div style={{ 
              width: '70px', 
              height: '50px', 
              border: `2px solid ${currentTheme.gateColors[label]}`, 
              borderRadius: '4px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              position: 'relative',
              backgroundColor: `${currentTheme.gateColors[label]}10`
            }}>
              <div style={{ fontSize: '10px', fontWeight: '600' }}>SM</div>
              <div style={{ position: 'absolute', top: '-8px', left: '15px', fontSize: '8px', color: currentTheme.text.secondary }}>X</div>
              <div style={{ position: 'absolute', top: '-8px', right: '15px', fontSize: '8px', color: currentTheme.text.secondary }}>CLK</div>
              {internalState !== undefined && (
                <div style={{ 
                  position: 'absolute', 
                  bottom: '-8px', 
                  fontSize: '10px', 
                  fontWeight: '600',
                  color: currentTheme.primary 
                }}>
                  {internalState}
                </div>
              )}
            </div>
            <div style={{ fontSize: '8px', color: currentTheme.text.secondary, marginTop: '4px' }}>
              {propagationDelay}ns
            </div>
          </div>
        );
        
      default:
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>{label}</div>
            <div style={{ 
              width: '60px', 
              height: '40px', 
              border: `2px solid ${currentTheme.gateColors[label]}`, 
              borderRadius: '4px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <div style={{ fontSize: '10px', fontWeight: '600' }}>{label.substring(0, 3)}</div>
            </div>
          </div>
        );
    }
  };

  const getHandlePositions = () => {
    const { label, inputs = [], outputs = [] } = data;
    
    const positions = {
      inputs: [],
      outputs: []
    };
    
    // Calculate input handle positions
    inputs.forEach((input, index) => {
      const totalInputs = inputs.length;
      const spacing = 30 / (totalInputs + 1);
      const y = spacing * (index + 1);
      
      positions.inputs.push({
        id: input,
        position: Position.Left,
        style: { top: `${y}px` }
      });
    });
    
    // Calculate output handle positions
    outputs.forEach((output, index) => {
      const totalOutputs = outputs.length;
      const spacing = 30 / (totalOutputs + 1);
      const y = spacing * (index + 1);
      
      positions.outputs.push({
        id: output,
        position: Position.Right,
        style: { top: `${y}px` }
      });
    });
    
    return positions;
  };

  const handlePositions = getHandlePositions();

  return (
    <div
      style={{
        backgroundColor: currentTheme.surface,
        border: selected ? `2px solid ${currentTheme.primary}` : `1px solid ${currentTheme.gateColors[data.label]}`,
        borderRadius: '8px',
        padding: '10px',
        minWidth: '100px',
        minHeight: '80px',
        transition: 'all 0.2s ease',
        boxShadow: selected ? `0 4px 12px ${currentTheme.primary}40` : `0 2px 8px ${currentTheme.shadow}`,
        transform: isAnimating ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      {/* Input Handles */}
      {handlePositions.inputs.map((handle, index) => (
        <Handle
          key={`input-${index}`}
          type="target"
          position={handle.position}
          id={handle.id}
          style={{
            ...handle.style,
            width: '8px',
            height: '8px',
            backgroundColor: currentTheme.primary,
            border: `1px solid ${currentTheme.border}`,
          }}
        />
      ))}
      
      {/* Component Content */}
      {renderSequentialContent()}
      
      {/* Output Handles */}
      {handlePositions.outputs.map((handle, index) => (
        <Handle
          key={`output-${index}`}
          type="source"
          position={handle.position}
          id={handle.id}
          style={{
            ...handle.style,
            width: '8px',
            height: '8px',
            backgroundColor: currentTheme.success,
            border: `1px solid ${currentTheme.border}`,
          }}
        />
      ))}
      
      {/* Timing Indicator */}
      {data.propagationDelay && (
        <div
          style={{
            position: 'absolute',
            top: '-12px',
            right: '-12px',
            backgroundColor: currentTheme.accent,
            color: 'white',
            fontSize: '8px',
            fontWeight: '600',
            padding: '2px 6px',
            borderRadius: '4px',
            boxShadow: `0 2px 4px ${currentTheme.shadow}`,
          }}
        >
          {data.propagationDelay}ns
        </div>
      )}
    </div>
  );
};

export default AdvancedSequentialNode;
