import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { UserBadge } from '../types/achievements';

interface BadgeCardProps {
  badge: UserBadge;
  onPress?: () => void;
  style?: ViewStyle;
  showProgress?: boolean;
}

const BadgeCard: React.FC<BadgeCardProps> = ({
  badge,
  onPress,
  style,
  showProgress = true,
}) => {
  const progressPercentage = (badge.progress / badge.criteria.value) * 100;

  const rarityStyles = {
    common: {
      glow: ['#D1D5DB', '#9CA3AF'],
      intensity: 0.1,
    },
    rare: {
      glow: ['#60A5FA', '#3B82F6'],
      intensity: 0.2,
    },
    epic: {
      glow: ['#8B5CF6', '#6D28D9'],
      intensity: 0.3,
    },
    legendary: {
      glow: ['#F59E0B', '#D97706'],
      intensity: 0.4,
    },
  };

  const renderBadgeIcon = () => (
    <View style={[
      styles.iconContainer,
      { backgroundColor: badge.colorScheme.secondary },
      badge.isComplete && styles.completedIconContainer,
    ]}>
      <LinearGradient
        colors={badge.isComplete ? rarityStyles[badge.rarity].glow : [badge.colorScheme.primary, badge.colorScheme.primary]}
        style={styles.iconGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons
          name={badge.iconName as any}
          size={24}
          color={badge.isComplete ? '#FFFFFF' : badge.colorScheme.primary}
        />
      </LinearGradient>
    </View>
  );

  const renderProgressBar = () => {
    if (!showProgress || badge.isComplete) return null;

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${Math.min(progressPercentage, 100)}%`,
                backgroundColor: badge.colorScheme.primary,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: badge.colorScheme.text }]}>
          {badge.progress}/{badge.criteria.value}
        </Text>
      </View>
    );
  };

  const renderBadgeContent = () => (
    <>
      {renderBadgeIcon()}
      <View style={styles.textContainer}>
        <Text style={[styles.name, { color: badge.colorScheme.text }]}>
          {badge.name}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {badge.description}
        </Text>
        {badge.isComplete && (
          <Text style={[styles.earnedDate, { color: badge.colorScheme.primary }]}>
            Earned {new Date(badge.earnedAt).toLocaleDateString()}
          </Text>
        )}
        {renderProgressBar()}
      </View>
      {onPress && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color="#9CA3AF"
          style={styles.chevron}
        />
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.container, style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {renderBadgeContent()}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {renderBadgeContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  completedIconContainer: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  iconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  earnedDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chevron: {
    marginLeft: 8,
  },
});

export default BadgeCard;
