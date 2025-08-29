import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, Dimensions } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import frameRegions from '../constants/frameRegions.json';

type FramePreviewScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FramePreview'>;
type FramePreviewScreenRouteProp = RouteProp<RootStackParamList, 'FramePreview'>;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const FramePreviewScreen: React.FC = () => {
  const navigation = useNavigation<FramePreviewScreenNavigationProp>();
  const route = useRoute<FramePreviewScreenRouteProp>();
  const { photos, selectedFrame } = route.params;

  const handleBack = () => {
    navigation.goBack();
  };

  const handlePrint = () => {
    Alert.alert('인화', '인화 기능이 구현되었습니다.');
  };

  const handleReselect = () => {
    navigation.goBack();
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
        <Text style={styles.title}>허그네컷 미리보기</Text>
        
        {/* 부제목 */}
        <Text style={styles.subtitle}>인화를 하시려면 버튼을 눌러주세요</Text>
        
        {/* 사진 프레임 미리보기 */}
        <View style={styles.photoFrameContainer}>
          {/* 프레임 이미지를 그림자와 함께 배치 */}
          <View style={styles.frameShadowContainer}>
            <Image
              source={require('../../assets/frames/frame(4x6).png')}
              style={styles.frameImage}
              resizeMode="contain"
            />
          </View>
          
          {/* 사진들을 프레임 위에 오버레이로 배치 */}
          <View style={styles.photosOverlay}>
            {frameRegions.frame4x6.regions.map((region, index) => {
              const photo = photos[index];
              return (
                <View 
                  key={region.id} 
                  style={[
                    styles.photoRegion,
                    {
                      left: (region.x / frameRegions.frame4x6.totalWidth) * 501,
                      top: (region.y / frameRegions.frame4x6.totalHeight) * 752,
                      width: (region.width / frameRegions.frame4x6.totalWidth) * 501,
                      height: (region.height / frameRegions.frame4x6.totalHeight) * 752,
                    }
                  ]}
                >
                  {photo ? (
                    <Image 
                      source={{ uri: photo }} 
                      style={styles.photoInFrame} 
                      resizeMode="cover"
                    />
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
            <Text style={styles.reselectButtonText}>사진 다시 고르기</Text>
          </TouchableOpacity>
          
          {/* 인화하기 버튼 */}
          <TouchableOpacity style={styles.printButton} onPress={handlePrint}>
            <Text style={styles.printButtonText}>인화하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topSection: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
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
    fontSize: 40,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -1.2,
    lineHeight: 48,
  },
  subtitle: {
    fontFamily: 'Pretendard',
    fontWeight: '400',
    fontSize: 24,
    color: '#585858',
    textAlign: 'center',
    marginBottom: 48,
    letterSpacing: -0.72,
    lineHeight: 29,
  },
  photoFrameContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    position: 'relative',
  },
  frameShadowContainer: {
    position: 'absolute',
    width: 501,
    height: 752,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  frameImage: {
    width: 501,
    height: 752,
  },
  photosOverlay: {
    position: 'absolute',
    width: 501,
    height: 752,
  },
  photoRegion: {
    position: 'absolute',
    overflow: 'hidden',
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
  bottomSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  reselectButton: {
    backgroundColor: '#2b2b2b',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 10,
    minWidth: 265,
    alignItems: 'center',
  },
  reselectButtonText: {
    fontFamily: 'Pretendard',
    fontWeight: '700',
    fontSize: 22,
    color: '#ffffff',
    letterSpacing: -0.66,
    lineHeight: 26,
  },
  printButton: {
    backgroundColor: '#ff474a',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 10,
    minWidth: 437,
    alignItems: 'center',
  },
  printButtonText: {
    fontFamily: 'Pretendard',
    fontWeight: '700',
    fontSize: 22,
    color: '#ffffff',
    letterSpacing: -0.66,
    lineHeight: 26,
  },
});

export default FramePreviewScreen;
