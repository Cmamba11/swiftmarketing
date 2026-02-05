
/**
 * SWIFT PLASTICS - EXTERNAL DATABASE CLIENT (NEON POSTGRES)
 * This client is now configured to interface with the Neon DB instance.
 */

const IS_PROD = typeof window !== 'undefined' && 
  (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1');

// Configuration for External DB
const CONFIG = {
  // Replace this with your actual deployed backend URL when ready
  API_URL: process.env.API_BASE_URL || 'https://your-backend-api.vercel.app', 
  // In production, the URI is managed by the backend server environment variables
  DATABASE_URI: "postgresql://neondb_owner:npg_9SkQWbjABi6o@ep-jolly-shadow-aix9j6ig-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  MODE: IS_PROD ? 'PRODUCTION' : 'SIMULATION'
};

export class ExternalDB {
  private static instance: ExternalDB;
  private mode: 'PRODUCTION' | 'SIMULATION' = CONFIG.MODE as any;

  private constructor() {}

  public static getInstance(): ExternalDB {
    if (!ExternalDB.instance) {
      ExternalDB.instance = new ExternalDB();
    }
    return ExternalDB.instance;
  }

  public getMode() {
    return this.mode;
  }

  public getTargetUri() {
    // Masking sensitive info for UI display
    return CONFIG.DATABASE_URI.replace(/:[^:@]+@/, ":****@");
  }

  /**
   * Core Fetch Wrapper
   * In a live app, the Frontend sends requests to your API project,
   * and the API project talks to the Neon PostgreSQL database.
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    if (this.mode === 'SIMULATION') return null;

    try {
      const response = await fetch(`${CONFIG.API_URL}/api${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SESSION_TOKEN || ''}`,
          ...options.headers,
        },
      });
      if (!response.ok) throw new Error(`DB_ERROR: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error("Live Cloud Error:", error);
      return null;
    }
  }

  public async fetchTable(tableName: string) {
    return this.request(`/${tableName}`);
  }

  public async createRecord(tableName: string, data: any) {
    return this.request(`/${tableName}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

export const externalDb = ExternalDB.getInstance();
