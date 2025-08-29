import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { colors, spacing, borderRadius, layout } from '../../constants/theme';

interface PhotoGridProps {
  photos: Array<{
    id: string;
    uri: string;
    position?: number;
  } | null>;
  onPhotoPress?: (photo: any, index: number) => void;
  onPhotoRemove?: (index: number) => void;
  showPositionNumbers?: boolean;
}

const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  onPhotoPress,
  onPhotoRemove,
  showPositionNumbers = true,
}) => {
  const handlePhotoPress = (photo: any, index: number) => {
    if (onPhotoPress) {
      onPhotoPress(photo, index);
    }
  };

  const handlePhotoRemove = (index: number) => {
    if (onPhotoRemove) {
      onPhotoRemove(index);
    }
  };

  const renderPhoto = (photo: any, index: number) => {
    if (!photo) {
      return (
        <View key={index} style={styles.emptySlot}>
          <View style={styles.emptySlotInner}>
            <View style={styles.emptySlotIcon} />
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity
        key={photo.id || index}
        style={styles.photoContainer}
        onPress={() => handlePhotoPress(photo, index)}
        onLongPress={() => handlePhotoRemove(index)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: photo.uri }}
          style={styles.photo}
          resizeMode="cover"
        />
        {showPositionNumbers && photo.position !== undefined && (
          <View style={styles.positionBadge}>
            <View style={styles.positionNumber}>
              {/* 위치 번호는 별도로 표시하지 않음 */}
            </View>
          </View>
        )}
        {/* 제거 버튼 */}
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handlePhotoRemove(index)}
          activeOpacity={0.7}
        >
          <View style={styles.removeButtonInner}>
            <View style={styles.removeIcon} />
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // 프레임 이미지 경로 결정
  const getFrameImage = () => {
    // 현재는 4x6 프레임만 사용 가능
    return require('../../../assets/frames/frame(4x6).png');
  };

  return (
    <View style={styles.container}>
      <View style={styles.frameContainer}>
        {/* 프레임 이미지를 배경으로 사용 */}
        <Image
          source={getFrameImage()}
          style={styles.frameImage}
          resizeMode="contain"
        />
        
        {/* 사진들을 프레임 위에 오버레이로 배치 */}
        <View style={styles.photosOverlay}>
          {photos.map((photo, index) => renderPhoto(photo, index))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  frameContainer: {
    width: 400, // 프레임 이미지 크기를 키움
    height: 300, // 4x6 비율에 맞춰 높이도 조정
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 1,
  },
  photosOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 30, // 프레임 이미지의 회색 부분에 맞춰 패딩 조정
  },
  photoContainer: {
    width: '47%', // 패딩을 고려하여 약간 줄임
    height: '47%', // 패딩을 고려하여 약간 줄임
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'transparent', // 배경을 투명하게
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  emptySlot: {
    width: '48%',
    height: '48%',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  emptySlotInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySlotIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  positionBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
  },
  positionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surface,
  },
});

export default PhotoGrid;

