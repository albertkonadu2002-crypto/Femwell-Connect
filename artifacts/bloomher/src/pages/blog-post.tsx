import { useParams, Link } from "wouter";
import { useGetBlogPost } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clock, User, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const postId = parseInt(id ?? "0", 10);
  const { data: post, isLoading } = useGetBlogPost(postId, { query: { enabled: !!postId } });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Skeleton className="h-8 w-48 mb-8" />
        <Skeleton className="aspect-[16/9] rounded-2xl mb-8" />
        <Skeleton className="h-10 w-3/4 mb-4" />
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-4 w-full" />)}
        </div>
      </div>
    );
  }

  if (!post) return <div className="container py-12 text-center text-muted-foreground">Article not found.</div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link href="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to articles
      </Link>

      <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6">
          <Badge variant="outline" className="mb-4">{post.category}</Badge>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4 leading-tight">{post.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><User className="h-4 w-4" />{post.author}</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{new Date(post.publishedAt).toLocaleDateString("en-GH", { year: "numeric", month: "long", day: "numeric" })}</span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{post.readTime} min read</span>
          </div>
        </div>

        <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-secondary/20 mb-8 shadow-lg">
          <img src={post.imageUrl || "/images/blog-nurse.png"} alt={post.title} className="object-cover w-full h-full" />
        </div>

        <div className="prose prose-lg max-w-none text-foreground">
          <p className="text-xl text-muted-foreground font-medium mb-6 italic border-l-4 border-primary pl-4">{post.excerpt}</p>
          <div className="space-y-4 leading-relaxed">
            {post.content.split(". ").reduce((acc: string[], sentence, i, arr) => {
              if (i % 4 === 0 && i !== 0) acc.push(arr.slice(i - 4, i).join(". ") + ".");
              if (i === arr.length - 1) acc.push(arr.slice(Math.floor(i / 4) * 4).join(". "));
              return acc;
            }, []).map((paragraph, i) => (
              <p key={i} className="text-muted-foreground leading-relaxed">{paragraph}</p>
            ))}
          </div>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="mt-8 pt-8 border-t flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}

        <div className="mt-10 bg-primary/5 border border-primary/20 rounded-2xl p-6">
          <h3 className="font-serif font-bold text-lg mb-2">Have questions about your health?</h3>
          <p className="text-muted-foreground text-sm mb-4">Book a private telehealth consultation with one of our qualified nurses.</p>
          <Link href="/telehealth" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            Book a consultation
          </Link>
        </div>
      </motion.article>
    </div>
  );
}
