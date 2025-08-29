import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing, borderRadius, layout } from '../../constants/theme';

interface FrameCardProps {
  frame: {
    id: string;
    name: string;
    type: 'basic' | 'special';
    layout: '2x6' | '4x6' | 'special';
    preview?: string;
  };
  onPress: () => void;
  selected?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

const FrameCard: React.FC<FrameCardProps> = ({
  frame,
  onPress,
  selected = false,
  size = 'medium',
  style,
}) => {
  const cardStyle = [
    styles.card,
    styles[size],
    selected && styles.selected,
    style,
  ];

  const renderPreview = () => {
    if (frame.layout === '2x6') {
      return (
        <View style={styles.preview2x6}>
          <View style={styles.verticalStrip}>
            <View style={styles.photoSlot} />
            <View style={styles.photoSlot} />
            <View style={styles.photoSlot} />
            <View style={styles.photoSlot} />
          </View>
          <Text style={styles.brandLogo}>인생네컷</Text>
        </View>
      );
    } else if (frame.layout === '4x6') {
      return (
        <View style={styles.preview4x6}>
          <View style={styles.gridFrame}>
            <View style={styles.gridPhotoSlots}>
              <View style={styles.gridPhotoSlot} />
              <View style={styles.gridPhotoSlot} />
              <View style={styles.gridPhotoSlot} />
              <View style={styles.gridPhotoSlot} />
            </View>
          </View>
          <Text style={styles.brandLogo}>인생네컷</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.previewSpecial}>
          <View style={styles.specialFrame}>
            <View style={styles.specialPhotoSlots}>
              <View style={styles.specialPhotoSlot} />
              <View style={styles.specialPhotoSlot} />
              <View style={styles.specialPhotoSlot} />
              <View style={styles.specialPhotoSlot} />
            </View>
          </View>
          <Text style={styles.brandLogo}>인생네컷</Text>
        </View>
      );
    }
  };

  return (
    <TouchableOpacity
      style={cardStyle}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={[
          styles.title,
          frame.type === 'special' && styles.titleWhite
        ]}>
          {frame.name}
        </Text>
      </View>
      
      <View style={styles.preview}>
        {renderPreview()}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    padding: layout.padding.card,
    alignItems: 'center',
  },
  
  // Sizes
  small: {
    width: layout.card.width * 0.8,
    height: layout.card.height * 0.8,
  },
  medium: {
    width: layout.card.width,
    height: layout.card.height,
  },
  large: {
    width: layout.card.width * 1.2,
    height: layout.card.height * 1.2,
  },
  
  // States
  selected: {
    borderColor: colors.white,
    borderWidth: 2,
  },
  
  // Header
  header: {
    marginBottom: spacing.md,
  },
  
  title: {
    fontFamily: 'Pretendard',
    fontWeight: '700',
    fontSize: typography.fontSize.xxl,
    color: colors.primary,
    textAlign: 'center',
    letterSpacing: typography.letterSpacing.normal,
  },
  
  titleWhite: {
    color: colors.white,
  },
  
  // Preview
  preview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // 2x6 Preview
  preview2x6: {
    alignItems: 'center',
  },
  
  verticalStrip: {
    width: 160,
    height: 240,
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  
  photoSlot: {
    width: '100%',
    height: 40,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  
  // 4x6 Preview
  preview4x6: {
    alignItems: 'center',
  },
  
  gridFrame: {
    width: 240,
    height: 240,
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  
  gridPhotoSlots: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  gridPhotoSlot: {
    width: '45%',
    height: '45%',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
  },
  
  // Special Preview
  previewSpecial: {
    alignItems: 'center',
  },
  
  specialFrame: {
    width: 240,
    height: 240,
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  
  specialPhotoSlots: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  specialPhotoSlot: {
    width: '45%',
    height: '45%',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
  },
  
  // Brand Logo
  brandLogo: {
    fontFamily: 'Pretendard',
    fontWeight: '600',
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    textAlign: 'center',
  },
});

export default FrameCard;

