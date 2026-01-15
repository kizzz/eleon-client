import type { TemplateType } from './template-type.enum';
import type { TextFormat } from '../../../../common/module/constants/text-format.enum';
import type { PagedAndSortedResultRequestDto } from '@eleon/proxy-utils.lib';

export interface ApplyTemplateInput {
  templateName: string;
  templateType: TemplateType;
  placeholders: Record<string, string>;
}

export interface CreateUpdateTemplateDto {
  name: string;
  type: TemplateType;
  format: TextFormat;
  templateContent: string;
  requiredPlaceholders?: string;
  templateId?: string;
  isSystem: boolean;
}

export interface GetTemplateListInput extends PagedAndSortedResultRequestDto {
  searchQuery?: string;
  type?: TemplateType;
  format?: TextFormat;
  isSystem?: boolean;
  filter?: string;
}

export interface MinimalTemplateDto {
  id?: string;
  name?: string;
  type: TemplateType;
  format: TextFormat;
  templateId?: string;
  isSystem: boolean;
}

export interface ResetTemplateInput {
  name?: string;
  type: TemplateType;
}

export interface TemplateDto extends MinimalTemplateDto {
  templateContent?: string;
  requiredPlaceholders?: string;
  creationTime?: string;
  lastModificationTime?: string;
}
