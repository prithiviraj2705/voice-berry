import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Mic, Calendar, Users, MapPin, Navigation, Globe } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useNavigate } from 'react-router-dom';
import { calculateDistance, calculateFareAmount } from '../../lib/fareCalculator';
import { VEHICLES } from '../../lib/constants';
import { apiRequest } from '../../lib/api';

// Types for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceScreenProps {
  onClose: () => void;
  onSwitchToManual: () => void;
}

const LANGUAGES = [
  { code: 'en-US', label: 'English' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'ta-IN', label: 'Tamil' },
  { code: 'te-IN', label: 'Telugu' },
  { code: 'kn-IN', label: 'Kannada' },
  { code: 'ml-IN', label: 'Malayalam' },
  { code: 'bn-IN', label: 'Bengali' },
  { code: 'zh-CN', label: 'Mandarin Chinese' },
  { code: 'ms-MY', label: 'Malay' }
];

const VoiceScreen: React.FC<VoiceScreenProps> = ({ onClose, onSwitchToManual }) => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const transcriptRef = useRef('');
  const isProcessingRef = useRef(false);
  const stopRequestedRef = useRef(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [extractedData, setExtractedData] = useState<any>(null);
  const [missingFieldsContext, setMissingFieldsContext] = useState<any>({});
  
  const [language, setLanguage] = useState('en-US');
  const [recognition, setRecognition] = useState<any>(null);
  
  const [systemPrompt, setSystemPrompt] = useState('Tap the mic to start speaking...');
  const [basePrice, setBasePrice] = useState<number | null>(null);
  const [isCalculatingFare, setIsCalculatingFare] = useState(false);

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let rec: any = null;
    if (SpeechRecognition) {
      rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = language;

      rec.onresult = (event: any) => {
        let final = '';
        let interim = '';
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setTranscript(final);
        setInterimTranscript(interim);
        transcriptRef.current = (final + ' ' + interim).trim();
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        const languageName = LANGUAGES.find(l => l.code === language)?.label || language;
        
        if (event.error === 'not-allowed') {
          setSystemPrompt(`Microphone access denied. Please allow permissions.`);
        } else if (event.error === 'language-not-supported') {
          setSystemPrompt(`${languageName} isn't supported for voice input in this browser. Try Chrome, or switch to typing.`);
        } else if (event.error === 'service-not-allowed') {
          setSystemPrompt(`Browser speech service denied the request for ${languageName}. Try Chrome or switch to typing.`);
        } else if (event.error === 'no-speech') {
          setSystemPrompt(`No speech detected. Try again.`);
        } else {
          setSystemPrompt(`Recognition failed (${event.error}). Try Chrome or switch to typing.`);
        }
      };

      rec.onend = () => {
        setIsRecording(false);
        if (stopRequestedRef.current) {
          stopRequestedRef.current = false;
          const fullText = transcriptRef.current.trim();
          if (!fullText) {
            setSystemPrompt('No speech was captured. Please try again or switch to manual booking.');
          } else if (!isProcessingRef.current) {
            setIsProcessing(true);
            isProcessingRef.current = true;
            void extractIntentFromAudio(fullText);
          }
        }
      };

      setRecognition(rec);
    } else {
      setSystemPrompt('Speech recognition is not supported in this browser. Please switch to manual booking or use Chrome.');
    }
    
    return () => {
      if (rec) {
        rec.onresult = null;
        rec.onerror = null;
        rec.onend = null;
        try { rec.abort(); } catch {}
      }
    };
  }, [language]); // Re-initialize when language changes

  const toggleRecording = () => {
    if (isRecording) {
      stopRequestedRef.current = true;
      recognition?.stop();
      setIsRecording(false);
    } else {
      if (!recognition) {
        setSystemPrompt('Voice recognition not available. Please try Chrome.');
        return;
      }
      setTranscript('');
      setInterimTranscript('');
      transcriptRef.current = '';
      setTimer(0);
      try {
        recognition.lang = language;
        recognition.start();
        setIsRecording(true);
        setSystemPrompt('Listening...');
      } catch (err) {
        console.error('Failed to start recognition:', err);
        setSystemPrompt('Recognition failed to start. Try reloading.');
      }
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      interval = setInterval(() => setTimer(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const geocode = async (address: string) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  const computeDynamicFare = async (data: any) => {
    setIsCalculatingFare(true);
    const pickupCoords = await geocode(data.pickup);
    const destCoords = await geocode(data.destination);
    
    let fare = 45; // Default fallback
    const selectedVehicle = VEHICLES.find(v => v.name?.toLowerCase() === data.vehicleType?.toLowerCase()) || VEHICLES[0];
    
    if (pickupCoords && destCoords) {
      const distance = calculateDistance(pickupCoords.lat, pickupCoords.lng, destCoords.lat, destCoords.lng);
      fare = calculateFareAmount(selectedVehicle, distance, true, 4) || 45;
    }
    
    setBasePrice(fare);
    setExtractedData({
      ...data,
      vehicleType: selectedVehicle.name,
      basePrice: fare
    });
    setSystemPrompt("Ready to review and pay.");
    setIsCalculatingFare(false);
  };

  const extractIntentFromAudio = async (text: string) => {
    try {
      const resData = await apiRequest<{ data?: any; error?: string }>('/api/bookings/extract-intent', {
        method: 'POST',
        body: JSON.stringify({ 
          transcript: text,
          language: LANGUAGES.find(l => l.code === language)?.label || 'English',
          previousContext: missingFieldsContext
        })
      });
      console.log('Extracted intent:', resData);
      
      if (resData.data && typeof resData.data === 'object') {
        const data = resData.data;
        setMissingFieldsContext(data);
        setExtractedData(data);
        
        // Validate required fields
        const missing = [];
        if (!data.pickup) missing.push('pickup location');
        if (!data.destination) missing.push('destination');
        if (!data.passengers) missing.push('number of passengers');
        
        if (missing.length > 0) {
          setSystemPrompt(`Got it. I still need your ${missing.join(' and ')}. Tap the mic to continue.`);
          setBasePrice(null); // Reset fare if missing fields
        } else {
          setSystemPrompt("All set! Calculating your fare...");
          await computeDynamicFare(data);
        }
      } else {
        throw new Error('The server returned no booking details.');
      }
    } catch (error) {
      console.error('Failed to extract intent:', error);
      setSystemPrompt('Voice processing is temporarily unavailable. Please use Manual Booking.');
    } finally {
      setIsProcessing(false);
      isProcessingRef.current = false;
    }
  };

  const handleConfirm = () => {
    if (canProceed) {
      // Ensure date is set (default to now if LLaMA returned null for relative time)
      const bookingData = {
        ...extractedData,
        datetime: extractedData.datetime || new Date().toISOString()
      };
      navigate('/book/review', { state: { bookingDetails: bookingData, source: 'voice' } });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Check if we can proceed to payment
  const canProceed = extractedData?.pickup && extractedData?.destination && extractedData?.passengers && basePrice !== null;

  return (
    <div className="fixed inset-0 z-[100] bg-primary text-primary-foreground flex flex-col items-center justify-center p-6">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
      >
        <X className="w-6 h-6 text-cream" />
      </button>

      {/* Language Selector */}
      <div className="absolute top-6 left-6">
        <div className="flex items-center gap-2 bg-primary-foreground/10 px-3 py-2 rounded-xl border border-primary-foreground/20">
          <Globe className="w-4 h-4 text-accent" />
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent text-sm font-medium text-cream outline-none appearance-none cursor-pointer"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code} className="bg-primary text-foreground">{lang.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-w-2xl w-full flex flex-col items-center space-y-12">
        {/* Animated wave bars */}
        <div className="flex items-center gap-2 h-24">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <motion.div
              key={i}
              className="w-3 bg-accent rounded-full"
              animate={isRecording ? {
                height: ["20%", "100%", "40%", "80%", "20%"]
              } : { height: "20%" }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.1
              }}
            />
          ))}
        </div>

        {/* Recording badge */}
        <div className="flex items-center gap-3 bg-primary-foreground/10 px-4 py-2 rounded-full border border-primary-foreground/20">
          <motion.div 
            animate={{ opacity: [1, 0.5, 1] }} 
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`w-3 h-3 rounded-full ${isRecording ? 'bg-destructive' : 'bg-accent'}`}
          />
          <span className="font-medium font-mono tracking-wider">{formatTime(timer)}</span>
          <span className="text-sm border-l border-primary-foreground/20 pl-3">
            {LANGUAGES.find(l => l.code === language)?.label}
          </span>
        </div>

        {/* Transcribed text / System Prompt */}
        <div className="text-center space-y-4 min-h-[100px]">
          {(transcript || interimTranscript) && isRecording ? (
            <p className="text-3xl md:text-4xl font-serif text-cream leading-tight italic">
              "{transcript} <span className="text-cream/50">{interimTranscript}</span>"
            </p>
          ) : (
            <p className="text-2xl md:text-3xl font-medium text-cream leading-tight">
              {systemPrompt}
            </p>
          )}
          
          {(isProcessing || isCalculatingFare) && (
            <p className="text-accent animate-pulse font-medium">
              {isCalculatingFare ? 'Calculating accurate fare...' : 'Extracting intent with AI...'}
            </p>
          )}
        </div>

        {/* Extracted Entities */}
        {extractedData && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6 w-full">
            <div className="flex flex-wrap justify-center gap-3 w-full">
              {extractedData.datetime && (
                <Badge className="bg-primary-foreground/10 text-cream px-4 py-2 text-sm rounded-xl border border-primary-foreground/20 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-accent" /> {extractedData.datetime}
                </Badge>
              )}
              {extractedData.passengers && (
                <Badge className="bg-primary-foreground/10 text-cream px-4 py-2 text-sm rounded-xl border border-primary-foreground/20 flex items-center gap-2">
                  <Users className="w-4 h-4 text-accent" /> {extractedData.passengers} Pax
                </Badge>
              )}
              {extractedData.pickup ? (
                <Badge className="bg-primary-foreground/10 text-cream px-4 py-2 text-sm rounded-xl border border-primary-foreground/20 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent" /> From: {extractedData.pickup}
                </Badge>
              ) : (
                <Badge className="bg-destructive/20 text-cream px-4 py-2 text-sm rounded-xl border border-destructive flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-destructive" /> Pickup Missing
                </Badge>
              )}
              {extractedData.destination ? (
                <Badge className="bg-primary-foreground/10 text-cream px-4 py-2 text-sm rounded-xl border border-primary-foreground/20 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-accent" /> To: {extractedData.destination}
                </Badge>
              ) : (
                <Badge className="bg-destructive/20 text-cream px-4 py-2 text-sm rounded-xl border border-destructive flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-destructive" /> Destination Missing
                </Badge>
              )}
              {extractedData.vehicleType && (
                <Badge className="bg-primary-foreground/10 text-cream px-4 py-2 text-sm rounded-xl border border-primary-foreground/20 flex items-center gap-2">
                  <span className="w-4 h-4 text-accent">🚗</span> {extractedData.vehicleType}
                </Badge>
              )}
            </div>
            
            {canProceed && (
              <Button onClick={handleConfirm} className="w-full max-w-sm h-14 bg-accent hover:bg-accent/90 text-primary text-lg font-bold rounded-xl shadow-lg mt-4">
                Review & Pay (S$ {basePrice?.toFixed(2)})
              </Button>
            )}
          </motion.div>
        )}

        {/* Action Button */}
        <div className="flex flex-col items-center gap-6 mt-8">
          <div className="relative">
            {isRecording && (
              <motion.div 
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-destructive rounded-full opacity-20"
              />
            )}
            <button 
              onClick={toggleRecording}
              className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                isRecording 
                  ? 'bg-destructive shadow-[0_0_40px_rgba(239,68,68,0.4)] hover:bg-destructive/90' 
                  : 'bg-primary-foreground hover:bg-primary-foreground/90'
              }`}
            >
              {isRecording ? (
                 <div className="w-8 h-8 bg-cream rounded-sm" /> 
              ) : (
                 <Mic className="w-10 h-10 text-cream" />
              )}
            </button>
          </div>
          
          <p className="text-cream/60 font-medium text-lg">
            {isRecording ? 'Tap to Stop & Process' : 'Tap to speak'}
          </p>
        </div>

        <button 
          onClick={onSwitchToManual}
          className="text-primary-foreground/60 hover:text-cream underline underline-offset-4 transition-colors"
        >
          Switch to Manual Booking
        </button>
      </div>
    </div>
  );
};

export default VoiceScreen;
