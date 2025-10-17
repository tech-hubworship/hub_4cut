import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, Text, StyleSheet, Alert, TouchableWithoutFeedback, Animated } from 'react-native';
import { 
  Camera, 
  useCameraDevice, 
  useCameraPermission,
  CameraDevice
} from 'react-native-vision-camera';
import { colors, typography, spacing, layout } from '../../constants/theme';

interface CameraViewProps {
  onPhotoCapture: (photo: any) => void;
  aspectRatio?: number | string; // 완전히 커스터마이징 가능한 비율
  // 사용 예시:
  // - 숫자: aspectRatio={1.5} (3:2 비율)
  // - 문자열: aspectRatio="16:9" (와이드스크린)
  // - 문자열: aspectRatio="1:1" (정사각형)
  // - 문자열: aspectRatio="3:4" (세로 비율)
  // - 문자열: aspectRatio="1.39:2" (소수점 비율)
  // - 문자열: aspectRatio="21:9" (울트라 와이드)
  showGuideLines?: boolean;
  guideType?: '2x6' | '4x6' | 'special';
  style?: any;
  enableFaceCorrection?: boolean;
  isWarmup?: boolean; // 워밍업 모드 여부
  onCameraReady?: () => void; // 카메라 준비 완료 콜백
  // 카메라 밝기 및 화질 설정
  exposure?: number; // 노출값 (-1.0 ~ 1.0, 기본값: 0.5)
  enableHdr?: boolean; // HDR 모드 활성화
  enableHighQualityPhotos?: boolean; // 고품질 사진 모드
  enhanceColors?: boolean; // 색감 향상 (기본값: true)
  enableRawCapture?: boolean; // RAW 파일 촬영 (기본값: false)
  skinBrightness?: number; // 피부 밝기 보정 (0.0 ~ 1.0, 뽀얗게)
}

export interface CameraViewRef {
  takePhoto: () => Promise<void>;
}

const CameraView = forwardRef<CameraViewRef, CameraViewProps>(({
  onPhotoCapture,
  aspectRatio = '2:3',
  showGuideLines = false,
  guideType = '4x6',
  style,
  enableFaceCorrection = false,
  isWarmup = false,
  onCameraReady,
  exposure = 0.5, // 밝고 생동감 있게 (범위: -1.0 ~ 1.0)
  enableHdr = true,
  enableHighQualityPhotos = true,
  enhanceColors = true,
  enableRawCapture = false, // RAW 촬영 (파일 크기 매우 큼)
  skinBrightness = 0.0, // 피부 밝기 보정 (0.0 ~ 1.0)
}, ref) => {
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [flashOpacity] = useState(new Animated.Value(0)); // 플래시 효과 애니메이션
  
  const cameraRef = useRef<Camera>(null);
  const isCapturingRef = useRef(false);
  const autoFocusIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // 피부톤 보정을 위한 오버레이 투명도 계산
  // skinBrightness 0.0 = 투명도 0 (원본)
  // skinBrightness 1.0 = 투명도 0.15 (뽀얗게)
  const beautyOverlayOpacity = skinBrightness * 0.15;

  // 비율을 숫자로 변환하는 함수
  const parseAspectRatio = (ratio: number | string): number => {
    if (typeof ratio === 'number') {
      return ratio;
    }
    
    // 문자열 비율 파싱 (예: "2:3", "4:3", "16:9" 등)
    if (typeof ratio === 'string') {
      const parts = ratio.split(':');
      if (parts.length === 2) {
        const width = parseFloat(parts[0]);
        const height = parseFloat(parts[1]);
        if (!isNaN(width) && !isNaN(height) && height > 0) {
          return width / height;
        }
      }
    }
    
    // 기본값: 2:3 비율
    return 2/3;
  };
  
  // 최신 VisionCamera API 사용
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice(isFrontCamera ? 'front' : 'back');

  // 최적화된 카메라 포맷 선택 (성능과 품질의 균형)
  const getOptimizedFormat = () => {
    if (!device) return undefined;
    
    const formats = device.formats;
    if (formats.length === 0) return undefined;
    
    // 선택된 비율에 따른 타겟 비율 설정
    const targetRatio = parseAspectRatio(aspectRatio);
    
    // 고품질 모드 여부에 따라 해상도 제한 설정
    const maxPixels = enableHighQualityPhotos ? 50000000 : 8294400; // 고품질: ~7K (48MP), 일반: 4K
    const minPixels = enableHighQualityPhotos ? 2073600 : 2073600; // 최소 1080p (자동 초점 미지원 포맷도 허용)
    
    // 성능 최적화를 위한 포맷 선택
    const sortedFormats = formats
      .filter(format => {
        const pixels = format.photoWidth * format.photoHeight;
        // 해상도 범위만 체크 (자동 초점은 선택사항)
        return pixels >= minPixels && pixels <= maxPixels;
      })
      .sort((a, b) => {
        // 1순위: 해상도 (더 높을수록 좋음)
        const aPixels = a.photoWidth * a.photoHeight;
        const bPixels = b.photoWidth * b.photoHeight;
        
        if (enableHighQualityPhotos) {
          // 고품질 모드: 최대 해상도 우선
          if (aPixels !== bPixels) {
            return bPixels - aPixels;
          }
        }
        
        // 2순위: HDR 지원 (색감 향상)
        const aHdrScore = a.supportsPhotoHdr ? 1 : 0;
        const bHdrScore = b.supportsPhotoHdr ? 1 : 0;
        
        if (aHdrScore !== bHdrScore) {
          return bHdrScore - aHdrScore;
        }
        
        // 3순위: 자동 초점 품질 (phase-detection > contrast-detection)
        const aFocusScore = a.autoFocusSystem === 'phase-detection' ? 2 : 
                           a.autoFocusSystem === 'contrast-detection' ? 1 : 0;
        const bFocusScore = b.autoFocusSystem === 'phase-detection' ? 2 : 
                           b.autoFocusSystem === 'contrast-detection' ? 1 : 0;
        
        if (aFocusScore !== bFocusScore) {
          return bFocusScore - aFocusScore;
        }
        
        // 4순위: 선택된 비율 우선
        const aAspectRatio = a.photoWidth / a.photoHeight;
        const bAspectRatio = b.photoWidth / b.photoHeight;
        
        const aRatioDiff = Math.abs(aAspectRatio - targetRatio);
        const bRatioDiff = Math.abs(bAspectRatio - targetRatio);
        
        // 선택된 비율에 더 가까운 것을 우선 선택
        if (aRatioDiff < bRatioDiff) return -1;
        if (aRatioDiff > bRatioDiff) return 1;
        
        // 5순위: FPS (30fps 이상 우선)
        const aFps = a.maxFps || 30;
        const bFps = b.maxFps || 30;
        
        if (aFps >= 30 && bFps >= 30) {
          return bFps - aFps;
        }
        
        return 0;
      });
    
    const selectedFormat = sortedFormats[0];
    
    if (selectedFormat) {
      const actualRatio = selectedFormat.photoWidth / selectedFormat.photoHeight;
      const ratioMatch = Math.abs(actualRatio - targetRatio) < 0.1;
      
      const megapixels = (selectedFormat.photoWidth * selectedFormat.photoHeight / 1000000).toFixed(1);
      
      console.log(`📐 ${aspectRatio} 비율 최적화된 카메라 포맷 선택 (${enableHighQualityPhotos ? '고품질' : '일반'} 모드):`, {
        resolution: `${selectedFormat.photoWidth}x${selectedFormat.photoHeight}`,
        megapixels: `${megapixels}MP`,
        aspectRatio: actualRatio.toFixed(2),
        targetRatio: targetRatio.toFixed(2),
        ratioMatch: ratioMatch ? '✅ 매치' : '⚠️ 근사치',
        maxFps: selectedFormat.maxFps,
        totalPixels: selectedFormat.photoWidth * selectedFormat.photoHeight,
        qualityMode: enableHighQualityPhotos ? '🔥 최고 품질 (12MP+)' : '균형',
        supportsHDR: selectedFormat.supportsPhotoHdr ? '✅ HDR 지원' : '❌ HDR 미지원',
        autoFocusSystem: selectedFormat.autoFocusSystem || 'none',
        performance: `${aspectRatio} 비율 최적화됨 (${targetRatio.toFixed(3)})`
      });
    }
    
    return selectedFormat;
  };

  const optimizedFormat = getOptimizedFormat();

  // 자동 초점 - 디바이스가 지원하는 경우에만
  useEffect(() => {
    if (!device || !hasPermission || !device.supportsFocus) {
      if (device && !device.supportsFocus) {
        console.log('⚠️ 이 카메라는 수동 초점을 지원하지 않습니다 (자동 초점 모드 사용)');
      }
      return;
    }
    
    // 카메라 준비 후 자동 초점 시작
    const startAutoFocus = async () => {
      // 초기 초점 (화면 중앙)
      setTimeout(async () => {
        if (cameraRef.current) {
          try {
            await cameraRef.current.focus({ x: 0.5, y: 0.5 });
            console.log('📷 초기 자동 초점 완료 (중앙)');
          } catch (error) {
            console.log('초점 맞추기 실패:', error);
          }
        }
      }, 1000);
      
      // 주기적 자동 초점 (3초마다)
      autoFocusIntervalRef.current = setInterval(async () => {
        if (cameraRef.current && !isCapturingRef.current) {
          try {
            // 화면 중앙에 초점 (얼굴이 보통 중앙에 위치)
            await cameraRef.current.focus({ x: 0.5, y: 0.5 });
            console.log('🔄 자동 초점 갱신');
          } catch (error) {
            // 초점 실패 무시
          }
        }
      }, 3000);
    };
    
    startAutoFocus();
    
    // 정리
    return () => {
      if (autoFocusIntervalRef.current) {
        clearInterval(autoFocusIntervalRef.current);
      }
    };
  }, [device, hasPermission]);

  // 수동 초점 - 화면 터치 시 중앙에 초점
  const handleTouchFocus = async () => {
    if (!cameraRef.current || !device?.supportsFocus) return;
    
    try {
      // 터치 시 화면 중앙에 다시 초점 맞추기
      await cameraRef.current.focus({ x: 0.5, y: 0.5 });
      console.log('👆 터치로 초점 재조정 (중앙)');
    } catch (error) {
      console.error('초점 맞추기 실패:', error);
    }
  };

  // 고품질 얼굴 보정 함수 (일시적으로 비활성화)
  const applyFaceCorrection = async (imageUri: string) => {
    // ImageManipulator 로드 문제로 인해 일시적으로 비활성화
    // 최고 품질의 원본 사진을 그대로 반환
    console.log('🎯 최고 품질 원본 사진 사용 (얼굴 보정 비활성화)');
    return imageUri;
  };

  // 플래시 효과 트리거
  const triggerFlashEffect = () => {
    // 플래시 효과: 0 → 1 → 0 (빠르게)
    Animated.sequence([
      Animated.timing(flashOpacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(flashOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // 외부에서 호출할 수 있는 takePhoto 함수
  useImperativeHandle(ref, () => ({
    takePhoto: async () => {
      // 이미 촬영 중이면 무시
      if (isCapturingRef.current) {
        console.log('Already capturing, ignoring duplicate call');
        return;
      }
      
      if (!cameraRef.current) {
        console.log('Camera ref not ready');
        return;
      }
      
      try {
        console.log('Starting photo capture...');
        isCapturingRef.current = true;
        
        // 플래시 효과 트리거
        if (!isWarmup) {
          triggerFlashEffect();
        }
        
        const photo = await cameraRef.current.takePhoto({
          flash: 'off',
          enableShutterSound: !isWarmup, // 워밍업 중에는 셔터음 비활성화
          enableAutoRedEyeReduction: true, // 적목 현상 자동 보정
        });
        
        console.log('Photo captured successfully:', photo);
        
        // 얼굴 보정 적용
        const correctedPhotoUri = await applyFaceCorrection(photo.path);
        
        // 보정된 사진 정보로 업데이트
        const correctedPhoto = {
          ...photo,
          path: correctedPhotoUri
        };
        
        onPhotoCapture(correctedPhoto);
        
      } catch (error) {
        console.error('Photo capture failed:', error);
        Alert.alert('오류', '사진 촬영에 실패했습니다.');
      } finally {
        // 촬영 완료 후 상태 리셋
        setTimeout(() => {
          isCapturingRef.current = false;
          console.log('Photo capture state reset');
        }, 500);
      }
    }
  }));

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  // 카메라 준비 완료 시 콜백 호출
  useEffect(() => {
    if (device && hasPermission && onCameraReady) {
      // 약간의 지연을 주어 카메라가 완전히 초기화되도록 함
      const timer = setTimeout(() => {
        onCameraReady();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [device, hasPermission, onCameraReady]);

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>카메라 권한이 필요합니다</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>카메라를 불러오는 중...</Text>
      </View>
    );
  }

  // 선택된 비율에 따른 스타일 계산
  const cameraAspectRatio = parseAspectRatio(aspectRatio);
  
  const dynamicCameraStyle = {
    width: '100%' as const,
    aspectRatio: cameraAspectRatio,
    maxHeight: '100%' as const,
  };
  
  return (
    <View style={[styles.container, style]}>
      <TouchableWithoutFeedback onPress={handleTouchFocus}>
        <View style={{ flex: 1 }}>
          <Camera
            ref={cameraRef}
            style={dynamicCameraStyle}
            device={device}
            isActive={true}
            photo={true}
            video={false}
            enableZoomGesture={false}
            enableFpsGraph={false}
            pixelFormat="yuv"
            format={optimizedFormat}
            enableBufferCompression={false}
            enableDepthData={false}
            enablePortraitEffectsMatteDelivery={false}
            exposure={exposure}
            torch="off"
            focusable={true}
            photoQualityBalance="quality"
            videoStabilizationMode="off"
            videoHdr={enableHdr}
          />
        </View>
      </TouchableWithoutFeedback>
      
      {showGuideLines && (
        <View style={styles.guideLinesContainer}>
          {guideType === '2x6' && (
            <>
              <View style={[styles.guideLine, styles.horizontalLine1]} />
              <View style={[styles.guideLine, styles.horizontalLine2]} />
              <View style={[styles.guideLine, styles.horizontalLine3]} />
            </>
          )}
          {guideType === '4x6' && (
            <>
              <View style={[styles.guideLine, styles.verticalLine]} />
              <View style={[styles.guideLine, styles.horizontalLine]} />
            </>
          )}
        </View>
      )}
      
      {/* 피부 뽀얗게 보정 오버레이 (부드러운 흰색) */}
      {skinBrightness > 0 && (
        <View 
          style={[
            styles.beautyOverlay,
            {
              opacity: beautyOverlayOpacity,
            }
          ]}
          pointerEvents="none"
        />
      )}
      
      {/* 플래시 효과 오버레이 */}
      <Animated.View 
        style={[
          styles.flashOverlay,
          {
            opacity: flashOpacity,
          }
        ]}
        pointerEvents="none"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#FFFFFF', // 하얀색 백그라운드
    justifyContent: 'center', // 세로 가운데 정렬
    alignItems: 'center', // 가로 가운데 정렬
  },
  guideLinesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  } as any,
  guideLine: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // 하얀색 백그라운드에 맞게 검은색으로 변경
  },
  horizontalLine1: {
    top: '25%',
    left: 0,
    right: 0,
    height: 1,
  },
  horizontalLine2: {
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
  },
  horizontalLine3: {
    top: '75%',
    left: 0,
    right: 0,
    height: 1,
  },
  verticalLine: {
    top: 0,
    bottom: 0,
    left: '50%',
    width: 1,
  },
  horizontalLine: {
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  permissionText: {
    fontFamily: 'Pretendard',
    fontWeight: '400',
    fontSize: typography.fontSize.md,
    color: colors.white,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  loadingText: {
    fontFamily: 'Pretendard',
    fontWeight: '400',
    fontSize: typography.fontSize.md,
    color: colors.white,
    textAlign: 'center',
  },
  beautyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 998,
  },
  flashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 999,
  },
});

export default CameraView;
