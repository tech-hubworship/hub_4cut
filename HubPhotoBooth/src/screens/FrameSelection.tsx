import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { Container, Header, FrameCard, Button } from '../components';
import { colors, typography, spacing, layout, borderRadius } from '../constants/theme';

type FrameSelectionNavigationProp = StackNavigationProp<RootStackParamList, 'FrameSelection'>;
type FrameSelectionRouteProp = RouteProp<RootStackParamList, 'FrameSelection'>;

const FrameSelection: React.FC = () => {
  const navigation = useNavigation<FrameSelectionNavigationProp>();
  const route = useRoute<FrameSelectionRouteProp>();
  
  // route.params가 undefined일 수 있으므로 기본값 설정
  const routeParams = route.params || {};
  const { frameType } = routeParams;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSelectBasicFrame = () => {
    navigation.navigate('CutTypeSelection', { frameType: 'basic' });
  };

  const handleSelectSpecialFrame = () => {
    navigation.navigate('CameraCapture' as any, {
      selectedFrame: 'special_frame_1',
    });
  };

  const frames = [
    {
      id: 'basic_frame',
      name: '기본 프레임',
      type: 'basic' as const,
      layout: '4x6' as const,
    },
    {
      id: 'special_frame',
      name: '특수 프레임',
      type: 'special' as const,
      layout: 'special' as const,
    },
  ];

  return (
    <Container padding="none" backgroundColor={colors.primary}>
      <Header
        title="프레임 선택"
        onBack={handleBack}
        showBack
      />
      
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          원하는 프레임을 선택하고 촬영을 시작하세요
        </Text>
        
        <View style={styles.frameSelectionContainer}>
          {frames.map((frame) => (
            <FrameCard
              key={frame.id}
              frame={frame}
              onPress={
                frame.type === 'basic' 
                  ? handleSelectBasicFrame 
                  : handleSelectSpecialFrame
              }
              size="medium"
              style={styles.frameCard}
            />
          ))}
        </View>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: layout.padding.screen,
    paddingTop: spacing.xl,
  },
  subtitle: {
    fontFamily: 'Pretendard',
    fontWeight: '400',
    fontSize: typography.fontSize.lg,
    lineHeight: 33.4,
    letterSpacing: typography.letterSpacing.normal,
    textAlign: 'center',
    color: colors.textGray,
    marginBottom: spacing.xxl,
  },
  frameSelectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
  },
  frameCard: {
    marginBottom: spacing.lg,
  },
});

export default FrameSelection;
