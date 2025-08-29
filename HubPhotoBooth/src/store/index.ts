import {configureStore} from '@reduxjs/toolkit';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import userReducer from './slices/userSlice';
import photoReducer from './slices/photoSlice';
import frameReducer from './slices/frameSlice';
import printerReducer from './slices/printerSlice';
import uiReducer from './slices/uiSlice';

// 스토어 설정
export const store = configureStore({
  reducer: {
    user: userReducer,
    photos: photoReducer,
    frames: frameReducer,
    printer: printerReducer,
    ui: uiReducer,
  },

  // 미들웨어 설정
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Date 객체 직렬화 허용
        ignoredActions: ['photos/setPhotos', 'photos/setCurrentPhoto'],
        ignoredPaths: ['photos.photos', 'photos.currentPhoto'],
      },
    }),

  // 개발 도구 설정
  devTools: __DEV__,
});

// 타입 정의
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// 커스텀 훅
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// 스토어 내보내기
export default store;
