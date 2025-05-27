
import React, { createContext, useContext, useState, useEffect } from 'react';

interface ResponsaveisContextType {
  responsaveis: string[];
  addResponsavel: (nome: string) => void;
  removeResponsavel: (nome: string) => void;
}

const ResponsaveisContext = createContext<ResponsaveisContextType | undefined>(undefined);

const RESPONSAVEIS_STORAGE_KEY = 'sistema-responsaveis';

export function ResponsaveisProvider({ children }: { children: React.ReactNode }) {
  const [responsaveis, setResponsaveis] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(RESPONSAVEIS_STORAGE_KEY);
    if (stored) {
      setResponsaveis(JSON.parse(stored));
    } else {
      // Responsáveis padrão
      const defaultResponsaveis = ['João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Oliveira'];
      setResponsaveis(defaultResponsaveis);
      localStorage.setItem(RESPONSAVEIS_STORAGE_KEY, JSON.stringify(defaultResponsaveis));
    }
  }, []);

  const addResponsavel = (nome: string) => {
    if (!responsaveis.includes(nome)) {
      const newResponsaveis = [...responsaveis, nome];
      setResponsaveis(newResponsaveis);
      localStorage.setItem(RESPONSAVEIS_STORAGE_KEY, JSON.stringify(newResponsaveis));
    }
  };

  const removeResponsavel = (nome: string) => {
    const newResponsaveis = responsaveis.filter(r => r !== nome);
    setResponsaveis(newResponsaveis);
    localStorage.setItem(RESPONSAVEIS_STORAGE_KEY, JSON.stringify(newResponsaveis));
  };

  return (
    <ResponsaveisContext.Provider value={{ responsaveis, addResponsavel, removeResponsavel }}>
      {children}
    </ResponsaveisContext.Provider>
  );
}

export function useResponsaveis() {
  const context = useContext(ResponsaveisContext);
  if (!context) {
    throw new Error('useResponsaveis deve ser usado dentro de ResponsaveisProvider');
  }
  return context;
}
