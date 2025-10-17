
# Cloudinary 설정 가이드

## 1. Cloudinary 계정 설정

1. [Cloudinary 대시보드](https://cloudinary.com/console)에 로그인
2. 계정 정보 확인:
   - Cloud Name: 
   - API Key:  
   - API Secret:  
   - CLOUDINARY_URL: 

## 2. 업로드 프리셋 생성

1. Cloudinary 대시보드에서 **Settings** → **Upload** 탭으로 이동
2. **Upload presets** 섹션에서 **Add upload preset** 클릭
3. 다음 설정으로 프리셋 생성:

### 프리셋 설정
- **Preset name**: `hub_photo_booth`
- **Signing Mode**: `Unsigned` (서명 없이 업로드 허용)
- **Folder**: `hub_photo_booth` (선택사항)
- **Access mode**: `Public`
- **Auto-upload**: `Enabled`

### 변환 설정 (선택사항)
- **Eager transformations**: 
  - `w_800,h_1200,c_fill,q_auto,f_auto` (QR 코드용)
  - `w_400,h_600,c_fill,q_auto,f_auto` (썸네일용)

## 3. 환경 변수 설정

### React Native 환경 변수 설정

React Native에서는 환경 변수 사용이 제한적이므로, 코드에서 직접 설정하거나 `react-native-config` 라이브러리를 사용할 수 있습니다.

#### 방법 1: 환경 변수 사용 (권장)
```typescript
// src/services/cloudinary.ts
import Config from 'react-native-config';

const CLOUD_NAME = Config.CLOUDINARY_CLOUD_NAME;
const API_KEY = Config.CLOUDINARY_API_KEY;
const API_SECRET = Config.CLOUDINARY_API_SECRET;
const UPLOAD_PRESET = Config.CLOUDINARY_UPLOAD_PRESET;
```

#### 방법 2: 하드코딩 (비권장 - 보안상 위험)
```typescript
// src/services/cloudinary.ts
const CLOUD_NAME = 'your_cloud_name';
const API_KEY = 'your_api_key';
const API_SECRET = 'your_api_secret';
const UPLOAD_PRESET = 'your_upload_preset';
```

### .env 파일 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Cloudinary 설정

```

### react-native-config 설치

```bash
npm install react-native-config
cd ios && pod install
```

## 4. 보안 설정

1. **Settings** → **Security** 탭으로 이동
2. **Restricted media types**: `None` (모든 이미지 타입 허용)
3. **Allowed file formats**: `jpg, png, gif, webp` (필요에 따라 조정)

## 5. 사용량 모니터링

- **Analytics** 탭에서 업로드/다운로드 사용량 확인
- 무료 플랜: 25GB 저장공간, 25GB 대역폭/월

## 6. 테스트

프리셋 생성 후 앱에서 이미지 업로드가 정상적으로 작동하는지 확인하세요.

## 7. 문제 해결

### 업로드 실패 시
1. 프리셋 이름이 정확한지 확인 (`hub_photo_booth`)
2. 프리셋이 `Unsigned` 모드로 설정되었는지 확인
3. 네트워크 연결 상태 확인
4. API 키와 시크릿이 올바른지 확인

### 이미지가 표시되지 않는 경우
1. 업로드된 이미지의 URL이 올바른지 확인
2. Cloudinary 대시보드에서 이미지가 업로드되었는지 확인
3. 폴더 권한 설정 확인

### 환경 변수 관련
1. **환경 변수가 로드되지 않는 경우**:
   - `.env` 파일이 프로젝트 루트에 있는지 확인
   - `react-native-config`가 설치되어 있는지 확인
   - iOS의 경우 `pod install` 실행 후 앱 재빌드
   - Metro 캐시 리셋: `npx react-native start --reset-cache`

2. **환경 변수 검증 실패**:
   - `.env` 파일에 모든 필수 변수가 설정되어 있는지 확인
   - 변수명이 정확한지 확인 (대소문자 구분)
   - 값에 공백이나 특수문자가 없는지 확인

3. **보안 고려사항**:
   - `.env` 파일은 `.gitignore`에 포함되어야 함
   - 프로덕션에서는 서버에서 환경 변수 관리
   - API 키와 시크릿은 절대 하드코딩하지 말 것
