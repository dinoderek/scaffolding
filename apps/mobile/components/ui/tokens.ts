export const uiColors = {
  actionPrimary: '#0f5cc0',
  actionPrimaryText: '#ffffff',
  actionPrimarySubtleBg: '#eaf2ff',
  actionPrimarySubtleBorder: '#cfe1ff',
  actionDanger: '#b3261e',
  actionDangerText: '#8a2323',
  actionDangerSubtleBg: '#fff0f0',
  actionDangerSubtleBorder: '#f3c5c5',
  actionNeutralSubtleBg: '#eef2f9',
  actionNeutralSubtleBorder: '#c7d3e8',
  actionNeutralSubtleText: '#20324f',
  borderDefault: '#d0d0d0',
  borderMuted: '#dbe3ef',
  borderTabShell: '#cfd8e6',
  surfaceDefault: '#ffffff',
  surfaceMuted: '#fafafa',
  surfacePage: '#f4f7fb',
  textPrimary: '#122033',
  textSecondary: '#56667f',
  textMuted: '#555555',
  textAccent: '#0f5cc0',
  textTab: '#22344f',
} as const;

export const uiSpace = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  xxl: 16,
  screen: 20,
} as const;

export const uiRadius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  full: 999,
} as const;

export const uiTypography = {
  size: {
    xs: 11,
    sm: 12,
    md: 13,
    base: 14,
    lg: 16,
    xl: 18,
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export const uiBorder = {
  width: 1,
} as const;

export const uiTokens = {
  colors: uiColors,
  space: uiSpace,
  radius: uiRadius,
  typography: uiTypography,
  border: uiBorder,
} as const;

export type UiColorToken = keyof typeof uiColors;
export type UiSpaceToken = keyof typeof uiSpace;
export type UiRadiusToken = keyof typeof uiRadius;
