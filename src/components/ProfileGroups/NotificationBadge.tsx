import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { userService } from '../../services/userService';
import { friendNotificationService } from '../../services/friendNotificationService';
import { useTheme } from '../../theme/ThemeProvider';

interface NotificationBadgeProps {
  size?: number;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ size = 18 }) => {
  const { colors } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    
    const loadUnreadCount = async () => {
      try {
        const userId = userService.getCurrentUserId();
        if (!userId) return;
        
        const count = await friendNotificationService.getUnreadCount(userId);
        if (isMounted) {
          setUnreadCount(count);
        }
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    };
    
    loadUnreadCount();
    
    // Refresh unread count every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);
  
  if (unreadCount === 0) {
    return null;
  }
  
  return (
    <View 
      style={[
        styles.badge, 
        { 
          backgroundColor: '#ef4444', // Red color for notification badge
          width: size,
          height: size,
          borderRadius: size / 2,
          right: -size / 3,
          top: -size / 3,
        }
      ]}
    >
      {unreadCount > 0 && (
        <Text style={styles.badgeText}>
          {unreadCount > 9 ? '9+' : unreadCount}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
}); 