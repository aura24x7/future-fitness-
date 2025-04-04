import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usernameService } from '../../services/usernameService';
import { userService } from '../../services/userService';
import { useTheme } from '../../theme/ThemeProvider';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';

type UsernameSelectionScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'UsernameSelection'
>;

type UsernameSelectionScreenRouteProp = RouteProp<
  RootStackParamList,
  'UsernameSelection'
>;

const UsernameSelectionScreen = () => {
  const navigation = useNavigation<UsernameSelectionScreenNavigationProp>();
  const route = useRoute<UsernameSelectionScreenRouteProp>();
  const { colors, isDarkMode } = useTheme();
  const { displayName } = route.params;
  
  const [username, setUsername] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  
  useEffect(() => {
    // Generate initial username suggestions
    generateSuggestions();
  }, []);
  
  const generateSuggestions = async () => {
    setLoading(true);
    try {
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
    
    setLoading(true);
    setError(null);
    
    try {
      const uid = userService.getCurrentUserId();
      console.log('Starting username claim process with UID:', uid);
      
      // Check if UID is valid
      if (!uid || uid === '0') {
        console.error('Invalid user ID. Current user may not be authenticated.');
        setError('Authentication error. Please try logging in again.');
        setLoading(false);
        return;
      }
      
      const success = await usernameService.claimUsername(uid, username);
      
      if (success) {
        console.log('Username claimed successfully:', username);
        // Continue with the next onboarding screen or complete onboarding
        navigation.navigate('Location');
      } else {
        console.error('Failed to claim username:', username);
        setError('Could not claim username, please try another one');
      }
    } catch (err) {
      console.error('Error setting username:', err);
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
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Choose a Username</Text>
        <Text style={[styles.subtitle, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
          This is how others will find you on Future Fitness
        </Text>
        
        <View style={styles.inputContainer}>
          <Text style={[styles.atSymbol, { color: colors.text }]}>@</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: error ? 'red' : isValid ? 'green' : colors.border }]}
            value={username}
            onChangeText={handleUsernameChange}
            placeholder="username"
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
      
      <TouchableOpacity
        style={[
          styles.continueButton,
          { backgroundColor: isValid ? colors.primary : isDarkMode ? '#374151' : '#E5E7EB' }
        ]}
        onPress={handleSubmit}
        disabled={!isValid || loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={[
            styles.continueButtonText,
            { color: isValid ? '#FFFFFF' : isDarkMode ? '#9CA3AF' : '#6B7280' }
          ]}>
            Continue
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
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
  },
  atSymbol: {
    fontSize: 18,
    fontWeight: '500',
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 18,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  indicator: {
    marginLeft: 12,
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
    marginTop: 24,
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
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  refreshText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  continueButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default UsernameSelectionScreen; 