import React, { useState, useEffect, useRef } from 'react';
import AdvancedAICircuitPlugin from '../plugins/AdvancedAICircuitPlugin';
import { useTheme } from '../contexts/ThemeContext';

const AdvancedAICircuitGenerator = ({ onCircuitGenerated, onNodesChange, onEdgesChange }) => {
  const { currentTheme } = useTheme();
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResults, setGenerationResults] = useState(null);
  const [selectedBlueprint, setSelectedBlueprint] = useState(null);
  const [blueprintParams, setBlueprintParams] = useState({});
  const [optimizationGoals, setOptimizationGoals] = useState([]);
  const [verificationResults, setVerificationResults] = useState(null);
  const [learningData, setLearningData] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  const [blueprints, setBlueprints] = useState([]);
  const [uiMode, setUiMode] = useState('premium'); // 'premium' or 'classic'
  const generationHistory = useRef([]);

  // Initialize advanced AI system
  useEffect(() => {
    AdvancedAICircuitPlugin.initialize();
    loadBlueprints();
    loadLearningData();
  }, []);

  // Load available blueprints
  const loadBlueprints = () => {
    const allBlueprints = Array.from(AdvancedAICircuitPlugin.blueprintSystem.blueprintLibrary.blueprints.values());
    setBlueprints(allBlueprints);
  };

  // Load learning data
  const loadLearningData = () => {
    const savedData = localStorage.getItem('circuitLearningData');
    if (savedData) {
      setLearningData(JSON.parse(savedData));
    }
  };

  // Save learning data
  const saveLearningData = (newData) => {
    const updatedData = [...learningData, ...newData];
    setLearningData(updatedData);
    localStorage.setItem('circuitLearningData', JSON.stringify(updatedData));
  };

  // Handle blueprint selection
  const handleBlueprintSelect = (blueprint) => {
    setSelectedBlueprint(blueprint);
    setBlueprintParams({});
    setOptimizationGoals(blueprint.optimizationGoals || []);
  };

  // Handle parameter change
  const handleParameterChange = (paramName, value) => {
    setBlueprintParams(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  // Handle optimization goal change
  const handleOptimizationGoalChange = (index, goal) => {
    setOptimizationGoals(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...goal };
      return updated;
    });
  };

  // Generate circuit from description
  const generateFromDescription = async () => {
    if (!description.trim()) return;

    setIsGenerating(true);
    setGenerationResults(null);
    setVerificationResults(null);

    try {
      console.log('Generating circuit from description:', description);
      
      // Use the new Advanced AI generation method
      let circuit = AdvancedAICircuitPlugin.generateFromDescription(description, {
        parameters: blueprintParams,
        optimizationGoals: optimizationGoals
      });
      
      // If Advanced AI fails, try blueprint-based generation
      if (!circuit) {
        const matchingBlueprints = AdvancedAICircuitPlugin.blueprintSystem.blueprintLibrary.searchBlueprints({
          type: 'digital'
        });
        
        if (matchingBlueprints.length > 0) {
          const bestBlueprint = matchingBlueprints[0];
          circuit = bestBlueprint.generateInstance(blueprintParams);
        }
      }
      
      // Final fallback to original AI
      if (!circuit) {
        const originalAI = require('../plugins/AICircuitPlugin').default;
        circuit = originalAI.simulationEngine.generateCircuit(description);
      }

      // Optimize circuit if goals specified
      if (circuit && optimizationGoals.length > 0) {
        circuit = AdvancedAICircuitPlugin.advancedAI.optimizationEngine.optimizeCircuit(
          circuit, 
          optimizationGoals
        );
      }

      // Verify circuit
      if (circuit) {
        const verification = AdvancedAICircuitPlugin.advancedAI.verificationEngine.verifyCorrectness(circuit, {
          inputCount: blueprintParams.inputCount,
          outputCount: blueprintParams.outputCount
        });
        setVerificationResults(verification);
      }

      setGenerationResults(circuit);
      
      // Add to generation history
      generationHistory.current.push({
        description,
        circuit,
        timestamp: Date.now(),
        verification: verificationResults
      });

    } catch (error) {
      console.error('Circuit generation failed:', error);
      setGenerationResults({
        error: error.message,
        fallbackCircuit: generateFallbackCircuit()
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate from blueprint
  const generateFromBlueprint = async () => {
    if (!selectedBlueprint) return;

    setIsGenerating(true);
    setGenerationResults(null);
    setVerificationResults(null);

    try {
      console.log('Generating circuit from blueprint:', selectedBlueprint.name);
      
      const circuit = selectedBlueprint.generateInstance(blueprintParams);
      
      // Optimize circuit if goals specified
      if (optimizationGoals.length > 0) {
        const optimized = AdvancedAICircuitPlugin.advancedAI.optimizationEngine.optimizeCircuit(
          circuit, 
          optimizationGoals
        );
        setGenerationResults(optimized);
      } else {
        setGenerationResults(circuit);
      }

      // Verify circuit
      const verification = AdvancedAICircuitPlugin.advancedAI.verificationEngine.verifyCorrectness(
        generationResults || circuit, 
        {
          inputCount: blueprintParams.inputCount,
          outputCount: blueprintParams.outputCount
        }
      );
      setVerificationResults(verification);

    } catch (error) {
      console.error('Blueprint generation failed:', error);
      setGenerationResults({
        error: error.message,
        fallbackCircuit: generateFallbackCircuit()
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate fallback circuit
  const generateFallbackCircuit = () => {
    return {
      name: 'Basic AND Gate',
      type: 'combinational',
      nodes: [
        {
          id: 'input_a',
          type: 'gate',
          position: { x: 100, y: 150 },
          data: { label: 'INPUT', value: false }
        },
        {
          id: 'input_b',
          type: 'gate',
          position: { x: 100, y: 250 },
          data: { label: 'INPUT', value: false }
        },
        {
          id: 'and_gate',
          type: 'gate',
          position: { x: 300, y: 200 },
          data: { label: 'AND', value: false }
        },
        {
          id: 'output',
          type: 'gate',
          position: { x: 500, y: 200 },
          data: { label: 'OUTPUT', value: false }
        }
      ],
      edges: [
        { id: 'edge_a_and', source: 'input_a', target: 'and_gate', type: 'animated' },
        { id: 'edge_b_and', source: 'input_b', target: 'and_gate', type: 'animated' },
        { id: 'edge_and_out', source: 'and_gate', target: 'output', type: 'animated' }
      ],
      confidence: 0.1
    };
  };

  // Apply generated circuit
  const applyCircuit = () => {
    if (!generationResults || generationResults.error) return;

    try {
      // Convert to React Flow format
      const nodes = generationResults.nodes.map(node => ({
        id: node.id,
        type: 'gate',
        position: node.position,
        data: {
          label: node.data?.label || node.type,
          value: node.data?.value || false,
          ...node.data
        }
      }));

      const edges = generationResults.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type || 'animated',
        animated: true
      }));

      onNodesChange(nodes);
      onEdgesChange(edges);
      
      if (onCircuitGenerated) {
        onCircuitGenerated({
          ...generationResults,
          verification: verificationResults
        });
      }

      // Save to learning data
      saveLearningData([{
        description,
        circuit: generationResults,
        feedback: { rating: 5 },
        timestamp: Date.now()
      }]);

    } catch (error) {
      console.error('Failed to apply circuit:', error);
    }
  };

  // Add optimization goal
  const addOptimizationGoal = () => {
    setOptimizationGoals(prev => [...prev, {
      type: 'minimize_gates',
      priority: 'medium',
      target: 0,
      weight: 1.0
    }]);
  };

  // Remove optimization goal
  const removeOptimizationGoal = (index) => {
    setOptimizationGoals(prev => prev.filter((_, i) => i !== index));
  };

  // Train AI with current data
  const trainAI = () => {
    if (learningData.length === 0) return;

    console.log('Training AI with', learningData.length, 'examples');
    AdvancedAICircuitPlugin.advancedAI.machineLearning.train(learningData);
    alert('AI training completed!');
  };

  // Premium UI Styles
  const premiumStyles = {
    container: {
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      height: '100%',
      overflow: 'auto',
      background: `linear-gradient(135deg, ${currentTheme.surface} 0%, ${currentTheme.background} 100%)`,
    },
    header: {
      marginBottom: '32px',
      textAlign: 'center',
    },
    title: {
      margin: 0,
      background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontSize: '28px',
      fontWeight: '700',
      letterSpacing: '-0.5px',
      textShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    subtitle: {
      margin: '12px 0 0 0',
      color: currentTheme.textSecondary,
      fontSize: '14px',
      fontWeight: '400',
      opacity: 0.8,
    },
    tabContainer: {
      display: 'flex',
      background: currentTheme.surface,
      borderRadius: '16px',
      padding: '4px',
      marginBottom: '24px',
      boxShadow: `0 4px 20px ${currentTheme.shadow.md}`,
      border: `1px solid ${currentTheme.border}`,
    },
    tab: (isActive) => ({
      flex: 1,
      padding: '12px 16px',
      border: 'none',
      background: isActive ? `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})` : 'transparent',
      color: isActive ? 'white' : currentTheme.textSecondary,
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: isActive ? '600' : '400',
      borderRadius: '12px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: isActive ? `0 4px 12px ${currentTheme.primary}40` : 'none',
    }),
    card: {
      background: currentTheme.surface,
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: `0 4px 20px ${currentTheme.shadow.md}`,
      border: `1px solid ${currentTheme.border}`,
      backdropFilter: 'blur(12px)',
    },
    input: {
      width: '100%',
      padding: '16px',
      border: `2px solid ${currentTheme.border}`,
      borderRadius: '12px',
      fontSize: '14px',
      fontFamily: 'monospace',
      background: currentTheme.background,
      color: currentTheme.textPrimary,
      transition: 'all 0.3s ease',
      outline: 'none',
    },
    button: (variant = 'primary', disabled = false) => ({
      padding: '14px 28px',
      border: 'none',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      outline: 'none',
      ...(variant === 'primary' && {
        background: disabled ? currentTheme.textDisabled : `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
        color: 'white',
        boxShadow: disabled ? 'none' : `0 4px 12px ${currentTheme.primary}40`,
      }),
      ...(variant === 'secondary' && {
        background: currentTheme.surface,
        color: currentTheme.textPrimary,
        border: `2px solid ${currentTheme.border}`,
      }),
      ...(variant === 'danger' && {
        background: disabled ? currentTheme.textDisabled : '#ef4444',
        color: 'white',
        boxShadow: disabled ? 'none' : '0 4px 12px #ef444440',
      }),
    }),
  };

  // Classic UI Styles
  const classicStyles = {
    container: {
      padding: '16px',
      fontFamily: 'monospace',
      height: '100%',
      overflow: 'auto',
      background: currentTheme.background,
    },
    header: {
      marginBottom: '16px',
      borderBottom: `2px solid ${currentTheme.border}`,
      paddingBottom: '8px',
    },
    title: {
      margin: 0,
      color: currentTheme.textPrimary,
      fontSize: '18px',
      fontWeight: 'bold',
    },
    subtitle: {
      margin: '4px 0 0 0',
      color: currentTheme.textSecondary,
      fontSize: '12px',
    },
    tabContainer: {
      display: 'flex',
      borderBottom: `2px solid ${currentTheme.border}`,
      marginBottom: '16px',
    },
    tab: (isActive) => ({
      padding: '8px 16px',
      border: 'none',
      background: isActive ? currentTheme.primary : 'transparent',
      color: isActive ? 'white' : currentTheme.textSecondary,
      cursor: 'pointer',
      fontSize: '12px',
      borderBottom: isActive ? `2px solid ${currentTheme.primary}` : `2px solid transparent`,
    }),
    card: {
      background: currentTheme.surface,
      border: `1px solid ${currentTheme.border}`,
      borderRadius: '4px',
      padding: '12px',
      marginBottom: '12px',
    },
    input: {
      width: '100%',
      padding: '8px',
      border: `1px solid ${currentTheme.border}`,
      borderRadius: '2px',
      fontSize: '12px',
      fontFamily: 'monospace',
      background: currentTheme.background,
      color: currentTheme.textPrimary,
    },
    button: (variant = 'primary', disabled = false) => ({
      padding: '8px 16px',
      border: variant === 'primary' ? 'none' : `1px solid ${currentTheme.border}`,
      borderRadius: '2px',
      fontSize: '12px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      background: disabled ? currentTheme.textDisabled : 
        variant === 'primary' ? currentTheme.primary : 
        variant === 'danger' ? '#dc2626' : currentTheme.surface,
      color: variant === 'primary' || variant === 'danger' ? 'white' : currentTheme.textPrimary,
    }),
  };

  const styles = uiMode === 'premium' ? premiumStyles : classicStyles;

  return (
    <div style={styles.container}>
      {/* UI Mode Toggle */}
      <div style={{ 
        position: 'absolute', 
        top: '20px', 
        right: '20px',
        zIndex: 1000
      }}>
        <button
          onClick={() => setUiMode(uiMode === 'premium' ? 'classic' : 'premium')}
          style={{
            padding: '8px 12px',
            background: currentTheme.surface,
            border: `1px solid ${currentTheme.border}`,
            borderRadius: '8px',
            fontSize: '12px',
            cursor: 'pointer',
            boxShadow: `0 2px 8px ${currentTheme.shadow.sm}`,
          }}
        >
          {uiMode === 'premium' ? '🎨 Premium' : '📟 Classic'}
        </button>
      </div>

      <div style={styles.header}>
        <h2 style={styles.title}>
          🧠 Advanced AI Circuit Generator
        </h2>
        <p style={styles.subtitle}>
          Machine learning enhanced circuit generation with blueprint architecture
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={styles.tabContainer}>
        {['generate', 'blueprints', 'optimize', 'learn'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={styles.tab(activeTab === tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Generate Tab */}
      {activeTab === 'generate' && (
        <div style={styles.card}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '12px', 
              fontWeight: '600', 
              color: currentTheme.textPrimary,
              fontSize: uiMode === 'premium' ? '14px' : '12px'
            }}>
              Circuit Description:
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your circuit (e.g., '4-bit ripple carry adder with carry look-ahead', '8-bit synchronous counter with reset', 'UART controller with 115200 baud')"
              style={{
                ...styles.input,
                height: uiMode === 'premium' ? '120px' : '80px',
                resize: 'vertical',
              }}
            />
          </div>

          <button
            onClick={generateFromDescription}
            disabled={isGenerating || !description.trim()}
            style={styles.button('primary', isGenerating || !description.trim())}
          >
            {isGenerating ? '🔄 Generating...' : '⚡ Generate Circuit'}
          </button>

          {/* Advanced Options */}
          <div style={{ marginTop: '24px' }}>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{
                background: 'none',
                border: 'none',
                color: currentTheme.primary,
                cursor: 'pointer',
                fontSize: uiMode === 'premium' ? '14px' : '12px',
                textDecoration: 'underline',
                fontWeight: '500',
              }}
            >
              {showAdvanced ? '▼' : '▶'} Advanced Options
            </button>

            {showAdvanced && (
              <div style={{ 
                marginTop: '16px', 
                padding: uiMode === 'premium' ? '20px' : '12px',
                background: uiMode === 'premium' 
                  ? `linear-gradient(135deg, ${currentTheme.surface}, ${currentTheme.background})`
                  : currentTheme.surface,
                borderRadius: uiMode === 'premium' ? '12px' : '4px',
                border: `1px solid ${currentTheme.border}`,
                boxShadow: uiMode === 'premium' ? `0 4px 12px ${currentTheme.shadow.sm}` : 'none',
              }}>
                <h4 style={{ 
                  margin: '0 0 16px 0', 
                  color: currentTheme.textPrimary,
                  fontSize: uiMode === 'premium' ? '16px' : '14px',
                  fontWeight: '600'
                }}>
                  Optimization Goals:
                </h4>
                {optimizationGoals.map((goal, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '12px',
                    gap: '8px',
                    flexWrap: 'wrap'
                  }}>
                    <select
                      value={goal.type}
                      onChange={(e) => handleOptimizationGoalChange(index, { type: e.target.value })}
                      style={{
                        ...styles.input,
                        padding: uiMode === 'premium' ? '8px 12px' : '4px 8px',
                        width: 'auto',
                        minWidth: '140px',
                      }}
                    >
                      <option value="minimize_gates">Minimize Gates</option>
                      <option value="minimize_delay">Minimize Delay</option>
                      <option value="minimize_power">Minimize Power</option>
                      <option value="minimize_area">Minimize Area</option>
                    </select>
                    
                    <select
                      value={goal.priority}
                      onChange={(e) => handleOptimizationGoalChange(index, { priority: e.target.value })}
                      style={{
                        ...styles.input,
                        padding: uiMode === 'premium' ? '8px 12px' : '4px 8px',
                        width: 'auto',
                        minWidth: '100px',
                      }}
                    >
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>
                    
                    <input
                      type="number"
                      value={goal.target}
                      onChange={(e) => handleOptimizationGoalChange(index, { target: parseFloat(e.target.value) })}
                      placeholder="Target"
                      style={{ 
                        ...styles.input,
                        padding: uiMode === 'premium' ? '8px 12px' : '4px 8px',
                        width: '80px',
                      }}
                    />
                    
                    <button
                      onClick={() => removeOptimizationGoal(index)}
                      style={styles.button('danger')}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                
                <button
                  onClick={addOptimizationGoal}
                  style={styles.button('secondary')}
                >
                  + Add Goal
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Blueprints Tab */}
      {activeTab === 'blueprints' && (
        <div style={styles.card}>
          <h3 style={{ 
            color: currentTheme.textPrimary, 
            marginBottom: '20px',
            fontSize: uiMode === 'premium' ? '20px' : '16px',
            fontWeight: '600'
          }}>
            📋 Circuit Blueprints
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: uiMode === 'premium' 
              ? 'repeat(auto-fill, minmax(280px, 1fr))' 
              : 'repeat(auto-fill, minmax(250px, 1fr))', 
            gap: uiMode === 'premium' ? '20px' : '12px'
          }}>
            {blueprints.map(blueprint => (
              <div
                key={blueprint.name}
                onClick={() => handleBlueprintSelect(blueprint)}
                style={{
                  padding: uiMode === 'premium' ? '20px' : '12px',
                  border: selectedBlueprint?.name === blueprint.name 
                    ? `2px solid ${currentTheme.primary}` 
                    : `1px solid ${currentTheme.border}`,
                  borderRadius: uiMode === 'premium' ? '12px' : '6px',
                  cursor: 'pointer',
                  background: selectedBlueprint?.name === blueprint.name 
                    ? (uiMode === 'premium' 
                      ? `linear-gradient(135deg, ${currentTheme.primary}10, ${currentTheme.secondary}10)`
                      : `${currentTheme.primary}10`)
                    : currentTheme.surface,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: selectedBlueprint?.name === blueprint.name && uiMode === 'premium'
                    ? `0 4px 12px ${currentTheme.primary}20`
                    : uiMode === 'premium'
                    ? `0 2px 8px ${currentTheme.shadow.sm}`
                    : 'none',
                  transform: selectedBlueprint?.name === blueprint.name ? 'translateY(-2px)' : 'translateY(0)',
                }}
              >
                <h4 style={{ 
                  margin: '0 0 12px 0', 
                  color: currentTheme.textPrimary,
                  fontSize: uiMode === 'premium' ? '16px' : '14px',
                  fontWeight: '600'
                }}>
                  {blueprint.name}
                </h4>
                <p style={{ 
                  margin: '0 0 8px 0', 
                  color: currentTheme.textSecondary, 
                  fontSize: uiMode === 'premium' ? '13px' : '11px'
                }}>
                  Type: {blueprint.type} | Category: {blueprint.category}
                </p>
                <div style={{ 
                  fontSize: uiMode === 'premium' ? '12px' : '10px', 
                  color: currentTheme.textTertiary,
                  fontWeight: '500'
                }}>
                  {Object.keys(blueprint.parameters).length} parameters available
                </div>
              </div>
            ))}
          </div>

          {selectedBlueprint && (
            <div style={{ 
              marginTop: '24px', 
              padding: uiMode === 'premium' ? '24px' : '16px', 
              background: uiMode === 'premium' 
                ? `linear-gradient(135deg, ${currentTheme.surface}, ${currentTheme.background})`
                : currentTheme.surface,
              borderRadius: uiMode === 'premium' ? '12px' : '6px',
              border: `1px solid ${currentTheme.border}`,
              boxShadow: uiMode === 'premium' ? `0 4px 12px ${currentTheme.shadow.sm}` : 'none',
            }}>
              <h4 style={{ 
                margin: '0 0 20px 0', 
                color: currentTheme.textPrimary,
                fontSize: uiMode === 'premium' ? '18px' : '14px',
                fontWeight: '600'
              }}>
                ⚙️ {selectedBlueprint.name} Parameters
              </h4>
              
              {Object.entries(selectedBlueprint.parameters).map(([name, param]) => (
                <div key={name} style={{ marginBottom: uiMode === 'premium' ? '20px' : '16px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: currentTheme.textPrimary,
                    fontSize: uiMode === 'premium' ? '14px' : '12px'
                  }}>
                    {name}: {param.description}
                  </label>
                  
                  {param.type === 'number' ? (
                    <input
                      type="number"
                      value={blueprintParams[name] || param.defaultValue}
                      onChange={(e) => handleParameterChange(name, parseFloat(e.target.value))}
                      min={param.range?.min}
                      max={param.range?.max}
                      style={styles.input}
                    />
                  ) : param.type === 'enum' ? (
                    <select
                      value={blueprintParams[name] || param.defaultValue}
                      onChange={(e) => handleParameterChange(name, e.target.value)}
                      style={styles.input}
                    >
                      {/* Add enum options here */}
                    </select>
                  ) : (
                    <input
                      type={param.type}
                      value={blueprintParams[name] || param.defaultValue}
                      onChange={(e) => handleParameterChange(name, param.type === 'boolean' ? e.target.checked : e.target.value)}
                      style={styles.input}
                    />
                  )}
                  
                  {param.range && (
                    <div style={{ 
                      fontSize: uiMode === 'premium' ? '12px' : '10px', 
                      color: currentTheme.textSecondary, 
                      marginTop: '6px',
                      fontWeight: '500'
                    }}>
                      Range: {param.range.min} - {param.range.max}
                    </div>
                  )}
                </div>
              ))}
              
              <button
                onClick={generateFromBlueprint}
                disabled={isGenerating}
                style={styles.button('primary', isGenerating)}
              >
                {isGenerating ? '🔄 Generating...' : '🏗️ Generate from Blueprint'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results Section */}
      {generationResults && (
        <div style={{ 
          ...styles.card,
          background: uiMode === 'premium' 
            ? `linear-gradient(135deg, #10b98110, #05966910)`
            : '#e8f5e8',
          border: `2px solid #10b981`,
          boxShadow: uiMode === 'premium' ? `0 4px 20px #10b98120` : 'none',
        }}>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            color: '#059669',
            fontSize: uiMode === 'premium' ? '20px' : '16px',
            fontWeight: '600'
          }}>
            ✅ Generation Results
          </h3>
          
          {generationResults.error ? (
            <div style={{ 
              color: '#dc2626', 
              marginBottom: '16px',
              padding: uiMode === 'premium' ? '12px' : '8px',
              background: uiMode === 'premium' ? '#dc262610' : 'transparent',
              borderRadius: uiMode === 'premium' ? '8px' : '4px',
              fontSize: uiMode === 'premium' ? '14px' : '12px'
            }}>
              ⚠️ Generation Error: {generationResults.error}
              <br />
              Using fallback circuit...
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: uiMode === 'premium' ? 'repeat(2, 1fr)' : '1fr',
              gap: uiMode === 'premium' ? '16px' : '8px'
            }}>
              <div style={{ color: '#059669', fontSize: uiMode === 'premium' ? '14px' : '12px' }}>
                <strong>Circuit:</strong> {generationResults.name}
              </div>
              <div style={{ color: '#059669', fontSize: uiMode === 'premium' ? '14px' : '12px' }}>
                <strong>Type:</strong> {generationResults.type}
              </div>
              <div style={{ color: '#059669', fontSize: uiMode === 'premium' ? '14px' : '12px' }}>
                <strong>Components:</strong> {generationResults.nodes?.length || 0}
              </div>
              <div style={{ color: '#059669', fontSize: uiMode === 'premium' ? '14px' : '12px' }}>
                <strong>Connections:</strong> {generationResults.edges?.length || 0}
              </div>
              {generationResults.confidence && (
                <div style={{ 
                  color: '#059669', 
                  fontSize: uiMode === 'premium' ? '14px' : '12px',
                  gridColumn: uiMode === 'premium' ? 'span 2' : 'auto'
                }}>
                  <strong>Confidence:</strong> {(generationResults.confidence * 100).toFixed(1)}%
                </div>
              )}
            </div>
          )}

          {/* Verification Results */}
          {verificationResults && (
            <div style={{ 
              marginTop: '20px', 
              padding: uiMode === 'premium' ? '20px' : '12px',
              background: uiMode === 'premium' 
                ? `linear-gradient(135deg, #f59e0b10, #d9770610)`
                : '#fff3e0',
              borderRadius: uiMode === 'premium' ? '12px' : '6px',
              border: `1px solid #f59e0b`,
              boxShadow: uiMode === 'premium' ? `0 4px 12px #f59e0b20` : 'none',
            }}>
              <h4 style={{ 
                margin: '0 0 16px 0', 
                color: '#d97706',
                fontSize: uiMode === 'premium' ? '16px' : '14px',
                fontWeight: '600'
              }}>
                🔍 Verification Results
              </h4>
              <p style={{ 
                margin: '0 0 12px 0',
                color: verificationResults.passed ? '#059669' : '#dc2626',
                fontWeight: '600',
                fontSize: uiMode === 'premium' ? '14px' : '12px'
              }}>
                Status: {verificationResults.passed ? '✅ PASSED' : '❌ FAILED'}
              </p>
              
              {verificationResults.errors && verificationResults.errors.length > 0 && (
                <div style={{ 
                  color: '#dc2626',
                  marginBottom: '12px',
                  fontSize: uiMode === 'premium' ? '13px' : '11px'
                }}>
                  <strong>Errors:</strong>
                  <ul style={{ margin: '6px 0', paddingLeft: '20px' }}>
                    {verificationResults.errors.map((error, index) => (
                      <li key={index} style={{ marginBottom: '4px' }}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {verificationResults.warnings && verificationResults.warnings.length > 0 && (
                <div style={{ 
                  color: '#d97706',
                  marginBottom: '12px',
                  fontSize: uiMode === 'premium' ? '13px' : '11px'
                }}>
                  <strong>Warnings:</strong>
                  <ul style={{ margin: '6px 0', paddingLeft: '20px' }}>
                    {verificationResults.warnings.map((warning, index) => (
                      <li key={index} style={{ marginBottom: '4px' }}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {verificationResults.metrics && (
                <div style={{ marginTop: '12px' }}>
                  <strong style={{ 
                    color: currentTheme.textPrimary,
                    fontSize: uiMode === 'premium' ? '14px' : '12px'
                  }}>
                    Metrics:
                  </strong>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: uiMode === 'premium' 
                      ? 'repeat(auto-fit, minmax(160px, 1fr))' 
                      : 'repeat(auto-fit, minmax(140px, 1fr))', 
                    gap: '8px', 
                    marginTop: '8px' 
                  }}>
                    {Object.entries(verificationResults.metrics).map(([key, value]) => (
                      <div key={key} style={{ 
                        fontSize: uiMode === 'premium' ? '12px' : '10px',
                        color: currentTheme.textSecondary,
                        padding: uiMode === 'premium' ? '8px' : '4px',
                        background: uiMode === 'premium' ? currentTheme.surface : 'transparent',
                        borderRadius: uiMode === 'premium' ? '6px' : '2px'
                      }}>
                        <strong>{key}:</strong> {value}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={applyCircuit}
            style={styles.button('primary')}
          >
            🎯 Apply Circuit
          </button>
        </div>
      )}

      {/* Learn Tab */}
      {activeTab === 'learn' && (
        <div style={styles.card}>
          <h3 style={{ 
            color: currentTheme.textPrimary, 
            marginBottom: '20px',
            fontSize: uiMode === 'premium' ? '20px' : '16px',
            fontWeight: '600'
          }}>
            🧠 AI Learning
          </h3>
          
          <div style={{ marginBottom: '24px' }}>
            <p style={{ 
              color: currentTheme.textSecondary, 
              marginBottom: '16px',
              fontSize: uiMode === 'premium' ? '14px' : '12px',
              fontWeight: '500'
            }}>
              Training Examples: {learningData.length}
            </p>
            
            <button
              onClick={trainAI}
              disabled={learningData.length === 0}
              style={{
                ...styles.button('secondary', learningData.length === 0),
                background: learningData.length === 0 
                  ? currentTheme.textDisabled 
                  : uiMode === 'premium' 
                    ? `linear-gradient(135deg, #f59e0b, #d97706)`
                    : '#FF9800',
                color: 'white',
                boxShadow: learningData.length === 0 || !uiMode === 'premium' 
                  ? 'none' 
                  : `0 4px 12px #f59e0b40`,
              }}
            >
              🎓 Train AI with Examples
            </button>
            
            {learningData.length > 0 && (
              <div style={{ 
                padding: uiMode === 'premium' ? '20px' : '12px',
                background: uiMode === 'premium' 
                  ? `linear-gradient(135deg, ${currentTheme.surface}, ${currentTheme.background})`
                  : '#f5f5f5',
                borderRadius: uiMode === 'premium' ? '12px' : '6px',
                border: `1px solid ${currentTheme.border}`,
                boxShadow: uiMode === 'premium' ? `0 4px 12px ${currentTheme.shadow.sm}` : 'none',
                marginTop: '20px'
              }}>
                <h4 style={{ 
                  margin: '0 0 16px 0', 
                  color: currentTheme.textPrimary,
                  fontSize: uiMode === 'premium' ? '16px' : '14px',
                  fontWeight: '600'
                }}>
                  Recent Learning Examples
                </h4>
                <div style={{ 
                  maxHeight: uiMode === 'premium' ? '240px' : '200px', 
                  overflow: 'auto',
                  paddingRight: '8px'
                }}>
                  {learningData.slice(-5).reverse().map((example, index) => (
                    <div key={index} style={{ 
                      padding: uiMode === 'premium' ? '12px' : '8px',
                      borderBottom: `1px solid ${currentTheme.border}`,
                      fontSize: uiMode === 'premium' ? '12px' : '10px',
                      borderRadius: uiMode === 'premium' ? '6px' : '2px',
                      marginBottom: '8px',
                      background: uiMode === 'premium' ? currentTheme.surface : 'transparent',
                      transition: 'all 0.2s ease'
                    }}>
                      <div style={{ 
                        fontWeight: '600', 
                        marginBottom: '6px',
                        color: currentTheme.textPrimary
                      }}>
                        {example.description}
                      </div>
                      <div style={{ 
                        color: currentTheme.textSecondary,
                        fontSize: uiMode === 'premium' ? '11px' : '9px'
                      }}>
                        Rating: {example.feedback?.rating || 'N/A'} | 
                        Timestamp: {new Date(example.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAICircuitGenerator;
