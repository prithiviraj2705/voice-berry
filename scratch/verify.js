const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  const logs = [];

  page.on('console', msg => logs.push(`[Console] ${msg.text()}`));
  page.on('pageerror', error => logs.push(`[PageError] ${error.message}`));

  try {
    console.log("=== VERIFICATION START ===");
    
    // 1. Landing Page
    console.log("Navigating to Landing Page...");
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    let title = await page.title();
    console.log(`Landing Page Loaded (Title: ${title})`);
    
    // 2. Auth Page
    console.log("Navigating to Auth Page...");
    await page.goto('http://localhost:5173/auth', { waitUntil: 'networkidle0' });
    console.log(`Auth Page Loaded`);

    // 3. Voice Booking
    console.log("Navigating to Voice Booking...");
    await page.goto('http://localhost:5173/book/voice', { waitUntil: 'networkidle0' });
    console.log(`Voice Booking Loaded`);

    // 4. Manual Booking
    console.log("Navigating to Manual Booking...");
    await page.goto('http://localhost:5173/book/manual', { waitUntil: 'networkidle0' });
    console.log(`Manual Booking Loaded`);

    // 5. Review & Payment
    console.log("Navigating to Review & Payment...");
    await page.goto('http://localhost:5173/book/review', { waitUntil: 'networkidle0' });
    console.log(`Review & Payment Loaded`);

    // 6. Dashboard
    console.log("Navigating to Dashboard...");
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle0' });
    console.log(`Dashboard Loaded`);

    // Chatbot test
    console.log("Testing Chatbot on Dashboard...");
    // Find chatbot button by inspecting for MessageSquare icon or button structure
    const chatBtn = await page.$('.fixed.bottom-6.right-6');
    if (chatBtn) {
      await chatBtn.click();
      await new Promise(r => setTimeout(r, 1000));
      console.log("Chatbot panel opened.");
      
      const input = await page.$('input[placeholder="Type a message..."]');
      if (input) {
        await input.type('Hello from verification script');
        await page.keyboard.press('Enter');
        console.log("Message sent. Waiting for response...");
        await new Promise(r => setTimeout(r, 4000)); // wait for api
        const msgs = await page.$$eval('.text-sm', els => els.map(e => e.textContent));
        console.log(`Chatbot messages found: ${msgs.length}`);
        console.log("Last message: " + msgs[msgs.length-1]);
      } else {
        console.log("Could not find chat input");
      }
    } else {
      console.log("Could not find chat button");
    }

    console.log("=== BROWSER LOGS ===");
    logs.forEach(l => console.log(l));
    console.log("=== VERIFICATION COMPLETE ===");
  } catch (error) {
    console.error("Verification failed:", error);
  } finally {
    await browser.close();
  }
})();
