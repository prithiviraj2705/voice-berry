import React, { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '../../hooks/useAuth';
import { User, Mail, Phone, Globe, Save, Loader2, CheckCircle2 } from 'lucide-react';

export const ProfileSettings = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    preferredLanguage: 'en'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetch(`http://localhost:3000/api/users/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setProfile({
              name: data.user.name || '',
              email: data.user.email || user.email || '',
              phone: data.user.phone || '',
              preferredLanguage: data.user.preferredLanguage || 'en'
            });
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:3000/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          preferredLanguage: profile.preferredLanguage
        })
      });
      
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save profile', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl space-y-8">
      <div>
        <h2 className="text-2xl font-serif font-bold text-foreground">Profile Settings</h2>
        <p className="text-muted-foreground mt-1">Manage your personal information and preferences.</p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSave} className="space-y-6">
          
          <div className="flex flex-col md:flex-row gap-6 md:items-center">
            <div className="w-24 h-24 rounded-full border-4 border-muted bg-primary/5 flex items-center justify-center overflow-hidden">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name || user?.id}`} alt="avatar" className="w-full h-full" />
            </div>
            <div>
              <Button type="button" variant="outline" className="h-9">Change Avatar</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="name"
                  value={profile.name}
                  onChange={e => setProfile({...profile, name: e.target.value})}
                  className="pl-10 h-12" 
                  placeholder="John Doe" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="email"
                  value={profile.email}
                  disabled
                  className="pl-10 h-12 bg-muted/50 cursor-not-allowed" 
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Email is managed by your authentication provider.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="phone"
                  value={profile.phone}
                  onChange={e => setProfile({...profile, phone: e.target.value})}
                  className="pl-10 h-12" 
                  placeholder="+65 9123 4567" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language" className="text-sm font-semibold">Preferred Language</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select 
                  id="language"
                  value={profile.preferredLanguage}
                  onChange={e => setProfile({...profile, preferredLanguage: e.target.value})}
                  className="w-full h-12 pl-10 pr-4 rounded-md border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent appearance-none"
                >
                  <option value="en">English (UK)</option>
                  <option value="zh">Chinese (Mandarin)</option>
                  <option value="ms">Malay</option>
                  <option value="ta">Tamil</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border flex justify-end items-center gap-4">
            {saved && (
              <span className="text-success text-sm font-medium flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Profile saved
              </span>
            )}
            <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
