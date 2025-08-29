/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import 'react-native-gesture-handler';
import React, {useEffect} from 'react';
import {StatusBar, LogBox} from 'react-native';
import {Provider} from 'react-redux';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';

// Redux 스토어
import store from './src/store';

// 네비게이션 타입
import {RootStackParamList} from './src/types';

// 화면 컴포넌트들
import SplashScreen from './src/screens/SplashScreen';
import MainScreen from './src/screens/MainScreen';
import PhotoCaptureScreen from './src/screens/PhotoCaptureScreen';
import CameraCaptureScreen from './src/screens/CameraCaptureScreen';
import PhotoEditScreen from './src/screens/PhotoEditScreen';
import FrameSelection from './src/screens/FrameSelection';
import CutTypeSelection from './src/screens/CutTypeSelection';
import FramePreviewScreen from './src/screens/FramePreviewScreen';
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
            }}>
            {/* 스플래시 화면 */}
            <Stack.Screen
              name="Splash"
              component={SplashScreen}
              options={{
                gestureEnabled: false,
              }}
            />

            {/* 메인 화면 */}
            <Stack.Screen
              name="Main"
              component={MainScreen}
              options={{
                gestureEnabled: false,
              }}
            />

            {/* 사진 촬영 화면 */}
            <Stack.Screen
              name="PhotoCapture"
              component={PhotoCaptureScreen}
              options={{
                gestureEnabled: true,
                presentation: 'modal',
              }}
            />

            {/* 카메라 촬영 화면 */}
            <Stack.Screen
              name="CameraCapture"
              component={CameraCaptureScreen}
              options={{
                gestureEnabled: true,
                presentation: 'modal',
              }}
            />

            {/* 프레임 선택 화면 */}
            <Stack.Screen
              name="FrameSelection"
              component={FrameSelection}
              options={{
                gestureEnabled: true,
                presentation: 'modal',
              }}
            />

            {/* 컷 유형 선택 화면 */}
            <Stack.Screen
              name="CutTypeSelection"
              component={CutTypeSelection}
              options={{
                gestureEnabled: true,
                presentation: 'modal',
              }}
            />

            {/* 프레임 미리보기 화면 */}
            <Stack.Screen
              name="FramePreview"
              component={FramePreviewScreen}
              options={{
                gestureEnabled: true,
                presentation: 'modal',
              }}
            />

            {/* 사진 편집 화면 */}
            <Stack.Screen
              name="PhotoEdit"
              component={PhotoEditScreen}
              options={{
                gestureEnabled: true,
                presentation: 'modal',
              }}
            />

            {/* 프린트 설정 화면 */}
            <Stack.Screen
              name="PrintSettings"
              component={PrintSettingsScreen}
              options={{
                gestureEnabled: true,
                presentation: 'modal',
              }}
            />

            {/* QR 코드 화면 */}
            <Stack.Screen
              name="QRCode"
              component={QRCodeScreen}
              options={{
                gestureEnabled: true,
                presentation: 'modal',
              }}
            />

            {/* 설정 화면 */}
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                gestureEnabled: true,
              }}
            />

            {/* 프로필 화면 */}
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                gestureEnabled: true,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;
