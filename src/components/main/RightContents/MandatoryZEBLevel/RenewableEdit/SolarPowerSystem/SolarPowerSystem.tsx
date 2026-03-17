'use client';

import styles from './SolarPowerSystem.module.scss';
import { Flex, Rate, Select } from 'antd';
import EditSlider from '@/components/main/RightContents/MandatoryZEBLevel/shared/EditSlider/EditSlider';
import { useStore } from '@/store';
import { ComponentId } from '@/store/slices/standardModelPerformanceSlice';

const allowContents = ['solarPowerSystem'];

const SolarPowerSystem = () => {
  const { standardModelPerformanceData, updateItemData } = useStore();
  const filteredData = standardModelPerformanceData.filter(
    (data: { id: string }) => allowContents.includes(data.id),
  );

  const solarPowerSystem = standardModelPerformanceData.find(
    (data: { id: string }) => data.id === 'solarPowerSystem',
  );

  console.log('standardModelPerformanceData : ', standardModelPerformanceData);

  return (
    <div className={styles.editWrap}>
      <Flex justify="space-between" align={'center'}>
        <span className={styles.editTitle}>{filteredData[0].title}</span>
        <Rate
          disabled
          value={filteredData[0].rate || 0}
          count={3}
          style={{ direction: 'rtl' }}
        />
      </Flex>
      <Flex gap={20} style={{ marginTop: '42px', marginBottom: '8px' }}>
        <Flex justify="center" align={'center'} gap={15}>
          <span className={styles.label}>기울기</span>
          <Select
            value={filteredData[0]?.solarTilt || 'optimal'}
            style={{ width: 120 }}
            onChange={(value) => {
              // store의 solarPowerSystem 기울기 업데이트
              updateItemData('solarPowerSystem' as ComponentId, {
                solarTilt: value,
              });
            }}
            options={[
              { value: 'horizontal', label: '0º (수평)' },
              { value: 'optimal', label: '45º' },
              { value: 'vertical', label: '90º (수직)' },
            ]}
          />
        </Flex>
        <Flex justify="center" align={'center'} gap={15}>
          <span className={styles.label}>방위</span>
          <Select
            value={filteredData[0]?.solarOrientation || 'south'}
            style={{ width: 120 }}
            onChange={(value) => {
              // store의 solarPowerSystem 방위 업데이트
              updateItemData('solarPowerSystem' as ComponentId, {
                solarOrientation: value,
              });
            }}
            disabled={solarPowerSystem?.solarTilt === 'horizontal'}
            options={[
              { value: 'east', label: '동' },
              { value: 'southeast', label: '남동' },
              { value: 'south', label: '남' },
              { value: 'southwest', label: '남서' },
              { value: 'west', label: '서' },
            ]}
          />
        </Flex>
      </Flex>

      {(filteredData[0]?.children || []).map((item) => (
        <div key={item.id} style={{ marginLeft: '-27px' }}>
          <EditSlider {...item} />
        </div>
      ))}
    </div>
  );
};

export default SolarPowerSystem;
