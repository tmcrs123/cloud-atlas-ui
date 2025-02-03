import { ButtonConfig } from '../../../shared/ui/button/button.component';
import { CustomDialogConfig } from '../../../shared/ui/dialog/dialog.component';
import { DropdownConfig } from '../../../shared/ui/dropdown/dropdown.component';
import { LightboxConfig } from '../../../shared/ui/lightbox/lightbox.component';

export const DELETE_DIALOG_CONFIG: CustomDialogConfig = {
  title: 'Delete image',
  primaryActionButtonConfig: {
    text: 'Delete image',
    type: 'delete',
  },
  secondaryActionButtonConfig: {
    text: 'Cancel',
    type: 'secondary_action',
  },
};

export const ADD_CAPTION_DIALOG_CONFIG: CustomDialogConfig = {
  title: 'Add or update caption for image',
  primaryActionButtonConfig: {
    text: 'Save',
    type: 'add',
  },
  secondaryActionButtonConfig: {
    text: 'Cancel',
    type: 'secondary_action',
  },
};

export const ADD_JOURNAL_ENTRY_DIALOG_CONFIG: CustomDialogConfig = {
  title: 'Manage journal entry',
  primaryActionButtonConfig: {
    text: 'Save journal',
    type: 'add',
  },
  secondaryActionButtonConfig: {
    text: 'Cancel',
    type: 'secondary_action',
  },
};

export const DISPLAY_CAPTION_DIALOG_CONFIG: CustomDialogConfig = {
  title: 'Caption',
  secondaryActionButtonConfig: {
    text: 'Cancel',
    type: 'secondary_action',
  },
};

export const DROPDOWN_CONFIG: DropdownConfig = {
  options: [
    { label: 'Delete', index: 0 },
    { label: 'Manage caption', index: 1 },
  ],
  buttonConfig: {
    text: '',
    type: 'primary_action',
    svg: 'plus',
    customCss:
      'rounded-full bg-sky-600 text-white hover:bg-sky-700 focus:outline-none shadow-md cursor-pointer p-1',
  },
};
export const DISPLAY_CAPTION_BUTTON_CONFIG: ButtonConfig = {
  text: '',
  type: 'accent',
  svg: 'speech_bubble',
  customCss:
    'rounded-full bg-pink-600 text-white hover:bg-pink-700 focus:outline-none shadow-md cursor-pointer p-1',
};

export const ADD_JOURNAL_ENTRY_BUTTON_CONFIG: ButtonConfig = {
  text: 'Add journal',
  type: 'add',
  svg: 'pencil',
};

export const LIGHTBOX_CONFIG: LightboxConfig = {
  isVisible: false,
  openAtIndex: 0,
};
