import { Switch, Route, Router as WouterRouter } from "wouter";
import { Component, ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WalletProvider } from "@/contexts/WalletContext";
import { ContractProvider } from "@/contexts/ContractContext";

import Home from "@/pages/Home";
import Litepaper from "@/pages/Litepaper";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: string }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: "" };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ background: "#09090B", color: "#fff", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", flexDirection: "column", gap: 16 }}>
          <div style={{ color: "#FAFF00", fontSize: 24 }}>BEACON</div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Something went wrong</div>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{this.state.error}</div>
          <button onClick={() => window.location.reload()} style={{ background: "#FAFF00", color: "#000", padding: "8px 24px", border: "none", cursor: "pointer", fontFamily: "monospace", marginTop: 8 }}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/litepaper" component={Litepaper} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <WalletProvider>
          <ContractProvider>
            <WouterRouter base="">
              <Router />
            </WouterRouter>
            <Toaster />
          </ContractProvider>
        </WalletProvider>
      </TooltipProvider>
    </ErrorBoundary>
  );
}

export default App;
