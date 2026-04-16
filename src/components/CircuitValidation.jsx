import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import useCircuitValidation from '../hooks/useCircuitValidation';

const CircuitValidation = () => {
  const { currentTheme } = useTheme();
  const { validationErrors } = useCircuitValidation();

  if (!validationErrors.errors.length && !validationErrors.warnings.length) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        backgroundColor: currentTheme.surface,
        border: `2px solid ${currentTheme.border}`,
        borderRadius: '8px',
        padding: '12px',
        minWidth: '280px',
        maxWidth: '350px',
        boxShadow: `0 4px 12px ${currentTheme.shadow}`,
        zIndex: 1000,
        fontSize: '13px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '10px',
          paddingBottom: '8px',
          borderBottom: `1px solid ${currentTheme.border}`,
        }}
      >
        <div
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: validationErrors.errors.length > 0 ? currentTheme.error : currentTheme.warning,
            marginRight: '8px',
          }}
        >
          {validationErrors.errors.length > 0 ? '❌' : '⚠️'}
        </div>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: currentTheme.text.primary,
          }}
        >
          Circuit Validation
        </div>
      </div>

      {/* Summary */}
      <div
        style={{
          backgroundColor: `${currentTheme.surface}80`,
          padding: '8px',
          borderRadius: '4px',
          marginBottom: '10px',
          fontSize: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ color: currentTheme.text.secondary }}>Nodes:</span>
          <span style={{ fontWeight: 'bold', color: currentTheme.text.primary }}>
            {validationErrors.summary.totalNodes}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ color: currentTheme.text.secondary }}>Edges:</span>
          <span style={{ fontWeight: 'bold', color: currentTheme.text.primary }}>
            {validationErrors.summary.totalEdges}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: currentTheme.text.secondary }}>Issues:</span>
          <span style={{ fontWeight: 'bold', color: validationErrors.errors.length > 0 ? currentTheme.error : currentTheme.warning }}>
            {validationErrors.errors.length + validationErrors.warnings.length}
          </span>
        </div>
      </div>

      {/* Errors */}
      {validationErrors.errors.length > 0 && (
        <div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 'bold',
              color: currentTheme.error,
              marginBottom: '6px',
            }}
          >
            🚫 Errors ({validationErrors.errors.length})
          </div>
          <div
            style={{
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          >
            {validationErrors.errors.map((error, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: `${currentTheme.error}10`,
                  border: `1px solid ${currentTheme.error}`,
                  borderRadius: '4px',
                  padding: '8px',
                  marginBottom: '4px',
                  fontSize: '12px',
                }}
              >
                <div
                  style={{
                    fontWeight: 'bold',
                    marginBottom: '2px',
                    color: currentTheme.text.inverse,
                  }}
                >
                  {error.type.replace('_', ' ').toUpperCase()}
                </div>
                <div style={{ color: currentTheme.text.inverse }}>
                  {error.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {validationErrors.warnings.length > 0 && (
        <div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 'bold',
              color: currentTheme.warning,
              marginBottom: '6px',
            }}
          >
            ⚠️ Warnings ({validationErrors.warnings.length})
          </div>
          <div
            style={{
              maxHeight: '150px',
              overflowY: 'auto',
            }}
          >
            {validationErrors.warnings.map((warning, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: `${currentTheme.warning}10`,
                  border: `1px solid ${currentTheme.warning}`,
                  borderRadius: '4px',
                  padding: '8px',
                  marginBottom: '4px',
                  fontSize: '12px',
                }}
              >
                <div
                  style={{
                    fontWeight: 'bold',
                    marginBottom: '2px',
                    color: currentTheme.text.inverse,
                  }}
                >
                  {warning.type.replace('_', ' ').toUpperCase()}
                </div>
                <div style={{ color: currentTheme.text.inverse }}>
                  {warning.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status */}
      <div
        style={{
          marginTop: '10px',
          padding: '6px',
          backgroundColor: validationErrors.isValid ? `${currentTheme.success}20` : `${currentTheme.error}20`,
          borderRadius: '4px',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '12px',
          color: validationErrors.isValid ? currentTheme.success : currentTheme.error,
        }}
      >
        {validationErrors.isValid ? '✅ Circuit Valid' : '❌ Circuit Invalid'}
      </div>
    </div>
  );
};

export default CircuitValidation;
