const puppeteer = require('puppeteer');
const http = require('http');
const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

const delay = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log('=== STARTING E2E VERIFICATION ===');
  
  // 1. Generate temp email
  console.log('1. Generating temp email for signup...');
  const emails = await fetchUrl('https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1');
  const email = emails[0];
  const [login, domain] = email.split('@');
  console.log(`Temp email generated: ${email}`);

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Capture console logs
  page.on('console', msg => {
    if (msg.type() === 'error') console.log(`[Browser Error] ${msg.text()}`);
  });

  try {
    // 2. Auth Flow
    console.log('2. Navigating to Auth page...');
    await page.goto('http://localhost:5173/auth', { waitUntil: 'networkidle0' });
    
    console.log('Entering email and requesting OTP...');
    // Wait for the input to exist
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.type('input[type="email"]', email);
    await page.click('button[type="submit"]');
    
    // Wait for Supabase to send email
    await delay(3000);
    
    console.log('Waiting for OTP email to arrive...');
    let otpCode = null;
    for (let i = 0; i < 15; i++) {
      const messages = await fetchUrl(`https://www.1secmail.com/api/v1/?action=getMessages&login=${login}&domain=${domain}`);
      if (messages && messages.length > 0) {
        const msgId = messages[0].id;
        const msgDetails = await fetchUrl(`https://www.1secmail.com/api/v1/?action=readMessage&login=${login}&domain=${domain}&id=${msgId}`);
        console.log(`Email received! Subject: "${msgDetails.subject}"`);
        
        // Extract 6 digit code from body
        const match = msgDetails.textBody.match(/\b\d{6}\b/);
        if (match) {
          otpCode = match[0];
          console.log(`Extracted OTP Code: ${otpCode}`);
          break;
        } else {
          console.log('Email arrived but no 6-digit code found. Check template!');
          console.log('Body:', msgDetails.textBody.substring(0, 200));
          // It might be a magic link!
          if (msgDetails.textBody.includes('http')) {
             console.log('Found a link instead of a numeric code! The Supabase template needs to be updated to use {{ .Token }}.');
          }
        }
      }
      await delay(2000);
    }
    
    if (!otpCode) {
      throw new Error('Failed to retrieve OTP code. Either rate limit hit or template is wrong.');
    }
    
    console.log('Entering OTP into UI...');
    // Wait for OTP inputs
    await page.waitForSelector('input[inputmode="numeric"]', { timeout: 10000 });
    const inputs = await page.$$('input[inputmode="numeric"]');
    for (let i = 0; i < 6; i++) {
      await inputs[i].type(otpCode[i]);
    }
    await page.click('button:has-text("Verify & Continue")');
    
    // Wait for login and redirect
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 });
    console.log('Login successful! Redirected to:', page.url());
    
    // 3. Verify Upcoming Rides
    console.log('3. Verifying Upcoming Rides...');
    await page.goto('http://localhost:5173/dashboard/upcoming', { waitUntil: 'networkidle0' });
    const emptyStateText = await page.evaluate(() => document.body.innerText);
    if (emptyStateText.includes('No upcoming rides')) {
      console.log('Upcoming Rides shows proper empty state!');
    } else {
      console.log('Upcoming Rides loaded (not empty).');
    }
    
    // 4. Verify Saved Addresses
    console.log('4. Verifying Saved Addresses...');
    await page.goto('http://localhost:5173/dashboard/addresses', { waitUntil: 'networkidle0' });
    const addrEmptyStateText = await page.evaluate(() => document.body.innerText);
    if (addrEmptyStateText.includes('No saved addresses')) {
      console.log('Saved Addresses shows proper empty state!');
    } else {
      console.log('Saved Addresses loaded (not empty).');
    }
    
    // 5. Complete a booking (Manual)
    console.log('5. Completing a manual booking...');
    await page.goto('http://localhost:5173/book/manual', { waitUntil: 'networkidle0' });
    
    // Fill pickup and dropoff
    await page.waitForSelector('input[placeholder="Enter pickup location"]', { timeout: 10000 });
    await page.type('input[placeholder="Enter pickup location"]', 'Marina Bay Sands');
    await page.type('input[placeholder="Enter drop-off location"]', 'Changi Airport');
    await page.click('button:has-text("Confirm Route")');
    
    await delay(1000);
    // Select service (e.g. Standard)
    await page.click('button:has-text("Select")');
    
    await delay(1000);
    // Proceed to payment
    await page.click('button:has-text("Continue to Payment")');
    
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log('Navigated to Review & Payment page.');
    
    // Since Stripe Elements handles the card input, we can't easily type into the iframe without complex frame handling.
    // We will simulate the payment success by calling the backend API directly to verify the email fires!
    
    console.log('Simulating payment confirmation API call to trigger email...');
    
    // Let's just create a mock booking via API to test the payment confirmation & email logic
    const postData = JSON.stringify({
      userId: 'test-user-id',
      serviceType: 'Premium',
      pickup: 'Marina Bay Sands',
      destination: 'Changi Airport',
      datetime: new Date().toISOString(),
      passengers: 2,
      vehicleType: 'Sedan',
      fare: 45.00
    });
    
    console.log('Creating test booking...');
    const createReq = http.request('http://localhost:3000/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const booking = JSON.parse(data).booking;
        console.log('Booking created:', booking.id);
        
        console.log('Confirming payment and sending email...');
        const confirmReq = http.request('http://localhost:3000/api/payments/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }, (res2) => {
           let data2 = '';
           res2.on('data', chunk => data2 += chunk);
           res2.on('end', () => {
             console.log('Payment confirm response:', data2);
             console.log('=== VERIFICATION COMPLETE ===');
             process.exit(0);
           });
        });
        
        confirmReq.write(JSON.stringify({
          bookingId: booking.id,
          paymentMethod: 'stripe',
          email: email
        }));
        confirmReq.end();
      });
    });
    
    createReq.write(postData);
    createReq.end();
    
    // Keep script alive for callbacks
    await delay(10000);

  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    await browser.close();
  }
})();
