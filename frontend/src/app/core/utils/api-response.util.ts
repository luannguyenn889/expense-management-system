import { ApiResponse } from '../models/api-response.model';

export function unwrapApiResponse<T>(response: ApiResponse<T>): T {
  if (response.data === null) {
    throw new Error(response.message || 'Phản hồi từ máy chủ không hợp lệ.');
  }

  return response.data;
}
