import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useGetCart, useRemoveCartItem, useClearCart, useCreateOrder,
  getGetCartQueryKey, getListOrdersQueryKey,
  type OrderInputPaymentMethod,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const PAYMENT_METHODS = [
  { value: "mtn_momo", label: "MTN Mobile Money" },
  { value: "telecel_cash", label: "Telecel Cash" },
  { value: "airteltigo", label: "AirtelTigo Money" },
  { value: "visa", label: "Visa Card" },
  { value: "mastercard", label: "Mastercard" },
];

export default function Cart() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState("mtn_momo");
  const [address, setAddress] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const { data: cart, isLoading } = useGetCart();
  const { mutate: removeItem } = useRemoveCartItem();
  const { mutate: clearCart } = useClearCart();
  const { mutate: createOrder, isPending } = useCreateOrder();

  function handleRemove(itemId: number) {
    removeItem({ itemId }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }),
    });
  }

  function handleClear() {
    clearCart(undefined, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }),
    });
  }

  function handleCheckout() {
    if (!address) { toast({ title: "Please enter a delivery address", variant: "destructive" }); return; }
    createOrder({ data: { paymentMethod: paymentMethod as OrderInputPaymentMethod, deliveryAddress: address } }, {
      onSuccess: (order) => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
        toast({ title: "Order placed!", description: `Order #${order.id} confirmed. Estimated delivery: ${order.estimatedDelivery}` });
        setLocation("/dashboard");
      },
      onError: () => toast({ title: "Checkout failed", description: "Please try again.", variant: "destructive" }),
    });
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1,2].map(i => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  const items = cart?.items ?? [];
  const total = cart?.total ?? 0;

  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Continue shopping
      </Link>
      <h1 className="text-3xl font-serif font-bold mb-8">Your Care Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <ShoppingBag className="h-16 w-16 text-muted mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Browse our care kits to get started.</p>
          <Link href="/products"><Button>Shop now</Button></Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-4 bg-card border border-border/50 rounded-xl p-4"
              >
                <img src={item.imageUrl || "/images/product-kit.png"} alt={item.productName} className="w-20 h-20 rounded-lg object-cover bg-secondary/20 shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{item.productName}</h3>
                  <p className="text-muted-foreground text-sm">Qty: {item.quantity}</p>
                  <p className="text-primary font-bold">GHS {(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-2"
                  data-testid={`button-remove-${item.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
            <Button variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground">
              Clear all items
            </Button>
          </div>

          <div className="bg-card border border-border/50 rounded-xl p-6 h-fit space-y-5">
            <h2 className="font-semibold text-lg">Order Summary</h2>

            <div className="space-y-2 text-sm">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-muted-foreground">
                  <span className="truncate mr-2">{item.productName} x{item.quantity}</span>
                  <span>GHS {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-base pt-2 border-t">
                <span>Total</span>
                <span className="text-primary">GHS {total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-1.5">Delivery address</p>
                <Input
                  placeholder="Hall/hostel, campus..."
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  data-testid="input-delivery-address"
                />
              </div>
              <div>
                <p className="text-sm font-medium mb-1.5">Payment method</p>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger data-testid="select-payment">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button className="w-full h-11" onClick={handleCheckout} disabled={isPending} data-testid="button-checkout">
              {isPending ? "Placing order..." : `Pay GHS ${total.toFixed(2)}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
