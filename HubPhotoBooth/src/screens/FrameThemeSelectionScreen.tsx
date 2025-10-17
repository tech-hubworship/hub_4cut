import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { colors, typography, spacing, layout } from '../constants/theme';
import frameRegions from '../constants/frameRegions.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 기준 레이아웃 크기
const BASE_WIDTH = 834;
const BASE_HEIGHT = 1194;

// 비율 계산
const scaleX = screenWidth / BASE_WIDTH;
const scaleY = screenHeight / BASE_HEIGHT;
const scale = Math.min(scaleX, scaleY);

type FrameThemeSelectionNavigationProp = StackNavigationProp<RootStackParamList, 'FrameThemeSelection'>;
type FrameThemeSelectionRouteProp = RouteProp<RootStackParamList, 'FrameThemeSelection'>;

const FrameThemeSelectionScreen: React.FC = () => {
  const navigation = useNavigation<FrameThemeSelectionNavigationProp>();
  const route = useRoute<FrameThemeSelectionRouteProp>();
  const { photos, selectedFrame } = route.params;

  const [selectedTheme, setSelectedTheme] = useState<string>('classic');
  const [frameSettings, setFrameSettings] = useState<{[key: string]: boolean}>({});
  const [availableThemes, setAvailableThemes] = useState<any[]>([]);
  
  // 프레임 이미지의 실제 렌더링 크기를 추적
  const [frameLayout, setFrameLayout] = useState({ width: 0, height: 0, x: 0, y: 0 });

  // 컴포넌트 마운트 시 프레임 설정 로드
  useEffect(() => {
    loadFrameSettings();
  }, []);

  // 프레임 설정 로드 및 활성화된 테마 필터링
  const loadFrameSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('FRAME_SETTINGS');
      let settings: {[key: string]: boolean} = {};
      
      if (savedSettings) {
        settings = JSON.parse(savedSettings);
      } else {
        // 기본값: 모든 프레임 활성화
        const themes = Object.keys(frameRegions.frame4x6.themes);
        themes.forEach(theme => {
          settings[theme] = true;
        });
      }
      
      setFrameSettings(settings);
      
      // 활성화된 테마만 필터링
      const filteredThemes = Object.keys(settings)
        .filter(themeId => settings[themeId])
        .map(themeId => {
          const nameMap: {[key: string]: string} = {
            'classic': '레드',
            'vintage': '화이트',
            'leadership': '리더십'
          };
          
          return {
            id: themeId,
            name: nameMap[themeId] || themeId,
            image: getFrameImage(themeId)
          };
        });
      
      setAvailableThemes(filteredThemes);
      
      // 첫 번째 활성화된 테마를 기본 선택으로 설정
      if (filteredThemes.length > 0) {
        setSelectedTheme(filteredThemes[0].id);
      }
    } catch (error) {
      console.error('프레임 설정 로드 실패:', error);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleThemeSelect = (theme: string) => {
    setSelectedTheme(theme);
  };

  const handleNext = () => {
    // 프레임 미리보기 화면으로 이동
    navigation.navigate('FramePreview' as any, {
      photos: photos,
      selectedFrame: selectedFrame || 'default',
      selectedTheme: selectedTheme,
    });
  };

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


  // 테마에 따른 프레임 이미지 경로 가져오기
  const getFrameImage = (themeId: string) => {
    const themeConfig = frameRegions.frame4x6.themes[themeId as keyof typeof frameRegions.frame4x6.themes];
    if (themeConfig?.imageName === 'frame(4*6)/black.png') {
      return require('../../assets/frames/frame(4*6)/black.png');
    } else if (themeConfig?.imageName === 'frame(4*6)/white.png') {
      return require('../../assets/frames/frame(4*6)/white.png');
    }
  else if (themeConfig?.imageName === 'frame(4*6)/leadership.png') {
    return require('../../assets/frames/frame(4*6)/leadership.png');
  }
    // 기본값
    return require('../../assets/frames/frame(4*6)/black.png');
  };

  // 테마에 따른 사진 영역 정보 가져오기
  const getThemeRegions = (themeId: string) => {
    const themeConfig = frameRegions.frame4x6.themes[themeId as keyof typeof frameRegions.frame4x6.themes];
    return themeConfig?.regions || frameRegions.frame4x6.themes.classic.regions;
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
        <Text style={styles.title}>프레임을 선택해 주세요</Text>
        
        {/* 선택된 사진들 미리보기 - PhotoEditScreen과 동일한 방식 */}
        <View style={styles.frameContainer}>
          {/* 프레임 이미지를 배경으로 사용 */}
          <Image
            source={getFrameImage(selectedTheme)}
            style={styles.frameImage}
            resizeMode="contain"
            onLayout={onFrameLayout}
          />
          
          {/* 사진들을 JSON 영역 정보에 따라 정확히 배치 */}
          <View style={styles.photosOverlay}>
            {frameLayout.width > 0 && frameLayout.height > 0 && getThemeRegions(selectedTheme).map((region, index) => {
              const photo = photos[region.position];
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
                    <View style={styles.photoInFrame}>
                      <Image 
                        source={{ uri: photo }} 
                        style={styles.framePhoto} 
                        resizeMode="cover"
                        resizeMethod="scale" // 고품질 리사이징
                        fadeDuration={0} // 즉시 표시
                      />
                    </View>
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
        {/* 부스 아이콘과 프레임 디자인 선택하기 텍스트를 가로로 배치 */}
        <View style={styles.bottomHeader}>
          <Image
            source={require('../../assets/icon/icon_booth.png')}
            style={styles.boothIcon1}
            resizeMode="contain"
          />
          <Text style={styles.designText}>프레임 디자인 선택하기</Text>
        </View>
        
        {/* 테마 선택 영역 */}
        {availableThemes.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.themeSelector}
          >
            {availableThemes.map((theme) => (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.themeItem,
                  selectedTheme === theme.id && styles.selectedThemeItem
                ]}
                onPress={() => handleThemeSelect(theme.id)}
                activeOpacity={0.8}
              >
                <Image
                  source={theme.image}
                  style={styles.themeImage}
                  resizeMode="cover"
                />
                <Text style={[
                  styles.themeText,
                  selectedTheme === theme.id && styles.selectedThemeText
                ]}>
                  {theme.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.noThemesContainer}>
            <Text style={styles.noThemesText}>
              활성화된 프레임이 없습니다.{'\n'}
              메인 화면에서 프레임을 활성화해주세요.
            </Text>
          </View>
        )}

        {/* 다음 버튼 */}
        <TouchableOpacity
          style={[
            styles.nextButton,
            availableThemes.length === 0 && styles.disabledButton
          ]}
          onPress={availableThemes.length > 0 ? handleNext : undefined}
          activeOpacity={availableThemes.length > 0 ? 0.8 : 1}
        >
          <Text style={[
            styles.nextButtonText,
            availableThemes.length === 0 && styles.disabledButtonText
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



  title: {
    fontFamily: 'Pretendard',
    fontWeight: '700',
    fontSize: 40 * scale,
    color: '#000000',
    textAlign: 'center',
    marginTop: 38 * scale,
    marginBottom: 12 * scale,
    letterSpacing: -1.2 * scale,
    lineHeight: 48 * scale,
  },

  frameContainer: {
    width: 289 * scale, // 프레임 이미지 크기를 키움
    height: 430 * scale, // 4x6 비율에 맞춰 키움
    marginTop: 50 * scale,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6.396px 21.747px 2.559px rgba(0, 0, 0, 0.09)',
    borderRadius: 8,

  },
  frameImage: {
    width: '100%',
    height: '100%', // 4x6 비율에 맞춰 키움
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
    position: 'absolute',
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
  bottomSection: {
  },
  bottomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 60 * scale,
    marginTop: 83 * scale,
  },
  boothIcon1: {
    width: 30 * scale,
    height: 30 * scale,
  },
  designText: {
    fontFamily: 'Pretendard',
    fontWeight: '700',
    fontSize: 24 * scale,
    color: '#000000',
    textAlign: 'center',
    letterSpacing: -0.72 * scale,
    marginLeft: 18 * scale,
  },
  themeSelector: {
    marginLeft: 60 * scale,
    marginTop: 30 * scale,
  },
  themeItem: {
    width: 200,
    height: 200,
    marginRight: 18 * scale,
    borderRadius: 280,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#e1e6e9',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedThemeItem: {
    borderColor: colors.error,
  },
  themeImage: {
    width: '100%',
    height: '100%',
  },
  themeText: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    fontFamily: 'Pretendard',
    fontWeight: '400',
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: spacing.xs,
    borderRadius: 60,
  },
  selectedThemeText: {
    color: colors.error,
    fontWeight: '700',
  },
  nextButton: {
    marginHorizontal: 60 * scale,
    height: 56,
    borderRadius: 10,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 44 * scale,
  },
  nextButtonText: {
    fontFamily: 'Pretendard',
    fontWeight: '700',
    fontSize: 22,
    color: '#ffffff',
    letterSpacing: -0.66,
  },
  noThemesContainer: {
    marginLeft: 60 * scale,
    marginTop: 30 * scale,
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 60 * scale,
  },
  noThemesText: {
    fontFamily: 'Pretendard',
    fontWeight: '400',
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  disabledButtonText: {
    color: '#999',
  },
});

export default FrameThemeSelectionScreen;
