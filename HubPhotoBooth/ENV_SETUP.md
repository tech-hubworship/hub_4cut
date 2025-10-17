# 환경 변수 설정 가이드

## 📝 .env 파일 생성

`HubPhotoBooth/.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# Cloudinary 설정 (이미지 클라우드 스토리지)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Supabase 설정 (데이터베이스)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# 로컬 서버 설정 (원본 사진 저장)
# Mac의 실제 IP 주소로 변경하세요
LOCAL_SERVER_URL=http://192.168.0.15:5001
```

## 🔍 IP 주소 확인 방법

### Mac에서:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

출력 예시:
```
inet 192.168.0.15 netmask 0xffffff00 broadcast 192.168.0.255
```

→ `192.168.0.15`를 사용

## ⚙️ 각 서비스 설정

### 1. Cloudinary 설정
1. https://cloudinary.com 회원가입
2. Dashboard에서 확인:
   - Cloud Name
   - API Key  
   - API Secret
3. Settings → Upload → Upload Presets 생성

### 2. Supabase 설정
1. https://supabase.com 프로젝트 생성
2. SQL Editor에서 `supabase-schema.sql` 실행
3. Settings → API에서 확인:
   - Project URL (SUPABASE_URL)
   - anon public key (SUPABASE_ANON_KEY)

### 3. 로컬 서버 설정
1. 로컬 서버 시작 (photo_server 디렉토리)
2. Mac의 IP 주소 확인
3. .env에 `LOCAL_SERVER_URL` 설정

## ✅ 설정 확인

### 1. 로컬 서버 테스트
```bash
curl http://192.168.0.15:5001/health
```

성공 시:
```json
{
  "status": "ok",
  "message": "Hub Photo Booth Local Server is running"
}
```

### 2. 앱 실행 후 로그 확인

앱을 실행하면 다음과 같은 로그가 나타나야 합니다:

```
✅ Cloudinary 설정 로드 완료
✅ Supabase 설정 로드 완료  
✅ 로컬 서버 연결 성공
```

## 🚨 문제 해결

### 로컬 서버 연결 안 됨
- IP 주소가 맞는지 확인
- 같은 Wi-Fi 네트워크에 있는지 확인
- 방화벽 설정 확인
- 서버가 실행 중인지 확인

### Cloudinary 업로드 실패
- API Key/Secret이 정확한지 확인
- Upload Preset이 unsigned로 설정되었는지 확인

### Supabase 저장 실패
- URL과 Anon Key가 정확한지 확인
- RLS 정책이 올바른지 확인
