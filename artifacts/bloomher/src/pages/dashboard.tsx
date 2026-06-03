import { useGetDashboardSummary, useGetRecentActivity, useListOrders, useListAppointments, useGetUserSubscription } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Calendar, CreditCard, Star, ShoppingBag, Activity } from "lucide-react";
import { motion } from "framer-motion";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  scheduled: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  active: "bg-green-100 text-green-800",
};

export default function Dashboard() {
  const { logout } = useAuth();
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity();
  const { data: orders, isLoading: ordersLoading } = useListOrders();
  const { data: appointments, isLoading: apptsLoading } = useListAppointments();
  const { data: subscription } = useGetUserSubscription();

  const activeSub = subscription && (subscription as any).id ? subscription : null;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-serif font-bold text-foreground">My Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your wellness overview.</p>
        </motion.div>
        <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground">Sign out</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { icon: ShoppingBag, label: "Total Orders", value: summaryLoading ? null : summary?.totalOrders ?? 0, color: "text-blue-600 bg-blue-50" },
          { icon: Star, label: "Subscription", value: summaryLoading ? null : (summary?.activeSubscription ? "Active" : "None"), color: "text-green-600 bg-green-50" },
          { icon: Calendar, label: "Upcoming Appts", value: summaryLoading ? null : summary?.upcomingAppointments ?? 0, color: "text-purple-600 bg-purple-50" },
          { icon: CreditCard, label: "Total Spent", value: summaryLoading ? null : `GHS ${(summary?.totalSpent ?? 0).toFixed(2)}`, color: "text-pink-600 bg-pink-50" },
        ].map(({ icon: Icon, label, value, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card border border-border/50 rounded-xl p-5">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
            {value === null ? <Skeleton className="h-7 w-20" /> : <p className="text-xl font-bold text-foreground">{value}</p>}
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" /> Recent Activity
          </h2>
          {activityLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
          ) : (activity ?? []).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm bg-card border border-border/50 rounded-xl">No activity yet. Start shopping!</div>
          ) : (
            <div className="space-y-3">
              {(activity ?? []).slice(0, 6).map(item => (
                <div key={item.id} className="bg-card border border-border/50 rounded-xl p-4">
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-8">
          {/* Subscription Status */}
          <div>
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" /> Subscription
            </h2>
            {activeSub ? (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{(activeSub as any).planName}</h3>
                  <Badge className={STATUS_COLORS[(activeSub as any).status] || ""}>{(activeSub as any).status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Next delivery: <span className="font-medium text-foreground">{(activeSub as any).nextDelivery}</span></p>
                {(activeSub as any).deliveryAddress && <p className="text-sm text-muted-foreground mt-1">To: {(activeSub as any).deliveryAddress}</p>}
              </div>
            ) : (
              <div className="bg-card border border-dashed border-border rounded-xl p-6 text-center">
                <p className="text-muted-foreground text-sm mb-3">No active subscription</p>
                <Link href="/subscriptions"><Button size="sm">View plans</Button></Link>
              </div>
            )}
          </div>

          {/* Orders */}
          <div>
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" /> Recent Orders
            </h2>
            {ordersLoading ? (
              <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
            ) : (orders ?? []).length === 0 ? (
              <div className="bg-card border border-dashed border-border rounded-xl p-6 text-center">
                <p className="text-muted-foreground text-sm mb-3">No orders yet</p>
                <Link href="/products"><Button size="sm">Shop now</Button></Link>
              </div>
            ) : (
              <div className="space-y-3">
                {(orders ?? []).slice(0, 3).map(order => (
                  <div key={order.id} className="bg-card border border-border/50 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-sm">Order #{order.id}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{new Date(order.createdAt).toLocaleDateString()} · GHS {order.total.toFixed(2)}</p>
                      {order.estimatedDelivery && <p className="text-xs text-muted-foreground">Estimated: {order.estimatedDelivery}</p>}
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"}`}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Appointments */}
          <div>
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> Upcoming Appointments
            </h2>
            {apptsLoading ? (
              <Skeleton className="h-20 rounded-xl" />
            ) : (appointments ?? []).filter(a => a.status === "scheduled").length === 0 ? (
              <div className="bg-card border border-dashed border-border rounded-xl p-6 text-center">
                <p className="text-muted-foreground text-sm mb-3">No upcoming appointments</p>
                <Link href="/telehealth"><Button size="sm">Book consultation</Button></Link>
              </div>
            ) : (
              <div className="space-y-3">
                {(appointments ?? []).filter(a => a.status === "scheduled").slice(0, 3).map(appt => (
                  <div key={appt.id} className="bg-card border border-border/50 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-sm capitalize">{appt.type.replace(/_/g, " ")} with {appt.nurseName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{appt.date} at {appt.time}</p>
                      {appt.meetingLink && <a href={appt.meetingLink} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">Join video call</a>}
                    </div>
                    <Badge className={STATUS_COLORS[appt.status] || ""}>{appt.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
