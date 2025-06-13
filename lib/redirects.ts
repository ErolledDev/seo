import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface RedirectConfig {
  id: string;
  title: string;
  description: string;
  image?: string;
  targetUrl: string;
  keywords?: string;
  siteName?: string;
  type?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class RedirectManager {
  private static readonly COLLECTION_NAME = 'redirects';

  private static validateDb(): void {
    if (!db) {
      throw new Error('Firestore not initialized');
    }
  }

  private static convertTimestamps(data: any): RedirectConfig {
    return {
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as RedirectConfig;
  }

  static async getAllRedirects(userId: string): Promise<RedirectConfig[]> {
    if (!db) return [];

    try {
      const redirectsRef = collection(db, this.COLLECTION_NAME);
      
      // Try optimized query with composite index
      try {
        const q = query(redirectsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...this.convertTimestamps(doc.data())
        }));
      } catch (indexError) {
        // Fallback without orderBy if composite index doesn't exist
        const fallbackQuery = query(redirectsRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(fallbackQuery);
        
        const redirects = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...this.convertTimestamps(doc.data())
        }));
        
        return redirects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
    } catch (error) {
      console.error('Error fetching redirects:', error);
      return [];
    }
  }

  static async getRedirectById(id: string, userId: string): Promise<RedirectConfig | null> {
    if (!db) return null;

    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.userId === userId) {
          return {
            id: docSnap.id,
            ...this.convertTimestamps(data)
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching redirect:', error);
      return null;
    }
  }

  static async createRedirect(
    config: Omit<RedirectConfig, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<RedirectConfig> {
    this.validateDb();

    const now = Timestamp.now();
    const redirectData = {
      ...config,
      userId,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, this.COLLECTION_NAME), redirectData);
    
    return {
      id: docRef.id,
      ...config,
      userId,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
    };
  }

  static async updateRedirect(
    id: string,
    updates: Partial<Omit<RedirectConfig, 'id' | 'createdAt' | 'userId'>>,
    userId: string
  ): Promise<RedirectConfig | null> {
    this.validateDb();

    const docRef = doc(db, this.COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    if (data.userId !== userId) {
      throw new Error('Unauthorized: You can only update your own redirects');
    }

    const now = Timestamp.now();
    await updateDoc(docRef, {
      ...updates,
      updatedAt: now,
    });

    return {
      id,
      ...data,
      ...updates,
      userId,
      createdAt: data.createdAt.toDate(),
      updatedAt: now.toDate(),
    } as RedirectConfig;
  }

  static async deleteRedirect(id: string, userId: string): Promise<boolean> {
    this.validateDb();

    const docRef = doc(db, this.COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return false;

    const data = docSnap.data();
    if (data.userId !== userId) {
      throw new Error('Unauthorized: You can only delete your own redirects');
    }

    await deleteDoc(docRef);
    return true;
  }

  static async getAllRedirectsForSitemap(): Promise<RedirectConfig[]> {
    if (!db) return [];

    try {
      const redirectsRef = collection(db, this.COLLECTION_NAME);
      const q = query(redirectsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...this.convertTimestamps(doc.data())
      }));
    } catch (error) {
      console.error('Error fetching redirects for sitemap:', error);
      return [];
    }
  }

  static buildRedirectUrl(baseUrl: string, config: RedirectConfig): string {
    const params = new URLSearchParams({
      title: config.title,
      desc: config.description,
      url: config.targetUrl,
    });

    if (config.image) params.set('image', config.image);
    if (config.keywords) params.set('keywords', config.keywords);
    if (config.siteName) params.set('site_name', config.siteName);
    if (config.type) params.set('type', config.type);

    return `${baseUrl}/u?${params.toString()}`;
  }
}