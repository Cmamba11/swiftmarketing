
/**
 * SWIFT PLASTICS - EXTERNAL DATABASE CLIENT
 * Dynamic environment detection for Hybrid Deployment.
 */

// Detect if we are in a production environment
const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');

const CONFIG = {
  // Replace this URL once you deploy your server.ts to Cloud Run or Render
  PROD_API_URL: 'https://your-backend-api-url.com', 
  DEV_API_URL: 'http://localhost:3001',
  DATABASE_URI: "postgresql://neondb_owner:npg_9SkQWbjABi6o@ep-jolly-shadow-aix9j6ig-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require",
};

export class ExternalDB {
  private static instance: ExternalDB;
  private _isOnline: boolean = false;
  private _latency: number = 0;
  private _checkInterval: number | null = null;

  private constructor() {
    this.startHeartbeat();
  }

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

  public getApiUrl() {
    return isProduction ? CONFIG.PROD_API_URL : CONFIG.DEV_API_URL;
  }

  private startHeartbeat() {
    if (this._checkInterval) return;
    this.checkHealth();
    // Check every 30 seconds
    this._checkInterval = window.setInterval(() => this.checkHealth(), 30000);
  }

  public async checkHealth(): Promise<{ status: 'ONLINE' | 'OFFLINE'; latency: number }> {
    const start = Date.now();
    const targetUrl = this.getApiUrl();
    
    try {
      const response = await fetch(`${targetUrl}/api/health`, { 
        method: 'GET',
        mode: 'cors',
        signal: AbortSignal.timeout(3000) 
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

  public async request<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    const targetUrl = this.getApiUrl();
    try {
      const response = await fetch(`${targetUrl}/api${endpoint}`, {
        ...options,
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      if (!response.ok) throw new Error(`API_ERROR: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Fetch error at ${endpoint}:`, error);
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
