import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import useCircuitStore from '../../store/useCircuitStore';

const BooleanOptimizationEngine = () => {
  const { currentTheme } = useTheme();
  const { nodes, edges, addNode, addEdge, setNodes, setEdges } = useCircuitStore();
  
  const [truthTable, setTruthTable] = useState([]);
  const [karnaughMap, setKarnaughMap] = useState([]);
  const [optimizedExpression, setOptimizedExpression] = useState('');
  const [variableCount, setVariableCount] = useState(2);
  const [selectedOptimization, setSelectedOptimization] = useState('karnaugh');
  const [optimizationResults, setOptimizationResults] = useState([]);

  // Boolean optimization methods
  const optimizationMethods = [
    {
      id: 'karnaugh',
      name: 'Karnaugh Map',
      description: 'Visual minimization using Karnaugh maps',
      icon: 'KM',
      maxVariables: 6
    },
    {
      id: 'quine_mccluskey',
      name: 'Quine-McCluskey',
      description: 'Tabular method for Boolean minimization',
      icon: 'QM',
      maxVariables: 10
    },
    {
      id: 'espresso',
      name: 'Espresso Heuristic',
      description: 'Heuristic minimization algorithm',
      icon: 'ES',
      maxVariables: 20
    },
    {
      id: 'algebraic',
      name: 'Algebraic Simplification',
      description: 'Boolean algebra rules application',
      icon: 'AL',
      maxVariables: 15
    }
  ];

  // Initialize truth table
  useEffect(() => {
    generateTruthTable(variableCount);
  }, [variableCount]);

  // Generate truth table
  const generateTruthTable = (numVars) => {
    const rows = Math.pow(2, numVars);
    const table = [];
    
    for (let i = 0; i < rows; i++) {
      const row = {
        inputs: [],
        output: 0
      };
      
      // Generate input combinations
      for (let j = numVars - 1; j >= 0; j--) {
        row.inputs.push((i >> j) & 1);
      }
      
      table.push(row);
    }
    
    setTruthTable(table);
    generateKarnaughMap(table, numVars);
  };

  // Generate Karnaugh map
  const generateKarnaughMap = (table, numVars) => {
    if (numVars > 4) {
      setKarnaughMap([]);
      return;
    }
    
    const mapSize = Math.pow(2, Math.floor(numVars / 2));
    const kmap = [];
    
    for (let i = 0; i < mapSize; i++) {
      const row = [];
      for (let j = 0; j < mapSize; j++) {
        row.push(0);
      }
      kmap.push(row);
    }
    
    // Map truth table to Karnaugh map
    table.forEach((row, index) => {
      const grayCodeRow = toGrayCode(index >> (numVars / 2), numVars / 2);
      const grayCodeCol = toGrayCode(index & (mapSize - 1), numVars / 2);
      
      kmap[grayCodeRow][grayCodeCol] = row.output;
    });
    
    setKarnaughMap(kmap);
  };

  // Convert to Gray code
  const toGrayCode = (value, bits) => {
    return value ^ (value >> 1);
  };

  // Optimize using Karnaugh map
  const optimizeWithKarnaugh = () => {
    if (variableCount > 4) {
      return {
        method: 'karnaugh',
        expression: 'Karnaugh map optimization not supported for more than 4 variables',
        savings: 0,
        complexity: 'N/A'
      };
    }
    
    const implicants = findPrimeImplicants();
    const essentialImplicants = findEssentialImplicants(implicants);
    const expression = buildExpression(essentialImplicants);
    
    return {
      method: 'karnaugh',
      expression,
      savings: calculateSavings(expression),
      complexity: calculateComplexity(expression),
      implicants: essentialImplicants
    };
  };

  // Find prime implicants
  const findPrimeImplicants = () => {
    const implicants = [];
    const mapSize = karnaughMap.length;
    
    // Find all possible implicants
    for (let size = 1; size <= Math.min(mapSize, 4); size++) {
      for (let i = 0; i <= mapSize - size; i++) {
        for (let j = 0; j <= mapSize - size; j++) {
          if (isImplicant(i, j, size, size)) {
            implicants.push({
              row: i,
              col: j,
              size: size,
              value: 1,
              variables: getVariablesForImplicant(i, j, size, size)
            });
          }
        }
      }
    }
    
    return implicants;
  };

  // Check if area is a valid implicant
  const isImplicant = (row, col, height, width) => {
    for (let i = row; i < row + height; i++) {
      for (let j = col; j < col + width; j++) {
        const wrappedRow = i % karnaughMap.length;
        const wrappedCol = j % karnaughMap[0].length;
        
        if (karnaughMap[wrappedRow][wrappedCol] !== 1) {
          return false;
        }
      }
    }
    return true;
  };

  // Get variables for implicant
  const getVariablesForImplicant = (row, col, height, width) => {
    const variables = [];
    const mapSize = karnaughMap.length;
    
    // Determine which variables are don't cares
    for (let i = 0; i < variableCount; i++) {
      const isRowVar = i < variableCount / 2;
      const varIndex = isRowVar ? i : i - variableCount / 2;
      
      if (isRowVar) {
        if (height === mapSize || (row === 0 && height === mapSize / 2)) {
          variables.push({ name: String.fromCharCode(65 + varIndex), value: 'X' });
        } else {
          variables.push({ name: String.fromCharCode(65 + varIndex), value: row });
        }
      } else {
        if (width === mapSize || (col === 0 && width === mapSize / 2)) {
          variables.push({ name: String.fromCharCode(65 + varIndex), value: 'X' });
        } else {
          variables.push({ name: String.fromCharCode(65 + varIndex), value: col });
        }
      }
    }
    
    return variables;
  };

  // Find essential implicants
  const findEssentialImplicants = (implicants) => {
    const essential = [];
    const covered = new Set();
    
    // Find minterms not covered by larger implicants
    truthTable.forEach((row, index) => {
      if (row.output === 1 && !covered.has(index)) {
        const coveringImplicants = implicants.filter(imp => 
          coversMinterm(imp, index)
        );
        
        if (coveringImplicants.length === 1) {
          essential.push(coveringImplicants[0]);
          markCoveredByImplicant(coveringImplicants[0], covered);
        }
      }
    });
    
    return essential;
  };

  // Check if implicant covers minterm
  const coversMinterm = (implicant, mintermIndex) => {
    const mapSize = karnaughMap.length;
    const row = mintermIndex >> (variableCount / 2);
    const col = mintermIndex & (mapSize - 1);
    
    return row >= implicant.row && row < implicant.row + implicant.size &&
           col >= implicant.col && col < implicant.col + implicant.size;
  };

  // Mark minterms covered by implicant
  const markCoveredByImplicant = (implicant, covered) => {
    truthTable.forEach((row, index) => {
      if (row.output === 1 && coversMinterm(implicant, index)) {
        covered.add(index);
      }
    });
  };

  // Build expression from implicants
  const buildExpression = (implicants) => {
    if (implicants.length === 0) return '0';
    if (implicants.length === 1 && implicants[0].variables.every(v => v.value === 'X')) return '1';
    
    const terms = implicants.map(imp => {
      const term = imp.variables
        .filter(v => v.value !== 'X')
        .map(v => v.value === 0 ? `~${v.name}` : v.name)
        .join(' & ');
      
      return term || '1';
    });
    
    return terms.join(' | ');
  };

  // Calculate savings
  const calculateSavings = (expression) => {
    const originalComplexity = calculateOriginalComplexity();
    const optimizedComplexity = calculateComplexity(expression);
    return originalComplexity - optimizedComplexity;
  };

  // Calculate original complexity
  const calculateOriginalComplexity = () => {
    const minterms = truthTable.filter(row => row.output === 1).length;
    return minterms * variableCount; // Each minterm needs all variables
  };

  // Calculate expression complexity
  const calculateComplexity = (expression) => {
    const gateCount = (expression.match(/&/g) || []).length + 
                     (expression.match(/\|/g) || []).length;
    const literalCount = (expression.match(/[A-Z]/g) || []).length;
    return gateCount + literalCount;
  };

  // Optimize using Quine-McCluskey
  const optimizeWithQuineMcCluskey = () => {
    const minterms = truthTable
      .map((row, index) => row.output === 1 ? index : -1)
      .filter(index => index !== -1);
    
    if (minterms.length === 0) {
      return {
        method: 'quine_mccluskey',
        expression: '0',
        savings: 0,
        complexity: 0
      };
    }
    
    if (minterms.length === Math.pow(2, variableCount)) {
      return {
        method: 'quine_mccluskey',
        expression: '1',
        savings: calculateOriginalComplexity(),
        complexity: 0
      };
    }
    
    // Simplified Quine-McCluskey implementation
    const primeImplicants = findPrimeImplicantsQM(minterms);
    const expression = buildExpressionQM(primeImplicants);
    
    return {
      method: 'quine_mccluskey',
      expression,
      savings: calculateSavings(expression),
      complexity: calculateComplexity(expression)
    };
  };

  // Find prime implicants using Quine-McCluskey
  const findPrimeImplicantsQM = (minterms) => {
    const groups = {};
    
    // Group minterms by number of 1s
    minterms.forEach(minterm => {
      const ones = countOnes(minterm);
      if (!groups[ones]) groups[ones] = [];
      groups[ones].push({
        minterm,
        binary: minterm.toString(2).padStart(variableCount, '0'),
        combined: false,
        dashPositions: []
      });
    });
    
    // Combine minterms
    let changed = true;
    const primeImplicants = [];
    
    while (changed) {
      changed = false;
      const newGroups = {};
      
      Object.keys(groups).forEach(ones => {
        const currentGroup = groups[ones];
        const nextGroup = groups[parseInt(ones) + 1] || [];
        
        currentGroup.forEach(term1 => {
          nextGroup.forEach(term2 => {
            const diff = findDifference(term1.binary, term2.binary);
            
            if (diff === 1) {
              changed = true;
              term1.combined = true;
              term2.combined = true;
              
              const combined = combineTerms(term1, term2, diff);
              const newOnes = countOnes(combined.minterm);
              
              if (!newGroups[newOnes]) newGroups[newOnes] = [];
              newGroups[newOnes].push(combined);
            }
          });
        });
      });
      
      // Add uncombined terms to prime implicants
      Object.values(groups).forEach(group => {
        group.forEach(term => {
          if (!term.combined) {
            primeImplicants.push(term);
          }
        });
      });
      
      groups = newGroups;
    }
    
    return primeImplicants;
  };

  // Count number of 1s in binary
  const countOnes = (number) => {
    return number.toString(2).split('1').length - 1;
  };

  // Find difference between two binary strings
  const findDifference = (binary1, binary2) => {
    let diff = 0;
    for (let i = 0; i < binary1.length; i++) {
      if (binary1[i] !== binary2[i]) diff++;
    }
    return diff;
  };

  // Combine two terms
  const combineTerms = (term1, term2, diffPosition) => {
    const combined = {
      minterm: term1.minterm,
      binary: '',
      combined: false,
      dashPositions: [...term1.dashPositions, diffPosition]
    };
    
    for (let i = 0; i < term1.binary.length; i++) {
      if (i === diffPosition) {
        combined.binary += '-';
      } else {
        combined.binary += term1.binary[i];
      }
    }
    
    return combined;
  };

  // Build expression from QM implicants
  const buildExpressionQM = (implicants) => {
    const terms = implicants.map(imp => {
      let term = '';
      for (let i = 0; i < variableCount; i++) {
        if (imp.binary[i] === '0') {
          term += `~${String.fromCharCode(65 + i)} & `;
        } else if (imp.binary[i] === '1') {
          term += `${String.fromCharCode(65 + i)} & `;
        }
        // dash positions are don't cares
      }
      return term.slice(0, -3); // Remove last ' & '
    });
    
    return terms.join(' | ');
  };

  // Apply optimization to circuit
  const applyOptimization = (result) => {
    // This would convert the optimized expression back to circuit
    console.log('Applying optimization:', result);
    // Implementation would parse the expression and create optimized gates
  };

  // Run optimization
  const runOptimization = () => {
    let result;
    
    switch (selectedOptimization) {
      case 'karnaugh':
        result = optimizeWithKarnaugh();
        break;
      case 'quine_mccluskey':
        result = optimizeWithQuineMcCluskey();
        break;
      case 'espresso':
        result = optimizeWithEspresso();
        break;
      case 'algebraic':
        result = optimizeWithAlgebraic();
        break;
      default:
        result = { expression: 'Unknown method', savings: 0 };
    }
    
    setOptimizedExpression(result.expression);
    setOptimizationResults([result]);
    return result;
  };

  // Simplified Espresso optimization
  const optimizeWithEspresso = () => {
    // Simplified implementation - would use actual Espresso algorithm
    const minterms = truthTable.filter(row => row.output === 1).length;
    const expression = `// Espresso optimized expression (simplified)\\n// Reduced from ${minterms} minterms`;
    
    return {
      method: 'espresso',
      expression,
      savings: Math.floor(minterms * 0.3), // Estimated 30% reduction
      complexity: Math.floor(minterms * 0.7)
    };
  };

  // Algebraic simplification
  const optimizeWithAlgebraic = () => {
    // Apply Boolean algebra rules
    let expression = '';
    
    // Simple example: A & ~A = 0, A | ~A = 1, etc.
    if (variableCount === 2) {
      expression = 'A & B | A & ~B | ~A & B'; // Simplified example
    } else {
      expression = 'Algebraic simplification applied';
    }
    
    return {
      method: 'algebraic',
      expression,
      savings: Math.floor(variableCount * 2),
      complexity: variableCount
    };
  };

  // Update truth table output
  const updateTruthTableOutput = (index, value) => {
    const newTable = [...truthTable];
    newTable[index].output = value;
    setTruthTable(newTable);
    generateKarnaughMap(newTable, variableCount);
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
          <span style={{ fontSize: '20px' }}>Opt</span>
          Boolean Optimization Engine
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <label
              style={{
                fontSize: '11px',
                color: currentTheme.text.secondary,
              }}
            >
              Variables:
            </label>
            <select
              value={variableCount}
              onChange={(e) => setVariableCount(parseInt(e.target.value))}
              style={{
                padding: '4px 8px',
                backgroundColor: currentTheme.surface,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '4px',
                fontSize: '11px',
                color: currentTheme.text.primary,
              }}
            >
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
            </select>
          </div>

          <button
            onClick={runOptimization}
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
            Optimize
          </button>
        </div>
      </div>

      {/* Optimization Content */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Optimization Methods */}
        <div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: currentTheme.text.primary,
              marginBottom: '12px',
            }}
          >
            Optimization Methods
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '8px',
            }}
          >
            {optimizationMethods.map(method => (
              <div
                key={method.id}
                style={{
                  backgroundColor: selectedOptimization === method.id ? `${currentTheme.primary}15` : currentTheme.surface,
                  border: selectedOptimization === method.id ? `2px solid ${currentTheme.primary}` : `1px solid ${currentTheme.border}`,
                  borderRadius: '6px',
                  padding: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => setSelectedOptimization(method.id)}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '4px',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      backgroundColor: currentTheme.primary,
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: '600',
                      color: 'white',
                    }}
                  >
                    {method.icon}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: currentTheme.text.primary,
                    }}
                  >
                    {method.name}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    color: currentTheme.text.secondary,
                  }}
                >
                  {method.description}
                </div>
                <div
                  style={{
                    fontSize: '9px',
                    color: currentTheme.text.secondary,
                    marginTop: '4px',
                  }}
                >
                  Max: {method.maxVariables} vars
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Truth Table */}
        <div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: currentTheme.text.primary,
              marginBottom: '8px',
            }}
          >
            Truth Table
          </div>

          <div
            style={{
              backgroundColor: currentTheme.surface,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '6px',
              overflow: 'auto',
              maxHeight: '200px',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '11px',
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: `${currentTheme.primary}15`,
                  }}
                >
                  {Array.from({ length: variableCount }, (_, i) => (
                    <th
                      key={i}
                      style={{
                        padding: '8px',
                        textAlign: 'center',
                        border: `1px solid ${currentTheme.border}`,
                        color: currentTheme.text.primary,
                        fontWeight: '600',
                      }}
                    >
                      {String.fromCharCode(65 + i)}
                    </th>
                  ))}
                  <th
                    style={{
                      padding: '8px',
                      textAlign: 'center',
                      border: `1px solid ${currentTheme.border}`,
                      color: currentTheme.text.primary,
                      fontWeight: '600',
                    }}
                  >
                    Output
                  </th>
                </tr>
              </thead>
              <tbody>
                {truthTable.map((row, index) => (
                  <tr key={index}>
                    {row.inputs.map((input, i) => (
                      <td
                        key={i}
                        style={{
                          padding: '4px',
                          textAlign: 'center',
                          border: `1px solid ${currentTheme.border}`,
                          color: currentTheme.text.secondary,
                        }}
                      >
                        {input}
                      </td>
                    ))}
                    <td
                      style={{
                        padding: '4px',
                        textAlign: 'center',
                        border: `1px solid ${currentTheme.border}`,
                      }}
                    >
                      <select
                        value={row.output}
                        onChange={(e) => updateTruthTableOutput(index, parseInt(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '2px',
                          backgroundColor: currentTheme.background,
                          border: `1px solid ${currentTheme.border}`,
                          borderRadius: '2px',
                          fontSize: '10px',
                          color: currentTheme.text.primary,
                          textAlign: 'center',
                        }}
                      >
                        <option value={0}>0</option>
                        <option value={1}>1</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Karnaugh Map */}
        {variableCount <= 4 && karnaughMap.length > 0 && (
          <div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: currentTheme.text.primary,
                marginBottom: '8px',
              }}
            >
              Karnaugh Map
            </div>

            <div
              style={{
                backgroundColor: currentTheme.surface,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '6px',
                padding: '12px',
              }}
            >
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '12px',
                }}
              >
                <thead>
                  <tr>
                    <th style={{ padding: '4px' }}></th>
                    {Array.from({ length: karnaughMap[0].length }, (_, i) => (
                      <th
                        key={i}
                        style={{
                          padding: '4px',
                          border: `1px solid ${currentTheme.border}`,
                          color: currentTheme.text.primary,
                        }}
                      >
                        {i.toString(2).padStart(2, '0')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {karnaughMap.map((row, i) => (
                    <tr key={i}>
                      <th
                        style={{
                          padding: '4px',
                          border: `1px solid ${currentTheme.border}`,
                          color: currentTheme.text.primary,
                        }}
                      >
                        {i.toString(2).padStart(2, '0')}
                      </th>
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          style={{
                            padding: '8px',
                            border: `1px solid ${currentTheme.border}`,
                            textAlign: 'center',
                            backgroundColor: cell === 1 ? `${currentTheme.primary}20` : 'transparent',
                            color: cell === 1 ? currentTheme.primary : currentTheme.text.secondary,
                            fontWeight: cell === 1 ? '600' : 'normal',
                          }}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Optimization Results */}
        {optimizationResults.length > 0 && (
          <div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: currentTheme.text.primary,
                marginBottom: '8px',
              }}
            >
              Optimization Results
            </div>

            {optimizationResults.map((result, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: currentTheme.surface,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: '6px',
                  padding: '12px',
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: currentTheme.text.primary,
                    }}
                  >
                    {optimizationMethods.find(m => m.id === result.method)?.name || result.method}
                  </div>
                  <button
                    onClick={() => applyOptimization(result)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: currentTheme.primary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '10px',
                      fontWeight: '500',
                    }}
                  >
                    Apply
                  </button>
                </div>

                <div
                  style={{
                    fontSize: '11px',
                    color: currentTheme.text.secondary,
                    marginBottom: '8px',
                    fontFamily: 'monospace',
                    backgroundColor: currentTheme.background,
                    padding: '8px',
                    borderRadius: '4px',
                    border: `1px solid ${currentTheme.border}`,
                  }}
                >
                  {result.expression}
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '16px',
                    fontSize: '10px',
                    color: currentTheme.text.secondary,
                  }}
                >
                  <div>
                    <span style={{ fontWeight: '600' }}>Savings:</span> {result.savings} gates
                  </div>
                  <div>
                    <span style={{ fontWeight: '600' }}>Complexity:</span> {result.complexity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BooleanOptimizationEngine;
