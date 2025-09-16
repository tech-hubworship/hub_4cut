import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { Container, Header } from '../components';
import { colors, typography, spacing, layout, borderRadius } from '../constants/theme';

const { width, height } = Dimensions.get('window');

// 기준 레이아웃 크기
const BASE_WIDTH = 834;
const BASE_HEIGHT = 1194;

// 비율 계산
const scaleX = width / BASE_WIDTH;
const scaleY = height / BASE_HEIGHT;
const scale = Math.min(scaleX, scaleY);

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
    navigation.navigate('Vertical4CutCameraCapture' as any);
  };

  const handleSelectGrid = () => {
    navigation.navigate('Grid2x2CameraCapture' as any);
  };

  return (
    <Container padding="none" backgroundColor={colors.primary}>
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <Image
            source={require('../../assets/icon/icon_back.png')}
            style={styles.backButtonImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>컷 유형 선택</Text>
        
        <Text style={styles.subtitle}>
          원하는 레이아웃을 선택해 주세요
        </Text>
        
        <View style={styles.cutSelectionContainer}>
          <TouchableOpacity
            style={styles.cutButton1}
            onPress={handleSelectVertical}
            activeOpacity={0.8}
          >
            <Image
              source={require('../../assets/image/cut_grid_1.png')}
              style={styles.cutButtonImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.cutButton2}
            onPress={handleSelectGrid}
            activeOpacity={0.8}
          >
            <Image
              source={require('../../assets/image/cut_grid_2.png')}
              style={styles.cutButtonImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  backButton: {
    width: 52 * scale,
    height: 52 * scale,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  backButtonImage: {
    width: '100%',
    height: '100%',
  },
  headerTitle: {
    fontFamily: 'Pretendard',
    fontWeight: '700',
    fontSize: 44 * scale,
    letterSpacing: -0.03 * 44 * scale,
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: spacing.md,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: layout.padding.screen,
    paddingTop: spacing.lg,
    alignItems: 'center',
  },
  subtitle: {
    fontFamily: 'Pretendard',
    fontWeight: '400',
    fontSize: 28 * scale,
    letterSpacing: -0.03 * 28 * scale,
    textAlign: 'center',
    color: '#AAAAAA',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    alignSelf: 'center',
    marginHorizontal: spacing.lg,
  },
  cutSelectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  cutButton1: {
    width: 516 * scaleX,
    height: 360 * scaleY,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  cutButton2: {
    width: 516 * scaleX,
    height: 360 * scaleY,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  cutButtonImage: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.xl,
  },
});

export default CutTypeSelection;
