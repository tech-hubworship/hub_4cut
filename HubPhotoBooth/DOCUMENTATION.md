# 허그네컷 포토부스 앱 문서

## 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [주요 기능](#주요-기능)
4. [프로젝트 구조](#프로젝트-구조)
5. [화면별 설명](#화면별-설명)
6. [프레임 시스템](#프레임-시스템)
7. [이미지 업로드 시스템](#이미지-업로드-시스템)
8. [개발 가이드](#개발-가이드)

---

## 프로젝트 개요

허그네컷은 교회용 인생네컷 스타일의 포토부스 애플리케이션입니다. 사용자가 여러 장의 사진을 촬영하고, 다양한 프레임 테마를 선택하여 인화할 수 있습니다.

### 주요 특징
- **다양한 촬영 모드**: 세로 4컷, 2x2 그리드 촬영
- **테마별 프레임**: 클래식, 빈티지, 모던, 큐트 등 4가지 테마
- **사진 편집**: 촬영된 사진 중 원하는 사진 선택 및 재배치
- **클라우드 업로드**: Cloudinary를 통한 이미지 저장 및 QR 코드 생성
- **실시간 미리보기**: 프레임에 사진이 배치된 모습 실시간 확인

---

## 기술 스택

### Frontend
- **React Native**: 0.78.0
- **TypeScript**: 크로스 플랫폼 개발
- **React Navigation**: 화면 전환 및 네비게이션
- **Redux Toolkit**: 상태 관리

### 주요 라이브러리
- `react-native-vision-camera`: 카메라 기능
- `react-native-svg`: SVG 아이콘 렌더링
- `react-native-view-shot`: 화면 캡처
- `react-native-qrcode-svg`: QR 코드 생성
- `react-native-fs`: 파일 시스템 접근
- `react-native-config`: 환경 변수 관리

### Backend & Storage
- **Cloudinary**: 이미지 저장 및 변환

---

## 주요 기능

### 1. 사진 촬영
- **세로 4컷**: 세로로 4장의 사진을 순차적으로 촬영
- **2x2 그리드**: 2x2 그리드 형태로 4장의 사진 촬영
- **타이머 기능**: 각 촬영마다 3초 카운트다운
- **실시간 프리뷰**: 촬영 중 실시간 카메라 화면

### 2. 사진 편집
- **사진 선택**: 촬영된 사진 중 원하는 사진 선택
- **사진 재배치**: 선택된 사진의 순서 변경
- **사진 삭제**: 선택 해제 및 재선택 가능
- **실시간 미리보기**: 프레임에 배치된 모습 확인

### 3. 프레임 테마 선택
- **클래식**: 검은색 프레임 (기본값)
- **빈티지**: 흰색 프레임, 더 큰 사진 영역
- **모던**: 검은색 프레임, 더 작은 사진 영역
- **큐트**: 흰색 프레임, 가장 큰 사진 영역
- 각 테마별로 다른 사진 위치 및 크기 설정

### 4. 인화 및 저장
- **수량 선택**: 1~99장 인화 수량 선택
- **프레임 캡처**: 선택된 사진과 프레임을 하나의 이미지로 합성
- **클라우드 업로드**: Cloudinary에 이미지 업로드
- **QR 코드 생성**: 업로드된 이미지 접근용 QR 코드

---

## 프로젝트 구조

```
HubPhotoBooth/
├── src/
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── camera/         # 카메라 관련 컴포넌트
│   │   ├── common/         # 공통 컴포넌트 (Button, Header 등)
│   │   └── photo/          # 사진 관련 컴포넌트
│   ├── screens/            # 화면 컴포넌트
│   │   ├── MainScreen.tsx                        # 메인 화면
│   │   ├── CutTypeSelection.tsx                  # 촬영 모드 선택
│   │   ├── Vertical4CutCameraCaptureScreen.tsx   # 세로 4컷 촬영
│   │   ├── Grid2x2CameraCaptureScreen.tsx        # 2x2 그리드 촬영
│   │   ├── PhotoEditScreen.tsx                   # 사진 편집
│   │   ├── FrameThemeSelectionScreen.tsx         # 테마 선택
│   │   ├── FramePreviewScreen.tsx                # 최종 미리보기
│   │   └── PrintingScreen.tsx                    # 인화 중 (업로드)
│   ├── constants/          # 상수 및 설정
│   │   ├── frameRegions.json  # 프레임별 사진 영역 정의
│   │   ├── frames.ts          # 프레임 관련 상수
│   │   └── theme.ts           # 테마 관련 상수
│   ├── services/           # 외부 서비스 연동
│   │   ├── api/           # API 호출
│   │   ├── storage/       # 로컬 저장소
│   │   └── cloudinary.ts  # Cloudinary 서비스
│   ├── store/             # Redux 상태 관리
│   │   └── slices/        # Redux 슬라이스
│   ├── types/             # TypeScript 타입 정의
│   └── utils/             # 유틸리티 함수
├── assets/                # 정적 리소스
│   ├── frames/           # 프레임 이미지
│   │   └── frame(4*6)/
│   │       ├── black.png  # 검은색 프레임
│   │       └── white.png  # 흰색 프레임
│   ├── icon/             # 아이콘 이미지
│   └── image/            # 기타 이미지
└── CLOUDINARY_SETUP.md   # Cloudinary 설정 가이드
```

---

## 화면별 설명

### 1. MainScreen (메인 화면)
- 앱 시작 화면
- "촬영 시작" 버튼으로 촬영 모드 선택 화면으로 이동

### 2. CutTypeSelection (촬영 모드 선택)
```typescript
// 경로: src/screens/CutTypeSelection.tsx
// 주요 기능:
- 세로 4컷 / 2x2 그리드 선택
- 각 촬영 모드의 미리보기 이미지 표시
- 선택 시 해당 카메라 화면으로 이동
```

**네비게이션 흐름:**
```
CutTypeSelection → Vertical4CutCameraCapture (세로 4컷)
                 → Grid2x2CameraCapture (2x2 그리드)
```

### 3. Vertical4CutCameraCaptureScreen (세로 4컷 촬영)
```typescript
// 경로: src/screens/Vertical4CutCameraCaptureScreen.tsx
// 주요 기능:
- 4장의 사진을 순차적으로 촬영
- 각 촬영마다 3초 타이머
- 촬영된 사진 미리보기
- 촬영 완료 후 PhotoEditScreen으로 이동
```

**촬영 프로세스:**
1. 카메라 권한 확인
2. 타이머 시작 (3초)
3. 사진 촬영
4. 다음 사진으로 이동 (4회 반복)
5. 완료 후 편집 화면으로 이동

### 4. PhotoEditScreen (사진 편집)
```typescript
// 경로: src/screens/PhotoEditScreen.tsx
// 주요 기능:
- 촬영된 사진 목록 표시
- 사진 선택/해제
- 프레임 미리보기
- 선택 완료 후 테마 선택 화면으로 이동
```

**주요 상태:**
```typescript
const [selectedPhotos, setSelectedPhotos] = useState<Array<Photo | null>>(
  Array(4).fill(null)
);
const [frameLayout, setFrameLayout] = useState({ 
  width: 0, 
  height: 0, 
  x: 0, 
  y: 0 
});
```

**사진 선택 로직:**
```typescript
const handlePhotoSelect = (photo: any, index: number) => {
  // 이미 선택된 사진인지 확인
  const isAlreadySelected = selectedPhotos.some(p => p && p.uri === photo.uri);
  
  if (isAlreadySelected) {
    // 선택 해제
    const newPhotos = selectedPhotos.map(p => 
      p && p.uri === photo.uri ? null : p
    );
    setSelectedPhotos(newPhotos);
  } else {
    // 빈 자리에 추가
    const emptyIndex = selectedPhotos.findIndex(p => p === null);
    if (emptyIndex !== -1) {
      const newPhotos = [...selectedPhotos];
      newPhotos[emptyIndex] = photo;
      setSelectedPhotos(newPhotos);
    }
  }
};
```

### 5. FrameThemeSelectionScreen (테마 선택)
```typescript
// 경로: src/screens/FrameThemeSelectionScreen.tsx
// 주요 기능:
- 4가지 테마 선택 (클래식, 빈티지, 모던, 큐트)
- 선택된 테마로 프레임 미리보기
- 테마별로 다른 프레임 이미지 및 사진 위치 적용
```

**테마 정의:**
```typescript
const themes = [
  { 
    id: 'classic', 
    name: '클래식', 
    image: require('../../assets/frames/frame(4*6)/black.png') 
  },
  { 
    id: 'vintage', 
    name: '빈티지', 
    image: require('../../assets/frames/frame(4*6)/white.png') 
  },
  { 
    id: 'modern', 
    name: '모던', 
    image: require('../../assets/frames/frame(4*6)/black.png') 
  },
  { 
    id: 'cute', 
    name: '큐트', 
    image: require('../../assets/frames/frame(4*6)/white.png') 
  },
];
```

### 6. FramePreviewScreen (최종 미리보기)
```typescript
// 경로: src/screens/FramePreviewScreen.tsx
// 주요 기능:
- 선택된 테마로 최종 결과물 미리보기
- 인화 수량 선택 모달
- ViewShot으로 프레임 캡처
- 캡처된 이미지를 PrintingScreen으로 전달
```

**프레임 캡처:**
```typescript
const captureFrame = async (): Promise<string> => {
  const frameShot = frameShotRef.current;
  if (!frameShot) {
    throw new Error('프레임 캡처 참조가 없습니다.');
  }
  
  const uri = await frameShot.capture?.();
  if (!uri) {
    throw new Error('프레임 캡처에 실패했습니다.');
  }
  
  return uri;
};
```

**인화 수량 선택 모달:**
```typescript
<Modal visible={isQuantityModalVisible} transparent animationType="fade">
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>인화수량</Text>
      <Text style={styles.modalSubtitle}>인화수량을 선택해주세요</Text>
      
      <View style={styles.quantitySelector}>
        <TouchableOpacity onPress={() => setQuantity(quantity - 1)}>
          <Text>-</Text>
        </TouchableOpacity>
        <Text>{quantity}</Text>
        <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
          <Text>+</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity onPress={handleConfirmPrint}>
        <Text>인화하기</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
```

### 7. PrintingScreen (인화 중 - 이미지 업로드)
```typescript
// 경로: src/screens/PrintingScreen.tsx
// 주요 기능:
- Cloudinary에 이미지 업로드
- 업로드 진행률 표시
- QR 코드 생성 및 표시
- 업로드 완료 후 메인 화면으로 이동
```

**업로드 프로세스:**
```typescript
const simulateImageUpload = async () => {
  try {
    // 진행률 업데이트
    setUploadProgress(30);
    
    // Cloudinary 업로드
    const uploadResult = await CloudinaryService.uploadImage(
      photos[0], 
      'hub_photo_booth'
    );
    
    setUploadProgress(80);
    
    // QR 코드 URL 생성
    const qrImageUrl = CloudinaryService.generateQRImageUrl(
      uploadResult.public_id
    );
    
    setUploadProgress(100);
    setQrCodeUrl(qrImageUrl);
    setIsComplete(true);
  } catch (error) {
    console.error('업로드 오류:', error);
    Alert.alert('오류', '이미지 업로드 중 오류가 발생했습니다.');
  }
};
```

---

## 프레임 시스템

### frameRegions.json 구조

프레임 시스템은 `frameRegions.json` 파일에 정의되어 있으며, 각 테마별로 다른 사진 위치와 크기를 설정할 수 있습니다.

```json
{
  "frame4x6": {
    "totalWidth": 501,
    "totalHeight": 752,
    "themes": {
      "classic": {
        "imageName": "frame(4*6)/black.png",
        "totalWidth": 501,
        "totalHeight": 752,
        "regions": [
          {
            "id": 1,
            "name": "topLeft",
            "x": 41,
            "y": 40,
            "width": 200,
            "height": 297,
            "position": 0
          }
          // ... 나머지 3개 영역
        ]
      }
      // ... 나머지 테마들
    }
  }
}
```

### 프레임 영역 계산

각 화면에서 프레임 영역을 실제 화면 크기에 맞춰 계산합니다:

```typescript
const getScaledRegion = (region: any) => {
  if (frameLayout.width === 0 || frameLayout.height === 0) {
    return region;
  }
  
  // 현재 테마의 프레임 크기 가져오기
  const themeConfig = frameRegions.frame4x6.themes[
    selectedTheme as keyof typeof frameRegions.frame4x6.themes
  ];
  const jsonWidth = themeConfig?.totalWidth || 501;
  const jsonHeight = themeConfig?.totalHeight || 752;
  
  const scaleX = frameLayout.width / jsonWidth;
  const scaleY = frameLayout.height / jsonHeight;
  
  return {
    x: region.x * scaleX,
    y: region.y * scaleY,
    width: region.width * scaleX,
    height: region.height * scaleY,
  };
};
```

### 프레임 렌더링

```typescript
<View style={styles.frameContainer}>
  {/* 프레임 이미지 */}
  <Image
    source={getFrameImage()}
    style={styles.frameImage}
    resizeMode="cover"
    onLayout={onFrameLayout}
  />
  
  {/* 사진 오버레이 */}
  <View style={styles.photosOverlay}>
    {getThemeRegions().map((region, index) => {
      const photo = photos[index];
      const scaledRegion = getScaledRegion(region);
      
      return (
        <View 
          key={region.id}
          style={{
            position: 'absolute',
            left: scaledRegion.x,
            top: scaledRegion.y,
            width: scaledRegion.width,
            height: scaledRegion.height,
          }}
        >
          <Image 
            source={{ uri: photo }} 
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </View>
      );
    })}
  </View>
</View>
```

---

## 이미지 업로드 시스템

### Cloudinary 서비스

```typescript
// 경로: src/services/cloudinary.ts

export class CloudinaryService {
  // 이미지를 Base64로 변환
  private static async imageToBase64(imageUri: string): Promise<string> {
    if (imageUri.startsWith('file://') || imageUri.startsWith('/')) {
      const filePath = imageUri.startsWith('file://') 
        ? imageUri 
        : `file://${imageUri}`;
      const base64 = await RNFS.readFile(filePath, 'base64');
      return base64;
    }
    return imageUri; // 원격 URL인 경우
  }
  
  // 단일 이미지 업로드
  static async uploadImage(
    imageUri: string, 
    folder: string
  ): Promise<CloudinaryUploadResult> {
    if (imageUri.startsWith('file://') || imageUri.startsWith('/')) {
      return await this.uploadLocalFile(imageUri, folder);
    } else {
      return await this.uploadRemoteUrl(imageUri, folder);
    }
  }
  
  // 로컬 파일 업로드
  private static async uploadLocalFile(
    imageUri: string, 
    folder: string
  ): Promise<CloudinaryUploadResult> {
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    const base64Image = await this.imageToBase64(imageUri);
    
    const formData = new FormData();
    formData.append('file', `data:image/jpeg;base64,${base64Image}`);
    formData.append('folder', folder);
    
    if (UPLOAD_PRESET) {
      formData.append('upload_preset', UPLOAD_PRESET);
    }
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('업로드 실패');
    }
    
    return await response.json();
  }
  
  // QR 코드용 이미지 URL 생성
  static generateQRImageUrl(publicId: string): string {
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/` +
           `w_800,h_1200,c_fill,q_auto,f_jpg/${publicId}`;
  }
}
```

### 환경 변수 설정

`.env` 파일 예시:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

---

## 개발 가이드

### 설치 및 실행

```bash
# 의존성 설치
npm install

# iOS Pod 설치
cd ios && pod install && cd ..

# iOS 실행
npm run ios

# Android 실행
npm run android
```

### 프레임 추가하기

1. **프레임 이미지 추가**
   ```
   assets/frames/frame(4*6)/
   └── new_theme.png
   ```

2. **frameRegions.json 수정**
   ```json
   {
     "frame4x6": {
       "themes": {
         "new_theme": {
           "imageName": "frame(4*6)/new_theme.png",
           "totalWidth": 501,
           "totalHeight": 752,
           "regions": [...]
         }
       }
     }
   }
   ```

3. **테마 추가 (FrameThemeSelectionScreen.tsx)**
   ```typescript
   const themes = [
     // 기존 테마들...
     { 
       id: 'new_theme', 
       name: '새 테마', 
       image: require('../../assets/frames/frame(4*6)/new_theme.png') 
     },
   ];
   ```

### 사진 영역 조정하기

`frameRegions.json`에서 각 테마의 `regions` 배열을 수정:

```json
{
  "id": 1,
  "name": "topLeft",
  "x": 41,      // 왼쪽 위치
  "y": 40,      // 위쪽 위치
  "width": 200,  // 너비
  "height": 297, // 높이
  "position": 0  // 사진 순서
}
```

### 디버깅 팁

1. **프레임 위치 확인**
   ```typescript
   console.log('Frame layout:', frameLayout);
   console.log('Scaled region:', getScaledRegion(region));
   ```

2. **이미지 업로드 확인**
   ```typescript
   console.log('업로드 시작:', imageUri);
   console.log('업로드 완료:', uploadResult);
   ```

3. **Metro 캐시 삭제**
   ```bash
   npm start -- --reset-cache
   ```

---

## 문제 해결

### 일반적인 문제

1. **프레임이 보이지 않을 때**
   - 프레임 이미지 경로 확인
   - `resizeMode` 설정 확인 (`"cover"` 또는 `"contain"`)
   - `frameLayout` 상태 확인

2. **사진이 올바른 위치에 표시되지 않을 때**
   - `frameRegions.json`의 좌표값 확인
   - `getScaledRegion` 함수 로직 확인
   - 테마별 `totalWidth/Height` 값 확인

3. **이미지 업로드 실패**
   - Cloudinary 환경 변수 확인
   - 네트워크 연결 확인
   - 이미지 파일 경로 확인 (로컬 vs 원격)

---

## 라이센스

이 프로젝트는 교회용 포토부스 애플리케이션으로 개발되었습니다.

---

## 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 등록해주세요.







