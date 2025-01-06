import { TextStyle } from 'react-native';

type TypographyVariant = 'heading1' | 'heading2' | 'heading3' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'caption' | 'overline';

interface MappedStyle {
  variant: TypographyVariant;
  additionalStyle: TextStyle;
}

export function mapLegacyStyle(style: TextStyle): MappedStyle {
  const { fontSize, fontWeight, lineHeight, ...rest } = style;
  
  // Map font sizes to variants
  let variant: TypographyVariant = 'body1';
  
  if (fontSize) {
    if (fontSize >= 24) variant = 'heading1';
    else if (fontSize >= 20) variant = 'heading2';
    else if (fontSize >= 18) variant = 'heading3';
    else if (fontSize >= 16) variant = 'subtitle1';
    else if (fontSize >= 14) variant = 'body1';
    else variant = 'caption';
  }
  
  // Return mapped variant and any additional styles
  return {
    variant,
    additionalStyle: rest
  };
} 