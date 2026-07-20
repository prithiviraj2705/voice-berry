import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xllbfszfgqwgurjjutgz.supabase.co',
  'sb_publishable_TuCMAteh-ahAdKrsFWBUTw_pZ24Idco'
);

async function testAuth() {
  console.log('Sending OTP...');
  const { data, error } = await supabase.auth.signInWithOtp({
    email: 'test@example.com',
    options: {
      shouldCreateUser: true,
    }
  });

  console.log('Data:', data);
  console.log('Error:', error);
}

testAuth();
