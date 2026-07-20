import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Calendar as CalendarIcon, Users, Plane, Info, Clock, RefreshCw, Briefcase, Package, Accessibility, CalendarRange } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { VEHICLES } from '../../lib/constants';
import { calculateDistance, calculateFareAmount } from '../../lib/fareCalculator';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon issue in react
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to recenter map when coordinates change
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
    } else if (destCoords) {
      map.setView([destCoords.lat, destCoords.lng], 14);
    }
  }, [pickupCoords, destCoords, map]);
  
  return null;
}

export interface ManualBookingProps {
  isEditMode?: boolean;
  initialBookingData?: any;
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

const ManualBooking = ({ isEditMode, initialBookingData, onSave, onCancel }: ManualBookingProps = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialState = initialBookingData || location.state || {};
  const serviceType = initialState.serviceType || 'City Transfer';
  
  const [selectedVehicle, setSelectedVehicle] = useState(
    initialState.vehicleType 
      ? VEHICLES.find(v => v.name === initialState.vehicleType)?.id || VEHICLES[0].id 
      : VEHICLES[0].id
  );
  const [pickup, setPickup] = useState(initialState.pickup || '');
  const [destination, setDestination] = useState(initialState.destination || '');
  const [datetime, setDatetime] = useState(
    initialState.datetime ? initialState.datetime.slice(0, 16) : (initialState.when || '')
  );
  const [passengers, setPassengers] = useState(initialState.passengers?.toString() || '1');
  const [flightNumber, setFlightNumber] = useState(initialState.flightNumber || '');
  const [instructions, setInstructions] = useState('');
  
  // New dynamic fields
  const [duration, setDuration] = useState('4');
  const [isReturnTrip, setIsReturnTrip] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [billingRef, setBillingRef] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [packageSize, setPackageSize] = useState('Small (Fits in a shoebox)');
  const [accessibilityNotes, setAccessibilityNotes] = useState('');
  const [days, setDays] = useState('1');
  
  const [pickupCoords, setPickupCoords] = useState<{lat: number, lng: number} | null>(null);
  const [destCoords, setDestCoords] = useState<{lat: number, lng: number} | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    if (pickupCoords && destCoords) {
      setDistance(calculateDistance(pickupCoords.lat, pickupCoords.lng, destCoords.lat, destCoords.lng));
    } else {
      setDistance(null);
    }
  }, [pickupCoords, destCoords]);

  // Booleans for field visibility based on serviceType
  const showDestination = serviceType !== 'Hourly Rental';
  const showPassengers = serviceType !== 'Package Delivery';
  const showVehicleSelection = serviceType !== 'Package Delivery';
  const showFlightNumber = serviceType === 'Airport Transfer';
  const showDuration = serviceType === 'Hourly Rental';
  const showReturnTrip = serviceType === 'Outstation';
  const showCorporateInfo = serviceType === 'Corporate';
  const showPackageInfo = serviceType === 'Package Delivery';
  const showAccessibility = serviceType === 'Accessible Rides';
  const showGroupDays = serviceType === 'Group Shuttle';

  const geocodeAddress = async (address: string, type: 'pickup' | 'dest') => {
    if (!address) {
      if (type === 'pickup') setPickupCoords(null);
      if (type === 'dest') setDestCoords(null);
      return;
    }
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

  // Geocode initial state if provided from Landing Page
  useEffect(() => {
    if (initialState.pickup) geocodeAddress(initialState.pickup, 'pickup');
    if (initialState.destination) geocodeAddress(initialState.destination, 'dest');
  }, []);

  const calculateFare = (vehicle: any) => {
    return calculateFareAmount(vehicle, distance, showDestination, parseInt(duration));
  };

  const handleEstimate = () => {
    if (!pickup || (!destination && showDestination) || !datetime) {
      alert("Please fill in required fields (pickup, destination, datetime).");
      return;
    }
    
    const vehicle = VEHICLES.find(v => v.id === selectedVehicle);
    
    const bookingDetails = {
      pickup,
      destination: showDestination ? destination : null,
      datetime,
      passengers: showPassengers ? parseInt(passengers) : 1,
      flightNumber: showFlightNumber ? flightNumber : null,
      instructions,
      vehicleType: showVehicleSelection ? vehicle?.name : 'Delivery Van',
      basePrice: showVehicleSelection && vehicle ? calculateFare(vehicle) : 15,
      serviceType,
      metadata: {
        ...(showDuration && { duration }),
        ...(showReturnTrip && { isReturnTrip }),
        ...(showCorporateInfo && { companyName, billingRef }),
        ...(showPackageInfo && { recipientName, recipientPhone, packageSize }),
        ...(showAccessibility && { accessibilityNotes }),
        ...(showGroupDays && { days })
      }
    };

    if (isEditMode && onSave) {
      onSave({ ...bookingDetails, fare: bookingDetails.basePrice });
    } else {
      navigate('/book/review', { 
        state: { bookingDetails, source: 'manual' } 
      });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        
        {/* Form Column */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Ride Details</h3>
              <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">{serviceType}</span>
            </div>
            
            <div className="space-y-3">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                <Input value={pickup} onChange={e => setPickup(e.target.value)} onBlur={() => geocodeAddress(pickup, 'pickup')} placeholder="Pickup location" className="pl-10 h-12 bg-card" />
              </div>
              
              {showDestination && (
                <div className="relative">
                  <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                  <Input value={destination} onChange={e => setDestination(e.target.value)} onBlur={() => geocodeAddress(destination, 'dest')} placeholder="Destination" className="pl-10 h-12 bg-card" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input value={datetime} onChange={e => setDatetime(e.target.value)} type="datetime-local" className="pl-10 h-12 bg-card" />
              </div>
              
              {showPassengers && (
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <select value={passengers} onChange={e => setPassengers(e.target.value)} className="w-full h-12 pl-10 pr-4 rounded-md border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent appearance-none">
                    {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Passenger{n > 1 ? 's' : ''}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* Dynamic Fields based on Service Type */}
            {showFlightNumber && (
              <div className="relative">
                <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input value={flightNumber} onChange={e => setFlightNumber(e.target.value)} placeholder="Flight Number (Optional)" className="pl-10 h-12 bg-card" />
              </div>
            )}
            
            {showDuration && (
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <select value={duration} onChange={e => setDuration(e.target.value)} className="w-full h-12 pl-10 pr-4 rounded-md border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent appearance-none">
                  {[2, 4, 6, 8, 10, 12].map(n => <option key={n} value={n}>{n} Hours</option>)}
                </select>
              </div>
            )}

            {showReturnTrip && (
              <div className="flex items-center gap-3 bg-card border border-border p-3 rounded-md">
                <RefreshCw className={`w-5 h-5 ${isReturnTrip ? 'text-accent' : 'text-muted-foreground'}`} />
                <label className="text-sm flex-1 cursor-pointer select-none" onClick={() => setIsReturnTrip(!isReturnTrip)}>Include Return Trip (Round Trip)</label>
                <input type="checkbox" checked={isReturnTrip} onChange={e => setIsReturnTrip(e.target.checked)} className="w-5 h-5 accent-accent cursor-pointer" />
              </div>
            )}

            {showCorporateInfo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Company Name" className="pl-10 h-12 bg-card" />
                 </div>
                 <div className="relative">
                    <Input value={billingRef} onChange={e => setBillingRef(e.target.value)} placeholder="Billing Reference" className="px-4 h-12 bg-card" />
                 </div>
              </div>
            )}

            {showPackageInfo && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder="Recipient Name" className="pl-10 h-12 bg-card" />
                   </div>
                   <div className="relative">
                      <Input value={recipientPhone} onChange={e => setRecipientPhone(e.target.value)} placeholder="Recipient Phone" className="px-4 h-12 bg-card" />
                   </div>
                </div>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <select value={packageSize} onChange={e => setPackageSize(e.target.value)} className="w-full h-12 pl-10 pr-4 rounded-md border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent appearance-none">
                    <option value="Small (Fits in a shoebox)">Small (Fits in a shoebox)</option>
                    <option value="Medium (Fits in a car seat)">Medium (Fits in a car seat)</option>
                    <option value="Large (Fits in a trunk)">Large (Fits in a trunk)</option>
                  </select>
                </div>
              </div>
            )}

            {showAccessibility && (
              <div className="relative">
                <Accessibility className="absolute left-3 top-4 w-5 h-5 text-muted-foreground" />
                <textarea value={accessibilityNotes} onChange={e => setAccessibilityNotes(e.target.value)} placeholder="Accessibility requirements (e.g. wheelchair ramp needed)..." className="w-full min-h-[80px] pl-10 p-3 rounded-md border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-y"></textarea>
              </div>
            )}

            {showGroupDays && (
               <div className="relative">
                 <CalendarRange className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                 <select value={days} onChange={e => setDays(e.target.value)} className="w-full h-12 pl-10 pr-4 rounded-md border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent appearance-none">
                   {[1, 2, 3, 4, 5, 7, 14].map(n => <option key={n} value={n}>{n} Day{n > 1 ? 's' : ''}</option>)}
                 </select>
               </div>
            )}
          </div>

          {showVehicleSelection && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Select Vehicle</h3>
              <div className="grid gap-4">
                {VEHICLES.map((vehicle) => (
                  <Card 
                    key={vehicle.id}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedVehicle === vehicle.id 
                        ? 'border-2 border-accent bg-accent/5' 
                        : 'border-border hover:border-accent/50'
                    }`}
                    onClick={() => setSelectedVehicle(vehicle.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-12 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                        Img
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-semibold">{vehicle.name}</h4>
                          <span className="font-semibold text-accent text-right">
                            {calculateFare(vehicle) !== null 
                              ? `S$ ${calculateFare(vehicle)?.toFixed(2)}` 
                              : <span className="text-sm font-normal text-muted-foreground">Enter locations to see fare</span>
                            }
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{vehicle.type} • Up to {vehicle.capacity} pax</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Special Instructions</h3>
            <textarea 
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              className="w-full min-h-[100px] p-3 rounded-md border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-y"
              placeholder="Any other special instructions..."
            ></textarea>
          </div>

          {isEditMode ? (
            <div className="flex gap-4">
              <Button onClick={onCancel} className="flex-1 h-14 text-lg bg-muted hover:bg-muted/90 text-foreground rounded-xl shadow-sm">
                Cancel
              </Button>
              <Button onClick={handleEstimate} className="flex-1 h-14 text-lg bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg">
                Save Changes
              </Button>
            </div>
          ) : (
            <Button onClick={handleEstimate} className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg">
              Proceed to Booking
            </Button>
          )}
        </div>

        {/* Map Preview */}
        <div className="h-[600px] lg:h-auto rounded-2xl bg-muted border border-border overflow-hidden relative shadow-inner">
          <Card className="h-[300px] lg:h-full bg-muted/50 border-border overflow-hidden relative flex flex-col items-center justify-center">
            <MapContainer 
              center={pickupCoords ? [pickupCoords.lat, pickupCoords.lng] : (destCoords ? [destCoords.lat, destCoords.lng] : [1.3521, 103.8198])} 
              zoom={12} 
              style={{ height: '100%', width: '100%', zIndex: 10 }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {pickupCoords && (
                <Marker position={[pickupCoords.lat, pickupCoords.lng]}>
                  <Popup>Pickup Location</Popup>
                </Marker>
              )}
              {destCoords && showDestination && (
                <Marker position={[destCoords.lat, destCoords.lng]}>
                  <Popup>Destination</Popup>
                </Marker>
              )}
              {pickupCoords && destCoords && showDestination && (
                <Polyline 
                  positions={[
                    [pickupCoords.lat, pickupCoords.lng], 
                    [destCoords.lat, destCoords.lng]
                  ]} 
                  color="#1A1F3C" 
                  weight={4} 
                  dashArray="10, 10" 
                />
              )}
              <MapBounds pickupCoords={pickupCoords} destCoords={showDestination ? destCoords : null} />
            </MapContainer>
          </Card>
          <div className="absolute top-4 left-4 right-4 bg-background/90 backdrop-blur-sm p-3 rounded-xl border border-border shadow-sm flex items-start gap-3 z-20">
            <Info className="w-5 h-5 text-accent mt-0.5" />
            <p className="text-sm text-foreground">Drag the map or enter addresses to adjust your pickup and destination locations.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ManualBooking;
