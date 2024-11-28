import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GroupInvite } from '../types/group';

interface InviteListComponentProps {
  invites: GroupInvite[];
  isLoading?: boolean;
  isAdmin?: boolean;
  onAcceptInvite?: (invite: GroupInvite) => void;
  onRejectInvite?: (invite: GroupInvite) => void;
  onCancelInvite?: (invite: GroupInvite) => void;
}

const InviteListComponent: React.FC<InviteListComponentProps> = ({
  invites,
  isLoading = false,
  isAdmin = false,
  onAcceptInvite,
  onRejectInvite,
  onCancelInvite,
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#F59E0B'; // Amber
      case 'accepted':
        return '#10B981'; // Green
      case 'rejected':
        return '#EF4444'; // Red
      case 'expired':
        return '#6B7280'; // Gray
      default:
        return '#6B7280';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpired = (invite: GroupInvite) => {
    return new Date(invite.expiresAt) < new Date();
  };

  const isPending = (invite: GroupInvite) => {
    return invite.status === 'pending' && !isExpired(invite);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#6366F1" />
      </View>
    );
  }

  if (invites.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No invites to display</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {invites.map((invite) => (
        <View key={invite.id} style={styles.inviteCard}>
          <View style={styles.inviteInfo}>
            <View style={styles.emailContainer}>
              <Ionicons name="mail" size={20} color="#6366F1" />
              <Text style={styles.emailText}>{invite.email}</Text>
            </View>
            <View style={styles.detailsContainer}>
              <Text style={styles.roleText}>Role: {invite.role}</Text>
              <Text style={styles.dateText}>
                {isExpired(invite) ? 'Expired' : 'Expires'}: {formatDate(invite.expiresAt)}
              </Text>
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(invite.status) },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(invite.status) },
                  ]}
                >
                  {isExpired(invite) && invite.status === 'pending'
                    ? 'Expired'
                    : invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
                </Text>
              </View>
            </View>
          </View>

          {isPending(invite) && (
            <View style={styles.actionsContainer}>
              {isAdmin ? (
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => onCancelInvite?.(invite)}
                >
                  <Ionicons name="close" size={20} color="#EF4444" />
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => onAcceptInvite?.(invite)}
                  >
                    <Ionicons name="checkmark" size={20} color="#10B981" />
                    <Text style={styles.acceptButtonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => onRejectInvite?.(invite)}
                  >
                    <Ionicons name="close" size={20} color="#EF4444" />
                    <Text style={styles.rejectButtonText}>Reject</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  inviteCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inviteInfo: {
    flex: 1,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginLeft: 8,
  },
  detailsContainer: {
    marginLeft: 28,
  },
  roleText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  acceptButton: {
    backgroundColor: '#D1FAE5',
  },
  rejectButton: {
    backgroundColor: '#FEE2E2',
  },
  cancelButton: {
    backgroundColor: '#FEE2E2',
  },
  acceptButtonText: {
    color: '#10B981',
    fontWeight: '500',
    fontSize: 14,
  },
  rejectButtonText: {
    color: '#EF4444',
    fontWeight: '500',
    fontSize: 14,
  },
  cancelButtonText: {
    color: '#EF4444',
    fontWeight: '500',
    fontSize: 14,
  },
});

export default InviteListComponent;
