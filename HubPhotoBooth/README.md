# 🏛️ 허브 인생네컷 프로젝트

> "우리 허브의 소중한 순간을 담다" - 인생네컷 프로젝트

## 📱 프로젝트 개요

허브 구성원들의 소통과 친교 증진을 위한 인생네컷 서비스입니다. 아이패드와 캐논 미니샷을 활용하여 특별한 순간을 아름답게 기록하고 추억을 보존합니다.

## 🚀 주요 기능

- 📸 **네컷 촬영**: 2x2 그리드 사진 촬영
- 🎨 **프레임 선택**: 허브 행사별, 계절별 테마 프레임
- ✨ **AI 편집**: 자동 이미지 최적화 및 편집
- ☁️ **클라우드 동기화**: 자동 업로드 및 백업
- 🖨️ **자동 프린트**: 캐논 미니샷 연동 무인 프린트
- 📱 **QR 코드**: 3시간 만료 다운로드 시스템
- 📱 **SNS 공유**: 소셜 미디어 연동

## 🏗️ 기술 스택

- **Frontend**: React Native 0.73.0
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation 6
- **UI Components**: Custom Components + Vector Icons
- **Image Processing**: React Native Camera + Image Picker
- **Storage**: AsyncStorage + React Native FS
- **Styling**: React Native Linear Gradient

## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── common/         # 공통 컴포넌트 (Button, Input 등)
│   ├── photo/          # 사진 관련 컴포넌트
│   └── ui/             # UI 기본 요소
├── screens/            # 화면 컴포넌트
│   ├── auth/           # 인증 관련 화면
│   ├── main/           # 메인 화면
│   ├── photo/          # 사진 촬영/편집 화면
│   └── settings/       # 설정 화면
├── services/           # 비즈니스 로직
│   ├── api/            # API 통신
│   ├── storage/        # 로컬 저장소
│   └── printer/        # 프린터 연동
├── store/              # 상태 관리
│   ├── slices/         # Redux Toolkit 슬라이스
│   └── actions/        # 액션 생성자
├── hooks/              # 커스텀 훅
├── utils/              # 유틸리티 함수
├── types/              # TypeScript 타입 정의
├── constants/          # 상수 정의
└── assets/             # 이미지, 폰트 등 리소스
```

## 🛠️ 개발 환경 설정

### 필수 요구사항

- Node.js 18+
- React Native CLI
- Xcode (iOS 개발용)
- Android Studio (Android 개발용)
- CocoaPods (iOS 의존성 관리)

### 설치 및 실행

```bash
# 의존성 설치
npm install

# iOS 의존성 설치 (macOS)
cd ios && pod install && cd ..

# Android 실행
npm run android

# iOS 실행
npm run ios

# Metro 번들러 시작
npm start
```

## 👥 개발자 협업 가이드

### 1. 브랜치 전략

- `main`: 프로덕션 브랜치
- `develop`: 개발 통합 브랜치
- `feature/기능명`: 새로운 기능 개발
- `hotfix/버그명`: 긴급 버그 수정

### 2. 커밋 컨벤션

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 코드 추가
chore: 빌드 프로세스 또는 보조 도구 변경
```

### 3. 코드 스타일

- ESLint + Prettier 사용
- TypeScript 엄격 모드
- 함수형 컴포넌트 + Hooks 사용
- 컴포넌트별 독립적인 스타일링

### 4. 컴포넌트 개발 원칙

- **단일 책임**: 하나의 컴포넌트는 하나의 역할만
- **재사용성**: 공통 컴포넌트는 `src/components/common`에 배치
- **Props 인터페이스**: 명확한 타입 정의
- **에러 처리**: 적절한 에러 바운더리 구현

## 🔧 환경 변수 설정

`.env` 파일을 생성하여 다음 환경 변수를 설정하세요:

```env
# API 설정
API_BASE_URL=https://your-api-server.com
API_TIMEOUT=30000

# 프린터 설정
PRINTER_IP=192.168.1.100
PRINTER_PORT=9100

# 클라우드 설정
CLOUD_BUCKET=hub-photobooth
CLOUD_REGION=ap-northeast-2
```

## 📱 앱 구조

### 화면 플로우

1. **스플래시 화면** → 앱 초기화
2. **메인 화면** → 네비게이션 허브
3. **사진 촬영** → 카메라 + 프레임 선택
4. **편집 화면** → 필터 + 효과 적용
5. **프린트 설정** → 프린터 선택 + 옵션
6. **완료 화면** → QR 코드 생성

### 상태 관리

- **사용자 상태**: 인증 정보, 설정
- **사진 상태**: 촬영, 편집, 프린트 진행 상황
- **프린터 상태**: 연결 상태, 작업 큐
- **네트워크 상태**: 온라인/오프라인, 동기화 상태

## 🚀 배포 및 배포

### 빌드

```bash
# Android APK 빌드
npm run build:android

# iOS IPA 빌드
npm run build:ios
```

### 테스트

```bash
# 단위 테스트
npm test

# E2E 테스트
npm run test:e2e
```

## 📞 지원 및 문의

프로젝트 관련 문의사항이나 버그 리포트는 이슈 트래커를 통해 제출해주세요.

---

**Made with ❤️ for Hub Community**
