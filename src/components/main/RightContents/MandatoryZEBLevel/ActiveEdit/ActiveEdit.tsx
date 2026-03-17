'use client';

import styles from './ActiveEdit.module.scss';
import stylesEdit from '../shared/EditSlider/EditSlider.module.scss';
import CollapseItem from '@/components/main/RightContents/MandatoryZEBLevel/shared/CollapseItem/CollapseItem';
import { Flex } from 'antd';
import EditSlider from '@/components/main/RightContents/MandatoryZEBLevel/shared/EditSlider/EditSlider';
import { useStore } from '@/store';

const allowContents = [
  'ehpCooling',
  'ehpHeating',
  'ghpCooling',
  'ghpHeating',
  'lightingDensity',
  'electricBoiler',
  'ventilator',
];

const ActiveEdit = () => {
  const { standardModelPerformanceData } = useStore();
  const filteredData = standardModelPerformanceData.filter(
    (data: { id: string }) => allowContents.includes(data.id),
  );

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
      case '환기':
        return '#20E6F1';
      default:
        return '#1D4BBE';
    }
  };
  return (
    <CollapseItem itemSize={filteredData.length + 1} title={'액티브'}>
      <Flex className={styles.wrapper} gap={21} wrap={'wrap'}>
        {filteredData.map((item) => {
          if (item.type !== 'template1') return null;
          return <EditSlider {...item} />;
        })}
        {filteredData
          .filter((item) => item.type === 'template2')
          .map((item) => {
            return (
              <div
                key={item.id}
                className={stylesEdit.editWrap}
                style={{ width: '100%' }}
              >
                <Flex justify="space-between" align={'center'}>
                  <span className={stylesEdit.editTitle}>{item.title}</span>
                  <Flex align="center" gap={10}>
                    <div
                      style={{
                        background: `${systemTypeColor(item.systemType || '')}`,
                      }}
                      className={stylesEdit.typeTextWrapper}
                    >
                      {item.systemType}
                    </div>
                  </Flex>
                </Flex>
                <Flex justify="space-between" align={'center'}>
                  {(item.children || []).map((child) => (
                    <EditSlider key={child.id} {...child} />
                  ))}
                </Flex>
              </div>
            );
          })}
      </Flex>
    </CollapseItem>
  );
};

export default ActiveEdit;
