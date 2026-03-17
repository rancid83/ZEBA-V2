'use client';

import styles from './PassiveEdit.module.scss';
import { Flex } from 'antd';
import CollapseItem from '@/components/main/RightContents/MandatoryZEBLevel/shared/CollapseItem/CollapseItem';
import EditSlider from '@/components/main/RightContents/MandatoryZEBLevel/shared/EditSlider/EditSlider';
import { useStore } from '@/store';
import { useEffect, useState } from 'react';

const allowContents = [
  'windowUValue',
  'floorUValue',
  'roofUValue',
  'wallUValue',
];

const PassiveEdit = () => {
  const { standardModelPerformanceData } = useStore();
  const filteredData = standardModelPerformanceData.filter(
    (data: { id: string }) => allowContents.includes(data.id),
  );

  return (
    <CollapseItem itemSize={4} title={'패시브'}>
      <Flex className={styles.wrapper} gap={21} wrap={'wrap'}>
        {filteredData.map((item) => {
          if (item.type !== 'template1') return null;
          return <EditSlider {...item} />;
        })}
      </Flex>
    </CollapseItem>
  );
};

export default PassiveEdit;
