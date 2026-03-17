import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useEffect, useState } from 'react';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

export function DoughnutChart(props: any) {
  const [data, setData] = useState<ChartData>({
    labels: ['액티브', '패시브', '신재생'],
    datasets: [
      {
        data: [],
        backgroundColor: [
          'rgba(29, 181, 190, 0.79)',
          'rgba(117, 227, 234, 0.79)',
          'rgba(213, 250, 252, 0.79)',
        ],
        borderColor: ['rgba(255, 255, 255, 1)'],
        borderWidth: 0,
      },
    ],
  });

  const { isEnergyTap, gradeData } = props;

  useEffect(() => {
    const dataSet: ChartData = {
      ...data,
      datasets: [...data.datasets],
    };

    if (gradeData) {
      dataSet.datasets[0].data = [
        Number(gradeData.active) || 0,
        Number(gradeData.passive) || 0,
        Number(gradeData.renewable) || 0,
      ];
    }

    setData(dataSet);
  }, [isEnergyTap, gradeData]);

  return (
    <Doughnut
      data={data}
      options={{
        plugins: {
          datalabels: {
            display: true,
            formatter: (value: number) => {
              if (value === 0) return ''; // 값이 0일 경우 빈 문자열 반환
              return `${Math.round(value).toLocaleString()}%`; // 소수점 제거 및 쉼표 추가
            },
            color: '#000',
            font: {
              size: 14,
            },
            textStrokeColor: '#FFFFFF', // 텍스트 외곽선 색상
            textStrokeWidth: 3, // 텍스트 외곽선 두께
            textShadowColor: 'rgba(0, 0, 0, 0.5)', // 텍스트 그림자 색상
            textShadowBlur: 6, // 텍스트 그림자 흐림 정도
          },
        },
      }}
    />
  );
}
