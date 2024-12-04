import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Contact {
  id: string;
  name: string;
  image?: string;
  lastActive?: string;
}

interface ContactSelectionListProps {
  contacts: Contact[];
  selectedContacts: string[];
  onSelectContact: (contactId: string) => void;
  loading?: boolean;
  searchQuery?: string;
}

export const ContactSelectionList: React.FC<ContactSelectionListProps> = ({
  contacts,
  selectedContacts,
  onSelectContact,
  loading = false,
  searchQuery = '',
}) => {
  const renderContactItem = ({ item: contact }: { item: Contact }) => {
    const isSelected = selectedContacts.includes(contact.id);

    return (
      <TouchableOpacity
        style={[styles.contactItem, isSelected && styles.selectedItem]}
        onPress={() => onSelectContact(contact.id)}
      >
        <View style={styles.contactInfo}>
          <View style={styles.avatarContainer}>
            {contact.image ? (
              <Image source={{ uri: contact.image }} style={styles.avatar} />
            ) : (
              <LinearGradient
                colors={['#6366F1', '#818CF8']}
                style={styles.avatarPlaceholder}
              >
                <Text style={styles.avatarText}>
                  {contact.name.charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
            )}
          </View>
          <View style={styles.contactDetails}>
            <Text style={styles.contactName}>{contact.name}</Text>
            {contact.lastActive && (
              <Text style={styles.lastActive}>
                Last active {contact.lastActive}
              </Text>
            )}
          </View>
        </View>

        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={48} color="#94A3B8" />
      <Text style={styles.emptyStateText}>
        {searchQuery
          ? 'No contacts found'
          : 'No contacts available'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <FlatList
      data={contacts}
      renderItem={renderContactItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={renderEmptyState}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  selectedItem: {
    backgroundColor: '#F0F9FF',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 2,
  },
  lastActive: {
    fontSize: 14,
    color: '#64748B',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
  },
});
