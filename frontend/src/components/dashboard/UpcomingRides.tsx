import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Calendar, MapPin, Navigation, Car, AlertCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useNavigate } from 'react-router-dom';

export const UpcomingRides = ({ bookings, onCancelBooking, onModifyBooking }: { bookings: any[], onCancelBooking: (id: string) => void, onModifyBooking: (b: any) => void }) => {
  const navigate = useNavigate();
  // Filter for future or pending/confirmed bookings
  const upcoming = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed');

  return (
    <div className="p-8 max-w-5xl space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-foreground">Upcoming Rides</h2>
        <Link to="/book/voice">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Book New Ride</Button>
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center border-dashed bg-muted/30">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Car className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No upcoming rides</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            You don't have any scheduled rides yet. Book a voice-activated chauffeur now.
          </p>
          <Link to="/book/voice">
            <Button className="bg-accent hover:bg-accent/90 text-primary font-semibold">
              Book a Ride
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6">
          {upcoming.map((booking, idx) => (
            <Card key={idx} className="overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <div className="border-b border-border bg-muted/30 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{new Date(booking.datetime).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <div className="flex items-center text-sm text-muted-foreground gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(booking.datetime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 text-xs font-semibold uppercase rounded-full ${booking.status === 'confirmed' ? 'bg-success/10 text-success' : 'bg-warning/20 text-warning-foreground'}`}>
                    {booking.status}
                  </span>
                  <p className="text-xl font-bold mt-1 text-foreground">S$ {booking.fare.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="p-6 grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center mt-1">
                      <div className="w-3 h-3 rounded-full bg-accent"></div>
                      <div className="w-0.5 h-10 bg-border my-1"></div>
                      <div className="w-3 h-3 rounded-sm bg-primary"></div>
                    </div>
                    <div className="space-y-4 flex-1">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Pickup</p>
                        <p className="font-medium text-foreground">{booking.pickup}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Drop-off</p>
                        <p className="font-medium text-foreground">{booking.destination || 'As directed'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 border-l border-border pl-6 flex flex-col justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Service Details</p>
                    <p className="font-medium flex items-center gap-2">
                      <Car className="w-4 h-4 text-accent" /> {booking.serviceType} • {booking.vehicleType}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Passengers: {booking.passengers}</p>
                  </div>
                  
                  <div className="flex gap-2 pt-4 flex-wrap">
                    <Button variant="outline" className="flex-1 min-w-[100px] border-primary/20 text-primary hover:bg-primary/5" onClick={() => onModifyBooking(booking)}>Modify</Button>
                    <Button variant="outline" className="flex-1 min-w-[100px] border-destructive/20 text-destructive hover:bg-destructive/10" onClick={() => onCancelBooking(booking.id)}>Cancel</Button>
                    <Button className="w-full mt-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => navigate(`/dashboard/track/${booking.id}`)}>Track Ride</Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
