import AsyncStorage from '@react-native-async-storage/async-storage';

// 스토리지 서비스 클래스
class StorageService {
  // 데이터 저장
  async setItem(key: string, value: any): Promise<void> {
    try {
      const serializedValue =
        typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Storage setItem error for key ${key}:`, error);
      throw new Error(`데이터 저장에 실패했습니다: ${key}`);
    }
  }

  // 데이터 가져오기
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Storage getItem error for key ${key}:`, error);
      throw new Error(`데이터 불러오기에 실패했습니다: ${key}`);
    }
  }

  // 데이터 제거
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Storage removeItem error for key ${key}:`, error);
      throw new Error(`데이터 제거에 실패했습니다: ${key}`);
    }
  }

  // 모든 데이터 제거
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
      throw new Error('모든 데이터 제거에 실패했습니다.');
    }
  }

  // 모든 키 가져오기
  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Storage getAllKeys error:', error);
      throw new Error('키 목록을 가져올 수 없습니다.');
    }
  }

  // 여러 키의 데이터 가져오기
  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    try {
      return await AsyncStorage.multiGet(keys);
    } catch (error) {
      console.error('Storage multiGet error:', error);
      throw new Error('여러 데이터를 가져올 수 없습니다.');
    }
  }

  // 여러 키의 데이터 저장
  async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    try {
      await AsyncStorage.multiSet(keyValuePairs);
    } catch (error) {
      console.error('Storage multiSet error:', error);
      throw new Error('여러 데이터를 저장할 수 없습니다.');
    }
  }

  // 여러 키의 데이터 제거
  async multiRemove(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Storage multiRemove error:', error);
      throw new Error('여러 데이터를 제거할 수 없습니다.');
    }
  }

  // 특정 패턴의 키들 제거
  async removeItemsByPattern(pattern: RegExp): Promise<void> {
    try {
      const allKeys = await this.getAllKeys();
      const keysToRemove = allKeys.filter(key => pattern.test(key));

      if (keysToRemove.length > 0) {
        await this.multiRemove(keysToRemove);
      }
    } catch (error) {
      console.error('Storage removeItemsByPattern error:', error);
      throw new Error('패턴에 맞는 데이터 제거에 실패했습니다.');
    }
  }

  // 스토리지 사용량 확인
  async getStorageSize(): Promise<{used: number; total: number}> {
    try {
      // React Native에서는 정확한 스토리지 크기를 가져올 수 없으므로
      // 대략적인 추정치를 반환
      const allKeys = await this.getAllKeys();
      let totalSize = 0;

      for (const key of allKeys) {
        const value = await this.getItem(key);
        if (value) {
          totalSize += key.length + value.length;
        }
      }

      return {
        used: totalSize,
        total: 50 * 1024 * 1024, // 50MB (iOS/Android 기본 제한)
      };
    } catch (error) {
      console.error('Storage getStorageSize error:', error);
      return {used: 0, total: 0};
    }
  }

  // 데이터 백업 (JSON 형태로)
  async exportData(): Promise<string> {
    try {
      const allKeys = await this.getAllKeys();
      const data: Record<string, any> = {};

      for (const key of allKeys) {
        const value = await this.getItem(key);
        if (value) {
          try {
            data[key] = JSON.parse(value);
          } catch {
            data[key] = value;
          }
        }
      }

      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Storage exportData error:', error);
      throw new Error('데이터 백업에 실패했습니다.');
    }
  }

  // 데이터 복원 (JSON 형태에서)
  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      const keyValuePairs: [string, string][] = [];

      for (const [key, value] of Object.entries(data)) {
        keyValuePairs.push([key, JSON.stringify(value)]);
      }

      await this.multiSet(keyValuePairs);
    } catch (error) {
      console.error('Storage importData error:', error);
      throw new Error('데이터 복원에 실패했습니다.');
    }
  }

  // 특정 키가 존재하는지 확인
  async hasKey(key: string): Promise<boolean> {
    try {
      const value = await this.getItem(key);
      return value !== null;
    } catch (error) {
      return false;
    }
  }

  // 특정 키의 데이터 타입 확인
  async getItemType(
    key: string,
  ): Promise<'string' | 'object' | 'number' | 'boolean' | 'null'> {
    try {
      const value = await this.getItem(key);
      if (value === null) {
        return 'null';
      }

      try {
        const parsed = JSON.parse(value);
        if (typeof parsed === 'object' && parsed !== null) {
          return 'object';
        }
        return typeof parsed as 'string' | 'number' | 'boolean';
      } catch {
        return 'string';
      }
    } catch (error) {
      return 'null';
    }
  }

  // 데이터 만료 시간 설정 (TTL)
  async setItemWithTTL(key: string, value: any, ttlMs: number): Promise<void> {
    try {
      const item = {
        value,
        expiresAt: Date.now() + ttlMs,
      };
      await this.setItem(key, item);
    } catch (error) {
      console.error(`Storage setItemWithTTL error for key ${key}:`, error);
      throw new Error(`TTL이 설정된 데이터 저장에 실패했습니다: ${key}`);
    }
  }

  // TTL이 설정된 데이터 가져오기
  async getItemWithTTL(key: string): Promise<any | null> {
    try {
      const item = await this.getItem(key);
      if (!item) {
        return null;
      }

      const parsed = JSON.parse(item);
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        // 만료된 데이터 제거
        await this.removeItem(key);
        return null;
      }

      return parsed.value;
    } catch (error) {
      console.error(`Storage getItemWithTTL error for key ${key}:`, error);
      return null;
    }
  }

  // 만료된 데이터 정리
  async cleanupExpiredItems(): Promise<number> {
    try {
      const allKeys = await this.getAllKeys();
      let cleanedCount = 0;

      for (const key of allKeys) {
        try {
          const item = await this.getItem(key);
          if (item) {
            const parsed = JSON.parse(item);
            if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
              await this.removeItem(key);
              cleanedCount++;
            }
          }
        } catch {
          // 파싱 실패한 데이터는 건너뛰기
          continue;
        }
      }

      return cleanedCount;
    } catch (error) {
      console.error('Storage cleanupExpiredItems error:', error);
      return 0;
    }
  }
}

// 싱글톤 인스턴스 생성
export const storageService = new StorageService();

// 기본 내보내기
export default storageService;
