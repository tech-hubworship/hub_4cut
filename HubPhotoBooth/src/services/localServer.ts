import RNFS from 'react-native-fs';
import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 로컬 서버 설정
// AsyncStorage에서 우선 사용, 없으면 .env에서, 그것도 없으면 기본값
const getServerUrl = async (): Promise<string> => {
  try {
    const savedIP = await AsyncStorage.getItem('LOCAL_SERVER_IP');
    const savedPort = await AsyncStorage.getItem('LOCAL_SERVER_PORT');
    
    if (savedIP) {
      const port = savedPort || '5001';
      const url = `http://${savedIP}:${port}`;
      console.log('📡 AsyncStorage에서 서버 URL 사용:', url);
      return url;
    }
    
    const envUrl = Config.LOCAL_SERVER_URL || 'http://192.168.0.15:5001';
    console.log('📡 .env에서 서버 URL 사용:', envUrl);
    return envUrl;
  } catch (error) {
    console.error('서버 URL 가져오기 실패, 기본값 사용:', error);
    return Config.LOCAL_SERVER_URL || 'http://192.168.0.15:5001';
  }
};

export interface LocalServerUploadResult {
  success: boolean;
  filename: string;
  filepath: string;
  size: number;
  timestamp: string;
}

export class LocalServerService {
  /**
   * 서버 상태 확인
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const serverUrl = await getServerUrl();
      const fullUrl = `${serverUrl}/health`;
      
      console.log('🔍 연결 테스트 시도:', {
        serverUrl,
        fullUrl,
        timestamp: new Date().toISOString()
      });
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      console.log('📡 응답 수신:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ 로컬 서버 연결 성공:', data);
        return true;
      }
      
      console.warn('⚠️ 서버 응답 실패:', response.status);
      return false;
    } catch (error: any) {
      console.error('❌ 로컬 서버 연결 실패:', {
        message: error?.message || '알 수 없는 오류',
        name: error?.name,
        type: typeof error
      });
      return false;
    }
  }

  /**
   * 원본 고해상도 사진을 로컬 서버에 업로드
   */
  static async uploadOriginalPhoto(imageUri: string): Promise<LocalServerUploadResult> {
    try {
      console.log('📤 원본 사진 로컬 서버 업로드 시작:', imageUri);
      
      const serverUrl = await getServerUrl();
      
      // 파일 경로 정리
      const cleanUri = imageUri.replace('file://', '');
      
      // 파일 정보 가져오기
      const fileInfo = await RNFS.stat(cleanUri);
      const fileName = cleanUri.split('/').pop() || 'photo.jpg';
      
      // FormData 생성
      const formData = new FormData();
      formData.append('photo', {
        uri: imageUri,
        type: 'image/jpeg',
        name: fileName,
      } as any);
      
      console.log('📤 로컬 서버로 전송 중...', {
        url: `${serverUrl}/api/upload-photo`,
        fileName,
        size: fileInfo.size
      });
      
      // 로컬 서버로 업로드
      const response = await fetch(`${serverUrl}/api/upload-photo`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`로컬 서버 업로드 실패: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ 로컬 서버 업로드 성공:', result);
      
      return result;
    } catch (error) {
      console.error('❌ 로컬 서버 업로드 실패:', error);
      throw new Error('로컬 서버에 사진 업로드를 실패했습니다.');
    }
  }

  /**
   * 저장된 사진 목록 조회
   */
  static async getPhotoList(): Promise<any[]> {
    try {
      const serverUrl = await getServerUrl();
      const response = await fetch(`${serverUrl}/photos/list`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('목록 조회 실패');
      }

      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error('❌ 사진 목록 조회 실패:', error);
      return [];
    }
  }
}

export default LocalServerService;
