import type { ButtonConfig } from '../../../shared/ui/button/button.component';
import type { CustomDialogConfig } from '../../../shared/ui/dialog/dialog.component';
import type { DropdownConfig } from '../../../shared/ui/dropdown/dropdown.component';

export const DELETE_DIALOG_CONFIG: CustomDialogConfig = {
  title: 'Delete image',
  primaryActionButtonConfig: {
    text: 'Delete image',
    type: 'delete',
  },
  secondaryActionButtonConfig: {
    text: 'Cancel',
    type: 'cancel',
  },
};

export const ADD_CAPTION_DIALOG_CONFIG: CustomDialogConfig = {
  title: 'Add or update caption',
  primaryActionButtonConfig: {
    text: 'Save',
    type: 'primary_action',
  },
  secondaryActionButtonConfig: {
    text: 'Cancel',
    type: 'cancel',
  },
};

export const ADD_JOURNAL_ENTRY_DIALOG_CONFIG: CustomDialogConfig = {
  title: 'Manage journal entry',
  primaryActionButtonConfig: {
    text: 'Save journal',
    type: 'primary_action',
  },
  secondaryActionButtonConfig: {
    text: 'Cancel',
    type: 'cancel',
  },
};

export const DISPLAY_CAPTION_DIALOG_CONFIG: CustomDialogConfig = {
  title: 'Caption',
  secondaryActionButtonConfig: {
    text: 'Cancel',
    type: 'cancel',
  },
};

export const DROPDOWN_CONFIG: DropdownConfig = {
  options: [
    { label: 'Manage caption', index: 1 },
    { label: 'Delete', index: 0 },
  ],
  buttonConfig: {
    text: '',
    type: 'primary_action',
    svg: 'ellipsis',
    customCss: 'rounded-full bg-sky-600 text-white hover:bg-sky-700 focus:outline-none shadow-md cursor-pointer p-1',
  },
};
export const DISPLAY_CAPTION_BUTTON_CONFIG: ButtonConfig = {
  text: '',
  type: 'secondary_action',
  svg: 'speech_bubble',
  customCss: 'rounded-full bg-pink-600 text-white hover:bg-pink-700 focus:outline-none shadow-md cursor-pointer p-1',
};

export const ADD_JOURNAL_ENTRY_BUTTON_CONFIG: ButtonConfig = {
  text: 'Manage journal',
  type: 'primary_action',
  svg: 'pencil',
};

export const ADD_JOURNAL_ENTRY_MOBILE_BUTTON_CONFIG: ButtonConfig = {
  text: '',
  type: 'primary_action',
  svg: 'pencil',
  customCss: 'rounded-full bg-yellow-600 text-white hover:bg-pink-700 focus:outline-none shadow-md cursor-pointer p-3',
};

export const UPLOAD_IMAGES_MOBILE_BUTTON_CONFIG: ButtonConfig = {
  text: '',
  type: 'primary_action',
  svg: 'arrow_on_square_up',
  customCss: 'fixed z-1 bottom-24 right-10 rounded-full bg-sky-600 text-white focus:outline-none shadow-md cursor-pointer p-3 md:hidden ',
};