import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, Dimensions, Modal, Animated, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import frameRegions from '../constants/frameRegions.json';
import specialFrameRegions from '../constants/specialFrameRegions.json';
import Svg, { Path, Line } from 'react-native-svg';
import ViewShot, { captureRef } from 'react-native-view-shot';
import { getImageSize } from '../utils/photoUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 기준 레이아웃 크기
const BASE_WIDTH = 834;
const BASE_HEIGHT = 1194;
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
// 비율 계산
const scaleX = screenWidth / BASE_WIDTH;
const scaleY = screenHeight / BASE_HEIGHT;
const scale = Math.min(scaleX, scaleY);
type FramePreviewScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FramePreview'>;
type FramePreviewScreenRouteProp = RouteProp<RootStackParamList, 'FramePreview'>;



const FramePreviewScreen: React.FC = () => {
  const navigation = useNavigation<FramePreviewScreenNavigationProp>();
  const route = useRoute<FramePreviewScreenRouteProp>();
  const { photos, selectedFrame, selectedTheme = 'classic' } = route.params;
  
  // 특수 프레임인지 확인
  const isSpecialFrame = selectedFrame === 'special_frame';

  const [isQuantityModalVisible, setIsQuantityModalVisible] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [maxPrintQuantity, setMaxPrintQuantity] = useState(5);
  const [frameLayout, setFrameLayout] = useState({ width: 0, height: 0 });
  const [isNavigating, setIsNavigating] = useState(false);
  const [highResScale, setHighResScale] = useState(1);
  const [photoSizes, setPhotoSizes] = useState<Array<{ width: number; height: number }>>([]);
  const [imagesLoaded, setImagesLoaded] = useState<Set<number>>(new Set());
  const [frameImageLoaded, setFrameImageLoaded] = useState(false);
  
  const highResFrameRef = useRef<View>(null);

  // 컴포넌트 마운트 시 최대 인화 수량 불러오기
  useEffect(() => {
    loadMaxPrintQuantity();
  }, []);

  const loadMaxPrintQuantity = async () => {
    try {
      const savedMaxPrintQuantity = await AsyncStorage.getItem('MAX_PRINT_QUANTITY');
      if (savedMaxPrintQuantity) {
        setMaxPrintQuantity(parseInt(savedMaxPrintQuantity));
        console.log('최대 인화 수량 로드:', savedMaxPrintQuantity);
      }
    } catch (error) {
      console.error('최대 인화 수량 로드 실패:', error);
    }
  };

  // 테마에 따른 프레임 이미지 경로 가져오기
  const getFrameImage = () => {
    // 특수 프레임인 경우
    if (isSpecialFrame) {
      return require('../../assets/frames/special/hyungyo.png');
    }
    
    // 일반 프레임
    const themeConfig = frameRegions.frame4x6.themes[selectedTheme as keyof typeof frameRegions.frame4x6.themes];
    if (themeConfig?.imageName === 'frame(4*6)/black.png') {
      return require('../../assets/frames/frame(4*6)/black.png');
    } else if (themeConfig?.imageName === 'frame(4*6)/white.png') {
      return require('../../assets/frames/frame(4*6)/white.png');
    } else if (themeConfig?.imageName === 'frame(4*6)/leadership.png') {
      return require('../../assets/frames/frame(4*6)/leadership.png');
    }
    // 기본값
    return require('../../assets/frames/frame(4*6)/black.png');
  };

  // 테마에 따른 사진 영역 정보 가져오기
  const getThemeRegions = () => {
    // 특수 프레임인 경우
    if (isSpecialFrame) {
      return specialFrameRegions.specialFrame.themes.hyungyo.regions;
    }
    
    // 일반 프레임
    const themeConfig = frameRegions.frame4x6.themes[selectedTheme as keyof typeof frameRegions.frame4x6.themes];
    return themeConfig?.regions || frameRegions.frame4x6.themes.classic.regions;
  };
  
  // 특수 프레임용: hyungyo 오버레이 이미지 가져오기
  const getHyungyoOverlay = (index: number) => {
    const overlays = [
      require('../../assets/frames/special/hyungyo/1.png'),
      require('../../assets/frames/special/hyungyo/2.png'),
      require('../../assets/frames/special/hyungyo/3.png'),
      require('../../assets/frames/special/hyungyo/4.png'),
    ];
    return overlays[index] || overlays[0];
  };

  // 원본 사진 크기 측정 및 고해상도 스케일 계산
  useEffect(() => {
    const measurePhotoSizes = async () => {
      try {
        const sizes = await Promise.all(
          photos.map(async (photoUri) => {
            try {
              const size = await getImageSize(photoUri);
              return size;
            } catch (error) {
              console.error('사진 크기 측정 실패:', error);
              return { width: 3000, height: 4000 }; // 고해상도 기본값
            }
          })
        );
        
        setPhotoSizes(sizes);
        
        // 가장 큰 사진의 너비를 기준으로 스케일 계산
        const maxPhotoWidth = Math.max(...sizes.map(s => s.width));
        const regions = getThemeRegions();
        const maxRegionWidth = Math.max(...regions.map(r => r.width));
        
        // 프레임 이미지 초고해상도 설정
        // 디자인 기준 크기: 289x430px
        // 인쇄용 고품질을 위해 8배 확대 (2312x3440px)
        
        const finalScale = 8;
        
        setHighResScale(finalScale);
        
        console.log('📏 초고해상도 스케일 설정:', {
          maxPhotoWidth,
          maxRegionWidth,
          finalScale,
          outputSize: {
            width: Math.round(289 * finalScale),
            height: Math.round(430 * finalScale)
          },
          photoSizes: sizes,
          note: '인쇄용 고품질을 위해 8배 고정 (2312x3440px)'
        });
      } catch (error) {
        console.error('사진 크기 측정 오류:', error);
        setHighResScale(8); // 기본값: 8배 (초고해상도)
      }
    };
    
    measurePhotoSizes();
  }, [photos]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handlePrint = () => {
    setIsQuantityModalVisible(true);
  };

  const handleQuantitySelect = (quantity: number) => {
    setSelectedQuantity(quantity);
  };

  const onFrameLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setFrameLayout({ width, height });
  };

  const getScaledRegion = (region: any) => {
    if (frameLayout.width === 0 || frameLayout.height === 0) {
      return region;
    }
    
    // 특수 프레임인 경우
    if (isSpecialFrame) {
      const jsonWidth = specialFrameRegions.specialFrame.totalWidth;
      const jsonHeight = specialFrameRegions.specialFrame.totalHeight;
      const scaleX = frameLayout.width / jsonWidth;
      const scaleY = frameLayout.height / jsonHeight;
      
      return {
        ...region,
        x: region.x * scaleX,
        y: region.y * scaleY,
        width: region.width * scaleX,
        height: region.height * scaleY,
      };
    }
    
    // 일반 프레임
    const scaleX = frameLayout.width / 289;
    const scaleY = frameLayout.height / 430;
    
    return {
      ...region,
      x: region.x * scaleX,
      y: region.y * scaleY,
      width: region.width * scaleX,
      height: region.height * scaleY,
    };
  };

  const handleImageLoad = (index: number) => {
    setImagesLoaded(prev => {
      const newSet = new Set(prev);
      newSet.add(index);
      console.log(`📸 이미지 ${index} 로드 완료 (${newSet.size}/${photos.length})`);
      return newSet;
    });
  };

  const waitForImagesLoaded = async () => {
    // 프레임 이미지와 모든 사진이 로드될 때까지 대기
    const maxWaitTime = 5000; // 최대 5초
    const startTime = Date.now();
    
    while ((!frameImageLoaded || imagesLoaded.size < photos.length) && Date.now() - startTime < maxWaitTime) {
      console.log(`⏳ 이미지 로딩 대기 중... 프레임: ${frameImageLoaded}, 사진: ${imagesLoaded.size}/${photos.length}`);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    if (!frameImageLoaded) {
      console.warn('⚠️ 프레임 이미지 미로드, 계속 진행');
    }
    
    if (imagesLoaded.size < photos.length) {
      console.warn(`⚠️ 일부 사진 미로드 (${imagesLoaded.size}/${photos.length}), 계속 진행`);
    } else {
      console.log('✅ 모든 이미지 로드 완료');
    }
    
    // 추가 안정화 시간
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const captureHighResFrame = async (): Promise<string> => {
    try {
      if (!highResFrameRef.current) {
        throw new Error('고해상도 프레임 참조가 없습니다.');
      }
      
      await waitForImagesLoaded();
      
      // 로컬 저장용 고해상도 JPG (2312x3440px, 95% 품질)
      console.log('🎨 로컬용 고해상도 프레임 캡처 시작 (JPG 95%)...');
      
      const uri = await captureRef(highResFrameRef, {
        format: 'jpg',
        quality: 1, // 95% 품질 (고품질이면서 용량 절감)
        result: 'tmpfile',
        width: 289*8, // 프레임 초고해상도 (289*8)
        height: 430*8, // 430*8
      });
      
      console.log('✅ 로컬용 고해상도 프레임 캡처 완료 (JPG 95%):', uri);
      return uri;
    } catch (error) {
      console.error('❌ 프레임 캡처 실패:', error);
      
      // 실패 시 더 낮은 해상도로 재시도
      try {
        console.log('🔄 중간 해상도로 재시도 (6배, JPG 95%)...');
        const fallbackWidth = 289 * 6; // 1734px
        const fallbackHeight = 430 * 6; // 2580px
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const uri = await captureRef(highResFrameRef, {
          format: 'jpg',
          quality: 1,
          result: 'tmpfile',
          width: fallbackWidth,
          height: fallbackHeight,
        });
        
        console.log('✅ 재시도 성공 (6배, JPG 95%):', uri);
        return uri;
      } catch (retryError) {
        // 최종 재시도: 4배 (최소 품질)
        try {
          console.log('🔄 최소 해상도로 재시도 (4배, JPG 90%)...');
          const minWidth = 289 * 4; // 1156px
          const minHeight = 430 * 4; // 1720px
          
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const uri = await captureRef(highResFrameRef, {
            format: 'jpg',
            quality: 1,
            result: 'tmpfile',
            width: minWidth,
            height: minHeight,
          });
          
          console.log('✅ 최종 재시도 성공 (4배, JPG 90%):', uri);
          Alert.alert('안내', '화질이 다소 낮아질 수 있습니다.');
          return uri;
        } catch (finalError) {
          console.error('❌ 모든 재시도 실패:', finalError);
          throw new Error('프레임 캡처에 실패했습니다. 앱을 재시작해주세요.');
        }
      }
    }
  };

  const captureLowResFrame = async (): Promise<string> => {
    try {
      if (!highResFrameRef.current) {
        throw new Error('프레임 참조가 없습니다.');
      }
      
      await waitForImagesLoaded();
      
      // Cloudinary용 경량 JPEG (867x1290px, 2MB 이하)
      console.log('📐 Cloudinary용 경량 프레임 캡처 시작 (JPEG 60%)...');
      
      const uri = await captureRef(highResFrameRef, {
        format: 'jpg',
        quality: 1, // 60% 품질 (웹용, 2MB 목표)
        result: 'tmpfile',
        width: 289*3, // 웹용 충분한 크기 (289*3)
        height: 430*3, // 430*3
      });
      
      console.log('✅ Cloudinary용 경량 캡처 완료:', uri);
      return uri;
    } catch (error) {
      console.error('❌ 경량 캡처 실패:', error);
      throw new Error('Cloudinary용 이미지 생성 실패');
    }
  };

  const handleConfirmPrint = async () => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    
    // 팝업 닫기
    setIsQuantityModalVisible(false);
    
    try {
      console.log('🎨 프레임 이미지 캡처 시작 (2종류)...');
      
      // 1. 로컬 저장용 고해상도 PNG 캡처
      const highResImageUri = await captureHighResFrame();
      
      // 2. Cloudinary용 경량 JPEG 캡처
      const lowResImageUri = await captureLowResFrame();
      
      console.log('✅ 두 종류 이미지 캡처 완료:', {
        local: highResImageUri,
        cloudinary: lowResImageUri
      });
      
      // 인화 중 화면으로 이동 (두 이미지 모두 전달)
      navigation.navigate('Printing' as any, {
        photos: [highResImageUri], // 로컬용 고해상도
        cloudinaryPhoto: lowResImageUri, // Cloudinary용 경량
        selectedFrame: selectedFrame,
        selectedTheme: route.params?.selectedTheme || 'classic',
        quantity: selectedQuantity,
      });
      
      // 네비게이션 후 로딩 상태 해제
      setIsNavigating(false);
    } catch (error) {
      console.error('프레임 캡처 오류:', error);
      Alert.alert('오류', '프레임 캡처 중 오류가 발생했습니다.');
      setIsNavigating(false);
    }
  };

  const handleCancelPrint = () => {
    setIsQuantityModalVisible(false);
  };

  const handleReselect = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* 상단 검은색 영역 */}
      <View style={styles.topSection}>
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

          {/* 부스 아이콘과 텍스트 */}
          <View style={styles.boothSection}>
            <Image
              source={require('../../assets/icon/icon_booth.png')}
              style={styles.boothIcon}
              resizeMode="contain"
            />
          </View>
        </View>
        
        {/* 제목 */}
        <Text style={styles.title}>허그네컷 미리보기</Text>
        
        {/* 부제목 */}
        <Text style={styles.subtitle}>인화를 하시려면 버튼을 눌러주세요</Text>
        
        {/* 사진 프레임 미리보기 - 캡처용 (ViewShot이 고해상도로 확대) */}
        <View 
          ref={highResFrameRef}
          style={styles.photoFrameContainer}
          collapsable={false}
          removeClippedSubviews={false}
          needsOffscreenAlphaCompositing={true}
        >
          {/* 프레임 이미지를 그림자와 함께 배치 */}
          <View style={styles.frameShadowContainer}>
            <Image
              source={getFrameImage()}
              style={styles.frameImage}
              resizeMode="contain"
              resizeMethod="scale" // 고품질 리사이징
              onLayout={onFrameLayout}
              onLoad={() => {
                console.log('🖼️ 프레임 이미지 로드 완료');
                setFrameImageLoaded(true);
              }}
              onError={(error) => {
                console.error('프레임 이미지 로드 실패:', error);
                setFrameImageLoaded(true); // 에러도 로드된 것으로 간주
              }}
            />
          </View>
          
          {/* 사진들을 프레임 위에 오버레이로 배치 */}
          <View style={styles.photosOverlay}>
            {frameLayout.width > 0 && frameLayout.height > 0 && getThemeRegions().map((region, index) => {
              const photo = photos[index];
              const scaledRegion = getScaledRegion(region);
              
              return (
                <View 
                  key={region.id} 
                  style={[
                    styles.photoRegion,
                    {
                      left: scaledRegion.x,
                      top: scaledRegion.y,
                      width: scaledRegion.width,
                      height: scaledRegion.height,
                    }
                  ]}
                >
                  {photo ? (
                    <>
                      <Image 
                        source={{ uri: photo }} 
                        style={styles.photoInFrame} 
                        resizeMode="cover"
                        resizeMethod="scale" // 고품질 리사이징
                        fadeDuration={0} // 페이드 효과 제거 (즉시 표시)
                        onLoad={() => handleImageLoad(index)}
                        onError={(error) => {
                          console.error(`이미지 ${index} 로드 실패:`, error);
                          handleImageLoad(index); // 에러도 로드된 것으로 간주
                        }}
                      />
                      {/* 특수 프레임: 각 사진 위에 hyungyo 오버레이 */}
                      {isSpecialFrame && (
                        <Image
                          source={getHyungyoOverlay(index)}
                          style={styles.hyungyoOverlay}
                          resizeMode="cover"
                          resizeMethod="scale"
                        />
                      )}
                    </>
                  ) : (
                    <View style={styles.emptyPhotoRegion} />
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </View>
      
      {/* 하단 버튼 영역 */}
      <View style={styles.bottomSection}>
        {/* 버튼들 */}
        <View style={styles.buttonContainer}>
          {/* 사진 다시 고르기 버튼 */}
          <TouchableOpacity style={styles.reselectButton} onPress={handleReselect}>
            <Text style={styles.reselectButtonText}>프레임 다시 고르기</Text>
          </TouchableOpacity>
          
          {/* 인화하기 버튼 */}
          <TouchableOpacity style={styles.printButton} onPress={handlePrint}>
            <Text style={styles.printButtonText}>인화하기</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 수량 선택 팝업 */}
      <Modal
        visible={isQuantityModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelPrint}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCancelPrint}
        >
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>인화수량</Text>
              <Text style={styles.modalSubtitle}>인화 수량을 선택해주세요</Text>
              
              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  style={styles.minusButton}
                  onPress={() => selectedQuantity > 1 && setSelectedQuantity(selectedQuantity - 1)}
                >
                  <Svg width="84" height="84" viewBox="0 0 84 84" fill="none">
                    <Line 
                      x1="68" 
                      y1="44" 
                      x2="16" 
                      y2="44" 
                      stroke="#7D7D7D" 
                      strokeWidth="4" 
                      strokeLinecap="round"
                    />
                  </Svg>
                </TouchableOpacity>
                
                <Text style={styles.quantityNumber}>{selectedQuantity}</Text>
                
                <TouchableOpacity
                  style={styles.plusButton}
                  onPress={() => selectedQuantity < maxPrintQuantity && setSelectedQuantity(selectedQuantity + 1)}
                  disabled={selectedQuantity >= maxPrintQuantity}
                >
                  <Svg width="84" height="84" viewBox="0 0 84 84" fill="none">
                    <Line 
                      x1="42.1934" 
                      y1="16" 
                      x2="42.1934" 
                      y2="68" 
                      stroke={selectedQuantity >= maxPrintQuantity ? "#CCCCCC" : "#7D7D7D"}
                      strokeWidth="4" 
                      strokeLinecap="round"
                    />
                    <Line 
                      x1="68" 
                      y1="42.1934" 
                      x2="16" 
                      y2="42.1934" 
                      stroke={selectedQuantity >= maxPrintQuantity ? "#CCCCCC" : "#7D7D7D"}
                      strokeWidth="4" 
                      strokeLinecap="round"
                    />
                  </Svg>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.printConfirmButton}
                onPress={handleConfirmPrint}
              >
                <Text style={styles.printConfirmButtonText}>인화하기</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* 로딩 모달 */}
      <Modal
        visible={isNavigating}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF474A" />
            <Text style={styles.loadingText}>이미지를 생성하는 중...</Text>
            <Text style={styles.loadingSubtext}>잠시만 기다려주세요</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topSection: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  backButton: {
    width: 52,
    height: 52,
    flexShrink: 0,
    marginLeft: 44 * scale,
    marginTop: 44 * scale,
  },
  boothSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boothIcon: {
    width: 40 * scale,
    height: 40 * scale,
    marginLeft: 301 * scale,
    marginTop: 50 * scale,
  },
  backButtonText: {
    fontSize: 32,
    color: '#000000',
    fontWeight: 'bold',
    fontFamily: 'Pretendard',
  },
  title: {
    fontFamily: 'Pretendard',
    fontWeight: '700',
    fontSize: 40, // 2.5rem
    color: '#000000',
    textAlign: 'center',
    marginTop: 38 * scale, // 8rem = 128px
    marginBottom: 12,
    letterSpacing: -1.2, // -0.075rem
  },
  subtitle: {
    fontFamily: 'Pretendard',
    fontWeight: '400',
    fontSize: 24, // 1.5rem
    color: '#585858',
    textAlign: 'center',
    marginTop: 12, // 0.75rem = 12px
    letterSpacing: -0.72, // -0.045rem
  },
  photoFrameContainer: {
    marginTop: 60 * scale, // 1.94rem = 31px
  },
  frameShadowContainer: {
    width: 289 * 1.5,
    height: 430 * 1.5,
    flexShrink: 0,
    borderRadius: 10 * scale,
    boxShadow: '0 10px 34px 4px rgba(0, 0, 0, 0.09)',

  },
  frameImage: {
    width: 289*1.5,
    height: 430*1.5,
    flexShrink: 0,
  },
  photosOverlay: {
    position: 'absolute',
    width: 289 * 1.5,
    height: 430 * 1.5,
    flexShrink: 0,
    aspectRatio: 289*2 / 430*2,
  },
  photoRegion: {
    position: 'absolute',
    overflow: 'hidden',
    transform: [{ scale: 1.02 }],
  },
  photoInFrame: {
    width: '100%',
    height: '100%',
  },
  emptyPhotoRegion: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e1e6e9',
  },
  hyungyoOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  bottomSection: {
    marginTop: 100 * scale,
    marginLeft: 60 * scale,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12 * scale,
  },
  reselectButton: {
    backgroundColor: '#2b2b2b',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    minWidth: 265,
    height: 56,
  },
  reselectButtonText: {
    fontFamily: 'Pretendard',
    fontWeight: '700',
    fontSize: 22,
    color: '#ffffff',
    letterSpacing: -0.66 * scale,

  },
  printButton: {
    backgroundColor: '#ff474a',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    minWidth: 437,
    height: 56,
  },
  printButtonText: {
    fontFamily: 'Pretendard',
    fontWeight: '700',
    fontSize: 22,
    color: '#ffffff',
    letterSpacing: -0.66 * scale,
  },
  // 팝업 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
      },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: 594,
    height: 708,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  modalTitle: {
    fontFamily: 'Pretendard',
    fontWeight: '700',
    fontSize: 37 * scale,
    letterSpacing: -0.03 * 37 * scale,
    color: '#000000',
    marginTop: 60,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontFamily: 'Pretendard',
    fontWeight: '400',
    fontSize: 24,
    color: '#585858',
    marginTop: 12,
    textAlign: 'center',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 113,
    gap: 40,
  },
  minusButton: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',

  },
  minusButtonText: {
    fontFamily: 'Pretendard',
    fontWeight: '700',
    fontSize: 32,
    color: '#666666',
  },
  quantityNumber: {
    fontFamily: 'Pretendard',
    fontWeight: '800',
    fontSize: 160 * scale,
    letterSpacing: -0.03 * 160 * scale,
    color: '#000000',
    textAlign: 'center',
    width: 200, // 고정 너비로 버튼 위치 고정
    minWidth: 200,
  },
  quantityHint: {
    fontFamily: 'Pretendard',
    fontWeight: '400',
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  plusButton: {
    width: 80,
    height: 80,

    alignItems: 'center',
    justifyContent: 'center',
  },
  plusButtonText: {
    fontFamily: 'Pretendard',
    fontWeight: '700',
    fontSize: 32,
    color: '#666666',
  },
  printConfirmButton: {
    width: 437,
    height: 56,
    borderRadius: 10,
    marginTop: 169,
    backgroundColor: '#ff474a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  printConfirmButtonText: {
    fontFamily: 'Pretendard',
    fontWeight: '700',
    fontSize: 24,
    color: '#ffffff',
  },
  // 로딩 모달 스타일
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    minWidth: 300,
  },
  loadingText: {
    fontFamily: 'Pretendard',
    fontWeight: '700',
    fontSize: 20,
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontFamily: 'Pretendard',
    fontWeight: '400',
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default FramePreviewScreen;
