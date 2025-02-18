import type { ButtonConfig } from '../../../shared/ui/button/button.component'

export const INFO_WINDOW_OPTIONS: google.maps.InfoWindowOptions = {
  headerContent: null,
  headerDisabled: true,
}

export const MOVE_BUTTON_CONFIG: ButtonConfig = {
  text: 'Move around',
  type: 'primary_action',
  svg: 'globe',
}

export const ADD_BUTTON_CONFIG: ButtonConfig = {
  text: 'Add marker',
  type: 'primary_action',
  svg: 'plus',
}

export const GO_BACK_BUTTON_CONFIG: ButtonConfig = {
  text: 'Go back',
  type: 'secondary_action',
  svg: 'arrow_back',
}

export const GO_BACK_MOBILE_BUTTON_CONFIG: ButtonConfig = {
  text: '',
  type: 'secondary_action',
  svg: 'arrow_back',
  customCss: 'rounded-full bg-sky-600 text-white hover:bg-pink-700 focus:outline-none shadow-md cursor-pointer p-3',
}
