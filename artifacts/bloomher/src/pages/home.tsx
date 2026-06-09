import { useGetPlatformStats, useListFeaturedProducts } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Star, Shield, Clock, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: stats } = useGetPlatformStats();
  const { data: featuredProducts } = useListFeaturedProducts();
  const products = Array.isArray(featuredProducts) ? featuredProducts : [];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-secondary/50 pt-16 md:pt-24 pb-20 md:pb-32">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-tight mb-6">
                Your body. Your health. <span className="text-primary italic">Your terms.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Femwell Connect is your trusted digital companion for menstrual health, wellness subscriptions, and professional telehealth consultations in Ghana.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button size="lg" className="w-full sm:w-auto text-base h-12">
                    Shop Care Kits
                  </Button>
                </Link>
                <Link href="/telehealth">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base h-12 bg-white/50 border-primary/20 hover:bg-white hover:text-primary">
                    Talk to a Nurse
                  </Button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative rounded-2xl overflow-hidden aspect-[4/3] md:aspect-square shadow-xl"
            >
              <img 
                src="/images/products/product-standard.jpg" 
                alt="Femwell Connect product kit" 
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-6">
                <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/20">
                  <p className="font-medium text-foreground text-sm md:text-base flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    "The most convenient way to manage my wellness."
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y border-border/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <h3 className="text-3xl md:text-4xl font-bold text-primary">{stats?.totalUsers || "20+"}</h3>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Women Supported</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl md:text-4xl font-bold text-primary">{stats?.universitiesServed || "2"}</h3>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Campuses</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl md:text-4xl font-bold text-primary">{stats?.totalOrders || "8"}</h3>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Kits Delivered</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl md:text-4xl font-bold text-primary">{stats?.satisfactionRate ? `${stats.satisfactionRate}%` : "90%"}</h3>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Satisfaction</p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-20">
        <div className="container mx-auto px-4">
            <h2 className="text-3xl text-center">Featured Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
                {products.map(p => (
                    <div key={p.id} className="p-4 border rounded-xl shadow-sm">
                        <img src={p.imageUrl} alt={p.name} className="w-full aspect-square object-cover rounded-lg" />
                        <h3 className="font-semibold text-lg mt-4">{p.name}</h3>
                        <p className="text-primary font-bold">GHS {p.price}</p>
                        <Link href={`/products/${p.id}`}><Button className="mt-4 w-full">View</Button></Link>
                    </div>
                ))}
            </div>
        </div>
      </section>
    </div>
  );
}
