import AsyncStorage from '@react-native-async-storage/async-storage';

const LOG_KEY = '@app_logs';
const MAX_LOGS = 1000;

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  details?: any;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private async persistLogs() {
    try {
      // Keep only last MAX_LOGS entries
      if (this.logs.length > MAX_LOGS) {
        this.logs = this.logs.slice(-MAX_LOGS);
      }
      await AsyncStorage.setItem(LOG_KEY, JSON.stringify(this.logs));
    } catch (error) {
      console.error('Failed to persist logs:', error);
    }
  }

  private addLog(level: LogEntry['level'], message: string, details?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      details: details ? JSON.stringify(details) : undefined
    };
    
    this.logs.push(entry);
    console[level](message, details);
    this.persistLogs();
  }

  info(message: string, details?: any) {
    this.addLog('info', message, details);
  }

  warn(message: string, details?: any) {
    this.addLog('warn', message, details);
  }

  error(message: string, details?: any) {
    this.addLog('error', message, details);
  }

  debug(message: string, details?: any) {
    this.addLog('debug', message, details);
  }

  async getLogs(): Promise<LogEntry[]> {
    try {
      const storedLogs = await AsyncStorage.getItem(LOG_KEY);
      return storedLogs ? JSON.parse(storedLogs) : [];
    } catch (error) {
      console.error('Failed to retrieve logs:', error);
      return [];
    }
  }

  async clearLogs() {
    try {
      this.logs = [];
      await AsyncStorage.removeItem(LOG_KEY);
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  }
}

export const logger = Logger.getInstance();
