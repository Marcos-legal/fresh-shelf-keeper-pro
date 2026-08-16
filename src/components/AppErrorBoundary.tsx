import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends React.Component<
  React.PropsWithChildren,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Falha inesperada na interface:", error, info.componentStack);
  }

  private reload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <section className="w-full max-w-md space-y-5 rounded-lg border bg-card p-6 text-center shadow-sm">
          <AlertTriangle className="mx-auto h-10 w-10 text-destructive" aria-hidden="true" />
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-foreground">Não foi possível exibir esta tela</h1>
            <p className="text-sm text-muted-foreground">
              O sistema encontrou uma falha temporária. Recarregue para continuar com segurança.
            </p>
          </div>
          <Button onClick={this.reload} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
            Recarregar sistema
          </Button>
        </section>
      </main>
    );
  }
}