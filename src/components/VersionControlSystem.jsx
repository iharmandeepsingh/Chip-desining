import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import useCircuitStore from '../../store/useCircuitStore';

const VersionControlSystem = () => {
  const { currentTheme } = useTheme();
  const { nodes, edges, setNodes, setEdges } = useCircuitStore();
  
  const [versions, setVersions] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [branches, setBranches] = useState(['main']);
  const [currentBranch, setCurrentBranch] = useState('main');
  const [collaborators, setCollaborators] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showBranches, setShowBranches] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(false);

  // Initialize with initial version
  useEffect(() => {
    const initialVersion = {
      id: 'v1.0.0',
      message: 'Initial commit',
      author: 'System',
      timestamp: new Date().toISOString(),
      nodes: [...nodes],
      edges: [...edges],
      branch: 'main',
      parent: null,
      changes: {
        added: nodes.length,
        modified: 0,
        deleted: 0
      }
    };
    
    setVersions([initialVersion]);
    setCurrentVersion(initialVersion);
  }, []);

  // Create new version
  const createVersion = (message, author = 'User') => {
    const newVersion = {
      id: `v${versions.length + 1}.0.0`,
      message,
      author,
      timestamp: new Date().toISOString(),
      nodes: [...nodes],
      edges: [...edges],
      branch: currentBranch,
      parent: currentVersion?.id || null,
      changes: calculateChanges(currentVersion)
    };
    
    setVersions(prev => [...prev, newVersion]);
    setCurrentVersion(newVersion);
    return newVersion;
  };

  // Calculate changes between versions
  const calculateChanges = (previousVersion) => {
    if (!previousVersion) {
      return {
        added: nodes.length,
        modified: 0,
        deleted: 0
      };
    }
    
    const added = nodes.filter(node => 
      !previousVersion.nodes.some(prevNode => prevNode.id === node.id)
    ).length;
    
    const deleted = previousVersion.nodes.filter(prevNode => 
      !nodes.some(node => node.id === prevNode.id)
    ).length;
    
    const modified = nodes.filter(node => {
      const prevNode = previousVersion.nodes.find(prevNode => prevNode.id === node.id);
      return prevNode && JSON.stringify(prevNode) !== JSON.stringify(node);
    }).length;
    
    return { added, modified, deleted };
  };

  // Revert to version
  const revertToVersion = (versionId) => {
    const version = versions.find(v => v.id === versionId);
    if (version) {
      setNodes([...version.nodes]);
      setEdges([...version.edges]);
      setCurrentVersion(version);
    }
  };

  // Create branch
  const createBranch = (branchName, fromVersion = currentVersion) => {
    if (branches.includes(branchName)) {
      throw new Error('Branch already exists');
    }
    
    setBranches(prev => [...prev, branchName]);
    setCurrentBranch(branchName);
    
    // Create new version on new branch
    const branchVersion = {
      ...fromVersion,
      id: `${branchName}-v1.0.0`,
      branch: branchName,
      message: `Branch created from ${fromVersion.id}`,
      author: 'User',
      timestamp: new Date().toISOString()
    };
    
    setVersions(prev => [...prev, branchVersion]);
    setCurrentVersion(branchVersion);
  };

  // Switch branch
  const switchBranch = (branchName) => {
    const branchVersions = versions.filter(v => v.branch === branchName);
    if (branchVersions.length > 0) {
      const latestVersion = branchVersions[branchVersions.length - 1];
      setNodes([...latestVersion.nodes]);
      setEdges([...latestVersion.edges]);
      setCurrentBranch(branchName);
      setCurrentVersion(latestVersion);
    }
  };

  // Merge branch
  const mergeBranch = (sourceBranch, targetBranch = 'main') => {
    const sourceVersions = versions.filter(v => v.branch === sourceBranch);
    const targetVersions = versions.filter(v => v.branch === targetBranch);
    
    if (sourceVersions.length === 0 || targetVersions.length === 0) {
      throw new Error('Cannot merge: branch not found');
    }
    
    const latestSource = sourceVersions[sourceVersions.length - 1];
    const latestTarget = targetVersions[targetVersions.length - 1];
    
    // Simple merge: take source version and create merge commit on target
    const mergeVersion = {
      id: `merge-${sourceBranch}-into-${targetBranch}`,
      message: `Merge ${sourceBranch} into ${targetBranch}`,
      author: 'User',
      timestamp: new Date().toISOString(),
      nodes: [...latestSource.nodes],
      edges: [...latestSource.edges],
      branch: targetBranch,
      parent: latestTarget.id,
      mergeFrom: sourceBranch,
      changes: calculateChanges(latestTarget)
    };
    
    setVersions(prev => [...prev, mergeVersion]);
    setCurrentBranch(targetBranch);
    setCurrentVersion(mergeVersion);
    
    setNodes([...latestSource.nodes]);
    setEdges([...latestSource.edges]);
  };

  // Add collaborator
  const addCollaborator = (name, email, role = 'viewer') => {
    const collaborator = {
      id: `collab_${Date.now()}`,
      name,
      email,
      role,
      joined: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      permissions: getPermissions(role)
    };
    
    setCollaborators(prev => [...prev, collaborator]);
    return collaborator;
  };

  const getPermissions = (role) => {
    const permissions = {
      viewer: ['read'],
      editor: ['read', 'write'],
      admin: ['read', 'write', 'admin']
    };
    return permissions[role] || permissions.viewer;
  };

  // Export version history
  const exportVersionHistory = () => {
    const history = {
      project: {
        name: 'Chip Designer Project',
        created: versions[0]?.timestamp,
        lastModified: currentVersion?.timestamp,
        totalVersions: versions.length,
        branches: branches.length,
        collaborators: collaborators.length
      },
      versions: versions.map(v => ({
        id: v.id,
        message: v.message,
        author: v.author,
        timestamp: v.timestamp,
        branch: v.branch,
        changes: v.changes,
        parent: v.parent,
        mergeFrom: v.mergeFrom
      })),
      branches: branches.map(branch => ({
        name: branch,
        versions: versions.filter(v => v.branch === branch).length,
        latest: versions.filter(v => v.branch === branch).pop()?.id
      })),
      collaborators: collaborators.map(c => ({
        name: c.name,
        email: c.email,
        role: c.role,
        joined: c.joined,
        lastActive: c.lastActive
      }))
    };
    
    const blob = new Blob([JSON.stringify(history, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `version_history_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        height: '100%',
        backgroundColor: currentTheme.background,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: `1px solid ${currentTheme.border}`,
        }}
      >
        <div
          style={{
            fontSize: '16px',
            fontWeight: '600',
            color: currentTheme.text.primary,
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '20px' }}>VC</span>
          Version Control & Collaboration
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => createVersion('Manual save point')}
            style={{
              padding: '6px 12px',
              backgroundColor: currentTheme.primary,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
          >
            Save Version
          </button>

          <button
            onClick={() => setShowBranches(!showBranches)}
            style={{
              padding: '6px 12px',
              backgroundColor: showBranches ? currentTheme.primary : 'transparent',
              color: showBranches ? 'white' : currentTheme.text.secondary,
              border: `1px solid ${showBranches ? currentTheme.primary : currentTheme.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
          >
            Branches ({branches.length})
          </button>

          <button
            onClick={() => setShowHistory(!showHistory)}
            style={{
              padding: '6px 12px',
              backgroundColor: showHistory ? currentTheme.primary : 'transparent',
              color: showHistory ? 'white' : currentTheme.text.secondary,
              border: `1px solid ${showHistory ? currentTheme.primary : currentTheme.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
          >
            History ({versions.length})
          </button>

          <button
            onClick={() => setShowCollaborators(!showCollaborators)}
            style={{
              padding: '6px 12px',
              backgroundColor: showCollaborators ? currentTheme.primary : 'transparent',
              color: showCollaborators ? 'white' : currentTheme.text.secondary,
              border: `1px solid ${showCollaborators ? currentTheme.primary : currentTheme.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
          >
            Team ({collaborators.length})
          </button>

          <button
            onClick={exportVersionHistory}
            style={{
              padding: '6px 12px',
              backgroundColor: currentTheme.secondary,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
          >
            Export
          </button>
        </div>
      </div>

      {/* Version Control Content */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          padding: '16px',
        }}
      >
        {/* Current Branch Info */}
        <div
          style={{
            backgroundColor: `${currentTheme.background}50`,
            borderRadius: '8px',
            padding: '12px',
            border: `1px solid ${currentTheme.border}`,
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: currentTheme.text.primary,
                  marginBottom: '4px',
                }}
              >
                Current Branch: {currentBranch}
              </div>
              <div
                style={{
                  fontSize: '10px',
                  color: currentTheme.text.secondary,
                }}
              >
                Version: {currentVersion?.id || 'None'}
              </div>
            </div>
            <div
              style={{
                fontSize: '10px',
                color: currentTheme.text.secondary,
                textAlign: 'right',
              }}
            >
              {currentVersion?.timestamp && new Date(currentVersion.timestamp).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Branches */}
        {showBranches && (
          <div
            style={{
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: currentTheme.text.primary,
                marginBottom: '12px',
              }}
            >
              Branches
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '8px',
              }}
            >
              {branches.map(branch => (
                <div
                  key={branch}
                  style={{
                    backgroundColor: branch === currentBranch ? `${currentTheme.primary}15` : currentTheme.surface,
                    border: branch === currentBranch ? `2px solid ${currentTheme.primary}` : `1px solid ${currentTheme.border}`,
                    borderRadius: '6px',
                    padding: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onClick={() => switchBranch(branch)}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: currentTheme.text.primary,
                    }}
                  >
                    {branch}
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      color: currentTheme.text.secondary,
                    }}
                  >
                    {versions.filter(v => v.branch === branch).length} versions
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                const branchName = prompt('Enter branch name:');
                if (branchName) {
                  try {
                    createBranch(branchName);
                  } catch (error) {
                    alert(error.message);
                  }
                }
              }}
              style={{
                marginTop: '8px',
                padding: '6px 12px',
                backgroundColor: currentTheme.secondary,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '500',
                width: '100%',
              }}
            >
              Create Branch
            </button>
          </div>
        )}

        {/* Version History */}
        {showHistory && (
          <div
            style={{
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: currentTheme.text.primary,
                marginBottom: '12px',
              }}
            >
              Version History
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '8px',
                maxHeight: '300px',
                overflow: 'auto',
              }}
            >
              {versions.slice().reverse().map(version => (
                <div
                  key={version.id}
                  style={{
                    backgroundColor: version.id === currentVersion?.id ? `${currentTheme.primary}15` : currentTheme.surface,
                    border: version.id === currentVersion?.id ? `2px solid ${currentTheme.primary}` : `1px solid ${currentTheme.border}`,
                    borderRadius: '6px',
                    padding: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => revertToVersion(version.id)}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '4px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: currentTheme.text.primary,
                      }}
                    >
                      {version.id}
                    </div>
                    <div
                      style={{
                        fontSize: '10px',
                        color: currentTheme.text.secondary,
                      }}
                    >
                      {version.branch}
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: '10px',
                      color: currentTheme.text.secondary,
                      marginBottom: '4px',
                    }}
                  >
                    {version.message}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      fontSize: '9px',
                      color: currentTheme.text.secondary,
                    }}
                  >
                    <span>{version.author}</span>
                    <span>{new Date(version.timestamp).toLocaleString()}</span>
                    {version.changes && (
                      <span>
                        +{version.changes.added} -{version.changes.deleted} ~{version.changes.modified}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Collaborators */}
        {showCollaborators && (
          <div
            style={{
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: currentTheme.text.primary,
                marginBottom: '12px',
              }}
            >
              Collaborators
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '8px',
              }}
            >
              {collaborators.map(collaborator => (
                <div
                  key={collaborator.id}
                  style={{
                    backgroundColor: currentTheme.surface,
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: '6px',
                    padding: '8px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: currentTheme.text.primary,
                      }}
                    >
                      {collaborator.name}
                    </div>
                    <div
                      style={{
                        fontSize: '10px',
                        backgroundColor: `${currentTheme.primary}15`,
                        color: currentTheme.primary,
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {collaborator.role}
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: '10px',
                      color: currentTheme.text.secondary,
                    }}
                  >
                    {collaborator.email}
                  </div>

                  <div
                    style={{
                      fontSize: '9px',
                      color: currentTheme.text.secondary,
                      marginTop: '4px',
                    }}
                  >
                    Joined: {new Date(collaborator.joined).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                const name = prompt('Enter collaborator name:');
                const email = prompt('Enter collaborator email:');
                const role = prompt('Enter role (viewer/editor/admin):') || 'viewer';
                
                if (name && email) {
                  addCollaborator(name, email, role);
                }
              }}
              style={{
                marginTop: '8px',
                padding: '6px 12px',
                backgroundColor: currentTheme.secondary,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '500',
                width: '100%',
              }}
            >
              Add Collaborator
            </button>
          </div>
        )}

        {/* Merge Options */}
        {branches.length > 1 && (
          <div
            style={{
              backgroundColor: `${currentTheme.background}50`,
              borderRadius: '8px',
              padding: '12px',
              border: `1px solid ${currentTheme.border}`,
            }}
          >
            <div
              style={{
                fontSize: '12px',
                fontWeight: '600',
                color: currentTheme.text.primary,
                marginBottom: '8px',
              }}
            >
              Merge Branch
            </div>

            <div
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
              }}
            >
              <select
                style={{
                  flex: 1,
                  padding: '6px',
                  backgroundColor: currentTheme.background,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: '4px',
                  fontSize: '11px',
                  color: currentTheme.text.primary,
                }}
              >
                <option value="">Select branch to merge</option>
                {branches.filter(b => b !== currentBranch).map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>

              <button
                onClick={() => {
                  const select = document.querySelector('select');
                  if (select.value) {
                    try {
                      mergeBranch(select.value);
                      alert(`Successfully merged ${select.value} into ${currentBranch}`);
                    } catch (error) {
                      alert(error.message);
                    }
                  }
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: currentTheme.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '500',
                }}
              >
                Merge
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VersionControlSystem;
