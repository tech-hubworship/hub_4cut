import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { Container, Button } from '../components';
import { colors, typography, spacing, layout } from '../constants/theme';

type MainScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const MainScreen: React.FC = () => {
  const navigation = useNavigation<MainScreenNavigationProp>();

  const handleStart = () => {
    navigation.navigate('FrameSelection', { frameType: 'basic' });
  };

  return (
    <Container padding="none" backgroundColor={colors.primary}>
      <View style={styles.content}>
        <View style={styles.brandSection}>
          <Text style={styles.brandTitle}>허브 네컷</Text>
          <Text style={styles.brandSubtitle}>허브의 소중한 순간을 담다</Text>
        </View>
        
        <View style={styles.actionSection}>
          <Button
            title="시작하기"
            onPress={handleStart}
            variant="secondary"
            size="large"
            fullWidth
            style={styles.startButton}
          />
        </View>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: layout.padding.screen * 3,
    paddingBottom: layout.padding.screen * 2,
  },
  brandSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontFamily: 'Pretendard',
    fontWeight: '700',
    fontSize: typography.fontSize.display,
    lineHeight: 52.5,
    letterSpacing: typography.letterSpacing.tight,
    textAlign: 'center',
    color: colors.white,
    marginBottom: spacing.md,
  },
  brandSubtitle: {
    fontFamily: 'Pretendard',
    fontWeight: '400',
    fontSize: typography.fontSize.lg,
    lineHeight: 33.4,
    letterSpacing: typography.letterSpacing.normal,
    textAlign: 'center',
    color: colors.textGray,
  },
  actionSection: {
    width: '100%',
    paddingHorizontal: layout.padding.screen,
  },
  startButton: {
    marginBottom: spacing.md,
  },
});

export default MainScreen;
