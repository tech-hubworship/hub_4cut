import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Animated } from 'react-native';
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

  // 현재 화면 상태 관리 (frameSelection | cutTypeSelection)
  const [currentScreen, setCurrentScreen] = useState<'frameSelection' | 'cutTypeSelection'>('frameSelection');
  const [slideAnim] = useState(new Animated.Value(0));

  const handleBack = () => {
    if (currentScreen === 'cutTypeSelection') {
      // 컷 유형 선택에서 프레임 선택으로 돌아가기
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentScreen('frameSelection');
      });
    } else {
      // 프레임 선택에서 이전 화면으로 돌아가기
      navigation.goBack();
    }
  };

  const handleSelectBasicFrame = () => {
    // 컷 유형 선택 화면으로 슬라이드 전환
    setCurrentScreen('cutTypeSelection');
    handleSelectGrid();
    Animated.timing(slideAnim, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleSelectSpecialFrame = () => {
    navigation.navigate('SpecialFrameThemeSelection' as any);
  };

  const handleSelectVertical = () => {
    navigation.navigate('Vertical4CutCameraCapture' as any);
  };

  const handleSelectGrid = () => {
    navigation.navigate('Grid2x2CameraCapture' as any);
  };


  // 프레임 선택 화면 렌더링
  const renderFrameSelection = () => (
    <View style={styles.screenContainer}>
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
  );

  // 컷 유형 선택 화면 렌더링
  const renderCutTypeSelection = () => (
    <View style={styles.screenContainer}>
      <Text style={styles.headerTitle}>컷 유형 선택</Text>
      
      <Text style={styles.subtitle}>
        원하는 레이아웃을 선택해 주세요
      </Text>
      
      <View style={styles.cutSelectionContainer}>
        <TouchableOpacity
          style={styles.cutButton1}
          onPress={handleSelectVertical}
          activeOpacity={0.8}
          disabled={false}
        >
          <Image
            source={require('../../assets/image/cut_grid_1.png')}
            style={styles.cutButtonImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.cutButton2}
          onPress={handleSelectGrid}
          activeOpacity={0.8}
        >
          <Image
            source={require('../../assets/image/cut_grid_2.png')}
            style={styles.cutButtonImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.content}>
      {/* 고정된 뒤로가기 버튼 */}
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
      
      {/* 슬라이드 애니메이션 컨테이너 */}
      <Animated.View 
        style={[
          styles.animatedContainer,
          {
            transform: [{ translateX: slideAnim }]
          }
        ]}
      >
        {renderFrameSelection()}
        {renderCutTypeSelection()}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    width: 52 * scale,
    height: 52 * scale,
    alignSelf: 'flex-start',
    marginTop: 44 * scale,
    marginLeft: 44 * scale,
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
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  content: {
    flex: 1,
    backgroundColor: colors.primary,
    position: 'relative',
  },
  screenContainer: {
    width: width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',

  },
  animatedContainer: {
    flex: 1,
    flexDirection: 'row',
    width: width * 2, // 두 화면의 너비
  },
  subtitle: {
    fontFamily: 'Pretendard',
    fontWeight: '400',
    fontSize: 28 * scale,
    letterSpacing: -0.03 * 28 * scale,
    textAlign: 'center',
    color: '#AAAAAA',
    marginTop: 12 * scale,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  frameSelectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
    
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
  cutSelectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  cutButton1: {
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
  cutButton2: {
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
  cutButtonImage: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.xl,
  },
  frameCard: {
    marginBottom: spacing.lg,
  },
});

export default FrameSelection;
