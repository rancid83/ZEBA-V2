import { NextResponse } from 'next/server';
import { getStep } from '@/services/nextApi';

export async function GET(request: Request) {
  try {
    // URL에서 query parameters 추출
    const { searchParams } = new URL(request.url);
    const params: { [key: string]: string } = {};

    // 모든 query parameter를 객체로 변환
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    // 외부 ZEB API 호출 시 파라미터 전달
    const zebData = await getStep(params);

    return NextResponse.json(
      {
        status: true,
        data: zebData,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
      },
    );
  } catch (error: any) {
    console.error('API 호출 실패:', error);

    return NextResponse.json(
      {
        status: false,
        error: error.message || 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
      },
    );
  }
}
