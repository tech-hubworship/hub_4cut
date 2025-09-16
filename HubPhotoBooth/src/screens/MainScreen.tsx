import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { Container, Button } from '../components';
import { colors, typography, spacing, layout } from '../constants/theme';

type MainScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const { width, height } = Dimensions.get('window');

// 기준 레이아웃 크기
const BASE_WIDTH = 834;
const BASE_HEIGHT = 1194;

// 비율 계산
const scaleX = width / BASE_WIDTH;
const scaleY = height / BASE_HEIGHT;
const scale = Math.min(scaleX, scaleY);

const MainScreen: React.FC = () => {
  const navigation = useNavigation<MainScreenNavigationProp>();

  const handleStart = () => {
    navigation.navigate('FrameSelection', { frameType: 'basic' });
  };

  return (
    <ImageBackground
      source={require('../../assets/image/mainImage.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          
          <View style={styles.actionSection}>
            <Button
              title="시작하기"
              onPress={handleStart}
              variant="secondary"
              size="large"
              fullWidth
              style={styles.startButton}
              textStyle={styles.startButtonText}
            />
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // 약간의 어둠 효과로 텍스트 가독성 향상
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
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
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  brandSubtitle: {
    fontFamily: 'Pretendard',
    fontWeight: '400',
    fontSize: typography.fontSize.lg,
    lineHeight: 33.4,
    letterSpacing: typography.letterSpacing.normal,
    textAlign: 'center',
    color: colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  actionSection: {
    width: '100%',
    paddingHorizontal: layout.padding.screen,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  startButton: {
    width: Math.min(518 * scaleX, width * 0.9),
    height: 56 * scaleY,
    borderRadius: 10 * scale,
    padding: 10 * scale,
    gap: 10 * scale,
    backgroundColor: '#FF474A',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4 * scale,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65 * scale,
    elevation: 8,
  },
  startButtonText: {
    fontFamily: 'Pretendard',
    fontWeight: '700',
    fontSize: 22 * scale,
    lineHeight: 22 * scale,
    letterSpacing: -0.03 * 22 * scale,
    textAlign: 'center',
    color: '#FFFFFF',
    width: 75 * scaleX,
    height: 26 * scaleY,
  },
});

export default MainScreen;
