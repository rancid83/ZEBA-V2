'use client';

import styles from './RenewableEdit.module.scss';
import CollapseItem from '@/components/main/RightContents/MandatoryZEBLevel/shared/CollapseItem/CollapseItem';
import { Flex } from 'antd';
import SolarPowerSystem from '@/components/main/RightContents/MandatoryZEBLevel/RenewableEdit/SolarPowerSystem/SolarPowerSystem';
import FuelCell from '@/components/main/RightContents/MandatoryZEBLevel/RenewableEdit/FuelCell/FuelCell';
import GeothermalHeatPump from '@/components/main/RightContents/MandatoryZEBLevel/RenewableEdit/GeothermalHeatPump/GeothermalHeatPump';
import SolarDomesticHotWaterSystem from '@/components/main/RightContents/MandatoryZEBLevel/RenewableEdit/SolarDomesticHotWaterSystem/SolarDomesticHotWaterSystem';

const RenewableEdit = ({ form }: any) => {
  return (
    <CollapseItem itemSize={4} title={'신재생'}>
      <Flex className={styles.wrapper} gap={21} wrap={'wrap'}>
        <SolarPowerSystem />
        <FuelCell />
        <GeothermalHeatPump />
        <SolarDomesticHotWaterSystem />
      </Flex>
    </CollapseItem>
  );
};

export default RenewableEdit;
