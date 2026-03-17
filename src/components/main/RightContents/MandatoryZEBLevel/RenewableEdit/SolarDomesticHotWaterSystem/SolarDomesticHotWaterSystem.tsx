'use client';

import { Form, Radio, RadioChangeEvent, Select } from 'antd';
import styles from './SolarDomesticHotWaterSystem.module.scss';
import EditSlider from '@/components/main/RightContents/MandatoryZEBLevel/shared/EditSlider/EditSlider';
import { CheckboxGroupProps } from 'antd/es/checkbox';
import { useState } from 'react';
import { useStore } from '@/store';
import { ComponentId } from '@/store/slices/standardModelPerformanceSlice';

const allowContents = ['solarDomesticHotWaterSystem'];

const optionsWithDisabled: CheckboxGroupProps<string>['options'] = [
  { label: '평판형', value: 'flatPlate' },
  { label: '진공관형', value: 'evacuatedTube' },
];

const SolarDomesticHotWaterSystem = () => {
  const { standardModelPerformanceData, updateItemData } = useStore();
  const filteredData = standardModelPerformanceData.filter(
    (data: { id: string }) => allowContents.includes(data.id),
  );

  const [solarType, setSolarType] = useState(
    filteredData[0]?.solarCollectorType || 'flatPlate',
  );

  const onChangeSolarType = ({ target: { value } }: RadioChangeEvent) => {
    setSolarType(value);
    // store의 solarCollectorType 업데이트
    updateItemData('solarDomesticHotWaterSystem' as ComponentId, {
      solarCollectorType: value,
    });
  };

  return (
    <Form
      initialValues={{
        solarOrientation: filteredData[0].solarOrientation,
        solarCollectorType: filteredData[0].solarCollectorType,
      }}
    >
      <div className={styles.wrap}>
        <div className={styles.fuelCellRadio}>
          <Form.Item name="solarCollectorType" style={{ marginBottom: 0 }}>
            <Radio.Group
              options={optionsWithDisabled}
              onChange={onChangeSolarType}
              optionType="button"
              value={solarType}
              buttonStyle="solid"
              size="small"
            />
          </Form.Item>
        </div>
        <div className={styles.editSlider}>
          <EditSlider {...filteredData[0]} />
        </div>
        <div className={styles.positionSelect}>
          <Form.Item
            name="solarOrientation"
            label={'방위'}
            style={{ marginBottom: 0 }}
          >
            <Select
              style={{ width: 120 }}
              onChange={(value) => {
                // store의 solarOrientation 업데이트
                updateItemData('solarDomesticHotWaterSystem' as ComponentId, {
                  solarOrientation: value,
                });
              }}
              options={[
                { value: 'east', label: '동' },
                { value: 'southeast', label: '남동' },
                { value: 'south', label: '남' },
                { value: 'southwest', label: '남서' },
                { value: 'west', label: '서' },
                { value: 'horizontal', label: '수평' },
              ]}
            />
          </Form.Item>
        </div>
      </div>
    </Form>
  );
};

export default SolarDomesticHotWaterSystem;
