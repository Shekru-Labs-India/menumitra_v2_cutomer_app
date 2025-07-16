export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

export const TOAST_POSITIONS = {
  TOP_LEFT: 'top-left',
  TOP_RIGHT: 'top-right',
  TOP_CENTER: 'top-center',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_CENTER: 'bottom-center'
};

export const DEFAULT_TOAST_CONFIG = {
  duration: 3000,
  position: TOAST_POSITIONS.BOTTOM_CENTER,
  pauseOnHover: true,
  limit: 3
};

export const ICONS = {
  [TOAST_TYPES.SUCCESS]: 'fa-solid fa-check-circle',
  [TOAST_TYPES.ERROR]: 'fa-solid fa-times-circle',
  [TOAST_TYPES.WARNING]: 'fa-solid fa-exclamation-circle',
  [TOAST_TYPES.INFO]: 'fa-solid fa-info-circle'
}; 