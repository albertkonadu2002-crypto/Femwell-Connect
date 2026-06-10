import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useCreateProduct, useListProducts } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Package, Star } from "lucide-react";

const CATEGORIES = ["Essential", "Premium", "Wellness"];

export default function Admin() {
  const { isAuthenticated, token } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: productsData } = useListProducts();
  const products = Array.isArray(productsData) ? productsData : [];
  const { mutate: createProduct, isPending } = useCreateProduct();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "Essential",
    imageUrl: "",
    featured: false,
    contents: "",
  });

  const [showForm, setShowForm] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground mb-4">Please log in as an admin to access this page.</p>
        <Button onClick={() => setLocation("/login")}>Log In</Button>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.price || !form.description) {
      toast({ title: "Missing fields", description: "Name, description, and price are required.", variant: "destructive" });
      return;
    }

    createProduct({
      data: {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        category: form.category,
        imageUrl: form.imageUrl || undefined,
        featured: form.featured,
        contents: form.contents ? form.contents.split("\n").filter(l => l.trim()) : undefined,
      },
    }, {
      onSuccess: () => {
        toast({ title: "Product added!", description: `${form.name} has been added to the shop.` });
        setForm({ name: "", description: "", price: "", category: "Essential", imageUrl: "", featured: false, contents: "" });
        setShowForm(false);
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err?.data?.error || "Failed to add product.", variant: "destructive" });
      },
    });
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your shop products</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? "Cancel" : "Add Product"}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8 border-primary/20">
          <CardHeader>
            <CardTitle>Add New Product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Product Name *</label>
                  <Input
                    placeholder="e.g. Standard Femwell Connect Kit"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Price (GH₵) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="20.00"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Description *</label>
                <Textarea
                  placeholder="Describe what's in this kit..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Category</label>
                  <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Image URL</label>
                  <Input
                    placeholder="/images/products/product-name.jpg"
                    value={form.imageUrl}
                    onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Kit Contents (one per line)</label>
                <Textarea
                  placeholder={"2 pads\n1 liner\n1 tissue\n1 guide"}
                  value={form.contents}
                  onChange={e => setForm(f => ({ ...f, contents: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={form.featured}
                  onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="featured" className="text-sm font-medium">Featured product</label>
              </div>

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Adding..." : "Add Product"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">Current Products ({products.length})</h2>
        {products.length === 0 ? (
          <p className="text-muted-foreground">No products yet. Add one above.</p>
        ) : (
          <div className="grid gap-4">
            {products.map(product => (
              <div key={product.id} className="flex items-center gap-4 bg-card border border-border/50 rounded-xl p-4">
                <img
                  src={product.imageUrl || "/images/products/product-standard-pink.jpg"}
                  alt={product.name}
                  className="w-20 h-20 rounded-lg object-cover bg-secondary/20 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{product.name}</h3>
                    {product.featured && <Badge>Featured</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="font-bold text-primary">GH₵ {product.price}</span>
                    <Badge variant="outline">{product.category}</Badge>
                    {product.rating && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {product.rating?.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <Link href={`/products/${product.id}`}>
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
