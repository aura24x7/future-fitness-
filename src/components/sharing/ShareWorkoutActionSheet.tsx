import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { WeeklyWorkoutPlan } from '../../types/workout';
import { ShareRecipientType } from '../../types/sharing';
import { ContactSelectionList } from './ContactSelectionList';
import { GroupSelectionList } from './GroupSelectionList';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.8;
const SNAP_POINTS = {
  TOP: 0,
  BOTTOM: SHEET_HEIGHT,
};

interface ShareWorkoutActionSheetProps {
  isVisible: boolean;
  onClose: () => void;
  workoutPlan: WeeklyWorkoutPlan;
  onShare: (recipients: { type: ShareRecipientType; ids: string[] }[]) => void;
}

export const ShareWorkoutActionSheet: React.FC<ShareWorkoutActionSheetProps> = ({
  isVisible,
  onClose,
  workoutPlan,
  onShare,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<ShareRecipientType>('individual');
  const [selectedIndividuals, setSelectedIndividuals] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      showSheet();
    } else {
      hideSheet();
    }
  }, [isVisible]);

  const showSheet = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateY, opacity]);

  const hideSheet = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      // Reset selections when closing
      setSelectedIndividuals([]);
      setSelectedGroups([]);
    });
  }, [translateY, opacity, onClose]);

  const handleShare = useCallback(() => {
    const recipients: { type: ShareRecipientType; ids: string[] }[] = [];
    if (selectedIndividuals.length > 0) {
      recipients.push({ type: 'individual', ids: selectedIndividuals });
    }
    if (selectedGroups.length > 0) {
      recipients.push({ type: 'group', ids: selectedGroups });
    }
    onShare(recipients);
    hideSheet();
  }, [selectedIndividuals, selectedGroups, onShare, hideSheet]);

  const hasSelections = selectedIndividuals.length > 0 || selectedGroups.length > 0;

  if (!isVisible) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: opacity,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backdropTouchable}
          onPress={hideSheet}
          activeOpacity={1}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.sheet,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        <LinearGradient
          colors={['#F0F9FF', '#E0F2FE']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={hideSheet} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#1E293B" />
            </TouchableOpacity>
            <Text style={styles.title}>Share Workout</Text>
            {hasSelections && (
              <Text style={styles.selectionCount}>
                {selectedIndividuals.length + selectedGroups.length} selected
              </Text>
            )}
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#64748B" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'individual' && styles.activeTab]}
              onPress={() => setSelectedTab('individual')}
            >
              <Text style={[styles.tabText, selectedTab === 'individual' && styles.activeTabText]}>
                Individuals
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'group' && styles.activeTab]}
              onPress={() => setSelectedTab('group')}
            >
              <Text style={[styles.tabText, selectedTab === 'group' && styles.activeTabText]}>
                Groups
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {selectedTab === 'individual' ? (
            <ContactSelectionList
              contacts={[]} // TODO: Add your contacts data here
              selectedContacts={selectedIndividuals}
              onSelectContact={(id) => {
                setSelectedIndividuals(prev =>
                  prev.includes(id)
                    ? prev.filter(contactId => contactId !== id)
                    : [...prev, id]
                );
              }}
              searchQuery={searchQuery}
            />
          ) : (
            <GroupSelectionList
              groups={[]} // TODO: Add your groups data here
              selectedGroups={selectedGroups}
              onSelectGroup={(id) => {
                setSelectedGroups(prev =>
                  prev.includes(id)
                    ? prev.filter(groupId => groupId !== id)
                    : [...prev, id]
                );
              }}
              searchQuery={searchQuery}
            />
          )}
        </View>

        {hasSelections && (
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
          >
            <LinearGradient
              colors={['#6366F1', '#818CF8']}
              style={styles.shareButtonGradient}
            >
              <Text style={styles.shareButtonText}>
                Share with {selectedIndividuals.length + selectedGroups.length} recipients
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouchable: {
    flex: 1,
  },
  sheet: {
    height: SHEET_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 12,
    flex: 1,
  },
  selectionCount: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
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
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#1E293B',
    fontSize: 16,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#6366F1',
  },
  tabText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#6366F1',
  },
  content: {
    flex: 1,
  },
  shareButton: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  shareButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
