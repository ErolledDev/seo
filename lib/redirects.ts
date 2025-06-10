import { CloudStorage } from './storage';

export interface RedirectConfig {
  id: string;
  title: string;
  description: string;
  image?: string;
  targetUrl: string;
  keywords?: string;
  siteName?: string;
  type?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Local fallback data
let localRedirectsData: RedirectConfig[] = [
  {
    id: 'sample-product-1',
    title: 'Premium Leather Wallet - Handcrafted Excellence',
    description: 'Discover our premium handcrafted leather wallet made from full-grain leather. Perfect for the modern professional.',
    image: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg',
    targetUrl: 'https://example.com/products/leather-wallet',
    keywords: 'leather wallet, premium wallet, handcrafted leather',
    siteName: 'Premium Goods Store',
    type: 'product',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'sample-service-1',
    title: 'Expert Web Design Services - Transform Your Online Presence',
    description: 'Professional web design services that transform your business. Custom designs, responsive layouts, and modern aesthetics.',
    image: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg',
    targetUrl: 'https://example.com/services/web-design',
    keywords: 'web design, website design, responsive design, UI/UX',
    siteName: 'Digital Agency Pro',
    type: 'service',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: 'sample-article-1',
    title: '10 Essential Tips for Effective Digital Marketing',
    description: 'Master digital marketing with these proven strategies. Learn SEO, social media marketing, and content creation techniques.',
    image: 'https://images.pexels.com/photos/270408/pexels-photo-270408.jpeg',
    targetUrl: 'https://example.com/blog/digital-marketing-tips',
    keywords: 'digital marketing, SEO, social media marketing, content marketing',
    siteName: 'Marketing Insights Blog',
    type: 'article',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
];

export class RedirectManager {
  private static async syncWithCloud(): Promise<RedirectConfig[]> {
    try {
      const cloudData = await CloudStorage.readData();
      if (cloudData && cloudData.redirects) {
        // Convert date strings back to Date objects
        const redirects = cloudData.redirects.map((redirect: any) => ({
          ...redirect,
          createdAt: new Date(redirect.createdAt),
          updatedAt: new Date(redirect.updatedAt),
        }));
        localRedirectsData = redirects;
        return redirects;
      }
    } catch (error) {
      console.error('Error syncing with cloud:', error);
    }
    return localRedirectsData;
  }

  private static async saveToCloud(redirects: RedirectConfig[]): Promise<void> {
    try {
      await CloudStorage.writeData({
        redirects,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error saving to cloud:', error);
    }
  }

  static async getAllRedirects(): Promise<RedirectConfig[]> {
    return await this.syncWithCloud();
  }

  static async getRedirectById(id: string): Promise<RedirectConfig | null> {
    const redirects = await this.syncWithCloud();
    return redirects.find(redirect => redirect.id === id) || null;
  }

  static async createRedirect(config: Omit<RedirectConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<RedirectConfig> {
    const newRedirect: RedirectConfig = {
      ...config,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    localRedirectsData.push(newRedirect);
    await this.saveToCloud(localRedirectsData);
    return newRedirect;
  }

  static async updateRedirect(id: string, updates: Partial<Omit<RedirectConfig, 'id' | 'createdAt'>>): Promise<RedirectConfig | null> {
    const index = localRedirectsData.findIndex(redirect => redirect.id === id);
    if (index === -1) return null;

    localRedirectsData[index] = {
      ...localRedirectsData[index],
      ...updates,
      updatedAt: new Date(),
    };

    await this.saveToCloud(localRedirectsData);
    return localRedirectsData[index];
  }

  static async deleteRedirect(id: string): Promise<boolean> {
    const index = localRedirectsData.findIndex(redirect => redirect.id === id);
    if (index === -1) return false;

    localRedirectsData.splice(index, 1);
    await this.saveToCloud(localRedirectsData);
    return true;
  }

  static generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
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