const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');
const envConfig = dotenv.parse(fs.readFileSync('/Users/prithivi/Desktop/ulacabs/frontend/.env.local'));
const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.auth.signInWithOtp({
    email: 'test@example.com',
    options: {
      shouldCreateUser: true,
      emailRedirectTo: 'http://localhost:5174',
    }
  });
  console.log("Data:", data);
  console.log("Error:", error);
}

test();
