
export interface StartNewLifecycleRequestDto {
  templateId?: string;
  documentId?: string;
  documentObjectType?: string;
  startImmediately: boolean;
  isSkipFilled: boolean;
  extraProperties: Record<string, object>;
}
