import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { userService } from '../services/userService';
import { useTheme } from '../theme/ThemeProvider';
import { formatDistanceToNow } from 'date-fns';

interface RequestItemProps {
  type: 'incoming' | 'outgoing';
  data: any;
  onAccept?: (connectionId: string) => void;
  onReject?: (connectionId: string) => void;
}

// Utility function to safely convert timestamp to Date
const safelyConvertToDate = (timestamp: any): Date => {
  if (!timestamp) {
    return new Date(); // Default to current date if missing
  }
  
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  // Handle Firestore Timestamp objects
  if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp) {
    return timestamp.toDate();
  }
  
  // Try to parse as a string/number date
  try {
    const date = new Date(timestamp);
    // Check if the date is valid
    if (!isNaN(date.getTime())) {
      return date;
    }
  } catch (e) {
    console.error('Error parsing date:', e);
  }
  
  // Fallback to current date if everything fails
  return new Date();
};

// Component to display individual request
const RequestItem: React.FC<RequestItemProps> = ({ type, data, onAccept, onReject }) => {
  const { colors, isDarkMode } = useTheme();
  const person = type === 'incoming' ? data.sender : data.receiver;
  
  // Use the safe conversion function
  const date = safelyConvertToDate(data.createdAt);
  const timeAgo = formatDistanceToNow(date, { addSuffix: true });
  
  // Get initial safely
  const initial = person && person.name ? person.name.charAt(0) : '?';
  const displayName = person && person.name ? person.name : 'Unknown User';

  return (
    <View style={[styles.requestItem, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
      <View style={styles.userInfo}>
        <View style={[styles.userInitial, { backgroundColor: colors.primary }]}>
          <Text style={styles.initialText}>{initial}</Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={[styles.userName, { color: colors.text }]}>{displayName}</Text>
          <Text style={[styles.timeAgo, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
            {type === 'incoming' ? 'Requested' : 'Sent'} {timeAgo}
          </Text>
        </View>
      </View>

      {type === 'incoming' ? (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.acceptButton, { backgroundColor: colors.primary }]}
            onPress={() => onAccept && onAccept(data.connectionId)}
          >
            <Text style={styles.actionButtonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.rejectButton, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}
            onPress={() => onReject && onReject(data.connectionId)}
          >
            <Text style={[styles.rejectButtonText, { color: isDarkMode ? '#E5E7EB' : '#4B5563' }]}>
              Reject
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}
          onPress={() => onReject && onReject(data.connectionId)}
        >
          <Text style={[styles.cancelButtonText, { color: isDarkMode ? '#E5E7EB' : '#4B5563' }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Main screen component
const ConnectionRequestsScreen: React.FC = ({ navigation }: any) => {
  const { colors, isDarkMode } = useTheme();
  const [requests, setRequests] = useState<{ incoming: any[]; outgoing: any[] }>({ 
    incoming: [], 
    outgoing: [] 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  
  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const currentUserId = userService.getCurrentUserId();
      const pendingRequests = await userService.getPendingRequests(currentUserId);
      setRequests(pendingRequests);
    } catch (err) {
      setError('Failed to load connection requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadRequests();
    
    // Add listener for screen focus to refresh data
    const unsubscribe = navigation.addListener('focus', () => {
      loadRequests();
    });
    
    return unsubscribe;
  }, [navigation]);
  
  const handleAccept = async (connectionId: string) => {
    try {
      await userService.acceptConnection(connectionId);
      Alert.alert('Success', 'Connection request accepted!');
      // Refresh the list
      loadRequests();
    } catch (err) {
      Alert.alert('Error', 'Failed to accept request');
      console.error(err);
    }
  };
  
  const handleReject = async (connectionId: string) => {
    try {
      await userService.rejectConnection(connectionId);
      Alert.alert('Success', 'Connection request rejected');
      // Refresh the list
      loadRequests();
    } catch (err) {
      Alert.alert('Error', 'Failed to reject request');
      console.error(err);
    }
  };
  
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDarkMode ? colors.background : '#F9FAFB' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? colors.background : '#F9FAFB' }]}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'incoming' && [styles.activeTab, { borderBottomColor: colors.primary }]
          ]}
          onPress={() => setActiveTab('incoming')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'incoming' ? colors.primary : isDarkMode ? '#9CA3AF' : '#6B7280' }
            ]}
          >
            Incoming ({requests.incoming.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'outgoing' && [styles.activeTab, { borderBottomColor: colors.primary }]
          ]}
          onPress={() => setActiveTab('outgoing')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'outgoing' ? colors.primary : isDarkMode ? '#9CA3AF' : '#6B7280' }
            ]}
          >
            Outgoing ({requests.outgoing.length})
          </Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.primary }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={loadRequests}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={activeTab === 'incoming' ? requests.incoming : requests.outgoing}
          keyExtractor={(item) => item.connectionId}
          renderItem={({ item }) => (
            <RequestItem
              type={activeTab}
              data={item}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name={activeTab === 'incoming' ? 'person-add-outline' : 'paper-plane-outline'}
                size={64}
                color={isDarkMode ? '#6B7280' : '#9CA3AF'}
              />
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No {activeTab} requests
              </Text>
              <Text style={[styles.emptySubText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                {activeTab === 'incoming'
                  ? 'When someone sends you a connection request, it will appear here'
                  : 'Connection requests you\'ve sent will appear here'}
              </Text>
              {activeTab === 'outgoing' && (
                <TouchableOpacity
                  style={[styles.findFriendsButton, { backgroundColor: colors.primary }]}
                  onPress={() => navigation.navigate('FriendSearch')}
                >
                  <Text style={styles.findFriendsButtonText}>Find Friends</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      )}
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  requestItem: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInitial: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  initialText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  timeAgo: {
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  acceptButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  rejectButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  rejectButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  cancelButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  findFriendsButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  findFriendsButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ConnectionRequestsScreen; 