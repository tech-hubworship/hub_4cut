import RNFS from 'react-native-fs';
import Config from 'react-native-config';

// Cloudinary 설정 - 환경 변수에서 가져오기
const CLOUD_NAME = Config.CLOUDINARY_CLOUD_NAME;
const API_KEY = Config.CLOUDINARY_API_KEY;
const API_SECRET = Config.CLOUDINARY_API_SECRET;
const UPLOAD_PRESET = Config.CLOUDINARY_UPLOAD_PRESET;

// 환경 변수 검증 및 디버깅 정보
const missingVars = [];
if (!CLOUD_NAME) missingVars.push('CLOUDINARY_CLOUD_NAME');
if (!API_KEY) missingVars.push('CLOUDINARY_API_KEY');
if (!API_SECRET) missingVars.push('CLOUDINARY_API_SECRET');
// UPLOAD_PRESET은 선택사항이므로 검증에서 제외

if (missingVars.length > 0) {
  console.error('Cloudinary 환경 변수 누락:', missingVars);
  console.error('현재 설정된 값들:', {
    CLOUD_NAME: CLOUD_NAME ? '설정됨' : '누락',
    API_KEY: API_KEY ? '설정됨' : '누락',
    API_SECRET: API_SECRET ? '설정됨' : '누락',
    UPLOAD_PRESET: UPLOAD_PRESET ? '설정됨' : '미설정 (선택사항)'
  });
  
  throw new Error(
    `Cloudinary 환경 변수가 설정되지 않았습니다: ${missingVars.join(', ')}\n` +
    '프로젝트 루트에 .env 파일을 생성하고 필요한 변수들을 설정하세요.\n' +
    '예시: CLOUDINARY_CLOUD_NAME=your_cloud_name'
  );
}

console.log('Cloudinary 설정 로드 완료:', {
  cloudName: CLOUD_NAME,
  uploadPreset: UPLOAD_PRESET || '미설정 (Signed upload 사용)',
  hasApiKey: !!API_KEY,
  hasApiSecret: !!API_SECRET
});


// 업로드 프리셋이 없을 때 사용할 기본 설정
const DEFAULT_UPLOAD_PARAMS = {
  folder: 'hub_photo_booth',
  resource_type: 'image',
  type: 'upload'
};

export interface CloudinaryUploadResult {
  url: string;
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
}

export class CloudinaryService {
  /**
   * 이미지를 Base64로 변환
   */
  private static async imageToBase64(imageUri: string): Promise<string> {
    try {
      // 로컬 파일인 경우 RNFS 사용 (file:// 또는 절대 경로)
      if (imageUri.startsWith('file://') || imageUri.startsWith('/')) {
        const filePath = imageUri.startsWith('file://') ? imageUri : `file://${imageUri}`;
        console.log('로컬 파일 감지, Base64 변환 중:', filePath);
        const base64 = await RNFS.readFile(filePath, 'base64');
        return base64;
      }
      
      // 원격 URL인 경우 - Base64 변환 없이 URL만 반환
      console.log('원격 URL 감지:', imageUri);
      return imageUri;
    } catch (error) {
      console.error('이미지 Base64 변환 실패:', error);
      throw new Error('이미지 변환에 실패했습니다.');
    }
  }

  /**
   * Cloudinary에 이미지 업로드
   * @param imageUri - 이미지 URI
   * @param folder - 저장 폴더
   * @param options - 업로드 옵션 (크기, 품질 조정)
   */
  static async uploadImage(
    imageUri: string, 
    folder: string = 'hub_photo_booth',
    options?: {
      maxWidth?: number; // 최대 너비 (기본: 1500px)
      quality?: number; // 품질 (0-100, 기본: 80)
    }
  ): Promise<CloudinaryUploadResult> {
    try {
      console.log('이미지 업로드 시작:', imageUri, options);
      
      if (imageUri.startsWith('file://') || imageUri.startsWith('/')) {
        // 로컬 파일인 경우 FormData로 업로드
        return await this.uploadLocalFile(imageUri, folder, options);
      } else {
        // 원격 URL인 경우 URL 업로드 방식 사용
        return await this.uploadRemoteUrl(imageUri, folder, options);
      }
    } catch (error) {
      console.error('Cloudinary 업로드 실패:', error);
      throw new Error('이미지 업로드에 실패했습니다.');
    }
  }

  /**
   * 이미지 MIME 타입 감지
   */
  private static detectImageMimeType(imageUri: string): string {
    const lowerUri = imageUri.toLowerCase();
    if (lowerUri.includes('.png')) return 'image/png';
    if (lowerUri.includes('.jpg') || lowerUri.includes('.jpeg')) return 'image/jpeg';
    if (lowerUri.includes('.gif')) return 'image/gif';
    if (lowerUri.includes('.webp')) return 'image/webp';
    // 기본값은 PNG (무손실 압축)
    return 'image/png';
  }

  /**
   * 로컬 파일 업로드
   */
  private static async uploadLocalFile(
    imageUri: string, 
    folder: string,
    options?: { maxWidth?: number; quality?: number }
  ): Promise<CloudinaryUploadResult> {
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    const base64Image = await this.imageToBase64(imageUri);
    
    // 원본 이미지 타입 감지
    const mimeType = this.detectImageMimeType(imageUri);
    
    const formData = new FormData();
    formData.append('file', `data:${mimeType};base64,${base64Image}`);
    // 업로드 프리셋이 없으면 생략 (Signed upload)
    if (UPLOAD_PRESET) {
      formData.append('upload_preset', UPLOAD_PRESET);
    }
    formData.append('folder', folder);
    formData.append('public_id', `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    
    // unsigned upload에서는 transformation을 직접 사용할 수 없으므로
    // 원본 그대로 업로드 (URL 생성 시 transformation 적용)
    
    console.log('로컬 파일 업로드 시도:', {
      url: uploadUrl,
      preset: UPLOAD_PRESET,
      folder: folder,
      mimeType: mimeType,
      imageSize: base64Image.length,
      note: '원본 업로드 (URL 생성 시 리사이즈)'
    });
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('로컬 파일 업로드 실패:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`로컬 파일 업로드 실패: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('로컬 파일 업로드 성공:', result);
    return result;
  }

  /**
   * 원격 URL 업로드
   */
  private static async uploadRemoteUrl(
    imageUri: string, 
    folder: string,
    options?: { maxWidth?: number; quality?: number }
  ): Promise<CloudinaryUploadResult> {
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    
    const formData = new FormData();
    formData.append('file', imageUri);
    // 업로드 프리셋이 없으면 생략 (Signed upload)
    if (UPLOAD_PRESET) {
      formData.append('upload_preset', UPLOAD_PRESET);
    }
    formData.append('folder', folder);
    formData.append('public_id', `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    
    // unsigned upload에서는 transformation을 직접 사용할 수 없으므로
    // 원본 그대로 업로드 (URL 생성 시 transformation 적용)
    
    console.log('원격 URL 업로드 시도:', {
      url: uploadUrl,
      imageUri: imageUri,
      preset: UPLOAD_PRESET,
      folder: folder,
      note: '원본 업로드 (URL 생성 시 리사이즈)'
    });
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('원격 URL 업로드 실패:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`원격 URL 업로드 실패: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('원격 URL 업로드 성공:', result);
    return result;
  }

  /**
   * 여러 이미지를 순차적으로 업로드
   */
  static async uploadMultipleImages(imageUris: string[], folder: string = UPLOAD_PRESET || 'hub_photo_booth'): Promise<CloudinaryUploadResult[]> {
    const results: CloudinaryUploadResult[] = [];
    
    for (let i = 0; i < imageUris.length; i++) {
      try {
        console.log(`이미지 ${i + 1}/${imageUris.length} 업로드 중...`);
        const result = await this.uploadImage(imageUris[i], folder);
        results.push(result);
      } catch (error) {
        console.error(`이미지 ${i + 1} 업로드 실패:`, error);
        // 개별 이미지 업로드 실패 시에도 계속 진행
      }
    }
    
    return results;
  }

  /**
   * 이미지 URL 생성 (변환 옵션 포함)
   * @param publicId - Cloudinary public ID
   * @param options - 변환 옵션
   */
  static generateImageUrl(
    publicId: string,
    options?: {
      width?: number;
      quality?: number;
    }
  ): string {
    const width = options?.width || 1500; // 기본: 1500px
    const quality = options?.quality || 80; // 기본: 80
    
    // Cloudinary transformation URL 생성
    // 형식: https://res.cloudinary.com/{cloud_name}/image/upload/w_{width},q_{quality},f_auto/{public_id}
    const transformation = `w_${width},q_${quality},f_auto`;
    const url = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformation}/${publicId}`;
    
    return url;
  }

  /**
   * QR 코드용 최적화된 이미지 URL 생성
   */
  static generateQRImageUrl(secureUrl: string): string {
    // Cloudinary에서 반환된 실제 URL을 그대로 사용
    // 이미 업로드된 이미지의 secure_url이 가장 안정적
    
    // hubworship.ing/hub4cut?url= 형태로 QR 코드 URL 생성
    return `https://hubworship.ing/hub4cut?url=${encodeURIComponent(secureUrl)}`;
  }
}

export default CloudinaryService;
