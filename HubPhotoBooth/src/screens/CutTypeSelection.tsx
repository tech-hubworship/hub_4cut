import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { Container, Header } from '../components';
import { colors, typography, spacing, layout, borderRadius } from '../constants/theme';

type CutTypeSelectionNavigationProp = StackNavigationProp<RootStackParamList, 'CutTypeSelection'>;
type CutTypeSelectionRouteProp = RouteProp<RootStackParamList, 'CutTypeSelection'>;

const CutTypeSelection: React.FC = () => {
  const navigation = useNavigation<CutTypeSelectionNavigationProp>();
  const route = useRoute<CutTypeSelectionRouteProp>();
  
  const routeParams = route.params || {};
  const { frameType } = routeParams;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSelectVertical = () => {
    navigation.navigate('CameraCapture', {
      basicFrameType: '2x6',
    });
  };

  const handleSelectGrid = () => {
    navigation.navigate('CameraCapture', {
      basicFrameType: '4x6',
    });
  };

  return (
    <Container padding="none" backgroundColor={colors.primary}>
      <Header
        title="컷 유형 선택"
        onBack={handleBack}
        showBack
      />
      
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          원하는 레이아웃을 선택해 주세요
        </Text>
        
        <View style={styles.optionsContainer}>
          {/* 세로형 그리드 옵션 */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={handleSelectVertical}
            activeOpacity={0.8}
          >
            <Text style={styles.optionTitle}>세로형 그리드</Text>
            <View style={styles.previewContainer}>
              <View style={styles.verticalPreview}>
                <View style={styles.verticalStrip}>
                  <View style={styles.photoSlot} />
                  <View style={styles.photoSlot} />
                  <View style={styles.photoSlot} />
                  <View style={styles.photoSlot} />
                </View>
              </View>
            </View>
          </TouchableOpacity>
          
          {/* 2x2 그리드 옵션 */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={handleSelectGrid}
            activeOpacity={0.8}
          >
            <Text style={styles.optionTitle}>2x2 그리드</Text>
            <View style={styles.previewContainer}>
              <View style={styles.gridPreview}>
                <View style={styles.gridFrame}>
                  <View style={styles.gridPhotoSlots}>
                    <View style={styles.gridPhotoSlot} />
                    <View style={styles.gridPhotoSlot} />
                    <View style={styles.gridPhotoSlot} />
                    <View style={styles.gridPhotoSlot} />
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: layout.padding.screen,
    paddingTop: spacing.xl,
  },
  subtitle: {
    fontFamily: 'Pretendard',
    fontWeight: '400',
    fontSize: typography.fontSize.lg,
    lineHeight: 33.4,
    letterSpacing: typography.letterSpacing.normal,
    textAlign: 'center',
    color: colors.textGray,
    marginBottom: spacing.xxl,
  },
  optionsContainer: {
    flex: 1,
    gap: spacing.xl,
  },
  optionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
  },
  optionTitle: {
    fontFamily: 'Pretendard',
    fontWeight: '700',
    fontSize: typography.fontSize.xl,
    lineHeight: 38.2,
    letterSpacing: typography.letterSpacing.tight,
    color: colors.white,
    marginBottom: spacing.lg,
  },
  previewContainer: {
    alignItems: 'center',
  },
  verticalPreview: {
    alignItems: 'center',
  },
  verticalStrip: {
    width: 160,
    height: 240,
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    justifyContent: 'space-between',
  },
  photoSlot: {
    width: '100%',
    height: 40,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
  },
  gridPreview: {
    alignItems: 'center',
  },
  gridFrame: {
    width: 240,
    height: 240,
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
  },
  gridPhotoSlots: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridPhotoSlot: {
    width: '45%',
    height: '45%',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
  },
});

export default CutTypeSelection;
