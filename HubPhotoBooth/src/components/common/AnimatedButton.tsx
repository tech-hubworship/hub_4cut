import React, { useRef } from 'react';
import { Animated, TouchableOpacity, ViewStyle, TextStyle, GestureResponderEvent } from 'react-native';

interface AnimatedButtonProps {
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  animationType?: 'scale' | 'bounce' | 'fade';
  duration?: number;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  style,
  textStyle,
  onPress,
  disabled = false,
  animationType = 'scale',
  duration = 150,
}) => {
  const animatedValue = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;

    const animations: Animated.CompositeAnimation[] = [];

    switch (animationType) {
      case 'scale':
        animations.push(
          Animated.timing(animatedValue, {
            toValue: 0.95,
            duration: duration / 2,
            useNativeDriver: true,
          })
        );
        break;
      case 'bounce':
        animations.push(
          Animated.spring(animatedValue, {
            toValue: 0.9,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
          })
        );
        break;
      case 'fade':
        animations.push(
          Animated.timing(opacity, {
            toValue: 0.7,
            duration: duration / 2,
            useNativeDriver: true,
          })
        );
        break;
    }

    Animated.parallel(animations).start();
  };

  const handlePressOut = () => {
    if (disabled) return;

    const animations: Animated.CompositeAnimation[] = [];

    switch (animationType) {
      case 'scale':
        animations.push(
          Animated.spring(animatedValue, {
            toValue: 1,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
          })
        );
        break;
      case 'bounce':
        animations.push(
          Animated.spring(animatedValue, {
            toValue: 1,
            tension: 300,
            friction: 8,
            useNativeDriver: true,
          })
        );
        break;
      case 'fade':
        animations.push(
          Animated.timing(opacity, {
            toValue: 1,
            duration: duration / 2,
            useNativeDriver: true,
          })
        );
        break;
    }

    Animated.parallel(animations).start();
  };

  const handlePress = (event: GestureResponderEvent) => {
    if (disabled) return;

    // 버튼 눌림 효과
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 0.9,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.spring(animatedValue, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    onPress?.(event);
  };

  const getAnimatedStyle = () => {
    const baseStyle = {
      opacity: disabled ? 0.5 : opacity,
    };

    switch (animationType) {
      case 'scale':
      case 'bounce':
        return {
          ...baseStyle,
          transform: [{ scale: animatedValue }],
        };
      case 'fade':
        return baseStyle;
      default:
        return baseStyle;
    }
  };

  return (
    <Animated.View style={getAnimatedStyle()}>
      <TouchableOpacity
        style={[
          {
            opacity: disabled ? 0.5 : 1,
          },
          style,
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={disabled ? 1 : 0.8}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default AnimatedButton;
