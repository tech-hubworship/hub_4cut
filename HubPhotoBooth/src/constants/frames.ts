import { PhotoFrameTemplate, FrameTemplateCategory } from '../types';

// 기본 프레임들
export const basicFrames: PhotoFrameTemplate[] = [
  {
    id: 'basic_1',
    name: '클래식 화이트',
    category: 'basic',
    imagePath: 'basic/classic_white.png',
    frameDescription: '깔끔하고 심플한 화이트 프레임'
  },
  {
    id: 'basic_2',
    name: '모던 블랙',
    category: 'basic',
    imagePath: 'basic/modern_black.png',
    frameDescription: '세련된 블랙 프레임'
  },
  {
    id: 'basic_3',
    name: '우드 그레인',
    category: 'basic',
    imagePath: 'basic/wood_grain.png',
    frameDescription: '자연스러운 나무 질감 프레임'
  },
  {
    id: 'basic_4',
    name: '미니멀 그레이',
    category: 'basic',
    imagePath: 'basic/minimal_gray.png',
    frameDescription: '미니멀한 그레이 프레임'
  },
  {
    id: 'basic_5',
    name: '엘레간트 골드',
    category: 'basic',
    imagePath: 'basic/elegant_gold.png',
    frameDescription: '고급스러운 골드 프레임'
  }
];

// 특수 프레임들
export const specialFrames: PhotoFrameTemplate[] = [
  {
    id: 'special_christmas_1',
    name: '크리스마스 트리',
    category: 'christmas',
    imagePath: 'special/christmas_tree.png',
    frameDescription: '크리스마스 트리 모양의 특별한 프레임'
  },
  {
    id: 'special_christmas_2',
    name: '크리스마스 스노우',
    category: 'christmas',
    imagePath: 'special/christmas_snow.png',
    frameDescription: '눈송이가 날리는 크리스마스 프레임'
  },
  {
    id: 'special_easter_1',
    name: '부활절 달걀',
    category: 'easter',
    imagePath: 'special/easter_eggs.png',
    frameDescription: '부활절 달걀과 꽃이 있는 프레임'
  },
  {
    id: 'special_summer_1',
    name: '여름 바다',
    category: 'summer',
    imagePath: 'special/summer_ocean.png',
    frameDescription: '파도와 조개가 있는 여름 프레임'
  },
  {
    id: 'special_autumn_1',
    name: '가을 단풍',
    category: 'autumn',
    imagePath: 'special/autumn_leaves.png',
    frameDescription: '단풍잎이 떨어지는 가을 프레임'
  },
  {
    id: 'special_wedding_1',
    name: '웨딩 로맨틱',
    category: 'wedding',
    imagePath: 'special/wedding_romantic.png',
    frameDescription: '로맨틱한 웨딩 프레임'
  }
];

// 프레임 카테고리별로 그룹화
export const frameCategories: FrameTemplateCategory[] = [
  {
    id: 'basic',
    name: '기본 프레임',
    frames: basicFrames
  },
  {
    id: 'christmas',
    name: '크리스마스',
    frames: specialFrames.filter(f => f.category === 'christmas')
  },
  {
    id: 'easter',
    name: '부활절',
    frames: specialFrames.filter(f => f.category === 'easter')
  },
  {
    id: 'summer',
    name: '여름',
    frames: specialFrames.filter(f => f.category === 'summer')
  },
  {
    id: 'autumn',
    name: '가을',
    frames: specialFrames.filter(f => f.category === 'autumn')
  },
  {
    id: 'wedding',
    name: '웨딩',
    frames: specialFrames.filter(f => f.category === 'wedding')
  }
];

// 프레임 타입별로 가져오기
export const getFramesByType = (frameType: 'basic' | 'special') => {
  if (frameType === 'basic') {
    return basicFrames;
  } else {
    return specialFrames;
  }
};

// 카테고리별 프레임 가져오기
export const getFramesByCategory = (category: string) => {
  return frameCategories.find(cat => cat.id === category)?.frames || [];
};
