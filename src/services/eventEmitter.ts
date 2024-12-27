type EventHandler = (...args: any[]) => void;

class EventEmitter {
  private listeners: { [key: string]: EventHandler[] } = {};

  on(event: string, handler: EventHandler): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(handler);
  }

  off(event: string, handler: EventHandler): void {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(h => h !== handler);
  }

  emit(event: string, ...args: any[]): void {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(handler => handler(...args));
  }
}

export const eventEmitter = new EventEmitter(); 