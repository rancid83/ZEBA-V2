'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Flex, InputNumber, Rate, Slider, SliderSingleProps } from 'antd';
import styles from './EditSlider.module.scss';
import {
  CaretDownOutlined,
  CaretUpOutlined,
  DislikeOutlined,
  LikeOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { useStore } from '@/store';
import { ComponentId } from '@/store/slices/standardModelPerformanceSlice';

interface WindowThermalTransmittanceProps {
  title?: string | null;
  // 숫자형 필드에 null이 들어올 수 있으므로 number | null로 허용
  min?: number | null;
  max?: number | null;
  average?: number | null;
  step?: number | null;
  start?: number | null;
  unit?: string | null;
  rate?: number | null;
  systemType?: string | null;
  subDescription?: string | null;
  type?: string | null;
  id?: string | null;
}

const reverseSliders = [
  'windowUValue',
  'wallUValue',
  'roofUValue',
  'floorUValue',
  'lightingDensity',
];

const EditSlider = ({
  title,
  min = 0,
  max = 0,
  average = 0,
  step = 1,
  start = 0,
  unit = 'W/㎡·K',
  rate = 3,
  systemType = null,
  subDescription = null,
  type = 'template1',
  id = null,
}: WindowThermalTransmittanceProps) => {
  const [currentValue, setCurrentValue] = useState(start || 0);
  const { updateItemData } = useStore();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isReverse = reverseSliders.includes(id || '');

  // 디바운스된 store 업데이트 함수
  const debouncedUpdateStore = useCallback(
    (value: number) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        if (id) {
          updateItemData(id as ComponentId, { start: value });
        }
      }, 300); // 300ms 딜레이
    },
    [id, updateItemData],
  );

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const sliderDetailStyle = {
    marker: {
      improvement: {
        labelColor: isReverse ? '#92E9EF' : '#007676',
        text: isReverse ? '저하' : '개선',
        icon: isReverse ? <DislikeOutlined /> : <LikeOutlined />,
      },
      degradation: {
        labelColor: isReverse ? '#007676' : '#92E9EF',
        text: isReverse ? '개선' : '저하',
        icon: isReverse ? <LikeOutlined /> : <DislikeOutlined />,
      },
    },
    slider: {
      improvement: {
        backgroundColor: isReverse ? '#D5FAFC' : '#1DB5BE',
      },
      degradation: {
        backgroundColor: isReverse ? '#1DB5BE' : '#D5FAFC',
      },
    },
  };

  const marks: SliderSingleProps['marks'] = {
    [min as number]: {
      style: {
        color: '#4E4E4E',
        position: 'relative',
      },
      label: (
        <div
          style={{ textAlign: 'center', position: 'relative', zIndex: 10000 }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-52px',
              left: '50%',
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
              lineHeight: '1.3',
              color: sliderDetailStyle.marker.degradation.labelColor,
            }}
          >
            {sliderDetailStyle.marker.degradation.text}
            <br />
            {sliderDetailStyle.marker.degradation.icon}
          </div>
          <div style={{ marginTop: '3.5px' }}>{min}</div>
        </div>
      ),
    },
    [average as number]: {
      label: (
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              position: 'absolute',
              top: '-52px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#2A4E51',
              whiteSpace: 'nowrap',
              lineHeight: '1.3',
              zIndex: 1,
            }}
          >
            표준
            <br />
            <CaretDownOutlined />
          </div>
          <div style={{ marginTop: '3.5px' }}>{min === average ? min : ''}</div>
        </div>
      ),
    },
    [max as number]: {
      style: {
        color: '#4E4E4E',
      },
      label: (
        <div style={{ textAlign: 'center', position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              top: '-52px',
              left: '50%',
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
              lineHeight: '1.3',
              color: sliderDetailStyle.marker.improvement.labelColor,
            }}
          >
            {sliderDetailStyle.marker.improvement.text}
            <br />
            {sliderDetailStyle.marker.improvement.icon}
          </div>
          <div style={{ marginTop: '3.5px' }}>{max?.toFixed?.(1)}</div>
        </div>
      ),
    },
  };

  const onChangeValue = (newValue: number) => {
    // 슬라이더 드래그 중에는 UI만 업데이트
    setCurrentValue(newValue);
  };

  // Rail(배경)의 색상을 메모이제이션
  const railBackground = useMemo(() => {
    const standard = (average as number) || 0;
    const minVal = (min as number) || 0;
    const maxVal = (max as number) || 0;
    const range = maxVal - minVal || 1;
    const currentPercent =
      ((Math.min(Math.max(currentValue as number, minVal), maxVal) - minVal) /
        range) *
      100;
    const standardPercent =
      ((Math.min(Math.max(standard, minVal), maxVal) - minVal) / range) * 100;

    if (currentValue < standard) {
      // 왼쪽으로 움직였을 때: 현재값부터 표준까지 초록색으로 배경 변경
      return `linear-gradient(to right, #d9d9d9 0%, #d9d9d9 ${currentPercent}%, ${sliderDetailStyle.slider.degradation.backgroundColor} ${currentPercent}%, ${sliderDetailStyle.slider.degradation.backgroundColor} ${standardPercent}%, #d9d9d9 ${standardPercent}%, #d9d9d9 100%)`;
    } else {
      // 표준값이거나 오른쪽으로 움직였을 때: 0부터 표준까지 초록색
      return `linear-gradient(to right, #1DB5BE 0%, #1DB5BE ${standardPercent}%, #d9d9d9 ${standardPercent}%, #d9d9d9 100%)`;
    }
  }, [currentValue, min, max, average]);

  // Track(선택된 부분)의 색상을 메모이제이션
  const trackBackground = useMemo(() => {
    const standard = (average as number) || 0;
    const minVal = (min as number) || 0;
    const maxVal = (max as number) || 0;
    const range = maxVal - minVal || 1;
    const currentPercent =
      ((Math.min(Math.max(currentValue as number, minVal), maxVal) - minVal) /
        range) *
      100;
    const standardPercent =
      ((Math.min(Math.max(standard, minVal), maxVal) - minVal) / range) * 100;

    if (currentValue < standard) {
      // 왼쪽으로 움직였을 때: track은 기본색상
      return '#2A4E51';
    } else if (currentValue > standard) {
      // 오른쪽으로 움직였을 때: 0~표준은 기본색, 표준~현재값은 연한색
      const standardRatio = (standardPercent / currentPercent) * 100;
      return `linear-gradient(to right, #2A4E51 0%, #2A4E51 ${standardRatio}%, ${sliderDetailStyle.slider.improvement.backgroundColor} ${standardRatio}%, ${sliderDetailStyle.slider.improvement.backgroundColor} 100%)`;
    } else {
      // 표준값일 때는 전체 기본색상
      return '#2A4E51';
    }
  }, [currentValue, min, max, average]);

  // 슬라이더 스타일 객체를 메모이제이션하여 깜빡임 방지
  const sliderStyles = useMemo(
    () => ({
      rail: {
        background: railBackground,
      },
      track: {
        background: trackBackground,
      },
      tracks: {
        background: 'transparent',
      },
    }),
    [railBackground, trackBackground],
  );

  // 개선/저하 섹션의 동적 값들을 계산
  const enhanceData = useMemo(() => {
    const standard = (average as number) || 0;
    const difference = Math.abs((currentValue as number) - standard);

    if (currentValue < standard) {
      // 왼쪽으로 움직였을 때: 저하
      return {
        text: sliderDetailStyle.marker.degradation.text,
        value: difference.toFixed(2),
        icon: isReverse ? <CaretUpOutlined /> : <CaretDownOutlined />,
        backgroundColor: sliderDetailStyle.marker.degradation.labelColor,
      };
    } else if (currentValue > standard) {
      // 오른쪽으로 움직였을 때: 개선
      return {
        text: sliderDetailStyle.marker.improvement.text,
        value: difference.toFixed(2),
        icon: isReverse ? <CaretDownOutlined /> : <CaretUpOutlined />,
        backgroundColor: sliderDetailStyle.marker.improvement.labelColor, // 기본 배경 유지
      };
    } else {
      // 표준값일 때
      return {
        text: '표준',
        value: '-',
        icon: null,
        backgroundColor: '#CECECE',
      };
    }
  }, [currentValue, average]);

  const systemTypeColor = (systemType: string) => {
    switch (systemType) {
      case '냉방':
        return '#1D4BBE';
      case '난방':
        return '#BE1D1D';
      case '조명':
        return '#F5CA2F';
      case '급탕':
        return '#F38130';
      default:
        return '#1D4BBE';
    }
  };

  return (
    <div
      className={`${styles.editWrap} ${type === 'template2' ? styles.editWrapTemplate2 : ''} ${id === 'ventilatorChild1' || id === 'ventilatorChild2' ? styles.editWrapVentilator : ''}`}
    >
      <Flex justify="space-between" align={'center'}>
        <span className={styles.editTitle}>{title}</span>
        {type === 'template1' &&
          (systemType ? (
            <Flex align="center" gap={10}>
              <div
                style={{ background: `${systemTypeColor(systemType)}` }}
                className={styles.typeTextWrapper}
              >
                {systemType}
              </div>
              <Rate
                disabled
                value={rate as number}
                count={3}
                style={{ direction: 'rtl' }}
              />
            </Flex>
          ) : (
            <Rate
              disabled
              value={rate as number}
              count={3}
              style={{ direction: 'rtl' }}
            />
          ))}
      </Flex>
      <Flex className={styles.sliderWrapper}>
        <div>
          <Slider
            marks={marks}
            value={currentValue as number}
            onChange={onChangeValue}
            onChangeComplete={(value) => {
              // 드래그 완료 시 즉시 store 업데이트
              if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
              }
              if (id && typeof value === 'number') {
                updateItemData(id as ComponentId, { start: value });
              }
            }}
            className={styles.sliderClass}
            styles={sliderStyles}
            min={min as number}
            max={max as number}
            step={step || 1}
          />
        </div>

        {subDescription && (
          <div
            className={`${styles.typeTextWrapper} ${styles.typeTextEfficiency}`}
          >
            {subDescription}
          </div>
        )}
        <div>
          <InputNumber
            min={min as number}
            max={max as number}
            step={step || 1}
            value={currentValue as number}
            onChange={(value) => {
              if (value !== null) {
                setCurrentValue(value);
                debouncedUpdateStore(value);
              }
            }}
          />
          <div className={styles.sliderNumberUnit}>[{unit}]</div>
        </div>
      </Flex>
      <div className={styles.controller}>
        <Flex gap={10} justify="right">
          <SyncOutlined
            style={{
              cursor: 'pointer',
              transition: 'transform 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'rotate(180deg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'rotate(0deg)';
            }}
            onClick={() => {
              // 진행 중인 디바운스 타이머 취소
              if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
              }

              const resetValue = average as number;
              setCurrentValue(resetValue);
              if (id) {
                // 리셋은 즉시 적용
                updateItemData(id as ComponentId, { start: resetValue });
              }
            }}
          />
          <div
            className={styles.enhance}
            style={{
              backgroundColor: enhanceData.backgroundColor,
              color: enhanceData.text === '저하' ? 'unset' : '#fff',
            }}
          >
            {enhanceData.icon}
            <span
              style={{
                color: `${enhanceData.text === '저하' ? '#2A4E51' : '#FFFFFF'}`,
                fontSize: '13px',
              }}
            >
              {enhanceData.value}
            </span>
            <span
              style={{
                color: `${enhanceData.text === '저하' ? '#2A4E51' : '#FFFFFF'}`,
              }}
            >
              {enhanceData.text}
            </span>
          </div>
        </Flex>
      </div>
    </div>
  );
};

export default EditSlider;
