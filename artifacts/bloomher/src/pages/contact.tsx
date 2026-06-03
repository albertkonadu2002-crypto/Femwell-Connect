import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MessageCircle, MapPin, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

const FAQS = [
  { q: "How discreet is my delivery?", a: "All packages are delivered in plain, unmarked boxes with no indication of the contents. Your privacy is our top priority." },
  { q: "Can I change my delivery address?", a: "Yes, you can update your delivery address at any time from your dashboard or by contacting our support team." },
  { q: "Are the telehealth consultations confidential?", a: "Absolutely. All consultations are private, encrypted, and subject to medical confidentiality. Only your assigned nurse has access to your consultation records." },
  { q: "What payment methods do you accept?", a: "We accept MTN Mobile Money, Telecel Cash, AirtelTigo Money, Visa, and Mastercard for all purchases and subscriptions." },
  { q: "How long does delivery take?", a: "Standard delivery to major university campuses takes 2-5 business days. Subscription members enjoy free priority delivery." },
  { q: "Can I cancel my subscription?", a: "Yes, you can cancel your subscription at any time from your dashboard. There are no cancellation fees." },
];

export default function Contact() {
  const { toast } = useToast();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setForm({ name: "", email: "", subject: "", message: "" });
      toast({ title: "Message sent!", description: "We'll respond within 24 hours." });
    }, 1200);
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <h1 className="text-4xl font-serif font-bold text-foreground mb-3">Get in touch</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">We're here to help with any questions about our products, subscriptions, or telehealth services.</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-1.5">Your name</p>
                <Input placeholder="Ama Mensah" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required data-testid="input-name" />
              </div>
              <div>
                <p className="text-sm font-medium mb-1.5">Email address</p>
                <Input type="email" placeholder="ama@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required data-testid="input-email" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-1.5">Subject</p>
              <Input placeholder="How can we help?" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required data-testid="input-subject" />
            </div>
            <div>
              <p className="text-sm font-medium mb-1.5">Message</p>
              <Textarea placeholder="Tell us what's on your mind..." rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required data-testid="input-message" />
            </div>
            <Button type="submit" className="w-full h-11" disabled={submitting} data-testid="button-send">
              {submitting ? "Sending..." : "Send message"}
            </Button>
          </form>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div>
            <h2 className="font-semibold text-lg mb-4">Other ways to reach us</h2>
            <div className="space-y-4">
              {[
                { icon: Mail, label: "Email", value: "hello@bloomher.care", href: "mailto:hello@bloomher.care" },
                { icon: Phone, label: "Phone", value: "+233 24 000 0001", href: "tel:+233240000001" },
                { icon: MessageCircle, label: "WhatsApp", value: "+233 24 000 0001", href: "https://wa.me/233240000001" },
                { icon: MapPin, label: "Office", value: "University of Ghana Campus, Legon, Accra", href: null },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4 p-4 bg-card border border-border/50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{label}</p>
                    {href ? (
                      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="font-medium hover:text-primary transition-colors">
                        {value}
                      </a>
                    ) : (
                      <p className="font-medium text-sm">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-secondary/40 rounded-xl p-5">
            <h3 className="font-semibold mb-2">Office hours</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Monday – Friday: 8:00 AM – 6:00 PM</p>
              <p>Saturday: 9:00 AM – 3:00 PM</p>
              <p>Telehealth: Weekdays 9:00 AM – 5:00 PM</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-serif font-bold mb-8 text-center">Frequently asked questions</h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card border border-border/50 rounded-xl overflow-hidden">
              <button
                className="w-full text-left p-5 flex items-center justify-between gap-4 font-medium hover:bg-accent/30 transition-colors"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                data-testid={`faq-${i}`}
              >
                <span>{faq.q}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed">{faq.a}</div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
