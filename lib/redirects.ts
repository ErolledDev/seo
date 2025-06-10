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

// In a real application, this would be connected to a database
let redirectsData: RedirectConfig[] = [
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
  static async getAllRedirects(): Promise<RedirectConfig[]> {
    return [...redirectsData];
  }

  static async getRedirectById(id: string): Promise<RedirectConfig | null> {
    return redirectsData.find(redirect => redirect.id === id) || null;
  }

  static async createRedirect(config: Omit<RedirectConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<RedirectConfig> {
    const newRedirect: RedirectConfig = {
      ...config,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    redirectsData.push(newRedirect);
    return newRedirect;
  }

  static async updateRedirect(id: string, updates: Partial<Omit<RedirectConfig, 'id' | 'createdAt'>>): Promise<RedirectConfig | null> {
    const index = redirectsData.findIndex(redirect => redirect.id === id);
    if (index === -1) return null;

    redirectsData[index] = {
      ...redirectsData[index],
      ...updates,
      updatedAt: new Date(),
    };

    return redirectsData[index];
  }

  static async deleteRedirect(id: string): Promise<boolean> {
    const index = redirectsData.findIndex(redirect => redirect.id === id);
    if (index === -1) return false;

    redirectsData.splice(index, 1);
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