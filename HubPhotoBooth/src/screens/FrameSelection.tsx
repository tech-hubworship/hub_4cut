import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { Container, Header, FrameCard, Button } from '../components';
import { colors, typography, spacing, layout, borderRadius } from '../constants/theme';

const { width, height } = Dimensions.get('window');

// 기준 레이아웃 크기
const BASE_WIDTH = 834;
const BASE_HEIGHT = 1194;

// 비율 계산
const scaleX = width / BASE_WIDTH;
const scaleY = height / BASE_HEIGHT;
const scale = Math.min(scaleX, scaleY);

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
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <Image
            source={require('../../assets/icon/icon_back.png')}
            style={styles.backButtonImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>프레임 선택</Text>
        
        <Text style={styles.subtitle}>
          원하는 프레임을 선택하고 촬영을 시작하세요
        </Text>
        
        <View style={styles.frameSelectionContainer}>
          <TouchableOpacity
            style={styles.frameButton1}
            onPress={handleSelectBasicFrame}
            activeOpacity={0.8}
          >
            <Image
              source={require('../../assets/image/button_frame_1.png')}
              style={styles.frameButtonImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.frameButton2}
            onPress={handleSelectSpecialFrame}
            activeOpacity={0.8}
          >
            <Image
              source={require('../../assets/image/button_frame_2.png')}
              style={styles.frameButtonImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  backButton: {
    width: 52 * scale,
    height: 52 * scale,
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  backButtonImage: {
    width: '100%',
    height: '100%',
  },
  headerTitle: {
    fontFamily: 'Pretendard',
    fontWeight: '700',
    fontSize: 44 * scale,
    letterSpacing: -0.03 * 44 * scale,
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: spacing.md,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: layout.padding.screen,
    paddingTop: spacing.xl,
    alignItems: 'center',
  },
  subtitle: {
    fontFamily: 'Pretendard',
    fontWeight: '400',
    fontSize: 28 * scale,
    letterSpacing: -0.03 * 28 * scale,
    textAlign: 'center',
    color: '#AAAAAA',
    marginBottom: spacing.xl,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  frameSelectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  frameButton1: {
    width: 516 * scaleX,
    height: 360 * scaleY,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  frameButton2: {
    width: 516 * scaleX,
    height: 360 * scaleY,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  frameButtonImage: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.xl,
  },
  frameCard: {
    marginBottom: spacing.lg,
  },
});

export default FrameSelection;
