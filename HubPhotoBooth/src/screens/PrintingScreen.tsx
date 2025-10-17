import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Alert, Animated } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import QRCode from 'react-native-qrcode-skia';
import { RadialGradient } from '@shopify/react-native-skia';
import Svg, { Path } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import CloudinaryService from '../services/cloudinary';
import SupabaseService from '../services/supabase';
import LocalServerService from '../services/localServer';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 기준 레이아웃 크기
const BASE_WIDTH = 834;
const BASE_HEIGHT = 1194;

// 비율 계산
const scaleX = screenWidth / BASE_WIDTH;
const scaleY = screenHeight / BASE_HEIGHT;
const scale = Math.min(scaleX, scaleY);

type PrintingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Printing'>;
type PrintingScreenRouteProp = RouteProp<RootStackParamList, 'Printing'>;

const PrintingScreen: React.FC = () => {
  const navigation = useNavigation<PrintingScreenNavigationProp>();
  const route = useRoute<PrintingScreenRouteProp>();
  const { photos, cloudinaryPhoto, selectedFrame, selectedTheme, quantity } = route.params;

  const [isUploading, setIsUploading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isComplete, setIsComplete] = useState(false);
  const [printRequestId, setPrintRequestId] = useState<string>('');

  // 애니메이션 값들
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const qrSlideAnim = useRef(new Animated.Value(screenHeight)).current;
  const qrScaleAnim = useRef(new Animated.Value(0.8)).current;
  const backgroundAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 이미지 업로드 시뮬레이션
    simulateImageUpload();
  }, []);

  const simulateImageUpload = async () => {
    try {
      // 실제 이미지 업로드 (원본 + 중간 크기)
      console.log('🚀 이미지 업로드 시작...');
      
      // 진행률: 로컬 서버 업로드 준비
      setUploadProgress(10);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const localImageUri = photos[0]; // 로컬용 고해상도 PNG (2004x3008px)
      const cloudinaryImageUri = cloudinaryPhoto || photos[0]; // Cloudinary용 경량 JPEG (1200x1800px)
      
      console.log('📸 이미지 준비:', {
        local: '2004x3008px PNG (로컬 서버)',
        cloudinary: '1200x1800px JPEG 60% (Cloudinary)'
      });
      
      // 1. 로컬 서버에 고해상도 원본 업로드
      setUploadProgress(20);
      console.log('📤 1단계: 로컬 서버에 고해상도 원본 업로드...');
      let localFilename = '';
      
      try {
        const localUploadResult = await LocalServerService.uploadOriginalPhoto(localImageUri);
        localFilename = localUploadResult.filename;
        console.log('✅ 로컬 서버 업로드 완료:', {
          filename: localFilename,
          size: `${(localUploadResult.size / 1024 / 1024).toFixed(2)}MB`
        });
      } catch (localError) {
        console.error('⚠️ 로컬 서버 업로드 실패 (계속 진행):', localError);
        // 로컬 서버 실패해도 계속 진행
      }
      
      setUploadProgress(50);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 2. Cloudinary에 경량 JPEG 업로드
      console.log('☁️ 2단계: Cloudinary에 경량 이미지 업로드...');
      const uploadResult = await CloudinaryService.uploadImage(
        cloudinaryImageUri, 
        'hub_photo_booth'
      );
      console.log('uploadResult', uploadResult);
      
      if (!uploadResult) {
        throw new Error('이미지 업로드에 실패했습니다.');
      }
      
      setUploadProgress(70);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // QR 코드용 URL 생성 (Cloudinary 실제 URL 사용)
      const qrImageUrl = CloudinaryService.generateQRImageUrl(uploadResult.secure_url);
      
      console.log('🔗 생성된 QR URL:', qrImageUrl);
      console.log('📷 Cloudinary 이미지 URL:', uploadResult.secure_url);
      
      // 3. Supabase에 인화 요청 데이터 저장
      setUploadProgress(80);
      try {
        console.log('💾 3단계: Supabase에 인화 요청 데이터 저장...');
        const printRequest = await SupabaseService.createPrintRequest({
          image_url: uploadResult.secure_url, // Cloudinary 경량 이미지 (1200x1800px JPEG 60%)
          quantity: quantity || 1,
          status: 'pending',
          frame_type: selectedFrame || 'unknown',
          theme: selectedTheme || undefined,
          cloudinary_public_id: uploadResult.public_id,
          local_image_filename: localFilename, // 로컬 서버 원본 파일명 (2004x3008px PNG)
          device_id: 'hub_photo_booth_device', // 실제로는 디바이스 고유 ID 사용
          user_agent: 'HubPhotoBooth/1.0'
        });
        
        setPrintRequestId(printRequest.id || '');
        console.log('✅ 인화 요청 저장 성공:', printRequest);
      } catch (supabaseError) {
        console.error('⚠️ Supabase 저장 실패 (계속 진행):', supabaseError);
        // Supabase 저장 실패해도 QR 코드는 표시
      }
      
      setUploadProgress(100);
      
      setQrCodeUrl(qrImageUrl);
      setIsUploading(false);
      
      // 인화 완료 애니메이션 시작
      startCompleteAnimation();
      
      console.log('업로드 완료:', qrImageUrl);
      // console.log('테스트 QR 코드 URL:', qrImageUrl);
    } catch (error) {
      console.error('업로드 오류:', error);
      Alert.alert('오류', '이미지 업로드 중 오류가 발생했습니다.');
      navigation.goBack();
    }
  };

  // 인화 완료 애니메이션 함수
  const startCompleteAnimation = () => {
    // 1. 페이드 아웃 + 배경색 변경 동시 실행
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }),
    ]).start(() => {
      // 페이드 아웃 완료 후 상태 변경
      setIsComplete(true);
      
      // 2. QR 코드 즉시 나타나게 (애니메이션 없이)
      qrSlideAnim.setValue(0);
      qrScaleAnim.setValue(1);
    });
  };

  const handleGoHome = () => {
    navigation.navigate('Main' as any);
  };

  return (
    <Animated.View style={[
      styles.container,
      {
        backgroundColor: backgroundAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['#ffffff', '#010101'],
        }),
      }
    ]}>
      {/* 업로드 중 화면 (페이드 아웃 애니메이션 적용) */}
      <Animated.View style={[
        styles.uploadContainer,
        { opacity: fadeAnim }
      ]}>
        <View style={styles.topSection}>
        <View style={styles.topRow}>
          {/* 뒤로가기 버튼 */}
          <View style={styles.backButton}>
            <Svg width="52" height="52" viewBox="0 0 52 52" fill="none">
              <Path 
                d="M36 7L13 25.5L36 44" 
                stroke= "white" 
                strokeOpacity="0.4" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </Svg>
          </View>

          {/* 프로그레스 바 */}
          {isUploading ? (
            <View style={styles.topProgressBar}>
              <LinearGradient
                colors={['#FFC2C3', '#FF474A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.topProgressFill, { width: `${uploadProgress}%` }]}
              />
            </View>
          ) : (
            <View style={styles.boothSection}>
            <Image
              source={require('../../assets/icon/icon_booth.png')}
              style={styles.boothIcon}
              resizeMode="contain"
            />
          </View>
          )}

    
        </View>
        

        
        {/* 진행 상태 */}
        <View>
          {/* 제목 */}
          <Text style={styles.title}>허그네컷 인화중...</Text>
          <View style={styles.progressContainer}>
           <Text style={styles.progressText}>조금만 기다려 주세요</Text>
           
           {/* 뽑힐 사진 미리보기 */}
           <View style={styles.photoPreviewContainer}>
             <Image 
               source={{ uri: photos[0] }} 
               style={styles.photoPreview}
               resizeMode="contain"
             />
           </View>
           
          </View>
        </View>
      </View>
      </Animated.View>

      {/* 완료 화면 (슬라이드 인 애니메이션 적용) */}
      {isComplete && (
        <Animated.View style={[
          styles.completeScreen,
          {
            transform: [
              { translateY: qrSlideAnim }
            ]
          }
        ]}>
          <View style={styles.topSection}>
            <View style={styles.topRow}>
              {/* 뒤로가기 버튼 */}
              <View style={styles.backButton}>
                <Svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                  <Path 
                    d="M36 7L13 25.5L36 44" 
                    stroke= "white" 
                    strokeOpacity="0.4" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>

              <View style={styles.boothSection}>
                <Image
                  source={require('../../assets/icon/icon_booth.png')}
                  style={styles.boothIcon}
                  resizeMode="contain"
                />
              </View>
            </View>

            <View style={styles.completeContainer}>
              <Text style={styles.completeText}>인화가 완료되었어요</Text>
              <Text style={styles.qrText}>지금 바로 확인해 보세요</Text>
            </View>
          </View>
      
          {/* 하단 영역 */}
          <View style={styles.bottomSection}>
            {qrCodeUrl && (
              <Animated.View style={[
                styles.qrWrapper,
                {
                  transform: [
                    { scale: qrScaleAnim }
                  ]
                }
              ]}>
                <View style={styles.qrContainer}>
                  <QRCode
                    value={qrCodeUrl}
                    size={444 * scale}
                    shapeOptions={{
                      shape: "square",
                      eyePatternShape: "square",
                      eyePatternGap: 0,
            
                    }}
                    logoAreaSize={90}
                    logo={
              <View style={{
              aspectRatio: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Image
                  source={require('../../assets/icon/icon_booth.png')}
                  style={{ width: 50, height: 50 }}
                  resizeMode="contain"
                />
            </View>
          }
                    color="#000000"
                    errorCorrectionLevel="M"
                  >
                  </QRCode>
                </View>
              </Animated.View>
            )}

            <View style={styles.buttonContainer}>
              <View style={styles.actionButtons}>
                <View style={styles.actionButton} onTouchEnd={handleGoHome}>
                  <Text style={styles.actionButtonText}>종료하기</Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  uploadContainer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  completeScreen: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topSection: {
    alignItems: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingTop: 44 * scale,
    paddingHorizontal: 44 * scale,
  },
  backButton: {
    width: 52,
    height: 52,
    flexShrink: 0,
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
  },
  topProgressBar: {
    marginLeft: 44 * scale,
    width: 554 * scale,
    height: 14,
    flexShrink: 0,
    borderRadius: 40,
    backgroundColor: '#E8E8E8', // 프로그레스 바 배경색상
    overflow: 'hidden',
  },
  topProgressFill: {
    height: '100%',
    borderRadius: 40,
    backgroundColor: '#FF474A',
  },
  title: {
    fontFamily: 'Pretendard',
    fontWeight: '700',
    fontSize: 40,
    color: '#000000',
    textAlign: 'center',
    marginTop: 40 * scale,
    letterSpacing: -1.2,
  },
  progressContainer: {
    alignItems: 'center',
    width: '100%',
  },
  progressText: {
    fontFamily: 'Pretendard',
    fontWeight: '400',
    fontSize: 24,
    color: '#585858',
    marginTop: 12 * scale,
  },
  progressBar: {
    width: 300,
    height: 8,
    backgroundColor: '#E8E8E8', // 프로그레스 바 배경색상
    borderRadius: 4,
    overflow: 'hidden',

  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ff474a',
    borderRadius: 4,
  },
  progressPercent: {
    fontFamily: 'Pretendard',
    fontWeight: '600',
    fontSize: 20,
    color: '#ff474a',
  },
  photoPreviewContainer: {
    marginVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6.396px 21.747px 2.559px rgba(0, 0, 0, 0.19)',
    borderRadius: 8,
  },
  photoPreview: {
    width: 289 * scale*1.9,
    height: 430 * scale*1.9,
    borderRadius: 8 * scale,

  },
  completeContainer: {
    alignItems: 'center',
    width: '100%',
  },
  completeText: {
    fontFamily: 'Pretendard',
    fontWeight: '700',
    fontSize:40 * scale,
    letterSpacing: -1.2 * scale,
    color: '#FFFFFF',
    marginTop: 38 * scale,
    textAlign: 'center',
  },
  qrText: {
    fontFamily: 'Pretendard',
    fontWeight: '400',
    fontSize:28 * scale,
    letterSpacing: -0.72 * scale,
    marginTop: 12 * scale,
    color: '#AAAAAA',
    textAlign: 'center',
  },
  bottomSection: {
    flex: 1,
    alignItems: 'center',
  },
  qrWrapper: {
    alignItems: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    width: 508   * scale,
    height: 508 * scale,
    flexShrink: 0,
    borderRadius: 24 * scale,
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: {
      width: 0,
      height: 8 * scale,
    },
    shadowOpacity: 1,
    shadowRadius: 16 * scale,
    justifyContent: 'center',
    marginTop: 122 * scale,
  },
  qrTextContainer: {
    alignItems: 'center',
  },
  qrSubtitle: {
    fontFamily: 'Pretendard',
    fontWeight: '400',
    fontSize: 16 * scale,
    color: '#CCCCCC',
    textAlign: 'center',
    letterSpacing: -0.48 * scale,
  },
  qrDescription: {
    fontFamily: 'Pretendard',
    fontWeight: '400',
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 227  * scale,
  },
  infoContainer: {
    backgroundColor: '#f8f8f8',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    width: '100%',
    maxWidth: 400,
  },
  infoText: {
    fontFamily: 'Pretendard',
    fontWeight: '500',
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  actionButtons: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    backgroundColor: '#ff474a',
    width: 437,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  actionButtonText: {
    fontFamily: 'Pretendard',
    fontWeight: '700',
    fontSize: 22,
    letterSpacing: -0.66 * scale,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',

    color: '#ffffff',
  },
});

export default PrintingScreen;
