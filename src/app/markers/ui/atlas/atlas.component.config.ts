import { environment } from '../../../../environments/environment';
import { ButtonConfig } from '../../../shared/ui/button/button.component';

export const DEFAULT_MAP_OPTIONS: google.maps.MapOptions = {
  draggableCursor: 'grab',
  draggingCursor: 'grab',
  scaleControl: false,
  disableDefaultUI: true,
  scrollwheel: true,
  zoom: 5,
  fullscreenControl: true,
  minZoom: 3,
  mapId: environment.googleMapId,
};

export const MOVE_MODE_MAP_OPTIONS: google.maps.MapOptions = {
  draggableCursor: 'grab',
  draggingCursor: 'grab',
};
export const ADD_MODE_MAP_OPTIONS: google.maps.MapOptions = {
  draggableCursor: 'crosshair',
  draggingCursor: 'grab',
};

export const INFO_WINDOW_OPTIONS: google.maps.InfoWindowOptions = {
  headerContent: null,
  headerDisabled: true,
};

export const MOVE_BUTTON_CONFIG: ButtonConfig = {
  text: 'Move around',
  type: 'primary_action',
  svg: 'globe',
};

export const ADD_BUTTON_CONFIG: ButtonConfig = {
  text: 'Add marker',
  type: 'add',
  svg: 'plus',
};

export const GO_BACK_BUTTON_CONFIG: ButtonConfig = {
  text: 'Go back',
  type: 'secondary_action',
  svg: 'arrow_back',
};
