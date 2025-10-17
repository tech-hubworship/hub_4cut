import { createClient } from '@supabase/supabase-js';
import Config from 'react-native-config';

// Supabase 설정 - 환경 변수에서 가져오기
const SUPABASE_URL = Config.SUPABASE_URL;
const SUPABASE_ANON_KEY = Config.SUPABASE_ANON_KEY;

// 환경 변수 검증 및 디버깅 정보
const missingVars = [];
if (!SUPABASE_URL) missingVars.push('SUPABASE_URL');
if (!SUPABASE_ANON_KEY) missingVars.push('SUPABASE_ANON_KEY');

if (missingVars.length > 0) {
  console.error('Supabase 환경 변수 누락:', missingVars);
  console.error('현재 설정된 값들:', {
    SUPABASE_URL: SUPABASE_URL ? '설정됨' : '누락',
    SUPABASE_ANON_KEY: SUPABASE_ANON_KEY ? '설정됨' : '누락'
  });
  
  throw new Error(
    `Supabase 환경 변수가 설정되지 않았습니다: ${missingVars.join(', ')}\n` +
    '프로젝트 루트에 .env 파일을 생성하고 필요한 변수들을 설정하세요.\n' +
    '예시: SUPABASE_URL=your_supabase_url'
  );
}

console.log('Supabase 설정 로드 완료:', {
  url: SUPABASE_URL,
  hasAnonKey: !!SUPABASE_ANON_KEY
});

// React Native Hermes 호환성을 위한 Supabase 클라이언트 생성
export const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
  auth: {
    persistSession: false, // 세션 지속 비활성화
    autoRefreshToken: false, // 자동 토큰 갱신 비활성화
  },
  global: {
    fetch: fetch, // React Native fetch 사용
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
});

// 인화 요청 데이터 타입 정의
export interface PrintRequest {
  id?: string;
  image_url: string;
  quantity: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  frame_type: string;
  theme?: string;
  created_at?: string;
  updated_at?: string;
  cloudinary_public_id?: string;
  local_image_filename?: string;
  device_id?: string;
  user_agent?: string;
}

// 인화 요청 테이블 타입 정의
export interface PrintRequestTable {
  id: string;
  image_url: string;
  quantity: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  frame_type: string;
  theme: string | null;
  created_at: string;
  updated_at: string;
  cloudinary_public_id: string | null;
  local_image_filename: string | null;
  device_id: string | null;
  user_agent: string | null;
}

export class SupabaseService {
  /**
   * 인화 요청 데이터를 Supabase에 저장
   */
  static async createPrintRequest(printRequest: Omit<PrintRequest, 'id' | 'created_at' | 'updated_at'>): Promise<PrintRequest> {
    try {
      console.log('인화 요청 데이터 저장 시작:', printRequest);
      
      const { data, error } = await supabase
        .from('print_requests')
        .insert([{
          image_url: printRequest.image_url,
          quantity: printRequest.quantity,
          status: printRequest.status,
          frame_type: printRequest.frame_type,
          theme: printRequest.theme || null,
          cloudinary_public_id: printRequest.cloudinary_public_id || null,
          local_image_filename: printRequest.local_image_filename || null,
          device_id: printRequest.device_id || null,
          user_agent: printRequest.user_agent || null,
        }])
        .select()
        .single();

      if (error) {
        console.error('인화 요청 저장 실패:', error);
        throw new Error(`인화 요청 저장 실패: ${error.message}`);
      }

      console.log('인화 요청 저장 성공:', data);
      return data as PrintRequest;
    } catch (error) {
      console.error('Supabase 인화 요청 저장 오류:', error);
      throw error;
    }
  }

  /**
   * 인화 요청 상태 업데이트
   */
  static async updatePrintRequestStatus(id: string, status: PrintRequest['status']): Promise<void> {
    try {
      const { error } = await supabase
        .from('print_requests')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('인화 요청 상태 업데이트 실패:', error);
        throw new Error(`상태 업데이트 실패: ${error.message}`);
      }

      console.log('인화 요청 상태 업데이트 성공:', { id, status });
    } catch (error) {
      console.error('Supabase 상태 업데이트 오류:', error);
      throw error;
    }
  }

  /**
   * 인화 요청 목록 조회
   */
  static async getPrintRequests(limit: number = 50): Promise<PrintRequest[]> {
    try {
      const { data, error } = await supabase
        .from('print_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('인화 요청 목록 조회 실패:', error);
        throw new Error(`목록 조회 실패: ${error.message}`);
      }

      return data as PrintRequest[];
    } catch (error) {
      console.error('Supabase 인화 요청 목록 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 특정 인화 요청 조회
   */
  static async getPrintRequest(id: string): Promise<PrintRequest | null> {
    try {
      const { data, error } = await supabase
        .from('print_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // 데이터를 찾을 수 없음
          return null;
        }
        console.error('인화 요청 조회 실패:', error);
        throw new Error(`조회 실패: ${error.message}`);
      }

      return data as PrintRequest;
    } catch (error) {
      console.error('Supabase 인화 요청 조회 오류:', error);
      throw error;
    }
  }
}

export default SupabaseService;
