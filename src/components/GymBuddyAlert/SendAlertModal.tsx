import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGymBuddyAlert } from '../../contexts/GymBuddyAlertContext';

interface SendAlertModalProps {
  visible: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
}

export function SendAlertModal({
  visible,
  onClose,
  recipientId,
  recipientName,
}: SendAlertModalProps) {
  const [message, setMessage] = useState('');
  const { sendAlert, state } = useGymBuddyAlert();

  const handleSend = async () => {
    if (!message.trim()) return;
    
    try {
      await sendAlert(recipientId, message.trim());
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Error sending alert:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Send Alert to {recipientName}</Text>
          </View>
          
          {state.error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{state.error}</Text>
            </View>
          )}
          
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
          />
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.button, 
                styles.sendButton,
                (!message.trim() || state.isLoading) && styles.disabledButton
              ]} 
              onPress={handleSend}
              disabled={!message.trim() || state.isLoading}
            >
              {state.isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.buttonText, styles.sendButtonText]}>Send</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
  },
  sendButton: {
    backgroundColor: '#6366F1',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  sendButtonText: {
    color: '#FFFFFF',
  },
});
