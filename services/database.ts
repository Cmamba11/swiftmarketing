
/**
 * SWIFT PLASTICS - EXTERNAL DATABASE CLIENT (NEON POSTGRES)
 * This client is now configured to interface with the Neon DB instance.
 */

const IS_PROD = typeof window !== 'undefined' && window.location.hostname !== 'localhost';

// Configuration for External DB - Pointing to the provided Neon PostgreSQL URI
const CONFIG = {
  // Real browsers require an API intermediary. This URL represents your backend project.
  API_URL: process.env.API_BASE_URL || 'https://api.swift-plastics-backend.vercel.app', 
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
    return CONFIG.DATABASE_URI;
  }

  /**
   * Core Fetch Wrapper - Prepared for the backend API linked to Neon
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    if (this.mode === 'SIMULATION') return null;

    try {
      const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-Database-Target': 'Neon-Postgres',
          ...options.headers,
        },
      });
      if (!response.ok) throw new Error(`DB_ERROR: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.warn("Neon Cloud Sync Pending. Ensure backend is deployed to handle Postgres traffic.");
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
