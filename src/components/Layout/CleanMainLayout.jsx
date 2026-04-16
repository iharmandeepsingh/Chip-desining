import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import MinimalTopToolbar from './MinimalTopToolbar';
import MinimalLeftSidebar from './MinimalLeftSidebar';
import Canvas from './Canvas';
import MinimalBottomPanel from './MinimalBottomPanel';

const CleanMainLayout = () => {
  const { currentTheme } = useTheme();
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);

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
      }}
    >
      {/* Top Toolbar */}
      <div
        style={{
          height: '48px',
          backgroundColor: currentTheme.surface,
          borderBottom: `1px solid ${currentTheme.border}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          position: 'relative',
          zIndex: 100,
        }}
      >
        <MinimalTopToolbar />
        
        {/* Panel Toggle Buttons */}
        <div
          style={{
            position: 'absolute',
            left: isLeftCollapsed ? '60px' : '280px',
            top: '8px',
            display: 'flex',
            gap: '8px',
          }}
        >
          <button
            onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: currentTheme.surface,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              color: currentTheme.text.secondary,
              transition: 'all 0.2s ease',
              boxShadow: `0 2px 8px ${currentTheme.shadow}`,
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = currentTheme.primary;
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = currentTheme.surface;
              e.target.style.color = currentTheme.text.secondary;
            }}
          >
            {isLeftCollapsed ? '▶' : '◀'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        {/* Left Sidebar */}
        {isLeftCollapsed && (
          <div
            style={{
              width: '60px',
              backgroundColor: currentTheme.surface,
              borderRight: `1px solid ${currentTheme.border}`,
              boxShadow: `2px 0 8px ${currentTheme.shadow}`,
              zIndex: 90,
            }}
          >
            <div
              style={{
                padding: '16px',
                textAlign: 'center',
                fontSize: '12px',
                color: currentTheme.text.secondary,
              }}
            >
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>📋</div>
              <div style={{ fontSize: '10px' }}>Tools</div>
            </div>
          </div>
        )}

        {/* Canvas Area */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            backgroundColor: currentTheme.canvas,
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 0',
          }}
        >
          <Canvas />
          
          {/* Right Panel Toggle */}
          <button
            onClick={() => setIsRightCollapsed(!isRightCollapsed)}
            style={{
              position: 'absolute',
              right: isRightCollapsed ? '60px' : '320px',
              top: '8px',
              width: '32px',
              height: '32px',
              backgroundColor: currentTheme.surface,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              color: currentTheme.text.secondary,
              transition: 'all 0.2s ease',
              boxShadow: `0 2px 8px ${currentTheme.shadow}`,
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = currentTheme.primary;
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = currentTheme.surface;
              e.target.style.color = currentTheme.text.secondary;
            }}
          >
            {isRightCollapsed ? '◀' : '▶'}
          </button>
        </div>

        {/* Right Panel */}
        {isRightCollapsed && (
          <div
            style={{
              width: '320px',
              backgroundColor: currentTheme.surface,
              borderLeft: `1px solid ${currentTheme.border}`,
              boxShadow: `-2px 0 8px ${currentTheme.shadow}`,
              zIndex: 90,
            }}
          >
            <div
              style={{
                padding: '16px',
                textAlign: 'center',
                fontSize: '12px',
                color: currentTheme.text.secondary,
              }}
            >
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>📊</div>
              <div style={{ fontSize: '10px' }}>Properties</div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Panel */}
      <div
        style={{
          height: isBottomCollapsed ? '48px' : '200px',
          backgroundColor: currentTheme.surface,
          borderTop: `1px solid ${currentTheme.border}`,
          transition: 'height 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Bottom Panel Toggle */}
        <button
          onClick={() => setIsBottomCollapsed(!isBottomCollapsed)}
          style={{
            position: 'absolute',
            bottom: isBottomCollapsed ? '200px' : '10px',
            right: '20px',
            width: '32px',
            height: '32px',
            backgroundColor: currentTheme.surface,
            border: `1px solid ${currentTheme.border}`,
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            color: currentTheme.text.secondary,
            transition: 'all 0.2s ease',
            boxShadow: `0 2px 8px ${currentTheme.shadow}`,
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = currentTheme.primary;
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = currentTheme.surface;
            e.target.style.color = currentTheme.text.secondary;
          }}
        >
          {isBottomCollapsed ? '▲' : '▼'}
        </button>

        {/* Bottom Panel Content */}
        {!isBottomCollapsed && <MinimalBottomPanel />}
      </div>
    </div>
  );
};

export default CleanMainLayout;
