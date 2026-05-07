import { constructConfigIngressUrl } from '../utils/urlHelpers';

/** When true and {@link INGRESS_CLASS_URL} is set, fetch IngressClass names from config API; else use static list. */
export const INGRESS_CLASS_USE_REMOTE = true;
export const INGRESS_CLASS_URL = constructConfigIngressUrl();
