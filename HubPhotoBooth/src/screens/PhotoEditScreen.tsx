import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { Container, Header, Button } from '../components';
import { colors, typography, spacing, layout } from '../constants/theme';
import frameRegions from '../constants/frameRegions.json';

type PhotoEditScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PhotoEdit'>;
type PhotoEditScreenRouteProp = RouteProp<RootStackParamList, 'PhotoEdit'>;

const PhotoEditScreen: React.FC = () => {
  const navigation = useNavigation<PhotoEditScreenNavigationProp>();
  const route = useRoute<PhotoEditScreenRouteProp>();
  const { photos = [], selectedFrame } = route.params;

  const [selectedPhotos, setSelectedPhotos] = useState<Array<{ id: string; uri: string; position?: number } | null>>(
    Array(4).fill(null)
  );
  
  // 프레임 이미지의 실제 렌더링 크기를 추적
  const [frameLayout, setFrameLayout] = useState({ width: 0, height: 0, x: 0, y: 0 });

  useEffect(() => {
    console.log('PhotoEditScreen - 받은 사진들:', photos);
    // 촬영된 사진이 있으면 초기화
    if (photos.length > 0) {
      const initialPhotos = [...selectedPhotos];
      photos.forEach((photoUri, index) => {
        if (index < 4) {
          initialPhotos[index] = {
            id: `photo_${index}`,
            uri: photoUri,
            position: index,
          };
        }
      });
      setSelectedPhotos(initialPhotos);
      console.log('PhotoEditScreen - 초기화된 사진들:', initialPhotos);
    }
  }, [photos]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handlePhotoPress = (photo: any, index: number) => {
    // 사진을 탭하면 제거
    const newSelectedPhotos = [...selectedPhotos];
    newSelectedPhotos[index] = null;
    setSelectedPhotos(newSelectedPhotos);
  };

  const handlePhotoSelect = (photo: any, index: number) => {
    // 빈 슬롯 찾기
    const emptySlotIndex = selectedPhotos.findIndex(p => p === null);
    if (emptySlotIndex !== -1) {
      const newSelectedPhotos = [...selectedPhotos];
      newSelectedPhotos[emptySlotIndex] = {
        ...photo,
        position: emptySlotIndex,
      };
      setSelectedPhotos(newSelectedPhotos);
    } else {
      Alert.alert('알림', '모든 슬롯이 채워져 있습니다.');
    }
  };

  const handlePhotoRemove = (index: number) => {
    const newSelectedPhotos = [...selectedPhotos];
    newSelectedPhotos[index] = null;
    setSelectedPhotos(newSelectedPhotos);
  };

  const handleNext = () => {
    const filledSlots = selectedPhotos.filter(p => p !== null);
    if (filledSlots.length < 4) {
      Alert.alert('알림', '모든 슬롯에 사진을 배치해주세요.');
      return;
    }
    
    // 다음 화면으로 이동
    navigation.navigate('FramePreview' as any, {
      photos: selectedPhotos.filter(p => p !== null).map(p => p!.uri),
      selectedFrame: selectedFrame || 'default',
    });
  };

  const isAllPhotosPlaced = selectedPhotos.every(p => p !== null);
  const selectedCount = selectedPhotos.filter(p => p !== null).length;

  const onFrameLayout = (event: any) => {
    const { width, height, x, y } = event.nativeEvent.layout;
    setFrameLayout({ width, height, x, y });
    console.log('Frame layout:', { width, height, x, y });
  };

  // JSON 좌표를 실제 프레임 크기에 맞춰 변환하는 함수
  const getScaledRegion = (region: any) => {
    const jsonWidth = frameRegions.frame4x6.totalWidth;
    const jsonHeight = frameRegions.frame4x6.totalHeight;
    
    const scaleX = frameLayout.width / jsonWidth;
    const scaleY = frameLayout.height / jsonHeight;
    
    return {
      x: region.x * scaleX,
      y: region.y * scaleY,
      width: region.width * scaleX,
      height: region.height * scaleY,
    };
  };

  return (
    <View style={styles.container}>
      {/* 상단 검은색 영역 */}
      <View style={styles.topSection}>
        {/* 뒤로가기 버튼 */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        
        {/* 제목 */}
        <Text style={styles.title}>원하는 사진을 골라주세요</Text>
        
        {/* 진행 상태 카운터 */}
        <Text style={styles.counter}>{selectedCount}/4</Text>
        
        {/* 프레임 이미지와 사진 오버레이 */}
        <View style={styles.frameContainer}>
          {/* 프레임 이미지를 배경으로 사용 */}
          <Image
            source={require('../../assets/frames/frame(4x6).png')}
            style={styles.frameImage}
            resizeMode="contain"
            onLayout={onFrameLayout}
          />
          
          {/* 사진들을 JSON 영역 정보에 따라 정확히 배치 */}
          <View style={styles.photosOverlay}>
            {frameLayout.width > 0 && frameLayout.height > 0 && frameRegions.frame4x6.regions.map((region, index) => {
              const photo = selectedPhotos[region.position];
              const scaledRegion = getScaledRegion(region);
              
              console.log(`Region ${region.name}:`, {
                original: region,
                scaled: scaledRegion,
                frameLayout
              });
              
              return (
                <View 
                  key={region.id} 
                  style={[
                    styles.photoSlot,
                    {
                      position: 'absolute',
                      left: scaledRegion.x,
                      top: scaledRegion.y,
                      width: scaledRegion.width,
                      height: scaledRegion.height,
                    }
                  ]}
                >
                  {photo ? (
                    <TouchableOpacity
                      style={styles.photoInFrame}
                      onPress={() => handlePhotoPress(photo, region.position)}
                      activeOpacity={0.8}
                    >
                      <Image 
                        source={{ uri: photo.uri }} 
                        style={styles.framePhoto} 
                        resizeMode="cover"
                      />
                      {/* 위치 번호 표시 */}
                      <View style={styles.positionBadge}>
                        <Text style={styles.positionText}>{region.position + 1}</Text>
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.emptyPhotoSlot} />
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </View>
      
      {/* 하단 하얀색 영역 */}
      <View style={styles.bottomSection}>
        {/* 사진 선택 영역 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photoSelector}
        >
          {photos.map((photoUri, index) => {
            const isSelected = selectedPhotos.some(p => p && p.uri === photoUri);
            const position = selectedPhotos.findIndex(p => p && p.uri === photoUri);
            
            return (
              <TouchableOpacity
                key={`photo_${index}`}
                style={[
                  styles.photoItem,
                  isSelected && styles.selectedPhotoItem
                ]}
                onPress={() => handlePhotoSelect({ id: `photo_${index}`, uri: photoUri }, index)}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: photoUri }}
                  style={styles.photoImage}
                  resizeMode="cover"
                />
                
                {isSelected && position !== -1 && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>{position + 1}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        
        {/* 다음 버튼 */}
        <TouchableOpacity
          style={[
            styles.nextButton,
            isAllPhotosPlaced && styles.nextButtonActive
          ]}
          onPress={handleNext}
          disabled={!isAllPhotosPlaced}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.nextButtonText,
            isAllPhotosPlaced && styles.nextButtonTextActive
          ]}>
            다음
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  topSection: {
    flex: 0.6,
    backgroundColor: '#010101',
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: spacing.lg,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  backButtonText: {
    fontSize: 32,
    color: colors.surface,
    fontWeight: 'bold',
  },
  title: {
    fontFamily: typography.fontFamily.primary,
    fontWeight: '700',
    fontSize: 40,
    color: colors.surface,
    textAlign: 'center',
    marginBottom: spacing.lg,
    letterSpacing: -1.2,
  },
  counter: {
    fontFamily: typography.fontFamily.primary,
    fontWeight: '400',
    fontSize: 24,
    color: '#aaaaaa',
    marginBottom: spacing.xl,
    letterSpacing: -0.72,
  },
  frameContainer: {
    width: 300, // 프레임 이미지 크기를 키움
    height: 450, // 4x6 비율에 맞춰 키움
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
  },
  photoSlot: {

    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  photoInFrame: {
    width: '100%',
    height: '100%',

    overflow: 'hidden',
    position: 'relative',
  },
  framePhoto: {
    width: '100%',
    height: '100%',
  },
  emptyPhotoSlot: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'dashed',
  },
  positionBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionText: {
    fontFamily: typography.fontFamily.primary,
    fontWeight: '700',
    fontSize: 26,
    color: colors.surface,
    letterSpacing: -0.78,
  },
  bottomSection: {
    flex: 0.4,
    backgroundColor: colors.surface,
    paddingTop: spacing.lg,
  },
  photoSelector: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  photoItem: {
    width: 201, // 원본 비율을 유지하기 위해 너비만 고정
    height: 298, // 세로로 꽉 차게 높이 설정
    marginRight: spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#e1e6e9',
    borderWidth: 1,
    borderColor: 'transparent',
    // 디버깅을 위한 스타일
    minWidth: 201,
    minHeight: 298,
    maxWidth: 201,
    maxHeight: 298,
  },
  selectedPhotoItem: {
    borderWidth: 2,
    borderColor: colors.error,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  selectedBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadgeText: {
    fontFamily: typography.fontFamily.primary,
    fontWeight: '700',
    fontSize: 26,
    color: colors.surface,
    letterSpacing: -0.78,
  },
  nextButton: {
    marginHorizontal: spacing.lg,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#cccccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  nextButtonActive: {
    backgroundColor: colors.error,
  },
  nextButtonText: {
    fontFamily: typography.fontFamily.primary,
    fontWeight: '700',
    fontSize: 22,
    color: '#ffffff',
    letterSpacing: -0.66,
  },
  nextButtonTextActive: {
    color: colors.surface,
  },
});

export default PhotoEditScreen;
