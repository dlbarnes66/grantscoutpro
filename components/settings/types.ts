export interface NotificationPrefs {
  email: boolean;
  push: boolean;
  aiAlerts: boolean;
}

export interface OrgSettingsData {
  orgName: string;
  timezone: string;
}

export interface ProfileSettingsData {
  name: string;
  email: string;
}

export interface SecuritySettingsData {
  password: string;
  twoFA: boolean;
}

export interface ThemePreferencesData {
  theme: "dark" | "light";
  accent: "blue" | "purple" | "green" | "gold";
}
