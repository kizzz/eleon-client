import type { DocumentVersionEntity } from '../../../../../../../../infrastructure/module/entities/models';

export interface AuditDto {
  data?: string;
  documentVersion: DocumentVersionEntity;
}

export interface CreateAuditDto {
  refDocumentObjectType?: string;
  refDocumentId?: string;
  auditedDocumentObjectType?: string;
  auditedDocumentId?: string;
  documentData?: string;
  documentVersion: DocumentVersionEntity;
}

export interface GetAuditDto {
  auditedDocumentObjectType?: string;
  auditedDocumentId?: string;
  version?: string;
}

export interface GetVersionDto {
  refDocumentObjectType?: string;
  refDocumentId?: string;
}

export interface IncrementVersionRequestDto {
  auditedDocumentObjectType?: string;
  auditedDocumentId?: string;
  version: DocumentVersionEntity;
}

export interface IncrementVersionResultDto {
  success: boolean;
  newDocumentVersion: DocumentVersionEntity;
}
