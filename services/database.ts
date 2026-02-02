
/**
 * SWIFT PLASTICS - EXTERNAL DATABASE CLIENT
 * Use this file to connect your Vercel deployment to a real DB (Postgres/Supabase/Custom API)
 */

const IS_PROD = typeof window !== 'undefined' && window.location.hostname !== 'localhost';

// Configuration for External DB - Update these in your Vercel Environment Variables
const CONFIG = {
  API_URL: process.env.DATABASE_URL || '', // Your Vercel Postgres / Supabase URL
  API_KEY: process.env.API_KEY || '',
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

  /**
   * Core Fetch Wrapper - Ready for Vercel Serverless Functions
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    if (this.mode === 'SIMULATION') return null;

    try {
      const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONFIG.API_KEY}`,
          ...options.headers,
        },
      });
      if (!response.ok) throw new Error(`DB_ERROR: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error("External DB Sync Failed:", error);
      return null;
    }
  }

  /**
   * Sync Local Data to Cloud (Used during migration or deployment)
   */
  public async syncToCloud(data: any): Promise<boolean> {
    console.log("Initiating Cloud Sync Protocol...");
    const result = await this.request('/sync', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return !!result;
  }

  /**
   * CRUD Hooks - Map these to your real backend endpoints
   */
  public async fetchTable(tableName: string) {
    return this.request(`/${tableName}`);
  }

  public async createRecord(tableName: string, data: any) {
    return this.request(`/${tableName}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async updateRecord(tableName: string, id: string, data: any) {
    return this.request(`/${tableName}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  public async deleteRecord(tableName: string, id: string) {
    return this.request(`/${tableName}/${id}`, {
      method: 'DELETE'
    });
  }
}

export const externalDb = ExternalDB.getInstance();
