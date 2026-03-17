import axios from 'axios';

// 외부 ZEB API용 axios 인스턴스
const nextApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// step1 GET 호출 함수 - 파라미터 지원
export async function getStep(params?: { [key: string]: any }) {
  try {
    if (!params || !params.step) {
      throw new Error('step 파라미터가 필요합니다.');
    }

    const step = params.step;
    delete params.step;

    const config = params ? { params } : {};

    // 실제 API 호출 파라미터 및 URL 확인
    //console.log('[ZEB API] 호출 step:', step);
    //console.log('[ZEB API] 전달 params:', params);
    // axios는 실제 요청 URL을 response.config.url로 확인할 수 있으므로, 아래에서 추가 로그 출력
    const response = await nextApi.get(step, config);
    return response.data;
  } catch (error) {
    console.error('step1 GET 호출 실패:', error);
    throw error;
  }
}

export default nextApi;
