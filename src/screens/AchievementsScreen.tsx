import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import BadgeCard from '../components/BadgeCard';
import { achievementService } from '../services/achievementService';
import { UserBadge, BadgeCategory } from '../types/achievements';

const categories: { id: BadgeCategory; name: string; icon: string }[] = [
  { id: 'workout', name: 'Workouts', icon: 'barbell' },
  { id: 'challenge', name: 'Challenges', icon: 'trophy' },
  { id: 'social', name: 'Social', icon: 'people' },
  { id: 'consistency', name: 'Consistency', icon: 'calendar' },
  { id: 'milestone', name: 'Milestones', icon: 'flag' },
];

const AchievementsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory>('workout');
  const [stats, setStats] = useState({
    totalBadges: 0,
    earnedBadges: 0,
    recentBadges: [] as UserBadge[],
  });

  const loadBadges = async () => {
    try {
      setLoading(true);
      const userId = 'current-user-id'; // Replace with actual user ID
      const userBadges = await achievementService.getUserBadges(userId);
      const recentAchievements = await achievementService.getRecentAchievements(userId);

      setBadges(userBadges);
      setStats({
        totalBadges: userBadges.length,
        earnedBadges: userBadges.filter(b => b.isComplete).length,
        recentBadges: recentAchievements,
      });
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBadges();
  }, []);

  const filteredBadges = badges.filter(badge => badge.category === selectedCategory);

  const renderHeader = () => (
    <LinearGradient
      colors={['#6366F1', '#4F46E5']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Achievements</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.earnedBadges}</Text>
          <Text style={styles.statLabel}>Earned</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalBadges}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {((stats.earnedBadges / stats.totalBadges) * 100).toFixed(0)}%
          </Text>
          <Text style={styles.statLabel}>Complete</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderCategories = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoriesContainer}
    >
      {categories.map(category => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryButton,
            selectedCategory === category.id && styles.categoryButtonActive,
          ]}
          onPress={() => setSelectedCategory(category.id)}
        >
          <Ionicons
            name={category.icon as any}
            size={20}
            color={selectedCategory === category.id ? '#FFFFFF' : '#6B7280'}
          />
          <Text
            style={[
              styles.categoryText,
              selectedCategory === category.id && styles.categoryTextActive,
            ]}
          >
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderRecentAchievements = () => {
    if (stats.recentBadges.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Achievements</Text>
        {stats.recentBadges.map(badge => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            style={styles.badgeCard}
            showProgress={false}
          />
        ))}
      </View>
    );
  };

  const renderBadgesList = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>All Badges</Text>
      {filteredBadges.map(badge => (
        <BadgeCard
          key={badge.id}
          badge={badge}
          style={styles.badgeCard}
          onPress={() => {
            // TODO: Navigate to badge details screen
            console.log('Navigate to badge details:', badge.id);
          }}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : (
        <>
          {renderCategories()}
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {renderRecentAchievements()}
            {renderBadgesList()}
          </ScrollView>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 48,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#E0E7FF',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    padding: 16,
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#6366F1',
  },
  categoryText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  badgeCard: {
    marginBottom: 12,
  },
});

export default AchievementsScreen;
