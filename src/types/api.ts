export interface ApiResponse<T> {
  data: T;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
}

export interface ApiError {
  code: string;
  message: string;
  data?: {
    status: number;
  };
}
