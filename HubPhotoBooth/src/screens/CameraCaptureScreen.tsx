import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { CameraView } from '../components';
import { colors, typography, spacing } from '../constants/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type CameraCaptureNavigationProp = StackNavigationProp<RootStackParamList, 'CameraCapture'>;
type CameraCaptureRouteProp = RouteProp<RootStackParamList, 'CameraCapture'>;

const CameraCaptureScreen: React.FC = () => {
  const navigation = useNavigation<CameraCaptureNavigationProp>();
  const route = useRoute<CameraCaptureRouteProp>();
  const { selectedFrame, basicFrameType } = route.params || {};
  
  // 상태 관리
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(10);
  const [isCountingDown, setIsCountingDown] = useState(false);
  
  // ref 관리
  const cameraRef = useRef<any>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCapturingRef = useRef(false);
  
  // 카운트다운 시작
  const startCountdown = () => {
    console.log('=== 카운트다운 시작 ===');
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
    console.log('사진 촬영 시작...');
    
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
    
    // 촬영된 사진 추가
    setCapturedPhotos(prev => {
      const newPhotos = [...prev, photo.path];
      console.log(`촬영된 사진: ${newPhotos.length}/4`);
      
      // 4장이 되면 다음 화면으로 이동
      if (newPhotos.length >= 4) {
        console.log('모든 사진 촬영 완료!');
        setTimeout(() => {
          navigation.navigate('PhotoEdit', {
            photos: newPhotos,
            selectedFrame: selectedFrame || 'basic_frame',
          });
        }, 500);
      } else {
        // 다음 카운트다운 시작
        console.log('다음 카운트다운 시작...');
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
  
  // 컴포넌트 마운트 시 첫 번째 카운트다운 시작
  useEffect(() => {
    console.log('카메라 화면 로드됨 - 첫 번째 카운트다운 시작');
    startCountdown();
    
    // 컴포넌트 언마운트 시 정리
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);
  
  // 남은 사진 수 계산
  const remainingPhotos = 4 - capturedPhotos.length;
  
  return (
    <View style={styles.container}>
      <StatusBar hidden />
      {/* 카메라 뷰 - 전체 화면 */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        guideType={basicFrameType === '2x6' ? '2x6' : basicFrameType === '4x6' ? '4x6' : undefined}
        onPhotoCapture={handlePhotoCapture}
      />
      
      {/* 카운트다운 표시 */}
      {isCountingDown && countdown > 0 && (
        <View style={styles.countdownContainer}>
          <Text style={[
            styles.countdownText,
            countdown <= 3 && styles.countdownTextRed
          ]}>
            {countdown}
          </Text>
        </View>
      )}
      
      {/* 하단 정보 - 카메라 위에 오버레이 */}
      <View style={styles.bottomInfo}>
        <Text style={styles.remainingText}>
          {remainingPhotos}장 남음
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  countdownContainer: {
    position: 'absolute',
    top: spacing.xl * 2,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  countdownText: {
    fontFamily: typography.fontFamily.primary,
    fontSize: 72,
    fontWeight: 'bold' as const,
    color: colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  countdownTextRed: {
    color: colors.error,
  },
  bottomInfo: {
    position: 'absolute',
    bottom: spacing.xl,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  remainingText: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: '500' as const,
    color: colors.white,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
  },
});

export default CameraCaptureScreen;
