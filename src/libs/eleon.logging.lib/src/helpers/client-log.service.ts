

import { HttpError } from '@microsoft/signalr'
import { ErrorHandlingLevel } from '@eleon/contracts.lib';
// import { getOidcUserProfile } from '../../services'

function levelToString(level: ErrorHandlingLevel): string {
  switch (level) {
    case ErrorHandlingLevel.Debug:
      return 'DEBUG';
    case ErrorHandlingLevel.Critical:
      return 'CRITICAL';
    case ErrorHandlingLevel.Error:
      return 'ERROR';
    default:
      return 'UNKNOWN';
  }
}

function parseConsoleMessage(level: ErrorHandlingLevel, args: unknown[]): string {
  if (args.length === 0) {
    return levelToString(level) + ': Empty message';
  }

  // First, try to find an HttpError in the arguments
  const httpError = args.find(arg => arg instanceof HttpError) as HttpError;
  if (httpError) {
    return `${levelToString(level)}: HttpError - Status Code: ${httpError.statusCode}, Message: ${httpError.message}`;
  }

  // If no HttpError found, try to find any Error in the arguments
  const error = args.find(arg => arg instanceof Error) as Error;
  if (error) {
    return `${levelToString(level)}: ${error.message}`;
  }

  // If no errors found, use the first argument
  const firstArg = args[0];
  if (typeof firstArg === 'string') {
    return `${levelToString(level)}: ${firstArg}`;
  }

  if (firstArg === null || firstArg === undefined) {
    return levelToString(level) + ': Empty message';
  }

  let msg = '';

  try{
    msg = JSON.stringify(firstArg);
  }
  catch{
    msg = String(firstArg);
  }

  return `${levelToString(level)}: ${msg}`;
}

function calculateLogHash(message: string, level: ErrorHandlingLevel, source?: string): string {
  const hashInput = `${message}|${level}|${source || ''}`;
  // Simple hash function - for production, consider using a proper hash library
  let hash = 0;
  for (let i = 0; i < hashInput.length; i++) {
    const char = hashInput.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

const sessionId = crypto.randomUUID();
let storedUser: { userId: string; userName: string, sessionId: string } | null = null;
function getUser(){
  if (storedUser){
    return storedUser;
  }

  // const profile = getOidcUserProfile();
  // if (profile){
  //   storedUser = {
  //     userId: profile.sub || '',
  //     userName: profile.name || '',
  //     sessionId: profile.session_state || sessionId,
  //   };
  // }

  return storedUser;
}

function getBrowserInfo(): string {
  try{
    return navigator.userAgent;
  }
  catch{
    return 'Unknown';
  }
}

function tryGetError(...args: unknown[]): Error | null {
  for (const arg of args) {
    if (arg instanceof Error) {
      return arg;
    }
  }
  return null;
}

let writeBlocker = false;
function writeFromConsole(service: ClientLogService, level: ErrorHandlingLevel, ...args: unknown[]): void {
  if (writeBlocker) return;

  writeBlocker = true;
  try{
    const user = getUser();

    service.write(
      parseConsoleMessage(level, args),
      level,
      tryGetError(...args) || undefined,
      { ...args, argsCount: args?.length || 0, browserInfo: getBrowserInfo(), sessionId: user?.sessionId || '', userName: user?.userName || '', userId: user?.userId || '' }, // todo write user, session
      'console'
    );
  }
  catch (logError) {
    console.warn('Failed to write to ClientLogService:', logError);
  }
  finally{
    writeBlocker = false;
  }
}

export interface ClientLogEntry {
  id: string;
  message: string;
  level: ErrorHandlingLevel;
  timestamp: string;
  trace?: string;
  context?: Record<string, unknown>;
  source?: string;
  count: number;
  hash: string;
}

export class ClientLogService {
  private logs: ClientLogEntry[] = [];
  private subscribers: Array<(log: ClientLogEntry) => void> = [];
  private maxLogs = 50; // Prevent memory leaks by limiting stored logs

  static Instance = new ClientLogService();


  static initialize(service: ClientLogService = ClientLogService.Instance): void {
    const originalConsole = {
      log: console.log.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
      info: console.info.bind(console),
      debug: console.debug.bind(console)
    };


    console.error = function(...args: unknown[]) {
      originalConsole.error(...args);
      writeFromConsole(service, ErrorHandlingLevel.Critical, ...args);
    };

    // console.warn = function(...args: unknown[]) {
    //   originalConsole.warn(...args);
    //   writeFromConsole(service, ErrorHandlingLevel.Error, ...args);
    // };

    console.info = function(...args: unknown[]) {
      originalConsole.info(...args);
      writeFromConsole(service, ErrorHandlingLevel.Debug, ...args);
    };

    console.log = function(...args: unknown[]) {
      originalConsole.log(...args);
      writeFromConsole(service, ErrorHandlingLevel.Debug, ...args);
    };

    // console.debug = function(...args: unknown[]) {
    //   originalConsole.debug(...args);
    //   writeFromConsole(service, ErrorHandlingLevel.Debug, ...args);
    // };

  }

  constructor() {
    ClientLogService.initialize(this);
  }

  /**
   * Write a new log entry
   */
  write(
    message: string, 
    level: ErrorHandlingLevel = ErrorHandlingLevel.Debug,
    error?: Error,
    context?: Record<string, unknown>,
    source?: string
  ): void {
    const hash = calculateLogHash(message, level, source);
    
    // Find existing log entry with the same hash
    const existingLogIndex = this.logs.findIndex(log => log.hash === hash);
    
    if (existingLogIndex !== -1) {
      // Found existing log, update it and move to start
      const existingLog = this.logs[existingLogIndex];
      
      // Remove from current position
      this.logs.splice(existingLogIndex, 1);
      
      // Update the existing log entry
      existingLog.timestamp = new Date().toISOString();
      existingLog.count++;
      
      // Update context if provided
      if (context) {
        existingLog.context = {
          ...existingLog.context,
          ...context,
          errorName: error?.name,
          errorMessage: error?.message
        };
      }
      
      // Update trace if error level
      if (level >= ErrorHandlingLevel.Error) {
        existingLog.trace = error?.stack || new Error().stack;
      }
      
      // Add to start of array
      this.logs.unshift(existingLog);
      
      // Notify subscribers of the updated entry
      this.notifySubscribers(existingLog);
      return;
    }

    // Create new log entry if no duplicate found
    const logEntry: ClientLogEntry = {
      id: this.generateId(),
      message,
      level,
      timestamp: new Date().toISOString(),
      trace: level >= ErrorHandlingLevel.Error ? (error?.stack || new Error().stack) : undefined,
      context: {
        ...context,
        errorName: error?.name,
        errorMessage: error?.message
      },
      source,
      count: 1,
      hash
    };

    this.addLog(logEntry);
  }

  /**
   * Subscribe to new log entries
   */
  subscribe(callback: (log: ClientLogEntry) => void): () => void {
    this.subscribers.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Get all logs or filter by level
   */
  get(minLevel?: ErrorHandlingLevel): ClientLogEntry[] {
    if (minLevel === undefined) {
      return [...this.logs];
    }

    return this.logs.filter(log => log.level >= minLevel);
  }

  /**
   * Get logs filtered by minimum level and search query
   */
  getByFilter(options?: {
    minLevel?: ErrorHandlingLevel;
    searchQuery?: string;
    source?: string;
    startDate?: Date;
    endDate?: Date;
  }): ClientLogEntry[];
  
  /**
   * Get logs filtered by minimum level and search query (simplified overload)
   */
  getByFilter(minLevel?: ErrorHandlingLevel, searchQuery?: string): ClientLogEntry[];
  
  /**
   * Implementation of getByFilter
   */
  getByFilter(
    optionsOrMinLevel?: { minLevel?: ErrorHandlingLevel; searchQuery?: string; source?: string; startDate?: Date; endDate?: Date; } | ErrorHandlingLevel,
    searchQuery?: string
  ): ClientLogEntry[] {
    let options: { minLevel?: ErrorHandlingLevel; searchQuery?: string; source?: string; startDate?: Date; endDate?: Date; } | undefined;

    // Handle both overloads
    if (typeof optionsOrMinLevel === 'object') {
      options = optionsOrMinLevel;
    } else if (optionsOrMinLevel !== undefined || searchQuery !== undefined) {
      options = {
        minLevel: optionsOrMinLevel as ErrorHandlingLevel,
        searchQuery
      };
    }

    if (!options) {
      return [...this.logs];
    }

    const { minLevel, searchQuery: query, source, startDate, endDate } = options;

    return this.logs
      .filter(log => {
        // Filter by minimum level
        if (minLevel !== undefined && log.level < minLevel) {
          return false;
        }

        // Filter by search query (searches in message, source, and context)
        if (query) {
          const searchTerm = query.toLowerCase();
          const messageMatch = log.message.toLowerCase().includes(searchTerm);
          const sourceMatch = log.source?.toLowerCase().includes(searchTerm) || false;
          
          if (!messageMatch && !sourceMatch) {
            return false;
          }
        }

        // Filter by source
        if (source && log.source !== source) {
          return false;
        }

        // Filter by date range
        if (startDate && new Date(log.timestamp) < startDate) {
          return false;
        }

        if (endDate && new Date(log.timestamp) > endDate) {
          return false;
        }

        return true;
      });
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.logs = [];
  }

  /**
   * Set maximum number of logs to keep in memory
   */
  setMaxLogs(maxLogs: number): void {
    this.maxLogs = maxLogs;
    this.trimLogs();
  }

  private addLog(logEntry: ClientLogEntry): void {
    this.logs.unshift(logEntry); // Add to start of array
    this.trimLogs();
    this.notifySubscribers(logEntry);
  }

  private trimLogs(): void {
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs); // Keep first maxLogs entries, remove from end
    }
  }

  private notifySubscribers(logEntry: ClientLogEntry): void {
    this.subscribers.forEach(callback => {
      try {
        callback(logEntry);
      } catch (error) {
        console.error('Error in log subscriber callback:', error);
      }
    });
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}