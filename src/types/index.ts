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
  | 'service'
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

export type ColorRole =
  | 'primary'
  | 'secondary'
  | 'background'
  | 'surface'
  | 'text'
  | 'muted'
  | 'accent'
  | 'detail';

export interface ColorItem {
  key: string;
  label: string;
  role: ColorRole;
  defaultValue: string;
  currentValue: string;
  cssVarName?: string;
}

export interface ThemeMetadata {
  cssVariables: Record<string, string>;
  colors?: ColorItem[];
  originalColors?: Record<string, string>;
  fontFamily?: string;
}

export interface EditorSchema {
  fields: EditorField[];
  colors?: ColorItem[];
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
