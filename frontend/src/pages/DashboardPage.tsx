import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { Globe, Clock, MapPin, Navigation, Calendar } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/ui/card';
import { UpcomingRides } from '../components/dashboard/UpcomingRides';
import { SavedAddresses } from '../components/dashboard/SavedAddresses';
import { RideHistory } from '../components/dashboard/RideHistory';
import { ProfileSettings } from '../components/dashboard/ProfileSettings';
import TrackRidePage from './TrackRidePage';

import { useNavigate } from 'react-router-dom';
import ManualBooking from '../components/booking/ManualBooking';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { apiUrl } from '../lib/api';

const DashboardOverview = ({ bookings, onCancelBooking, onModifyBooking }: { bookings: any[], onCancelBooking: (id: string) => void, onModifyBooking: (b: any) => void }) => {
  const navigate = useNavigate();
  const activeBooking = bookings.find(b => b.status === 'pending' || b.status === 'confirmed');
  const pastBookings = bookings.filter(b => b !== activeBooking);

  return (
    <div className="p-8 max-w-5xl space-y-8">
      {activeBooking && (
        <div className="space-y-4">
          <h2 className="text-2xl font-serif font-bold text-foreground">Active Ride</h2>
          <Card className="p-6 border-accent ring-1 ring-accent bg-accent/5 shadow-md">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                    <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Booking Confirmed</h3>
                    <p className="text-sm text-muted-foreground">Awaiting Driver Assignment</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/50">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" /> 
                      <p className="text-sm font-medium">{activeBooking.pickup}</p>
                    </div>
                    {activeBooking.destination && (
                      <div className="flex items-start gap-2">
                        <Navigation className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" /> 
                        <p className="text-sm font-medium">{activeBooking.destination}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-medium">{new Date(activeBooking.datetime).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Vehicle:</span>
                      <span className="font-medium">{activeBooking.vehicleType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Fare:</span>
                      <span className="font-medium text-accent">S$ {activeBooking.fare.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:w-48 flex flex-col gap-3">
                <button onClick={() => navigate(`/dashboard/track/${activeBooking.id}`)} className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium shadow-sm transition-all">
                  Track Ride
                </button>
                <button onClick={() => onModifyBooking(activeBooking)} className="w-full h-12 border border-border hover:bg-muted/50 text-foreground rounded-xl font-medium shadow-sm transition-all">
                  Modify
                </button>
                <button onClick={() => onCancelBooking(activeBooking.id)} className="w-full h-12 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-xl font-medium transition-all">
                  Cancel Booking
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-serif font-bold text-foreground">Recent Bookings</h2>
        {pastBookings.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground border-dashed">No past bookings found.</Card>
        ) : (
          <div className="grid gap-4">
            {pastBookings.map((booking, idx) => (
              <Card key={idx} className="p-6 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:shadow-md transition-all cursor-pointer">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {new Date(booking.datetime).toLocaleString()}
                    <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-xs ml-2 uppercase font-semibold">{booking.status}</span>
                  </div>
                  <div className="flex flex-col gap-1 mt-2">
                    <div className="flex items-start gap-2 font-medium">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" /> <span className="line-clamp-1">{booking.pickup}</span>
                    </div>
                    {booking.destination && (
                      <div className="flex items-start gap-2 font-medium">
                        <Navigation className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" /> <span className="line-clamp-1">{booking.destination}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0 md:w-32">
                  <p className="text-xl font-bold text-foreground">S$ {booking.fare.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">{booking.vehicleType}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


const AppSettings = () => <div className="p-6"><h2 className="text-2xl font-semibold mb-6">Settings</h2><p>Toggle switches...</p></div>;

const DashboardPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [bookingToModify, setBookingToModify] = useState<any>(null);

  const fetchBookings = () => {
    if (user?.id) {
      fetch(apiUrl(`/api/bookings/${user.id}`))
        .then(res => res.json())
        .then(data => setBookings(data.bookings || []))
        .catch(console.error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to cancel this ride?")) return;
    try {
      await fetch(apiUrl(`/api/bookings/${bookingId}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });
      alert('Booking cancelled successfully.');
      fetchBookings();
    } catch (e) {
      console.error(e);
      alert('Failed to cancel booking.');
    }
  };

  const handleModifyBooking = (booking: any) => {
    setBookingToModify(booking);
    setIsModifyModalOpen(true);
  };

  const handleSaveModification = async (updatedData: any) => {
    try {
      await fetch(apiUrl(`/api/bookings/${bookingToModify.id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      alert('Booking modified successfully.');
      setIsModifyModalOpen(false);
      setBookingToModify(null);
      fetchBookings();
    } catch (e) {
      console.error(e);
      alert('Failed to modify booking.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-8 border-b border-border bg-card sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Welcome back, {user?.email?.split('@')[0] || 'User'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <Globe className="w-4 h-4 mr-2" />
              EN
            </button>
            <div className="w-10 h-10 rounded-full border-2 border-border overflow-hidden bg-muted">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh" alt="avatar" className="w-full h-full" />
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<DashboardOverview bookings={bookings} onCancelBooking={handleCancelBooking} onModifyBooking={handleModifyBooking} />} />
            <Route path="/upcoming" element={<UpcomingRides bookings={bookings} onCancelBooking={handleCancelBooking} onModifyBooking={handleModifyBooking} />} />
            <Route path="/track/:bookingId" element={<TrackRidePage />} />
            <Route path="/history" element={<RideHistory bookings={bookings} />} />
            <Route path="/addresses" element={<SavedAddresses />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="/settings" element={<AppSettings />} />
          </Routes>
        </div>
      </main>

      {isModifyModalOpen && bookingToModify && (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col">
          <div className="flex-1 w-full h-full">
            <ManualBooking 
              isEditMode={true} 
              initialBookingData={{
                ...bookingToModify,
                when: bookingToModify.datetime,
                ...bookingToModify.metadata
              }}
              onSave={handleSaveModification}
              onCancel={() => {
                setIsModifyModalOpen(false);
                setBookingToModify(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
