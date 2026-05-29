import React, { useState, useContext } from 'react';
import { Trash2, Pencil, Sparkles, Search, User, Shield, Key, Users as UsersIcon } from 'lucide-react';
import { motion, AnimatePresence } from "motion/react";
import { Highlight } from '../../frontend/components';
import { MODULES, ACTIONS, ALL_PERMISSIONS } from "../../constants";
import { LanguageContext } from "../../contexts/AppContext";
import { TRANSLATIONS } from "../../translations";

interface UsersTabProps {
  users: any[];
  searchQuery: string;
  isAdding: boolean;
  editingId: string | null;
  userForm: { username: string, password: string, role: string, display_name: string };
  setUserForm: React.Dispatch<React.SetStateAction<{ username: string, password: string, role: string, display_name: string }>>;
  roles: any[];
  onAddUser: (e: React.FormEvent) => void;
  onEditUser: (user: any) => void;
  onDeleteUser: (table: string, id: string) => void;
  canManage: boolean;
  saving: boolean;
  currentUser: any;
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
  // Roles props
  roleForm: { name: string, permissions: string[] };
  setRoleForm: React.Dispatch<React.SetStateAction<{ name: string, permissions: string[] }>>;
  onAddRole: (e: React.FormEvent) => void;
  onEditRole: (role: any) => void;
  onDeleteRole: (table: string, id: string) => void;
}

export function UsersTab({ 
  users, searchQuery, isAdding, editingId, userForm, setUserForm, 
  roles, onAddUser, onEditUser, onDeleteUser, canManage, saving, 
  currentUser, selectedIds, toggleSelect, toggleSelectAll,
  roleForm, setRoleForm, onAddRole, onEditRole, onDeleteRole
}: UsersTabProps) {
  const context = useContext(LanguageContext);
  const t = context?.t || TRANSLATIONS.en;
  const [subTab, setSubTab] = useState<'profiles' | 'security'>('profiles');

  const filteredUsers = users.filter(item => 
    item.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRoles = roles.filter(item => 
    item.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-0">
      <div className="px-8 py-4 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-6">
        <button 
          onClick={() => setSubTab('profiles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${subTab === 'profiles' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-neutral-400 hover:text-neutral-600'}`}
        >
          <UsersIcon className="w-4 h-4" />
          {t.backend.users.toUpperCase()}
        </button>
        <button 
          onClick={() => setSubTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${subTab === 'security' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-neutral-400 hover:text-neutral-600'}`}
        >
          <Shield className="w-4 h-4" />
          {t.backend.fields.role.toUpperCase()}
        </button>
      </div>

      <div className="p-0">
        {subTab === 'profiles' ? (
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {isAdding && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-8 bg-neutral-50 dark:bg-neutral-800/30 border-b border-neutral-100 dark:border-neutral-800 text-neutral-800 dark:text-neutral-100">
                    <form onSubmit={onAddUser} className="max-w-4xl space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">{t.backend.fields.displayName}</label>
                          <input 
                            type="text"
                            value={userForm.display_name}
                            onChange={e => setUserForm({...userForm, display_name: e.target.value})}
                            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                            placeholder="Real name..."
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">{t.backend.fields.username}</label>
                          <input 
                            type="text"
                            value={userForm.username}
                            onChange={e => setUserForm({...userForm, username: e.target.value})}
                            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                            placeholder="Login identifier..."
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">{t.backend.fields.password}</label>
                          <input 
                            type="password"
                            value={userForm.password}
                            onChange={e => setUserForm({...userForm, password: e.target.value})}
                            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                            placeholder={editingId ? "Leave blank to keep same" : t.backend.fields.password}
                            required={!editingId}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">{t.backend.fields.role}</label>
                          <select 
                            value={userForm.role}
                            onChange={e => setUserForm({...userForm, role: e.target.value})}
                            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                            required
                          >
                            {roles.map(role => (
                              <option key={role.id} value={role.name}>{role.name.toUpperCase()}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <button 
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-xl shadow-blue-500/20 disabled:opacity-50 active:scale-95"
                      >
                        {saving ? <span className="animate-spin text-lg">◌</span> : <Sparkles className="w-4 h-4" />}
                        {editingId ? t.backend.common.update : t.backend.common.add}
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-neutral-50/50 dark:bg-neutral-900/50">
                  <tr className="border-b border-neutral-100 dark:border-neutral-800">
                    <th className="px-8 py-4 w-10">
                      {canManage && (
                        <input 
                          type="checkbox" 
                          checked={filteredUsers.length > 0 && selectedIds.length === filteredUsers.length}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      )}
                    </th>
                    <th className="px-8 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">{t.backend.fields.identify}</th>
                    <th className="px-8 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">{t.backend.fields.username}</th>
                    <th className="px-8 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">{t.backend.fields.role}</th>
                    <th className="px-8 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest text-right">{t.backend.settings}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className={`group hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors ${selectedIds.includes(u.id.toString()) ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}>
                      <td className="px-8 py-6">
                        {canManage && u.username !== 'super_admin' && (
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(u.id.toString())}
                            onChange={() => toggleSelect(u.id)}
                            className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-2xl ${u.role === 'admin' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'} flex items-center justify-center border border-neutral-200 dark:border-neutral-700`}>
                            <User className="w-5 h-5 transition-transform group-hover:scale-110" />
                          </div>
                          <div>
                            <p className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                              <Highlight text={u.display_name} query={searchQuery} />
                              {currentUser?.username === u.username && <span className="ml-2 text-[8px] bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">You</span>}
                            </p>
                            <p className="text-[10px] text-neutral-400 font-mono">ID: {u.id.toString().slice(0,8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                           <Key className="w-3 h-3" />
                           <span className="text-xs font-bold leading-none">
                             <Highlight text={u.username} query={searchQuery} />
                           </span>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit ${u.role === 'admin' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 border border-amber-200/50 dark:border-amber-800/50' : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-400 border border-neutral-200 dark:border-neutral-700'}`}>
                          <Shield className="w-3 h-3" />
                          <Highlight text={u.role} query={searchQuery} />
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        {canManage && u.username !== 'super_admin' && (
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onEditUser(u)} className="text-neutral-400 hover:text-blue-600 p-2 transition-all">
                              <Pencil className="w-4 h-4" />
                            </button>
                            {currentUser?.username !== u.username && (
                              <button onClick={() => onDeleteUser('users', u.id)} className="text-neutral-400 hover:text-red-600 p-2 transition-all">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={10} className="p-20 text-center border-none">
                        <Search className="w-8 h-8 mx-auto text-neutral-200 mb-2" />
                        <p className="text-neutral-400 font-bold">{searchQuery ? `${t.backend.common.noMatch} "${searchQuery}"` : t.backend.common.noData}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {isAdding && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-8 bg-neutral-50 dark:bg-neutral-800/30 border-b border-neutral-100 dark:border-neutral-800 text-neutral-800 dark:text-neutral-100">
                    <form onSubmit={onAddRole} className="max-w-4xl space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">{t.backend.fields.role} {t.backend.fields.name}</label>
                          <input 
                            type="text"
                            value={roleForm.name}
                            onChange={e => setRoleForm({...roleForm, name: e.target.value})}
                            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                            placeholder="Role name..."
                            required
                          />
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between px-1">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Permissions Matrix</label>
                            <button 
                              type="button" 
                              onClick={() => setRoleForm({...roleForm, permissions: roleForm.permissions.length === ALL_PERMISSIONS.length ? [] : ALL_PERMISSIONS.map(p => p.id)})}
                              className="text-[10px] font-bold text-blue-600 hover:underline"
                            >
                              {roleForm.permissions.length === ALL_PERMISSIONS.length ? t.backend.common.deselect : t.backend.common.selected}
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {MODULES.map(module => (
                              <div key={module.id} className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3 border-b border-neutral-50 dark:border-neutral-800 pb-1">{module.label}</p>
                                <div className="space-y-2">
                                  {ACTIONS.map(action => {
                                    const perm = `${module.id}.${action.id}`;
                                    return (
                                      <label key={perm} className="flex items-center gap-2 cursor-pointer group">
                                        <input 
                                          type="checkbox" 
                                          checked={roleForm.permissions.includes(perm)}
                                          onChange={(e) => {
                                            const newPerms = e.target.checked 
                                              ? [...roleForm.permissions, perm]
                                              : roleForm.permissions.filter(p => p !== perm);
                                            setRoleForm({...roleForm, permissions: newPerms});
                                          }}
                                          className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400 group-hover:text-blue-600 transition-colors uppercase">{action.label}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <button 
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-xl shadow-blue-500/20 disabled:opacity-50 active:scale-95"
                      >
                        {saving ? <span className="animate-spin text-lg">◌</span> : <Shield className="w-4 h-4" />}
                        {editingId ? t.backend.common.update : t.backend.common.add}
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-neutral-50/50 dark:bg-neutral-900/50">
                  <tr className="border-b border-neutral-100 dark:border-neutral-800">
                    <th className="px-8 py-4 w-10">
                      {canManage && (
                        <input 
                          type="checkbox" 
                          checked={filteredRoles.length > 0 && selectedIds.length === filteredRoles.length}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      )}
                    </th>
                    <th className="px-8 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">{t.backend.fields.role} {t.backend.fields.name}</th>
                    <th className="px-8 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Permissions</th>
                    <th className="px-8 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest text-right">{t.backend.common.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {filteredRoles.map(r => (
                    <tr key={r.id} className={`group hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors ${selectedIds.includes(r.id.toString()) ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}>
                      <td className="px-8 py-6">
                        {canManage && r.name !== 'admin' && (
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(r.id.toString())}
                            onChange={() => toggleSelect(r.id)}
                            className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center border border-neutral-200 dark:border-neutral-700">
                            <Shield className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-neutral-900 dark:text-neutral-100 text-sm uppercase italic">
                              <Highlight text={r.name} query={searchQuery} />
                            </p>
                            <p className="text-[10px] text-neutral-400 font-mono">ID: {r.id.toString().slice(0,8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex flex-wrap gap-1 max-w-md">
                           {(r.permissions || []).slice(0, 4).map((p: string) => (
                             <span key={p} className="text-[8px] font-black bg-neutral-100 dark:bg-neutral-800 text-neutral-500 px-1.5 py-0.5 rounded uppercase">{p}</span>
                           ))}
                           {(r.permissions || []).length > 4 && (
                             <span className="text-[8px] font-black bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-1.5 py-0.5 rounded uppercase">+{(r.permissions || []).length - 4} MORE</span>
                           )}
                         </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        {canManage && r.name !== 'admin' && (
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onEditRole(r)} className="text-neutral-400 hover:text-blue-600 p-2 transition-all">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => onDeleteRole('roles', r.id)} className="text-neutral-400 hover:text-red-600 p-2 transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
