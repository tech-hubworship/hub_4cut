import {createSlice, PayloadAction} from '@reduxjs/toolkit';

// 초기 상태
const initialState = {
  theme: 'light' as 'light' | 'dark',
  language: 'ko' as 'ko' | 'en',
  isLoading: false,
  modal: {
    isVisible: false,
    type: null as string | null,
    data: null as any,
  },
  toast: {
    isVisible: false,
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    duration: 3000,
  },
  navigation: {
    currentRoute: '',
    previousRoute: '',
    navigationHistory: [] as string[],
  },
  sidebar: {
    isOpen: false,
    activeTab: 'main' as string,
  },
  search: {
    query: '',
    isSearching: false,
    searchResults: [] as any[],
    searchFilters: {} as Record<string, any>,
  },
  notifications: {
    unreadCount: 0,
    notifications: [] as any[],
    isEnabled: true,
  },
  accessibility: {
    fontSize: 'normal' as 'small' | 'normal' | 'large',
    highContrast: false,
    reduceMotion: false,
    screenReader: false,
  },
  performance: {
    isLowPowerMode: false,
    animationEnabled: true,
    imageQuality: 'high' as 'low' | 'medium' | 'high',
  },
};

// 슬라이스 생성
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // 테마 변경
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },

    // 언어 변경
    setLanguage: (state, action: PayloadAction<'ko' | 'en'>) => {
      state.language = action.payload;
    },

    // 로딩 상태 설정
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // 모달 표시/숨김
    showModal: (state, action: PayloadAction<{type: string; data?: any}>) => {
      state.modal.isVisible = true;
      state.modal.type = action.payload.type;
      state.modal.data = action.payload.data || null;
    },

    hideModal: state => {
      state.modal.isVisible = false;
      state.modal.type = null;
      state.modal.data = null;
    },

    // 토스트 메시지 표시
    showToast: (
      state,
      action: PayloadAction<{
        message: string;
        type?: 'success' | 'error' | 'warning' | 'info';
        duration?: number;
      }>,
    ) => {
      state.toast.isVisible = true;
      state.toast.message = action.payload.message;
      state.toast.type = action.payload.type || 'info';
      state.toast.duration = action.payload.duration || 3000;
    },

    hideToast: state => {
      state.toast.isVisible = false;
    },

    // 네비게이션 상태 업데이트
    updateNavigation: (
      state,
      action: PayloadAction<{currentRoute: string; previousRoute?: string}>,
    ) => {
      const {currentRoute, previousRoute} = action.payload;

      if (previousRoute) {
        state.navigation.previousRoute = previousRoute;
      } else {
        state.navigation.previousRoute = state.navigation.currentRoute;
      }

      state.navigation.currentRoute = currentRoute;
      state.navigation.navigationHistory.push(currentRoute);

      // 히스토리 길이 제한 (최대 50개)
      if (state.navigation.navigationHistory.length > 50) {
        state.navigation.navigationHistory =
          state.navigation.navigationHistory.slice(-50);
      }
    },

    // 사이드바 상태 변경
    toggleSidebar: state => {
      state.sidebar.isOpen = !state.sidebar.isOpen;
    },

    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebar.isOpen = action.payload;
    },

    setActiveTab: (state, action: PayloadAction<string>) => {
      state.sidebar.activeTab = action.payload;
    },

    // 검색 상태 관리
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.search.query = action.payload;
    },

    setSearching: (state, action: PayloadAction<boolean>) => {
      state.search.isSearching = action.payload;
    },

    setSearchResults: (state, action: PayloadAction<any[]>) => {
      state.search.searchResults = action.payload;
    },

    setSearchFilters: (state, action: PayloadAction<Record<string, any>>) => {
      state.search.searchFilters = action.payload;
    },

    clearSearch: state => {
      state.search.query = '';
      state.search.isSearching = false;
      state.search.searchResults = [];
      state.search.searchFilters = {};
    },

    // 알림 상태 관리
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.notifications.unreadCount = action.payload;
    },

    addNotification: (state, action: PayloadAction<any>) => {
      state.notifications.notifications.unshift(action.payload);

      // 알림 개수 제한 (최대 100개)
      if (state.notifications.notifications.length > 100) {
        state.notifications.notifications =
          state.notifications.notifications.slice(0, 100);
      }

      // 읽지 않은 알림 수 증가
      state.notifications.unreadCount += 1;
    },

    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notificationId = action.payload;
      const notification = state.notifications.notifications.find(
        n => n.id === notificationId,
      );

      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.notifications.unreadCount = Math.max(
          0,
          state.notifications.unreadCount - 1,
        );
      }
    },

    clearNotifications: state => {
      state.notifications.notifications = [];
      state.notifications.unreadCount = 0;
    },

    toggleNotifications: state => {
      state.notifications.isEnabled = !state.notifications.isEnabled;
    },

    // 접근성 설정
    setFontSize: (
      state,
      action: PayloadAction<'small' | 'normal' | 'large'>,
    ) => {
      state.accessibility.fontSize = action.payload;
    },

    toggleHighContrast: state => {
      state.accessibility.highContrast = !state.accessibility.highContrast;
    },

    toggleReduceMotion: state => {
      state.accessibility.reduceMotion = !state.accessibility.reduceMotion;
    },

    toggleScreenReader: state => {
      state.accessibility.screenReader = !state.accessibility.screenReader;
    },

    // 성능 설정
    toggleLowPowerMode: state => {
      state.performance.isLowPowerMode = !state.performance.isLowPowerMode;
    },

    toggleAnimation: state => {
      state.performance.animationEnabled = !state.performance.animationEnabled;
    },

    setImageQuality: (
      state,
      action: PayloadAction<'low' | 'medium' | 'high'>,
    ) => {
      state.performance.imageQuality = action.payload;
    },

    // UI 상태 초기화
    resetUIState: state => {
      state.modal = {
        isVisible: false,
        type: null,
        data: null,
      };
      state.toast = {
        isVisible: false,
        message: '',
        type: 'info',
        duration: 3000,
      };
      state.sidebar = {
        isOpen: false,
        activeTab: 'main',
      };
      state.search = {
        query: '',
        isSearching: false,
        searchResults: [],
        searchFilters: {},
      };
    },

    // 전체 UI 상태 초기화
    clearUIState: state => {
      return {...initialState, theme: state.theme, language: state.language};
    },
  },
});

// 액션 내보내기
export const {
  setTheme,
  setLanguage,
  setLoading,
  showModal,
  hideModal,
  showToast,
  hideToast,
  updateNavigation,
  toggleSidebar,
  setSidebarOpen,
  setActiveTab,
  setSearchQuery,
  setSearching,
  setSearchResults,
  setSearchFilters,
  clearSearch,
  setUnreadCount,
  addNotification,
  markNotificationAsRead,
  clearNotifications,
  toggleNotifications,
  setFontSize,
  toggleHighContrast,
  toggleReduceMotion,
  toggleScreenReader,
  toggleLowPowerMode,
  toggleAnimation,
  setImageQuality,
  resetUIState,
  clearUIState,
} = uiSlice.actions;

// 리듀서 내보내기
export default uiSlice.reducer;

// 선택자 함수들
export const selectTheme = (state: {ui: typeof initialState}) => state.ui.theme;
export const selectLanguage = (state: {ui: typeof initialState}) =>
  state.ui.language;
export const selectUILoading = (state: {ui: typeof initialState}) =>
  state.ui.isLoading;
export const selectModal = (state: {ui: typeof initialState}) => state.ui.modal;
export const selectToast = (state: {ui: typeof initialState}) => state.ui.toast;
export const selectNavigation = (state: {ui: typeof initialState}) =>
  state.ui.navigation;
export const selectSidebar = (state: {ui: typeof initialState}) =>
  state.ui.sidebar;
export const selectSearch = (state: {ui: typeof initialState}) =>
  state.ui.search;
export const selectNotifications = (state: {ui: typeof initialState}) =>
  state.ui.notifications;
export const selectAccessibility = (state: {ui: typeof initialState}) =>
  state.ui.accessibility;
export const selectPerformance = (state: {ui: typeof initialState}) =>
  state.ui.performance;

// 테마 관련 선택자
export const selectIsDarkMode = (state: {ui: typeof initialState}) =>
  state.ui.theme === 'dark';
export const selectIsLightMode = (state: {ui: typeof initialState}) =>
  state.ui.theme === 'light';

// 모달 관련 선택자
export const selectIsModalVisible = (state: {ui: typeof initialState}) =>
  state.ui.modal.isVisible;
export const selectModalType = (state: {ui: typeof initialState}) =>
  state.ui.modal.type;
export const selectModalData = (state: {ui: typeof initialState}) =>
  state.ui.modal.data;

// 토스트 관련 선택자
export const selectIsToastVisible = (state: {ui: typeof initialState}) =>
  state.ui.toast.isVisible;
export const selectToastMessage = (state: {ui: typeof initialState}) =>
  state.ui.toast.message;
export const selectToastType = (state: {ui: typeof initialState}) =>
  state.ui.toast.type;

// 사이드바 관련 선택자
export const selectIsSidebarOpen = (state: {ui: typeof initialState}) =>
  state.ui.sidebar.isOpen;
export const selectActiveSidebarTab = (state: {ui: typeof initialState}) =>
  state.ui.sidebar.activeTab;

// 검색 관련 선택자
export const selectSearchQuery = (state: {ui: typeof initialState}) =>
  state.ui.search.query;
export const selectIsSearching = (state: {ui: typeof initialState}) =>
  state.ui.search.isSearching;
export const selectSearchResults = (state: {ui: typeof initialState}) =>
  state.ui.search.searchResults;
export const selectSearchFilters = (state: {ui: typeof initialState}) =>
  state.ui.search.searchFilters;

// 알림 관련 선택자
export const selectUnreadNotificationCount = (state: {
  ui: typeof initialState;
}) => state.ui.notifications.unreadCount;
export const selectAllNotifications = (state: {ui: typeof initialState}) =>
  state.ui.notifications.notifications;
export const selectNotificationsEnabled = (state: {ui: typeof initialState}) =>
  state.ui.notifications.isEnabled;

// 접근성 관련 선택자
export const selectFontSize = (state: {ui: typeof initialState}) =>
  state.ui.accessibility.fontSize;
export const selectHighContrast = (state: {ui: typeof initialState}) =>
  state.ui.accessibility.highContrast;
export const selectReduceMotion = (state: {ui: typeof initialState}) =>
  state.ui.accessibility.reduceMotion;
export const selectScreenReader = (state: {ui: typeof initialState}) =>
  state.ui.accessibility.screenReader;

// 성능 관련 선택자
export const selectLowPowerMode = (state: {ui: typeof initialState}) =>
  state.ui.performance.isLowPowerMode;
export const selectAnimationEnabled = (state: {ui: typeof initialState}) =>
  state.ui.performance.animationEnabled;
export const selectImageQuality = (state: {ui: typeof initialState}) =>
  state.ui.performance.imageQuality;
