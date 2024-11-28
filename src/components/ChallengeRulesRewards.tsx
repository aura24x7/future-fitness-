import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  DEFAULT_CHALLENGE_RULES,
  SUGGESTED_REWARDS,
} from '../utils/challengeUtils';

interface ChallengeRulesRewardsProps {
  rules: string[];
  rewards: string[];
  onUpdateRules: (rules: string[]) => void;
  onUpdateRewards: (rewards: string[]) => void;
}

const ChallengeRulesRewards: React.FC<ChallengeRulesRewardsProps> = ({
  rules,
  rewards,
  onUpdateRules,
  onUpdateRewards,
}) => {
  const [newRule, setNewRule] = useState('');
  const [newReward, setNewReward] = useState('');

  const handleAddRule = () => {
    if (newRule.trim()) {
      onUpdateRules([...rules, newRule.trim()]);
      setNewRule('');
    }
  };

  const handleRemoveRule = (index: number) => {
    onUpdateRules(rules.filter((_, i) => i !== index));
  };

  const handleAddReward = () => {
    if (newReward.trim()) {
      onUpdateRewards([...rewards, newReward.trim()]);
      setNewReward('');
    }
  };

  const handleRemoveReward = (index: number) => {
    onUpdateRewards(rewards.filter((_, i) => i !== index));
  };

  const handleAddDefaultRule = (rule: string) => {
    if (!rules.includes(rule)) {
      onUpdateRules([...rules, rule]);
    }
  };

  const handleAddSuggestedReward = (reward: string) => {
    if (!rewards.includes(reward)) {
      onUpdateRewards([...rewards, reward]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Challenge Rules</Text>
        <Text style={styles.sectionDescription}>
          Set clear rules for participants to follow
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newRule}
            onChangeText={setNewRule}
            placeholder="Add a new rule..."
            placeholderTextColor="#9CA3AF"
            returnKeyType="done"
            onSubmitEditing={handleAddRule}
          />
          <TouchableOpacity
            style={[styles.addButton, !newRule.trim() && styles.addButtonDisabled]}
            onPress={handleAddRule}
            disabled={!newRule.trim()}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.suggestionsContainer}
        >
          {DEFAULT_CHALLENGE_RULES.filter(rule => !rules.includes(rule)).map(
            (rule, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionChip}
                onPress={() => handleAddDefaultRule(rule)}
              >
                <Ionicons name="add-circle-outline" size={16} color="#6366F1" />
                <Text style={styles.suggestionText}>{rule}</Text>
              </TouchableOpacity>
            )
          )}
        </ScrollView>

        <View style={styles.listContainer}>
          {rules.map((rule, index) => (
            <View key={index} style={styles.listItem}>
              <Ionicons name="checkmark-circle" size={20} color="#6366F1" />
              <Text style={styles.listItemText}>{rule}</Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveRule(index)}
              >
                <Ionicons name="close-circle" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Challenge Rewards</Text>
        <Text style={styles.sectionDescription}>
          Add incentives for completing the challenge
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newReward}
            onChangeText={setNewReward}
            placeholder="Add a new reward..."
            placeholderTextColor="#9CA3AF"
            returnKeyType="done"
            onSubmitEditing={handleAddReward}
          />
          <TouchableOpacity
            style={[
              styles.addButton,
              !newReward.trim() && styles.addButtonDisabled,
            ]}
            onPress={handleAddReward}
            disabled={!newReward.trim()}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.suggestionsContainer}
        >
          {SUGGESTED_REWARDS.filter(reward => !rewards.includes(reward)).map(
            (reward, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionChip}
                onPress={() => handleAddSuggestedReward(reward)}
              >
                <Ionicons name="add-circle-outline" size={16} color="#6366F1" />
                <Text style={styles.suggestionText}>{reward}</Text>
              </TouchableOpacity>
            )
          )}
        </ScrollView>

        <View style={styles.listContainer}>
          {rewards.map((reward, index) => (
            <View key={index} style={styles.listItem}>
              <Ionicons name="trophy" size={20} color="#F59E0B" />
              <Text style={styles.listItemText}>{reward}</Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveReward(index)}
              >
                <Ionicons name="close-circle" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: '#6366F1',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  suggestionsContainer: {
    marginBottom: 16,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#6366F1',
    marginLeft: 4,
  },
  listContainer: {
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listItemText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 12,
  },
  removeButton: {
    padding: 4,
  },
  divider: {
    height: 8,
    backgroundColor: '#F3F4F6',
  },
});

export default ChallengeRulesRewards;
