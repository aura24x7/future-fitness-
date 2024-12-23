import { auth, firestore } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

class WaterService {
  private static instance: WaterService;
  private readonly COLLECTION = 'waterTracking';

  private constructor() {}

  static getInstance(): WaterService {
    if (!WaterService.instance) {
      WaterService.instance = new WaterService();
    }
    return WaterService.instance;
  }

  private getUserRef(userId: string) {
    return doc(firestore, this.COLLECTION, userId);
  }

  async migrateWaterData(date: string, amount: number): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    try {
      const userRef = this.getUserRef(user.uid);
      const docSnap = await getDoc(userRef);
      
      if (!docSnap.exists()) {
        await setDoc(userRef, { [date]: amount });
      } else {
        const data = docSnap.data();
        if (!data[date]) {
          await updateDoc(userRef, { [date]: amount });
        }
      }
    } catch (error) {
      console.error(`Error migrating water data for date ${date}:`, error);
      throw new Error(`Failed to migrate water data for date ${date}`);
    }
  }

  async trackWater(amount: number): Promise<number> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    try {
      const userRef = this.getUserRef(user.uid);
      const today = new Date().toISOString().split('T')[0];

      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        await setDoc(userRef, {
          [today]: amount
        });
        return amount;
      }

      const data = docSnap.data();
      const currentAmount = data[today] || 0;
      const newAmount = currentAmount + amount;

      await updateDoc(userRef, {
        [today]: newAmount
      });

      return newAmount;
    } catch (error) {
      console.error('Error tracking water:', error);
      throw new Error('Failed to track water intake');
    }
  }

  async getTodayWater(): Promise<number> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    try {
      const userRef = this.getUserRef(user.uid);
      const today = new Date().toISOString().split('T')[0];

      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) return 0;

      const data = docSnap.data();
      return data[today] || 0;
    } catch (error) {
      console.error('Error getting water data:', error);
      throw new Error('Failed to get water intake data');
    }
  }
}

export const waterService = WaterService.getInstance();
