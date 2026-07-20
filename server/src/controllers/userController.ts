import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, preferredLanguage } = req.body;
    
    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        phone,
        preferredLanguage
      }
    });
    
    res.json({ user });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
};
