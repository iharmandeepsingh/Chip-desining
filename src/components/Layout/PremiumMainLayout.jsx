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

  return (
    <div
      style={{
        height: '100vh',
        width: '85%',
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
      }}
    >
      {/* Top Toolbar */}
      <PremiumTopToolbar />

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
      <PremiumBottomPanel />

      {/* Global Styles for Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.7;
            }
          }
          
          @keyframes glow {
            0%, 100% {
              box-shadow: 0 0 5px ${currentTheme.primary}40;
            }
            50% {
              box-shadow: 0 0 20px ${currentTheme.primary}60;
            }
          }
          
          * {
            box-sizing: border-box;
          }
          
          body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            background: ${currentTheme.background};
            color: ${currentTheme.text.primary};
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          
          /* Consistent spacing system */
          .spacing-xs { margin: 4px; }
          .spacing-sm { margin: 8px; }
          .spacing-md { margin: 16px; }
          .spacing-lg { margin: 24px; }
          .spacing-xl { margin: 32px; }
          
          .padding-xs { padding: 4px; }
          .padding-sm { padding: 8px; }
          .padding-md { padding: 16px; }
          .padding-lg { padding: 24px; }
          .padding-xl { padding: 32px; }
          
          .gap-xs { gap: 4px; }
          .gap-sm { gap: 8px; }
          .gap-md { gap: 16px; }
          .gap-lg { gap: 24px; }
          .gap-xl { gap: 32px; }
          
          /* Scrollbar styling */
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: ${currentTheme.scrollbar.track};
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: ${currentTheme.scrollbar.thumb};
            border-radius: 4px;
            transition: background 0.2s ease;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: ${currentTheme.scrollbar.thumbHover};
          }
          
          /* React Flow improvements */
          .react-flow__node {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: move;
          }
          
          .react-flow__node:hover {
            transform: scale(1.02);
            filter: brightness(1.1);
          }
          
          .react-flow__node.selected {
            box-shadow: 0 0 0 2px ${currentTheme.primary};
          }
          
          .react-flow__edge-path {
            transition: all 0.3s ease;
          }
          
          .react-flow__edge:hover .react-flow__edge-path {
            stroke-width: 3;
            filter: brightness(1.2);
          }
          
          .react-flow__controls {
            background: ${currentTheme.surface} !important;
            border: 1px solid ${currentTheme.border} !important;
            border-radius: 12px !important;
            box-shadow: ${currentTheme.shadow.md} !important;
            backdrop-filter: blur(8px) !important;
          }
          
          .react-flow__controls-button {
            background: transparent !important;
            border: none !important;
            color: ${currentTheme.text.secondary} !important;
            transition: all 0.2s ease !important;
            border-radius: 8px !important;
            margin: 2px !important;
          }
          
          .react-flow__controls-button:hover {
            background: ${currentTheme.primaryHover} !important;
            color: ${currentTheme.text.inverse} !important;
            transform: scale(1.05) !important;
          }
          
          .react-flow__minimap {
            background: ${currentTheme.surface} !important;
            border: 1px solid ${currentTheme.border} !important;
            border-radius: 8px !important;
          }
          
          .react-flow__background {
            background: ${currentTheme.canvas} !important;
          }
          
          /* Selection box */
          .react-flow__selection {
            background: ${currentTheme.primary}20 !important;
            border: 1px solid ${currentTheme.primary} !important;
          }
          
          /* Attributions */
          .react-flow__attribution {
            background: transparent !important;
            color: ${currentTheme.text.tertiary} !important;
            font-size: 10px !important;
          }
          
          /* Focus styles */
          button:focus-visible,
          [tabindex]:focus-visible {
            outline: 2px solid ${currentTheme.primary};
            outline-offset: 2px;
          }
          
          /* Text selection */
          ::selection {
            background: ${currentTheme.primary}40;
            color: ${currentTheme.text.primary};
          }
        `}
      </style>
    </div>
  );
};

export default PremiumMainLayout;
