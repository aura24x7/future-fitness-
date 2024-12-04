import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { userService } from '../services/userService';

const AddIndividualScreen: React.FC = () => {
  const navigation = useNavigation();
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);

  const handleSearch = async () => {
    if (!userId.trim()) {
      Alert.alert('Error', 'Please enter a user ID');
      return;
    }

    setLoading(true);
    try {
      const user = await userService.findUserById(userId.trim());
      if (user) {
        setSearchResult(user);
      } else {
        Alert.alert('Not Found', 'No user found with this ID');
        setSearchResult(null);
      }
    } catch (error) {
      console.error('Error searching user:', error);
      Alert.alert('Error', 'Failed to search for user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddIndividual = async () => {
    if (!searchResult) return;

    setLoading(true);
    try {
      await userService.addConnection(searchResult.id);
      Alert.alert(
        'Success',
        'Individual added successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error adding individual:', error);
      Alert.alert('Error', 'Failed to add individual. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={['#6366f1', '#818cf8', '#a5b4fc', '#e0e7ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.6 }}
        style={styles.backgroundGradient}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Individual</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>User ID</Text>
            <TextInput
              style={styles.input}
              value={userId}
              onChangeText={setUserId}
              placeholder="Enter user ID"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={loading}
          >
            <LinearGradient
              colors={['#8B5CF6', '#6366F1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Search</Text>
                  <Ionicons name="search" size={20} color="#FFFFFF" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {searchResult && (
            <View style={styles.resultContainer}>
              <View style={styles.userCard}>
                <View style={styles.userIcon}>
                  <Ionicons name="person" size={24} color="#6366F1" />
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{searchResult.name}</Text>
                  <Text style={styles.userId}>ID: {searchResult.id}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddIndividual}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#6366F1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientButton}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>Add Individual</Text>
                      <Ionicons name="add" size={20} color="#FFFFFF" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.description}>
            Enter the unique user ID of the person you'd like to add. You can find this ID in their profile settings.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingTop: 24,
  },
  form: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginTop: 24,
  },
  searchButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resultContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 16,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  userId: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
});

export default AddIndividualScreen;
