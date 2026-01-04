export const UI_CONSTANTS = {
  PREVIEW_MAX_WIDTH: 1280,
  SIDEBAR_WIDTH: 320,
  TOOLBAR_HEIGHT: 48,
  
  COLORS: {
    PRIMARY: '#f97316', // Orange-500
    BACKGROUND: '#0a0a0a',
    SURFACE: '#171717',
    BORDER: '#262626',
    TEXT_PRIMARY: '#ffffff',
    TEXT_SECONDARY: '#a3a3a3'
  },
  
  Z_INDEX: {
    CANVAS: 0,
    OVERLAY: 10,
    MODAL: 50,
    TOOLTIP: 100
  }
} as const;
