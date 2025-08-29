import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, ScrollView, Text } from 'react-native';
import { colors, typography, spacing, borderRadius, layout } from '../../constants/theme';

interface PhotoSelectorProps {
  photos: Array<{
    id: string;
    uri: string;
    position?: number;
  }>;
  onPhotoSelect?: (photo: any, index: number) => void;
  selectedPhotos?: Array<{ id: string; uri: string; position?: number } | null>;
  showPositionNumbers?: boolean;
}

const PhotoSelector: React.FC<PhotoSelectorProps> = ({
  photos,
  onPhotoSelect,
  selectedPhotos = [],
  showPositionNumbers = true,
}) => {
  const handlePhotoSelect = (photo: any, index: number) => {
    if (onPhotoSelect) {
      onPhotoSelect(photo, index);
    }
  };

  const isPhotoSelected = (photoId: string) => {
    return selectedPhotos.some(p => p && p.id === photoId);
  };

  const getPhotoPosition = (photoId: string) => {
    const selectedPhoto = selectedPhotos.find(p => p && p.id === photoId);
    return selectedPhoto?.position;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {photos.map((photo, index) => {
          const position = getPhotoPosition(photo.id);
          const isSelected = isPhotoSelected(photo.id);
          
          return (
            <TouchableOpacity
              key={photo.id}
              style={[
                styles.photoItem,
                isSelected && styles.selectedPhotoItem
              ]}
              onPress={() => handlePhotoSelect(photo, index)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: photo.uri }}
                style={styles.photoImage}
                resizeMode="cover"
              />
              
              {showPositionNumbers && position !== undefined && (
                <View style={styles.positionBadge}>
                  <Text style={styles.positionText}>{position + 1}</Text>
                </View>
              )}
              
              {isSelected && (
                <View style={styles.selectedIndicator}>
                  <Text style={styles.selectedText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    backgroundColor: colors.surface, // 하얀색 배경 추가
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: layout.padding.screen,
  },
  photoItem: {
    width: 140, // 사진 크기를 키움
    height: 180, // 세로형 비율에 맞춰 높이도 조정
    marginRight: spacing.md,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)', // 어두운 테두리로 변경
  },
  selectedPhotoItem: {
    borderWidth: 3,
    borderColor: colors.white,
    shadowColor: colors.white,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  positionBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  positionText: {
    fontFamily: typography.fontFamily.primary,
    fontWeight: '700',
    fontSize: typography.fontSize.sm,
    color: colors.primary,
  },
  selectedIndicator: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  selectedText: {
    fontFamily: typography.fontFamily.primary,
    fontWeight: '700',
    fontSize: typography.fontSize.sm,
    color: colors.white,
  },
});

export default PhotoSelector;

