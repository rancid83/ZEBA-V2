'use client';

import {
  Button,
  Flex,
  Form,
  Input,
  Select,
  Tabs,
  Modal,
  InputNumber,
} from 'antd';
import styles from './MandatoryZEBLevel.module.scss';
import {
  DingtalkOutlined,
  SearchOutlined,
  SendOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useStore } from '@/store';
import React, { useEffect, useState } from 'react';
import KakaoMaps from '@/components/main/RightContents/MandatoryZEBLevel/KakaoMaps';
import DaumPostcodeEmbed from 'react-daum-postcode';
import { analyzeStep1 } from '@/services/steps';
import { ZebStep1Response } from '@/types/zebStep1';
import PassiveEdit from '@/components/main/RightContents/MandatoryZEBLevel/PassiveEdit/PassiveEdit';
import ActiveEdit from '@/components/main/RightContents/MandatoryZEBLevel/ActiveEdit/ActiveEdit';
import RenewableEdit from '@/components/main/RightContents/MandatoryZEBLevel/RenewableEdit/RenewableEdit';

const MandatoryZEBLevel = (props: any) => {
  const { pageStep } = useStore();
  const getTabLabel = () => {
    switch (pageStep) {
      case 0:
        return 'ZEB 사전 진단';
      case 1:
        return 'ZEB 목표 설정';
      case 2:
        return 'ZEB 성능 편집';
      default:
        return 'ZEB 사전 진단';
    }
  };

  return (
    <Tabs
      defaultActiveKey="1"
      type="card"
      size="large"
      items={[
        {
          label: getTabLabel(),
          key: '1',
          children: <MandatoryGrade />,
          style: { margin: 0 },
        },
      ]}
    />
  );
};

const MandatoryGrade = () => {
  const {
    setLoading,
    updateGradeData,
    updateGradeBuildingData,
    updateGradeDataPercent,
    setActiveData,
    setPassiveData,
    setRenewableData,
    setActiveDataCost,
    setPassiveDataCost,
    setRenewableDataCost,
    setChartMaxValue,
    pageStep,
    formData,
    updateFormData,
    setAddressData,
    standardModelPerformanceData,
    step1Request,
    step2Request,
    step3Request,
    setStep1Request,
    setStep2Request,
    setStep3Request,
    setStandardModelPerformanceData,
  } = useStore();

  const [isPostcodeModalOpen, setIsPostcodeModalOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState('');
  const [modal, contextHolder] = Modal.useModal();
  const [form] = Form.useForm();

  // standardModelPerformanceData에서 ID로 아이템을 찾아서 start 값을 가져오는 헬퍼 함수
  const getStartValueById = (id: string): number | null => {
    const findItemById = (items: any[], targetId: string): any => {
      for (const item of items) {
        if (item.id === targetId) {
          return item;
        }
        if (item.children) {
          const found = findItemById(item.children, targetId);
          if (found) return found;
        }
      }
      return null;
    };

    const item = findItemById(standardModelPerformanceData, id);
    return item?.start || null;
  };

  // store의 formData로 form 초기화
  useEffect(() => {
    form.setFieldsValue(formData);
    // 주소가 있으면 지도 위치 설정
    if (formData.roadName) {
      setCurrentAddress(formData.roadName);
    } else if (formData.lotNumber) {
      setCurrentAddress(formData.lotNumber);
    }
  }, [form, formData]);

  const handleAddressSearch = () => {
    setIsPostcodeModalOpen(true);
  };

  const handlePostcodeComplete = (data: any) => {
    const roadAddress = data.roadAddress || data.autoRoadAddress;
    const jibunAddress = data.jibunAddress || data.autoJibunAddress;

    // 주소 데이터를 폼에 설정
    form.setFieldsValue({
      roadName: roadAddress,
      lotNumber: jibunAddress,
    });

    // store에 주소 데이터 저장
    setAddressData(roadAddress, jibunAddress);

    // 지도 위치 업데이트를 위해 주소 상태 설정 (도로명 주소 우선)
    setCurrentAddress(roadAddress || jibunAddress);

    setIsPostcodeModalOpen(false);
  };

  const handlePostcodeClose = () => {
    setIsPostcodeModalOpen(false);
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      let step = '';

      switch (pageStep) {
        case 0:
          step = 'step1';
          break;
        case 1:
          step = 'step2';
          break;
        case 2:
          step = 'step3';
          break;
        default:
          step = 'step1';
      }

      const dataRequest: ZebStep1Response = await analyzeStep1.get({
        step,
        region: formData.roadName,
        totalArea: formData.bld_al_area,
        floorCount: formData.bld_floor_esurf,
        buildingType: formData.buildingType, // 미지정 시 백엔드가 '초중고'로 폴백
        ...(step === 'step2' ? { targetGrade: values.zebGrade } : {}),
        ...(step === 'step3'
          ? {
              targetGrade: formData.zebGrade,
              windowUValue: getStartValueById('windowUValue'), // 창호 열관류율 (W/㎡·K)
              wallUValue: getStartValueById('wallUValue'), // 외벽 열관류율 (W/㎡·K)
              roofUValue: getStartValueById('roofUValue'), // 지붕 열관류율 (W/㎡·K)
              floorUValue: getStartValueById('floorUValue'), // 바닥 열관류율 (W/㎡·K)
              ehpCooling: getStartValueById('ehpCooling'), // EHP 냉방 COP
              ehpHeating: getStartValueById('ehpHeating'), // EHP 난방 COP
              ghpCooling: getStartValueById('ghpCooling'), // GHP 냉방 COP
              ghpHeating: getStartValueById('ghpHeating'), // GHP 난방 COP
              lightingDensity: getStartValueById('lightingDensity'), // 조명밀도 (W/m²)
              electricBoiler: getStartValueById('electricBoiler'), // 전기보일러 효율 (%)
              ventilatorChild1: getStartValueById('ventilatorChild1'), // 전열교환기 냉방 (%)
              ventilatorChild2: getStartValueById('ventilatorChild2'), // 전열교환기 난방 (%)
              installationCapacity: getStartValueById('installationCapacity'), // 태양광 설치 용량 (%)
              generationEfficiency: getStartValueById('generationEfficiency'), // 태양광 발전효율 (%)
              solarPanelTilt: (() => {
                const item = standardModelPerformanceData.find(
                  (data: any) => data.id === 'solarPowerSystem',
                );
                return item?.solarTilt || null;
              })(), // 태양광 패널 기울기 (도)
              solarPanelAzimuth: (() => {
                const item = standardModelPerformanceData.find(
                  (data: any) => data.id === 'solarPowerSystem',
                );
                return item?.solarOrientation || null;
              })(), // 태양광 패널 방위 (east, south, west, north)
              fuelCellType: (() => {
                const item = standardModelPerformanceData.find(
                  (data: any) => data.id === 'fuelCell',
                );
                return item?.fuelCellType || null;
              })(), // 연료전지 구분
              heatProductionCapacity: getStartValueById(
                'heatProductionCapacity',
              ), // 연료전지 열생산능력 (%)
              heatProductionEfficiency: getStartValueById(
                'heatProductionEfficiency',
              ), // 연료전지 열생산효율 (%)
              powerGenerationEfficiency: getStartValueById(
                'powerGenerationEfficiency',
              ), // 연료전지 발전효율 (%)
              gshpType: (() => {
                const item = standardModelPerformanceData.find(
                  (data: any) => data.id === 'geothermalHeatPump',
                );
                return item?.heatPumpType || null;
              })(), // GSHP 구분
              coolingEnergyDemand: (() => {
                const item = standardModelPerformanceData.find(
                  (data: any) => data.id === 'geothermalHeatPump',
                );
                return item?.coolingEnergyDemand || null;
              })(), // GSHP 냉방 에너지 요구량
              coolingCOP: (() => {
                const item = standardModelPerformanceData.find(
                  (data: any) => data.id === 'geothermalHeatPump',
                );
                return item?.coolingCOP || null;
              })(), // GSHP 냉방 COP
              coolingEnergyConsumption: (() => {
                const item = standardModelPerformanceData.find(
                  (data: any) => data.id === 'geothermalHeatPump',
                );
                return item?.coolingEnergyConsumption || null;
              })(), // GSHP 냉방 연간요구량
              heatingEnergyDemand: (() => {
                const item = standardModelPerformanceData.find(
                  (data: any) => data.id === 'geothermalHeatPump',
                );
                return item?.heatingEnergyDemand || null;
              })(), // GSHP 난방 에너지 요구량
              heatingCOP: (() => {
                const item = standardModelPerformanceData.find(
                  (data: any) => data.id === 'geothermalHeatPump',
                );
                return item?.heatingCOP || null;
              })(), // GSHP 난방 COP
              heatingEnergyConsumption: (() => {
                const item = standardModelPerformanceData.find(
                  (data: any) => data.id === 'geothermalHeatPump',
                );
                return item?.heatingEnergyConsumption || null;
              })(), // GSHP 난방 연간요구량
              solarCollectorType: (() => {
                const item = standardModelPerformanceData.find(
                  (data: any) => data.id === 'solarDomesticHotWaterSystem',
                );
                return item?.solarCollectorType || null;
              })(), // 태양열 급탕 구분 (평관형, 진공관형)
              solarDomesticHotWaterSystem: getStartValueById(
                'solarDomesticHotWaterSystem',
              ), // 태양열 급탕시스템 용량
              solarOrientation: (() => {
                const item = standardModelPerformanceData.find(
                  (data: any) => data.id === 'solarDomesticHotWaterSystem',
                );
                return item?.solarOrientation || null;
              })(), // 태양열 방위
            }
          : {}),
      });

      if (dataRequest && dataRequest.status) {
        const {
          data: {
            gradeData,
            gradeBuildingData,
            active,
            passive,
            renewable,
            passiveCost,
            renewableCost,
            activeCost,
          },
        } = dataRequest;

        gradeData.forEach((data, index) => {
          updateGradeData(index, data);
        });

        gradeBuildingData.forEach((data, index) => {
          updateGradeBuildingData(index, data);
          updateGradeDataPercent(index, {
            ...data,
            renewable: (data.renewable / gradeBuildingData[index].grade) * 100,
            active: (data.active / gradeBuildingData[index].grade) * 100,
            passive: (data.passive / gradeBuildingData[index].grade) * 100,
            totalMoney: gradeBuildingData[index].grade,
          });
        });

        // gradeBuildingData의 모든 number 값 중 최댓값 찾기
        const allNumbers = gradeBuildingData.flatMap((item) => [
          item.renewable,
          item.active,
          item.passive,
          item.increase || 0,
          item.benefit || 0,
        ]);
        const maxValue = Math.max(...allNumbers);
        setChartMaxValue(maxValue * 1.2);

        setActiveData(active);
        setPassiveData(passive);
        setRenewableData(renewable);
        setActiveDataCost(activeCost);
        setPassiveDataCost(passiveCost);
        setRenewableDataCost(renewableCost);

        //standardById
        if (pageStep === 1 && 'standardById' in dataRequest.data) {
          setStandardModelPerformanceData(
            dataRequest.data.standardById as any[],
          );
        }

        if (step === 'step1') {
          setStep1Request(true);
          setStep2Request(false);
          setStep3Request(false);
        }
        if (step === 'step2') {
          setStep1Request(true);
          setStep2Request(true);
          setStep3Request(false);
        }
        if (step === 'step3') {
          setStep1Request(true);
          setStep2Request(true);
          setStep3Request(true);
        }

        /*        setTimeout(() => {
          setLoading(false);
          setTimeout(() => {
            modal.success({
              title: '알림',
              content: '분석이 완료 되었습니다.',
              centered: true,
            });
          }, 300);
        }, 1000 * 1.2);*/

        setLoading(false);
        modal.success({
          title: '알림',
          content: '분석이 완료 되었습니다.',
          centered: true,
        });
      }
    } catch (error) {
      /*      setTimeout(() => {
        setLoading(false);
        setTimeout(() => {
          modal.error({
            title: '분석 요청 실패',
            content:
              '서버 요청 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.',
            centered: true,
          });
        }, 300);
      }, 1000 * 1.2);*/

      setLoading(false);
      modal.error({
        title: '분석 요청 실패',
        content:
          '서버 요청 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.',
        centered: true,
      });

      console.error('analyzeStep1.get error:', error);
    }

    //console.log('get:', dataRequest);
  };

  const onFinishFailed = async (errorInfo: any) => {
    modal.error({
      title: '입력 오류',
      content: '필수 입력 항목을 모두 입력해주세요.',
      centered: true,
    });
  };
  return (
    <>
      <Form
        name="basic"
        form={form}
        disabled={pageStep === 1}
        initialValues={formData}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        onValuesChange={(changedValues, allValues) => {
          // store에 전체 form 값 저장
          updateFormData(allValues);

          // 주소 필드가 변경되었을 때 지도 위치 업데이트
          if (changedValues.roadName) {
            setCurrentAddress(changedValues.roadName);
          } else if (changedValues.lotNumber && !allValues.roadName) {
            setCurrentAddress(changedValues.lotNumber);
          }

          // 건축면적 자동 계산 (연면적 / 지상층수)
          if (changedValues.bld_al_area || changedValues.bld_floor_esurf) {
            const totalArea =
              changedValues.bld_al_area || allValues.bld_al_area;
            const floors =
              changedValues.bld_floor_esurf || allValues.bld_floor_esurf;

            if (totalArea && floors && floors > 0) {
              const buildingArea = Math.round(totalArea / floors);
              form.setFieldsValue({
                bld_area: buildingArea,
              });
              // store에도 업데이트
              updateFormData({ bld_area: buildingArea });
            }
          }
        }}
      >
        {pageStep === 2 ? (
          <div className={styles.standardModelPerformanceEdit}>
            <Flex className={styles.standardModelPerformanceEditTitle} gap={10}>
              <SettingOutlined />
              <span>표준 모델 성능 편집</span>
            </Flex>
            <div className={styles.standardModelPerformanceEditContentWrapper}>
              <div className={styles.standardModelPerformanceEditSubtitle}>
                <span>
                  ZEB 등급에 영향을 미치는 기술 SPEC을 편집하여 분석이
                  가능합니다.
                </span>
                <PassiveEdit />
                <ActiveEdit />
                <RenewableEdit />
              </div>
            </div>
            <Flex justify={'right'} className={'requestButton'}>
              <Button
                htmlType={'submit'}
                type={'primary'}
                icon={<SendOutlined />}
                //onClick={handleRequestAnalysis}
              >
                ZEB 분석 요청
              </Button>
            </Flex>
          </div>
        ) : (
          <div className={styles.mandatoryGradeContainer}>
            <div className={styles.mandatoryGrade}>
              <div className={styles.mandatoryGradeHeader}>
                <img
                  src="/assets/images/icon/icon-mark.png"
                  alt="icon"
                  className={styles.icon}
                />
                <span className={styles.title}>건축물 개요</span>
              </div>
              {pageStep === 0 && (
                <div className={styles.mandatoryGradeAddr}>
                  {/*                <Button size={'middle'} onClick={handleDirectInput}>
                  직접 입력
                </Button>*/}
                  <Button
                    size={'middle'}
                    icon={<SearchOutlined />}
                    iconPosition={'end'}
                    onClick={handleAddressSearch}
                  >
                    주소 검색
                  </Button>
                </div>
              )}

              {pageStep === 1 && (
                <Flex justify={'right'} align={'center'} gap={15}>
                  <span className={styles.zebGradeInputLabel}>
                    ZEB 목표 등급 입력
                  </span>
                  <Form.Item
                    name="zebGrade"
                    style={{
                      marginBottom: '0',
                    }}
                  >
                    <Select
                      disabled={false}
                      style={{
                        width: '120px',
                      }}
                      options={[
                        { value: '5', label: 'ZEB 5등급' },
                        { value: '4', label: 'ZEB 4등급' },
                        { value: '3', label: 'ZEB 3등급' },
                        { value: '2', label: 'ZEB 2등급' },
                      ]}
                    />
                  </Form.Item>
                </Flex>
              )}

              <Flex gap={40}>
                <div className={styles.mapContainer}>
                  {/*<GoogleMaps />*/}
                  <KakaoMaps address={currentAddress} />
                </div>
                <div className={styles.addressContainer}>
                  <div className={styles.addressSection}>
                    <div className={styles.addressTitle}>주소</div>
                    <div className={styles.inputGroup}>
                      <div className={styles.inputLabel}>도로명</div>
                      <Form.Item
                        name="roadName"
                        style={{ flex: 1, margin: 0 }}
                        rules={[{ required: true, message: '' }]}
                        hasFeedback
                      >
                        <Input
                          size={'small'}
                          className={styles.addressInput}
                          readOnly
                        />
                      </Form.Item>
                    </div>
                    <div className={styles.inputGroup}>
                      <div className={styles.inputLabel}>지번</div>
                      <Form.Item
                        name="lotNumber"
                        style={{ flex: 1, margin: 0 }}
                        rules={[{ required: true, message: '' }]}
                        hasFeedback
                      >
                        <Input
                          size={'small'}
                          className={styles.addressInput}
                          readOnly
                        />
                      </Form.Item>
                    </div>
                  </div>
                  <div className={styles.buildingInfoContainer}>
                    <div className={styles.buildingInfoSection}>
                      <div className={styles.buildingInfoTitle}>용도</div>
                      <div className={styles.infoRow}>
                        <div className={styles.infoLabel}>구분 1</div>
                        <Form.Item
                          name="bld_main_use"
                          style={{ flex: 1, margin: 0 }}
                          rules={[
                            {
                              validator: (_, value) =>
                                value && value !== '0'
                                  ? Promise.resolve()
                                  : Promise.reject(''),
                            },
                          ]}
                        >
                          <Select
                            placeholder="선택"
                            className={styles.infoSelect}
                            size="small"
                            options={[{ value: '2', label: '교육시설' }]}
                          />
                        </Form.Item>
                      </div>
                      <div className={styles.infoRow}>
                        <div className={styles.infoLabel}>구분 2</div>
                        <Form.Item
                          name="bld_detail_use"
                          style={{ flex: 1, margin: 0 }}
                          rules={[
                            {
                              validator: (_, value) =>
                                value && value !== '0'
                                  ? Promise.resolve()
                                  : Promise.reject(''),
                            },
                          ]}
                        >
                          <Select
                            placeholder="선택"
                            className={styles.infoSelect}
                            size="small"
                            options={[{ value: '1', label: '초중고' }]}
                          />
                        </Form.Item>
                      </div>
                    </div>

                    <div className={styles.buildingInfoSection}>
                      <div className={styles.buildingInfoTitle}>면적</div>
                      <div className={styles.infoRow}>
                        <div className={styles.infoLabel}>연면적</div>
                        <Form.Item
                          name="bld_al_area"
                          style={{ flex: 1, margin: 0 }}
                          rules={[{ required: true, message: '' }]}
                        >
                          <InputNumber className={styles.infoInput} min={1} />
                        </Form.Item>
                        <span className={styles.unitText}>㎡</span>
                      </div>
                      <div className={styles.infoRow}>
                        <div className={styles.infoLabel}>건축면적</div>
                        <Form.Item
                          name="bld_area"
                          style={{ flex: 1, margin: 0 }}
                          rules={[{ required: true, message: '' }]}
                        >
                          <Input className={styles.infoInput} disabled />
                        </Form.Item>
                        <span className={styles.unitText}>㎡</span>
                      </div>
                    </div>

                    <div className={styles.buildingInfoSection}>
                      <div className={styles.buildingInfoTitle}>층수</div>
                      <div className={styles.infoRow}>
                        <div className={styles.infoLabel}>지상 층수</div>
                        <Form.Item
                          name="bld_floor_esurf"
                          style={{ flex: 1, margin: 0 }}
                          rules={[{ required: true, message: '' }]}
                        >
                          <InputNumber
                            className={styles.infoInput}
                            min={1}
                            max={999}
                          />
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                </div>
              </Flex>
            </div>
            <Flex justify={'right'} className={'requestButton'}>
              <Button
                htmlType={'submit'}
                disabled={false}
                type={'primary'}
                icon={<SendOutlined />}
              >
                {Number(pageStep) === 0
                  ? 'ZEB 사전 진단 요청'
                  : Number(pageStep) === 1
                    ? 'ZEB 분석 요청'
                    : 'ZEB 분석 요청'}
              </Button>
            </Flex>
          </div>
        )}

        <Modal
          title="주소 검색"
          open={isPostcodeModalOpen}
          onCancel={handlePostcodeClose}
          footer={null}
          width={500}
          destroyOnClose
        >
          <DaumPostcodeEmbed
            onComplete={handlePostcodeComplete}
            onClose={handlePostcodeClose}
            style={{ height: '400px' }}
          />
        </Modal>
      </Form>

      {contextHolder}
    </>
  );
};

export default MandatoryZEBLevel;
