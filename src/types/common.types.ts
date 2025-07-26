export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface Theme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon?: string;
  link?: string;
}

export type UserPreferences = {
  theme?: string;
  language?: string;
  autoSave?: boolean;
  [key: string]: unknown;
};