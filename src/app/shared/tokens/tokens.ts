import { HttpContextToken } from '@angular/common/http';

export const ERROR_MESSAGE = new HttpContextToken<string>(() => 'error_message');

export const INFO_MESSAGE = new HttpContextToken<string>(() => 'info_message');

export const BYPASS_LOADER = new HttpContextToken<boolean>(() => true);
