import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, StatusBar, ImageBackground, Image } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { CameraView } from '../components';
import { colors } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 기준 레이아웃 크기
const BASE_WIDTH = 834;
const BASE_HEIGHT = 1194;

// 비율 계산
const scaleX = screenWidth / BASE_WIDTH;
const scaleY = screenHeight / BASE_HEIGHT;
const scale = Math.min(scaleX, scaleY);

type SpecialFrameCameraCaptureNavigationProp = StackNavigationProp<RootStackParamList, 'SpecialFrameCameraCapture'>;
type SpecialFrameCameraCaptureRouteProp = RouteProp<RootStackParamList, 'SpecialFrameCameraCapture'>;

const SpecialFrameCameraCaptureScreen: React.FC = () => {
  const navigation = useNavigation<SpecialFrameCameraCaptureNavigationProp>();
  const route = useRoute<SpecialFrameCameraCaptureRouteProp>();
  const { selectedTheme } = route.params || { selectedTheme: 'classic' };
  
  // 상태 관리
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(10);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [showPreparationScreen, setShowPreparationScreen] = useState(true);
  const [prepCountdown, setPrepCountdown] = useState(3);
  const [isCameraWarmingUp, setIsCameraWarmingUp] = useState(false);
  const [warmupPhotos, setWarmupPhotos] = useState(0);
  const [exposureValue, setExposureValue] = useState(1.5);
  const [skinBrightness, setSkinBrightness] = useState(0.5);
  
  // ref 관리
  const cameraRef = useRef<any>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const prepCountdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
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
  
  // 촬영 중인 사진에 따라 해당 번호의 오버레이 이미지 가져오기
  const getOverlayImage = (photoIndex: number) => {
    const overlayImages = [
      require('../../assets/frames/special/hyungyo/1.png'),
      require('../../assets/frames/special/hyungyo/2.png'),
      require('../../assets/frames/special/hyungyo/3.png'),
      require('../../assets/frames/special/hyungyo/4.png'),
    ];
    
    return overlayImages[photoIndex] || overlayImages[0];
  };
  
  // 준비 화면 카운트다운과 백그라운드 워밍업
  useEffect(() => {
    if (showPreparationScreen) {
      // 준비 화면 시작과 동시에 백그라운드에서 워밍업 시작
      setTimeout(() => {
        startCameraWarmup();
      }, 1000); // 1초 후 워밍업 시작
      
      prepCountdownIntervalRef.current = setInterval(() => {
        setPrepCountdown(prev => {
          if (prev <= 1) {
            setShowPreparationScreen(false);
            clearInterval(prepCountdownIntervalRef.current!);
            // 준비 화면 종료 후 워밍업 완료 대기
            setTimeout(() => {
              // 워밍업이 완료되면 카운트다운 시작
              if (!isCameraWarmingUp) {
                startCountdown();
              }
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

  // 카메라 워밍업 시작
  const startCameraWarmup = async () => {
    console.log('=== 특수 프레임 카메라 워밍업 시작 (백그라운드) ===');
    setIsCameraWarmingUp(true);
    setWarmupPhotos(0);
    
    // 카메라 안정화를 위해 3장 미리 촬영
    for (let i = 0; i < 3; i++) {
      console.log(`워밍업 촬영 ${i + 1}/3`);
      await new Promise(resolve => setTimeout(resolve, 800)); // 카메라 안정화 대기
      
      try {
        if (cameraRef.current) {
          await cameraRef.current.takePhoto();
        }
      } catch (error) {
        console.log(`워밍업 촬영 ${i + 1} 실패 (정상):`, error);
      }
      
      setWarmupPhotos(i + 1);
    }
    
    console.log('=== 특수 프레임 카메라 워밍업 완료 ===');
    setIsCameraWarmingUp(false);
  };
  
  // 카운트다운 시작
  const startCountdown = () => {
    console.log('=== 특수 프레임 카운트다운 시작 ===');
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
    console.log('특수 프레임 사진 촬영 시작...');
    
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
    console.log('사진 촬영 완료:', photo.path);
    
    // 워밍업 중인 경우 실제 사진 저장하지 않음
    if (isCameraWarmingUp) {
      console.log('워밍업 촬영 - 실제 사진 저장하지 않음');
      setTimeout(() => {
        isCapturingRef.current = false;
      }, 100);
      return;
    }
    
    // 실제 촬영된 사진 추가
    setCapturedPhotos(prev => {
      const newPhotos = [...prev, photo.path];
      console.log(`특수 프레임 촬영된 사진: ${newPhotos.length}/4`);
      
      // 4장이 되면 다음 화면으로 이동
      if (newPhotos.length >= 4) {
        console.log('특수 프레임 모든 사진 촬영 완료!');
        setTimeout(() => {
          navigation.navigate('PhotoEdit' as any, {
            photos: newPhotos,
            selectedFrame: 'special_frame',
          });
        }, 500);
      } else {
        // 다음 카운트다운 시작 (카메라 안정화를 위해 시간 연장)
        console.log('특수 프레임 다음 카운트다운 시작...');
        setTimeout(() => {
          startCountdown();
        }, 1000);
      }
      
      return newPhotos;
    });
    
    // 촬영 상태 리셋 (카메라 안정화를 위해 시간 연장)
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
        aspectRatio="2:3"
        guideType="4x6"
        showGuideLines={false}
        onPhotoCapture={handlePhotoCapture}
        enableFaceCorrection={true}
        isWarmup={isCameraWarmingUp}
        exposure={exposureValue} // 조명값
        skinBrightness={skinBrightness} // 피부 밝기 보정 (뽀얗게)
        enhanceColors={true}
        enableHdr={true}
        enableHighQualityPhotos={true}
      />
      
      {/* 프레임 오버레이 - 카메라 비율 영역 안에만 표시 */}
      <View style={styles.frameOverlayContainer} pointerEvents="none">
        <Image
          source={getOverlayImage(capturedPhotos.length)}
          style={styles.frameOverlay}
          resizeMode="cover"
        />
      </View>
      
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
        <Text style={styles.captureCountText}></Text>
        <View style={styles.remainingBox}>
          <Text style={styles.remainingText}>
            {capturedPhotos.length}/4
          </Text>
        </View>
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
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  camera: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
  },
  frameOverlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameOverlay: {
    height: screenHeight, // 화면 높이에 맞춤
    aspectRatio: 2 / 3, // 2:3 비율 유지 (자동으로 너비 계산됨)
  },
  remainingTimeContainer: {
    position: 'absolute',
    top: 74 * scaleY,
    left: 356 * scaleX,
    zIndex: 1000,
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
  remainingBox: {
    width: 119,
    height: 53,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  remainingText: {
    fontFamily: 'Pretendard',
    fontWeight: '700',
    fontSize: 35 * scale,
    letterSpacing: -0.03 * 35 * scale,
    textAlign: 'center',
    color: '#FFFFFF',
  },
});

export default SpecialFrameCameraCaptureScreen;

