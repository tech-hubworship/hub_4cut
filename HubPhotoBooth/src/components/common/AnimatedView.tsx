import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface AnimatedViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  animationType?: 'fadeIn' | 'slideUp' | 'scale' | 'slideDown';
  delay?: number;
  duration?: number;
}

const AnimatedView: React.FC<AnimatedViewProps> = ({
  children,
  style,
  animationType = 'fadeIn',
  delay = 0,
  duration = 300,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    const startAnimation = () => {
      const animations: Animated.CompositeAnimation[] = [];

      // 기본 페이드 인 애니메이션
      animations.push(
        Animated.timing(animatedValue, {
          toValue: 1,
          duration,
          delay,
          useNativeDriver: true,
        })
      );

      // 애니메이션 타입에 따른 추가 애니메이션
      switch (animationType) {
        case 'slideUp':
          animations.push(
            Animated.timing(translateY, {
              toValue: 0,
              duration,
              delay,
              useNativeDriver: true,
            })
          );
          break;
        case 'scale':
          animations.push(
            Animated.spring(scale, {
              toValue: 1,
              duration,
              delay,
              useNativeDriver: true,
            })
          );
          break;
        case 'slideDown':
          animations.push(
            Animated.timing(translateY, {
              toValue: 0,
              duration,
              delay,
              useNativeDriver: true,
            })
          );
          break;
      }

      Animated.parallel(animations).start();
    };

    startAnimation();
  }, [animationType, delay, duration]);

  const getAnimatedStyle = () => {
    const baseStyle = {
      opacity: animatedValue,
    };

    switch (animationType) {
      case 'slideUp':
        return {
          ...baseStyle,
          transform: [{ translateY }],
        };
      case 'scale':
        return {
          ...baseStyle,
          transform: [{ scale }],
        };
      case 'slideDown':
        return {
          ...baseStyle,
          transform: [{ translateY: Animated.multiply(translateY, -1) }],
        };
      default:
        return baseStyle;
    }
  };

  return (
    <Animated.View style={[getAnimatedStyle(), style]}>
      {children}
    </Animated.View>
  );
};

export default AnimatedView;
