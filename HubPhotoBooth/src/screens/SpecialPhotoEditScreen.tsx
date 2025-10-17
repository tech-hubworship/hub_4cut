import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { colors, typography, spacing } from '../constants/theme';
import specialFrameRegions from '../constants/specialFrameRegions.json';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// 기준 레이아웃 크기
const BASE_WIDTH = 834;
const BASE_HEIGHT = 1194;

// 비율 계산
const scaleX = width / BASE_WIDTH;
const scaleY = height / BASE_HEIGHT;
const scale = Math.min(scaleX, scaleY);

type SpecialPhotoEditScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PhotoEdit'>;
type SpecialPhotoEditScreenRouteProp = RouteProp<RootStackParamList, 'PhotoEdit'>;

const SpecialPhotoEditScreen: React.FC = () => {
  const navigation = useNavigation<SpecialPhotoEditScreenNavigationProp>();
  const route = useRoute<SpecialPhotoEditScreenRouteProp>();
  const { photos = [], selectedFrame } = route.params;

  const [selectedPhotos, setSelectedPhotos] = useState<Array<{ id: string; uri: string; position?: number } | null>>(
    Array(4).fill(null)
  );

  // 프레임 이미지의 실제 렌더링 크기를 추적
  const [frameLayout, setFrameLayout] = useState({ width: 0, height: 0, x: 0, y: 0 });

  // 형교 프레임 이미지 가져오기
  const getFrameImage = () => {
    return require('../../assets/frames/special/hyungyo.png');
  };

  // 형교 오버레이 이미지 가져오기
  const getHyungyoOverlay = (index: number) => {
    const overlays = [
      require('../../assets/frames/special/hyungyo/1.png'),
      require('../../assets/frames/special/hyungyo/2.png'),
      require('../../assets/frames/special/hyungyo/3.png'),
      require('../../assets/frames/special/hyungyo/4.png'),
    ];
    return overlays[index] || overlays[0];
  };

  // 특수 프레임 사진 영역 정보 가져오기
  const getThemeRegions = () => {
    return specialFrameRegions.specialFrame.themes.hyungyo.regions;
  };

  useEffect(() => {
    console.log('SpecialPhotoEditScreen - 받은 사진들:', photos);
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
      console.log('SpecialPhotoEditScreen - 초기화된 사진들:', initialPhotos);
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
    // 이미 선택된 사진인지 확인
    const isAlreadySelected = selectedPhotos.some(p => p && p.uri === photo.uri);
    
    if (isAlreadySelected) {
      // 이미 선택된 사진이면 해제
      const newSelectedPhotos = selectedPhotos.map(p => 
        p && p.uri === photo.uri ? null : p
      );
      setSelectedPhotos(newSelectedPhotos);
    } else {
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
    }
  };

  const handleNext = () => {
    const filledSlots = selectedPhotos.filter(p => p !== null);
    if (filledSlots.length < 4) {
      Alert.alert('알림', '모든 슬롯에 사진을 배치해주세요.');
      return;
    }
    
    // 특수 프레임 미리보기 화면으로 이동
    navigation.navigate('FramePreview' as any, {
      photos: selectedPhotos.filter(p => p !== null).map(p => p!.uri),
      selectedFrame: 'special_frame',
      selectedTheme: 'hyungyo',
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
    const jsonWidth = specialFrameRegions.specialFrame.totalWidth;
    const jsonHeight = specialFrameRegions.specialFrame.totalHeight;
    
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
      {/* 상단 영역 */}
      <View style={styles.topSection}>
        {/* 상단 요소들을 가로로 배치 */}
        <View style={styles.topRow}>
          {/* 뒤로가기 버튼 */}
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Svg width="52" height="52" viewBox="0 0 52 52" fill="none">
              <Path 
                d="M36 7L13 25.5L36 44" 
                stroke="black" 
                strokeOpacity="0.4" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>

          {/* 진행 상태 카운터 */}
          <View style={styles.counterBox}>
            <Text style={styles.counter}>{selectedCount}/4</Text>
          </View>
        </View>
        
        {/* 제목 */}
        <Text style={styles.title}>원하는 사진을 골라주세요</Text>

        {/* 특수 프레임 미리보기 - 프레임 위에 사진 배치 */}
        <View style={styles.frameContainer}>
          {/* 프레임 이미지를 배경으로 사용 */}
          <Image
            source={getFrameImage()}
            style={styles.frameImage}
            resizeMode="contain"
            onLayout={onFrameLayout}
          />
          
          {/* 사진들을 JSON 영역 정보에 따라 정확히 배치 */}
          <View style={styles.photosOverlay}>
            {frameLayout.width > 0 && frameLayout.height > 0 && getThemeRegions().map((region, index) => {
              const photo = selectedPhotos[region.position];
              const scaledRegion = getScaledRegion(region);
              
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
                      {/* 사진 */}
                      <Image 
                        source={{ uri: photo.uri }} 
                        style={styles.framePhoto} 
                        resizeMode="cover"
                        resizeMethod="scale"
                        fadeDuration={0}
                      />
                      {/* 해당 사진 위에 hyungyo 오버레이 */}
                      <Image
                        source={getHyungyoOverlay(region.position)}
                        style={styles.overlayImageOnPhoto}
                        resizeMode="cover"
                      />
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

      {/* 하단 영역 */}
      <View style={styles.bottomSection}>
        {/* 하단 배경 SVG */}
        <Svg width="834" height="503" viewBox="0 0 834 503" fill="none" style={styles.bottomSvg}>
          <Path 
            d="M0 503H834V30C834 13.4315 820.569 0 804 0H30C13.4315 0 0 13.4315 0 30V503Z" 
            fill="#000000"
          />
        </Svg>
        
        {/* 부스 아이콘과 텍스트 */}
        <View style={styles.boothSection}>
          <Image
            source={require('../../assets/icon/icon_booth.png')}
            style={styles.boothIcon}
            resizeMode="contain"
          />
          <Text style={styles.boothText}>사진 선택하기</Text>
        </View>
        
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

    backgroundColor: '#FFFFFF',
  },
  topSection: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingTop: 44 * scale,
  },
  backButton: {
    width: 52,
    height: 52,
    marginLeft: 44 * scale,
    flexShrink: 0,
  },
  title: {
    fontFamily: 'Pretendard',
    fontWeight: '700',
    fontSize: 40,
    color: '#000000',
    textAlign: 'center',
    marginTop: 30 * scale,
    letterSpacing: -1.2,
  },
  counterBox: {
    flexDirection: 'row',
    width: 88 * scale,
    height: 34 * scale,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginLeft: 277 * scale,
    backgroundColor: '#000000',
  },
  counter: {
    fontFamily: 'Pretendard',
    fontWeight: '700',
    fontSize: 22 * scale,
    color: '#FFFFFF',
    letterSpacing: -0.66 * scale,
  },
  frameContainer: {
    width: 289 * scaleX,
    height: 430 * scaleY,
    marginTop: 22 * scale,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6.396,
    },
    shadowOpacity: 0.09,
    shadowRadius: 21.747,
    elevation: 5,
    borderRadius: 8,
  },
  frameImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 1,
    borderRadius: 8,
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
    transform: [{ scale: 1.02 }],
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
  overlayImageOnPhoto: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    zIndex: 10,
  },
  bottomSection: {
    marginTop: 44 * scale,
    position: 'relative',
  },
  bottomSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 834,
    height: 503,
    flexShrink: 0,
  },
  boothSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30 * scale,
    marginLeft: 60 * scale,
    zIndex: 1,
  },
  boothIcon: {
    width: 30 * scale,
    height: 30 * scale,
    marginRight: spacing.sm,
  },
  boothText: {
    marginLeft: 18 * scale,
    fontFamily: 'Pretendard',
    fontWeight: '700',
    fontSize: 24 * scale,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.72 * scale,
  },
  photoSelector: {
    marginLeft: 60 * scale,
    marginTop: 30 * scale,
  },
  photoItem: {
    width: 180,
    height: 267,
    marginRight: 18 * scale,
    aspectRatio: 60/89,
    borderRadius: 8 * scale,
    backgroundColor: '#2F3031',
    overflow: 'hidden',
    position: 'relative',
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
    top: 18 * scale,
    left: 18 * scale,
    width: 32 * scale,
    height: 32 * scale,
    borderRadius: 170,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadgeText: {
    fontFamily: typography.fontFamily.primary,
    fontWeight: '800',
    fontSize: 24 * scale,
    color: '#FFFFFF',
    letterSpacing: -0.72 * scale,
  },
  nextButton: {
    marginLeft: 60 * scale,
    marginTop: 30 * scale,
    height: 56 * scale,
    width: 714 * scale,
    borderRadius: 10,
    gap: 10 * scale,
    padding: 10 * scale,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2F3031',
  },
  nextButtonActive: {
    backgroundColor: '#FF474A',
  },
  nextButtonText: {
    fontFamily: typography.fontFamily.primary,
    fontWeight: '700',
    fontSize: 22,
    color: '#ffffff',
    letterSpacing: -0.66,
  },
  nextButtonTextActive: {
    color: '#FFFFFF',
  },
});

export default SpecialPhotoEditScreen;
