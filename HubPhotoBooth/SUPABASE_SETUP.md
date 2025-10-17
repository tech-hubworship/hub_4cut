# Supabase 설정 가이드

## 1. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Cloudinary 설정
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_UPLOAD_PRESET=hub_photo_booth

# Supabase 설정

```

## 2. Supabase 테이블 생성

Supabase 대시보드의 SQL Editor에서 `supabase-schema.sql` 파일의 내용을 실행하세요:

```sql
-- 인화 요청 테이블 생성
CREATE TABLE IF NOT EXISTS print_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  frame_type TEXT NOT NULL,
  theme TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cloudinary_public_id TEXT,
  device_id TEXT,
  user_agent TEXT
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_print_requests_status ON print_requests(status);
CREATE INDEX IF NOT EXISTS idx_print_requests_created_at ON print_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_print_requests_cloudinary_public_id ON print_requests(cloudinary_public_id);

-- RLS (Row Level Security) 설정
ALTER TABLE print_requests ENABLE ROW LEVEL SECURITY;

-- 정책 설정
CREATE POLICY "Allow read access to print_requests" ON print_requests
  FOR SELECT USING (true);

CREATE POLICY "Allow insert access to print_requests" ON print_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update access to print_requests" ON print_requests
  FOR UPDATE USING (true);

-- updated_at 자동 업데이트를 위한 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_print_requests_updated_at 
  BEFORE UPDATE ON print_requests 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

## 3. 테이블 구조

### print_requests 테이블

| 컬럼명 | 타입 | 설명 | 제약조건 |
|--------|------|------|----------|
| id | UUID | 고유 식별자 | PRIMARY KEY, 자동생성 |
| image_url | TEXT | 인화할 이미지 URL | NOT NULL |
| quantity | INTEGER | 인화 수량 | NOT NULL, 기본값 1 |
| status | TEXT | 인화 상태 | NOT NULL, 'pending'/'processing'/'completed'/'failed' |
| frame_type | TEXT | 프레임 타입 | NOT NULL |
| theme | TEXT | 프레임 테마 | NULL 허용 |
| created_at | TIMESTAMP | 생성 시간 | 자동생성 |
| updated_at | TIMESTAMP | 수정 시간 | 자동업데이트 |
| cloudinary_public_id | TEXT | Cloudinary 공개 ID | NULL 허용 |
| device_id | TEXT | 디바이스 식별자 | NULL 허용 |
| user_agent | TEXT | 사용자 에이전트 정보 | NULL 허용 |

## 4. 사용 방법

### 인화 요청 생성
```typescript
import SupabaseService from '../services/supabase';

const printRequest = await SupabaseService.createPrintRequest({
  image_url: 'https://res.cloudinary.com/...',
  quantity: 2,
  status: 'pending',
  frame_type: '2x2',
  theme: 'classic',
  cloudinary_public_id: 'hub_photo_booth/photo_123',
  device_id: 'device_001',
  user_agent: 'HubPhotoBooth/1.0'
});
```

### 인화 상태 업데이트
```typescript
await SupabaseService.updatePrintRequestStatus('uuid-here', 'completed');
```

### 인화 요청 조회
```typescript
const requests = await SupabaseService.getPrintRequests(10);
const request = await SupabaseService.getPrintRequest('uuid-here');
```

## 5. 테스트

현재 `PrintingScreen.tsx`에서는 테스트용 Mock 데이터를 사용하여 Supabase 저장 기능을 테스트할 수 있습니다. 테스트 완료 후 실제 Cloudinary 업로드를 사용하려면 주석 처리된 코드를 활성화하세요.

## 6. 보안

- RLS (Row Level Security)가 활성화되어 있습니다
- 모든 사용자가 읽기/생성이 가능하도록 설정되어 있습니다
- 업데이트는 서비스 역할에서만 가능합니다
- 실제 운영 환경에서는 적절한 정책을 설정하세요
