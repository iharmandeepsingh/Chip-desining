import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import useCollaboration from '../hooks/useCollaboration';

const CollaborationPanel = () => {
  const { currentTheme } = useTheme();
  const {
    isConnected,
    roomId,
    currentUser,
    users,
    cursorPositions,
    collaborationHistory,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    generateRoomId,
  } = useCollaboration();

  const [userName, setUserName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const handleConnect = () => {
    connect();
  };

  const handleJoinRoom = () => {
    if (userName.trim()) {
      joinRoom(roomCode.trim() || generateRoomId(), userName.trim());
    }
  };

  const handleLeaveRoom = () => {
    leaveRoom();
  };

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(roomId);
  };

  const getUserColor = (userId) => {
    const user = users.find(u => u.id === userId);
    return user?.color || '#666';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '140px',
        right: '20px',
        backgroundColor: currentTheme.surface,
        border: `2px solid ${currentTheme.border}`,
        borderRadius: '8px',
        padding: '15px',
        width: '280px',
        boxShadow: `0 4px 12px ${currentTheme.shadow}`,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: currentTheme.text.primary,
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {isConnected ? 'Connected' : 'Disconnected'}
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isConnected ? currentTheme.success : currentTheme.error,
          }}
        />
      </div>

      {/* Connection Controls */}
      {!isConnected && (
        <div style={{ marginBottom: '15px' }}>
          <button
            onClick={handleConnect}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: currentTheme.primary,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
            }}
          >
            Connect to Server
          </button>
        </div>
      )}

      {/* Room Controls */}
      {isConnected && !roomId && (
        <div style={{ marginBottom: '15px' }}>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: currentTheme.text.primary,
              marginBottom: '8px',
            }}
          >
            Join Collaboration Room:
          </div>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Your name"
            style={{
              width: '100%',
              padding: '6px',
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '4px',
              backgroundColor: currentTheme.background,
              color: currentTheme.text.primary,
              fontSize: '13px',
              marginBottom: '8px',
            }}
          />
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            placeholder="Room code (optional)"
            style={{
              width: '100%',
              padding: '6px',
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '4px',
              backgroundColor: currentTheme.background,
              color: currentTheme.text.primary,
              fontSize: '13px',
              marginBottom: '8px',
            }}
          />
          <button
            onClick={handleJoinRoom}
            disabled={!userName.trim()}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: userName.trim() ? currentTheme.primary : currentTheme.text.secondary,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: userName.trim() ? 'pointer' : 'not-allowed',
              fontSize: '13px',
              fontWeight: 'bold',
            }}
          >
            Join Room
          </button>
        </div>
      )}

      {/* Room Info */}
      {isConnected && roomId && (
        <div style={{ marginBottom: '15px' }}>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: currentTheme.text.primary,
              marginBottom: '8px',
            }}
          >
            Room: {roomId.substring(0, 12)}...
          </div>
          <div
            style={{
              fontSize: '12px',
              color: currentTheme.text.secondary,
              marginBottom: '8px',
            }}
          >
            You: {currentUser?.name}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleCopyRoomCode}
              style={{
                flex: 1,
                padding: '6px',
                backgroundColor: currentTheme.secondary,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Copy Code
            </button>
            <button
              onClick={handleLeaveRoom}
              style={{
                flex: 1,
                padding: '6px',
                backgroundColor: currentTheme.accent,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Leave Room
            </button>
          </div>
        </div>
      )}

      {/* Active Users */}
      {isConnected && roomId && users.length > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: currentTheme.text.primary,
              marginBottom: '8px',
            }}
          >
            Active Users ({users.length}):
          </div>
          <div
            style={{
              maxHeight: '120px',
              overflowY: 'auto',
            }}
          >
            {users.map(user => (
              <div
                key={user.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '6px',
                  padding: '4px',
                  borderRadius: '4px',
                  backgroundColor: user.id === currentUser?.id ? `${currentTheme.primary}20` : 'transparent',
                }}
              >
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: user.color,
                    marginRight: '8px',
                  }}
                />
                <div
                  style={{
                    fontSize: '12px',
                    color: currentTheme.text.primary,
                    flex: 1,
                  }}
                >
                  {user.name}
                  {user.id === currentUser?.id && ' (You)'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collaboration History */}
      {isConnected && roomId && collaborationHistory.length > 0 && (
        <div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: currentTheme.text.primary,
              marginBottom: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            Activity Log
            <button
              onClick={() => setShowHistory(!showHistory)}
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                backgroundColor: currentTheme.background,
                color: currentTheme.text.secondary,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '3px',
                cursor: 'pointer',
              }}
            >
              {showHistory ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {showHistory && (
            <div
              style={{
                maxHeight: '200px',
                overflowY: 'auto',
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '4px',
                padding: '8px',
              }}
            >
              {collaborationHistory.slice(0, 20).map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    marginBottom: '6px',
                    fontSize: '11px',
                    color: currentTheme.text.secondary,
                    borderBottom: index < 19 ? `1px solid ${currentTheme.border}` : 'none',
                    paddingBottom: index < 19 ? '6px' : '0',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '2px',
                    }}
                  >
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: getUserColor(item.userId),
                        marginRight: '6px',
                      }}
                    />
                    <span style={{ fontWeight: 'bold', color: currentTheme.text.primary }}>
                      {item.userName}
                    </span>
                    <span style={{ marginLeft: '4px', color: currentTheme.text.secondary }}>
                      {formatTimestamp(item.timestamp)}
                    </span>
                  </div>
                  <div style={{ marginLeft: '14px' }}>
                    {item.updateType.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cursor Positions (Debug) */}
      {isConnected && roomId && cursorPositions.size > 0 && (
        <div style={{ marginTop: '10px' }}>
          <div
            style={{
              fontSize: '11px',
              color: currentTheme.text.secondary,
            }}
          >
            Cursors: {cursorPositions.size}
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaborationPanel;
