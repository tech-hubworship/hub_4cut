# 허브네컷 개발자 가이드

## 📱 프로젝트 개요

허브네컷은 React Native로 개발된 포토부스 애플리케이션입니다. 사용자가 프레임을 선택하고 사진을 촬영한 후 편집할 수 있는 기능을 제공합니다.

## 🏗️ 프로젝트 구조

```
HubPhotoBooth/
├── src/
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── common/         # 공통 UI 컴포넌트
│   │   ├── camera/         # 카메라 관련 컴포넌트
│   │   ├── photo/          # 사진 관련 컴포넌트
│   │   └── ui/             # UI 컴포넌트
│   ├── screens/            # 화면 컴포넌트
│   ├── navigation/         # 네비게이션 설정
│   ├── store/              # Redux 상태 관리
│   ├── services/           # API 및 외부 서비스
│   ├── hooks/              # 커스텀 훅
│   ├── utils/              # 유틸리티 함수
│   ├── constants/          # 상수 및 설정
│   └── types/              # TypeScript 타입 정의
├── assets/                 # 이미지, 폰트 등 정적 자원
├── ios/                    # iOS 네이티브 코드
└── android/                # Android 네이티브 코드
```

## 🧩 컴포넌트 아키텍처

### Common Components (`src/components/common/`)

#### Header
- **용도**: 모든 화면의 상단 헤더
- **Props**: `title`, `onBack`, `showBack`, `rightComponent`
- **사용법**:
```tsx
<Header 
  title="사진 촬영" 
  onBack={() => navigation.goBack()} 
/>
```

#### Container
- **용도**: 화면의 기본 컨테이너 (안전 영역 포함)
- **Props**: `children`, `style`, `padding`, `backgroundColor`
- **사용법**:
```tsx
<Container backgroundColor="#f5f5f5">
  <Text>내용</Text>
</Container>
```

#### Button
- **용도**: 재사용 가능한 버튼 컴포넌트
- **Props**: `title`, `onPress`, `variant`, `size`, `disabled`
- **사용법**:
```tsx
<Button 
  title="시작하기" 
  onPress={handleStart} 
  variant="primary" 
/>
```

#### FrameCard
- **용도**: 프레임 선택 카드
- **Props**: `frame`, `onPress`, `selected`, `size`
- **사용법**:
```tsx
<FrameCard 
  frame={frameData} 
  onPress={handleFrameSelect} 
  selected={true} 
/>
```

### Camera Components (`src/components/camera/`)

#### CameraView
- **용도**: 카메라 뷰 및 기본 컨트롤
- **Props**: `frameType`, `basicFrameType`, `onPhotoCaptured`, `aspectRatio`
- **사용법**:
```tsx
<CameraView 
  frameType="basic"
  basicFrameType="vertical"
  onPhotoCaptured={handlePhotoCapture}
  aspectRatio={2}
/>
```

### Photo Components (`src/components/photo/`)

#### PhotoGrid
- **용도**: 2x2 사진 그리드 레이아웃
- **Props**: `photos`, `onPhotoPress`, `selectedPhotos`
- **사용법**:
```tsx
<PhotoGrid 
  photos={capturedPhotos} 
  onPhotoPress={handleGridItemPress} 
  selectedPhotos={selectedPhotos} 
/>
```

#### PhotoSelector
- **용도**: 가로 스크롤 사진 선택 목록
- **Props**: `photos`, `selectedPhotos`, `onPhotoSelect`
- **사용법**:
```tsx
<PhotoSelector 
  photos={availablePhotos} 
  selectedPhotos={selectedPhotos} 
  onPhotoSelect={handlePhotoSelect} 
/>
```

## 🎨 테마 시스템

### Colors (`src/constants/theme.ts`)

```tsx
import { colors } from '../constants/theme';

// 사용 예시
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderColor: colors.border.light,
  },
  text: {
    color: colors.text.primary,
  },
});
```

### Typography

```tsx
import { typography } from '../constants/theme';

const styles = StyleSheet.create({
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  body: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.normal,
  },
});
```

### Spacing

```tsx
import { spacing } from '../constants/theme';

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    margin: spacing.sm,
  },
});
```

## 🪝 커스텀 훅

### usePhotoCapture

사진 촬영 관련 상태와 로직을 관리하는 훅입니다.

```tsx
import { usePhotoCapture } from '../hooks/usePhotoCapture';

const {
  photos,
  isCapturing,
  currentPhotoIndex,
  aspectRatio,
  startAutoCapture,
  stopAutoCapture,
  capturePhoto,
  resetPhotos,
} = usePhotoCapture({
  frameType: 'basic',
  basicFrameType: 'vertical',
  maxPhotos: 4,
  autoCaptureInterval: 6000,
});
```

## 🛠️ 유틸리티 함수

### Photo Utils (`src/utils/photoUtils.ts`)

```tsx
import { 
  photoFileToUri, 
  calculateAspectRatio,
  findEmptySlot 
} from '../utils/photoUtils';

// 사진 파일을 URI로 변환
const uri = photoFileToUri(photoFile);

// 비율 계산
const ratio = calculateAspectRatio('basic', 'vertical');

// 빈 슬롯 찾기
const emptyIndex = findEmptySlot(photos);
```

## 📱 화면 구성

### 1. SplashScreen
- 앱 시작 화면
- 사용자 데이터 로드 및 애니메이션

### 2. MainScreen
- 메인 화면
- "시작하기" 버튼으로 촬영 시작

### 3. PhotoCaptureScreen (Frame Selection)
- 프레임 타입 선택
- "기본프레임" vs "특수프레임"

### 4. FrameSelectionScreen
- 특정 프레임 선택
- 카테고리별 프레임 목록

### 5. CameraCaptureScreen
- 카메라 촬영 화면
- 자동 촬영 및 카운트다운

### 6. PhotoEditScreen
- 사진 편집 및 배치
- 2x2 그리드 레이아웃

## 🔧 개발 환경 설정

### 필수 의존성

```json
{
  "react-native-vision-camera": "^4.7.1",
  "react-native-gesture-handler": "^2.17.1",
  "@react-navigation/native": "^6.1.18",
  "@react-navigation/stack": "^6.3.20"
}
```

### iOS 설정

1. **카메라 권한**: `Info.plist`에 `NSCameraUsageDescription` 추가
2. **Pod 설치**: `cd ios && pod install`

### Android 설정

1. **카메라 권한**: `AndroidManifest.xml`에 카메라 권한 추가
2. **권한 요청**: 런타임에 카메라 권한 요청

## 📋 개발 가이드라인

### 1. 컴포넌트 설계 원칙

- **단일 책임**: 하나의 컴포넌트는 하나의 책임만 가짐
- **재사용성**: 가능한 한 재사용 가능하게 설계
- **Props 인터페이스**: 명확한 Props 타입 정의
- **스타일 분리**: StyleSheet를 사용하여 스타일 분리

### 2. 상태 관리

- **로컬 상태**: `useState` 사용
- **전역 상태**: Redux Toolkit 사용
- **복잡한 로직**: 커스텀 훅으로 분리

### 3. 성능 최적화

- **메모이제이션**: `useMemo`, `useCallback` 사용
- **불필요한 리렌더링 방지**: React.memo 사용
- **이미지 최적화**: 적절한 이미지 크기 및 포맷 사용

### 4. 에러 처리

- **사용자 친화적 메시지**: 기술적 용어 대신 이해하기 쉬운 메시지
- **Fallback UI**: 에러 발생 시 대체 UI 제공
- **로깅**: 개발 및 디버깅을 위한 로그 기록

## 🚀 배포 및 빌드

### iOS 빌드

```bash
cd ios
xcodebuild -workspace HubPhotoBooth.xcworkspace -scheme HubPhotoBooth -configuration Release -destination generic/platform=iOS
```

### Android 빌드

```bash
cd android
./gradlew assembleRelease
```

## 📚 추가 리소스

- [React Native 공식 문서](https://reactnative.dev/)
- [React Navigation 문서](https://reactnavigation.org/)
- [Redux Toolkit 문서](https://redux-toolkit.js.org/)
- [React Native Vision Camera 문서](https://mrousavy.com/react-native-vision-camera/)

## 🤝 기여 가이드

1. **브랜치 생성**: `feature/기능명` 또는 `fix/버그명`
2. **커밋 메시지**: 명확하고 설명적인 메시지 작성
3. **코드 리뷰**: 모든 변경사항은 리뷰 후 머지
4. **테스트**: 새로운 기능에 대한 테스트 코드 작성

## 📞 문의 및 지원

개발 관련 문의사항이 있으시면 개발팀에 연락해주세요.

---

**마지막 업데이트**: 2024년 12월
**버전**: 1.0.0

