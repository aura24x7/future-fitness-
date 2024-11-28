import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { format, formatDistanceToNow } from 'date-fns';
import { workoutNotificationService } from '../services/workoutNotificationService';
import { userService } from '../services/userService';

interface Notification {
  id: string;
  type: 'workout_share' | 'workout_update' | 'workout_reminder';
  planId: string;
  senderId: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
    subscribeToNewNotifications();

    return () => {
      workoutNotificationService.cleanup();
    };
  }, []);

  const subscribeToNewNotifications = async () => {
    const currentUser = await userService.getCurrentUser();
    if (!currentUser) return;

    workoutNotificationService.subscribeToNotifications(
      currentUser.id,
      (notification) => {
        setNotifications((prev) => [notification, ...prev]);
      }
    );
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const currentUser = await userService.getCurrentUser();
      if (!currentUser) return;

      // TODO: Implement getting notifications from Firebase
      // This is a mock implementation
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'workout_share',
          planId: 'plan1',
          senderId: 'user1',
          title: 'New Workout Plan Shared',
          message: 'John shared "Summer Body Workout" with you',
          timestamp: Date.now() - 3600000,
          read: false,
        },
        {
          id: '2',
          type: 'workout_update',
          planId: 'plan2',
          senderId: 'user2',
          title: 'Workout Plan Updated',
          message: 'Jane updated "HIIT Cardio Plan"',
          timestamp: Date.now() - 86400000,
          read: true,
        },
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: Notification) => {
    try {
      // Mark as read
      if (!notification.read) {
        await workoutNotificationService.markAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, read: true } : n
          )
        );
      }

      // Navigate based on notification type
      switch (notification.type) {
        case 'workout_share':
        case 'workout_update':
          navigation.navigate('WorkoutPlanPreview', {
            planId: notification.planId,
          });
          break;
        case 'workout_reminder':
          navigation.navigate('Workout', {
            planId: notification.planId,
          });
          break;
      }
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const timeAgo = formatDistanceToNow(item.timestamp, { addSuffix: true });

    return (
      <TouchableOpacity
        style={[styles.notificationItem, !item.read && styles.unreadItem]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.notificationIcon}>
          <Ionicons
            name={
              item.type === 'workout_share'
                ? 'share-social'
                : item.type === 'workout_update'
                ? 'refresh'
                : 'time'
            }
            size={24}
            color="#6366F1"
          />
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationTime}>{timeAgo}</Text>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>No notifications yet</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  unreadItem: {
    backgroundColor: '#EEF2FF',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366F1',
    position: 'absolute',
    top: 16,
    right: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
});

export default NotificationsScreen;
