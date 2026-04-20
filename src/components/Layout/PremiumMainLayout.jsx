import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import PremiumTopToolbar from './PremiumTopToolbar';
import PremiumLeftSidebar from './PremiumLeftSidebar';
import PremiumCanvas from './PremiumCanvas';
import PremiumBottomPanel from './PremiumBottomPanel';

const PremiumMainLayout = () => {
  const { currentTheme, toggleTheme, isDark } = useTheme();
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panelPosition, setPanelPosition] = useState({ x: '50%', y: '20px' });

  // Drag functionality
  const handleDragStart = (e) => {
    setIsDragging(true);
    const currentX = typeof panelPosition.x === 'string' ? parseFloat(panelPosition.x) : panelPosition.x;
    const currentY = typeof panelPosition.y === 'string' ? parseFloat(panelPosition.y) : panelPosition.y;
    setDragStart({
      x: e.clientX - (currentX * window.innerWidth / 100),
      y: e.clientY - (window.innerHeight - currentY)
    });
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    
    const newX = ((e.clientX - dragStart.x) / window.innerWidth * 100);
    const newY = window.innerHeight - (e.clientY - dragStart.y);
    
    setPanelPosition({
      x: Math.max(10, Math.min(90, newX)) + '%',
      y: Math.max(10, Math.min(90, newY)) + 'px'
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Global mouse event listeners
  React.useEffect(() => {
    const handleMouseMove = (e) => handleDragMove(e);
    const handleMouseUp = () => handleDragEnd();

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: currentTheme.background,
        color: currentTheme.text.primary,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden',
        position: 'absolute',
        fontSize: '14px',
        lineHeight: '1.5',
        letterSpacing: '-0.01em',
        fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"',
        margin: '0',
        padding: '0',
        left: '0',
        top: '0',
      }}
    >
      {/* Top Toolbar */}
      <div style={{ position: 'relative', zIndex: 100 }}>
        <PremiumTopToolbar />
      </div>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          position: 'relative',
          margin: '0',
          padding: '0',
        }}
      >
        {/* Left Sidebar */}
        <PremiumLeftSidebar />

        {/* Canvas Area */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            backgroundColor: currentTheme.canvas,
            overflow: 'hidden',
          }}
        >
          <PremiumCanvas />
          
          {/* Panel Toggle Buttons */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              display: 'flex',
              gap: '12px',
              zIndex: 50,
            }}
          >
            <button
              onClick={toggleTheme}
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: currentTheme.surface,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '500',
                color: currentTheme.text.secondary,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: `0 2px 8px ${currentTheme.shadow.sm}`,
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = currentTheme.primaryHover;
                e.target.style.color = currentTheme.text.inverse;
                e.target.style.transform = 'translateY(-2px) scale(1.05)';
                e.target.style.boxShadow = `0 8px 25px ${currentTheme.shadow.lg}`;
                e.target.style.borderColor = currentTheme.primaryHover;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = currentTheme.surface;
                e.target.style.color = currentTheme.text.secondary;
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = `0 2px 8px ${currentTheme.shadow.sm}`;
                e.target.style.borderColor = currentTheme.border;
              }}
            >
              <span style={{ fontSize: '16px', fontWeight: '600' }}>
                {isDark ? 'L' : 'D'}
              </span>
            </button>
            
            <button
              onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: currentTheme.surface,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '500',
                color: currentTheme.text.secondary,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: `0 2px 8px ${currentTheme.shadow.sm}`,
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = currentTheme.primaryHover;
                e.target.style.color = currentTheme.text.inverse;
                e.target.style.transform = 'translateY(-2px) scale(1.05)';
                e.target.style.boxShadow = `0 8px 25px ${currentTheme.shadow.lg}`;
                e.target.style.borderColor = currentTheme.primaryHover;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = currentTheme.surface;
                e.target.style.color = currentTheme.text.secondary;
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = `0 2px 8px ${currentTheme.shadow.sm}`;
                e.target.style.borderColor = currentTheme.border;
              }}
            >
              <span style={{ fontSize: '16px', fontWeight: '600' }}>L</span>
            </button>
            
            <button
              onClick={() => setIsBottomCollapsed(!isBottomCollapsed)}
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: currentTheme.surface,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '500',
                color: currentTheme.text.secondary,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: `0 2px 8px ${currentTheme.shadow.sm}`,
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = currentTheme.primaryHover;
                e.target.style.color = currentTheme.text.inverse;
                e.target.style.transform = 'translateY(-2px) scale(1.05)';
                e.target.style.boxShadow = `0 8px 25px ${currentTheme.shadow.lg}`;
                e.target.style.borderColor = currentTheme.primaryHover;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = currentTheme.surface;
                e.target.style.color = currentTheme.text.secondary;
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = `0 2px 8px ${currentTheme.shadow.sm}`;
                e.target.style.borderColor = currentTheme.border;
              }}
            >
              <span style={{ fontSize: '16px', fontWeight: '600' }}>B</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Panel */}
      <div
        id="bottom-panel-container"
        style={{
          position: 'absolute',
          bottom: panelPosition.y,
          left: panelPosition.x,
          transform: 'translateX(-50%) rotate(' + rotation + 'deg)',
          zIndex: 100,
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          transition: isDragging ? 'none' : 'transform 0.3s ease',
        }}
        onMouseDown={(e) => handleDragStart(e)}
      >
          {/* Rotation Controls */}
          <div
            style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              display: 'flex',
              gap: '4px',
              zIndex: 101,
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRotation(prev => prev - 15);
              }}
              style={{
                width: '24px',
                height: '24px',
                backgroundColor: currentTheme.primary,
                border: 'none',
                borderRadius: '50%',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ↺
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRotation(prev => prev + 15);
              }}
              style={{
                width: '24px',
                height: '24px',
                backgroundColor: currentTheme.primary,
                border: 'none',
                borderRadius: '50%',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ↻
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRotation(0);
              }}
              style={{
                width: '24px',
                height: '24px',
                backgroundColor: currentTheme.secondary,
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '10px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              0°
            </button>
          </div>
          
          <PremiumBottomPanel />
        </div>
      </div>
   
  );
}
export default PremiumMainLayout;
