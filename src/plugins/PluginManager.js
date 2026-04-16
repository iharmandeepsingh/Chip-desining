class PluginManager {
  constructor() {
    this.plugins = new Map();
    this.gateTypes = new Map();
    this.simulationEngines = new Map();
    this.validators = new Map();
    this.exporters = new Map();
  }

  // Register a new plugin
  registerPlugin(plugin) {
    try {
      // Validate plugin structure
      if (!this.validatePlugin(plugin)) {
        throw new Error(`Invalid plugin: ${plugin.name}`);
      }

      // Register plugin components
      this.plugins.set(plugin.name, plugin);

      // Register gate types
      if (plugin.gateTypes) {
        plugin.gateTypes.forEach(gateType => {
          this.gateTypes.set(gateType.type, gateType);
        });
      }

      // Register simulation engines
      if (plugin.simulationEngine) {
        this.simulationEngines.set(plugin.name, plugin.simulationEngine);
      }

      // Register validators
      if (plugin.validators) {
        plugin.validators.forEach(validator => {
          this.validators.set(validator.name, validator);
        });
      }

      // Register exporters
      if (plugin.exporters) {
        plugin.exporters.forEach(exporter => {
          this.exporters.set(exporter.name, exporter);
        });
      }

      console.log(`Plugin registered: ${plugin.name}`);
      return true;
    } catch (error) {
      console.error(`Failed to register plugin ${plugin.name}:`, error);
      return false;
    }
  }

  // Unregister a plugin
  unregisterPlugin(pluginName) {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) return false;

    // Remove gate types
    if (plugin.gateTypes) {
      plugin.gateTypes.forEach(gateType => {
        this.gateTypes.delete(gateType.type);
      });
    }

    // Remove simulation engines
    if (plugin.simulationEngine) {
      this.simulationEngines.delete(pluginName);
    }

    // Remove validators
    if (plugin.validators) {
      plugin.validators.forEach(validator => {
        this.validators.delete(validator.name);
      });
    }

    // Remove exporters
    if (plugin.exporters) {
      plugin.exporters.forEach(exporter => {
        this.exporters.delete(exporter.name);
      });
    }

    this.plugins.delete(pluginName);
    console.log(`Plugin unregistered: ${pluginName}`);
    return true;
  }

  // Get all registered gate types
  getGateTypes() {
    return Array.from(this.gateTypes.values());
  }

  // Get gate type by name
  getGateType(type) {
    return this.gateTypes.get(type);
  }

  // Get all simulation engines
  getSimulationEngines() {
    return Array.from(this.simulationEngines.values());
  }

  // Get simulation engine by name
  getSimulationEngine(name) {
    return this.simulationEngines.get(name);
  }

  // Get all validators
  getValidators() {
    return Array.from(this.validators.values());
  }

  // Get validator by name
  getValidator(name) {
    return this.validators.get(name);
  }

  // Get all exporters
  getExporters() {
    return Array.from(this.exporters.values());
  }

  // Get exporter by name
  getExporter(name) {
    return this.exporters.get(name);
  }

  // Get all registered plugins
  getPlugins() {
    return Array.from(this.plugins.values());
  }

  // Validate plugin structure
  validatePlugin(plugin) {
    const requiredFields = ['name', 'version', 'type'];
    
    // Check required fields
    for (const field of requiredFields) {
      if (!plugin[field]) {
        console.error(`Plugin missing required field: ${field}`);
        return false;
      }
    }

    // Validate plugin type
    const validTypes = ['gate', 'simulation', 'validation', 'export', '综合'];
    if (!validTypes.includes(plugin.type)) {
      console.error(`Invalid plugin type: ${plugin.type}`);
      return false;
    }

    // Type-specific validation
    switch (plugin.type) {
      case 'gate':
        return this.validateGatePlugin(plugin);
      case 'simulation':
        return this.validateSimulationPlugin(plugin);
      case 'validation':
        return this.validateValidationPlugin(plugin);
      case 'export':
        return this.validateExportPlugin(plugin);
      case '综合':
        return this.validateComprehensivePlugin(plugin);
      default:
        return false;
    }
  }

  // Validate gate plugin
  validateGatePlugin(plugin) {
    if (!plugin.gateTypes || !Array.isArray(plugin.gateTypes)) {
      console.error('Gate plugin must have gateTypes array');
      return false;
    }

    for (const gateType of plugin.gateTypes) {
      if (!gateType.type || !gateType.compute || !gateType.render) {
        console.error('Gate type missing required fields: type, compute, render');
        return false;
      }
    }

    return true;
  }

  // Validate simulation plugin
  validateSimulationPlugin(plugin) {
    if (!plugin.simulationEngine || typeof plugin.simulationEngine.simulate !== 'function') {
      console.error('Simulation plugin must have simulationEngine.simulate function');
      return false;
    }

    return true;
  }

  // Validate validation plugin
  validateValidationPlugin(plugin) {
    if (!plugin.validators || !Array.isArray(plugin.validators)) {
      console.error('Validation plugin must have validators array');
      return false;
    }

    for (const validator of plugin.validators) {
      if (!validator.name || typeof validator.validate !== 'function') {
        console.error('Validator missing required fields: name, validate');
        return false;
      }
    }

    return true;
  }

  // Validate export plugin
  validateExportPlugin(plugin) {
    if (!plugin.exporters || !Array.isArray(plugin.exporters)) {
      console.error('Export plugin must have exporters array');
      return false;
    }

    for (const exporter of plugin.exporters) {
      if (!exporter.name || typeof exporter.export !== 'function') {
        console.error('Exporter missing required fields: name, export');
        return false;
      }
    }

    return true;
  }

  // Validate comprehensive plugin
  validateComprehensivePlugin(plugin) {
    // Comprehensive plugins can have multiple types of components
    let isValid = true;

    if (plugin.gateTypes) {
      isValid = isValid && this.validateGatePlugin(plugin);
    }

    if (plugin.simulationEngine) {
      isValid = isValid && this.validateSimulationPlugin(plugin);
    }

    if (plugin.validators) {
      isValid = isValid && this.validateValidationPlugin(plugin);
    }

    if (plugin.exporters) {
      isValid = isValid && this.validateExportPlugin(plugin);
    }

    return isValid;
  }

  // Execute simulation with specific engine
  simulate(circuit, engineName = 'default') {
    const engine = this.getSimulationEngine(engineName);
    if (!engine) {
      throw new Error(`Simulation engine not found: ${engineName}`);
    }

    return engine.simulate(circuit);
  }

  // Validate circuit with specific validator
  validate(circuit, validatorName = 'default') {
    const validator = this.getValidator(validatorName);
    if (!validator) {
      throw new Error(`Validator not found: ${validatorName}`);
    }

    return validator.validate(circuit);
  }

  // Export circuit with specific exporter
  export(circuit, exporterName, format) {
    const exporter = this.getExporter(exporterName);
    if (!exporter) {
      throw new Error(`Exporter not found: ${exporterName}`);
    }

    return exporter.export(circuit, format);
  }
}

// Singleton instance
const pluginManager = new PluginManager();

export default pluginManager;
