import pluginManager from './PluginManager.js';
import SequentialCircuitPlugin from './SequentialCircuitPlugin.js';
import AICircuitPlugin from './AICircuitPlugin.js';

class PluginLoader {
  constructor() {
    this.loadedPlugins = new Map();
    this.initializeDefaultPlugins();
  }

  // Initialize default plugins
  initializeDefaultPlugins() {
    try {
      // Register sequential circuits plugin
      const sequentialRegistered = pluginManager.registerPlugin(SequentialCircuitPlugin);
      if (sequentialRegistered) {
        this.loadedPlugins.set('Sequential Circuits', SequentialCircuitPlugin);
        console.log('Sequential Circuits plugin loaded successfully');
      }

      // Register AI circuit plugin
      const aiRegistered = pluginManager.registerPlugin(AICircuitPlugin);
      if (aiRegistered) {
        this.loadedPlugins.set('AI Circuit Generator', AICircuitPlugin);
        console.log('AI Circuit Generator plugin loaded successfully');
      }

      // Initialize plugin state
      this.initializePluginStates();
    } catch (error) {
      console.error('Failed to initialize default plugins:', error);
    }
  }

  // Initialize plugin states
  initializePluginStates() {
    // Set default simulation engine
    this.setSimulationEngine('default');
    
    // Set default validator
    this.setValidator('default');
    
    // Set default exporter
    this.setExporter('default');
  }

  // Load external plugin from URL or file
  async loadExternalPlugin(pluginUrl) {
    try {
      const response = await fetch(pluginUrl);
      const pluginCode = await response.text();
      
      // Create plugin object from code
      const pluginFunction = new Function('return ' + pluginCode)();
      const plugin = pluginFunction();
      
      // Validate and register plugin
      if (pluginManager.registerPlugin(plugin)) {
        this.loadedPlugins.set(plugin.name, plugin);
        console.log(`External plugin loaded: ${plugin.name}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Failed to load external plugin from ${pluginUrl}:`, error);
      return false;
    }
  }

  // Unload plugin
  unloadPlugin(pluginName) {
    const plugin = this.loadedPlugins.get(pluginName);
    if (!plugin) return false;

    // Unregister from plugin manager
    pluginManager.unregisterPlugin(pluginName);
    
    // Remove from loaded plugins
    this.loadedPlugins.delete(pluginName);
    
    console.log(`Plugin unloaded: ${pluginName}`);
    return true;
  }

  // Get all loaded plugins
  getLoadedPlugins() {
    return Array.from(this.loadedPlugins.entries()).map(([name, plugin]) => ({
      name,
      version: plugin.version,
      type: plugin.type,
      description: plugin.description,
      loaded: true
    }));
  }

  // Get plugin by name
  getPlugin(pluginName) {
    return this.loadedPlugins.get(pluginName);
  }

  // Set simulation engine
  setSimulationEngine(engineName) {
    const engine = pluginManager.getSimulationEngine(engineName);
    if (engine) {
      this.currentSimulationEngine = engineName;
      console.log(`Simulation engine set to: ${engineName}`);
      return true;
    }
    return false;
  }

  // Set validator
  setValidator(validatorName) {
    const validator = pluginManager.getValidator(validatorName);
    if (validator) {
      this.currentValidator = validatorName;
      console.log(`Validator set to: ${validatorName}`);
      return true;
    }
    return false;
  }

  // Set exporter
  setExporter(exporterName) {
    const exporter = pluginManager.getExporter(exporterName);
    if (exporter) {
      this.currentExporter = exporterName;
      console.log(`Exporter set to: ${exporterName}`);
      return true;
    }
    return false;
  }

  // Get current simulation engine
  getCurrentSimulationEngine() {
    return this.currentSimulationEngine || 'default';
  }

  // Get current validator
  getCurrentValidator() {
    return this.currentValidator || 'default';
  }

  // Get current exporter
  getCurrentExporter() {
    return this.currentExporter || 'default';
  }

  // Execute simulation with current engine
  simulate(circuit, options = {}) {
    const engineName = options.engine || this.getCurrentSimulationEngine();
    return pluginManager.simulate(circuit, engineName);
  }

  // Validate circuit with current validator
  validate(circuit, options = {}) {
    const validatorName = options.validator || this.getCurrentValidator();
    return pluginManager.validate(circuit, validatorName);
  }

  // Export circuit with current exporter
  export(circuit, format, options = {}) {
    const exporterName = options.exporter || this.getCurrentExporter();
    return pluginManager.export(circuit, exporterName, format);
  }

  // Generate circuit from AI
  generateCircuit(description, options = {}) {
    const aiPlugin = this.getPlugin('AI Circuit Generator');
    if (!aiPlugin) {
      throw new Error('AI Circuit Generator plugin not loaded');
    }

    return aiPlugin.simulationEngine.generateCircuit(description);
  }

  // Get available gate types from all plugins
  getAvailableGateTypes() {
    const gateTypes = pluginManager.getGateTypes();
    
    // Add standard gate types
    const standardGates = [
      { type: 'INPUT', name: 'Input', category: 'basic', compute: (inputs) => inputs.A || false },
      { type: 'OUTPUT', name: 'Output', category: 'basic', compute: (inputs) => inputs.A || false },
      { type: 'AND', name: 'AND Gate', category: 'basic', compute: (inputs) => (inputs.A && inputs.B) },
      { type: 'OR', name: 'OR Gate', category: 'basic', compute: (inputs) => (inputs.A || inputs.B) },
      { type: 'NOT', name: 'NOT Gate', category: 'basic', compute: (inputs) => !inputs.A }
    ];

    return [...standardGates, ...gateTypes];
  }

  // Get available simulation engines
  getAvailableSimulationEngines() {
    return pluginManager.getSimulationEngines();
  }

  // Get available validators
  getAvailableValidators() {
    return pluginManager.getValidators();
  }

  // Get available exporters
  getAvailableExporters() {
    return pluginManager.getExporters();
  }

  // Create plugin management interface
  createPluginInterface() {
    return {
      // Plugin management
      loadPlugin: (pluginUrl) => this.loadExternalPlugin(pluginUrl),
      unloadPlugin: (pluginName) => this.unloadPlugin(pluginName),
      getLoadedPlugins: () => this.getLoadedPlugins(),
      
      // Engine management
      setSimulationEngine: (engineName) => this.setSimulationEngine(engineName),
      setValidator: (validatorName) => this.setValidator(validatorName),
      setExporter: (exporterName) => this.setExporter(exporterName),
      
      // Current state
      getCurrentSimulationEngine: () => this.getCurrentSimulationEngine(),
      getCurrentValidator: () => this.getCurrentValidator(),
      getCurrentExporter: () => this.getCurrentExporter(),
      
      // Available options
      getAvailableGateTypes: () => this.getAvailableGateTypes(),
      getAvailableSimulationEngines: () => this.getAvailableSimulationEngines(),
      getAvailableValidators: () => this.getAvailableValidators(),
      getAvailableExporters: () => this.getAvailableExporters(),
      
      // Core functionality
      simulate: (circuit, options) => this.simulate(circuit, options),
      validate: (circuit, options) => this.validate(circuit, options),
      export: (circuit, format, options) => this.export(circuit, format, options),
      generateCircuit: (description, options) => this.generateCircuit(description, options)
    };
  }
}

// Singleton instance
const pluginLoader = new PluginLoader();

export default pluginLoader;
