import React from 'react';
import { 
  TouchableOpacity, 
  TouchableOpacityProps, 
  StyleSheet, 
  Text, 
  ActivityIndicator,
  View,
  Dimensions
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface SafeWorkoutButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const SafeWorkoutButton: React.FC<SafeWorkoutButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  fullWidth = false,
  icon,
  style,
  ...props
}) => {
  const { colors, isDarkMode } = useTheme();
  
  // Get gradient colors based on variant
  const getGradientColors = (): readonly [string, string] => {
    if (props.disabled) {
      return isDarkMode 
        ? ['#2A2A2A', '#222222'] as const 
        : ['#E5E7EB', '#D1D5DB'] as const;
    }
    
    switch (variant) {
      case 'primary':
        return isDarkMode 
          ? ['#8B5CF6', '#7C3AED'] as const // Purple gradient
          : ['#8B5CF6', '#7C3AED'] as const;
      case 'secondary':
        return isDarkMode 
          ? ['#6366F1', '#4F46E5'] as const // Indigo gradient
          : ['#6366F1', '#4F46E5'] as const;
      case 'outline':
        return isDarkMode 
          ? ['#1E1E1E', '#121212'] as const 
          : ['#FFFFFF', '#F9FAFB'] as const;
      case 'danger':
        return isDarkMode 
          ? ['#EF4444', '#DC2626'] as const // Red gradient
          : ['#F87171', '#EF4444'] as const;
      default:
        return isDarkMode 
          ? ['#8B5CF6', '#7C3AED'] as const 
          : ['#8B5CF6', '#7C3AED'] as const;
    }
  };
  
  // Determine text color based on variant
  const getTextColor = () => {
    if (props.disabled) {
      return isDarkMode ? '#666666' : '#9CA3AF';
    }
    
    if (variant === 'outline') {
      return isDarkMode ? '#A78BFA' : '#8B5CF6';
    }
    
    return '#FFFFFF';
  };
  
  // Determine border properties
  const getBorderStyle = () => {
    if (variant === 'outline') {
      return {
        borderWidth: 1.5,
        borderColor: props.disabled 
          ? (isDarkMode ? '#444444' : '#D1D5DB') 
          : (isDarkMode ? '#A78BFA' : '#8B5CF6')
      };
    }
    
    return {};
  };
  
  // Determine height based on size
  const getHeight = () => {
    switch (size) {
      case 'small':
        return 36;
      case 'large':
        return 54;
      case 'medium':
      default:
        return 48; // Standard height for most buttons
    }
  };
  
  const getShadowStyle = () => {
    if (variant === 'outline' || props.disabled) {
      return {};
    }
    
    return {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: isDarkMode ? 0.3 : 0.15,
      shadowRadius: 6,
      elevation: isDarkMode ? 5 : 3,
    };
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { 
          height: getHeight(),
          borderRadius: 12,
        },
        getBorderStyle(),
        getShadowStyle(),
        fullWidth && styles.fullWidth,
        style
      ]}
      activeOpacity={0.7}
      {...props}
    >
      <LinearGradient
        colors={getGradientColors()}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        {isLoading ? (
          <ActivityIndicator color={getTextColor()} size="small" />
        ) : (
          <View style={styles.contentContainer}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text 
              style={[
                styles.text, 
                { color: getTextColor() },
                size === 'small' && { fontSize: 13 },
                size === 'large' && { fontSize: 16, letterSpacing: 0.5 },
              ]}
            >
              {title}
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    minWidth: 110,
  },
  gradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    fontSize: 15,
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  iconContainer: {
    marginRight: 8,
  }
}); 