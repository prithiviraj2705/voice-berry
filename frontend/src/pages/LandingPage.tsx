import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Mic, MapPin, Navigation, Calendar, Star, Users, Briefcase, Package, Accessibility, Plane, Clock, Map, ChevronRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { SERVICES } from '../lib/constants';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeInOut" as const } }
};

const iconMap: Record<string, React.ReactNode> = {
  Plane: <Plane className="w-6 h-6" />,
  MapPin: <MapPin className="w-6 h-6" />,
  Clock: <Clock className="w-6 h-6" />,
  Map: <Map className="w-6 h-6" />,
  Briefcase: <Briefcase className="w-6 h-6" />,
  Package: <Package className="w-6 h-6" />,
  Accessibility: <Accessibility className="w-6 h-6" />,
  Users: <Users className="w-6 h-6" />
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [when, setWhen] = useState('');

  const handleEstimate = () => {
    navigate('/book/manual', { state: { pickup, destination, when } });
  };
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-16">
          
          <motion.div 
            initial="hidden" animate="visible" variants={fadeUp}
            className="flex-1 space-y-8 z-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
              Singapore's First Voice Booking
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground leading-[1.1]">
              Your ride, <span className="text-accent italic">spoken</span> into being.
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-xl">
              Experience the future of chauffeur booking. Just speak your destination, and our AI handles the rest. Luxury fleets, professional drivers, zero friction.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => navigate('/book/voice')} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-14 px-8 text-lg rounded-xl">
                <Mic className="w-5 h-5" />
                Book by Voice
              </Button>
              <Button onClick={() => navigate('/book/manual')} size="lg" variant="outline" className="h-14 px-8 text-lg rounded-xl border-border bg-transparent hover:bg-muted">
                Book Manually
              </Button>
            </div>
            
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" className="w-full h-full" />
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <div className="flex text-accent">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-muted-foreground mt-1">2,400+ five-star reviews</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 relative w-full max-w-lg lg:max-w-none"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-transparent rounded-[2.5rem] blur-3xl -z-10 transform rotate-6"></div>
            
            <Card className="bg-primary text-primary-foreground border-none rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Plane className="w-64 h-64 transform rotate-45 -translate-y-12 translate-x-12" />
              </div>
              
              <div className="space-y-8 relative z-10">
                <div className="flex justify-between items-start">
                  <div className="inline-flex flex-col items-start gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-primary-foreground/50 bg-primary-foreground/10 px-2 py-0.5 rounded">Example Ride</span>
                    <div className="inline-flex items-center gap-2 bg-primary-foreground/10 px-3 py-1.5 rounded-full text-sm">
                      <MapPin className="w-4 h-4 text-accent" />
                      Marina Bay, Singapore
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-background text-foreground px-2 py-1 rounded-md text-sm font-bold">
                    <Star className="w-3 h-3 fill-accent text-accent" />
                    4.9
                  </div>
                </div>
                
                <div>
                  <p className="text-primary-foreground/60 text-sm mb-2">Heading to</p>
                  <h3 className="text-2xl font-serif font-bold">Changi Airport Terminal 3</h3>
                </div>
                
                <div className="bg-primary-foreground/5 rounded-xl p-4 border border-primary-foreground/10 flex items-center justify-between backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-cream">Driver Assigned</p>
                      <p className="text-xs text-primary-foreground/60">Mercedes-Benz S-Class • SJA 1234 A</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-primary-foreground/20 overflow-hidden">
                     <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=driver" alt="driver" className="w-full h-full bg-cream" />
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-sm text-primary-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                  Flight tracked. No waiting charges.
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Quick Book Bar */}
      <section className="relative z-20 -mt-16 container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-primary rounded-2xl p-4 md:p-6 shadow-xl flex flex-col md:flex-row items-center gap-4 md:gap-0"
        >
          <div className="flex-1 flex flex-col md:flex-row w-full gap-4 md:gap-0 md:divide-x divide-primary-foreground/20">
            <div className="flex-1 px-4 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-accent" />
              <div className="flex-1">
                <p className="text-xs text-primary-foreground/50 font-medium">PICKUP</p>
                <input type="text" value={pickup} onChange={e => setPickup(e.target.value)} placeholder="Enter pickup location" className="w-full bg-transparent border-none text-cream focus:outline-none placeholder:text-primary-foreground/30" />
              </div>
            </div>
            <div className="flex-1 px-4 flex items-center gap-3">
              <Navigation className="w-5 h-5 text-accent" />
              <div className="flex-1">
                <p className="text-xs text-primary-foreground/50 font-medium">DESTINATION</p>
                <input type="text" value={destination} onChange={e => setDestination(e.target.value)} placeholder="Where to?" className="w-full bg-transparent border-none text-cream focus:outline-none placeholder:text-primary-foreground/30" />
              </div>
            </div>
            <div className="flex-1 px-4 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-accent" />
              <div className="flex-1">
                <p className="text-xs text-primary-foreground/50 font-medium">WHEN</p>
                <input type="text" value={when} onChange={e => setWhen(e.target.value)} placeholder="Now or schedule" className="w-full bg-transparent border-none text-cream focus:outline-none placeholder:text-primary-foreground/30" />
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex px-6 items-center text-primary-foreground/40 italic font-serif">or</div>
          
          <Button onClick={handleEstimate} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-primary h-14 px-8 rounded-xl font-semibold text-base whitespace-nowrap">
            Get Fare Estimate
          </Button>
        </motion.div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Our Premium Services</h2>
            <p className="text-muted-foreground text-lg">Tailored transportation solutions for every occasion, delivered with uncompromising quality.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((service, idx) => (
              <motion.div 
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <Card 
                  className="h-full overflow-hidden border-border bg-card group hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => navigate('/book/manual', { state: { serviceType: service.title } })}
                >
                  <div className="h-1.5 w-full bg-accent transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  <div className="p-6">
                    <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-accent mb-6 group-hover:bg-accent/10 transition-colors">
                      {iconMap[service.icon]}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{service.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-12">
              <div>
                <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">Three words. One ride.</h2>
                <p className="text-primary-foreground/70 text-lg max-w-md">Our advanced AI understands natural language. You don't need to fill out complex forms anymore.</p>
              </div>
              
              <div className="space-y-8">
                {[
                  { num: '01', title: 'Speak Naturally', desc: 'Tap the mic and say what you need.' },
                  { num: '02', title: 'AI Fills the Blanks', desc: 'We extract location, time, and vehicle preference instantly.' },
                  { num: '03', title: 'Confirm & Go', desc: 'Review the details and confirm your ride in one tap.' }
                ].map(step => (
                  <div key={step.num} className="flex gap-6">
                    <div className="text-3xl font-serif text-accent font-bold mt-1">{step.num}</div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2 text-cream">{step.title}</h4>
                      <p className="text-primary-foreground/60">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex-1 w-full max-w-lg">
              <div className="bg-secondary/50 backdrop-blur-md border border-primary-foreground/10 p-8 rounded-3xl relative">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-accent rounded-full flex items-center justify-center shadow-lg">
                  <Mic className="text-primary w-6 h-6" />
                </div>
                
                <div className="space-y-6">
                  <div className="bg-primary/80 rounded-2xl p-4 rounded-tl-none border border-primary-foreground/5 inline-block">
                    <p className="text-lg italic text-cream">"Book me an airport drop tomorrow 6am for 2 people in an SUV."</p>
                  </div>
                  
                  <div className="space-y-3 pl-8 border-l-2 border-accent/30">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-accent text-primary hover:bg-accent">Detected</Badge>
                      <span className="text-sm font-medium text-cream">Changi Airport</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-accent text-primary hover:bg-accent">Detected</Badge>
                      <span className="text-sm font-medium text-cream">Tomorrow, 06:00 AM</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-accent text-primary hover:bg-accent">Detected</Badge>
                      <span className="text-sm font-medium text-cream">SUV (Premium)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Temp Badge component since we haven't created it explicitly yet in the same file
const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
    {children}
  </span>
);

export default LandingPage;
