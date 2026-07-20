-- Enable Row Level Security
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Booking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Ride" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Address" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;

-- User Policies
CREATE POLICY "Users can view their own profile."
  ON "User" FOR SELECT
  USING ( auth.uid()::text = id );

CREATE POLICY "Users can update their own profile."
  ON "User" FOR UPDATE
  USING ( auth.uid()::text = id );

-- Booking Policies
CREATE POLICY "Users can view their own bookings."
  ON "Booking" FOR SELECT
  USING ( auth.uid()::text = "userId" );

CREATE POLICY "Users can insert their own bookings."
  ON "Booking" FOR INSERT
  WITH CHECK ( auth.uid()::text = "userId" );

CREATE POLICY "Users can update their own bookings."
  ON "Booking" FOR UPDATE
  USING ( auth.uid()::text = "userId" );

-- Ride Policies
CREATE POLICY "Users can view rides associated with their bookings."
  ON "Ride" FOR SELECT
  USING ( 
    EXISTS (
      SELECT 1 FROM "Booking"
      WHERE "Booking".id = "Ride"."bookingId"
      AND "Booking"."userId" = auth.uid()::text
    )
  );

-- Address Policies
CREATE POLICY "Users can view their own addresses."
  ON "Address" FOR SELECT
  USING ( auth.uid()::text = "userId" );

CREATE POLICY "Users can insert their own addresses."
  ON "Address" FOR INSERT
  WITH CHECK ( auth.uid()::text = "userId" );

CREATE POLICY "Users can update their own addresses."
  ON "Address" FOR UPDATE
  USING ( auth.uid()::text = "userId" );

CREATE POLICY "Users can delete their own addresses."
  ON "Address" FOR DELETE
  USING ( auth.uid()::text = "userId" );

-- Payment Policies
CREATE POLICY "Users can view payments for their bookings."
  ON "Payment" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Booking"
      WHERE "Booking".id = "Payment"."bookingId"
      AND "Booking"."userId" = auth.uid()::text
    )
  );

-- Function to handle new user creation from Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public."User" (id, email, "createdAt", "updatedAt")
  VALUES (new.id, new.email, now(), now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
