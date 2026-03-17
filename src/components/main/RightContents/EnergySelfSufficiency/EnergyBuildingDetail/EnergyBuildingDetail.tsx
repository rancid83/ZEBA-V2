'use client';

import React, { useEffect, useState } from 'react';
import { Collapse, Flex, Table, TableProps } from 'antd';
import styles from './EnergyBuildingDetail.module.scss';
import { useStore } from '@/store';

const EnergyBuildingDetail = () => {
  const [activeKey, setActiveKey] = useState<string[]>([]);
  const { passiveDataCost, activeDataCost, renewableDataCost, pageStep } =
    useStore();

  const columns: TableProps<any>['columns'] = [
    {
      title: '항목',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <>{text}</>,
    },
    {
      title: '법규 기준',
      dataIndex: 'regulation',
      key: 'regulation',
    },
    {
      title: 'ZEB 사전 진단',
      dataIndex: 'mandatory',
      key: 'mandatory',
    },
    {
      title: 'ZEB 목표 설정',
      dataIndex: 'target',
      key: 'target',
    },
    {
      title: 'ZEB 성능 편집',
      dataIndex: 'combined',
      key: 'combined',
    },
  ];

  useEffect(() => {
    // pageStep이 변경될 때마다 아코디언을 모두 닫음
    setActiveKey([]);
  }, [pageStep]);

  return (
    <>
      <div className={`${styles.mandatoryGradeContainer} `}>
        <div className={styles.mandatoryGrade}>
          <div className={styles.mandatoryGradeHeader}>
            <img
              src="/assets/images/icon/icon-stack.png"
              alt="icon"
              className={styles.icon}
            />
            <span className={styles.title}>시공 비용 비교</span>
          </div>

          <div className={styles.EnergyDetailTitle}>
            <Flex className={styles.detailDescription}>
              <span>에너지 성능별 비용 상세 항목을 표로 보여줍니다.</span>
            </Flex>
            {/* 패시브 Collapse */}
            <Collapse
              className={styles.energyDetailCollapse}
              expandIconPosition={'end'}
              activeKey={activeKey}
              onChange={(keys) =>
                setActiveKey(Array.isArray(keys) ? keys : [keys])
              }
              size="small"
              items={[
                {
                  key: 'passive',
                  label: (
                    <div className={styles.collapseTitle}>
                      패시브<div>{`${passiveDataCost.length} 항목`}</div>
                    </div>
                  ),
                  children: (
                    <Table<any>
                      columns={columns}
                      dataSource={passiveDataCost}
                      pagination={false}
                      rowKey={(record) => record.name}
                    />
                  ),
                },
              ]}
            />

            {/* 액티브 Collapse */}
            <Collapse
              className={styles.energyDetailCollapse}
              expandIconPosition={'end'}
              activeKey={activeKey}
              onChange={(keys) =>
                setActiveKey(Array.isArray(keys) ? keys : [keys])
              }
              size="small"
              items={[
                {
                  key: 'active',
                  label: (
                    <div className={styles.collapseTitle}>
                      액티브<div>{`${activeDataCost.length} 항목`}</div>
                    </div>
                  ),
                  children: (
                    <Table<any>
                      columns={columns}
                      dataSource={activeDataCost}
                      pagination={false}
                      rowKey={(record) => record.name}
                    />
                  ),
                },
              ]}
            />

            {/* 신재생 Collapse */}
            <Collapse
              className={styles.energyDetailCollapse}
              expandIconPosition={'end'}
              activeKey={activeKey}
              onChange={(keys) =>
                setActiveKey(Array.isArray(keys) ? keys : [keys])
              }
              size="small"
              items={[
                {
                  key: 'renewable',
                  label: (
                    <div className={styles.collapseTitle}>
                      신재생<div>{`${renewableDataCost.length} 항목`}</div>
                    </div>
                  ),
                  children: (
                    <Table<any>
                      columns={columns}
                      dataSource={renewableDataCost}
                      pagination={false}
                      rowKey={(record) => record.name}
                    />
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default EnergyBuildingDetail;
