'use client';

import { Map, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useEffect, useState } from 'react';

interface KakaoMapsProps {
  address?: string;
}

const KakaoMaps = ({ address }: KakaoMapsProps) => {
  const [loading, error] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY || '', // 발급 받은 APPKEY
    libraries: ['services', 'clusterer'],
  });

  const [center, setCenter] = useState({ lat: 37.566826, lng: 126.9786567 });
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  // 주소를 좌표로 변환하는 함수
  const geocodeAddress = (address: string) => {
    if (!window.kakao || !window.kakao.maps) return;

    const geocoder = new window.kakao.maps.services.Geocoder();

    geocoder.addressSearch(address, (result: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const coords = {
          lat: parseFloat(result[0].y),
          lng: parseFloat(result[0].x),
        };
        setCenter(coords);
        setMarker(coords);
      }
    });
  };

  // 초기 로드 시 기본 주소로 지도 설정
  useEffect(() => {
    const defaultAddress = '서울특별시 강서구 공항대로 220';
    geocodeAddress(defaultAddress);
  }, []);

  // 주소가 변경될 때마다 지도 위치 업데이트
  useEffect(() => {
    if (address && address.trim()) {
      geocodeAddress(address);
    }
  }, [address]);

  // 로딩/에러 상태 처리
  if (loading) return <div>지도 로딩중...</div>;
  if (error) {
    return <div>지도 로드 실패</div>;
  }

  return (
    <div style={{ border: '1px solid black', width: '100%', height: '100%' }}>
      <Map center={center} style={{ width: '100%', height: '100%' }} level={3}>
        {marker && <MapMarker position={marker} />}
      </Map>
    </div>
  );
};

export default KakaoMaps;
