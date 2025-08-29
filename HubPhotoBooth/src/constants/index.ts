// 앱 기본 설정
export const APP_CONFIG = {
  NAME: '허브 인생네컷',
  VERSION: '1.0.0',
  BUILD_NUMBER: '1',
  BUNDLE_ID: 'com.hub.photobooth',
} as const;

// API 설정
export const API_CONFIG = {
  BASE_URL: process.env.API_BASE_URL || 'https://api.hub-photobooth.com',
  TIMEOUT: parseInt(process.env.API_TIMEOUT || '30000', 10),
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// 프린터 설정
export const PRINTER_CONFIG = {
  DEFAULT_IP: process.env.PRINTER_IP || '192.168.1.100',
  DEFAULT_PORT: parseInt(process.env.PRINTER_PORT || '9100', 10),
  CONNECTION_TIMEOUT: 5000,
  PRINT_TIMEOUT: 30000,
  MAX_QUEUE_SIZE: 10,
} as const;

// 클라우드 설정
export const CLOUD_CONFIG = {
  BUCKET: process.env.CLOUD_BUCKET || 'hub-photobooth',
  REGION: process.env.CLOUD_REGION || 'ap-northeast-2',
  UPLOAD_TIMEOUT: 60000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
} as const;

// 사진 설정
export const PHOTO_CONFIG = {
  MAX_WIDTH: 1920,
  MAX_HEIGHT: 1080,
  QUALITY: 0.8,
  FORMAT: 'JPEG' as const,
  GRID_SIZE: 2, // 2x2 그리드
  THUMBNAIL_SIZE: 200,
} as const;

// 프레임 설정
export const FRAME_CONFIG = {
  DEFAULT_FRAME: 'basic_001',
  CATEGORIES: ['seasonal', 'event', 'special', 'basic'] as const,
  SEASONS: ['spring', 'summer', 'autumn', 'winter'] as const,
  EVENTS: [
    'christmas',
    'easter',
    'thanksgiving',
    'baptism',
    'wedding',
    'bible_study',
    'youth_group',
  ] as const,
} as const;

// 프린트 설정
export const PRINT_CONFIG = {
  DEFAULT_PAPER_SIZE: '4x6' as const,
  DEFAULT_QUALITY: 'normal' as const,
  DEFAULT_COPIES: 1,
  MAX_COPIES: 10,
  PAPER_SIZES: ['4x6', '5x7', '6x8'] as const,
  QUALITIES: ['draft', 'normal', 'high', 'premium'] as const,
} as const;

// QR 코드 설정
export const QR_CONFIG = {
  EXPIRY_HOURS: 3,
  SIZE: 200,
  ERROR_CORRECTION: 'M' as const,
  FOREGROUND_COLOR: '#000000',
  BACKGROUND_COLOR: '#FFFFFF',
} as const;

// 네비게이션 설정
export const NAVIGATION_CONFIG = {
  ANIMATION_DURATION: 300,
  HEADER_HEIGHT: 60,
  TAB_BAR_HEIGHT: 80,
} as const;

// UI 설정
export const UI_CONFIG = {
  THEMES: ['light', 'dark'] as const,
  LANGUAGES: ['ko', 'en'] as const,
  ANIMATION_DURATION: 200,
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
} as const;

// 색상 팔레트 (Instagram 스타일)
export const COLORS = {
  // 메인 그라데이션 색상
  PRIMARY: {
    PURPLE: '#8B5CF6',
    PINK: '#EC4899',
    BLUE: '#3B82F6',
  },

  // 기본 색상
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  TRANSPARENT: 'transparent',

  // 그레이 스케일
  GRAY: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // 상태 색상
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#3B82F6',

  // 배경 색상
  BACKGROUND: {
    PRIMARY: '#FFFFFF',
    SECONDARY: '#F9FAFB',
    TERTIARY: '#F3F4F6',
  },

  // 텍스트 색상
  TEXT: {
    PRIMARY: '#111827',
    SECONDARY: '#6B7280',
    TERTIARY: '#9CA3AF',
    INVERSE: '#FFFFFF',
  },

  // 테두리 색상
  BORDER: {
    PRIMARY: '#E5E7EB',
    SECONDARY: '#F3F4F6',
    FOCUS: '#8B5CF6',
  },

  // 그림자 색상
  SHADOW: {
    SMALL: 'rgba(0, 0, 0, 0.05)',
    MEDIUM: 'rgba(0, 0, 0, 0.1)',
    LARGE: 'rgba(0, 0, 0, 0.15)',
  },
} as const;

// 타이포그래피
export const TYPOGRAPHY = {
  FONT_FAMILY: {
    REGULAR: 'Pretendard',
    MEDIUM: 'Pretendard',
    BOLD: 'Pretendard',
  },

  FONT_SIZE: {
    XS: 12,
    SM: 14,
    BASE: 16,
    LG: 18,
    XL: 20,
    '2XL': 24,
    '3XL': 30,
    '4XL': 36,
  },

  FONT_WEIGHT: {
    NORMAL: '400',
    MEDIUM: '500',
    SEMIBOLD: '600',
    BOLD: '700',
  },

  LINE_HEIGHT: {
    TIGHT: 1.25,
    NORMAL: 1.5,
    RELAXED: 1.75,
  },
} as const;

// 간격 및 크기
export const SPACING = {
  XS: 4,
  SM: 8,
  BASE: 16,
  LG: 24,
  XL: 32,
  '2XL': 48,
  '3XL': 64,
  '4XL': 96,
} as const;

export const SIZES = {
  // 화면 크기
  SCREEN: {
    WIDTH: 375, // iPhone 기준
    HEIGHT: 812,
  },

  // 컴포넌트 크기
  COMPONENT: {
    BUTTON_HEIGHT: 48,
    INPUT_HEIGHT: 48,
    CARD_PADDING: 16,
    BORDER_RADIUS: 12,
  },

  // 아이콘 크기
  ICON: {
    SMALL: 16,
    MEDIUM: 24,
    LARGE: 32,
    XLARGE: 48,
  },
} as const;

// 애니메이션 설정
export const ANIMATION = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },

  EASING: {
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out',
  },

  SCALE: {
    PRESS: 0.95,
    HOVER: 1.05,
  },
} as const;

// 에러 메시지
export const ERROR_MESSAGES = {
  NETWORK: {
    CONNECTION_FAILED: '네트워크 연결에 실패했습니다.',
    TIMEOUT: '요청 시간이 초과되었습니다.',
    SERVER_ERROR: '서버 오류가 발생했습니다.',
  },

  CAMERA: {
    PERMISSION_DENIED: '카메라 권한이 필요합니다.',
    DEVICE_NOT_FOUND: '카메라를 찾을 수 없습니다.',
    CAPTURE_FAILED: '사진 촬영에 실패했습니다.',
  },

  PRINTER: {
    CONNECTION_FAILED: '프린터 연결에 실패했습니다.',
    PRINT_FAILED: '프린트에 실패했습니다.',
    NO_PAPER: '용지가 부족합니다.',
  },

  STORAGE: {
    SAVE_FAILED: '저장에 실패했습니다.',
    LOAD_FAILED: '불러오기에 실패했습니다.',
    INSUFFICIENT_SPACE: '저장 공간이 부족합니다.',
  },
} as const;

// 성공 메시지
export const SUCCESS_MESSAGES = {
  PHOTO: {
    CAPTURED: '사진이 촬영되었습니다.',
    SAVED: '사진이 저장되었습니다.',
    PRINTED: '프린트가 완료되었습니다.',
  },

  SETTINGS: {
    SAVED: '설정이 저장되었습니다.',
    UPDATED: '설정이 업데이트되었습니다.',
  },
} as const;

// 로컬 스토리지 키
export const STORAGE_KEYS = {
  USER: 'user',
  SETTINGS: 'settings',
  PHOTOS: 'photos',
  FRAMES: 'frames',
  PRINTERS: 'printers',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

// API 엔드포인트
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    REGISTER: '/auth/register',
  },

  USER: {
    PROFILE: '/user/profile',
    PREFERENCES: '/user/preferences',
    UPDATE: '/user/update',
  },

  PHOTO: {
    CREATE: '/photo/create',
    UPDATE: '/photo/update',
    DELETE: '/photo/delete',
    LIST: '/photo/list',
    UPLOAD: '/photo/upload',
  },

  FRAME: {
    LIST: '/frame/list',
    CATEGORY: '/frame/category',
    SEASON: '/frame/season',
    EVENT: '/frame/event',
  },

  PRINTER: {
    STATUS: '/printer/status',
    PRINT: '/printer/print',
    QUEUE: '/printer/queue',
    SETTINGS: '/printer/settings',
  },

  QR_CODE: {
    GENERATE: '/qrcode/generate',
    VALIDATE: '/qrcode/validate',
    DOWNLOAD: '/qrcode/download',
  },
} as const;

// 파일 확장자
export const FILE_EXTENSIONS = {
  IMAGE: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  VIDEO: ['.mp4', '.mov', '.avi', '.mkv'],
  DOCUMENT: ['.pdf', '.doc', '.docx', '.txt'],
} as const;

// 정규식 패턴
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$/,
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
  IP_ADDRESS:
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
} as const;
