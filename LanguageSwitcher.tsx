export const MODULES = [
  { id: 'leads', label: 'Leads' },
  { id: 'users', label: 'Users' },
  { id: 'clients', label: 'Clients' },
  { id: 'roles', label: 'Roles' },
];

export const ACTIONS = [
  { id: 'view', label: 'View' },
  { id: 'add', label: 'Add New' },
  { id: 'edit', label: 'Edit' },
  { id: 'delete', label: 'Delete' },
];

export const ALL_PERMISSIONS = MODULES.flatMap(m => ACTIONS.map(a => ({
  id: `${m.id}.${a.id}`,
  label: `${a.label} ${m.label}`
})));
