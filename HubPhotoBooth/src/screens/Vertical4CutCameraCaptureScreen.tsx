import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, StatusBar, ImageBackground } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { CameraView } from '../components';
import { colors, typography, spacing } from '../constants/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 기준 레이아웃 크기
const BASE_WIDTH = 834;
const BASE_HEIGHT = 1194;

// 비율 계산
const scaleX = screenWidth / BASE_WIDTH;
const scaleY = screenHeight / BASE_HEIGHT;
const scale = Math.min(scaleX, scaleY);

type Vertical4CutCameraCaptureNavigationProp = StackNavigationProp<RootStackParamList, 'Vertical4CutCameraCapture'>;
type Vertical4CutCameraCaptureRouteProp = RouteProp<RootStackParamList, 'Vertical4CutCameraCapture'>;

const Vertical4CutCameraCaptureScreen: React.FC = () => {
  const navigation = useNavigation<Vertical4CutCameraCaptureNavigationProp>();
  const route = useRoute<Vertical4CutCameraCaptureRouteProp>();
  const { selectedFrame } = route.params || {};
  
  // 상태 관리
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(10);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [showPreparationScreen, setShowPreparationScreen] = useState(true);
  const [prepCountdown, setPrepCountdown] = useState(3);
  
  // ref 관리
  const cameraRef = useRef<any>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const prepCountdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCapturingRef = useRef(false);
  
  // 준비 화면 카운트다운
  useEffect(() => {
    if (showPreparationScreen) {
      prepCountdownIntervalRef.current = setInterval(() => {
        setPrepCountdown(prev => {
          if (prev <= 1) {
            setShowPreparationScreen(false);
            clearInterval(prepCountdownIntervalRef.current!);
            // 준비 화면 종료 후 카메라 카운트다운 시작
            setTimeout(() => {
              startCountdown();
            }, 500);
            return 3;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (prepCountdownIntervalRef.current) {
        clearInterval(prepCountdownIntervalRef.current);
      }
    };
  }, [showPreparationScreen]);
  
  // 카운트다운 시작
  const startCountdown = () => {
    console.log('=== 세로 4컷 카운트다운 시작 ===');
    setIsCountingDown(true);
    setCountdown(10);
    
    // 카운트다운 인터벌 시작
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // 0초가 되면 사진 촬영
          clearInterval(countdownIntervalRef.current!);
          setIsCountingDown(false);
          takePhoto();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // 사진 촬영 실행
  const takePhoto = async () => {
    if (isCapturingRef.current) {
      console.log('이미 촬영 중입니다.');
      return;
    }
    
    if (!cameraRef.current) {
      console.log('카메라 참조가 없습니다.');
      return;
    }
    
    isCapturingRef.current = true;
    console.log('세로 4컷 사진 촬영 시작...');
    
    try {
      await cameraRef.current.takePhoto();
      // onPhotoCapture 콜백에서 사진을 받음
    } catch (error) {
      console.error('사진 촬영 실패:', error);
      isCapturingRef.current = false;
    }
  };
  
  // 사진 촬영 완료 콜백
  const handlePhotoCapture = (photo: any) => {
    console.log('세로 4컷 사진 촬영 완료:', photo.path);
    
    // 촬영된 사진 추가
    setCapturedPhotos(prev => {
      const newPhotos = [...prev, photo.path];
      console.log(`세로 4컷 촬영된 사진: ${newPhotos.length}/4`);
      
      // 4장이 되면 다음 화면으로 이동
      if (newPhotos.length >= 4) {
        console.log('세로 4컷 모든 사진 촬영 완료!');
        setTimeout(() => {
          navigation.navigate('PhotoEdit', {
            photos: newPhotos,
            selectedFrame: selectedFrame || 'vertical_4cut_frame',
          });
        }, 500);
      } else {
        // 다음 카운트다운 시작
        console.log('세로 4컷 다음 카운트다운 시작...');
        setTimeout(() => {
          startCountdown();
        }, 1000);
      }
      
      return newPhotos;
    });
    
    // 촬영 상태 리셋
    setTimeout(() => {
      isCapturingRef.current = false;
    }, 500);
  };
  
  const handleBack = () => {
    navigation.goBack();
  };
  
  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      if (prepCountdownIntervalRef.current) {
        clearInterval(prepCountdownIntervalRef.current);
      }
    };
  }, []);
  
  // 남은 사진 수 계산
  const remainingPhotos = 4 - capturedPhotos.length;
  
  // 준비 화면 렌더링
  if (showPreparationScreen) {
    return (
      <ImageBackground
        source={require('../../assets/image/세로4컷대기화면.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
      </ImageBackground>
    );
  }
  
  return (
    <View style={styles.container}>
      <StatusBar hidden />
      {/* 카메라 뷰 - 전체 화면 */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        guideType="2x6"
        showGuideLines={true}
        onPhotoCapture={handlePhotoCapture}
      />
      
      {/* 남은 시간 텍스트 */}
      {isCountingDown && countdown > 0 && (
        <View style={styles.remainingTimeContainer}>
          <Text style={styles.remainingTimeText}>남은 시간</Text>
        </View>
      )}
      
      {/* 카운트다운 표시 */}
      {isCountingDown && countdown > 0 && (
        <View style={styles.cameraCountdownContainer}>
          <Text style={[
            styles.cameraCountdownText,
            countdown <= 3 && styles.countdownTextRed
          ]}>
            {countdown}
          </Text>
        </View>
      )}
      
      {/* 하단 정보 - 카메라 위에 오버레이 */}
      <View style={styles.bottomInfo}>
        <Text style={styles.captureCountText}>촬영횟수</Text>
        <Text style={styles.remainingText}>
          {capturedPhotos.length}/4
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownContainer: {
    alignItems: 'center',
  },
  remainingTimeText: {
    fontFamily: 'Pretendard',
    fontWeight: '700',
    fontSize: 34 * scale,
    lineHeight: 34 * scale,
    letterSpacing: -0.03 * 34 * scale,
    textAlign: 'center',
    color: '#000000',
    backgroundColor: 'transparent',
    width: 122 * scaleX,
    height: 41 * scaleY,
  },
  countdownText: {
    fontSize: 80 * scale,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 20 * scaleY,
  },
  readyText: {
    fontSize: 32 * scale,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  camera: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  remainingTimeContainer: {
    position: 'absolute',
    top: 74 * scaleY,
    left: 356 * scaleX,
    zIndex: 1000,
  },
  cameraCountdownContainer: {
    position: 'absolute',
    top: 120 * scaleY,
    left: 351 * scaleX,
    zIndex: 1000,
  },
  cameraCountdownText: {
    fontFamily: 'Pretendard',
    fontWeight: '700',
    fontSize: 120 * scale,
    lineHeight: 120 * scale,
    letterSpacing: -0.03 * 120 * scale,
    textAlign: 'center',
    color: '#000000',
    backgroundColor: 'transparent',
    width: 132 * scaleX,
    height: 143 * scaleY,
  },
  countdownTextRed: {
    color: colors.error,
  },
  bottomInfo: {
    position: 'absolute',
    top: 1038 * scaleY,
    left: 370 * scaleX,
    alignItems: 'center',
    zIndex: 1000,
  },
  captureCountText: {
    fontFamily: 'Pretendard',
    fontWeight: '400',
    fontSize: 28 * scale,
    lineHeight: 28 * scale,
    letterSpacing: -0.03 * 28 * scale,
    textAlign: 'center',
    color: '#000000',
    backgroundColor: 'transparent',
    width: 94 * scaleX,
    height: 33 * scaleY,
    marginBottom: 10 * scaleY,
  },
  remainingText: {
    fontFamily: 'Pretendard',
    fontWeight: '700',
    fontSize: 38 * scale,
    lineHeight: 38 * scale,
    letterSpacing: -0.03 * 38 * scale,
    textAlign: 'center',
    color: '#000000',
    backgroundColor: 'transparent',
    width: 62 * scaleX,
    height: 45 * scaleY,
  },
});

export default Vertical4CutCameraCaptureScreen;
