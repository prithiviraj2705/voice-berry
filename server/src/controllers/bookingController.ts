import { Request, Response } from 'express';
import Groq from 'groq-sdk';
import { prisma } from '../prisma';

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export const extractIntent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { transcript, language = 'English', previousContext = {} } = req.body;
    
    if (!transcript) {
      res.status(400).json({ error: 'Transcript is required' });
      return;
    }

    if (!groq) {
      res.status(500).json({ error: 'Groq API key not configured' });
      return;
    }

    const prompt = `
      You are an AI assistant that extracts ride booking information from a user's speech transcript.
      The user may speak in Tamil, Hindi, Telugu, Kannada, Malayalam, Bengali, Mandarin, Malay, or English. 
      Understand the input in its original language, but always return the extracted fields (pickup, destination, date, passengers) in English.
      
      Extract the following information from the transcript, and merge it with the provided previous context.
      - pickup (string | null): The starting location.
      - destination (string | null): The ending location.
      - datetime (string in ISO format or relative description | null)
      - passengers (number | null)
      - vehicleType (string e.g. Sedan, SUV, Luxury | null)
      
      STRICT RULES:
      1. DO NOT GUESS missing fields. If the user only specifies a destination (e.g. "Take me to the airport"), the pickup MUST be null.
      2. Do not duplicate locations. A pickup and a destination cannot be the same value unless explicitly stated by the user.
      3. Merge the newly extracted data with the previous context, overriding only the fields that were newly mentioned.
      
      Previous Context (JSON): ${JSON.stringify(previousContext)}
      User Transcript: "${transcript}"
      
      Respond strictly in JSON format matching the structure above. If a field is not found in either the transcript or previous context, set it to null.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' }
    });

    const content = chatCompletion.choices[0]?.message?.content;
    const extractedData = content ? JSON.parse(content) : null;

    res.json({ data: extractedData, confidence: 94 });
  } catch (error) {
    console.error('Groq extraction error:', error);
    res.status(500).json({ error: 'Failed to extract intent' });
  }
};

export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    // In a real app, userId comes from authenticated token
    const { 
      userId, userEmail, serviceType, pickup, destination, datetime, passengers, vehicleType, fare, flightNumber, specialInstructions,
      metadata
    } = req.body;

    if (!userId || userId === 'anonymous' || !userEmail || !serviceType || !pickup || !datetime || !vehicleType || !Number.isFinite(Number(fare))) {
      res.status(400).json({ error: 'Missing or invalid booking details' });
      return;
    }

    const parsedDate = new Date(datetime);
    if (Number.isNaN(parsedDate.getTime())) {
      res.status(400).json({ error: 'Invalid booking date and time' });
      return;
    }

    // Supabase Auth and the application database are separate systems. Ensure
    // the local user row exists before creating the required Booking relation.
    await prisma.user.upsert({
      where: { id: userId },
      update: { email: userEmail },
      create: { id: userId, email: userEmail },
    });

    const booking = await prisma.booking.create({
      data: {
        userId,
        serviceType,
        pickup,
        destination,
        datetime: parsedDate,
        passengers: Number(passengers) || 1,
        vehicleType,
        fare: Number(fare),
        flightNumber,
        specialInstructions,
        metadata,
        status: 'pending'
      }
    });

    res.status(201).json({ booking });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

export const getUserBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = String(req.params.userId);
    const bookings = await prisma.booking.findMany({
      where: { userId },
      orderBy: { datetime: 'desc' }
    });
    res.json({ bookings });
  } catch (error) {
    console.error('Fetch bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

export const updateBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { 
      serviceType, pickup, destination, datetime, passengers, vehicleType, fare, flightNumber, specialInstructions,
      metadata, status
    } = req.body;

    const dataToUpdate: any = {};
    if (serviceType !== undefined) dataToUpdate.serviceType = serviceType;
    if (pickup !== undefined) dataToUpdate.pickup = pickup;
    if (destination !== undefined) dataToUpdate.destination = destination;
    if (datetime !== undefined) dataToUpdate.datetime = new Date(datetime);
    if (passengers !== undefined) dataToUpdate.passengers = passengers;
    if (vehicleType !== undefined) dataToUpdate.vehicleType = vehicleType;
    if (fare !== undefined) dataToUpdate.fare = fare;
    if (flightNumber !== undefined) dataToUpdate.flightNumber = flightNumber;
    if (specialInstructions !== undefined) dataToUpdate.specialInstructions = specialInstructions;
    if (metadata !== undefined) dataToUpdate.metadata = metadata;
    if (status !== undefined) dataToUpdate.status = status;

    const booking = await prisma.booking.update({
      where: { id },
      data: dataToUpdate
    });

    res.json({ booking });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
};
