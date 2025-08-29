import { useState, useCallback, useRef, useEffect } from 'react';
import { PhotoFile } from 'react-native-vision-camera';
import { photoFileToObject, calculateAspectRatio } from '../utils/photoUtils';

interface UsePhotoCaptureProps {
  frameType?: 'basic' | 'special';
  basicFrameType?: 'vertical' | 'grid';
  maxPhotos?: number;
  autoCaptureInterval?: number;
}

interface UsePhotoCaptureReturn {
  photos: Array<{ id: string; uri: string; order?: number } | null>;
  isCapturing: boolean;
  currentPhotoIndex: number;
  aspectRatio: number;
  startAutoCapture: () => void;
  stopAutoCapture: () => void;
  capturePhoto: (photo: PhotoFile) => void;
  resetPhotos: () => void;
  removePhoto: (index: number) => void;
  reorderPhoto: (fromIndex: number, toIndex: number) => void;
}

export const usePhotoCapture = ({
  frameType = 'basic',
  basicFrameType = 'vertical',
  maxPhotos = 4,
  autoCaptureInterval = 6000,
}: UsePhotoCaptureProps): UsePhotoCaptureReturn => {
  const [photos, setPhotos] = useState<Array<{ id: string; uri: string; order?: number } | null>>(
    new Array(maxPhotos).fill(null)
  );
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  const autoCaptureTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // 비율 계산
  const aspectRatio = calculateAspectRatio(frameType, basicFrameType);

  // 자동 촬영 시작
  const startAutoCapture = useCallback(() => {
    if (currentPhotoIndex >= maxPhotos) return;
    
    setIsCapturing(true);
    
    // 카운트다운 시작
    let countdown = 3;
    const countdownInterval = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        // 실제 촬영은 카메라 컴포넌트에서 처리
      }
    }, 1000);
    
    countdownRef.current = countdownInterval;
  }, [currentPhotoIndex, maxPhotos]);

  // 자동 촬영 중지
  const stopAutoCapture = useCallback(() => {
    setIsCapturing(false);
    
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    
    if (autoCaptureTimerRef.current) {
      clearTimeout(autoCaptureTimerRef.current);
      autoCaptureTimerRef.current = null;
    }
  }, []);

  // 사진 촬영
  const capturePhoto = useCallback((photo: PhotoFile) => {
    const photoObject = photoFileToObject(photo, currentPhotoIndex + 1);
    
    setPhotos(prevPhotos => {
      const newPhotos = [...prevPhotos];
      newPhotos[currentPhotoIndex] = photoObject;
      return newPhotos;
    });

    setCurrentPhotoIndex(prev => prev + 1);
    
    // 다음 사진 자동 촬영 준비
    if (currentPhotoIndex + 1 < maxPhotos) {
      autoCaptureTimerRef.current = setTimeout(() => {
        startAutoCapture();
      }, autoCaptureInterval);
    } else {
      // 모든 사진 촬영 완료
      setIsCapturing(false);
    }
  }, [currentPhotoIndex, maxPhotos, autoCaptureInterval, startAutoCapture]);

  // 사진 제거
  const removePhoto = useCallback((index: number) => {
    setPhotos(prevPhotos => {
      const newPhotos = [...prevPhotos];
      newPhotos[index] = null;
      return newPhotos;
    });
    
    // 현재 인덱스 조정
    if (currentPhotoIndex > index) {
      setCurrentPhotoIndex(prev => prev - 1);
    }
  }, [currentPhotoIndex]);

  // 사진 순서 변경
  const reorderPhoto = useCallback((fromIndex: number, toIndex: number) => {
    setPhotos(prevPhotos => {
      const newPhotos = [...prevPhotos];
      const [movedPhoto] = newPhotos.splice(fromIndex, 1);
      newPhotos.splice(toIndex, 0, movedPhoto);
      
      // 순서 번호 업데이트
      return newPhotos.map((photo, index) => {
        if (photo) {
          return { ...photo, order: index + 1 };
        }
        return null;
      });
    });
  }, []);

  // 사진 초기화
  const resetPhotos = useCallback(() => {
    setPhotos(new Array(maxPhotos).fill(null));
    setCurrentPhotoIndex(0);
    setIsCapturing(false);
    
    if (autoCaptureTimerRef.current) {
      clearTimeout(autoCaptureTimerRef.current);
      autoCaptureTimerRef.current = null;
    }
    
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, [maxPhotos]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (autoCaptureTimerRef.current) {
        clearTimeout(autoCaptureTimerRef.current);
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  return {
    photos,
    isCapturing,
    currentPhotoIndex,
    aspectRatio,
    startAutoCapture,
    stopAutoCapture,
    capturePhoto,
    resetPhotos,
    removePhoto,
    reorderPhoto,
  };
};


