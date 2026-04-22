// Test script for Advanced AI functionality
import AdvancedAICircuitPlugin from './src/plugins/AdvancedAICircuitPlugin.js';

console.log('Testing Advanced AI Circuit Generator...');

// Initialize the system
AdvancedAICircuitPlugin.initialize();

// Test circuit generation
const testDescriptions = [
  'Create a simple adder circuit',
  'Design a memory controller',
  'Build a processor with ALU'
];

testDescriptions.forEach((description, index) => {
  console.log(`\nTest ${index + 1}: "${description}"`);
  
  try {
    const circuit = AdvancedAICircuitPlugin.generateFromDescription(description);
    console.log('Success! Generated circuit:', {
      name: circuit.name,
      type: circuit.type,
      nodes: circuit.nodes?.length || 0,
      edges: circuit.edges?.length || 0,
      confidence: circuit.confidence
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
});

console.log('\nAdvanced AI test completed!');
