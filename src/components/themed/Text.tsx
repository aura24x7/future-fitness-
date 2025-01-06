import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { useTypography } from '../../hooks/useTypography';
import { mapLegacyStyle } from '../../utils/typography';

type TypographyVariant = 'heading1' | 'heading2' | 'heading3' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'caption' | 'overline';

interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  children: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({ 
  variant,
  style,
  children,
  ...props 
}) => {
  const typography = useTypography();
  
  // Handle legacy styles
  if (!variant && style) {
    const styleArray = Array.isArray(style) ? style : [style];
    const flattenedStyle = Object.assign({}, ...styleArray) as TextStyle;
    const { variant: mappedVariant, additionalStyle } = mapLegacyStyle(flattenedStyle);
    
    return (
      <RNText
        style={[typography[mappedVariant], additionalStyle]}
        {...props}
      >
        {children}
      </RNText>
    );
  }

  // Handle new typography system
  return (
    <RNText
      style={[typography[variant || 'body1'], style]}
      {...props}
    >
      {children}
    </RNText>
  );
};

export default Text;
