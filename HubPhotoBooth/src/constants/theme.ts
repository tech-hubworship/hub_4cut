// Figma 디자인 기반 테마 시스템
export const colors = {
  // 주요 색상
  primary: '#010101',        // 검은색 배경
  white: '#ffffff',      // 흰색 텍스트
  textGray: '#aaaaaa',         // 회색 텍스트
  surface: '#2a2a2a',        // 카드 배경
  surfaceLight: '#f6f6f6',   // 밝은 카드 배경
  
  // 상태 색상
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#FF474A',
  
  // 기타
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const typography = {
  // Figma 디자인 기반 폰트 스타일
  fontFamily: {
    primary: 'Pretendard',
  },
  
  fontSize: {
    xs: 16,
    sm: 18,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 37,
    xxxl: 40,
    display: 44,
  },
  
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
  
  letterSpacing: {
    tight: -1.32,    // display 텍스트
    normal: -0.96,   // 일반 텍스트
    wide: -0.72,     // 작은 텍스트
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 20,
  full: 100,
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const layout = {
  // Figma 프레임 크기 기반
  screenWidth: 834,
  screenHeight: 1194,
  
  // 여백
  padding: {
    screen: 24,
    card: 20,
    button: 16,
  },
  
  // 카드 크기
  card: {
    width: 516,
    height: 360,
  },
  
  // 아이콘 크기
  icon: {
    small: 24,
    medium: 32,
    large: 52,
  },
};

// 공통 스타일
export const commonStyles = {
  // 텍스트 스타일
  title: {
    fontFamily: 'Pretendard',
    fontWeight: '700',
    fontSize: 44,
    lineHeight: 52.5,
    letterSpacing: -1.32,
    textAlign: 'center',
    color: colors.white,
  },
  
  subtitle: {
    fontFamily: 'Pretendard',
    fontWeight: '400',
    fontSize: 28,
    lineHeight: 33.4,
    letterSpacing: -0.84,
    textAlign: 'center',
    color: colors.textGray,
  },
  
  bodyText: {
    fontFamily: 'Pretendard',
    fontWeight: '400',
    fontSize: 24,
    lineHeight: 28.6,
    letterSpacing: -0.72,
    color: colors.textGray,
  },
  
  // 카드 스타일
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    padding: layout.padding.card,
  },
  
  // 버튼 스타일
  button: {
    primary: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.lg,
      paddingVertical: layout.padding.button,
      paddingHorizontal: layout.padding.button * 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondary: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      paddingVertical: layout.padding.button,
      paddingHorizontal: layout.padding.button * 2,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.16)',
    },
  },
  
  // 컨테이너 스타일
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingHorizontal: layout.padding.screen,
  },
  
  // 센터 정렬
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // 안전 영역
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  layout,
  commonStyles,
};

