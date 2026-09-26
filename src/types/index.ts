export type UserRole = 'admin' | 'user';
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'blocked';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: any;
  updatedAt: any;
  approvedAt?: any;
  approvedBy?: string;
}

export interface NicheInfo {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
}

export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'image' 
  | 'logo' 
  | 'whatsapp' 
  | 'instagram' 
  | 'social' 
  | 'maps' 
  | 'address' 
  | 'color' 
  | 'button'
  | 'link'
  | 'gallery';

export interface EditorField {
  key: string;
  label: string;
  type: FieldType;
  selector?: string;
  attribute?: string; // e.g. 'src', 'href', 'textContent', 'cssVar'
  cssVarName?: string;
  defaultValue?: any;
  currentValue?: any;
  helpText?: string;
  enabled?: boolean;
}

export interface EditorSchema {
  fields: EditorField[];
}

export interface ThemeMetadata {
  cssVariables: Record<string, string>;
  fontFamily?: string;
}

export interface BioTemplate {
  templateId: string;
  name: string;
  nicheId: string;
  nicheName: string;
  version: number;
  status: 'draft' | 'published' | 'archived';
  sourceHtml: string;
  sourceRef?: string;
  editorSchema: EditorSchema;
  themeMetadata?: ThemeMetadata;
  createdAt: any;
  updatedAt: any;
}

export interface BioProject {
  id: string;
  ownerUid: string;
  templateId: string;
  templateVersion: number;
  templateName: string;
  nicheId: string;
  name: string;
  values: Record<string, any>;
  theme?: Record<string, string>;
  assets?: Record<string, string>;
  createdAt: any;
  updatedAt: any;
}
