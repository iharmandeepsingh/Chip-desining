import React from "react";
import { ReactFlowProvider } from "reactflow";
import { ThemeProvider } from "./contexts/ThemeContext";
import PremiumMainLayout from "./components/Layout/PremiumMainLayout";
import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <ReactFlowProvider>
        <PremiumMainLayout />
      </ReactFlowProvider>
    </ThemeProvider>
  );
}

export default App;