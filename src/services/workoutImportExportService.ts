import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { SharedWorkoutPlan } from '../types/workoutSharing';
import { workoutPlanSharingService } from './workoutPlanSharingService';

class WorkoutImportExportService {
  // Export workout plan to JSON file
  exportWorkoutPlan = async (plan: SharedWorkoutPlan): Promise<void> => {
    try {
      // Create export data
      const exportData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        plan: {
          ...plan,
          exportId: `export_${Date.now()}`,
        },
      };

      // Convert to JSON string
      const jsonString = JSON.stringify(exportData, null, 2);

      // Generate file path
      const fileName = `workout_plan_${plan.id}_${Date.now()}.json`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      // Write file
      await FileSystem.writeAsStringAsync(filePath, jsonString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Share file
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(filePath, {
            mimeType: 'application/json',
            dialogTitle: 'Export Workout Plan',
          });
        }
      }
    } catch (error) {
      console.error('Error exporting workout plan:', error);
      throw new Error('Failed to export workout plan');
    }
  };

  // Import workout plan from JSON file
  importWorkoutPlan = async (fileUri: string): Promise<SharedWorkoutPlan> => {
    try {
      // Read file content
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Parse JSON
      const importData = JSON.parse(fileContent);

      // Validate format
      if (!this.isValidWorkoutPlanExport(importData)) {
        throw new Error('Invalid workout plan format');
      }

      // Create new plan ID and share ID
      const newPlan: SharedWorkoutPlan = {
        ...importData.plan,
        id: `plan_${Date.now()}`,
        sharing: {
          ...importData.plan.sharing,
          shareId: `share_${Date.now()}`,
        },
      };

      // Save plan
      await workoutPlanSharingService.storePlan(newPlan);

      return newPlan;
    } catch (error) {
      console.error('Error importing workout plan:', error);
      throw new Error('Failed to import workout plan');
    }
  };

  // Validate imported data format
  private isValidWorkoutPlanExport = (data: any): boolean => {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.version === 'string' &&
      typeof data.timestamp === 'string' &&
      data.plan &&
      typeof data.plan === 'object' &&
      typeof data.plan.id === 'string' &&
      typeof data.plan.title === 'string' &&
      data.plan.schedule &&
      typeof data.plan.schedule === 'object'
    );
  };

  // Get file info
  getFileInfo = async (fileUri: string): Promise<FileSystem.FileInfo> => {
    try {
      return await FileSystem.getInfoAsync(fileUri);
    } catch (error) {
      console.error('Error getting file info:', error);
      throw new Error('Failed to get file information');
    }
  };

  // Delete temporary files
  cleanupTempFiles = async (): Promise<void> => {
    try {
      const dirContent = await FileSystem.readDirectoryAsync(
        FileSystem.documentDirectory!
      );

      const workoutPlanFiles = dirContent.filter(filename =>
        filename.startsWith('workout_plan_')
      );

      await Promise.all(
        workoutPlanFiles.map(filename =>
          FileSystem.deleteAsync(`${FileSystem.documentDirectory}${filename}`)
        )
      );
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
  };
}

export const workoutImportExportService = new WorkoutImportExportService();
