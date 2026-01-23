
export interface ResultDto<T> {
  value: T;
  isFailed: boolean;
  isSuccess: boolean;
  errors: ResultErrorDto[];
  successes: ResultSuccessDto[];
}

export interface ResultErrorDto {
  message?: string;
}

export interface ResultSuccessDto {
  message?: string;
}
