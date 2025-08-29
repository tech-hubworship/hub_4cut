import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Button } from '../components/common/Button';
import { RootStackParamList } from '../types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type PhotoCaptureScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PhotoCapture'>;

const PhotoCaptureScreen: React.FC = () => {
  const navigation = useNavigation<PhotoCaptureScreenNavigationProp>();
  const [showBasicFrameModal, setShowBasicFrameModal] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSelectBasicFrame = () => {
    setShowBasicFrameModal(true);
  };

  const handleSelectBasicFrameType = (frameType: 'vertical' | 'grid') => {
    setShowBasicFrameModal(false);
    navigation.navigate('CameraCapture', { 
      frameType: 'basic',
      basicFrameType: frameType 
    });
  };

  const handleSelectSpecialFrame = () => {
    navigation.navigate('FrameSelection', { frameType: 'special' });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>프레임 선택</Text>
        <Text style={styles.headerSubtitle}>원하는 프레임을 선택하고 촬영을 시작하세요</Text>
      </View>

      {/* 프레임 선택 영역 */}
      <View style={styles.frameSelectionContainer}>
        {/* 기본 프레임 옵션 */}
        <TouchableOpacity
          style={styles.frameOption}
          onPress={handleSelectBasicFrame}
          activeOpacity={0.8}
        >
          <View style={styles.frameHeader}>
            <Text style={styles.frameTitle}>기본프레임</Text>
          </View>

          {/* 기본 프레임 예시 - 세로형과 그리드형 모두 표시 */}
          <View style={styles.frameExamples}>
            <View style={styles.verticalStrip}>
              <View style={styles.photoSlot} />
              <View style={styles.photoSlot} />
              <View style={styles.photoSlot} />
              <View style={styles.photoSlot} />
              <Text style={styles.brandLogo}>인생네컷</Text>
            </View>
            <View style={styles.gridFrame}>
              <View style={styles.gridPhotoSlots}>
                <View style={styles.gridPhotoSlot} />
                <View style={styles.gridPhotoSlot} />
                <View style={styles.gridPhotoSlot} />
                <View style={styles.gridPhotoSlot} />
              </View>
              <Text style={styles.brandLogo}>인생네컷</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 특수 프레임 옵션 */}
        <TouchableOpacity
          style={[styles.frameOption, styles.specialFrameOption]}
          onPress={handleSelectSpecialFrame}
          activeOpacity={0.8}
        >
          <View style={styles.frameHeader}>
            <Text style={[styles.frameTitle, styles.frameTitleWhite]}>특수프레임</Text>
          </View>

          {/* 특수 프레임 예시 - 한 개만 */}
          <View style={styles.frameExamples}>
            <View style={styles.gridFrame}>
              <View style={styles.gridPhotoSlots}>
                <View style={styles.gridPhotoSlot} />
                <View style={styles.gridPhotoSlot} />
                <View style={styles.gridPhotoSlot} />
                <View style={styles.gridPhotoSlot} />
              </View>
              <Text style={styles.brandLogo}>인생네컷</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* 하단 버튼 */}
      <View style={styles.bottomContainer}>
        <Button
          title="뒤로가기"
          onPress={handleBack}
          variant="outline"
          size="medium"
          style={styles.backButton}
        />
      </View>

      {/* 기본 프레임 타입 선택 모달 */}
      <Modal
        visible={showBasicFrameModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBasicFrameModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>기본 프레임 타입 선택</Text>
            <Text style={styles.modalSubtitle}>원하는 레이아웃을 선택하세요</Text>

            {/* 4장 세로 배치 옵션 */}
            <TouchableOpacity
              style={styles.frameTypeOption}
              onPress={() => handleSelectBasicFrameType('vertical')}
              activeOpacity={0.8}
            >
              <View style={styles.frameTypeHeader}>
                <Text style={styles.frameTypeTitle}>4장 세로 배치</Text>
                <Text style={styles.frameTypeSubtitle}>사진 사이즈: 2x6</Text>
              </View>
              <View style={styles.frameTypeExample}>
                <View style={styles.verticalStripSmall}>
                  <View style={styles.photoSlotSmall} />
                  <View style={styles.photoSlotSmall} />
                  <View style={styles.photoSlotSmall} />
                  <View style={styles.photoSlotSmall} />
                  <Text style={styles.brandLogoSmall}>인생네컷</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* 2장x2장 그리드 배치 옵션 */}
            <TouchableOpacity
              style={styles.frameTypeOption}
              onPress={() => handleSelectBasicFrameType('grid')}
              activeOpacity={0.8}
            >
              <View style={styles.frameTypeHeader}>
                <Text style={styles.frameTypeTitle}>2장x2장 그리드</Text>
                <Text style={styles.frameTypeSubtitle}>사진 사이즈: 4x6</Text>
              </View>
              <View style={styles.frameTypeExample}>
                <View style={styles.gridFrameSmall}>
                  <View style={styles.gridPhotoSlotsSmall}>
                    <View style={styles.gridPhotoSlotSmall} />
                    <View style={styles.gridPhotoSlotSmall} />
                    <View style={styles.gridPhotoSlotSmall} />
                    <View style={styles.gridPhotoSlotSmall} />
                  </View>
                  <Text style={styles.brandLogoSmall}>인생네컷</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* 취소 버튼 */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowBasicFrameModal(false)}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  frameSelectionContainer: {
    flex: 1,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  frameOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flex: 0.48, // 가로 배치를 위해 너비 조정
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'space-between',
  },
  specialFrameOption: {
    backgroundColor: '#666666',
  },
  frameHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  frameTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B9D',
    textAlign: 'center',
  },
  frameTitleWhite: {
    color: '#FFFFFF',
  },
  frameExamples: {
    marginBottom: 20,
    alignItems: 'center',
  },
  verticalStrip: {
    width: 60,
    height: 200,
    backgroundColor: '#000000',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  photoSlot: {
    width: '100%',
    height: 35,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    borderRadius: 4,
  },
  brandLogo: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  gridFrame: {
    width: 120,
    height: 120,
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridPhotoSlots: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridPhotoSlot: {
    width: '45%',
    height: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  framePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
  },
  framePriceWhite: {
    color: '#FFFFFF',
  },
  frameDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  frameDescriptionWhite: {
    color: '#FFFFFF',
  },
  bottomContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  backButton: {
    width: 200,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  frameTypeOption: {
    width: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  frameTypeHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  frameTypeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  frameTypeSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  frameTypeExample: {
    alignItems: 'center',
  },
  verticalStripSmall: {
    width: 60,
    height: 150,
    backgroundColor: '#000000',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  photoSlotSmall: {
    width: '100%',
    height: 30,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    borderRadius: 4,
  },
  brandLogoSmall: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  gridFrameSmall: {
    width: 120,
    height: 120,
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridPhotoSlotsSmall: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridPhotoSlotSmall: {
    width: '45%',
    height: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default PhotoCaptureScreen;
