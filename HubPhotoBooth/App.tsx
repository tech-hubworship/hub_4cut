/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';
import React, {useEffect} from 'react';
import {StatusBar, LogBox} from 'react-native';
import {Provider} from 'react-redux';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {animationConfigs} from './src/utils/animations';

// Redux 스토어
import store from './src/store';

// 네비게이션 타입
import {RootStackParamList} from './src/types';

// 화면 컴포넌트들
import SplashScreen from './src/screens/SplashScreen';
import MainScreen from './src/screens/MainScreen';
import PhotoCaptureScreen from './src/screens/PhotoCaptureScreen';
import CameraCaptureScreen from './src/screens/CameraCaptureScreen';
import Grid2x2CameraCaptureScreen from './src/screens/Grid2x2CameraCaptureScreen';
import Vertical4CutCameraCaptureScreen from './src/screens/Vertical4CutCameraCaptureScreen';
import SpecialFrameThemeSelectionScreen from './src/screens/SpecialFrameThemeSelectionScreen';
import SpecialFrameCameraCaptureScreen from './src/screens/SpecialFrameCameraCaptureScreen';
import PhotoEditScreen from './src/screens/PhotoEditScreen';
import FrameSelection from './src/screens/FrameSelection';
import FrameThemeSelectionScreen from './src/screens/FrameThemeSelectionScreen';
import FramePreviewScreen from './src/screens/FramePreviewScreen';
import PrintingScreen from './src/screens/PrintingScreen';
import PrintSettingsScreen from './src/screens/PrintSettingsScreen';
import QRCodeScreen from './src/screens/QRCodeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// 상수
import {COLORS, APP_CONFIG} from './src/constants/index';

// 네비게이션 스택 생성
const Stack = createStackNavigator<RootStackParamList>();

// 경고 메시지 무시 (개발 중에만 사용)
if (__DEV__) {
  LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
    'AsyncStorage has been extracted from react-native core',
  ]);
}

// 메인 앱 컴포넌트
const App: React.FC = () => {
  useEffect(() => {
    // 앱 초기화 로직
    console.log(`${APP_CONFIG.NAME} v${APP_CONFIG.VERSION} 시작됨`);
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar
            barStyle="light-content"
            backgroundColor={COLORS.PRIMARY.PURPLE}
            translucent={false}
          />
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
              headerShown: false,
              cardStyleInterpolator: ({current, layouts}) => {
                return {
                  cardStyle: {
                    transform: [
                      {
                        translateX: current.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [layouts.screen.width, 0],
                        }),
                      },
                    ],
                  },
                };
              },
              transitionSpec: {
                open: {
                  animation: 'timing',
                  config: {
                    duration: 300,
                  },
                },
                close: {
                  animation: 'timing',
                  config: {
                    duration: 250,
                  },
                },
              },
              cardStyle: {
                backgroundColor: 'transparent',
              },
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              gestureResponseDistance: 50,
            }}>
            {/* 스플래시 화면 */}
            <Stack.Screen
              name="Splash"
              component={SplashScreen}
              options={{
                gestureEnabled: false,
                ...animationConfigs.default,
              }}
            />

            {/* 메인 화면 */}
            <Stack.Screen
              name="Main"
              component={MainScreen}
              options={{
                gestureEnabled: false,
                cardStyleInterpolator: ({current}) => ({
                  cardStyle: {
                    opacity: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  },
                }),
                transitionSpec: {
                  open: {
                    animation: 'timing',
                    config: {
                      duration: 800,
                    },
                  },
                  close: {
                    animation: 'timing',
                    config: {
                      duration: 300,
                    },
                  },
                },
                cardStyle: {
                  backgroundColor: 'transparent',
                },
              }}
            />

            {/* 사진 촬영 화면 */}
            <Stack.Screen
              name="PhotoCapture"
              component={PhotoCaptureScreen}
              options={{
                gestureEnabled: true,
                presentation: 'modal',
                ...animationConfigs.modal,
              }}
            />

            {/* 카메라 촬영 화면 */}
            <Stack.Screen
              name="CameraCapture"
              component={CameraCaptureScreen}
              options={{
                gestureEnabled: true,
                presentation: 'modal',
                ...animationConfigs.camera,
              }}
            />

            {/* 2x2 그리드 카메라 촬영 화면 */}
            <Stack.Screen
              name="Grid2x2CameraCapture"
              component={Grid2x2CameraCaptureScreen}
              options={{
                gestureEnabled: true,
                presentation: 'modal',
                ...animationConfigs.camera,
              }}
            />

            {/* 세로 4컷 카메라 촬영 화면 */}
            <Stack.Screen
              name="Vertical4CutCameraCapture"
              component={Vertical4CutCameraCaptureScreen}
              options={{
                gestureEnabled: true,
                presentation: 'modal',
                ...animationConfigs.camera,
              }}
            />

            {/* 특수 프레임 테마 선택 화면 */}
            <Stack.Screen
              name="SpecialFrameThemeSelection"
              component={SpecialFrameThemeSelectionScreen}
              options={{
                gestureEnabled: true,
                ...animationConfigs.default,
              }}
            />

            {/* 특수 프레임 카메라 촬영 화면 */}
            <Stack.Screen
              name="SpecialFrameCameraCapture"
              component={SpecialFrameCameraCaptureScreen}
              options={{
                gestureEnabled: true,
                presentation: 'modal',
                ...animationConfigs.camera,
              }}
            />

            {/* 프레임 선택 화면 */}
            <Stack.Screen
              name="FrameSelection"
              component={FrameSelection}
              options={{
                gestureEnabled: true,
                presentation: 'modal',
                ...animationConfigs.modal,
              }}
            />


            {/* 프레임 미리보기 화면 */}
            <Stack.Screen
              name="FramePreview"
              component={FramePreviewScreen}
              options={{
                gestureEnabled: true,
                presentation: 'modal',
                ...animationConfigs.preview,
              }}
            />

            {/* 사진 편집 화면 */}
            <Stack.Screen
              name="PhotoEdit"
              component={PhotoEditScreen}
              options={{
                gestureEnabled: true,
                presentation: 'modal',
                ...animationConfigs.edit,
              }}
            />

            {/* 프레임 테마 선택 화면 */}
            <Stack.Screen
              name="FrameThemeSelection"
              component={FrameThemeSelectionScreen}
              options={{
                gestureEnabled: true,
                presentation: 'modal',
                ...animationConfigs.modal,
              }}
            />

            {/* 인화 중 화면 */}
            <Stack.Screen
              name="Printing"
              component={PrintingScreen}
              options={{
                gestureEnabled: false,
                presentation: 'modal',
                ...animationConfigs.modal,
              }}
            />

            {/* 프린트 설정 화면 */}
            <Stack.Screen
              name="PrintSettings"
              component={PrintSettingsScreen}
              options={{
                gestureEnabled: true,
                presentation: 'modal',
                ...animationConfigs.modal,
              }}
            />

            {/* QR 코드 화면 */}
            <Stack.Screen
              name="QRCode"
              component={QRCodeScreen}
              options={{
                gestureEnabled: true,
                presentation: 'modal',
                ...animationConfigs.preview,
              }}
            />

            {/* 설정 화면 */}
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                gestureEnabled: true,
                ...animationConfigs.default,
              }}
            />

            {/* 프로필 화면 */}
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                gestureEnabled: true,
                ...animationConfigs.default,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;
