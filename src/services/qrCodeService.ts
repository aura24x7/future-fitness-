import QRCode from 'qrcode';
import { SharedWorkoutPlan } from '../types/workoutSharing';

interface QRCodeData {
  type: 'workout_plan';
  shareId: string;
  planId: string;
}

class QRCodeService {
  // Generate QR code for a workout plan
  generateWorkoutPlanQR = async (plan: SharedWorkoutPlan): Promise<string> => {
    try {
      const qrData: QRCodeData = {
        type: 'workout_plan',
        shareId: plan.sharing.shareId,
        planId: plan.id,
      };

      const qrCodeData = JSON.stringify(qrData);
      const qrCodeImage = await QRCode.toDataURL(qrCodeData, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 300,
      });

      return qrCodeImage;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  };

  // Parse QR code data
  parseQRCode = (qrData: string): QRCodeData => {
    try {
      const parsedData = JSON.parse(qrData);
      
      if (
        parsedData.type !== 'workout_plan' ||
        !parsedData.shareId ||
        !parsedData.planId
      ) {
        throw new Error('Invalid QR code format');
      }

      return parsedData;
    } catch (error) {
      console.error('Error parsing QR code:', error);
      throw new Error('Invalid QR code');
    }
  };
}

export const qrCodeService = new QRCodeService();
