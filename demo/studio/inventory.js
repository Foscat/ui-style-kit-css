/**
 * @module studio/inventory
 * @description Lightweight navigation metadata shared without instantiating component templates.
 */

/** Navigation groups for the public component explorer. */
export const componentInventory = [
  { id: 'all', label: 'All components', description: 'Every component and variant' },
  {
    id: 'buttons',
    label: 'Buttons & actions',
    description: 'Emphasis, disabled and loading states',
  },
  { id: 'fields', label: 'Fields & inputs', description: 'Text, selection and validation' },
  {
    id: 'choices',
    label: 'Choices & switches',
    description: 'Checkboxes, radio groups and switches',
  },
  {
    id: 'feedback',
    label: 'Messages & status',
    description: 'Alerts, badges, progress and loading',
  },
  { id: 'navigation', label: 'Navigation', description: 'Tabs, breadcrumbs, menus and pagination' },
  { id: 'data', label: 'Tables & records', description: 'Tables, metrics, chips and avatars' },
  {
    id: 'overlays',
    label: 'Dialogs & disclosure',
    description: 'Native dialogs, details and popovers',
  },
  { id: 'media', label: 'Content & media', description: 'Cards, empty states and typography' },
];
