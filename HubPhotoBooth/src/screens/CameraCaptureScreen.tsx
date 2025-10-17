import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, StatusBar, ImageBackground } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { CameraView } from '../components';
import { colors, typography, spacing } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 기준 레이아웃 크기
const BASE_WIDTH = 834;
const BASE_HEIGHT = 1194;

// 비율 계산
const scaleX = screenWidth / BASE_WIDTH;
const scaleY = screenHeight / BASE_HEIGHT;
const scale = Math.min(scaleX, scaleY);

type Grid2x2CameraCaptureNavigationProp = StackNavigationProp<RootStackParamList, 'Grid2x2CameraCapture'>;
type Grid2x2CameraCaptureRouteProp = RouteProp<RootStackParamList, 'Grid2x2CameraCapture'>;

const Grid2x2CameraCaptureScreen: React.FC = () => {
  const navigation = useNavigation<Grid2x2CameraCaptureNavigationProp>();
  const route = useRoute<Grid2x2CameraCaptureRouteProp>();
  const { selectedFrame } = route.params || {};
  
  // 상태 관리
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(10);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [showPreparationScreen, setShowPreparationScreen] = useState(true);
  const [prepCountdown, setPrepCountdown] = useState(5); // 5초로 늘림
  const [isCameraReady, setIsCameraReady] = useState(false); // 카메라 준비 상태 추가
  const [isExposureStabilized, setIsExposureStabilized] = useState(false); // 노출 안정화 상태 추가
  const [exposureValue, setExposureValue] = useState(1.5);
  const [skinBrightness, setSkinBrightness] = useState(0.5);
  
  // ref 관리
  const cameraRef = useRef<any>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const prepCountdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const exposureStabilizationRef = useRef<NodeJS.Timeout | null>(null);
  const isCapturingRef = useRef(false);
  
  // 컴포넌트 마운트 시 촬영 설정 로드
  useEffect(() => {
    loadCaptureSettings();
  }, []);

  // 촬영 설정 로드
  const loadCaptureSettings = async () => {
    try {
      const savedExposureValue = await AsyncStorage.getItem('EXPOSURE_VALUE');
      const savedSkinBrightness = await AsyncStorage.getItem('SKIN_BRIGHTNESS');
      if (savedExposureValue) setExposureValue(parseFloat(savedExposureValue));
      if (savedSkinBrightness) setSkinBrightness(parseFloat(savedSkinBrightness));
    } catch (error) {
      console.error('촬영 설정 로드 실패:', error);
    }
  };
  
  // 카메라 준비 완료 콜백
  const handleCameraReady = () => {
    console.log('카메라 준비 완료');
    setIsCameraReady(true);
  };

  // 노출 안정화 체크
  const checkExposureStabilization = () => {
    if (isCameraReady) {
      console.log('노출 안정화 시작...');
      // 3초 후 노출 안정화 완료로 간주
      exposureStabilizationRef.current = setTimeout(() => {
        console.log('노출 안정화 완료');
        setIsExposureStabilized(true);
      }, 3000);
    }
  };

  // 카메라 준비 상태 변경 시 노출 안정화 체크
  useEffect(() => {
    if (isCameraReady) {
      checkExposureStabilization();
    }

    return () => {
      if (exposureStabilizationRef.current) {
        clearTimeout(exposureStabilizationRef.current);
      }
    };
  }, [isCameraReady]);
  
  // 준비 화면 카운트다운 (노출 안정화 완료 후에만 시작)
  useEffect(() => {
    if (showPreparationScreen && isExposureStabilized) {
      prepCountdownIntervalRef.current = setInterval(() => {
        setPrepCountdown(prev => {
          if (prev <= 1) {
            setShowPreparationScreen(false);
            clearInterval(prepCountdownIntervalRef.current!);
            // 준비 화면 종료 후 카메라 카운트다운 시작
            setTimeout(() => {
              startCountdown();
            }, 500);
            return 5;
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
  }, [showPreparationScreen, isExposureStabilized]);
  
  // 카운트다운 시작
  const startCountdown = () => {
    console.log('=== 2x2 카운트다운 시작 ===');
    setIsCountingDown(true);
    setCountdown(8);
    
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
    console.log('2x2 사진 촬영 시작...');
    
    try {
      // 카메라 안정화를 위한 추가 대기
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await cameraRef.current.takePhoto();
      // onPhotoCapture 콜백에서 사진을 받음
    } catch (error) {
      console.error('사진 촬영 실패:', error);
      isCapturingRef.current = false;
    }
  };
  
  // 사진 촬영 완료 콜백
  const handlePhotoCapture = (photo: any) => {
    console.log('2x2 사진 촬영 완료:', photo.path);
    
    // 촬영된 사진 추가
    setCapturedPhotos(prev => {
      const newPhotos = [...prev, photo.path];
      console.log(`2x2 촬영된 사진: ${newPhotos.length}/4`);
      
      // 4장이 되면 다음 화면으로 이동
      if (newPhotos.length >= 4) {
        console.log('2x2 모든 사진 촬영 완료!');
        setTimeout(() => {
          navigation.navigate('PhotoEdit', {
            photos: newPhotos,
            selectedFrame: selectedFrame || 'grid_2x2_frame',
          });
        }, 500);
      } else {
        // 다음 카운트다운 시작 (카메라 안정화를 위해 시간 연장)
        console.log('2x2 다음 카운트다운 시작...');
        setTimeout(() => {
          startCountdown();
        }, 1500); // 1.5초로 늘림
      }
      
      return newPhotos;
    });
    
    // 촬영 상태 리셋 (카메라 안정화를 위해 시간 연장)
    setTimeout(() => {
      isCapturingRef.current = false;
    }, 1000);
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
      if (exposureStabilizationRef.current) {
        clearTimeout(exposureStabilizationRef.current);
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
        {/* 카메라를 미리 로드하되 보이지 않게 */}
        <View style={styles.hiddenCamera}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            aspectRatio="2:3"
            guideType="4x6"
            showGuideLines={true}
            onPhotoCapture={handlePhotoCapture}
            onCameraReady={handleCameraReady}
            enableFaceCorrection={true}
            exposure={exposureValue} // 조명값
            skinBrightness={skinBrightness} // 피부 밝기 보정 (뽀얗게)
            enableHdr={true}
            enableHighQualityPhotos={true}
            enhanceColors={true}
          />
        </View>
        
        {/* 준비 상태 표시 */}
        {!isCameraReady && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>카메라 준비 중...</Text>
          </View>
        )}
        
        {isCameraReady && !isExposureStabilized && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>노출 안정화 중...</Text>
          </View>
        )}
        
        {isExposureStabilized && (
          <View style={styles.countdownContainer}>
            <Text style={styles.readyText}>촬영 준비 완료</Text>
            <Text style={styles.countdownText}>{prepCountdown}</Text>
          </View>
        )}
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
        aspectRatio="2:3"
        guideType="4x6"
        showGuideLines={true}
        onPhotoCapture={handlePhotoCapture}
        onCameraReady={handleCameraReady}
        enableFaceCorrection={true}
        exposure={0.5} // 밝고 생동감 있게
        enableHdr={true}
        enableHighQualityPhotos={true}
        enhanceColors={true}
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
  hiddenCamera: {
    position: 'absolute',
    top: -1000, // 화면 밖으로 숨김
    left: 0,
    width: 1,
    height: 1,
    opacity: 0,
  },
  statusContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -30 }],
    alignItems: 'center',
  },
  statusText: {
    fontFamily: 'Pretendard',
    fontWeight: '600',
    fontSize: 32 * scale,
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
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
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -100 }],
    alignItems: 'center',
  },
  remainingTimeText: {
    fontFamily: 'Pretendard',
    fontWeight: '700',
    fontSize: 34 * scale,
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
    marginBottom: 20 * scale,
  },
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  camera: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
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
    letterSpacing: -0.03 * 120 * scale,
    textAlign: 'center',
    color: '#000000',
    backgroundColor: 'transparent',
    width: 132 * scaleX,
    height: 143 * scaleY,
  },
  countdownTextRed: {
    color: '#FF474A'
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
    letterSpacing: -0.03 * 38 * scale,
    textAlign: 'center',
    color: '#000000',
    backgroundColor: 'transparent',
    width: 62 * scaleX,
    height: 45 * scaleY,
  },
});

export default Grid2x2CameraCaptureScreen;
