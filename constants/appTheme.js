// NSTP HUB palette supplied by the project.
export const NSTP_PALETTE = {
  cream: '#EFEBE2',
  maroon: '#54100F',
  green: '#58761C',
  yellow: '#FFBD36',
  orange: '#D99202',
  darkTeal: '#233E47',
  nearBlack: '#000D12',
  white: '#FFFFFF',
  gray: '#BEBEBE',
  dark: '#0D171B',
};

export const APP_THEME = {
  light: {
    background: NSTP_PALETTE.cream,
    surface: NSTP_PALETTE.white,
    surfaceAlt: NSTP_PALETTE.cream,
    text: NSTP_PALETTE.darkTeal,
    textStrong: NSTP_PALETTE.nearBlack,
    border: NSTP_PALETTE.gray,
    icon: NSTP_PALETTE.darkTeal,
  },
  dark: {
    background: '#000D12',
    surface: '#233E47',
    surfaceAlt: '#233E47',
    text: '#EFEBE2',
    textStrong: '#EFEBE2',
    textMuted: '#EFEBE2',
    border: '#58761C',
    icon: '#EFEBE2',
    accent: '#D99202',
    accentSecondary: '#D99202',
    success: '#58761C',
  },
};
