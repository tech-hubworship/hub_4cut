import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, typography, spacing, borderRadius, layout } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const buttonStyle = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyleCombined = [
    styles.text,
    styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}`],
    styles[`text${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    disabled && styles.textDisabled,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={textStyleCombined}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
  },
  
  // Variants
  primary: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.white,
  },
  
  // Sizes
  small: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 40,
  },
  medium: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 56,
  },
  large: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    minHeight: 64,
  },
  
  // States
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
  
  // Text styles
  text: {
    fontFamily: 'Pretendard',
    fontWeight: '700',
    textAlign: 'center',
  },
  textSmall: {
    fontSize: typography.fontSize.sm,
    lineHeight: 22,
  },
  textMedium: {
    fontSize: typography.fontSize.md,
    lineHeight: 28,
  },
  textLarge: {
    fontSize: typography.fontSize.lg,
    lineHeight: 33,
  },
  textPrimary: {
    color: colors.white,
  },
  textSecondary: {
    color: colors.white,
  },
  textOutline: {
    color: colors.white,
  },
  textDisabled: {
    color: colors.textGray,
  },
});

export default Button;
