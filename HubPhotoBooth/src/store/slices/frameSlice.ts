import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {Frame, FrameCategory, Season, HubEvent} from '../../types';
import {ApiResponse} from '../../types';
import {API_ENDPOINTS} from '../../constants';
import {apiService} from '../../services/api';

// 비동기 액션 생성
export const fetchFrames = createAsyncThunk(
  'frames/fetchAll',
  async (_, {rejectWithValue}) => {
    try {
      const response = await apiService.get<ApiResponse<Frame[]>>(
        API_ENDPOINTS.FRAME.LIST,
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.message || '프레임 목록을 가져올 수 없습니다.',
        );
      }
    } catch (error: any) {
      return rejectWithValue(
        error.message || '프레임 목록을 가져오는 중 오류가 발생했습니다.',
      );
    }
  },
);

export const fetchFramesByCategory = createAsyncThunk(
  'frames/fetchByCategory',
  async (category: FrameCategory, {rejectWithValue}) => {
    try {
      const response = await apiService.get<ApiResponse<Frame[]>>(
        `${API_ENDPOINTS.FRAME.CATEGORY}/${category}`,
      );

      if (response.data.success && response.data.data) {
        return {category, frames: response.data.data};
      } else {
        return rejectWithValue(
          response.data.message || '카테고리별 프레임을 가져올 수 없습니다.',
        );
      }
    } catch (error: any) {
      return rejectWithValue(
        error.message || '카테고리별 프레임을 가져오는 중 오류가 발생했습니다.',
      );
    }
  },
);

export const fetchFramesBySeason = createAsyncThunk(
  'frames/fetchBySeason',
  async (season: Season, {rejectWithValue}) => {
    try {
      const response = await apiService.get<ApiResponse<Frame[]>>(
        `${API_ENDPOINTS.FRAME.SEASON}/${season}`,
      );

      if (response.data.success && response.data.data) {
        return {season, frames: response.data.data};
      } else {
        return rejectWithValue(
          response.data.message || '계절별 프레임을 가져올 수 없습니다.',
        );
      }
    } catch (error: any) {
      return rejectWithValue(
        error.message || '계절별 프레임을 가져오는 중 오류가 발생했습니다.',
      );
    }
  },
);

export const fetchFramesByEvent = createAsyncThunk(
  'frames/fetchByEvent',
  async (event: HubEvent, {rejectWithValue}) => {
    try {
      const response = await apiService.get<ApiResponse<Frame[]>>(
        `${API_ENDPOINTS.FRAME.EVENT}/${event}`,
      );

      if (response.data.success && response.data.data) {
        return {event, frames: response.data.data};
      } else {
        return rejectWithValue(
          response.data.message || '이벤트별 프레임을 가져올 수 없습니다.',
        );
      }
    } catch (error: any) {
      return rejectWithValue(
        error.message || '이벤트별 프레임을 가져오는 중 오류가 발생했습니다.',
      );
    }
  },
);

// 초기 상태
const initialState = {
  frames: [] as Frame[],
  selectedFrame: null as Frame | null,
  isLoading: false,
  error: null as string | null,
  categories: {
    seasonal: [] as Frame[],
    event: [] as Frame[],
    special: [] as Frame[],
    basic: [] as Frame[],
  },
  seasons: {
    spring: [] as Frame[],
    summer: [] as Frame[],
    autumn: [] as Frame[],
    winter: [] as Frame[],
  },
  events: {
    christmas: [] as Frame[],
    easter: [] as Frame[],
    thanksgiving: [] as Frame[],
    baptism: [] as Frame[],
    wedding: [] as Frame[],
    bible_study: [] as Frame[],
    youth_group: [] as Frame[],
  },
  filter: {
    category: null as FrameCategory | null,
    season: null as Season | null,
    event: null as HubEvent | null,
    isActive: true,
  },
  sortBy: 'sortOrder' as 'sortOrder' | 'name' | 'createdAt',
  sortOrder: 'asc' as 'asc' | 'desc',
};

// 슬라이스 생성
const frameSlice = createSlice({
  name: 'frames',
  initialState,
  reducers: {
    // 선택된 프레임 설정
    setSelectedFrame: (state, action: PayloadAction<Frame | null>) => {
      state.selectedFrame = action.payload;
    },

    // 프레임 필터 설정
    setFrameFilter: (
      state,
      action: PayloadAction<Partial<typeof state.filter>>,
    ) => {
      state.filter = {...state.filter, ...action.payload};
    },

    // 정렬 설정
    setFrameSorting: (
      state,
      action: PayloadAction<{
        sortBy: typeof state.sortBy;
        sortOrder: typeof state.sortOrder;
      }>,
    ) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },

    // 로딩 상태 설정
    setFrameLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // 에러 상태 설정
    setFrameError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // 프레임 상태 초기화
    clearFrameState: state => {
      state.selectedFrame = null;
      state.filter = {
        category: null,
        season: null,
        event: null,
        isActive: true,
      };
      state.sortBy = 'sortOrder';
      state.sortOrder = 'asc';
    },

    // 프레임 활성화/비활성화
    toggleFrameActive: (state, action: PayloadAction<string>) => {
      const frameId = action.payload;
      const frame = state.frames.find(f => f.id === frameId);
      if (frame) {
        frame.isActive = !frame.isActive;
      }
    },

    // 프레임 정렬 순서 변경
    updateFrameSortOrder: (
      state,
      action: PayloadAction<{frameId: string; newOrder: number}>,
    ) => {
      const {frameId, newOrder} = action.payload;
      const frame = state.frames.find(f => f.id === frameId);
      if (frame) {
        frame.sortOrder = newOrder;
      }
    },
  },

  // 비동기 액션 처리
  extraReducers: builder => {
    // 전체 프레임 가져오기
    builder
      .addCase(fetchFrames.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFrames.fulfilled, (state, action) => {
        state.isLoading = false;
        state.frames = action.payload;

        // 카테고리별로 분류
        state.categories = {
          seasonal: action.payload.filter(
            frame => frame.category === 'seasonal',
          ),
          event: action.payload.filter(frame => frame.category === 'event'),
          special: action.payload.filter(frame => frame.category === 'special'),
          basic: action.payload.filter(frame => frame.category === 'basic'),
        };

        // 계절별로 분류
        state.seasons = {
          spring: action.payload.filter(frame => frame.season === 'spring'),
          summer: action.payload.filter(frame => frame.season === 'summer'),
          autumn: action.payload.filter(frame => frame.season === 'autumn'),
          winter: action.payload.filter(frame => frame.season === 'winter'),
        };

        // 이벤트별로 분류
        state.events = {
          christmas: action.payload.filter(
            frame => frame.event === 'christmas',
          ),
          easter: action.payload.filter(frame => frame.event === 'easter'),
          thanksgiving: action.payload.filter(
            frame => frame.event === 'thanksgiving',
          ),
          baptism: action.payload.filter(frame => frame.event === 'baptism'),
          wedding: action.payload.filter(frame => frame.event === 'wedding'),
          bible_study: action.payload.filter(
            frame => frame.event === 'bible_study',
          ),
          youth_group: action.payload.filter(
            frame => frame.event === 'youth_group',
          ),
        };

        state.error = null;
      })
      .addCase(fetchFrames.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 카테고리별 프레임 가져오기
    builder
      .addCase(fetchFramesByCategory.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFramesByCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        const {category, frames} = action.payload;
        state.categories[category] = frames;
        state.error = null;
      })
      .addCase(fetchFramesByCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 계절별 프레임 가져오기
    builder
      .addCase(fetchFramesBySeason.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFramesBySeason.fulfilled, (state, action) => {
        state.isLoading = false;
        const {season, frames} = action.payload;
        state.seasons[season] = frames;
        state.error = null;
      })
      .addCase(fetchFramesBySeason.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 이벤트별 프레임 가져오기
    builder
      .addCase(fetchFramesByEvent.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFramesByEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        const {event, frames} = action.payload;
        state.events[event] = frames;
        state.error = null;
      })
      .addCase(fetchFramesByEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// 액션 내보내기
export const {
  setSelectedFrame,
  setFrameFilter,
  setFrameSorting,
  setFrameLoading,
  setFrameError,
  clearFrameState,
  toggleFrameActive,
  updateFrameSortOrder,
} = frameSlice.actions;

// 리듀서 내보내기
export default frameSlice.reducer;

// 선택자 함수들
export const selectFrames = (state: {frames: typeof initialState}) =>
  state.frames.frames;
export const selectSelectedFrame = (state: {frames: typeof initialState}) =>
  state.frames.selectedFrame;
export const selectFrameLoading = (state: {frames: typeof initialState}) =>
  state.frames.isLoading;
export const selectFrameError = (state: {frames: typeof initialState}) =>
  state.frames.error;
export const selectFrameCategories = (state: {frames: typeof initialState}) =>
  state.frames.categories;
export const selectFrameSeasons = (state: {frames: typeof initialState}) =>
  state.frames.seasons;
export const selectFrameEvents = (state: {frames: typeof initialState}) =>
  state.frames.events;
export const selectFrameFilter = (state: {frames: typeof initialState}) =>
  state.frames.filter;
export const selectFrameSorting = (state: {frames: typeof initialState}) => ({
  sortBy: state.frames.sortBy,
  sortOrder: state.frames.sortOrder,
});

// 활성 프레임만 선택
export const selectActiveFrames = (state: {frames: typeof initialState}) =>
  state.frames.frames.filter(frame => frame.isActive);

// 카테고리별 활성 프레임 선택
export const selectActiveFramesByCategory = (
  state: {frames: typeof initialState},
  category: FrameCategory,
) => state.frames.categories[category].filter(frame => frame.isActive);

// 계절별 활성 프레임 선택
export const selectActiveFramesBySeason = (
  state: {frames: typeof initialState},
  season: Season,
) => state.frames.seasons[season].filter(frame => frame.isActive);

// 이벤트별 활성 프레임 선택
export const selectActiveFramesByEvent = (
  state: {frames: typeof initialState},
  event: HubEvent,
) => state.frames.events[event].filter(frame => frame.isActive);

// 필터링된 프레임 선택자
export const selectFilteredFrames = (state: {frames: typeof initialState}) => {
  const {frames, filter, sortBy, sortOrder} = state.frames;

  let filteredFrames = [...frames];

  // 활성 상태 필터링
  if (filter.isActive !== null) {
    filteredFrames = filteredFrames.filter(
      frame => frame.isActive === filter.isActive,
    );
  }

  // 카테고리별 필터링
  if (filter.category) {
    filteredFrames = filteredFrames.filter(
      frame => frame.category === filter.category,
    );
  }

  // 계절별 필터링
  if (filter.season) {
    filteredFrames = filteredFrames.filter(
      frame => frame.season === filter.season,
    );
  }

  // 이벤트별 필터링
  if (filter.event) {
    filteredFrames = filteredFrames.filter(
      frame => frame.event === filter.event,
    );
  }

  // 정렬
  filteredFrames.sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return filteredFrames;
};
