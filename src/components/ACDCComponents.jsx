import React from 'react';

// AC/DC Compatible Circuit Components
export const ACDCComponents = {
  // AC Power Components
  AC_VOLTAGE_SOURCE: {
    type: 'AC_VOLTAGE_SOURCE',
    label: 'AC Source',
    category: 'power',
    signalType: 'AC',
    inputs: [],
    outputs: ['Vout'],
    defaultData: {
      frequency: 50, // Hz
      amplitude: 5,   // Volts
      phase: 0,       // Degrees
      signalType: 'AC'
    }
  },

  DC_VOLTAGE_SOURCE: {
    type: 'DC_VOLTAGE_SOURCE',
    label: 'DC Source',
    category: 'power',
    signalType: 'DC',
    inputs: [],
    outputs: ['Vout'],
    defaultData: {
      voltage: 5,     // Volts
      signalType: 'DC'
    }
  },

  // AC/DC Converters
  RECTIFIER: {
    type: 'RECTIFIER',
    label: 'Rectifier',
    category: 'converter',
    signalType: 'MIXED',
    inputs: ['AC_in'],
    outputs: ['DC_out'],
    defaultData: {
      conversionType: 'full_wave',
      signalType: 'MIXED'
    }
  },

  INVERTER: {
    type: 'INVERTER',
    label: 'Inverter',
    category: 'converter',
    signalType: 'MIXED',
    inputs: ['DC_in'],
    outputs: ['AC_out'],
    defaultData: {
      frequency: 50,
      amplitude: 5,
      signalType: 'MIXED'
    }
  },

  // AC Components
  TRANSFORMER: {
    type: 'TRANSFORMER',
    label: 'Transformer',
    category: 'power',
    signalType: 'AC',
    inputs: ['Primary'],
    outputs: ['Secondary'],
    defaultData: {
      turnsRatio: 10,
      frequency: 50,
      signalType: 'AC'
    }
  },

  AC_MOTOR: {
    type: 'AC_MOTOR',
    label: 'AC Motor',
    category: 'actuator',
    signalType: 'AC',
    inputs: ['AC_in'],
    outputs: ['Rotation'],
    defaultData: {
      frequency: 50,
      powerRating: 100, // Watts
      signalType: 'AC'
    }
  },

  // DC Components
  DC_MOTOR: {
    type: 'DC_MOTOR',
    label: 'DC Motor',
    category: 'actuator',
    signalType: 'DC',
    inputs: ['DC_in'],
    outputs: ['Rotation'],
    defaultData: {
      voltage: 12,
      current: 5, // Amps
      signalType: 'DC'
    }
  },

  // Mixed Signal Components
  ADC: {
    type: 'ADC',
    label: 'ADC',
    category: 'converter',
    signalType: 'MIXED',
    inputs: ['Analog_in'],
    outputs: ['Digital_out'],
    defaultData: {
      resolution: 8,
      referenceVoltage: 5,
      signalType: 'MIXED'
    }
  },

  DAC: {
    type: 'DAC',
    label: 'DAC',
    category: 'converter',
    signalType: 'MIXED',
    inputs: ['Digital_in'],
    outputs: ['Analog_out'],
    defaultData: {
      resolution: 8,
      referenceVoltage: 5,
      signalType: 'MIXED'
    }
  },

  COMPARATOR: {
    type: 'COMPARATOR',
    label: 'Comparator',
    category: 'analog',
    signalType: 'MIXED',
    inputs: ['V+', 'V-'],
    outputs: ['Out'],
    defaultData: {
      referenceVoltage: 2.5,
      signalType: 'MIXED'
    }
  },

  // Digital Logic (DC)
  AND_GATE: {
    type: 'AND_GATE',
    label: 'AND',
    category: 'logic',
    signalType: 'DC',
    inputs: ['A', 'B'],
    outputs: ['Out'],
    defaultData: {
      signalType: 'DC'
    }
  },

  OR_GATE: {
    type: 'OR_GATE',
    label: 'OR',
    category: 'logic',
    signalType: 'DC',
    inputs: ['A', 'B'],
    outputs: ['Out'],
    defaultData: {
      signalType: 'DC'
    }
  },

  NOT_GATE: {
    type: 'NOT_GATE',
    label: 'NOT',
    category: 'logic',
    signalType: 'DC',
    inputs: ['In'],
    outputs: ['Out'],
    defaultData: {
      signalType: 'DC'
    }
  },

  // Sequential Logic (DC)
  D_FLIP_FLOP: {
    type: 'D_FLIP_FLOP',
    label: 'D-FF',
    category: 'sequential',
    signalType: 'DC',
    inputs: ['D', 'CLK'],
    outputs: ['Q', 'Q_bar'],
    defaultData: {
      signalType: 'DC',
      setupTime: 2,
      holdTime: 1,
      propagationDelay: 5
    }
  },

  JK_FLIP_FLOP: {
    type: 'JK_FLIP_FLOP',
    label: 'JK-FF',
    category: 'sequential',
    signalType: 'DC',
    inputs: ['J', 'K', 'CLK'],
    outputs: ['Q', 'Q_bar'],
    defaultData: {
      signalType: 'DC',
      setupTime: 2,
      holdTime: 1,
      propagationDelay: 8
    }
  }
};

// Signal type detection helper
export const detectSignalType = (componentType) => {
  const component = ACDCComponents[componentType];
  return component ? component.signalType : 'DC';
};

// Component compatibility checker
export const checkCompatibility = (sourceType, targetType) => {
  const source = ACDCComponents[sourceType];
  const target = ACDCComponents[targetType];
  
  if (!source || !target) return false;
  
  // AC to AC: Compatible
  if (source.signalType === 'AC' && target.signalType === 'AC') {
    return true;
  }
  
  // DC to DC: Compatible
  if (source.signalType === 'DC' && target.signalType === 'DC') {
    return true;
  }
  
  // AC to DC: Need converter
  if (source.signalType === 'AC' && target.signalType === 'DC') {
    return 'needs_rectifier';
  }
  
  // DC to AC: Need converter
  if (source.signalType === 'DC' && target.signalType === 'AC') {
    return 'needs_inverter';
  }
  
  // Mixed signals: Generally compatible
  if (source.signalType === 'MIXED' || target.signalType === 'MIXED') {
    return true;
  }
  
  return false;
};

// Get required converter between components
export const getRequiredConverter = (sourceType, targetType) => {
  const compatibility = checkCompatibility(sourceType, targetType);
  
  switch (compatibility) {
    case 'needs_rectifier':
      return 'RECTIFIER';
    case 'needs_inverter':
      return 'INVERTER';
    default:
      return null;
  }
};
