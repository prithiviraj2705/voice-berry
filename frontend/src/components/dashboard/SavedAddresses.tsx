import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { MapPin, Home, Briefcase, Plus, Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { apiUrl } from '../../lib/api';

export const SavedAddresses = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form state
  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');
  const [iconType, setIconType] = useState('home');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(apiUrl(`/api/addresses/${user.id}`));
      const data = await res.json();
      setAddresses(data.addresses || []);
    } catch (err) {
      console.error('Error fetching addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  const geocodeAddress = async (query: string) => {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    throw new Error('Address not found');
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // 1. Geocode
      const { lat, lng } = await geocodeAddress(address);
      
      // 2. Save
      const res = await fetch(apiUrl('/api/addresses'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          label,
          address,
          lat,
          lng,
          iconType
        })
      });
      
      if (!res.ok) throw new Error('Failed to save address');
      
      await fetchAddresses();
      setIsAdding(false);
      setLabel('');
      setAddress('');
      setIconType('home');
    } catch (err: any) {
      setError(err.message || 'Error saving address');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await fetch(apiUrl(`/api/addresses/${id}`), { method: 'DELETE' });
      if (res.ok) {
        setAddresses(addresses.filter(a => a.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'home': return <Home className="w-5 h-5" />;
      case 'work': return <Briefcase className="w-5 h-5" />;
      default: return <MapPin className="w-5 h-5" />;
    }
  };

  return (
    <div className="p-8 max-w-5xl space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-foreground">Saved Addresses</h2>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" /> Add Address
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="p-6 mb-8 border-border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Add New Address</h3>
          {error && <p className="text-destructive text-sm mb-4">{error}</p>}
          <form onSubmit={handleAddAddress} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Label (e.g., Home, Work)</label>
                <Input 
                  placeholder="My Apartment" 
                  value={label} 
                  onChange={e => setLabel(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Icon</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={iconType}
                  onChange={e => setIconType(e.target.value)}
                >
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="map-pin">Other</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Address</label>
              <Input 
                placeholder="123 Main St, Singapore 123456" 
                value={address} 
                onChange={e => setAddress(e.target.value)} 
                required 
              />
            </div>
            
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Address
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
      ) : addresses.length === 0 && !isAdding ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center border-dashed bg-muted/30">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No saved addresses</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Save your frequently visited locations to book rides faster.
          </p>
          <Button onClick={() => setIsAdding(true)} className="bg-accent hover:bg-accent/90 text-primary font-semibold">
            <Plus className="w-4 h-4 mr-2" /> Add First Address
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <Card key={addr.id} className="p-4 flex items-start gap-4 border-border bg-card hover:border-accent transition-colors group">
              <div className="bg-primary/10 p-3 rounded-full text-primary">
                {getIcon(addr.iconType)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground">{addr.label}</h4>
                <p className="text-sm text-muted-foreground truncate" title={addr.address}>{addr.address}</p>
              </div>
              <button 
                onClick={() => handleDelete(addr.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-all"
                title="Delete address"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
