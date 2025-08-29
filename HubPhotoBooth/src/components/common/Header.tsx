import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, layout } from '../../constants/theme';

interface HeaderProps {
  title?: string;
  onBack?: () => void;
  showBack?: boolean;
  rightComponent?: React.ReactNode;
  transparent?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  onBack,
  showBack = false,
  rightComponent,
  transparent = false,
}) => {
  return (
    <View style={[
      styles.container,
      transparent && styles.transparent
    ]}>
      <View style={styles.leftSection}>
        {showBack && onBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {title && (
        <View style={styles.centerSection}>
          <Text style={styles.title}>{title}</Text>
        </View>
      )}
      
      <View style={styles.rightSection}>
        {rightComponent}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.padding.screen,
    paddingVertical: spacing.md,
    minHeight: 80,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backButton: {
    width: layout.icon.large,
    height: layout.icon.large,
    borderRadius: layout.icon.large / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 32,
    color: colors.white,
    fontWeight: 'bold',
    lineHeight: layout.icon.large,
  },
  title: {
    fontFamily: 'Pretendard',
    fontWeight: '700',
    fontSize: typography.fontSize.display,
    color: colors.white,
    textAlign: 'center',
    letterSpacing: typography.letterSpacing.tight,
  },
});

export default Header;

