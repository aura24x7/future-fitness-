import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usernameService } from '../services/usernameService';
import { userService } from '../services/userService';
import { useTheme } from '../theme/ThemeProvider';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useProfile } from '../contexts/ProfileContext';
import { RootStackParamList } from '../types/navigation';

type ChangeUsernameScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ChangeUsername'
>;

const ChangeUsernameScreen = () => {
  const navigation = useNavigation<ChangeUsernameScreenNavigationProp>();
  const { colors, isDarkMode } = useTheme();
  const { profile, refreshProfile } = useProfile();
  
  const [username, setUsername] = useState('');
  const [currentUsername, setCurrentUsername] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  
  useEffect(() => {
    // Set current username from profile
    if (profile?.username) {
      setCurrentUsername(profile.username);
    }
    
    // Generate initial username suggestions
    generateSuggestions();
  }, [profile]);
  
  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const displayName = profile?.name || 'user';
      const suggestedNames = usernameService.generateUsernameSuggestions(displayName);
      
      // Filter out taken usernames
      const availableSuggestions = [];
      for (const name of suggestedNames) {
        if (!(await usernameService.isUsernameTaken(name))) {
          availableSuggestions.push(name);
        }
        if (availableSuggestions.length >= 3) break;
      }
      
      setSuggestions(availableSuggestions);
    } catch (err) {
      console.error('Error generating suggestions:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const validateUsername = async (name: string) => {
    // Don't validate if it's the same as current username
    if (name === currentUsername) {
      setIsValid(true);
      setError(null);
      return;
    }
    
    setValidating(true);
    setError(null);
    
    // Check basic validation
    if (!usernameService.isValidUsername(name)) {
      setError('Username must be 3-15 characters and contain only letters, numbers, underscores, and dots');
      setIsValid(false);
      setValidating(false);
      return;
    }
    
    // Check availability
    try {
      const isTaken = await usernameService.isUsernameTaken(name);
      setIsValid(!isTaken);
      if (isTaken) {
        setError('This username is already taken');
      }
    } catch (err) {
      console.error('Error validating username:', err);
      setError('Could not validate username');
      setIsValid(false);
    } finally {
      setValidating(false);
    }
  };
  
  const handleUsernameChange = (text: string) => {
    const formatted = usernameService.formatUsername(text);
    setUsername(formatted);
    validateUsername(formatted);
  };
  
  const handleSuggestionSelect = (suggestion: string) => {
    setUsername(suggestion);
    validateUsername(suggestion);
  };
  
  const handleSubmit = async () => {
    if (!isValid) return;
    
    // Skip if username hasn't changed
    if (username === currentUsername) {
      navigation.goBack();
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const uid = userService.getCurrentUserId();
      console.log('Starting username change process with UID:', uid);
      
      // Check if UID is valid
      if (!uid || uid === '0') {
        console.error('Invalid user ID. Current user may not be authenticated.');
        setError('Authentication error. Please try logging in again.');
        setLoading(false);
        return;
      }
      
      const success = await usernameService.claimUsername(uid, username);
      
      if (success) {
        console.log('Username changed successfully to:', username);
        Alert.alert('Success', 'Your username has been updated!');
        await refreshProfile();
        navigation.goBack();
      } else {
        console.error('Failed to change username to:', username);
        setError('Could not update username, please try another one');
      }
    } catch (err) {
      console.error('Error changing username:', err);
      // Show user-friendly error message
      if (err instanceof Error) {
        if (err.message.includes('No document to update')) {
          setError('Unable to update profile. Please try again.');
        } else if (err.message.includes('Username already taken')) {
          setError('This username was just taken. Please choose another one.');
        } else {
          setError(`Error: ${err.message}`);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? colors.background : '#F9FAFB' }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={colors.text} 
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Change Username</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Choose a New Username</Text>
        <Text style={[styles.subtitle, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
          Your current username is <Text style={{ fontWeight: 'bold' }}>@{currentUsername}</Text>
        </Text>
        
        <View style={styles.inputContainer}>
          <Text style={[styles.atSymbol, { color: colors.text }]}>@</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: error ? 'red' : isValid ? 'green' : colors.border }]}
            value={username}
            onChangeText={handleUsernameChange}
            placeholder="new username"
            placeholderTextColor={isDarkMode ? '#6B7280' : '#9CA3AF'}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {validating ? (
            <ActivityIndicator size="small" color={colors.primary} style={styles.indicator} />
          ) : isValid ? (
            <Ionicons name="checkmark-circle" size={24} color="green" style={styles.indicator} />
          ) : username.length > 0 ? (
            <Ionicons name="close-circle" size={24} color="red" style={styles.indicator} />
          ) : null}
        </View>
        
        {error && <Text style={styles.errorText}>{error}</Text>}
        
        <View style={styles.requirements}>
          <Text style={[styles.requirementsTitle, { color: colors.text }]}>Username requirements:</Text>
          <Text style={[styles.requirementItem, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
            • 3-15 characters
          </Text>
          <Text style={[styles.requirementItem, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
            • Letters (a-z), numbers (0-9), periods (.), and underscores (_)
          </Text>
          <Text style={[styles.requirementItem, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
            • Cannot contain spaces or special characters
          </Text>
        </View>
        
        <View style={styles.suggestions}>
          <Text style={[styles.suggestionsTitle, { color: colors.text }]}>Suggestions:</Text>
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <View style={styles.suggestionList}>
              {suggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.suggestionItem, { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }]}
                  onPress={() => handleSuggestionSelect(suggestion)}
                >
                  <Text style={[styles.suggestionText, { color: colors.text }]}>@{suggestion}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.refreshButton, { backgroundColor: isDarkMode ? '#374151' : '#E5E7EB' }]}
                onPress={generateSuggestions}
              >
                <Ionicons name="refresh" size={18} color={isDarkMode ? '#E5E7EB' : '#4B5563'} />
                <Text style={[styles.refreshText, { color: isDarkMode ? '#E5E7EB' : '#4B5563' }]}>
                  More Suggestions
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.cancelButton,
            { borderColor: colors.border }
          ]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: isValid ? colors.primary : isDarkMode ? '#374151' : '#E5E7EB' }
          ]}
          onPress={handleSubmit}
          disabled={!isValid || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={[
              styles.saveButtonText,
              { color: isValid ? '#FFFFFF' : isDarkMode ? '#9CA3AF' : '#6B7280' }
            ]}>
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  atSymbol: {
    fontSize: 18,
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 18,
    height: '100%',
  },
  indicator: {
    marginLeft: 8,
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
  },
  requirements: {
    marginTop: 16,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  requirementItem: {
    fontSize: 14,
    marginBottom: 4,
  },
  suggestions: {
    marginTop: 8,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  suggestionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
  },
  refreshText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChangeUsernameScreen; 