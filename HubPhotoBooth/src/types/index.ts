// 기본 타입 정의
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// 사용자 관련 타입
export interface User extends BaseEntity {
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;
  preferences: UserPreferences;
}

export enum UserRole {
  ADMIN = 'admin',
  OPERATOR = 'operator',
  USER = 'user',
}

export interface UserPreferences {
  language: 'ko' | 'en';
  theme: 'light' | 'dark';
  notifications: boolean;
}

// 사진 관련 타입
export interface Photo extends BaseEntity {
  userId: string;
  frameId: string;
  imageUrls: string[];
  thumbnailUrl: string;
  status: PhotoStatus;
  printSettings: PrintSettings;
  metadata: PhotoMetadata;
}

export enum PhotoStatus {
  CAPTURED = 'captured',
  EDITING = 'editing',
  READY_TO_PRINT = 'ready_to_print',
  PRINTING = 'printing',
  PRINTED = 'printed',
  ERROR = 'error',
}

export interface PhotoMetadata {
  width: number;
  height: number;
  fileSize: number;
  format: 'JPEG' | 'PNG';
  location?: {
    latitude: number;
    longitude: number;
  };
  tags: string[];
}

// 프레임 관련 타입
export interface Frame extends BaseEntity {
  name: string;
  description: string;
  category: FrameCategory;
  season?: Season;
  event?: HubEvent;
  imageUrl: string;
  thumbnailUrl: string;
  isActive: boolean;
  sortOrder: number;
}

export enum FrameCategory {
  SEASONAL = 'seasonal',
  EVENT = 'event',
  SPECIAL = 'special',
  BASIC = 'basic',
}

export enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  AUTUMN = 'autumn',
  WINTER = 'winter',
}

export enum HubEvent {
  CHRISTMAS = 'christmas',
  EASTER = 'easter',
  THANKSGIVING = 'thanksgiving',
  BAPTISM = 'baptism',
  WEDDING = 'wedding',
  BIBLE_STUDY = 'bible_study',
  YOUTH_GROUP = 'youth_group',
}

// 프린트 관련 타입
export interface PrintSettings {
  paperSize: PaperSize;
  quality: PrintQuality;
  copies: number;
  layout: PrintLayout;
  border: boolean;
}

export enum PaperSize {
  FOUR_BY_SIX = '4x6',
  FIVE_BY_SEVEN = '5x7',
  SIX_BY_EIGHT = '6x8',
}

export enum PrintQuality {
  DRAFT = 'draft',
  NORMAL = 'normal',
  HIGH = 'high',
  PREMIUM = 'premium',
}

export enum PrintLayout {
  GRID_2X2 = '2x2',
  GRID_3X3 = '3x3',
  STRIP_4 = 'strip4',
}

// 프린터 관련 타입
export interface Printer extends BaseEntity {
  name: string;
  model: string;
  ipAddress: string;
  port: number;
  status: PrinterStatus;
  currentJob?: PrintJob;
  queue: PrintJob[];
  settings: PrinterSettings;
}

export enum PrinterStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  BUSY = 'busy',
  ERROR = 'error',
  MAINTENANCE = 'maintenance',
}

export interface PrintJob extends BaseEntity {
  photoId: string;
  userId: string;
  status: PrintJobStatus;
  priority: number;
  estimatedTime: number;
  errorMessage?: string;
}

export enum PrintJobStatus {
  QUEUED = 'queued',
  PROCESSING = 'processing',
  PRINTING = 'printing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface PrinterSettings {
  defaultPaperSize: PaperSize;
  defaultQuality: PrintQuality;
  autoCut: boolean;
  autoEject: boolean;
  maxCopies: number;
}

// QR 코드 관련 타입
export interface QRCode extends BaseEntity {
  photoId: string;
  userId: string;
  code: string;
  downloadUrl: string;
  expiresAt: Date;
  isExpired: boolean;
  downloadCount: number;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 네비게이션 타입
export type RootStackParamList = {
  Splash: undefined;
  Main: undefined;
  PhotoCapture: undefined;
  CameraCapture: {
    selectedFrame?: string;
    basicFrameType?: '2x6' | '4x6';
  };
  FrameSelection: {
    frameType?: string;
  };
  CutTypeSelection: {
    frameType?: string;
  };
  PhotoEdit: {
    photos: string[];
    selectedFrame?: string;
  };
  FramePreview: {
    photos: string[];
    selectedFrame?: string;
  };
  PrintSettings: undefined;
  QRCode: undefined;
  Settings: undefined;
  Profile: undefined;
};

export interface PhotoFrameTemplate {
  id: string;
  name: string;
  category: string;
  imagePath: string;
  frameDescription?: string;
}

export interface FrameTemplateCategory {
  id: string;
  name: string;
  frames: PhotoFrameTemplate[];
}

// 상태 관리 타입
export interface AppState {
  user: UserState;
  photos: PhotoState;
  frames: FrameState;
  printer: PrinterState;
  ui: UIState;
}

export interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface PhotoState {
  photos: Photo[];
  currentPhoto: Photo | null;
  isLoading: boolean;
  error: string | null;
}

export interface FrameState {
  frames: Frame[];
  selectedFrame: Frame | null;
  isLoading: boolean;
  error: string | null;
}

export interface PrinterState {
  printers: Printer[];
  selectedPrinter: Printer | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface UIState {
  theme: 'light' | 'dark';
  language: 'ko' | 'en';
  isLoading: boolean;
  modal: {
    isVisible: boolean;
    type: string | null;
    data: any;
  };
}

// 유틸리티 타입
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// 이벤트 타입
export interface AppEvent {
  type: string;
  payload: any;
  timestamp: Date;
  userId?: string;
}

// 에러 타입
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  userId?: string;
}
