import { useState } from "react";
import { useParams, Link } from "wouter";
import { useGetProduct, useListProductReviews, useCreateReview, useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Star, ShoppingBag, CheckCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`h-4 w-4 ${i <= value ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id ?? "0", 10);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const { data: product, isLoading } = useGetProduct(productId, { query: { enabled: !!productId } });
  const { data: reviews } = useListProductReviews(productId, { query: { enabled: !!productId } });
  const { mutate: addToCart, isPending: isAdding } = useAddToCart();
  const { mutate: createReview, isPending: isReviewing } = useCreateReview();

  function handleAddToCart() {
    addToCart({ data: { productId, quantity: 1 } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        toast({ title: "Added to cart!", description: `${product?.name} has been added to your cart.` });
      },
      onError: () => toast({ title: "Error", description: "Failed to add to cart.", variant: "destructive" }),
    });
  }

  function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    createReview({ productId, data: { userName: reviewName, rating: reviewRating, comment: reviewComment } }, {
      onSuccess: () => {
        toast({ title: "Review submitted!", description: "Thank you for your feedback." });
        setReviewName(""); setReviewComment(""); setReviewRating(5);
      },
      onError: () => toast({ title: "Error", description: "Failed to submit review.", variant: "destructive" }),
    });
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 grid md:grid-cols-2 gap-12">
        <Skeleton className="aspect-square rounded-2xl" />
        <div className="space-y-4"><Skeleton className="h-10 w-3/4" /><Skeleton className="h-6 w-1/4" /><Skeleton className="h-24 w-full" /></div>
      </div>
    );
  }

  if (!product) return <div className="container py-12 text-center text-muted-foreground">Product not found.</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>

      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary/20 shadow-lg">
            <img src={product.imageUrl || "/images/product-kit.png"} alt={product.name} className="object-cover w-full h-full" />
            {product.featured && <Badge className="absolute top-4 left-4">Featured</Badge>}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
          <div>
            <Badge variant="outline" className="mb-3">{product.category}</Badge>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">{product.name}</h1>
            <div className="flex items-center gap-3">
              {product.rating && <StarRating value={Math.round(product.rating)} />}
              <span className="text-sm text-muted-foreground">({product.reviewCount ?? 0} reviews)</span>
            </div>
          </div>

          <p className="text-4xl font-bold text-primary">GHS {product.price?.toFixed(2)}</p>

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          {product.contents && product.contents.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-3">What's inside:</h3>
              <ul className="space-y-2">
                {product.contents.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-4 pt-2">
            <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={isAdding || !product.inStock} data-testid="button-add-to-cart">
              <ShoppingBag className="h-5 w-5 mr-2" />
              {product.inStock ? "Add to Cart" : "Out of Stock"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">Free delivery to all major university campuses in Ghana.</p>
        </motion.div>
      </div>

      {/* Reviews */}
      <div className="border-t pt-12">
        <h2 className="text-2xl font-serif font-bold mb-8">Customer Reviews</h2>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            {reviews && reviews.length > 0 ? reviews.map(review => (
              <div key={review.id} className="bg-card border border-border/50 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold">{review.userName}</p>
                  <StarRating value={review.rating} />
                </div>
                <p className="text-muted-foreground text-sm">{review.comment}</p>
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground">No reviews yet. Be the first!</div>
            )}
          </div>

          <form onSubmit={handleReviewSubmit} className="space-y-4 bg-secondary/30 rounded-xl p-6">
            <h3 className="font-semibold text-lg">Write a review</h3>
            <div>
              <Input
                placeholder="Your name"
                value={reviewName}
                onChange={e => setReviewName(e.target.value)}
                required
                data-testid="input-review-name"
              />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Rating</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <button key={i} type="button" onClick={() => setReviewRating(i)}>
                    <Star className={`h-6 w-6 transition-colors ${i <= reviewRating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              placeholder="Share your experience..."
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              required
              rows={4}
              data-testid="input-review-comment"
            />
            <Button type="submit" disabled={isReviewing} data-testid="button-submit-review">
              {isReviewing ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
