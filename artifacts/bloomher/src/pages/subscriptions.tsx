import { useListSubscriptionPlans, useGetUserSubscription, useCreateSubscription, useCancelSubscription, getGetUserSubscriptionQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, RefreshCw, Package } from "lucide-react";
import { motion } from "framer-motion";

const PAYMENT_METHODS = [
  { value: "mtn_momo", label: "MTN Mobile Money" },
  { value: "telecel_cash", label: "Telecel Cash" },
  { value: "airteltigo", label: "AirtelTigo Money" },
  { value: "visa", label: "Visa Card" },
  { value: "mastercard", label: "Mastercard" },
];

export default function Subscriptions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mtn_momo");

  const { data: plansData, isLoading: plansLoading } = useListSubscriptionPlans();
  const { data: subscription } = useGetUserSubscription();
  const { mutate: subscribe, isPending: isSubscribing } = useCreateSubscription();
  const { mutate: cancel, isPending: isCancelling } = useCancelSubscription();

  const plans = Array.isArray(plansData) ? plansData : [];

  function handleSubscribe() {
    if (!selectedPlanId) { toast({ title: "Please select a plan", variant: "destructive" }); return; }
    if (!address) { toast({ title: "Please enter a delivery address", variant: "destructive" }); return; }

    subscribe({ data: { planId: selectedPlanId, deliveryAddress: address, paymentMethod } }, {
      onSuccess: (sub) => {
        queryClient.invalidateQueries({ queryKey: getGetUserSubscriptionQueryKey() });
        toast({ title: "Subscribed!", description: `Welcome to ${sub.planName}. First delivery: ${sub.nextDelivery}` });
      },
      onError: () => toast({ title: "Subscription failed", variant: "destructive" }),
    });
  }

  function handleCancel(id: number) {
    cancel({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetUserSubscriptionQueryKey() });
        toast({ title: "Subscription cancelled", description: "You can re-subscribe anytime." });
      },
    });
  }

  const activeSub = subscription && (subscription as any).id ? subscription : null;

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Subscription Plans</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Get your Femwell Connect kit delivered automatically. Never run out, never worry.
        </p>
      </motion.div>

      {activeSub && (activeSub as any).status === "active" ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl mx-auto mb-12 bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
          <Package className="h-12 w-12 text-primary mx-auto mb-4" />
          <Badge className="mb-4">Active Subscription</Badge>
          <h2 className="text-2xl font-serif font-bold mb-2">{(activeSub as any).planName}</h2>
          <p className="text-muted-foreground mb-1">Next delivery: <span className="font-medium text-foreground">{(activeSub as any).nextDelivery}</span></p>
          {(activeSub as any).deliveryAddress && <p className="text-sm text-muted-foreground mb-6">To: {(activeSub as any).deliveryAddress}</p>}
          <Button variant="outline" size="sm" onClick={() => handleCancel((activeSub as any).id)} disabled={isCancelling} className="text-destructive border-destructive/20 hover:bg-destructive/5">
            {isCancelling ? "Cancelling..." : "Cancel subscription"}
          </Button>
        </motion.div>
      ) : null}

      {plansLoading ? (
        <div className="grid md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <Skeleton key={i} className="h-96 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6 mb-12">
            {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border-2 p-8 flex flex-col cursor-pointer transition-all ${
                selectedPlanId === plan.id
                  ? "border-primary bg-primary/5 shadow-lg scale-[1.02]"
                  : plan.popular
                  ? "border-primary/40 bg-card shadow-md"
                  : "border-border bg-card hover:border-primary/30"
              }`}
              onClick={() => setSelectedPlanId(plan.id)}
              data-testid={`plan-${plan.id}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
              )}
              <h3 className="text-xl font-serif font-bold mb-2">{plan.name}</h3>
              <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-primary">GHS {plan.price}</span>
                <span className="text-muted-foreground ml-1">/{plan.interval}</span>
              </div>
              <ul className="space-y-3 flex-1">
                {plan.features?.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className={`mt-6 py-2 px-4 rounded-lg text-center text-sm font-medium border transition-colors ${
                selectedPlanId === plan.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground"
              }`}>
                {selectedPlanId === plan.id ? "Selected" : "Select plan"}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {selectedPlanId && !activeSub && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto bg-card border border-border/50 rounded-2xl p-8 space-y-5">
          <h2 className="font-semibold text-xl">Complete your subscription</h2>
          <div>
            <p className="text-sm font-medium mb-1.5">Delivery address</p>
            <Input placeholder="Hall/hostel, campus, city..." value={address} onChange={e => setAddress(e.target.value)} data-testid="input-address" />
          </div>
          <div>
            <p className="text-sm font-medium mb-1.5">Payment method</p>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full h-11" onClick={handleSubscribe} disabled={isSubscribing} data-testid="button-subscribe">
            <RefreshCw className="h-4 w-4 mr-2" />
            {isSubscribing ? "Subscribing..." : "Start subscription"}
          </Button>
        </motion.div>
      )}

      <div className="mt-16 grid md:grid-cols-3 gap-6 text-center">
        {[
          { label: "Automatic renewal", desc: "Never think about reordering — we've got you." },
          { label: "Flexible delivery", desc: "Choose delivery to your campus or hostel address." },
          { label: "Cancel anytime", desc: "No lock-in. Cancel or pause your plan whenever." },
        ].map(item => (
          <div key={item.label} className="bg-secondary/40 rounded-xl p-6">
            <h4 className="font-semibold mb-2">{item.label}</h4>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
