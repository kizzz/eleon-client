import type { TemplateType } from './template-type.enum';
import type { PagedAndSortedResultRequestDto } from '@eleon/proxy-utils.lib';
import type { TextFormat } from '../../../../common/module/constants/text-format.enum';

export interface ApplyTemplateInput {
  templateName: string;
  templateType: TemplateType;
  placeholders: Record<string, string>;
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

export interface TemplateDto extends MinimalTemplateDto {
  templateContent?: string;
  requiredPlaceholders?: string;
  creationTime?: string;
  lastModificationTime?: string;
}
