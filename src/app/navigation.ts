export const SUPPORT_URL = 'https://www.copeland.com/en-us/brands/white-rodgers/customer-support';

export type AccountPresentation = 'signed-out' | 'signed-in';
export type AccountNavigationAction = 'sign-in' | 'logout';

export const navigationItems = [
  { id: 'order-history', label: 'Order History', kind: 'notice' },
  { id: 'faq', label: 'FAQ', kind: 'notice' },
  { id: 'support', label: 'Support', kind: 'external', href: SUPPORT_URL, target: '_blank', rel: 'noopener noreferrer' },
] as const;

export type PlaceholderNavigationAction = 'order-history' | 'faq';
