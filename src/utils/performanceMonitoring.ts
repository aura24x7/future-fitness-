import { InteractionManager, Platform } from 'react-native';
import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  frameTime: number;
  jsHeapSize?: number;
  nativeHeapSize?: number;
  timestamp: number;
  screenName: string;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private isMonitoring: boolean = false;
  private frameStartTime: number = 0;
  private readonly MAX_METRICS = 1000;

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMonitoring(screenName: string) {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    this.frameStartTime = Date.now();

    // Start frame monitoring
    InteractionManager.runAfterInteractions(() => {
      this.monitorFrames(screenName);
    });
  }

  stopMonitoring() {
    this.isMonitoring = false;
  }

  private monitorFrames(screenName: string) {
    if (!this.isMonitoring) return;

    const currentTime = Date.now();
    const frameTime = currentTime - this.frameStartTime;
    this.frameStartTime = currentTime;

    const metric: PerformanceMetrics = {
      frameTime,
      timestamp: currentTime,
      screenName,
    };

    // Add memory metrics if available
    if (global.performance?.memory) {
      metric.jsHeapSize = global.performance.memory.usedJSHeapSize;
      metric.nativeHeapSize = global.performance.memory.totalJSHeapSize;
    }

    this.metrics.push(metric);

    // Keep only the last MAX_METRICS entries
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Schedule next frame monitoring
    requestAnimationFrame(() => this.monitorFrames(screenName));
  }

  getMetrics(): PerformanceMetrics[] {
    return this.metrics;
  }

  getAverageFrameTime(screenName?: string): number {
    const relevantMetrics = screenName 
      ? this.metrics.filter(m => m.screenName === screenName)
      : this.metrics;

    if (relevantMetrics.length === 0) return 0;

    const sum = relevantMetrics.reduce((acc, curr) => acc + curr.frameTime, 0);
    return sum / relevantMetrics.length;
  }

  clearMetrics() {
    this.metrics = [];
  }
}

export const usePerformanceMonitoring = (screenName: string) => {
  const monitorRef = useRef<PerformanceMonitor>(PerformanceMonitor.getInstance());

  useEffect(() => {
    monitorRef.current.startMonitoring(screenName);
    return () => {
      monitorRef.current.stopMonitoring();
    };
  }, [screenName]);

  return {
    getMetrics: () => monitorRef.current.getMetrics(),
    getAverageFrameTime: () => monitorRef.current.getAverageFrameTime(screenName),
    clearMetrics: () => monitorRef.current.clearMetrics(),
  };
};

export default PerformanceMonitor; 