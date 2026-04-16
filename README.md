# Web-Based Chip Designer & Digital Circuit Simulator

A full-stack web application that functions as a digital circuit design and simulation platform, similar to simplified Electronic Design Automation (EDA) tools like Logisim or Cadence.

## Features

### Core Functionality
- **Drag-and-drop interface** for adding logic components (INPUT, AND, OR, NOT, OUTPUT nodes)
- **Interactive wiring system** with smart connection validation
- **Real-time logic simulation** with proper signal propagation
- **Toggleable input nodes** (0/1) for dynamic circuit testing
- **Visual feedback** showing output values and signal states
- **Connection validation** preventing incorrect wiring (OUTPUT INPUT, INPUT INPUT, etc.)

### Advanced Features
- **Truth Table Generator** - Automatically generates all input-output combinations
- **Save/Load Circuit Designs** - Store and retrieve circuits locally
- **Export Functionality** - Download circuits as JSON files
- **Import Circuits** - Load circuits from JSON files
- **Verilog Export** - Generate synthesizable Verilog HDL code with testbench
- **Professional UI** - Modern, intuitive interface with color-coded components

## Technical Stack

- **Frontend**: React.js 19.2.4
- **Graph Visualization**: React Flow 11.11.4
- **State Management**: Zustand 5.0.12
- **Build Tool**: Vite 8.0.4
- **Logic Engine**: Custom-built simulation system with topological sorting

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd chip-designer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production
```bash
npm run build
```

## Usage Guide

### Building Circuits

1. **Add Components**: Click the toolbar buttons to add INPUT, AND, OR, NOT, and OUTPUT nodes
2. **Connect Nodes**: Drag from the output handle (right) of one node to the input handle (left) of another
3. **Test Circuits**: Click INPUT nodes to toggle between 0 and 1 states
4. **View Results**: Watch signals propagate through the circuit in real-time

### Connection Rules

The application enforces proper circuit design rules:
- **OUTPUT INPUT**: Cannot connect FROM an OUTPUT node
- **INPUT INPUT**: Cannot connect TO an INPUT node  
- **INPUT INPUT**: Cannot connect INPUT to INPUT
- **INPUT OUTPUT**: Must connect INPUT through a gate first

### Truth Table Generation

1. Build a circuit with at least one INPUT and one OUTPUT node
2. Click the "Generate Truth Table" button in the bottom-right corner
3. View all possible input combinations and their corresponding outputs

### Circuit Management

- **Save Circuit**: Click "Save Circuit" to store your design locally
- **Load Circuit**: Click "Load Circuit" to retrieve previously saved designs
- **Export**: Download your circuit as a JSON file for sharing
- **Import**: Load circuits from JSON files
- **Export Verilog**: Generate synthesizable Verilog HDL code

### Verilog Export

The Verilog export feature generates:
- **Module definition** with proper port declarations
- **Gate instantiations** (and, or, not primitives)
- **Testbench** with automated stimulus generation
- **Waveform monitoring** for simulation verification

## Architecture

### Signal Propagation System

The application uses a **topological sorting algorithm** to ensure proper signal propagation order:

1. **Dependency Analysis**: Builds a directed graph of node dependencies
2. **Topological Sort**: Orders nodes from inputs to outputs
3. **Sequential Evaluation**: Computes values in dependency order
4. **Real-time Updates**: Propagates changes through the circuit

### State Management

Uses **Zustand** for centralized state management:
- **Circuit Store**: Manages nodes, edges, and simulation state
- **Actions**: Provides methods for adding/removing components and connections
- **Computed Values**: Handles logic evaluation and signal propagation

### Component Architecture

- **App.jsx**: Main application wrapper with ReactFlowProvider
- **CircuitBoard.jsx**: Main canvas component with toolbar and ReactFlow integration
- **GateNode.jsx**: Individual logic gate component with visual feedback
- **TruthTable.jsx**: Truth table generation and display
- **CircuitManager.jsx**: Save/load/export functionality
- **Verilog Generator**: Utility for HDL code generation

## Educational Value

This platform serves as an excellent learning tool for:

- **Digital Logic Fundamentals**: Understanding basic logic gates
- **Circuit Design**: Learning how to combine gates for complex functions
- **Signal Flow**: Visualizing how signals propagate through circuits
- **Hardware Description**: Introduction to Verilog HDL
- **EDA Tools**: Experience with professional circuit design concepts

## Future Enhancements

Planned features for future versions:

- **Multi-layer Circuit Support**: Hierarchical design capabilities
- **Timing Simulation**: Clock-based circuits and sequential logic
- **Advanced Gates**: XOR, XNOR, NAND, NOR gates
- **Component Library**: Flip-flops, multiplexers, decoders
- **Simulation Speed Control**: Adjustable propagation delays
- **Collaboration Features**: Multi-user editing capabilities
- **AI Assistance**: Intelligent circuit design suggestions
- **Waveform Viewer**: Professional timing diagram display

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **React Flow**: Excellent graph visualization library
- **Zustand**: Lightweight state management solution
- **Vite**: Fast and modern build tool
- **Digital Logic Community**: For inspiration and feedback
