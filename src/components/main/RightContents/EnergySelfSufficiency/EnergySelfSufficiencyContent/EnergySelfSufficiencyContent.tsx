'use client';

import React, { useState } from 'react';
import { Divider, Flex, Form, Radio } from 'antd';
import styles from './EnergySelfSufficiencyContent.module.scss';

import { BarChart } from '@/components/chartjs/bar';
import { Doughnut } from 'react-chartjs-2';
import { DoughnutChart } from '@/components/chartjs/doughnut';
import { useStore } from '@/store';
import { DollarOutlined, LineChartOutlined } from '@ant-design/icons';

const EnergySelfSufficiencyContent = (props: any) => {
  const [size, setSize] = useState('won'); // default is 'middle'
  const [activeIndex, setActiveIndex] = React.useState(0);
  const { tap } = props;
  const isEnergyTap = tap === 1;
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  const { gradeData, gradeBuildingData, gradeDataPercent } = useStore();

  const onPieEnter = (data: any, index: number) => {
    setActiveIndex(index);
  };

  const numberWithCommas = (value: number | string) => {
    const num = typeof value === 'number' ? value : Number(value);
    if (isNaN(num)) return '';
    return num.toLocaleString('ko-KR');
  };

  return (
    <>
      <Form>
        <div className={`${styles.mandatoryGradeContainer} `}>
          <div className={styles.mandatoryGrade}>
            <div className={styles.mandatoryGradeHeader}>
              {isEnergyTap ? (
                <>
                  <LineChartOutlined style={{ fontSize: 24 }} />
                  <span className={styles.title}>에너지 생산량 및 소요량</span>
                </>
              ) : (
                <>
                  <DollarOutlined style={{ fontSize: 24 }} />
                  <span className={styles.title}>시공 비용 산출</span>
                </>
              )}
              {!isEnergyTap && (
                <div>
                  <Radio.Group
                    size={'small'}
                    style={{ marginLeft: '50px' }}
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                  >
                    <Radio.Button value="won">금액[천원]</Radio.Button>
                    <Radio.Button value="percent">구성비[%]</Radio.Button>
                  </Radio.Group>
                </div>
              )}
            </div>
            <div className={styles.chartContainer}>
              {isEnergyTap ? (
                <div>
                  <BarChart
                    isEnergyTap={isEnergyTap}
                    gradeData={gradeData}
                    unit={'kWh/㎡·y'}
                  />
                </div>
              ) : size === 'won' ? (
                <div>
                  <BarChart
                    isEnergyTap={isEnergyTap}
                    gradeData={gradeBuildingData}
                    unit={'천원'}
                  />
                </div>
              ) : (
                <>
                  <Flex
                    justify={'center'}
                    gap={35}
                    className={styles.gradePieWrap}
                  >
                    {gradeDataPercent.map((item) => {
                      return (
                        <div className={styles.gradePie}>
                          <div
                            className={styles.gradeLabel}
                            style={{ marginTop: '21px' }}
                          >
                            <div>
                              <span>{item.label.title}</span>
                              <br />
                              <span>{item.label.subTitle}</span>
                            </div>
                          </div>
                          <div className={styles.gradeFlex}>
                            <DoughnutChart
                              isEnergyTap={isEnergyTap}
                              gradeData={item}
                            />
                          </div>
                          <Flex
                            className={styles.gradeFlexText}
                            justify={'space-between'}
                            align={'center'}
                          >
                            <span>합계 : </span>
                            <span>
                              {item.totalMoney
                                ? numberWithCommas(item.totalMoney)
                                : '-'}
                              <span>천원</span>
                            </span>
                          </Flex>
                          <div className={styles.descriptionText}>
                            <div>
                              <span>{item.description.description}</span>
                              <br />
                              <span>{item.description.subDescription}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <Divider className={styles.divider} />
                  </Flex>
                </>
              )}
            </div>
            <Flex
              gap={36}
              justify={'center'}
              align={'center'}
              className={styles.gradeWrap}
            >
              {isEnergyTap
                ? gradeData.map((item, index) => (
                    <div className={styles.gradeBox} key={index}>
                      <div className={styles.gradeLabel}>
                        {' '}
                        <div>
                          <span>{item.label.title}</span>
                          <br />
                          <span>{item.label.subTitle}</span>
                        </div>
                      </div>
                      <div className={styles.gradeValue}>
                        <span className={styles.gradeText}>
                          {item.grade ? item.grade : '-'}
                          {item.grade ? <span>%</span> : ''}
                        </span>
                        <Flex
                          className={styles.zebGradeText}
                          justify={'space-between'}
                        >
                          <span className={styles.zebGrade}>ZEB 등급</span>
                          {''}
                          <span className={styles.zebGradeNum}>
                            {item.zebGrade ? item.zebGrade : '-'} 등급
                          </span>
                        </Flex>
                        <div
                          className={styles.creatorText}
                          style={{ marginTop: '25px' }}
                        >
                          <Flex justify={'left'}>1차 에너지 생산량</Flex>
                          <Flex justify={'right'} align={'flex-end'} gap={5}>
                            <span>{item.creator ? item.creator : '-'}</span>{' '}
                            kWh/㎡
                          </Flex>
                        </div>
                        <div className={styles.creatorText}>
                          <Flex justify={'left'}>1차 에너지 소요량</Flex>
                          <Flex justify={'right'} align={'flex-end'} gap={5}>
                            <span>{item.consume ? item.consume : '-'}</span>{' '}
                            kWh/㎡
                          </Flex>
                        </div>
                      </div>
                    </div>
                  ))
                : gradeBuildingData.map((item, index) => (
                    <div className={styles.gradeBox} key={index}>
                      <div className={styles.gradeLabel}>
                        <div>
                          <span>{item.label.title}</span>
                          <br />
                          <span>{item.label.subTitle}</span>
                        </div>
                      </div>
                      <div className={styles.gradeValue}>
                        <Flex align={'center'} justify={'center'}>
                          <span className={styles.gradeText}>
                            {numberWithCommas(item.grade)}
                          </span>
                          <span
                            className={styles.won}
                            style={{ marginTop: '9px' }}
                          >
                            천원
                          </span>
                        </Flex>
                        <Flex
                          className={styles.zebGradeText}
                          justify={'space-between'}
                        >
                          <span className={styles.zebGrade}>ZEB 등급</span>
                          {''}
                          <span className={styles.zebGradeNum}>
                            {item.zebGrade ? item.zebGrade : '-'} 등급
                          </span>
                        </Flex>
                        <Flex
                          justify={'space-between'}
                          className={styles.zebGradeTextSub}
                        >
                          <span>신재생 : </span>
                          <span>{numberWithCommas(item.renewable)}</span>
                          <span className={styles.won}>천원</span>
                        </Flex>
                        <Flex
                          justify={'space-between'}
                          className={styles.zebGradeTextSub}
                        >
                          <span>액티브 : </span>
                          <span>{numberWithCommas(item.active)}</span>
                          <span className={styles.won}>천원</span>
                        </Flex>
                        <Flex
                          justify={'space-between'}
                          className={styles.zebGradeTextSub}
                        >
                          <span>패시브 : </span>
                          <span>{numberWithCommas(item.passive)}</span>
                          <span className={styles.won}>천원</span>
                        </Flex>
                        <Flex
                          justify={'space-between'}
                          className={styles.zebGradeTextSub}
                        >
                          <span>증액 : </span>
                          <span>{numberWithCommas(item.increase)}</span>
                          <span className={styles.won}>천원</span>
                        </Flex>
                        <Flex
                          justify={'space-between'}
                          className={styles.zebGradeTextSub}
                        >
                          <span>혜택 : </span>
                          <span>{numberWithCommas(item.benefit)}</span>
                          <span className={styles.won}>천원</span>
                        </Flex>
                      </div>
                    </div>
                  ))}
            </Flex>
          </div>
        </div>
      </Form>
    </>
  );
};
export default EnergySelfSufficiencyContent;
