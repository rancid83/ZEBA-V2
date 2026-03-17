'use client';

import styles from './CollapseItem.module.scss';
import { Collapse } from 'antd';
import React, { useEffect, useState } from 'react';
import { useStore } from '@/store';

const CollapseItem = (props: any) => {
  const { pageStep } = useStore();
  const [activeKey, setActiveKey] = useState<string[]>([]);

  useEffect(() => {
    // pageStep이 변경될 때마다 아코디언을 모두 닫음
    setActiveKey([]);
  }, [pageStep]);
  return (
    <Collapse
      className={styles.energyDetailCollapse}
      size="small"
      activeKey={activeKey}
      onChange={(keys) => setActiveKey(Array.isArray(keys) ? keys : [keys])}
      items={[
        {
          key: 'active',
          label: (
            <div className={styles.collapseTitle}>
              <span>{props.title}</span>
              <div>{`(${props.itemSize} 항목)`}</div>
            </div>
          ),
          children: <>{props.children}</>,
        },
      ]}
    />
  );
};

export default CollapseItem;
