import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Clock, MapPin, Navigation, User, Phone, CheckCircle2, Navigation2, CheckCircle } from 'lucide-react';
import { apiUrl } from '../lib/api';

// Fix leaflet icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapBounds({ pickupCoords, destCoords }: { pickupCoords: any, destCoords: any }) {
  const map = useMap();
  useEffect(() => {
    if (pickupCoords && destCoords) {
      const bounds = L.latLngBounds(
        [pickupCoords.lat, pickupCoords.lng], 
        [destCoords.lat, destCoords.lng]
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (pickupCoords) {
      map.setView([pickupCoords.lat, pickupCoords.lng], 14);
    }
  }, [pickupCoords, destCoords, map]);
  return null;
}

const TrackRidePage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState<any>(null);
  const [pickupCoords, setPickupCoords] = useState<{lat: number, lng: number} | null>(null);
  const [destCoords, setDestCoords] = useState<{lat: number, lng: number} | null>(null);

  // Simulated status progression state (0: assignment, 1: en route, 2: arrived)
  const [simulatedStatusIndex, setSimulatedStatusIndex] = useState(0);

  useEffect(() => {
    if (user?.id) {
      fetch(apiUrl(`/api/bookings/${user.id}`))
        .then(res => res.json())
        .then(data => {
          const found = data.bookings.find((b: any) => b.id === bookingId);
          if (found) {
            setBooking(found);
            geocodeAddress(found.pickup, 'pickup');
            if (found.destination) geocodeAddress(found.destination, 'dest');
          }
        })
        .catch(console.error);
    }
  }, [user, bookingId]);

  useEffect(() => {
    // Simulate real-time ride tracking status changes
    const timer1 = setTimeout(() => setSimulatedStatusIndex(1), 5000);
    const timer2 = setTimeout(() => setSimulatedStatusIndex(2), 10000);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, []);

  const geocodeAddress = async (address: string, type: 'pickup' | 'dest') => {
    if (!address) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        if (type === 'pickup') setPickupCoords(coords);
        else setDestCoords(coords);
      }
    } catch (e) {
      console.error("Geocoding failed", e);
    }
  };

  if (!booking) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statuses = [
    { label: 'Awaiting Driver', desc: 'Finding a chauffeur near you', icon: Clock },
    { label: 'Driver En Route', desc: 'Chauffeur is on the way', icon: Navigation2 },
    { label: 'Driver Arrived', desc: 'Chauffeur is at pickup location', icon: CheckCircle2 }
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ride Tracking Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 border-accent bg-card shadow-sm">
            <h3 className="text-xl font-semibold mb-6">Ride Status</h3>
            
            <div className="space-y-6">
              {statuses.map((status, idx) => {
                const isActive = idx === simulatedStatusIndex;
                const isPassed = idx < simulatedStatusIndex;
                const StatusIcon = status.icon;
                
                return (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-primary text-primary-foreground shadow-lg' : isPassed ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'}`}>
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      {idx !== statuses.length - 1 && (
                        <div className={`w-1 h-12 my-2 rounded-full ${isPassed ? 'bg-accent/50' : 'bg-muted'}`}></div>
                      )}
                    </div>
                    <div className="pt-2">
                      <h4 className={`font-semibold ${isActive || isPassed ? 'text-foreground' : 'text-muted-foreground'}`}>{status.label}</h4>
                      <p className="text-sm text-muted-foreground">{status.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6 bg-card border-border shadow-sm space-y-6">
            <h3 className="text-lg font-semibold">Booking Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Pickup</p>
                  <p className="text-sm font-medium">{booking.pickup}</p>
                </div>
              </div>
              
              {booking.destination && (
                <div className="flex items-start gap-3">
                  <Navigation className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Destination</p>
                    <p className="text-sm font-medium">{booking.destination}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Vehicle</p>
                <p className="font-semibold">{booking.vehicleType}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Fare</p>
                <p className="font-semibold text-accent">S$ {booking.fare.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Time</p>
                <p className="font-semibold text-sm">{new Date(booking.datetime).toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'})}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Date</p>
                <p className="font-semibold text-sm">{new Date(booking.datetime).toLocaleDateString()}</p>
              </div>
            </div>
          </Card>

          {simulatedStatusIndex > 0 && (
            <Card className="p-6 bg-card border-border shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 bg-muted rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">John Doe</h4>
                <p className="text-sm text-muted-foreground">Toyota Alphard • SGP 1234 A</p>
              </div>
              <Button variant="outline" size="icon" className="rounded-full shrink-0 h-10 w-10">
                <Phone className="w-4 h-4" />
              </Button>
            </Card>
          )}
        </div>

        {/* Map View */}
        <div className="lg:col-span-2 h-[500px] lg:h-[800px] rounded-2xl overflow-hidden border border-border shadow-inner relative">
          <MapContainer 
            center={pickupCoords ? [pickupCoords.lat, pickupCoords.lng] : [1.3521, 103.8198]} 
            zoom={13} 
            style={{ height: '100%', width: '100%', zIndex: 10 }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {pickupCoords && (
              <Marker position={[pickupCoords.lat, pickupCoords.lng]}>
                <Popup>Pickup Location</Popup>
              </Marker>
            )}
            
            {destCoords && (
              <Marker position={[destCoords.lat, destCoords.lng]}>
                <Popup>Destination</Popup>
              </Marker>
            )}
            
            {pickupCoords && destCoords && (
              <Polyline 
                positions={[
                  [pickupCoords.lat, pickupCoords.lng], 
                  [destCoords.lat, destCoords.lng]
                ]} 
                color="#1A1F3C" 
                weight={4} 
              />
            )}
            
            {/* Simulate Driver marker if en route */}
            {simulatedStatusIndex >= 1 && pickupCoords && (
              <Marker 
                position={[
                  pickupCoords.lat - 0.005 + (simulatedStatusIndex === 2 ? 0.005 : 0), 
                  pickupCoords.lng - 0.005 + (simulatedStatusIndex === 2 ? 0.005 : 0)
                ]}
              >
                <Popup>Driver</Popup>
              </Marker>
            )}

            <MapBounds pickupCoords={pickupCoords} destCoords={destCoords} />
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default TrackRidePage;
