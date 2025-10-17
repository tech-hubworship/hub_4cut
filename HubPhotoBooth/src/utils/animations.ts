import { CardStyleInterpolator } from '@react-navigation/stack';

// 페이드 인 애니메이션
export const fadeInAnimation: CardStyleInterpolator = ({ current }) => ({
  cardStyle: {
    opacity: current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
  },
});

// 슬라이드 업 애니메이션 (아래에서 위로)
export const slideUpAnimation: CardStyleInterpolator = ({ current, layouts }) => ({
  cardStyle: {
    transform: [
      {
        translateY: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [layouts.screen.height, 0],
        }),
      },
    ],
  },
});

// 슬라이드 다운 애니메이션 (위에서 아래로)
export const slideDownAnimation: CardStyleInterpolator = ({ current, layouts }) => ({
  cardStyle: {
    transform: [
      {
        translateY: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [-layouts.screen.height, 0],
        }),
      },
    ],
  },
});

// 스케일 + 페이드 애니메이션
export const scaleFadeAnimation: CardStyleInterpolator = ({ current }) => ({
  cardStyle: {
    opacity: current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    transform: [
      {
        scale: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.9, 1],
        }),
      },
    ],
  },
});

// 슬라이드 + 스케일 애니메이션
export const slideScaleAnimation: CardStyleInterpolator = ({ current, layouts }) => ({
  cardStyle: {
    opacity: current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
    }),
    transform: [
      {
        translateX: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [layouts.screen.width * 0.3, 0],
        }),
      },
      {
        scale: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.9, 1],
        }),
      },
    ],
  },
});

// 모달 애니메이션 (중앙에서 확대)
export const modalAnimation: CardStyleInterpolator = ({ current }) => ({
  cardStyle: {
    opacity: current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    transform: [
      {
        scale: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
      },
    ],
  },
  overlayStyle: {
    opacity: current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.5],
    }),
  },
});

// 기본 슬라이드 애니메이션 (오른쪽에서 왼쪽으로)
export const slideRightAnimation: CardStyleInterpolator = ({ current, layouts }) => ({
  cardStyle: {
    transform: [
      {
        translateX: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [layouts.screen.width, 0],
        }),
      },
    ],
  },
});

// 왼쪽에서 오른쪽으로 슬라이드 (뒤로가기용)
export const slideLeftAnimation: CardStyleInterpolator = ({ current, layouts }) => ({
  cardStyle: {
    transform: [
      {
        translateX: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [-layouts.screen.width, 0],
        }),
      },
    ],
  },
});

// 애니메이션 설정 객체
export const animationConfigs = {
  // 모달 스타일 화면들
  modal: {
    cardStyleInterpolator: modalAnimation,
    transitionSpec: {
      open: {
        animation: 'spring' as const,
        config: {
          damping: 15,
          stiffness: 150,
          mass: 1,
        },
      },
      close: {
        animation: 'timing' as const,
        config: {
          duration: 200,
        },
      },
    },
    cardStyle: {
      backgroundColor: 'transparent',
    },
  },
  
  // 카메라/촬영 화면들
  camera: {
    cardStyleInterpolator: slideUpAnimation,
    transitionSpec: {
      open: {
        animation: 'spring' as const,
        config: {
          damping: 12,
          stiffness: 100,
          mass: 1,
        },
      },
      close: {
        animation: 'timing' as const,
        config: {
          duration: 250,
        },
      },
    },
    cardStyle: {
      backgroundColor: 'transparent',
    },
  },
  
  // 편집 화면들
  edit: {
    cardStyleInterpolator: slideScaleAnimation,
    transitionSpec: {
      open: {
        animation: 'spring' as const,
        config: {
          damping: 15,
          stiffness: 120,
          mass: 1,
        },
      },
      close: {
        animation: 'timing' as const,
        config: {
          duration: 220,
        },
      },
    },
    cardStyle: {
      backgroundColor: 'transparent',
    },
  },
  
  // 프리뷰 화면들
  preview: {
    cardStyleInterpolator: scaleFadeAnimation,
    transitionSpec: {
      open: {
        animation: 'spring' as const,
        config: {
          damping: 18,
          stiffness: 140,
          mass: 0.8,
        },
      },
      close: {
        animation: 'timing' as const,
        config: {
          duration: 200,
        },
      },
    },
    cardStyle: {
      backgroundColor: 'transparent',
    },
  },
  
  // 기본 화면들
  default: {
    cardStyleInterpolator: slideRightAnimation,
    transitionSpec: {
      open: {
        animation: 'timing' as const,
        config: {
          duration: 280,
        },
      },
      close: {
        animation: 'timing' as const,
        config: {
          duration: 220,
        },
      },
    },
    cardStyle: {
      backgroundColor: 'transparent',
    },
  },
};
