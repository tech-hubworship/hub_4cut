import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {User, UserPreferences, UserRole} from '../../types';
import {ApiResponse} from '../../types';
import {API_ENDPOINTS, STORAGE_KEYS} from '../../constants';
import {apiService} from '../../services/api';
import {storageService} from '../../services/storage';

// 비동기 액션 생성
export const loginUser = createAsyncThunk(
  'user/login',
  async (credentials: {email: string; password: string}, {rejectWithValue}) => {
    try {
      const response = await apiService.post<ApiResponse<User>>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials,
      );

      if (response.data.success && response.data.data) {
        // 로컬 스토리지에 사용자 정보 저장
        await storageService.setItem(STORAGE_KEYS.USER, response.data.data);
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.message || '로그인에 실패했습니다.',
        );
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '로그인 중 오류가 발생했습니다.');
    }
  },
);

export const logoutUser = createAsyncThunk(
  'user/logout',
  async (_, {rejectWithValue}) => {
    try {
      // 서버에 로그아웃 요청
      await apiService.post(API_ENDPOINTS.AUTH.LOGOUT);

      // 로컬 스토리지에서 사용자 정보 제거
      await storageService.removeItem(STORAGE_KEYS.USER);

      return true;
    } catch (error: any) {
      // 서버 오류가 있어도 로컬 로그아웃은 진행
      await storageService.removeItem(STORAGE_KEYS.USER);
      return rejectWithValue(
        error.message || '로그아웃 중 오류가 발생했습니다.',
      );
    }
  },
);

export const refreshUserToken = createAsyncThunk(
  'user/refreshToken',
  async (_, {rejectWithValue}) => {
    try {
      const response = await apiService.post<ApiResponse<User>>(
        API_ENDPOINTS.AUTH.REFRESH,
      );

      if (response.data.success && response.data.data) {
        // 로컬 스토리지 업데이트
        await storageService.setItem(STORAGE_KEYS.USER, response.data.data);
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.message || '토큰 갱신에 실패했습니다.',
        );
      }
    } catch (error: any) {
      return rejectWithValue(
        error.message || '토큰 갱신 중 오류가 발생했습니다.',
      );
    }
  },
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (updates: Partial<User>, {rejectWithValue}) => {
    try {
      const response = await apiService.put<ApiResponse<User>>(
        API_ENDPOINTS.USER.UPDATE,
        updates,
      );

      if (response.data.success && response.data.data) {
        // 로컬 스토리지 업데이트
        await storageService.setItem(STORAGE_KEYS.USER, response.data.data);
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.message || '프로필 업데이트에 실패했습니다.',
        );
      }
    } catch (error: any) {
      return rejectWithValue(
        error.message || '프로필 업데이트 중 오류가 발생했습니다.',
      );
    }
  },
);

export const updateUserPreferences = createAsyncThunk(
  'user/updatePreferences',
  async (preferences: Partial<UserPreferences>, {rejectWithValue}) => {
    try {
      const response = await apiService.put<ApiResponse<User>>(
        API_ENDPOINTS.USER.PREFERENCES,
        preferences,
      );

      if (response.data.success && response.data.data) {
        // 로컬 스토리지 업데이트
        await storageService.setItem(STORAGE_KEYS.USER, response.data.data);
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.message || '설정 업데이트에 실패했습니다.',
        );
      }
    } catch (error: any) {
      return rejectWithValue(
        error.message || '설정 업데이트 중 오류가 발생했습니다.',
      );
    }
  },
);

export const loadUserFromStorage = createAsyncThunk(
  'user/loadFromStorage',
  async (_, {rejectWithValue}) => {
    try {
      const userData = await storageService.getItem(STORAGE_KEYS.USER);
      if (userData) {
        return JSON.parse(userData) as User;
      }
      return null;
    } catch (error: any) {
      return rejectWithValue('저장된 사용자 정보를 불러올 수 없습니다.');
    }
  },
);

// 초기 상태
const initialState = {
  currentUser: null as User | null,
  isAuthenticated: false,
  isLoading: false,
  error: null as string | null,
  lastActivity: null as Date | null,
};

// 슬라이스 생성
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // 로딩 상태 설정
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // 에러 상태 설정
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // 사용자 정보 부분 업데이트
    updateUserField: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = {...state.currentUser, ...action.payload};
      }
    },

    // 사용자 역할 변경
    changeUserRole: (state, action: PayloadAction<UserRole>) => {
      if (state.currentUser) {
        state.currentUser.role = action.payload;
      }
    },

    // 마지막 활동 시간 업데이트
    updateLastActivity: state => {
      state.lastActivity = new Date();
    },

    // 상태 초기화
    clearUserState: state => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.error = null;
      state.lastActivity = null;
    },
  },

  // 비동기 액션 처리
  extraReducers: builder => {
    // 로그인
    builder
      .addCase(loginUser.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
        state.lastActivity = new Date();
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // 로그아웃
    builder
      .addCase(logoutUser.pending, state => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, state => {
        state.isLoading = false;
        state.currentUser = null;
        state.isAuthenticated = false;
        state.lastActivity = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 토큰 갱신
    builder
      .addCase(refreshUserToken.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshUserToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
        state.lastActivity = new Date();
        state.error = null;
      })
      .addCase(refreshUserToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // 프로필 업데이트
    builder
      .addCase(updateUserProfile.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 설정 업데이트
    builder
      .addCase(updateUserPreferences.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 스토리지에서 로드
    builder
      .addCase(loadUserFromStorage.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.currentUser = action.payload;
          state.isAuthenticated = true;
          state.lastActivity = new Date();
        }
        state.error = null;
      })
      .addCase(loadUserFromStorage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });
  },
});

// 액션 내보내기
export const {
  setLoading,
  setError,
  updateUserField,
  changeUserRole,
  updateLastActivity,
  clearUserState,
} = userSlice.actions;

// 리듀서 내보내기
export default userSlice.reducer;

// 선택자 함수들
export const selectUser = (state: {user: typeof initialState}) =>
  state.user.currentUser;
export const selectIsAuthenticated = (state: {user: typeof initialState}) =>
  state.user.isAuthenticated;
export const selectUserLoading = (state: {user: typeof initialState}) =>
  state.user.isLoading;
export const selectUserError = (state: {user: typeof initialState}) =>
  state.user.error;
export const selectUserRole = (state: {user: typeof initialState}) =>
  state.user.currentUser?.role;
export const selectUserPreferences = (state: {user: typeof initialState}) =>
  state.user.currentUser?.preferences;
