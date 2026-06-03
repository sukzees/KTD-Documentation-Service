import React, { useContext } from "react";
import { 
  Plus, Edit2, Trash2, Search, Filter, Mail, Phone, Building2, 
  Calendar, CheckCircle2, AlertCircle, Clock, MoreVertical, X,
  ExternalLink, UserPlus
} from "lucide-react";
import { LanguageContext } from "../../contexts/AppContext";
import { TRANSLATIONS } from "../../translations";

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: 'Lead' | 'Opportunity' | 'Customer' | 'Inactive';
  created_at: string;
}

interface CustomersTabProps {
  customers: Customer[];
  searchQuery: string;
  isAdding: boolean;
  editingId: string | null;
  customerForm: { name: string, email: string, phone: string, company: string, status: string };
  setCustomerForm: React.Dispatch<React.SetStateAction<{ name: string, email: string, phone: string, company: string, status: string }>>;
  onAddCustomer: (e: React.FormEvent) => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (table: string, id: string) => void;
  canManage: boolean;
  saving: boolean;
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
}

export function CustomersTab({
  customers,
  searchQuery,
  isAdding,
  editingId,
  customerForm,
  setCustomerForm,
  onAddCustomer,
  onEditCustomer,
  onDeleteCustomer,
  canManage,
  saving,
  selectedIds,
  toggleSelect,
  toggleSelectAll
}: CustomersTabProps) {
  const context = useContext(LanguageContext);
  const t = context?.t || TRANSLATIONS.en;
  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
    (c.company?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Lead': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Opportunity': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Customer': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Inactive': return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-500';
      default: return 'bg-neutral-100 text-neutral-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Lead': return <Clock className="w-3 h-3" />;
      case 'Opportunity': return <AlertCircle className="w-3 h-3" />;
      case 'Customer': return <CheckCircle2 className="w-3 h-3" />;
      case 'Inactive': return <X className="w-3 h-3" />;
      default: return null;
    }
  };

  if (isAdding) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            {editingId ? <Edit2 className="w-6 h-6 text-white" /> : <UserPlus className="w-6 h-6 text-white" />}
          </div>
          <div>
            <h3 className="text-2xl font-black text-neutral-900 dark:text-white uppercase italic">
              {editingId ? t.backend.fields.editCustomer : t.backend.fields.newCustomer}
            </h3>
            <p className="text-neutral-500 font-medium">Define customer details and operational status.</p>
          </div>
        </div>

        <form onSubmit={onAddCustomer} className="max-w-2xl bg-neutral-50 dark:bg-neutral-800/50 p-8 rounded-[2rem] border border-neutral-200 dark:border-neutral-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-4">{t.backend.fields.fullName}</label>
              <input
                required
                type="text"
                placeholder="e.g. John Doe"
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                value={customerForm.name}
                onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-4">{t.backend.fields.emailAddress}</label>
              <input
                type="email"
                placeholder="john@example.com"
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                value={customerForm.email}
                onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-4">{t.backend.fields.phoneNumber}</label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                value={customerForm.phone}
                onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-4">{t.backend.fields.company}</label>
              <input
                type="text"
                placeholder="Company Name"
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                value={customerForm.company}
                onChange={(e) => setCustomerForm({ ...customerForm, company: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-4">{t.backend.fields.lifecycle}</label>
              <select
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none"
                value={customerForm.status}
                onChange={(e) => setCustomerForm({ ...customerForm, status: e.target.value })}
              >
                <option value="Lead">Lead</option>
                <option value="Opportunity">Opportunity</option>
                <option value="Customer">Customer</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              disabled={saving}
              className="bg-blue-600 text-white px-10 py-4 rounded-2xl text-sm font-black hover:bg-blue-700 transition-all flex items-center gap-2 shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50"
            >
              {saving ? <Clock className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              {editingId ? t.backend.common.update : t.backend.fields.register} {t.backend.fields.customer}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-neutral-100 dark:border-neutral-800">
            <th className="px-8 py-5 text-left w-10">
              <button onClick={toggleSelectAll} className="w-5 h-5 rounded-md border-2 border-neutral-200 dark:border-neutral-700 flex items-center justify-center transition-colors hover:border-blue-500">
                {selectedIds.length > 0 && selectedIds.length === filtered.length && <div className="w-2.5 h-2.5 bg-blue-600 rounded-sm" />}
                {selectedIds.length > 0 && selectedIds.length < filtered.length && <div className="w-2.5 h-0.5 bg-blue-600 rounded-sm" />}
              </button>
            </th>
            <th className="px-6 py-5 text-left text-[10px] font-black text-neutral-400 uppercase tracking-widest">{t.backend.fields.identify}</th>
            <th className="px-6 py-5 text-left text-[10px] font-black text-neutral-400 uppercase tracking-widest">{t.backend.fields.connect}</th>
            <th className="px-6 py-5 text-left text-[10px] font-black text-neutral-400 uppercase tracking-widest">{t.backend.fields.status}</th>
            <th className="px-6 py-5 text-left text-[10px] font-black text-neutral-400 uppercase tracking-widest">{t.backend.fields.timeline}</th>
            <th className="px-8 py-5 text-right text-[10px] font-black text-neutral-400 uppercase tracking-widest">{t.backend.common.actions}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800/50">
          {filtered.map((customer) => (
            <tr key={customer.id} className="group hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
              <td className="px-8 py-4">
                <button 
                  onClick={() => toggleSelect(customer.id)}
                  className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${selectedIds.includes(customer.id) ? 'bg-blue-600 border-blue-600' : 'border-neutral-200 dark:border-neutral-700 group-hover:border-neutral-400'}`}
                >
                  {selectedIds.includes(customer.id) && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                </button>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-neutral-500" />
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900 dark:text-white leading-tight">{customer.name}</p>
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">{customer.company || 'Private Party'}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="space-y-1">
                  {customer.email && (
                    <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
                      <Mail className="w-3 h-3" />
                      {customer.email}
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
                      <Phone className="w-3 h-3" />
                      {customer.phone}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${getStatusColor(customer.status)}`}>
                  {getStatusIcon(customer.status)}
                  {customer.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(customer.created_at).toLocaleDateString()}
                </div>
              </td>
              <td className="px-8 py-4 text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {canManage && (
                    <>
                      <button 
                        onClick={() => onEditCustomer(customer)}
                        className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                        title="Edit Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDeleteCustomer('customers', customer.id)}
                        className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        title="Remove Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filtered.length === 0 && (
        <div className="py-20 text-center">
          <div className="w-16 h-16 bg-neutral-50 dark:bg-neutral-800 rounded-3xl flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-neutral-200 dark:border-neutral-700">
            <Search className="w-6 h-6 text-neutral-300" />
          </div>
          <h3 className="text-xl font-black text-neutral-900 dark:text-white uppercase italic">{t.backend.common.noMatch}</h3>
          <p className="text-neutral-500 font-medium">Try broadening your search criteria or register a new customer.</p>
        </div>
      )}
    </div>
  );
}
