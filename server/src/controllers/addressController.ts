import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getUserAddresses = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = String(req.params.userId);
    const addresses = await prisma.address.findMany({
      where: { userId }
    });
    res.json({ addresses });
  } catch (error) {
    console.error('Fetch addresses error:', error);
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
};

export const addAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, label, address, lat, lng, iconType } = req.body;
    
    if (!userId || !label || !address || lat === undefined || lng === undefined) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const newAddress = await prisma.address.create({
      data: {
        userId,
        label,
        address,
        lat,
        lng,
        iconType: iconType || 'map-pin'
      }
    });

    res.status(201).json({ address: newAddress });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ error: 'Failed to add address' });
  }
};

export const deleteAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    await prisma.address.delete({
      where: { id }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ error: 'Failed to delete address' });
  }
};
