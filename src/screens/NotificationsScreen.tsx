import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { userService } from '../services/userService';
import { friendNotificationService, FriendNotification } from '../services/friendNotificationService';
import { useTheme } from '../theme/ThemeProvider';
import { formatDistanceToNow } from 'date-fns';

const NotificationsScreen: React.FC = ({ navigation }: any) => {
  const { colors, isDarkMode } = useTheme();
  const [notifications, setNotifications] = useState<FriendNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const userId = userService.getCurrentUserId();
      if (!userId) return;

      const notificationData = await friendNotificationService.getNotifications(userId);
      setNotifications(notificationData);
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  useEffect(() => {
    loadNotifications();

    // Mark all as read when the screen focuses
    const markAllAsRead = async () => {
      try {
        const userId = userService.getCurrentUserId();
        if (!userId) return;
        
        await friendNotificationService.markAllAsRead(userId);
      } catch (error) {
        console.error('Error marking notifications as read:', error);
      }
    };

    // Set up focus listener to refresh notifications when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadNotifications();
      markAllAsRead();
    });

    return unsubscribe;
  }, [navigation]);

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await friendNotificationService.deleteNotification(notificationId);
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification.id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
      Alert.alert('Error', 'Failed to delete notification');
    }
  };

  const renderNotificationItem = ({ item }: { item: FriendNotification }) => {
    const formattedTime = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true });
    
    // Select icon based on notification type
    let iconName: keyof typeof Ionicons.glyphMap = 'notifications-outline';
    let iconColor = colors.primary;
    
    if (item.type === 'workout') {
      iconName = 'fitness-outline';
      iconColor = '#4f46e5'; // Indigo
    } else if (item.type === 'meal') {
      iconName = 'restaurant-outline';
      iconColor = '#059669'; // Green
    } else if (item.type === 'other' && item.message.includes('test notification')) {
      iconName = 'bug-outline';
      iconColor = '#f59e0b'; // Amber/orange for test notifications
    }

    // Check if this is a test notification
    const isTestNotification = item.type === 'other' && item.message.includes('test notification');

    return (
      <View 
        style={[
          styles.notificationItem, 
          { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' },
          isTestNotification && styles.testNotificationItem
        ]}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={iconName} size={24} color={iconColor} />
        </View>
        <View style={styles.notificationContent}>
          {isTestNotification && (
            <View style={styles.testBadge}>
              <Text style={styles.testBadgeText}>TEST</Text>
            </View>
          )}
          <Text style={[styles.notificationText, { color: colors.text }]}>
            {item.message}
          </Text>
          <Text style={[styles.notificationTime, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
            {`From ${item.senderName || 'Unknown'} • ${formattedTime}`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            Alert.alert(
              'Delete Notification',
              'Are you sure you want to delete this notification?',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Delete', 
                  onPress: () => handleDeleteNotification(item.id),
                  style: 'destructive'
                }
              ]
            );
          }}
        >
          <Ionicons name="trash-outline" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDarkMode ? colors.background : '#F9FAFB' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? colors.background : '#F9FAFB' }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
          >
            <Ionicons name="refresh-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
          {notifications.length > 0 && (
            <TouchableOpacity
              style={styles.clearAllButton}
              onPress={() => {
                Alert.alert(
                  'Clear All Notifications',
                  'Are you sure you want to delete all notifications?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Clear All', 
                      onPress: async () => {
                        try {
                          setLoading(true);
                          // Delete each notification
                          const deletePromises = notifications.map(notification => 
                            friendNotificationService.deleteNotification(notification.id)
                          );
                          await Promise.all(deletePromises);
                          setNotifications([]);
                        } catch (error) {
                          console.error('Error clearing notifications:', error);
                          Alert.alert('Error', 'Failed to clear notifications');
                        } finally {
                          setLoading(false);
                        }
                      },
                      style: 'destructive'
                    }
                  ]
                );
              }}
            >
              <Text style={[styles.clearAllText, { color: colors.primary }]}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color={isDarkMode ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No notifications</Text>
            <Text style={[styles.emptySubText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
              When friends send you reminders, they'll appear here
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    padding: 8,
    marginRight: 8,
  },
  clearAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  testNotificationItem: {
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
    marginHorizontal: 12,
    position: 'relative',
    paddingTop: 4,
  },
  notificationText: {
    fontSize: 14,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  testBadge: {
    backgroundColor: '#f59e0b',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    position: 'absolute',
    top: -12,
    right: 0,
    zIndex: 1,
  },
  testBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default NotificationsScreen; 