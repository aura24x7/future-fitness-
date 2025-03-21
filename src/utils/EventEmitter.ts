type EventHandler = (...args: any[]) => void;

class EventEmitter {
  private listeners: { [key: string]: EventHandler[] } = {};

  addListener(eventName: string, handler: EventHandler): () => void {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(handler);
    
    return () => {
      this.listeners[eventName] = this.listeners[eventName].filter(h => h !== handler);
    };
  }

  emit(eventName: string, ...args: any[]): void {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach(handler => handler(...args));
    }
  }

  removeAllListeners(eventName: string): void {
    delete this.listeners[eventName];
  }
}

export default new EventEmitter(); 
