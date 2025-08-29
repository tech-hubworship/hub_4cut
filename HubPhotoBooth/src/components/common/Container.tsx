import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, layout } from '../../constants/theme';

interface ContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: 'none' | 'small' | 'medium' | 'large';
  backgroundColor?: string;
  safeArea?: boolean;
}

const Container: React.FC<ContainerProps> = ({
  children,
  style,
  padding = 'medium',
  backgroundColor = colors.primary,
  safeArea = true,
}) => {
  const getPaddingStyle = () => {
    switch (padding) {
      case 'none':
        return styles.paddingNone;
      case 'small':
        return styles.paddingSmall;
      case 'large':
        return styles.paddingLarge;
      default:
        return styles.paddingMedium;
    }
  };

  const containerStyle = [
    styles.container,
    { backgroundColor },
    getPaddingStyle(),
    style,
  ];

  if (safeArea) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
        <View style={containerStyle}>
          {children}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={containerStyle}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  paddingNone: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  paddingSmall: {
    paddingHorizontal: layout.padding.screen / 2,
    paddingVertical: layout.padding.screen / 2,
  },
  paddingMedium: {
    paddingHorizontal: layout.padding.screen,
    paddingVertical: layout.padding.screen,
  },
  paddingLarge: {
    paddingHorizontal: layout.padding.screen * 1.5,
    paddingVertical: layout.padding.screen * 1.5,
  },
});

export default Container;

