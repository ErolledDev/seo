'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RedirectConfig, RedirectManager } from '@/lib/redirects';
import { Plus, ExternalLink, Copy, Edit, Trash2, Eye, LogOut, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import AuthGuard from '@/components/AuthGuard';

interface RedirectFormData {
  title: string;
  description: string;
  image: string;
  targetUrl: string;
  keywords: string;
  siteName: string;
  type: string;
}

const initialFormData: RedirectFormData = {
  title: '',
  description: '',
  image: '',
  targetUrl: '',
  keywords: '',
  siteName: '',
  type: 'website',
};

export default function AdminPage() {
  const { user, logout } = useAuth();
  const [redirects, setRedirects] = useState<RedirectConfig[]>([]);
  const [formData, setFormData] = useState<RedirectFormData>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadRedirects();
    }
  }, [user]);

  const loadRedirects = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await RedirectManager.getAllRedirects(user.uid);
      setRedirects(data);
      toast({
        title: 'Success',
        description: 'Data loaded from Firebase',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load redirects',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      if (editingId) {
        await RedirectManager.updateRedirect(editingId, formData, user.uid);
        toast({
          title: 'Success',
          description: 'Redirect updated successfully',
        });
      } else {
        await RedirectManager.createRedirect(formData, user.uid);
        toast({
          title: 'Success',
          description: 'Redirect created successfully',
        });
      }

      setFormData(initialFormData);
      setEditingId(null);
      loadRedirects();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save redirect',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (redirect: RedirectConfig) => {
    setFormData({
      title: redirect.title,
      description: redirect.description,
      image: redirect.image || '',
      targetUrl: redirect.targetUrl,
      keywords: redirect.keywords || '',
      siteName: redirect.siteName || '',
      type: redirect.type || 'website',
    });
    setEditingId(redirect.id);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (!confirm('Are you sure you want to delete this redirect?')) return;

    try {
      await RedirectManager.deleteRedirect(id, user.uid);
      toast({
        title: 'Success',
        description: 'Redirect deleted successfully',
      });
      loadRedirects();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete redirect',
        variant: 'destructive',
      });
    }
  };

  const copyRedirectUrl = (redirect: RedirectConfig) => {
    const baseUrl = window.location.origin;
    const url = RedirectManager.buildRedirectUrl(baseUrl, redirect);
    navigator.clipboard.writeText(url);
    toast({
      title: 'Copied!',
      description: 'Redirect URL copied to clipboard',
    });
  };

  const previewRedirect = (redirect: RedirectConfig) => {
    const baseUrl = window.location.origin;
    const url = RedirectManager.buildRedirectUrl(baseUrl, redirect);
    window.open(url, '_blank');
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Success',
        description: 'Logged out successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to logout',
        variant: 'destructive',
      });
    }
  };

  return (
    <AuthGuard>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SEO Redirect Manager</h1>
              <p className="text-gray-600 mt-2">
                Create and manage dynamic SEO-optimized redirect pages
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">{user?.email}</span>
              </div>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="manage" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manage">Manage Redirects</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
            <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
          </TabsList>

          <TabsContent value="manage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Redirects</CardTitle>
                <CardDescription>
                  Manage your redirect configurations - automatically synced with Firebase
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading redirects...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Target URL</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {redirects.map((redirect) => (
                          <TableRow key={redirect.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{redirect.title}</div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {redirect.description}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="capitalize">
                                {redirect.type || 'website'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <a
                                href={redirect.targetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm truncate max-w-xs block"
                              >
                                {redirect.targetUrl}
                              </a>
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {redirect.createdAt.toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => previewRedirect(redirect)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyRedirectUrl(redirect)}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(redirect)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDelete(redirect.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {redirects.length === 0 && !isLoading && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No redirects found. Create your first redirect to get started.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingId ? 'Edit Redirect' : 'Create New Redirect'}
                </CardTitle>
                <CardDescription>
                  Configure a new SEO-optimized redirect page - automatically synced with Firebase
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter page title"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="product">Product</SelectItem>
                          <SelectItem value="article">Article</SelectItem>
                          <SelectItem value="service">Service</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter meta description"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetUrl">Target URL *</Label>
                    <Input
                      id="targetUrl"
                      type="url"
                      value={formData.targetUrl}
                      onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                      placeholder="https://example.com/target-page"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="image">Image URL</Label>
                      <Input
                        id="image"
                        type="url"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="siteName">Site Name</Label>
                      <Input
                        id="siteName"
                        value={formData.siteName}
                        onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                        placeholder="Your Site Name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="keywords">Keywords (comma separated)</Label>
                    <Input
                      id="keywords"
                      value={formData.keywords}
                      onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                      placeholder="seo, marketing, web design"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : editingId ? 'Update Redirect' : 'Create Redirect'}
                      <Plus className="w-4 h-4 ml-2" />
                    </Button>
                    
                    {editingId && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setFormData(initialFormData);
                          setEditingId(null);
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sitemap" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>XML Sitemap</CardTitle>
                <CardDescription>
                  Generate and manage your XML sitemap for search engines - automatically updated with Firebase data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-4">
                  <Button
                    onClick={() => window.open('/api/sitemap.xml', '_blank')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    View Sitemap
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/api/sitemap.xml`);
                      toast({
                        title: 'Copied!',
                        description: 'Sitemap URL copied to clipboard',
                      });
                    }}
                  >
                    Copy Sitemap URL
                    <Copy className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Sitemap Statistics</h3>
                  <p className="text-sm text-gray-600">
                    Your URLs: <span className="font-medium">{redirects.length}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Sitemap URL: <span className="font-medium">{typeof window !== 'undefined' ? `${window.location.origin}/api/sitemap.xml` : '/api/sitemap.xml'}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Storage: <span className="font-medium text-green-600">Firebase Firestore</span>
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">SEO Tips</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Submit your sitemap to Google Search Console</li>
                    <li>• Sitemap updates automatically with Firebase data changes</li>
                    <li>• Ensure all redirect URLs are accessible and return 200 status</li>
                    <li>• Use descriptive titles and meta descriptions for better SEO</li>
                    <li>• Firebase ensures data persistence and real-time sync</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  );
}