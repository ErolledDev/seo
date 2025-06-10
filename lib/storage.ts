interface StorageData {
  redirects: any[];
  lastUpdated: string;
}

export class CloudStorage {
  private static readonly API_BASE = 'https://api.jsonbin.io/v3';
  private static readonly API_KEY = process.env.JSONBIN_API_KEY;
  private static readonly BIN_ID = process.env.JSONBIN_BIN_ID;

  static isConfigured(): boolean {
    return !!(this.API_KEY && this.BIN_ID);
  }

  static async readData(): Promise<StorageData | null> {
    try {
      if (!this.isConfigured()) {
        console.warn('JSONBin credentials not configured, using local storage');
        return null;
      }

      const response = await fetch(`${this.API_BASE}/b/${this.BIN_ID}/latest`, {
        method: 'GET',
        headers: {
          'X-Master-Key': this.API_KEY!,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.record;
    } catch (error) {
      console.error('Error reading from cloud storage:', error);
      return null;
    }
  }

  static async writeData(data: StorageData): Promise<boolean> {
    try {
      if (!this.isConfigured()) {
        console.warn('JSONBin credentials not configured, skipping cloud sync');
        return false;
      }

      const response = await fetch(`${this.API_BASE}/b/${this.BIN_ID}`, {
        method: 'PUT',
        headers: {
          'X-Master-Key': this.API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          lastUpdated: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error writing to cloud storage:', error);
      return false;
    }
  }

  static async initializeBin(): Promise<string | null> {
    try {
      if (!this.API_KEY) {
        console.warn('JSONBin API key not configured. Please add JSONBIN_API_KEY to your environment variables.');
        return null;
      }

      const initialData = {
        redirects: [],
        lastUpdated: new Date().toISOString(),
      };

      const response = await fetch(`${this.API_BASE}/b`, {
        method: 'POST',
        headers: {
          'X-Master-Key': this.API_KEY,
          'Content-Type': 'application/json',
          'X-Bin-Name': 'seo-redirects-data',
        },
        body: JSON.stringify(initialData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('JSONBin API Error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.metadata.id;
    } catch (error) {
      console.error('Error initializing bin:', error);
      return null;
    }
  }
}