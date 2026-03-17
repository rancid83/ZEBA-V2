'use client';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import { useStore } from '@/store';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
);

const labels = [
  '지자체 에너지 절약 법규 기준',
  '[STEP-1] ZEB 사전 진단',
  '[STEP-2] ZEB 목표 설정',
  '[STEP-3] ZEB 성능 편집',
];

export function BarChart(props: any) {
  const [data, setData] = useState<any>({
    labels,
    datasets: [],
  });
  const [changeOptions, setChangeOptions] = useState<any>({
    plugins: {
      datalabels: {
        display: false, // 기본 데이터 라벨 숨김
      },
    },
    responsive: true,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  });
  const { isEnergyTap, gradeData } = props;
  const { chartMaxValue } = useStore();
  const isEnergyTapConsume = (type: string) => {
    if (gradeData) {
      return gradeData.map((item: any) => {
        return item[type];
      });
    }

    return [0, 0, 0, 0];
  };

  useEffect(() => {
    setChangeOptions({
      ...changeOptions,
      plugins: {
        datalabels: {
          display: true,
          anchor: 'center',
          align: 'center',
          color: '#000000',
          font: {
            size: 14,
            weight: '500',
          },
          textStrokeColor: '#FFFFFF', // 텍스트 외곽선 색상
          textStrokeWidth: 3, // 텍스트 외곽선 두께
          textShadowColor: 'rgba(0, 0, 0, 0.5)', // 텍스트 그림자 색상
          textShadowBlur: 6, // 텍스트 그림자 흐림 정도
          formatter: (value: number) => {
            return value > 0 ? value.toLocaleString() + ` ${props.unit}` : '';
          },
        },
      },
      scales: {
        ...changeOptions.scales,
        y: {
          ...changeOptions.scales.y,
          afterDataLimits: (scale: any) => {
            // Chart.js가 자동으로 계산한 최댓값 가져오기
            const autoMax = scale.max;
            // 더 큰 비율로 설정 (예: 50% 여유 공간)
            scale.max = Math.ceil(autoMax * 2);
          },
        },
      },
    });

    setData({
      labels,
      datasets: isEnergyTap
        ? [
            {
              label: '1차 에너지 생산량',
              data: labels.map((item, idx) => {
                return isEnergyTapConsume('consume')[idx];
              }),
              backgroundColor: 'rgba(29, 181, 190, 0.79)',
            },
            {
              label: '1차 에너지 소비량',
              data: labels.map((item, idx) => {
                return isEnergyTapConsume('creator')[idx];
              }),
              backgroundColor: 'rgba(213, 250, 252, 0.79)',
            },
          ]
        : [
            {
              label: '패시브',
              data: labels.map((item, idx) => {
                return isEnergyTapConsume('passive')[idx];
              }),
              backgroundColor: 'rgba(29, 181, 190, 0.79)',
            },
            {
              label: '액티브',
              data: labels.map((item, idx) => {
                return isEnergyTapConsume('active')[idx];
              }),
              backgroundColor: 'rgba(117, 227, 234, 0.79)',
            },
            {
              label: '신재생',
              data: labels.map((item, idx) => {
                return isEnergyTapConsume('renewable')[idx];
              }),
              backgroundColor: 'rgba(213, 250, 252, 0.79)',
            },
          ],
    });
  }, [isEnergyTap, gradeData]);

  return <Bar options={changeOptions} data={data} />;
}
