import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { colors, spacing } from '../constants/theme';
import Svg, { Path } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 기준 레이아웃 크기
const BASE_WIDTH = 834;
const BASE_HEIGHT = 1194;

// 비율 계산
const scaleX = screenWidth / BASE_WIDTH;
const scaleY = screenHeight / BASE_HEIGHT;
const scale = Math.min(scaleX, scaleY);

type SpecialFrameThemeSelectionNavigationProp = StackNavigationProp<RootStackParamList, 'SpecialFrameThemeSelection'>;

const SpecialFrameThemeSelectionScreen: React.FC = () => {
  const navigation = useNavigation<SpecialFrameThemeSelectionNavigationProp>();

  const [selectedTheme, setSelectedTheme] = useState<string>('hyungyo');

  const handleBack = () => {
    navigation.goBack();
  };

  const handleThemeSelect = (theme: string) => {
    setSelectedTheme(theme);
  };

  const handleNext = () => {
    // 특수 프레임 카메라 촬영 화면으로 이동
    navigation.navigate('SpecialFrameCameraCapture' as any, {
      selectedTheme: selectedTheme,
    });
  };

  // 특수 프레임 테마 목록 (현재는 hyungyo만)
  const themes = [
    { id: 'hyungyo', name: '형교', image: require('../../assets/frames/special/hyungyo.png') },
  ];

  // 테마에 따른 프레임 이미지 경로 가져오기
  const getFrameImage = () => {
    return require('../../assets/frames/special/hyungyo.png');
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

          {/* 부스 아이콘 */}
          <View style={styles.boothSection}>
            <Image
              source={require('../../assets/icon/icon_booth.png')}
              style={styles.boothIcon}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* 제목 */}
        <Text style={styles.title}>특수 프레임을 선택해 주세요</Text>
        
        {/* 프레임 미리보기 */}
        <View style={styles.frameContainer}>
          <Image
            source={getFrameImage()}
            style={styles.frameImage}
            resizeMode="contain"
          />
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.themeSelector}
        >
          {themes.map((theme) => (
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

        {/* 다음 버튼 */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>다음</Text>
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
    width: 289 * scaleX,
    height: 430 * scaleY,
    marginTop: 50 * scale,
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
    borderRadius: 8,
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
});

export default SpecialFrameThemeSelectionScreen;

