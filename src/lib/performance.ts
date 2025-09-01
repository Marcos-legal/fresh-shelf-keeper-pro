import React from 'react';

// Performance monitoring utilities

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private startTimes: Map<string, number> = new Map();

  start(name: string, metadata?: Record<string, any>): void {
    this.startTimes.set(name, performance.now());
    
    if (metadata) {
      console.log(`🚀 Starting ${name}`, metadata);
    }
  }

  end(name: string, metadata?: Record<string, any>): PerformanceMetric | null {
    const startTime = this.startTimes.get(name);
    
    if (!startTime) {
      console.warn(`⚠️ No start time found for ${name}`);
      return null;
    }

    const duration = performance.now() - startTime;
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      metadata
    };

    this.metrics.push(metric);
    this.startTimes.delete(name);

    // Log performance in development
    if (process.env.NODE_ENV === 'development') {
      const color = duration > 1000 ? '🔴' : duration > 500 ? '🟡' : '🟢';
      console.log(`${color} ${name}: ${duration.toFixed(2)}ms`, metadata);
    }

    return metric;
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  getAverageByName(name: string): number {
    const nameMetrics = this.metrics.filter(m => m.name === name);
    if (nameMetrics.length === 0) return 0;
    
    const total = nameMetrics.reduce((sum, m) => sum + m.duration, 0);
    return total / nameMetrics.length;
  }

  getSlowestMetrics(limit = 10): PerformanceMetric[] {
    return [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }
}

export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const startMeasure = (name: string, metadata?: Record<string, any>) => {
    performanceMonitor.start(name, metadata);
  };

  const endMeasure = (name: string, metadata?: Record<string, any>) => {
    return performanceMonitor.end(name, metadata);
  };

  const measureAsync = async <T>(
    name: string, 
    asyncFn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> => {
    startMeasure(name, metadata);
    try {
      const result = await asyncFn();
      endMeasure(name, { ...metadata, success: true });
      return result;
    } catch (error) {
      endMeasure(name, { ...metadata, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  };

  return {
    startMeasure,
    endMeasure,
    measureAsync,
    getMetrics: () => performanceMonitor.getMetrics(),
    clearMetrics: () => performanceMonitor.clearMetrics(),
    getAverageByName: (name: string) => performanceMonitor.getAverageByName(name),
    getSlowestMetrics: (limit?: number) => performanceMonitor.getSlowestMetrics(limit)
  };
}

// Decorator for measuring function performance
export function measure(name?: string) {
  return function <T extends (...args: any[]) => any>(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const originalMethod = descriptor.value;
    const measureName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = function (this: any, ...args: any[]) {
      performanceMonitor.start(measureName);
      try {
        const result = originalMethod?.apply(this, args);
        
        if (result instanceof Promise) {
          return result.finally(() => {
            performanceMonitor.end(measureName);
          });
        } else {
          performanceMonitor.end(measureName);
          return result;
        }
      } catch (error) {
        performanceMonitor.end(measureName, { error: true });
        throw error;
      }
    } as T;

    return descriptor;
  };
}

// Utility to measure component render time
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const WrappedComponent = (props: P) => {
    const name = componentName || Component.displayName || Component.name;
    
    React.useEffect(() => {
      performanceMonitor.start(`${name}.render`);
      return () => {
        performanceMonitor.end(`${name}.render`);
      };
    });

    return React.createElement(Component, props);
  };

  WrappedComponent.displayName = `withPerformanceMonitoring(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}