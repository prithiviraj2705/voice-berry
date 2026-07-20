import { Router } from 'express';
import Groq from 'groq-sdk';

const router = Router();
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Valid messages array is required' });
      return;
    }

    if (!groq) {
      res.status(500).json({ error: 'Groq API key not configured' });
      return;
    }

    const systemPrompt = `You are a helpful customer support AI for Ulacab, a luxury chauffeur service in Singapore. 
Be concise, polite, and professional. 
Assist users with booking inquiries, vehicle types (Premium SUV, Luxury Sedan, Executive Van), and general support.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      model: 'llama-3.1-8b-instant',
    });

    res.json({ reply: chatCompletion.choices[0]?.message?.content });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

export default router;
