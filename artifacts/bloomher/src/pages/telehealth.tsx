import { useState } from "react";
import { useListAvailableSlots, useBookAppointment, useListAppointments, getListAppointmentsQueryKey, type AppointmentInputType } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, User, Video, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const APPOINTMENT_TYPES = [
  { value: "menstrual_health", label: "Menstrual Health", desc: "Cycle irregularities, pain, flow concerns" },
  { value: "family_planning", label: "Family Planning", desc: "Contraception, fertility, planning support" },
  { value: "general_wellness", label: "General Wellness", desc: "Overall reproductive health check-in" },
  { value: "referral", label: "Referral Request", desc: "Get referred to a specialist or facility" },
];

export default function Telehealth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string; nurseName: string } | null>(null);
  const [consultType, setConsultType] = useState("menstrual_health");
  const [concern, setConcern] = useState("");

  const { data: slotsData, isLoading: slotsLoading } = useListAvailableSlots(
    selectedDate ? { date: selectedDate } : {},
  );
  const { data: appointmentsData, isLoading: apptsLoading } = useListAppointments();
  const { mutate: bookAppointment, isPending: isBooking } = useBookAppointment();

  const slots = Array.isArray(slotsData) ? slotsData : [];
  const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];
  const availableDates = [...new Set(slots.map(s => s.date))];

  function handleBook() {
    if (!selectedSlot) { toast({ title: "Please select a time slot", variant: "destructive" }); return; }
    if (!concern) { toast({ title: "Please describe your concern", variant: "destructive" }); return; }

    bookAppointment({
      data: { date: selectedSlot.date, time: selectedSlot.time, type: consultType as AppointmentInputType, concern }
    }, {
      onSuccess: (appt) => {
        queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
        toast({ title: "Appointment booked!", description: `With ${appt.nurseName} on ${appt.date} at ${appt.time}` });
        setSelectedSlot(null); setConcern("");
      },
      onError: () => toast({ title: "Booking failed", description: "Please try again.", variant: "destructive" }),
    });
  }

  const upcomingAppts = appointments.filter(a => a.status === "scheduled");
  const pastAppts = appointments.filter(a => a.status !== "scheduled");

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl font-serif font-bold text-foreground mb-3">Telehealth Consultations</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">Private, professional nurse consultations — from menstrual health to family planning, all from the comfort of your campus.</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-4 mb-12">
        {[
          { icon: Video, title: "Private Video Call", desc: "Secure, confidential consultation with a qualified nurse" },
          { icon: Clock, title: "Flexible Scheduling", desc: "Choose from weekday morning, afternoon, and evening slots" },
          { icon: CheckCircle, title: "No Judgment", desc: "A safe space to discuss any reproductive health concern" },
        ].map(({ icon: Icon, title, desc }, i) => (
          <motion.div key={title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-card border border-border/50 rounded-xl p-6 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="book">
        <TabsList className="mb-8">
          <TabsTrigger value="book">Book Consultation</TabsTrigger>
          <TabsTrigger value="upcoming">My Appointments ({upcomingAppts.length})</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="book">
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div>
                <h2 className="font-semibold text-lg mb-4">1. Choose consultation type</h2>
                <div className="space-y-3">
                  {APPOINTMENT_TYPES.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setConsultType(type.value)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        consultType === type.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                      data-testid={`type-${type.value}`}
                    >
                      <p className="font-medium">{type.label}</p>
                      <p className="text-sm text-muted-foreground">{type.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="font-semibold text-lg mb-4">2. Describe your concern</h2>
                <Textarea
                  placeholder="Tell us briefly what you'd like to discuss..."
                  value={concern}
                  onChange={e => setConcern(e.target.value)}
                  rows={4}
                  data-testid="input-concern"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="font-semibold text-lg mb-4">3. Select a date</h2>
                {slotsLoading ? (
                  <div className="grid grid-cols-3 gap-2">
                    {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 rounded-lg" />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {availableDates.map(date => (
                      <button
                        key={date}
                        onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                        className={`p-3 rounded-lg text-sm font-medium border-2 transition-all ${
                          selectedDate === date ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/30"
                        }`}
                        data-testid={`date-${date}`}
                      >
                        {new Date(date + "T12:00:00").toLocaleDateString("en-GH", { weekday: "short", month: "short", day: "numeric" })}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedDate && (
                <div>
                  <h2 className="font-semibold text-lg mb-4">4. Choose a time</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {slots.filter(s => s.date === selectedDate && s.available).map(slot => (
                      <button
                        key={`${slot.date}-${slot.time}`}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-3 rounded-lg text-sm border-2 transition-all ${
                          selectedSlot?.time === slot.time && selectedSlot?.date === slot.date
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        }`}
                        data-testid={`slot-${slot.time}`}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">{slot.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{slot.nurseName}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedSlot && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <h3 className="font-semibold mb-2">Booking summary</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p><Calendar className="inline h-3.5 w-3.5 mr-1" />{new Date(selectedSlot.date + "T12:00:00").toLocaleDateString("en-GH", { weekday: "long", month: "long", day: "numeric" })}</p>
                    <p><Clock className="inline h-3.5 w-3.5 mr-1" />{selectedSlot.time}</p>
                    <p><User className="inline h-3.5 w-3.5 mr-1" />{selectedSlot.nurseName}</p>
                    <p><Video className="inline h-3.5 w-3.5 mr-1" />Video consultation (link provided after booking)</p>
                  </div>
                </div>
              )}

              <Button className="w-full h-11" onClick={handleBook} disabled={isBooking || !selectedSlot} data-testid="button-book">
                {isBooking ? "Booking..." : "Confirm Appointment"}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="upcoming">
          {apptsLoading ? <Skeleton className="h-32 rounded-xl" /> :
          upcomingAppts.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">No upcoming appointments. Book one above.</div>
          ) : (
            <div className="space-y-4">
              {upcomingAppts.map(appt => (
                <div key={appt.id} className="bg-card border border-border/50 rounded-xl p-5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="capitalize">{appt.type.replace(/_/g, " ")}</Badge>
                      <Badge variant="outline" className="text-green-600 border-green-200">Scheduled</Badge>
                    </div>
                    <p className="font-semibold">{appt.nurseName}</p>
                    <p className="text-sm text-muted-foreground">{appt.date} at {appt.time}</p>
                    {appt.meetingLink && (
                      <a href={appt.meetingLink} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline">Join video call</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          {pastAppts.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">No past appointments yet.</div>
          ) : (
            <div className="space-y-4">
              {pastAppts.map(appt => (
                <div key={appt.id} className="bg-card border border-border/50 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="capitalize">{appt.type.replace(/_/g, " ")}</Badge>
                    <Badge variant="secondary">{appt.status}</Badge>
                  </div>
                  <p className="font-semibold">{appt.nurseName}</p>
                  <p className="text-sm text-muted-foreground">{appt.date} at {appt.time}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
