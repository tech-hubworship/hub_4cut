import { PhotoFile } from 'react-native-vision-camera';

// 사진 파일을 URI로 변환
export const photoFileToUri = (photo: PhotoFile): string => {
  return `file://${photo.path}`;
};

// 사진 파일을 객체로 변환
export const photoFileToObject = (photo: PhotoFile, order?: number) => {
  return {
    id: photo.path,
    uri: photoFileToUri(photo),
    order,
    timestamp: Date.now(),
  };
};

// 사진 배열에서 빈 슬롯 찾기
export const findEmptySlot = (photos: Array<any | null>): number => {
  return photos.findIndex(photo => photo === null);
};

// 사진 배열에서 특정 사진 제거
export const removePhotoFromArray = (
  photos: Array<any | null>,
  photoId: string
): Array<any | null> => {
  return photos.map(photo => (photo?.id === photoId ? null : photo));
};

// 사진 배열에 사진 추가
export const addPhotoToArray = (
  photos: Array<any | null>,
  photo: any,
  index: number
): Array<any | null> => {
  const newPhotos = [...photos];
  newPhotos[index] = photo;
  return newPhotos;
};

// 사진 배열이 가득 찼는지 확인
export const isPhotoArrayFull = (photos: Array<any | null>): boolean => {
  return photos.every(photo => photo !== null);
};

// 사진 배열에서 선택된 사진들만 추출
export const getSelectedPhotos = (photos: Array<any | null>): any[] => {
  return photos.filter(photo => photo !== null);
};

// 사진 순서 재정렬
export const reorderPhotos = (
  photos: Array<any | null>,
  fromIndex: number,
  toIndex: number
): Array<any | null> => {
  const newPhotos = [...photos];
  const [movedPhoto] = newPhotos.splice(fromIndex, 1);
  newPhotos.splice(toIndex, 0, movedPhoto);
  
  // 순서 번호 업데이트
  return newPhotos.map((photo, index) => {
    if (photo) {
      return { ...photo, order: index + 1 };
    }
    return null;
  });
};

// 사진 비율 계산
export const calculateAspectRatio = (
  frameType: 'basic' | 'special',
  basicFrameType?: 'vertical' | 'grid'
): number => {
  if (frameType === 'special') {
    return 1; // 정사각형
  }
  
  switch (basicFrameType) {
    case 'vertical':
      return 2; // 2:1 (가로형)
    case 'grid':
      return 2/3; // 2:3 (세로형)
    default:
      return 1; // 기본값
  }
};

// 사진 크기 계산
export const calculatePhotoDimensions = (
  containerWidth: number,
  aspectRatio: number
): { width: number; height: number } => {
  return {
    width: containerWidth,
    height: containerWidth / aspectRatio,
  };
};

// 사진 품질 설정
export const getPhotoQuality = (quality: 'low' | 'medium' | 'high' = 'medium') => {
  switch (quality) {
    case 'low':
      return 0.5;
    case 'high':
      return 0.9;
    default:
      return 0.8;
  }
};

// 파일 크기 포맷팅
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 파일 확장자 확인
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 + 2));
};

// 이미지 파일인지 확인
export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const extension = getFileExtension(filename).toLowerCase();
  return imageExtensions.includes(extension);
};


