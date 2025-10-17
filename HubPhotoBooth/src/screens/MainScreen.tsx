import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, Dimensions, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, ScrollView, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { Container, Button } from '../components';
import { colors, typography, spacing, layout } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LocalServerService from '../services/localServer';
import frameRegions from '../constants/frameRegions.json';

type MainScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const { width, height } = Dimensions.get('window');

// 기준 레이아웃 크기
const BASE_WIDTH = 834;
const BASE_HEIGHT = 1194;

// 비율 계산
const scaleX = width / BASE_WIDTH;
const scaleY = height / BASE_HEIGHT;
const scale = Math.min(scaleX, scaleY);

const MainScreen: React.FC = () => {
  const navigation = useNavigation<MainScreenNavigationProp>();
  const [showServerModal, setShowServerModal] = useState(false);
  const [showFrameModal, setShowFrameModal] = useState(false);
  const [serverIP, setServerIP] = useState('');
  const [serverPort, setServerPort] = useState('5001');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  
  // 프레임 설정 상태
  const [frameSettings, setFrameSettings] = useState<{[key: string]: boolean}>({});
  
  // 촬영 설정 상태
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [photoCount, setPhotoCount] = useState(6);
  const [timerDuration, setTimerDuration] = useState(8);
  const [maxPrintQuantity, setMaxPrintQuantity] = useState(5);
  const [exposureValue, setExposureValue] = useState(1.5);
  const [skinBrightness, setSkinBrightness] = useState(0.5); // 피부 밝기 보정 (0.0 ~ 1.0)

  const handleStart = () => {
    navigation.navigate('FrameSelection', { frameType: 'basic' });
  };

  // 컴포넌트 마운트 시 설정 로드
  useEffect(() => {
    loadFrameSettings();
    loadCaptureSettings();
  }, []);

  // 프레임 설정 로드
  const loadFrameSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('FRAME_SETTINGS');
      if (savedSettings) {
        setFrameSettings(JSON.parse(savedSettings));
      } else {
        // 기본값: 모든 프레임 활성화
        const defaultSettings: {[key: string]: boolean} = {};
        const themes = Object.keys(frameRegions.frame4x6.themes);
        themes.forEach(theme => {
          defaultSettings[theme] = true;
        });
        setFrameSettings(defaultSettings);
        await AsyncStorage.setItem('FRAME_SETTINGS', JSON.stringify(defaultSettings));
      }
    } catch (error) {
      console.error('프레임 설정 로드 실패:', error);
    }
  };

  // 히든 버튼 (3번 탭하면 설정 메뉴 표시)
  const handleHiddenButtonPress = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    
    if (newCount >= 3) {
      showSettingsMenu();
      setTapCount(0);
    }
    
    // 3초 후 카운트 리셋
    setTimeout(() => {
      setTapCount(0);
    }, 3000);
  };

  // 설정 메뉴 표시
  const showSettingsMenu = () => {
    Alert.alert(
      '설정',
      '원하는 설정을 선택하세요',
      [
        { text: '서버 설정', onPress: () => showServerSettings() },
        { text: '프레임 설정', onPress: () => showFrameSettings() },
        { text: '촬영 설정', onPress: () => showCaptureSettings() },
        { text: '취소', style: 'cancel' }
      ]
    );
  };

  // 서버 설정 표시
  const showServerSettings = () => {
    setShowServerModal(true);
    loadSavedServerIP();
  };

  // 프레임 설정 표시
  const showFrameSettings = () => {
    setShowFrameModal(true);
  };

  // 촬영 설정 표시
  const showCaptureSettings = () => {
    setShowCaptureModal(true);
  };

  const loadSavedServerIP = async () => {
    try {
      const savedIP = await AsyncStorage.getItem('LOCAL_SERVER_IP');
      const savedPort = await AsyncStorage.getItem('LOCAL_SERVER_PORT');
      if (savedIP) setServerIP(savedIP);
      if (savedPort) setServerPort(savedPort);
    } catch (error) {
      console.error('저장된 서버 주소 불러오기 실패:', error);
    }
  };

  const handleTestConnection = async () => {
    if (!serverIP.trim()) {
      Alert.alert('오류', 'IP 주소를 입력해주세요.');
      return;
    }

    setIsTestingConnection(true);
    
    try {
      // 임시로 서버 주소 설정하고 테스트
      await AsyncStorage.setItem('LOCAL_SERVER_IP', serverIP.trim());
      await AsyncStorage.setItem('LOCAL_SERVER_PORT', serverPort.trim());
      
      // 연결 테스트
      const isConnected = await LocalServerService.healthCheck();
      
      if (isConnected) {
        Alert.alert(
          '연결 성공',
          `서버와 성공적으로 연결되었습니다!\n주소: ${serverIP}:${serverPort}`,
          [
            {
              text: '확인',
              onPress: () => setShowServerModal(false)
            }
          ]
        );
      } else {
        Alert.alert('연결 실패', '서버에 연결할 수 없습니다.\nIP 주소와 포트를 확인해주세요.');
      }
    } catch (error) {
      console.error('연결 테스트 실패:', error);
      Alert.alert('연결 실패', '서버 연결 테스트 중 오류가 발생했습니다.');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleResetToDefault = async () => {
    try {
      await AsyncStorage.removeItem('LOCAL_SERVER_IP');
      await AsyncStorage.removeItem('LOCAL_SERVER_PORT');
      setServerIP('');
      setServerPort('5001');
      Alert.alert('초기화 완료', '.env 파일의 기본 설정을 사용합니다.');
    } catch (error) {
      console.error('초기화 실패:', error);
    }
  };

  // 프레임 설정 토글
  const toggleFrameSetting = async (themeId: string) => {
    const newSettings = {
      ...frameSettings,
      [themeId]: !frameSettings[themeId]
    };
    setFrameSettings(newSettings);
    
    try {
      await AsyncStorage.setItem('FRAME_SETTINGS', JSON.stringify(newSettings));
    } catch (error) {
      console.error('프레임 설정 저장 실패:', error);
    }
  };

  // 프레임 설정 초기화
  const resetFrameSettings = async () => {
    const defaultSettings: {[key: string]: boolean} = {};
    const themes = Object.keys(frameRegions.frame4x6.themes);
    themes.forEach(theme => {
      defaultSettings[theme] = true;
    });
    setFrameSettings(defaultSettings);
    
    try {
      await AsyncStorage.setItem('FRAME_SETTINGS', JSON.stringify(defaultSettings));
      Alert.alert('초기화 완료', '모든 프레임이 활성화되었습니다.');
    } catch (error) {
      console.error('프레임 설정 초기화 실패:', error);
    }
  };

  // 프레임 이름 매핑
  const getFrameDisplayName = (themeId: string) => {
    const nameMap: {[key: string]: string} = {
      'classic': '레드',
      'vintage': '화이트',
      'leadership': '리더십'
    };
    return nameMap[themeId] || themeId;
  };

  // 촬영 설정 로드
  const loadCaptureSettings = async () => {
    try {
      const savedPhotoCount = await AsyncStorage.getItem('PHOTO_COUNT');
      const savedTimerDuration = await AsyncStorage.getItem('TIMER_DURATION');
      const savedMaxPrintQuantity = await AsyncStorage.getItem('MAX_PRINT_QUANTITY');
      const savedExposureValue = await AsyncStorage.getItem('EXPOSURE_VALUE');
      const savedSkinBrightness = await AsyncStorage.getItem('SKIN_BRIGHTNESS');
      
      if (savedPhotoCount) setPhotoCount(parseInt(savedPhotoCount));
      if (savedTimerDuration) setTimerDuration(parseInt(savedTimerDuration));
      if (savedMaxPrintQuantity) setMaxPrintQuantity(parseInt(savedMaxPrintQuantity));
      if (savedExposureValue) setExposureValue(parseFloat(savedExposureValue));
      if (savedSkinBrightness) setSkinBrightness(parseFloat(savedSkinBrightness));
    } catch (error) {
      console.error('촬영 설정 로드 실패:', error);
    }
  };

  // 촬영 설정 저장
  const saveCaptureSettings = async () => {
    try {
      await AsyncStorage.setItem('PHOTO_COUNT', photoCount.toString());
      await AsyncStorage.setItem('TIMER_DURATION', timerDuration.toString());
      await AsyncStorage.setItem('MAX_PRINT_QUANTITY', maxPrintQuantity.toString());
      await AsyncStorage.setItem('EXPOSURE_VALUE', exposureValue.toString());
      await AsyncStorage.setItem('SKIN_BRIGHTNESS', skinBrightness.toString());
      Alert.alert('저장 완료', '촬영 및 인화 설정이 저장되었습니다.');
      setShowCaptureModal(false);
    } catch (error) {
      console.error('촬영 설정 저장 실패:', error);
      Alert.alert('오류', '설정 저장에 실패했습니다.');
    }
  };

  // 촬영 매수 증가/감소
  const increasePhotoCount = () => {
    if (photoCount < 10) setPhotoCount(photoCount + 1);
  };

  const decreasePhotoCount = () => {
    if (photoCount > 1) setPhotoCount(photoCount - 1);
  };

  // 타이머 시간 증가/감소
  const increaseTimerDuration = () => {
    if (timerDuration < 20) setTimerDuration(timerDuration + 1);
  };

  const decreaseTimerDuration = () => {
    if (timerDuration > 3) setTimerDuration(timerDuration - 1);
  };

  // 최대 인화 수량 증가/감소
  const increaseMaxPrintQuantity = () => {
    if (maxPrintQuantity < 20) setMaxPrintQuantity(maxPrintQuantity + 1);
  };

  const decreaseMaxPrintQuantity = () => {
    if (maxPrintQuantity > 1) setMaxPrintQuantity(maxPrintQuantity - 1);
  };

  // 카메라 조명값 증가/감소 (0.1 단위)
  const increaseExposureValue = () => {
    if (exposureValue < 3.0) setExposureValue(Math.round((exposureValue + 0.1) * 10) / 10);
  };

  const decreaseExposureValue = () => {
    if (exposureValue > 0.5) setExposureValue(Math.round((exposureValue - 0.1) * 10) / 10);
  };

  // 피부 밝기 보정 증가/감소 (0.1 단위)
  const increaseSkinBrightness = () => {
    if (skinBrightness < 1.0) setSkinBrightness(Math.round((skinBrightness + 0.1) * 10) / 10);
  };

  const decreaseSkinBrightness = () => {
    if (skinBrightness > 0.0) setSkinBrightness(Math.round((skinBrightness - 0.1) * 10) / 10);
  };

  return (
    <ImageBackground
      source={require('../../assets/image/mainImage.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* 오른쪽 위 히든 버튼 */}
        <TouchableOpacity 
          style={styles.hiddenButton}
          onPress={handleHiddenButtonPress}
          activeOpacity={1}
        >
          {tapCount > 0 && (
            <View style={styles.tapIndicator}>
              <Text style={styles.tapIndicatorText}>{tapCount}/3</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.content}>
          
          <View style={styles.actionSection}>
            <Button
              title="시작하기"
              onPress={handleStart}
              variant="secondary"
              size="large"
              fullWidth
              style={styles.startButton}
              textStyle={styles.startButtonText}
            />
          </View>
        </View>
      </View>

      {/* 서버 IP 설정 모달 */}
      <Modal
        visible={showServerModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowServerModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowServerModal(false)}
        >
          <TouchableOpacity 
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>로컬 서버 설정</Text>
            <Text style={styles.modalSubtitle}>
              서버 IP 주소를 입력하고 연결 테스트를 해주세요
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>서버 IP 주소</Text>
              <TextInput
                style={styles.input}
                placeholder="예: 192.168.0.15"
                placeholderTextColor="#999"
                value={serverIP}
                onChangeText={setServerIP}
                keyboardType="numeric"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>포트</Text>
              <TextInput
                style={styles.input}
                placeholder="5001"
                placeholderTextColor="#999"
                value={serverPort}
                onChangeText={setServerPort}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.testButton]}
                onPress={handleTestConnection}
                disabled={isTestingConnection}
              >
                {isTestingConnection ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>연결 테스트</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.resetButton]}
                onPress={handleResetToDefault}
              >
                <Text style={[styles.modalButtonText, styles.resetButtonText]}>
                  기본값으로
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowServerModal(false)}
            >
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* 프레임 설정 모달 */}
      <Modal
        visible={showFrameModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFrameModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFrameModal(false)}
        >
          <TouchableOpacity 
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>프레임 설정</Text>
            <Text style={styles.modalSubtitle}>
              표시할 프레임을 선택하세요
            </Text>

            <ScrollView style={styles.frameSettingsContainer}>
              {Object.keys(frameRegions.frame4x6.themes).map((themeId) => (
                <View key={themeId} style={styles.frameSettingItem}>
                  <View style={styles.frameSettingInfo}>
                    <Text style={styles.frameSettingName}>
                      {getFrameDisplayName(themeId)}
                    </Text>
                    <Text style={styles.frameSettingDesc}>
                      {frameSettings[themeId] ? '표시됨' : '숨김'}
                    </Text>
                  </View>
                  <Switch
                    value={frameSettings[themeId] || false}
                    onValueChange={() => toggleFrameSetting(themeId)}
                    trackColor={{ false: '#E0E0E0', true: '#FF474A' }}
                    thumbColor={frameSettings[themeId] ? '#FFFFFF' : '#F4F3F4'}
                    ios_backgroundColor="#E0E0E0"
                  />
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.resetButton]}
                onPress={resetFrameSettings}
              >
                <Text style={[styles.modalButtonText, styles.resetButtonText]}>
                  전체 활성화
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowFrameModal(false)}
            >
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* 촬영 설정 모달 */}
      <Modal
        visible={showCaptureModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCaptureModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCaptureModal(false)}
        >
          <TouchableOpacity 
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>촬영 및 인화 설정</Text>
            <Text style={styles.modalSubtitle}>
              촬영 설정과 피부톤 보정을 조절하세요
            </Text>

            <ScrollView 
              style={styles.settingsScrollView}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {/* 촬영 매수 설정 */}
              <View style={styles.settingSection}>
                <Text style={styles.settingLabel}>촬영 매수</Text>
                <View style={styles.counterContainer}>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={decreasePhotoCount}
                  >
                    <Text style={styles.counterButtonText}>-</Text>
                  </TouchableOpacity>
                  <View style={styles.counterValueContainer}>
                    <Text style={styles.counterValue}>{photoCount}</Text>
                    <Text style={styles.counterUnit}>장</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={increasePhotoCount}
                  >
                    <Text style={styles.counterButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.settingHint}>1~10장 선택 가능</Text>
              </View>

              {/* 타이머 시간 설정 */}
              <View style={styles.settingSection}>
                <Text style={styles.settingLabel}>타이머 시간</Text>
                <View style={styles.counterContainer}>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={decreaseTimerDuration}
                  >
                    <Text style={styles.counterButtonText}>-</Text>
                  </TouchableOpacity>
                  <View style={styles.counterValueContainer}>
                    <Text style={styles.counterValue}>{timerDuration}</Text>
                    <Text style={styles.counterUnit}>초</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={increaseTimerDuration}
                  >
                    <Text style={styles.counterButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.settingHint}>3~20초 선택 가능</Text>
              </View>

              {/* 최대 인화 수량 설정 */}
              <View style={styles.settingSection}>
                <Text style={styles.settingLabel}>최대 인화 수량</Text>
                <View style={styles.counterContainer}>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={decreaseMaxPrintQuantity}
                  >
                    <Text style={styles.counterButtonText}>-</Text>
                  </TouchableOpacity>
                  <View style={styles.counterValueContainer}>
                    <Text style={styles.counterValue}>{maxPrintQuantity}</Text>
                    <Text style={styles.counterUnit}>장</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={increaseMaxPrintQuantity}
                  >
                    <Text style={styles.counterButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.settingHint}>1~20장 선택 가능</Text>
              </View>

              {/* 카메라 조명값 설정 */}
              <View style={styles.settingSection}>
                <Text style={styles.settingLabel}>카메라 조명 (Exposure)</Text>
                <View style={styles.counterContainer}>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={decreaseExposureValue}
                  >
                    <Text style={styles.counterButtonText}>-</Text>
                  </TouchableOpacity>
                  <View style={styles.counterValueContainer}>
                    <Text style={styles.counterValue}>{exposureValue.toFixed(1)}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={increaseExposureValue}
                  >
                    <Text style={styles.counterButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.settingHint}>0.5~3.0 선택 가능 (기본: 1.5)</Text>
              </View>

              {/* 피부 밝기 보정 설정 */}
              <View style={styles.settingSection}>
                <Text style={styles.settingLabel}>피부 밝기 보정</Text>
                <View style={styles.counterContainer}>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={decreaseSkinBrightness}
                  >
                    <Text style={styles.counterButtonText}>-</Text>
                  </TouchableOpacity>
                  <View style={styles.counterValueContainer}>
                    <Text style={styles.counterValue}>{skinBrightness.toFixed(1)}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={increaseSkinBrightness}
                  >
                    <Text style={styles.counterButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.settingHint}>0.0~1.0 선택 가능 (높을수록 뽀얗게)</Text>
              </View>
            </ScrollView>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.testButton]}
                onPress={saveCaptureSettings}
              >
                <Text style={styles.modalButtonText}>저장</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCaptureModal(false)}
            >
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // 약간의 어둠 효과로 텍스트 가독성 향상
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: layout.padding.screen * 3,
    paddingBottom: layout.padding.screen * 2,
  },
  brandSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontFamily: 'Pretendard',
    fontWeight: '700',
    fontSize: typography.fontSize.display,
    lineHeight: 52.5,
    letterSpacing: typography.letterSpacing.tight,
    textAlign: 'center',
    color: colors.white,
    marginBottom: spacing.md,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  brandSubtitle: {
    fontFamily: 'Pretendard',
    fontWeight: '400',
    fontSize: typography.fontSize.lg,
    lineHeight: 33.4,
    letterSpacing: typography.letterSpacing.normal,
    textAlign: 'center',
    color: colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  actionSection: {
    width: '100%',
    paddingHorizontal: layout.padding.screen,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  startButton: {
    width: Math.min(518 * scaleX, width * 0.9),
    height: 56 * scaleY,
    borderRadius: 10 * scale,
    padding: 10 * scale,
    gap: 10 * scale,
    backgroundColor: '#FF474A',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4 * scale,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65 * scale,
    elevation: 8,
  },
  startButtonText: {
    fontFamily: 'Pretendard',
    fontWeight: '700',
    fontSize: 22 * scale,
    lineHeight: 22 * scale,
    letterSpacing: -0.03 * 22 * scale,
    textAlign: 'center',
    color: '#FFFFFF',
    width: 75 * scaleX,
    height: 26 * scaleY,
  },
  hiddenButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 80,
    height: 80,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tapIndicatorText: {
    fontFamily: 'Pretendard',
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    width: '85%',
    maxWidth: 500,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontFamily: 'Pretendard',
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontFamily: 'Pretendard',
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    fontFamily: 'Pretendard',
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 15,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  testButton: {
    backgroundColor: '#FF474A',
  },
  resetButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalButtonText: {
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  resetButtonText: {
    color: '#666',
  },
  closeButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  // 프레임 설정 모달 스타일
  frameSettingsContainer: {
    maxHeight: 300,
    marginBottom: 20,
  },
  frameSettingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  frameSettingInfo: {
    flex: 1,
  },
  frameSettingName: {
    fontFamily: 'Pretendard',
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  frameSettingDesc: {
    fontFamily: 'Pretendard',
    fontSize: 14,
    color: '#666',
  },
  // 촬영 설정 모달 스타일
  settingsScrollView: {
    maxHeight: 600,
    marginBottom: 20,
  },
  settingSection: {
    marginBottom: 20,
  },
  settingLabel: {
    fontFamily: 'Pretendard',
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  counterButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF474A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonText: {
    fontFamily: 'Pretendard',
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
  },
  counterValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    minWidth: 100,
    justifyContent: 'center',
  },
  counterValue: {
    fontFamily: 'Pretendard',
    fontSize: 42,
    fontWeight: '700',
    color: '#333',
  },
  counterUnit: {
    fontFamily: 'Pretendard',
    fontSize: 20,
    fontWeight: '400',
    color: '#666',
    marginLeft: 6,
  },
  settingHint: {
    fontFamily: 'Pretendard',
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default MainScreen;
