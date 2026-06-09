import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useListProducts, useAddToCart } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, ShoppingBag, Filter } from "lucide-react";

export default function Products() {
  const [category, setCategory] = useState<string | undefined>();
  const { data: productsData, isLoading } = useListProducts({ category });
  const products = Array.isArray(productsData) ? productsData : [];
  const { mutate: addToCart, isPending: isAdding } = useAddToCart();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const categories = ["All", "Essential", "Premium", "Wellness"];

  const handleAddToCart = (productId: number) => {
    if (!isAuthenticated) {
      toast({ title: "Please log in", description: "You need an account to add items to your cart." });
      setLocation("/login");
      return;
    }
    addToCart({ data: { productId, quantity: 1 } }, {
      onSuccess: () => {
        toast({ title: "Added to cart", description: "Item has been added to your care kit." });
      },
      onError: () => {
        toast({ title: "Error", description: "Please log in to add items to cart.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Care Products</h1>
          <p className="text-muted-foreground">Everything you need for your menstrual and wellness journey.</p>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto">
          <Filter className="h-5 w-5 text-muted-foreground mr-2" />
          {categories.map(c => (
            <Button 
              key={c} 
              variant={category === c || (c === "All" && !category) ? "default" : "outline"}
              onClick={() => setCategory(c === "All" ? undefined : c)}
              className="rounded-full whitespace-nowrap"
            >
              {c}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-64 w-full" />
              <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
              <CardContent><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-4 w-1/2" /></CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <Card key={product.id} className="overflow-hidden group hover:shadow-lg transition-all border-border/50">
              <Link href={`/products/${product.id}`}>
                <div className="relative aspect-square overflow-hidden bg-secondary/20">
                  <img 
                    src={product.imageUrl || "/images/product-kit.png"} 
                    alt={product.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.featured && (
                    <div className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                      Featured
                    </div>
                  )}
                </div>
              </Link>
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <Link href={`/products/${product.id}`} className="hover:text-primary transition-colors">
                    <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                  </Link>
                  <p className="font-bold text-primary whitespace-nowrap ml-2">₵{product.price}</p>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center gap-1 text-sm text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="font-medium text-foreground">{product.rating || "5.0"}</span>
                  <span className="text-muted-foreground">({product.reviewCount || 0} reviews)</span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button 
                  className="w-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                  disabled={!product.inStock || isAdding}
                  onClick={() => handleAddToCart(product.id)}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  {product.inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
