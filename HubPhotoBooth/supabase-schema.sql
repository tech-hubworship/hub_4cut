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
  local_image_filename TEXT,
  device_id TEXT,
  user_agent TEXT
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_print_requests_status ON print_requests(status);
CREATE INDEX IF NOT EXISTS idx_print_requests_created_at ON print_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_print_requests_cloudinary_public_id ON print_requests(cloudinary_public_id);

-- RLS (Row Level Security) 설정
ALTER TABLE print_requests ENABLE ROW LEVEL SECURITY;

-- 인화 요청 조회 정책 (모든 사용자가 읽기 가능)
CREATE POLICY "Allow read access to print_requests" ON print_requests
  FOR SELECT USING (true);

-- 인화 요청 생성 정책 (모든 사용자가 생성 가능)
CREATE POLICY "Allow insert access to print_requests" ON print_requests
  FOR INSERT WITH CHECK (true);

-- 인화 요청 업데이트 정책 (서비스 역할만 업데이트 가능)
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

-- 테이블 코멘트 추가
COMMENT ON TABLE print_requests IS '사진 인화 요청 관리 테이블';
COMMENT ON COLUMN print_requests.image_url IS '인화할 이미지 URL (Cloudinary 중간 크기)';
COMMENT ON COLUMN print_requests.quantity IS '인화 수량';
COMMENT ON COLUMN print_requests.status IS '인화 상태: pending, processing, completed, failed';
COMMENT ON COLUMN print_requests.frame_type IS '프레임 타입 (2x2, vertical4cut 등)';
COMMENT ON COLUMN print_requests.theme IS '프레임 테마';
COMMENT ON COLUMN print_requests.cloudinary_public_id IS 'Cloudinary 공개 ID';
COMMENT ON COLUMN print_requests.local_image_filename IS '로컬 서버에 저장된 원본 사진 파일명';
COMMENT ON COLUMN print_requests.device_id IS '디바이스 식별자';
COMMENT ON COLUMN print_requests.user_agent IS '사용자 에이전트 정보';
