import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {Photo, PhotoStatus, PrintSettings} from '../../types';
import {ApiResponse} from '../../types';
import {API_ENDPOINTS} from '../../constants';
import {apiService} from '../../services/api';

// 비동기 액션 생성
export const createPhoto = createAsyncThunk(
  'photos/create',
  async (photoData: Partial<Photo>, {rejectWithValue}) => {
    try {
      const response = await apiService.post<ApiResponse<Photo>>(
        API_ENDPOINTS.PHOTO.CREATE,
        photoData,
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.message || '사진 생성에 실패했습니다.',
        );
      }
    } catch (error: any) {
      return rejectWithValue(
        error.message || '사진 생성 중 오류가 발생했습니다.',
      );
    }
  },
);

export const updatePhoto = createAsyncThunk(
  'photos/update',
  async (
    {photoId, updates}: {photoId: string; updates: Partial<Photo>},
    {rejectWithValue},
  ) => {
    try {
      const response = await apiService.put<ApiResponse<Photo>>(
        `${API_ENDPOINTS.PHOTO.UPDATE}/${photoId}`,
        updates,
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.message || '사진 업데이트에 실패했습니다.',
        );
      }
    } catch (error: any) {
      return rejectWithValue(
        error.message || '사진 업데이트 중 오류가 발생했습니다.',
      );
    }
  },
);

export const deletePhoto = createAsyncThunk(
  'photos/delete',
  async (photoId: string, {rejectWithValue}) => {
    try {
      const response = await apiService.delete<ApiResponse<boolean>>(
        `${API_ENDPOINTS.PHOTO.DELETE}/${photoId}`,
      );

      if (response.data.success) {
        return photoId;
      } else {
        return rejectWithValue(
          response.data.message || '사진 삭제에 실패했습니다.',
        );
      }
    } catch (error: any) {
      return rejectWithValue(
        error.message || '사진 삭제 중 오류가 발생했습니다.',
      );
    }
  },
);

export const fetchPhotos = createAsyncThunk(
  'photos/fetchAll',
  async (_, {rejectWithValue}) => {
    try {
      const response = await apiService.get<ApiResponse<Photo[]>>(
        API_ENDPOINTS.PHOTO.LIST,
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.message || '사진 목록을 가져올 수 없습니다.',
        );
      }
    } catch (error: any) {
      return rejectWithValue(
        error.message || '사진 목록을 가져오는 중 오류가 발생했습니다.',
      );
    }
  },
);

export const uploadPhotoImage = createAsyncThunk(
  'photos/uploadImage',
  async (
    {photoId, imageFile}: {photoId: string; imageFile: File},
    {rejectWithValue},
  ) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await apiService.uploadFile<ApiResponse<Photo>>(
        `${API_ENDPOINTS.PHOTO.UPLOAD}/${photoId}`,
        formData,
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.message || '이미지 업로드에 실패했습니다.',
        );
      }
    } catch (error: any) {
      return rejectWithValue(
        error.message || '이미지 업로드 중 오류가 발생했습니다.',
      );
    }
  },
);

export const updatePhotoStatus = createAsyncThunk(
  'photos/updateStatus',
  async (
    {photoId, status}: {photoId: string; status: PhotoStatus},
    {rejectWithValue},
  ) => {
    try {
      const response = await apiService.patch<ApiResponse<Photo>>(
        `${API_ENDPOINTS.PHOTO.UPDATE}/${photoId}`,
        {status},
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.message || '상태 업데이트에 실패했습니다.',
        );
      }
    } catch (error: any) {
      return rejectWithValue(
        error.message || '상태 업데이트 중 오류가 발생했습니다.',
      );
    }
  },
);

export const updatePrintSettings = createAsyncThunk(
  'photos/updatePrintSettings',
  async (
    {photoId, printSettings}: {photoId: string; printSettings: PrintSettings},
    {rejectWithValue},
  ) => {
    try {
      const response = await apiService.patch<ApiResponse<Photo>>(
        `${API_ENDPOINTS.PHOTO.UPDATE}/${photoId}`,
        {printSettings},
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.message || '프린트 설정 업데이트에 실패했습니다.',
        );
      }
    } catch (error: any) {
      return rejectWithValue(
        error.message || '프린트 설정 업데이트 중 오류가 발생했습니다.',
      );
    }
  },
);

// 초기 상태
const initialState = {
  photos: [] as Photo[],
  currentPhoto: null as Photo | null,
  isLoading: false,
  error: null as string | null,
  selectedPhotos: [] as string[],
  filter: {
    status: null as PhotoStatus | null,
    frameId: null as string | null,
    dateRange: null as {start: Date; end: Date} | null,
  },
  sortBy: 'createdAt' as 'createdAt' | 'updatedAt' | 'status',
  sortOrder: 'desc' as 'asc' | 'desc',
};

// 슬라이스 생성
const photoSlice = createSlice({
  name: 'photos',
  initialState,
  reducers: {
    // 현재 사진 설정
    setCurrentPhoto: (state, action: PayloadAction<Photo | null>) => {
      state.currentPhoto = action.payload;
    },

    // 사진 선택/해제
    togglePhotoSelection: (state, action: PayloadAction<string>) => {
      const photoId = action.payload;
      const index = state.selectedPhotos.indexOf(photoId);

      if (index > -1) {
        state.selectedPhotos.splice(index, 1);
      } else {
        state.selectedPhotos.push(photoId);
      }
    },

    // 모든 사진 선택/해제
    toggleAllPhotosSelection: (state, action: PayloadAction<boolean>) => {
      if (action.payload) {
        state.selectedPhotos = state.photos.map(photo => photo.id);
      } else {
        state.selectedPhotos = [];
      }
    },

    // 필터 설정
    setFilter: (state, action: PayloadAction<Partial<typeof state.filter>>) => {
      state.filter = {...state.filter, ...action.payload};
    },

    // 정렬 설정
    setSorting: (
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
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // 에러 상태 설정
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // 사진 상태 초기화
    clearPhotoState: state => {
      state.currentPhoto = null;
      state.selectedPhotos = [];
      state.filter = {
        status: null,
        frameId: null,
        dateRange: null,
      };
      state.sortBy = 'createdAt';
      state.sortOrder = 'desc';
    },
  },

  // 비동기 액션 처리
  extraReducers: builder => {
    // 사진 생성
    builder
      .addCase(createPhoto.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPhoto.fulfilled, (state, action) => {
        state.isLoading = false;
        state.photos.unshift(action.payload);
        state.currentPhoto = action.payload;
        state.error = null;
      })
      .addCase(createPhoto.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 사진 업데이트
    builder
      .addCase(updatePhoto.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePhoto.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedPhoto = action.payload;
        const index = state.photos.findIndex(
          photo => photo.id === updatedPhoto.id,
        );

        if (index !== -1) {
          state.photos[index] = updatedPhoto;
        }

        if (state.currentPhoto?.id === updatedPhoto.id) {
          state.currentPhoto = updatedPhoto;
        }

        state.error = null;
      })
      .addCase(updatePhoto.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 사진 삭제
    builder
      .addCase(deletePhoto.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePhoto.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedPhotoId = action.payload;

        state.photos = state.photos.filter(
          photo => photo.id !== deletedPhotoId,
        );

        if (state.currentPhoto?.id === deletedPhotoId) {
          state.currentPhoto = null;
        }

        state.selectedPhotos = state.selectedPhotos.filter(
          id => id !== deletedPhotoId,
        );
        state.error = null;
      })
      .addCase(deletePhoto.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 사진 목록 가져오기
    builder
      .addCase(fetchPhotos.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPhotos.fulfilled, (state, action) => {
        state.isLoading = false;
        state.photos = action.payload;
        state.error = null;
      })
      .addCase(fetchPhotos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 이미지 업로드
    builder
      .addCase(uploadPhotoImage.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadPhotoImage.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedPhoto = action.payload;
        const index = state.photos.findIndex(
          photo => photo.id === updatedPhoto.id,
        );

        if (index !== -1) {
          state.photos[index] = updatedPhoto;
        }

        if (state.currentPhoto?.id === updatedPhoto.id) {
          state.currentPhoto = updatedPhoto;
        }

        state.error = null;
      })
      .addCase(uploadPhotoImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 상태 업데이트
    builder
      .addCase(updatePhotoStatus.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePhotoStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedPhoto = action.payload;
        const index = state.photos.findIndex(
          photo => photo.id === updatedPhoto.id,
        );

        if (index !== -1) {
          state.photos[index] = updatedPhoto;
        }

        if (state.currentPhoto?.id === updatedPhoto.id) {
          state.currentPhoto = updatedPhoto;
        }

        state.error = null;
      })
      .addCase(updatePhotoStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 프린트 설정 업데이트
    builder
      .addCase(updatePrintSettings.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePrintSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedPhoto = action.payload;
        const index = state.photos.findIndex(
          photo => photo.id === updatedPhoto.id,
        );

        if (index !== -1) {
          state.photos[index] = updatedPhoto;
        }

        if (state.currentPhoto?.id === updatedPhoto.id) {
          state.currentPhoto = updatedPhoto;
        }

        state.error = null;
      })
      .addCase(updatePrintSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// 액션 내보내기
export const {
  setCurrentPhoto,
  togglePhotoSelection,
  toggleAllPhotosSelection,
  setFilter,
  setSorting,
  setLoading,
  setError,
  clearPhotoState,
} = photoSlice.actions;

// 리듀서 내보내기
export default photoSlice.reducer;

// 선택자 함수들
export const selectPhotos = (state: {photos: typeof initialState}) =>
  state.photos.photos;
export const selectCurrentPhoto = (state: {photos: typeof initialState}) =>
  state.photos.currentPhoto;
export const selectPhotoLoading = (state: {photos: typeof initialState}) =>
  state.photos.isLoading;
export const selectPhotoError = (state: {photos: typeof initialState}) =>
  state.photos.error;
export const selectSelectedPhotos = (state: {photos: typeof initialState}) =>
  state.photos.selectedPhotos;
export const selectPhotoFilter = (state: {photos: typeof initialState}) =>
  state.photos.filter;
export const selectPhotoSorting = (state: {photos: typeof initialState}) => ({
  sortBy: state.photos.sortBy,
  sortOrder: state.photos.sortOrder,
});

// 필터링된 사진 선택자
export const selectFilteredPhotos = (state: {photos: typeof initialState}) => {
  const {photos, filter, sortBy, sortOrder} = state.photos;

  let filteredPhotos = [...photos];

  // 상태별 필터링
  if (filter.status) {
    filteredPhotos = filteredPhotos.filter(
      photo => photo.status === filter.status,
    );
  }

  // 프레임별 필터링
  if (filter.frameId) {
    filteredPhotos = filteredPhotos.filter(
      photo => photo.frameId === filter.frameId,
    );
  }

  // 날짜 범위별 필터링
  if (filter.dateRange) {
    filteredPhotos = filteredPhotos.filter(photo => {
      const photoDate = new Date(photo.createdAt);
      return (
        photoDate >= filter.dateRange!.start &&
        photoDate <= filter.dateRange!.end
      );
    });
  }

  // 정렬
  filteredPhotos.sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return filteredPhotos;
};
