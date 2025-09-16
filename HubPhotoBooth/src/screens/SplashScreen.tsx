import React, {useEffect, useRef, useCallback} from 'react';
import {View, StyleSheet, Animated, StatusBar, ImageBackground, Dimensions} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAppDispatch, useAppSelector} from '../store';
import {loadUserFromStorage} from '../store/slices/userSlice';
import {COLORS, TYPOGRAPHY, SPACING, APP_CONFIG} from '../constants';

const { width, height } = Dimensions.get('window');

const SplashScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const {isAuthenticated, isLoading} = useAppSelector(state => state.user);

  // 애니메이션 값들
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoScaleAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;

  // 애니메이션 시작
  const startAnimations = useCallback(() => {
    // 로고 애니메이션
    Animated.sequence([
      Animated.timing(logoScaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // 전체 페이드인
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // 스케일 애니메이션
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [logoScaleAnim, textFadeAnim, fadeAnim, scaleAnim]);

  // 사용자 데이터 로드
  const loadUserData = useCallback(async () => {
    try {
      await dispatch(loadUserFromStorage()).unwrap();
    } catch (error) {
      console.log('사용자 데이터 로드 실패:', error);
    }
  }, [dispatch]);

  useEffect(() => {
    // 애니메이션 시작
    startAnimations();

    // 사용자 정보 로드
    loadUserData();
  }, [startAnimations, loadUserData]);

  // 네비게이션 처리
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          navigation.navigate('Main' as never);
        } else {
          navigation.navigate('Main' as never); // 임시로 메인으로 이동
        }
      }, 2000); // 2초 후 자동 이동

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, navigation]);

  return (
    <ImageBackground
      source={require('../../assets/image/mainImage.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent={true}
        />

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{scale: scaleAnim}],
            },
          ]}>

        </Animated.View>

        {/* 로딩 인디케이터 */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingDot} />
            <View style={[styles.loadingDot, styles.loadingDot2]} />
            <View style={[styles.loadingDot, styles.loadingDot3]} />
          </View>
        )}
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY.PURPLE,
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.XL,
  },

  logoContainer: {
    marginBottom: SPACING.XL,
  },

  logoGrid: {
    width: 120,
    height: 120,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoSquare: {
    width: 50,
    height: 50,
    margin: 2,
    borderRadius: 8,
  },

  logoSquare1: {
    backgroundColor: COLORS.PRIMARY.PINK,
  },

  logoSquare2: {
    backgroundColor: COLORS.PRIMARY.BLUE,
  },

  logoSquare3: {
    backgroundColor: COLORS.PRIMARY.PURPLE,
  },

  logoSquare4: {
    backgroundColor: COLORS.WHITE,
  },

  appName: {
    fontSize: TYPOGRAPHY.FONT_SIZE['4XL'],
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
    color: COLORS.WHITE,
    textAlign: 'center',
    marginBottom: SPACING.SM,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 6,
  },

  appDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
    color: COLORS.WHITE,
    textAlign: 'center',
    marginBottom: SPACING.XL,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 4,
  },

  versionText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    color: COLORS.WHITE,
    opacity: 0.7,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },

  loadingContainer: {
    position: 'absolute',
    bottom: 100,
    flexDirection: 'row',
    alignItems: 'center',
  },

  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.WHITE,
    marginHorizontal: 4,
    opacity: 0.6,
  },

  loadingDot2: {
    opacity: 0.8,
  },

  loadingDot3: {
    opacity: 1,
  },
});

export default SplashScreen;
