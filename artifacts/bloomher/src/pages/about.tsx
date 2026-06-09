import { useGetPlatformStats } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Heart, Shield, Sparkles, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

const TEAM = [
  { name: "Miss Ramatu Akunvane ", role: " A lecturer who teaches reproductive health", bio: "OB/GYN specialist with 12 years of experience in reproductive health across Cape Coast.", img: "/images/blog-nurse.svg" },
  { name: "GROUP 8 ENTREPRENEURS", role: "CEO & Co-Founder", bio: "Student nurses of university of Cape Coast whose goal is to achieve the needs of female students on campus to  accessible menstrual care.", img: "/images/blog-student.svg" },
  { name: "Nurse Baaba", role: "Head of Telehealth", bio: "Registered nurse specializing in family planning and women's wellness consultations.", img: "/images/blog-nurse.svg" },
];

const VALUES = [
  { icon: Shield, title: "Privacy First", desc: "Your health information is always private and protected. We will never share your data." },
  { icon: Heart, title: "Empowerment", desc: "We believe every woman deserves to feel confident and informed about her own health." },
  { icon: Sparkles, title: "Convenience", desc: "Health support should fit into your life, not the other way around." },
  { icon: BookOpen, title: "Education", desc: "Informed women make better health decisions. We provide the knowledge to do so." },
];

export default function About() {
  const { data: stats } = useGetPlatformStats();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-primary/5 py-20 border-b border-border/50">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <Badge variant="outline" className="mb-4">Our Story</Badge>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6 leading-tight">
              Built by women, for women — across every Ghanaian campus.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Femwell Connect was born out of a simple observation: too many female students were missing classes, hiding discomfort, and making do without proper period care. We set out to change that — discreetly, professionally, and with empathy at the core.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: stats?.totalUsers != null ? (stats.totalUsers >= 1000 ? `${(stats.totalUsers / 1000).toFixed(1)}K+` : `${stats.totalUsers}+`) : "20+", label: "Women Supported" },
              { value: stats?.universitiesServed ? `${stats.universitiesServed}` : "2", label: "University Campuses" },
              { value: stats?.totalOrders != null ? (stats.totalOrders >= 1000 ? `${(stats.totalOrders / 1000).toFixed(0)}K+` : `${stats.totalOrders}+`) : "8", label: "Kits Delivered" },
              { value: stats?.satisfactionRate ? `${stats.satisfactionRate}%` : "90%", label: "Satisfaction Rate" },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="space-y-2">
                <p className="text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-card border border-border/50 rounded-2xl p-8">
            <h2 className="text-2xl font-serif font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              To make high-quality menstrual hygiene products, reproductive health education, and professional telehealth consultations accessible, affordable, and stigma-free for every woman in Ghana — starting with university campuses.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-card border border-border/50 rounded-2xl p-8">
            <h2 className="text-2xl font-serif font-bold mb-4">Our Vision</h2>
            <p className="text-muted-foreground leading-relaxed">
              A Ghana where no woman has to choose between her education and her health — where period poverty is history, and every student has the tools to thrive through every phase of her cycle.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-center mb-12">What we stand for</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-card border border-border/50 rounded-xl p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-center mb-12">Meet our team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {TEAM.map((member, i) => (
              <motion.div key={member.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-card border border-border/50 rounded-2xl overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="aspect-[4/3] overflow-hidden bg-secondary/20">
                  <img src={member.img} alt={member.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <h3 className="font-serif font-bold text-lg">{member.name}</h3>
                  <p className="text-primary text-sm font-medium mb-3">{member.role}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
