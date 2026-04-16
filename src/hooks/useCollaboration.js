import { useCallback, useEffect, useRef, useState } from 'react';
import useCircuitStore from '../store/useCircuitStore';

const useCollaboration = () => {
  const { nodes, edges, setNodes, setEdges, addNode, addEdge, updateNode } = useCircuitStore();
  
  // Collaboration state
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [userId, setUserId] = useState('');
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [cursorPositions, setCursorPositions] = useState(new Map());
  const [collaborationHistory, setCollaborationHistory] = useState([]);
  
  // WebSocket reference
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);

  // Generate random user ID
  const generateUserId = () => {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Generate random room ID
  const generateRoomId = () => {
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  };

  // Connect to collaboration server
  const connect = useCallback((serverUrl = 'ws://localhost:8080') => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      wsRef.current = new WebSocket(serverUrl);
      
      wsRef.current.onopen = () => {
        setIsConnected(true);
        console.log('Connected to collaboration server');
        
        // Start heartbeat
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }
        heartbeatIntervalRef.current = setInterval(() => {
          sendHeartbeat();
        }, 30000); // 30 seconds
      };

      wsRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleMessage(message);
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        console.log('Disconnected from collaboration server');
        
        // Attempt reconnection after delay
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          connect(serverUrl);
        }, 5000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Failed to connect to collaboration server:', error);
      setIsConnected(false);
    }
  }, []);

  // Disconnect from collaboration server
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setIsConnected(false);
    setUsers([]);
    setCursorPositions(new Map());
  }, []);

  // Join a collaboration room
  const joinRoom = useCallback((roomIdToJoin, userName) => {
    if (!isConnected || !wsRef.current) {
      console.error('Not connected to server');
      return false;
    }

    const user = {
      id: generateUserId(),
      name: userName || `User ${Math.floor(Math.random() * 1000)}`,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      cursor: { x: 0, y: 0 }
    };

    const message = {
      type: 'join_room',
      data: {
        roomId: roomIdToJoin || generateRoomId(),
        user: user
      }
    };

    wsRef.current.send(JSON.stringify(message));
    setCurrentUser(user);
    
    return true;
  }, [isConnected]);

  // Leave current room
  const leaveRoom = useCallback(() => {
    if (!isConnected || !wsRef.current || !currentUser) {
      return;
    }

    const message = {
      type: 'leave_room',
      data: {
        roomId: roomId,
        userId: currentUser.id
      }
    };

    wsRef.current.send(JSON.stringify(message));
    setRoomId('');
    setUsers([]);
    setCursorPositions(new Map());
  }, [isConnected, roomId, currentUser]);

  // Send circuit update
  const sendCircuitUpdate = useCallback((updateType, data) => {
    if (!isConnected || !wsRef.current || !roomId) {
      return;
    }

    const message = {
      type: 'circuit_update',
      data: {
        roomId: roomId,
        userId: currentUser?.id,
        updateType: updateType,
        data: data,
        timestamp: Date.now()
      }
    };

    wsRef.current.send(JSON.stringify(message));
  }, [isConnected, roomId, currentUser]);

  // Send cursor position
  const sendCursorPosition = useCallback((x, y) => {
    if (!isConnected || !wsRef.current || !roomId) {
      return;
    }

    const message = {
      type: 'cursor_update',
      data: {
        roomId: roomId,
        userId: currentUser?.id,
        position: { x, y },
        timestamp: Date.now()
      }
    };

    wsRef.current.send(JSON.stringify(message));
  }, [isConnected, roomId, currentUser]);

  // Send heartbeat
  const sendHeartbeat = useCallback(() => {
    if (!isConnected || !wsRef.current || !roomId) {
      return;
    }

    const message = {
      type: 'heartbeat',
      data: {
        roomId: roomId,
        userId: currentUser?.id,
        timestamp: Date.now()
      }
    };

    wsRef.current.send(JSON.stringify(message));
  }, [isConnected, roomId, currentUser]);

  // Handle incoming messages
  const handleMessage = useCallback((message) => {
    switch (message.type) {
      case 'room_joined':
        setRoomId(message.data.roomId);
        setUsers(message.data.users);
        break;

      case 'user_joined':
        setUsers(prev => [...prev.filter(u => u.id !== message.data.user.id), message.data.user]);
        break;

      case 'user_left':
        setUsers(prev => prev.filter(u => u.id !== message.data.userId));
        setCursorPositions(prev => {
          const newPositions = new Map(prev);
          newPositions.delete(message.data.userId);
          return newPositions;
        });
        break;

      case 'circuit_update':
        handleCircuitUpdate(message.data);
        break;

      case 'cursor_update':
        setCursorPositions(prev => {
          const newPositions = new Map(prev);
          newPositions.set(message.data.userId, message.data.position);
          return newPositions;
        });
        break;

      case 'sync_request':
        handleSyncRequest(message.data);
        break;

      case 'sync_response':
        handleSyncResponse(message.data);
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  }, []);

  // Handle circuit updates from other users
  const handleCircuitUpdate = useCallback((updateData) => {
    const { updateType, data, userId } = updateData;
    
    // Ignore updates from current user
    if (userId === currentUser?.id) {
      return;
    }

    // Add to collaboration history
    const historyItem = {
      id: Date.now(),
      userId: userId,
      userName: users.find(u => u.id === userId)?.name || 'Unknown',
      updateType: updateType,
      data: data,
      timestamp: updateData.timestamp
    };
    
    setCollaborationHistory(prev => [historyItem, ...prev.slice(0, 99)]); // Keep last 100

    // Apply update to local circuit
    switch (updateType) {
      case 'add_node':
        addNode(data);
        break;

      case 'add_edge':
        addEdge(data);
        break;

      case 'update_node':
        updateNode(data.id, data.updates);
        break;

      case 'delete_node':
        setNodes(prev => prev.filter(n => n.id !== data.nodeId));
        break;

      case 'delete_edge':
        setEdges(prev => prev.filter(e => e.id !== data.edgeId));
        break;

      case 'clear_circuit':
        setNodes([]);
        setEdges([]);
        break;

      default:
        console.log('Unknown update type:', updateType);
    }
  }, [currentUser, users, addNode, addEdge, updateNode, setNodes, setEdges]);

  // Handle sync request
  const handleSyncRequest = useCallback((syncData) => {
    if (!isConnected || !wsRef.current) {
      return;
    }

    const message = {
      type: 'sync_response',
      data: {
        roomId: roomId,
        userId: currentUser?.id,
        circuit: {
          nodes: nodes,
          edges: edges
        },
        timestamp: Date.now()
      }
    };

    wsRef.current.send(JSON.stringify(message));
  }, [isConnected, roomId, currentUser, nodes, edges]);

  // Handle sync response
  const handleSyncResponse = useCallback((syncData) => {
    const { circuit } = syncData;
    
    // Apply synced circuit to local state
    if (circuit.nodes) {
      setNodes(circuit.nodes);
    }
    if (circuit.edges) {
      setEdges(circuit.edges);
    }
  }, [setNodes, setEdges]);

  // Wrap circuit store methods to send updates
  const collaborativeAddNode = useCallback((node) => {
    addNode(node);
    sendCircuitUpdate('add_node', node);
  }, [addNode, sendCircuitUpdate]);

  const collaborativeAddEdge = useCallback((edge) => {
    addEdge(edge);
    sendCircuitUpdate('add_edge', edge);
  }, [addEdge, sendCircuitUpdate]);

  const collaborativeUpdateNode = useCallback((nodeId, updates) => {
    updateNode(nodeId, updates);
    sendCircuitUpdate('update_node', { nodeId, updates });
  }, [updateNode, sendCircuitUpdate]);

  const collaborativeClearCircuit = useCallback(() => {
    setNodes([]);
    setEdges([]);
    sendCircuitUpdate('clear_circuit', {});
  }, [setNodes, setEdges, sendCircuitUpdate]);

  // Request sync from room
  const requestSync = useCallback(() => {
    if (!isConnected || !wsRef.current || !roomId) {
      return;
    }

    const message = {
      type: 'sync_request',
      data: {
        roomId: roomId,
        userId: currentUser?.id,
        timestamp: Date.now()
      }
    };

    wsRef.current.send(JSON.stringify(message));
  }, [isConnected, roomId, currentUser]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    // Connection state
    isConnected,
    roomId,
    userId,
    currentUser,
    users,
    cursorPositions,
    collaborationHistory,
    
    // Connection methods
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    
    // Collaboration methods
    sendCircuitUpdate,
    sendCursorPosition,
    requestSync,
    
    // Wrapped circuit methods
    collaborativeAddNode,
    collaborativeAddEdge,
    collaborativeUpdateNode,
    collaborativeClearCircuit,
    
    // Helper methods
    generateRoomId,
    generateUserId,
  };
};

export default useCollaboration;
