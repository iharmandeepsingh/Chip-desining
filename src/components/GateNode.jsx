import React from "react";
import { Handle, Position } from "reactflow";
import { useTheme } from "../contexts/ThemeContext";
import GateTooltip from "./GateTooltip";

const GateNode = ({ data, onChange }) => {
  const { currentTheme } = useTheme();
  const { label, value, id } = data;

  // Gate-specific styling
  const getGateStyle = (label) => {
    const baseStyle = {
      padding: "10px 15px",
      borderRadius: "8px",
      border: "2px solid",
      fontSize: "14px",
      fontWeight: "bold",
      minWidth: "60px",
      textAlign: "center",
      cursor: label === "INPUT" ? "pointer" : "default",
      transition: "all 0.2s ease",
      color: "white",
    };

    switch (label) {
      case "INPUT":
        return {
          ...baseStyle,
          backgroundColor: currentTheme.gateColors.INPUT,
          borderColor: currentTheme.gateColors.INPUT,
        };
      case "AND":
        return {
          ...baseStyle,
          backgroundColor: currentTheme.gateColors.AND,
          borderColor: currentTheme.gateColors.AND,
        };
      case "OR":
        return {
          ...baseStyle,
          backgroundColor: currentTheme.gateColors.OR,
          borderColor: currentTheme.gateColors.OR,
        };
      case "NOT":
        return {
          ...baseStyle,
          backgroundColor: currentTheme.gateColors.NOT,
          borderColor: currentTheme.gateColors.NOT,
        };
      case "OUTPUT":
        return {
          ...baseStyle,
          backgroundColor: currentTheme.gateColors.OUTPUT,
          borderColor: currentTheme.gateColors.OUTPUT,
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: "#666",
          borderColor: "#666",
        };
    }
  };

  const handleToggle = () => {
    if (label === "INPUT" && onChange) {
      onChange(id);
    }
  };

  return (
    <GateTooltip gateType={label}>
      <div style={{ position: "relative" }}>
        {/* Input handles */}
        {label !== "INPUT" && (
          <Handle
            type="target"
            position={Position.Left}
            style={{
              background: currentTheme.gateColors[label] || "#666",
              width: 10,
              height: 10,
              border: `2px solid ${currentTheme.gateColors[label] || "#666"}`,
            }}
          />
        )}

        {/* Gate body */}
        <div
          style={getGateStyle(label)}
          onClick={handleToggle}
          title={`${label} Gate - ${value ? "ON (1)" : "OFF (0)"} - Hover for Details`}
        >
          {label}
          {label === "INPUT" && (
            <span
              style={{
                marginLeft: "8px",
                fontSize: "12px",
                opacity: value ? 1 : 0.3,
              }}
            >
              {value ? "●" : "○"}
            </span>
          )}
          {label !== "INPUT" && (
            <span
              style={{
                marginLeft: "8px",
                fontSize: "12px",
                opacity: value ? 1 : 0.3,
              }}
            >
              {value ? "●" : "○"}
            </span>
          )}
        </div>

        {/* Output handle */}
        {label !== "OUTPUT" && (
          <Handle
            type="source"
            position={Position.Right}
            style={{
              background: currentTheme.gateColors[label] || "#666",
              width: 10,
              height: 10,
              border: `2px solid ${currentTheme.gateColors[label] || "#666"}`,
            }}
          />
        )}
      </div>
    </GateTooltip>
  );
};

export default GateNode;