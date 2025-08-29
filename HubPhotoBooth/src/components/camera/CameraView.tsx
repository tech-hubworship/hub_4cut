import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Camera, useCameraDevices, CameraDevice } from 'react-native-vision-camera';
import { colors, typography, spacing, layout } from '../../constants/theme';

interface CameraViewProps {
  onPhotoCapture: (photo: any) => void;
  aspectRatio?: number;
  showGuideLines?: boolean;
  guideType?: '2x6' | '4x6' | 'special';
  style?: any;
}

export interface CameraViewRef {
  takePhoto: () => Promise<void>;
}

const CameraView = forwardRef<CameraViewRef, CameraViewProps>(({
  onPhotoCapture,
  aspectRatio = 1,
  showGuideLines = false,
  guideType = '4x6',
  style,
}, ref) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  
  const cameraRef = useRef<Camera>(null);
  const devices = useCameraDevices();
  const isCapturingRef = useRef(false); // ref로 촬영 상태 관리
  
  // devices를 배열로 처리하여 올바른 카메라 디바이스 찾기
  const device = devices ? 
    (isFrontCamera ? 
      devices.find(d => d.position === 'front') : 
      devices.find(d => d.position === 'back')
    ) : undefined;

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
        
        const photo = await cameraRef.current.takePhoto({
          flash: 'off',
        });
        
        console.log('Photo captured successfully:', photo);
        onPhotoCapture(photo);
        
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
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const cameraPermission = await Camera.requestCameraPermission();
    setHasPermission(cameraPermission === 'granted');
  };

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

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={[
          styles.camera,
          { aspectRatio },
          style
        ]}
        device={device}
        isActive={true}
        photo={true}
      />
      
      {showGuideLines && (
        <View style={styles.guideLines}>
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
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  guideLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  guideLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
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
});

export default CameraView;
