const fs = require('fs');
const file = '/Users/prithivi/Desktop/ulacabs/frontend/src/components/booking/ReviewPayment.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add imports
content = content.replace(
  "import { supabase } from '../../lib/supabaseClient';",
  "import { supabase } from '../../lib/supabaseClient';\nimport { VEHICLES } from '../../lib/constants';\nimport { calculateDistance, calculateFareAmount } from '../../lib/fareCalculator';"
);

// 2. Add EditableRow component before ReviewPayment interface
const editableRowCode = `
const EditableRow = ({ label, value, type = 'text', options = [], onSave, isEditing, setEditing, className = '' }: any) => {
  const [tempValue, setTempValue] = React.useState(value);
  
  React.useEffect(() => { setTempValue(value); }, [value, isEditing]);

  if (isEditing) {
    return (
      <div className={className}>
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <div className="flex gap-2 mt-1">
          {type === 'select' ? (
            <select 
              value={tempValue} 
              onChange={e => setTempValue(e.target.value)}
              className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-accent focus:border-accent"
            >
              {options.map((opt: any) => (
                <option key={opt.name || opt} value={opt.name || opt}>{opt.name || opt}</option>
              ))}
            </select>
          ) : type === 'number' ? (
             <div className="flex items-center justify-between gap-3 bg-background border border-border rounded-lg px-3 py-2 w-32">
               <button type="button" onClick={() => setTempValue(Math.max(1, tempValue - 1))} className="text-muted-foreground hover:text-foreground text-xl px-2 leading-none">-</button>
               <span className="text-center font-medium">{tempValue}</span>
               <button type="button" onClick={() => setTempValue(tempValue + 1)} className="text-muted-foreground hover:text-foreground text-xl px-2 leading-none">+</button>
             </div>
          ) : (
            <input 
              type={type} 
              value={tempValue} 
              onChange={e => setTempValue(e.target.value)}
              className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-accent focus:border-accent"
            />
          )}
          <Button size="sm" onClick={() => onSave(tempValue)} className="bg-accent text-primary h-auto py-2">Save</Button>
          <Button size="sm" variant="outline" onClick={() => { setTempValue(value); setEditing(false); }} className="h-auto py-2">Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={\`group relative \${className}\`}>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <div className="flex items-start justify-between gap-4 pr-4">
        <p className="font-medium flex-1">{type === 'number' ? \`\${value} People\` : value}</p>
        <button 
          onClick={() => setEditing(true)}
          className="text-xs text-accent opacity-0 group-hover:opacity-100 transition-opacity hover:underline py-1"
        >
          Edit
        </button>
      </div>
    </div>
  );
};

`;

content = content.replace("interface ReviewPaymentProps {", editableRowCode + "interface ReviewPaymentProps {");

// 3. Update ReviewPayment state
const oldStateCode = `  const location = useLocation();
  const bookingDetails = location.state?.bookingDetails || {
    pickup: 'Marina Bay Sands, 10 Bayfront Ave, Singapore',
    destination: 'Changi Airport Terminal 3',
    datetime: 'Tomorrow, 06:00 AM',
    passengers: 2,
    vehicleType: 'Premium SUV',
    flightNumber: 'SQ 322',
    instructions: 'None',
    basePrice: 45.00
  };

  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cash'>('stripe');`;

const newStateCode = `  const location = useLocation();
  const [draftDetails, setDraftDetails] = useState(location.state?.bookingDetails || {
    pickup: 'Marina Bay Sands, 10 Bayfront Ave, Singapore',
    destination: 'Changi Airport Terminal 3',
    datetime: 'Tomorrow, 06:00 AM',
    passengers: 2,
    vehicleType: 'Premium SUV',
    flightNumber: 'SQ 322',
    instructions: 'None',
    basePrice: 45.00
  });

  const [editingField, setEditingField] = useState<string | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);

  const geocode = async (address: string) => {
    try {
      const res = await fetch(\`https://nominatim.openstreetmap.org/search?format=json&q=\${encodeURIComponent(address)}\`);
      const data = await res.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    } catch (e) {
      console.error("Geocoding failed", e);
    }
    return null;
  };

  const handleSaveField = async (field: string, newValue: any) => {
    if (draftDetails[field] === newValue) {
      setEditingField(null);
      return;
    }

    setIsRecalculating(true);
    let newDetails = { ...draftDetails, [field]: newValue };

    if (field === 'pickup' || field === 'destination' || field === 'vehicleType') {
      const pickupCoords = await geocode(newDetails.pickup || '');
      const destCoords = await geocode(newDetails.destination || '');
      
      const selectedVehicle = VEHICLES.find(v => v.name?.toLowerCase() === newDetails.vehicleType?.toLowerCase()) || VEHICLES[0];
      
      if (pickupCoords && destCoords) {
        const distance = calculateDistance(pickupCoords.lat, pickupCoords.lng, destCoords.lat, destCoords.lng);
        const fare = calculateFareAmount(selectedVehicle, distance, !!newDetails.destination, 4) || 45;
        newDetails.basePrice = fare;
      } else {
        newDetails.basePrice = selectedVehicle.basePrice + 15;
      }
    }

    setDraftDetails(newDetails);
    setEditingField(null);
    setIsRecalculating(false);
  };

  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cash'>('stripe');`;

content = content.replace(oldStateCode, newStateCode);

// 4. Replace bookingDetails usage with draftDetails
// We have to be careful not to replace it in the fallback obj above, but we already did that replacement.
content = content.replace(/bookingDetails\.basePrice/g, 'draftDetails.basePrice');
content = content.replace(/bookingDetails\.serviceType/g, 'draftDetails.serviceType');
content = content.replace(/receiptData=\{bookingDetails\}/g, 'receiptData={draftDetails}');


// 5. Replace the static grid with EditableRow grid
const oldGridStart = `<div className="grid grid-cols-1 md:grid-cols-2 gap-6">`;
const oldGridEnd = `</Card>
        </div>

        {/* Payment Column */}`;

// Extract the exact grid to replace
const startIndex = content.indexOf(oldGridStart);
const endIndex = content.indexOf(oldGridEnd);

const newGridCode = `<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EditableRow 
                label="Service" 
                value={draftDetails.serviceType || 'Point-to-Point'} 
                isEditing={editingField === 'serviceType'}
                setEditing={(val: boolean) => setEditingField(val ? 'serviceType' : null)}
                onSave={(val: string) => handleSaveField('serviceType', val)}
              />
              <EditableRow 
                label="Date & Time" 
                value={draftDetails.datetime} 
                isEditing={editingField === 'datetime'}
                setEditing={(val: boolean) => setEditingField(val ? 'datetime' : null)}
                onSave={(val: string) => handleSaveField('datetime', val)}
              />
              <EditableRow 
                label="From" 
                value={draftDetails.pickup || ''} 
                className="md:col-span-2"
                isEditing={editingField === 'pickup'}
                setEditing={(val: boolean) => setEditingField(val ? 'pickup' : null)}
                onSave={(val: string) => handleSaveField('pickup', val)}
              />
              {draftDetails.destination && (
                <EditableRow 
                  label="To" 
                  value={draftDetails.destination} 
                  className="md:col-span-2"
                  isEditing={editingField === 'destination'}
                  setEditing={(val: boolean) => setEditingField(val ? 'destination' : null)}
                  onSave={(val: string) => handleSaveField('destination', val)}
                />
              )}
              {draftDetails.vehicleType && (
                <EditableRow 
                  label="Vehicle" 
                  value={draftDetails.vehicleType} 
                  type="select"
                  options={VEHICLES}
                  isEditing={editingField === 'vehicleType'}
                  setEditing={(val: boolean) => setEditingField(val ? 'vehicleType' : null)}
                  onSave={(val: string) => handleSaveField('vehicleType', val)}
                />
              )}
              {draftDetails.passengers > 0 && (
                <EditableRow 
                  label="Passengers" 
                  value={draftDetails.passengers} 
                  type="number"
                  isEditing={editingField === 'passengers'}
                  setEditing={(val: boolean) => setEditingField(val ? 'passengers' : null)}
                  onSave={(val: number) => handleSaveField('passengers', val)}
                />
              )}
              {draftDetails.flightNumber && (
                <EditableRow 
                  label="Flight Number" 
                  value={draftDetails.flightNumber} 
                  isEditing={editingField === 'flightNumber'}
                  setEditing={(val: boolean) => setEditingField(val ? 'flightNumber' : null)}
                  onSave={(val: string) => handleSaveField('flightNumber', val)}
                />
              )}
              {draftDetails.metadata?.duration && (
                <EditableRow 
                  label="Duration (Hours)" 
                  value={draftDetails.metadata.duration} 
                  type="number"
                  isEditing={editingField === 'metadata.duration'}
                  setEditing={(val: boolean) => setEditingField(val ? 'metadata.duration' : null)}
                  onSave={(val: number) => handleSaveField('metadata', { ...draftDetails.metadata, duration: val })}
                />
              )}
              {draftDetails.metadata?.isReturnTrip && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Trip Type</p>
                  <p className="font-medium">Round Trip (Return included)</p>
                </div>
              )}
              {draftDetails.metadata?.companyName && (
                <EditableRow 
                  label="Company Name" 
                  value={draftDetails.metadata.companyName} 
                  isEditing={editingField === 'metadata.companyName'}
                  setEditing={(val: boolean) => setEditingField(val ? 'metadata.companyName' : null)}
                  onSave={(val: string) => handleSaveField('metadata', { ...draftDetails.metadata, companyName: val })}
                />
              )}
              {draftDetails.instructions !== undefined && (
                <EditableRow 
                  label="Special Instructions" 
                  value={draftDetails.instructions || 'None'} 
                  className="md:col-span-2"
                  isEditing={editingField === 'instructions'}
                  setEditing={(val: boolean) => setEditingField(val ? 'instructions' : null)}
                  onSave={(val: string) => handleSaveField('instructions', val)}
                />
              )}
            </div>
          </Card>
        </div>

        {/* Payment Column */}`;

content = content.substring(0, startIndex) + newGridCode + content.substring(endIndex + oldGridEnd.length);

// Also add a loading indicator to Total Fare if isRecalculating is true
content = content.replace(
  `<p className="text-4xl font-bold text-foreground">S$ {draftDetails.basePrice?.toFixed(2) || '45.00'}</p>`,
  `<div className="flex items-center gap-4">
                <p className="text-4xl font-bold text-foreground">S$ {draftDetails.basePrice?.toFixed(2) || '45.00'}</p>
                {isRecalculating && <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>}
              </div>`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Patched ReviewPayment.tsx successfully.');
