import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import LeftSidebar from './LeftSidebar';
import TopToolbar from './TopToolbar';
import Canvas from './Canvas';
import RightPanel from './RightPanel';
import BottomPanel from './BottomPanel';

const MainLayout = () => {
  const { currentTheme } = useTheme();
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(true);

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
          height: '60px',
          backgroundColor: currentTheme.surface,
          borderBottom: `1px solid ${currentTheme.border}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          zIndex: 100,
          boxShadow: `0 2px 8px ${currentTheme.shadow}`,
        }}
      >
        <TopToolbar />
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
        {isLeftSidebarOpen && (
          <div
            style={{
              width: '280px',
              backgroundColor: currentTheme.surface,
              borderRight: `1px solid ${currentTheme.border}`,
              boxShadow: `2px 0 8px ${currentTheme.shadow}`,
              zIndex: 90,
            }}
          >
            <LeftSidebar />
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
          
          {/* Sidebar Toggle Buttons */}
          <button
            onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
            style={{
              position: 'absolute',
              left: isLeftSidebarOpen ? '280px' : '10px',
              top: '20px',
              width: '32px',
              height: '32px',
              backgroundColor: currentTheme.surface,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              color: currentTheme.text.secondary,
              transition: 'all 0.2s ease',
              zIndex: 95,
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
            {isLeftSidebarOpen ? '◀' : '▶'}
          </button>

          <button
            onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
            style={{
              position: 'absolute',
              right: isRightPanelOpen ? '280px' : '10px',
              top: '20px',
              width: '32px',
              height: '32px',
              backgroundColor: currentTheme.surface,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              color: currentTheme.text.secondary,
              transition: 'all 0.2s ease',
              zIndex: 95,
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
            {isRightPanelOpen ? '▶' : '◀'}
          </button>
        </div>

        {/* Right Panel */}
        {isRightPanelOpen && (
          <div
            style={{
              width: '320px',
              backgroundColor: currentTheme.surface,
              borderLeft: `1px solid ${currentTheme.border}`,
              boxShadow: `-2px 0 8px ${currentTheme.shadow}`,
              zIndex: 90,
            }}
          >
            <RightPanel />
          </div>
        )}
      </div>

      {/* Bottom Panel */}
      {isBottomPanelOpen && (
        <div
          style={{
            height: '200px',
            backgroundColor: currentTheme.surface,
            borderTop: `1px solid ${currentTheme.border}`,
            boxShadow: `0 -2px 8px ${currentTheme.shadow}`,
            zIndex: 90,
          }}
        >
          <BottomPanel />
          
          {/* Bottom Panel Toggle */}
          <button
            onClick={() => setIsBottomPanelOpen(!isBottomPanelOpen)}
            style={{
              position: 'absolute',
              bottom: isBottomPanelOpen ? '200px' : '10px',
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
              fontSize: '16px',
              color: currentTheme.text.secondary,
              transition: 'all 0.2s ease',
              zIndex: 95,
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
            {isBottomPanelOpen ? '▼' : '▲'}
          </button>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
