import { useState } from "react";
import { Link } from "wouter";
import { useListBlogPosts, useListBlogCategories } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function Blog() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | undefined>();
  const [query, setQuery] = useState("");

  const { data: posts, isLoading } = useListBlogPosts({ category: activeCategory, search: query || undefined });
  const { data: categories } = useListBlogCategories();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setQuery(search);
  }

  const featuredPosts = (posts ?? []).filter(p => p.featured);
  const regularPosts = (posts ?? []).filter(p => !p.featured || activeCategory || query);

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl font-serif font-bold text-foreground mb-3">Health Education</h1>
        <p className="text-muted-foreground text-lg">Trusted information on menstrual health, reproductive wellness, and student wellbeing.</p>
      </motion.div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
        <Button type="submit" variant="outline" data-testid="button-search">Search</Button>
      </form>

      <div className="flex gap-2 flex-wrap mb-10">
        <Button
          variant={!activeCategory ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => { setActiveCategory(undefined); setQuery(""); }}
          data-testid="category-all"
        >
          All Articles
        </Button>
        {(categories ?? []).map(cat => (
          <Button
            key={cat.slug}
            variant={activeCategory === cat.name ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => setActiveCategory(cat.name)}
            data-testid={`category-${cat.slug}`}
          >
            {cat.name}
            <Badge variant="secondary" className="ml-2 text-xs px-1.5 py-0">{cat.postCount}</Badge>
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-72 rounded-2xl" />)}
        </div>
      ) : (
        <>
          {featuredPosts.length > 0 && !activeCategory && !query && (
            <div className="mb-12">
              <h2 className="text-xl font-semibold mb-6 text-foreground">Featured Articles</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {featuredPosts.slice(0, 2).map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link href={`/blog/${post.id}`}>
                      <div className="group relative rounded-2xl overflow-hidden aspect-[16/9] bg-secondary/20 shadow-md hover:shadow-xl transition-shadow">
                        <img src={post.imageUrl || "/images/blog-nurse.png"} alt={post.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6">
                          <Badge className="w-fit mb-2 bg-primary/90">{post.category}</Badge>
                          <h3 className="text-white font-serif font-bold text-xl line-clamp-2">{post.title}</h3>
                          <div className="flex items-center gap-3 mt-2 text-white/70 text-sm">
                            <span>{post.author}</span>
                            <span><Clock className="inline h-3 w-3 mr-1" />{post.readTime} min read</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {(activeCategory || query ? posts : regularPosts.length > 0 ? regularPosts : posts ?? []).length > 0 && (
            <div>
              {!activeCategory && !query && regularPosts.length > 0 && <h2 className="text-xl font-semibold mb-6">More Articles</h2>}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(activeCategory || query ? posts ?? [] : regularPosts).map((post, i) => (
                  <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link href={`/blog/${post.id}`}>
                      <div className="group bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                        <div className="aspect-[16/9] overflow-hidden bg-secondary/20">
                          <img src={post.imageUrl || "/images/blog-student.png"} alt={post.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="p-5">
                          <Badge variant="outline" className="mb-3 text-xs">{post.category}</Badge>
                          <h3 className="font-serif font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3>
                          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{post.excerpt}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{post.author}</span>
                            <span><Clock className="inline h-3 w-3 mr-1" />{post.readTime} min read</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {(posts ?? []).length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <p>No articles found. Try a different search or category.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
