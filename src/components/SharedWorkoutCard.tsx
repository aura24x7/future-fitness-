import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SharedWorkout, WorkoutComment } from '../types/group';

interface SharedWorkoutCardProps {
  workout: SharedWorkout;
  currentUserId: string;
  onLike: (workoutId: string) => Promise<void>;
  onComment: (workoutId: string, content: string) => Promise<void>;
  onViewDetails: (workout: SharedWorkout) => void;
}

const SharedWorkoutCard: React.FC<SharedWorkoutCardProps> = ({
  workout,
  currentUserId,
  onLike,
  onComment,
  onViewDetails,
}) => {
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLike = async () => {
    try {
      await onLike(workout.id);
    } catch (error) {
      console.error('Error liking workout:', error);
      Alert.alert('Error', 'Failed to like workout');
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;

    try {
      setIsSubmitting(true);
      await onComment(workout.id, comment.trim());
      setComment('');
      setShowComments(true);
    } catch (error) {
      console.error('Error posting comment:', error);
      Alert.alert('Error', 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const renderMetrics = () => {
    if (!workout.metrics) return null;

    return (
      <View style={styles.metricsContainer}>
        <View style={styles.metricItem}>
          <Ionicons
            name="fitness"
            size={16}
            color="#6366F1"
            style={styles.metricIcon}
          />
          <Text style={styles.metricText}>{workout.metrics.difficulty}</Text>
        </View>
        <View style={styles.metricItem}>
          <Ionicons
            name="flame"
            size={16}
            color="#6366F1"
            style={styles.metricIcon}
          />
          <Text style={styles.metricText}>
            Intensity: {workout.metrics.intensity}/10
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => onViewDetails(workout)}
      >
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {workout.userName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.userName}>{workout.userName}</Text>
            <Text style={styles.timestamp}>
              {formatDate(workout.sharedAt)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.workoutName}>{workout.workoutName}</Text>
        {workout.description && (
          <Text style={styles.description}>{workout.description}</Text>
        )}

        {renderMetrics()}

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text style={styles.statText}>{workout.duration} min</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="flame-outline" size={16} color="#6B7280" />
            <Text style={styles.statText}>{workout.calories} cal</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="barbell-outline" size={16} color="#6B7280" />
            <Text style={styles.statText}>
              {workout.exercises.length} exercises
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            workout.likes.includes(currentUserId) && styles.actionButtonActive,
          ]}
          onPress={handleLike}
        >
          <Ionicons
            name={
              workout.likes.includes(currentUserId)
                ? 'heart'
                : 'heart-outline'
            }
            size={20}
            color={
              workout.likes.includes(currentUserId)
                ? '#EF4444'
                : '#6B7280'
            }
          />
          <Text
            style={[
              styles.actionText,
              workout.likes.includes(currentUserId) && styles.actionTextActive,
            ]}
          >
            {workout.likes.length} {workout.likes.length === 1 ? 'Like' : 'Likes'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, showComments && styles.actionButtonActive]}
          onPress={() => setShowComments(!showComments)}
        >
          <Ionicons
            name="chatbubble-outline"
            size={20}
            color="#6B7280"
          />
          <Text style={styles.actionText}>
            {workout.comments.length}{' '}
            {workout.comments.length === 1 ? 'Comment' : 'Comments'}
          </Text>
        </TouchableOpacity>
      </View>

      {showComments && (
        <View style={styles.commentsSection}>
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              value={comment}
              onChangeText={setComment}
              multiline
              maxLength={500}
              editable={!isSubmitting}
            />
            <TouchableOpacity
              style={[
                styles.commentButton,
                (!comment.trim() || isSubmitting) && styles.commentButtonDisabled,
              ]}
              onPress={handleComment}
              disabled={!comment.trim() || isSubmitting}
            >
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {workout.comments.map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentUserName}>{comment.userName}</Text>
                <Text style={styles.commentTimestamp}>
                  {formatDate(comment.createdAt)}
                </Text>
              </View>
              <Text style={styles.commentContent}>{comment.content}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6366F1',
  },
  headerText: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  content: {
    padding: 12,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 12,
  },
  metricsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIcon: {
    marginRight: 4,
  },
  metricText: {
    fontSize: 14,
    color: '#4B5563',
    textTransform: 'capitalize',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#6B7280',
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  actionButtonActive: {
    backgroundColor: '#F3F4F6',
  },
  actionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionTextActive: {
    color: '#EF4444',
  },
  commentsSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 12,
  },
  commentInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
  },
  commentButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  commentItem: {
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  commentTimestamp: {
    fontSize: 12,
    color: '#6B7280',
  },
  commentContent: {
    fontSize: 14,
    color: '#4B5563',
  },
});

export default SharedWorkoutCard;
