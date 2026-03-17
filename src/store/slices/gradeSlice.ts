import React from 'react';
import { GradeState } from '../types';

// GradeData 슬라이스
export interface GradeSlice extends GradeState {
  updateGradeData: (index: number, updates: any) => void;
  resetGradeData: () => void;
}

// 기본 GradeData (label만 포함, 나머지는 '-')
const getDefaultGradeData = () => [
  {
    label: {
      title: '법규 기준',
      subTitle: '에너지 자립률',
    },
    grade: 0,
    zebGrade: 0,
    creator: 0,
    consume: 0,
  },
  {
    label: {
      title: 'ZEB 사전 진단',
      subTitle: '에너지 자립률',
    },
    grade: 0,
    zebGrade: 0,
    creator: 0,
    consume: 0,
  },
  {
    label: {
      title: 'ZEB 목표 설정',
      subTitle: '에너지 자립률',
    },
    grade: 0,
    zebGrade: 0,
    creator: 0,
    consume: 0,
  },
  {
    label: {
      title: 'ZEB 성능 편집',
      subTitle: '에너지 자립률',
    },
    grade: 0,
    zebGrade: 0,
    creator: 0,
    consume: 0,
  },
];

export const createGradeSlice = (set: any) => ({
  gradeData: getDefaultGradeData(),

  updateGradeData: (
    index: number,
    updates: Partial<Omit<GradeState['gradeData'][0], 'label'>>,
  ) =>
    set(
      (state: any) => ({
        gradeData: state.gradeData.map((item: any, i: number) =>
          i === index ? { ...item, ...updates } : item,
        ),
      }),
      false,
      'grade/updateGradeData',
    ),

  resetGradeData: () =>
    set({ gradeData: getDefaultGradeData() }, false, 'grade/resetGradeData'),
});
