
/**
 * SWIFT PLASTICS - EXTERNAL DATABASE CLIENT (NEON POSTGRES)
 * Handles the connection logic between the UI and the Express Backend.
 */

const IS_PROD = typeof window !== 'undefined' && 
  (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1');

const CONFIG = {
  // Pointing to the local server or deployed API
  API_URL: IS_PROD 
    ? 'https://your-deployed-backend-api.vercel.app' 
    : 'http://localhost:3001', 
  
  DATABASE_URI: "postgresql://neondb_owner:npg_9SkQWbjABi6o@ep-jolly-shadow-aix9j6ig-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require",
};

export class ExternalDB {
  private static instance: ExternalDB;
  private _isOnline: boolean = false;
  private _latency: number = 0;

  private constructor() {}

  public static getInstance(): ExternalDB {
    if (!ExternalDB.instance) {
      ExternalDB.instance = new ExternalDB();
    }
    return ExternalDB.instance;
  }

  public isOnline() {
    return this._isOnline;
  }

  public getLatency() {
    return this._latency;
  }

  public getTargetUri() {
    return CONFIG.DATABASE_URI.replace(/:[^:@]+@/, ":****@");
  }

  public getApiUrl() {
    return CONFIG.API_URL;
  }

  /**
   * Performs a heartbeat check against the backend.
   */
  public async checkHealth(): Promise<{ status: 'ONLINE' | 'OFFLINE'; latency: number }> {
    const start = Date.now();
    try {
      const response = await fetch(`${CONFIG.API_URL}/api/health`, { 
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        // Short timeout for health checks
        signal: AbortSignal.timeout(2000) 
      });
      
      const latency = Date.now() - start;
      if (response.ok) {
        this._isOnline = true;
        this._latency = latency;
        return { status: 'ONLINE', latency };
      }
      this._isOnline = false;
      return { status: 'OFFLINE', latency: 0 };
    } catch (e) {
      this._isOnline = false;
      return { status: 'OFFLINE', latency: 0 };
    }
  }

  /**
   * Generic Request Wrapper
   */
  public async request<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    try {
      const response = await fetch(`${CONFIG.API_URL}/api${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      if (!response.ok) throw new Error(`API_ERROR: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Backend Request Failed [${endpoint}]:`, error);
      return null;
    }
  }

  public async fetchTable<T>(tableName: string): Promise<T[] | null> {
    return this.request<T[]>(`/${tableName}`);
  }

  public async createRecord<T>(tableName: string, data: any): Promise<T | null> {
    return this.request<T>(`/${tableName}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

export const externalDb = ExternalDB.getInstance();
