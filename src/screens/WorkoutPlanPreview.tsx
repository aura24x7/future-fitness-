import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SharedWorkoutPlan } from '../types/workoutSharing';
import { workoutPlanSharingService } from '../services/workoutPlanSharingService';
import { workoutImportExportService } from '../services/workoutImportExportService';
import { workoutSyncManager } from '../services/workoutSyncManager';

interface WorkoutPlanPreviewProps {
  route: {
    params: {
      plan: SharedWorkoutPlan;
      fromQR?: boolean;
    };
  };
}

const WorkoutPlanPreview: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { plan, fromQR } = route.params;
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    try {
      setLoading(true);

      // Prepare sync options
      const syncOptions = {
        startDate: new Date(),
        replaceExisting: false,
        skipConflicts: false,
        modifyPlan: true,
      };

      // Check for conflicts first
      const { conflicts } = await workoutSyncManager.prepareSync(plan, syncOptions.startDate);

      if (conflicts.length > 0) {
        Alert.alert(
          'Conflicts Found',
          'There are existing workouts that conflict with this plan. Would you like to replace them?',
          [
            {
              text: 'Skip Conflicts',
              onPress: async () => {
                syncOptions.skipConflicts = true;
                await executeSync(syncOptions);
              },
            },
            {
              text: 'Replace Existing',
              onPress: async () => {
                syncOptions.replaceExisting = true;
                await executeSync(syncOptions);
              },
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
      } else {
        await executeSync(syncOptions);
      }
    } catch (error) {
      console.error('Error importing plan:', error);
      Alert.alert('Error', 'Failed to import workout plan');
    } finally {
      setLoading(false);
    }
  };

  const executeSync = async (options: any) => {
    try {
      const result = await workoutSyncManager.executeSync(plan, options);
      
      if (result.status === 'synced') {
        Alert.alert(
          'Success',
          'Workout plan imported successfully!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', 'Failed to sync workout plan');
      }
    } catch (error) {
      console.error('Error executing sync:', error);
      Alert.alert('Error', 'Failed to sync workout plan');
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      await workoutImportExportService.exportWorkoutPlan(plan);
      Alert.alert('Success', 'Workout plan exported successfully!');
    } catch (error) {
      console.error('Error exporting plan:', error);
      Alert.alert('Error', 'Failed to export workout plan');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    navigation.navigate('ShareWorkoutPlan', { plan });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{plan.title}</Text>
          {plan.description && (
            <Text style={styles.description}>{plan.description}</Text>
          )}
        </View>

        {/* Metadata */}
        <View style={styles.metadataCard}>
          <View style={styles.metadataRow}>
            <Ionicons name="person" size={20} color="#6366F1" />
            <Text style={styles.metadataText}>
              Created by {plan.metadata.author.name}
            </Text>
          </View>
          <View style={styles.metadataRow}>
            <Ionicons name="barbell" size={20} color="#6366F1" />
            <Text style={styles.metadataText}>
              Difficulty: {plan.metadata.difficulty}
            </Text>
          </View>
          <View style={styles.metadataRow}>
            <Ionicons name="time" size={20} color="#6366F1" />
            <Text style={styles.metadataText}>
              ~{plan.metadata.estimatedTimePerSession} min/session
            </Text>
          </View>
        </View>

        {/* Schedule Preview */}
        <View style={styles.scheduleCard}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          {Object.entries(plan.schedule).map(([day, workout]) => (
            <View key={day} style={styles.workoutDay}>
              <Text style={styles.dayTitle}>Day {parseInt(day) + 1}</Text>
              <Text style={styles.workoutInfo}>
                {workout.exercises.length} exercises • {workout.estimatedDuration} min
              </Text>
              <Text style={styles.targetAreas}>
                {workout.targetMuscleGroups.join(', ')}
              </Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.importButton]}
            onPress={handleImport}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="download" size={24} color="#FFFFFF" />
                <Text style={styles.buttonText}>Import Plan</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.exportButton]}
            onPress={handleExport}
            disabled={loading}
          >
            <Ionicons name="share-outline" size={24} color="#FFFFFF" />
            <Text style={styles.buttonText}>Export</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.shareButton]}
            onPress={handleShare}
            disabled={loading}
          >
            <Ionicons name="people" size={24} color="#FFFFFF" />
            <Text style={styles.buttonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
  },
  metadataCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metadataText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4B5563',
  },
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  workoutDay: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 12,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  workoutInfo: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  targetAreas: {
    fontSize: 14,
    color: '#6366F1',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  importButton: {
    backgroundColor: '#6366F1',
  },
  exportButton: {
    backgroundColor: '#10B981',
  },
  shareButton: {
    backgroundColor: '#F59E0B',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default WorkoutPlanPreview;
