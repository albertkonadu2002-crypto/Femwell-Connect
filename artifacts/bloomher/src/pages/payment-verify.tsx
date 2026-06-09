import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";

export default function PaymentVerify() {
  const [, setLocation] = useLocation();
  const { token } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference");

    if (!reference) {
      setStatus("failed");
      setMessage("No payment reference found.");
      return;
    }

    async function verify() {
      try {
        const res = await fetch(`/api/payments/verify/${reference}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.status === "success") {
          setStatus("success");
          setMessage(`Payment of GHS ${data.amount?.toFixed(2)} confirmed. Order #${data.orderId} is now paid.`);
        } else {
          setStatus("failed");
          setMessage("Payment was not successful. Please try again.");
        }
      } catch {
        setStatus("failed");
        setMessage("Could not verify payment. Please contact support.");
      }
    }

    if (token) verify();
    else {
      setStatus("failed");
      setMessage("Please log in to verify your payment.");
    }
  }, [token]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-lg">
      <Link href="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Continue shopping
      </Link>

      <Card className="border-border/50 shadow-lg">
        <CardContent className="p-8 text-center">
          {status === "loading" && (
            <>
              <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
              <h1 className="text-2xl font-serif font-bold mb-2">Verifying payment...</h1>
              <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-serif font-bold mb-2 text-green-700">Payment Successful!</h1>
              <p className="text-muted-foreground mb-6">{message}</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => setLocation("/dashboard")}>View Orders</Button>
                <Button variant="outline" onClick={() => setLocation("/products")}>Continue Shopping</Button>
              </div>
            </>
          )}

          {status === "failed" && (
            <>
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
              <h1 className="text-2xl font-serif font-bold mb-2 text-red-700">Payment Failed</h1>
              <p className="text-muted-foreground mb-6">{message}</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => setLocation("/cart")}>Try Again</Button>
                <Button variant="outline" onClick={() => setLocation("/products")}>Continue Shopping</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
