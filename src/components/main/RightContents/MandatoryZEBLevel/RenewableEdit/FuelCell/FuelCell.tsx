'use client';

import styles from './FuelCell.module.scss';
import { Flex, Form, Radio, RadioChangeEvent, Rate } from 'antd';
import { CheckboxGroupProps } from 'antd/es/checkbox';
import EditSlider from '@/components/main/RightContents/MandatoryZEBLevel/shared/EditSlider/EditSlider';
import { useState } from 'react';
import { useStore } from '@/store';
import { ComponentId } from '@/store/slices/standardModelPerformanceSlice';

const allowContents = ['fuelCell'];

const optionsWithDisabled: CheckboxGroupProps<string>['options'] = [
  { label: 'PEMFC', value: 'pemfc', className: 'label-1' },
  { label: 'SOFC', value: 'sofc', className: 'label-2' },
];

const FuelCell = () => {
  const { standardModelPerformanceData, updateItemData } = useStore();
  const filteredData = standardModelPerformanceData.filter(
    (data: { id: string }) => allowContents.includes(data.id),
  );

  const [fuelType, setFuelType] = useState(
    filteredData[0]?.fuelCellType || 'pemfc',
  );

  const onChange1 = ({ target: { value } }: RadioChangeEvent) => {
    setFuelType(value);
    // store의 fuelCellType 업데이트
    updateItemData('fuelCell' as ComponentId, {
      fuelCellType: value,
    });
  };

  return (
    <Form
      initialValues={{
        fuelCellType: filteredData[0].fuelCellType,
      }}
    >
      <div className={styles.editWrap}>
        <Flex
          justify="space-between"
          align={'center'}
          style={{ position: 'relative' }}
        >
          <span className={styles.editTitle}>{filteredData[0].title}</span>
          <Rate
            disabled
            value={filteredData[0].rate || 0}
            count={3}
            style={{ direction: 'rtl' }}
          />
          <div className={styles.fuelCellRadio}>
            <Form.Item name="fuelCellType">
              <Radio.Group
                options={optionsWithDisabled}
                onChange={onChange1}
                optionType="button"
                value={fuelType}
                buttonStyle="solid"
                size="small"
              />
            </Form.Item>
          </div>
        </Flex>
        {(filteredData[0].children || []).map((item) => {
          console.log(item);
          return (
            <div key={item.id} className={styles.editorSliderWrap}>
              <EditSlider {...item} />
            </div>
          );
        })}
      </div>
    </Form>
  );
};

export default FuelCell;
