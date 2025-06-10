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

  static async getAllRedirects(userId: string): Promise<RedirectConfig[]> {
    try {
      const redirectsRef = collection(db, this.COLLECTION_NAME);
      const q = query(redirectsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const redirects: RedirectConfig[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Only return redirects for the current user
        if (data.userId === userId) {
          redirects.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
          } as RedirectConfig);
        }
      });
      
      return redirects;
    } catch (error) {
      console.error('Error fetching redirects:', error);
      throw error;
    }
  }

  static async getRedirectById(id: string, userId: string): Promise<RedirectConfig | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Check if the redirect belongs to the user
        if (data.userId === userId) {
          return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
          } as RedirectConfig;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching redirect:', error);
      throw error;
    }
  }

  static async createRedirect(
    config: Omit<RedirectConfig, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<RedirectConfig> {
    try {
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
    } catch (error) {
      console.error('Error creating redirect:', error);
      throw error;
    }
  }

  static async updateRedirect(
    id: string,
    updates: Partial<Omit<RedirectConfig, 'id' | 'createdAt' | 'userId'>>,
    userId: string
  ): Promise<RedirectConfig | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      // Check if the redirect belongs to the user
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
    } catch (error) {
      console.error('Error updating redirect:', error);
      throw error;
    }
  }

  static async deleteRedirect(id: string, userId: string): Promise<boolean> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return false;
      }

      const data = docSnap.data();
      // Check if the redirect belongs to the user
      if (data.userId !== userId) {
        throw new Error('Unauthorized: You can only delete your own redirects');
      }

      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting redirect:', error);
      throw error;
    }
  }

  // Get all redirects for sitemap (public method)
  static async getAllRedirectsForSitemap(): Promise<RedirectConfig[]> {
    try {
      const redirectsRef = collection(db, this.COLLECTION_NAME);
      const q = query(redirectsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const redirects: RedirectConfig[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        redirects.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as RedirectConfig);
      });
      
      return redirects;
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