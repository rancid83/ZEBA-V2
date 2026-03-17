'use client';

import styles from './GeothermalHeatPump.module.scss';
import { Flex, Form, Input, Radio, RadioChangeEvent, Rate } from 'antd';
import { CheckboxGroupProps } from 'antd/es/checkbox';
import { useState } from 'react';
import { useStore } from '@/store';
import { ComponentId } from '@/store/slices/standardModelPerformanceSlice';

const allowContents = ['geothermalHeatPump'];

const optionsWithDisabled: CheckboxGroupProps<string>['options'] = [
  { label: '가스', value: 'gas', className: 'label-1' },
  { label: '전기', value: 'electric', className: 'label-2' },
];

const GeothermalHeatPump = () => {
  const { standardModelPerformanceData, updateItemData } = useStore();
  const filteredData = standardModelPerformanceData.filter(
    (data: { id: string }) => allowContents.includes(data.id),
  );

  // store 데이터에서 초기값 가져오기
  const initialHeatPumpType = filteredData[0]?.heatPumpType;
  const [heatPumpType, setHeatPumpType] = useState(initialHeatPumpType);

  const onChange1 = ({ target: { value } }: RadioChangeEvent) => {
    setHeatPumpType(value);
    // store의 heatPumpType 업데이트
    updateItemData('geothermalHeatPump' as ComponentId, {
      heatPumpType: value,
    });
  };

  return (
    <Form
      initialValues={{
        coolingEnergyDemand: filteredData[0].coolingEnergyDemand,
        coolingCOP: filteredData[0].coolingCOP,
        coolingEnergyConsumption: filteredData[0].coolingEnergyConsumption,
        heatingEnergyDemand: filteredData[0].heatingEnergyDemand,
        heatingCOP: filteredData[0].heatingCOP,
        heatingEnergyConsumption: filteredData[0].heatingEnergyConsumption,
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
            <Radio.Group
              options={optionsWithDisabled}
              onChange={onChange1}
              optionType="button"
              value={heatPumpType}
              buttonStyle="solid"
              size="small"
            />
          </div>
        </Flex>
        <div style={{ marginTop: '30px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <colgroup>
              <col style={{ width: '25%' }} />
              <col style={{ width: '25%' }} />
              <col style={{ width: '25%' }} />
              <col style={{ width: '25%' }} />
            </colgroup>
            <thead>
              <tr>
                <th></th>
                <th className={styles.thGeoThermalText}>
                  에너지 요구량
                  <div>[kW]</div>
                </th>
                <th className={styles.thGeoThermalText}>
                  성능비
                  <div>[COP]</div>
                </th>
                <th className={styles.thGeoThermalText}>
                  에너지 요구량
                  <div>[kWh/y]</div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '8px 0' }}>
                  <div
                    className={`${styles.typeTextWrapper} ${styles.typeTextEfficiency}`}
                  >
                    냉방
                  </div>
                </td>
                <td style={{ padding: '8px' }}>
                  <div>
                    <Form.Item
                      name="coolingEnergyDemand"
                      rules={[{ required: true, message: '' }]}
                      style={{ margin: 0 }}
                    >
                      <Input
                        onChange={(e) => {
                          updateItemData('geothermalHeatPump' as ComponentId, {
                            coolingEnergyDemand: e.target.value,
                          });
                        }}
                      />
                    </Form.Item>
                  </div>
                </td>
                <td style={{ padding: '8px' }}>
                  <div>
                    <Form.Item
                      name="coolingCOP"
                      rules={[{ required: true, message: '' }]}
                      style={{ margin: 0 }}
                    >
                      <Input
                        onChange={(e) => {
                          updateItemData('geothermalHeatPump' as ComponentId, {
                            coolingCOP: e.target.value,
                          });
                        }}
                      />
                    </Form.Item>
                  </div>
                </td>
                <td style={{ padding: '8px' }}>
                  <div>
                    <Form.Item
                      name="coolingEnergyConsumption"
                      rules={[{ required: true, message: '' }]}
                      style={{ margin: 0 }}
                    >
                      <Input
                        onChange={(e) => {
                          updateItemData('geothermalHeatPump' as ComponentId, {
                            coolingEnergyConsumption: e.target.value,
                          });
                        }}
                      />
                    </Form.Item>
                  </div>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0' }}>
                  <div
                    className={`${styles.typeTextWrapper} ${styles.typeTextEfficiency}`}
                  >
                    난방
                  </div>
                </td>
                <td style={{ padding: '8px' }}>
                  <div>
                    <Form.Item
                      name="heatingEnergyDemand"
                      rules={[{ required: true, message: '' }]}
                      style={{ margin: 0 }}
                    >
                      <Input
                        onChange={(e) => {
                          updateItemData('geothermalHeatPump' as ComponentId, {
                            heatingEnergyDemand: e.target.value,
                          });
                        }}
                      />
                    </Form.Item>
                  </div>
                </td>
                <td style={{ padding: '8px' }}>
                  <div>
                    <Form.Item
                      name="heatingCOP"
                      rules={[{ required: true, message: '' }]}
                      style={{ margin: 0 }}
                    >
                      <Input
                        onChange={(e) => {
                          updateItemData('geothermalHeatPump' as ComponentId, {
                            heatingCOP: e.target.value,
                          });
                        }}
                      />
                    </Form.Item>
                  </div>
                </td>
                <td style={{ padding: '8px' }}>
                  <div>
                    <Form.Item
                      name="heatingEnergyConsumption"
                      rules={[{ required: true, message: '' }]}
                      style={{ margin: 0 }}
                    >
                      <Input
                        onChange={(e) => {
                          updateItemData('geothermalHeatPump' as ComponentId, {
                            heatingEnergyConsumption: e.target.value,
                          });
                        }}
                      />
                    </Form.Item>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Form>
  );
};

export default GeothermalHeatPump;
