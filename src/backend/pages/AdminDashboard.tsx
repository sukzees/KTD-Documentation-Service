import { LucideIcon, ThemeToggle, UserProfile, Highlight, LanguageSwitcher } from '../../frontend/components';
import React, { useState, useEffect, useMemo, useContext } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Menu, X, Building2, UserCheck, Loader2, RefreshCw, Trash2, Database,
  Sparkles, Shield, LayoutDashboard, LogOut, Mail, User, Users, Search, HelpCircle, FileText, ChevronDown, TrendingUp, Settings, Palette, Columns, Layout, Monitor, Megaphone
} from "lucide-react";
import { TRANSLATIONS } from "../../translations";
import { LanguageContext } from "../../contexts/AppContext";
import { supabase } from "../../supabase";
import { ALL_PERMISSIONS } from "../../constants";
import { FAQTab } from "../tabs/FAQTab";
import { LeadsTab } from "../tabs/LeadsTab";
import { ClientsTab } from "../tabs/ClientsTab";
import { CustomersTab } from "../tabs/CustomersTab";
import { PipelineTab } from "../tabs/PipelineTab";
import { TestimonialsTab } from "../tabs/TestimonialsTab";
import { UsersTab } from "../tabs/UsersTab";
import { DocumentsTab } from "../tabs/DocumentsTab";
import { CampaignsTab } from "../tabs/CampaignsTab";

export function AdminDashboard({ user, onLogout }: { user: any, onLogout: () => void }) {
  const context = useContext(LanguageContext);
  const t = context?.t || TRANSLATIONS.en;
  const [activeTab, setActiveTab] = useState<'leads' | 'clients' | 'customers' | 'pipeline' | 'faq' | 'testimonials' | 'users' | 'profile' | 'documents' | 'crm' | 'appearance' | 'campaigns'>('leads');
  const [menuStyle, setMenuStyle] = useState<'vertical' | 'horizontal'>(() => {
    const saved = localStorage.getItem('ktd_nav_style');
    return (saved === 'vertical' || saved === 'horizontal') ? saved : 'vertical';
  });
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [leads, setLeads] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [docCategories, setDocCategories] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for adding new items
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    is_active: false,
    lang: 'all',
    hero_promo: '',
    hero_title1: '',
    hero_title2: '',
    hero_subtitle: '',
    hero_cta_call: '',
    hero_cta_services: '',
    hero_trust_title: '',
    hero_trust_subtitle: '',
    footer_quote: '',
    footer_discount: ''
  });
  const [clientForm, setClientForm] = useState({ name: '', icon_name: 'Building2', logo_url: '' });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [customerForm, setCustomerForm] = useState({ name: '', email: '', phone: '', company: '', status: 'Lead' });
  const [dealForm, setDealForm] = useState({ title: '', value: 0, customer_id: '', stage: 'Qualified', expected_close_date: '' });
  const [faqForm, setFaqForm] = useState({ q: '', a: '' });
  const [testimonialForm, setTestimonialForm] = useState({ name: '', role: '', text: '', photo_url: '' });
  const [testimonialFile, setTestimonialFile] = useState<File | null>(null);
  const [userForm, setUserForm] = useState({ username: '', password: '', role: 'staff', display_name: '' });
  const [roleForm, setRoleForm] = useState<{name: string, permissions: string[]}>({ name: '', permissions: [] });
  const [documentForm, setDocumentForm] = useState({ title: '', category: 'Internal', file_url: '', status: 'draft', customer_id: '' });
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [docCategoryForm, setDocCategoryForm] = useState({ name: '', description: '' });

  const [saving, setSaving] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, message: string, onConfirm: () => void} | null>(null);
  const [alertDialog, setAlertDialog] = useState<{isOpen: boolean, message: string} | null>(null);

  const isAdmin = user?.role === 'admin';
  const canManageCurrentTab = isAdmin || ['documents', 'leads', 'faq', 'clients', 'customers', 'pipeline', 'testimonials', 'users', 'campaigns'].includes(activeTab);

  useEffect(() => {
    fetchData();
    setSelectedIds([]); // Reset selection when tab changes
    setIsAdding(false);
    setEditingId(null);
  }, [activeTab]);

  useEffect(() => {
    fetchData();
    const leadsSub = supabase.channel('leads-all').on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, fetchData).subscribe();
    const clientsSub = supabase.channel('clients-all').on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, fetchData).subscribe();
    const customersSub = supabase.channel('customers-all').on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, fetchData).subscribe();
    const dealsSub = supabase.channel('deals-all').on('postgres_changes', { event: '*', schema: 'public', table: 'deals' }, fetchData).subscribe();
    const faqSub = supabase.channel('faqs-all').on('postgres_changes', { event: '*', schema: 'public', table: 'faqs' }, fetchData).subscribe();
    const testimonialsSub = supabase.channel('testimonials-all').on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, fetchData).subscribe();
    const usersSub = supabase.channel('users-all').on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, fetchData).subscribe();
    const docsSub = supabase.channel('documents-all').on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, fetchData).subscribe();
    const docCatsSub = supabase.channel('document_categories-all').on('postgres_changes', { event: '*', schema: 'public', table: 'document_categories' }, fetchData).subscribe();
    const rolesSub = supabase.channel('roles-all').on('postgres_changes', { event: '*', schema: 'public', table: 'roles' }, fetchData).subscribe();
    const campaignsSub = supabase.channel('campaigns-all').on('postgres_changes', { event: '*', schema: 'public', table: 'campaigns' }, fetchData).subscribe();

    return () => {
      supabase.removeChannel(leadsSub);
      supabase.removeChannel(clientsSub);
      supabase.removeChannel(customersSub);
      supabase.removeChannel(dealsSub);
      supabase.removeChannel(faqSub);
      supabase.removeChannel(testimonialsSub);
      supabase.removeChannel(usersSub);
      supabase.removeChannel(docsSub);
      supabase.removeChannel(docCatsSub);
      supabase.removeChannel(rolesSub);
      supabase.removeChannel(campaignsSub);
    };
  }, []);

  const pipelineStats = useMemo(() => {
    const totalValue = deals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
    const wonValue = deals.filter(d => d.stage === 'Closed Won').reduce((sum, d) => sum + (Number(d.value) || 0), 0);
    const lostValue = deals.filter(d => d.stage === 'Closed Lost').reduce((sum, d) => sum + (Number(d.value) || 0), 0);
    return { totalValue, wonValue, lostValue, count: deals.length };
  }, [deals]);

  const fetchData = async () => {
    setLoading(true);
    const [leadsRes, clientsRes, customersRes, dealsRes, faqsRes, testimonialsRes, usersRes, docsRes, docCatsRes, rolesRes, campaignsRes] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('clients').select('*').order('id', { ascending: true }),
      supabase.from('customers').select('*').order('created_at', { ascending: false }),
      Promise.resolve(supabase.from('deals').select('*').order('created_at', { ascending: false })).catch(() => ({ data: null })),
      supabase.from('faqs').select('*').order('id', { ascending: true }),
      supabase.from('testimonials').select('*').order('id', { ascending: true }),
      supabase.from('users').select('*').order('id', { ascending: true }),
      Promise.resolve(supabase.from('documents').select('*').order('created_at', { ascending: false })).catch(() => ({ data: null })),
      Promise.resolve(supabase.from('document_categories').select('*').order('id', { ascending: true })).catch(() => ({ data: null })),
      Promise.resolve(supabase.from('roles').select('*').order('id', { ascending: true })).catch(() => ({ data: null })),
      Promise.resolve(supabase.from('campaigns').select('*').order('created_at', { ascending: false })).catch(() => ({ data: null }))
    ]);

    if (leadsRes.data) setLeads(leadsRes.data);
    if (clientsRes.data) setClients(clientsRes.data);
    if (customersRes.data) setCustomers(customersRes.data);
    if (dealsRes?.data) setDeals(dealsRes.data);
    if (faqsRes.data) setFaqs(faqsRes.data);
    if (testimonialsRes.data) setTestimonials(testimonialsRes.data);
    if (usersRes.data) setUsers(usersRes.data);
    if (docsRes?.data) setDocuments(docsRes.data);
    if (docCatsRes?.data) setDocCategories(docCatsRes.data);
    if (campaignsRes?.data) setCampaigns(campaignsRes.data);
    if (rolesRes?.data) {
      setRoles(rolesRes.data.map((r: any) => ({
        ...r,
        permissions: typeof r.permissions === 'string' ? r.permissions.split(',') : (Array.isArray(r.permissions) ? r.permissions : [])
      })));
    }
    setLoading(false);
  };

  const getTableName = (tab: string) => {
    const mapping: { [key: string]: string } = {
      'faq': 'faqs'
    };
    return mapping[tab] || tab;
  };

  const handleDelete = async (table: string, id: string) => {
    const realTable = getTableName(table);
    
    setConfirmDialog({
      isOpen: true,
      message: `Are you sure you want to delete this?`,
      onConfirm: async () => {
        setSaving(true);
        try {
          if (realTable === 'documents') {
            const { data: doc } = await supabase.from('documents').select('file_url').eq('id', id).single();
            if (doc?.file_url) {
              const fileName = doc.file_url.split('/').pop();
              if (fileName) await supabase.storage.from('customer-docs').remove([fileName]);
            }
          } else if (realTable === 'clients' || realTable === 'testimonials') {
            const field = realTable === 'clients' ? 'logo_url' : 'photo_url';
            const { data } = await supabase.from(realTable).select(field).eq('id', id).single();
            const url = (data as any)?.[field];
            if (url) {
              const fileName = url.split('/').pop();
              if (fileName) await supabase.storage.from('logos').remove([fileName]);
            }
          }

          const { error } = await supabase.from(realTable).delete().eq('id', id);
          if (error) {
            // Check if table exists
            if (error.code === '42P01') {
              setAlertDialog({ isOpen: true, message: `The table '${realTable}' does not exist yet. Please create it in Supabase SQL editor.` });
            } else {
              setAlertDialog({ isOpen: true, message: "Error deleting: " + error.message });
            }
          } else await fetchData();
        } catch (err) {
          setAlertDialog({ isOpen: true, message: "An unexpected error occurred during delete." });
        } finally {
          setSaving(false);
          setConfirmDialog(null);
        }
      }
    });
  };

  const handleSaveAppearance = () => {
    setSaving(true);
    localStorage.setItem('ktd_nav_style', menuStyle);
    setTimeout(() => {
      setSaving(false);
      setAlertDialog({
        isOpen: true,
        message: 'Appearance settings saved successfully!'
      });
    }, 500);
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalLogoUrl = clientForm.logo_url;
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;
        const { error: uploadError } = await supabase.storage.from('logos').upload(filePath, logoFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(filePath);
        finalLogoUrl = publicUrl;
      }

      const payload = { name: clientForm.name, icon_name: clientForm.icon_name, logo_url: finalLogoUrl };
      const { error } = editingId 
        ? await supabase.from('clients').update(payload).eq('id', editingId)
        : await supabase.from('clients').insert([payload]);

      if (error) throw error;
      setClientForm({ name: '', icon_name: 'Building2', logo_url: '' });
      setLogoFile(null);
      setIsAdding(false);
      setEditingId(null);
      await fetchData();
    } catch (err: any) {
      setAlertDialog({ isOpen: true, message: "Error saving client: " + (err.message || String(err)) });
    } finally {
      setSaving(false);
    }
  };

  const handleEditClient = (client: any) => {
    setClientForm({ name: client.name, icon_name: client.icon_name || 'Building2', logo_url: client.logo_url || '' });
    setEditingId(client.id);
    setIsAdding(true);
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = editingId 
        ? await supabase.from('customers').update(customerForm).eq('id', editingId)
        : await supabase.from('customers').insert([customerForm]);
      if (error) {
        if (error.code === '42P01') throw new Error("Table 'customers' does not exist. Please run the SQL migration.");
        throw error;
      }
      setCustomerForm({ name: '', email: '', phone: '', company: '', status: 'Lead' });
      setIsAdding(false);
      setEditingId(null);
      await fetchData();
    } catch (err: any) {
      setAlertDialog({ isOpen: true, message: "Error saving customer: " + err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleEditCustomer = (c: any) => {
    setCustomerForm({ name: c.name, email: c.email || '', phone: c.phone || '', company: c.company || '', status: c.status || 'Lead' });
    setEditingId(c.id);
    setIsAdding(true);
  };

  const handleAddDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = editingId 
        ? await supabase.from('deals').update(dealForm).eq('id', editingId)
        : await supabase.from('deals').insert([dealForm]);
      if (error) {
        if (error.code === '42P01') throw new Error("Table 'deals' does not exist. Please run the SQL migration.");
        throw error;
      }
      setDealForm({ title: '', value: 0, customer_id: '', stage: 'Qualified', expected_close_date: '' });
      setIsAdding(false);
      setEditingId(null);
      await fetchData();
    } catch (err: any) {
      setAlertDialog({ isOpen: true, message: "Error saving deal: " + err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleEditDeal = (d: any) => {
    setDealForm({ 
      title: d.title, 
      value: Number(d.value) || 0, 
      customer_id: d.customer_id, 
      stage: d.stage || 'Qualified', 
      expected_close_date: d.expected_close_date || '' 
    });
    setEditingId(d.id);
    setIsAdding(true);
  };

  const handleUpdateDealStage = async (dealId: string, newStage: string) => {
    setSaving(true);
    try {
      const { error } = await supabase.from('deals').update({ stage: newStage }).eq('id', dealId);
      if (error) throw error;
      await fetchData();
    } catch (err: any) {
      setAlertDialog({ isOpen: true, message: "Error updating deal stage: " + err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleAddFAQ = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = editingId 
        ? await supabase.from('faqs').update(faqForm).eq('id', editingId)
        : await supabase.from('faqs').insert([faqForm]);
      if (error) throw error;
      setFaqForm({ q: '', a: '' });
      setIsAdding(false);
      setEditingId(null);
      await fetchData();
    } catch (err: any) {
      setAlertDialog({ isOpen: true, message: "Error saving FAQ: " + err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleEditFAQ = (faq: any) => {
    setFaqForm({ q: faq.q, a: faq.a });
    setEditingId(faq.id);
    setIsAdding(true);
  };

  const handleAddTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalPictureUrl = testimonialForm.photo_url;
      if (testimonialFile) {
        const fileExt = testimonialFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `testimonials/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('logos').upload(filePath, testimonialFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(filePath);
        finalPictureUrl = publicUrl;
      }

      const payload = { ...testimonialForm, photo_url: finalPictureUrl };
      const { error } = editingId 
        ? await supabase.from('testimonials').update(payload).eq('id', editingId)
        : await supabase.from('testimonials').insert([payload]);

      if (error) throw error;
      setTestimonialForm({ name: '', role: '', text: '', photo_url: '' });
      setTestimonialFile(null);
      setIsAdding(false);
      setEditingId(null);
      await fetchData();
    } catch (err: any) {
      setAlertDialog({ isOpen: true, message: "Error saving testimonial: " + err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleEditTestimonial = (t: any) => {
    setTestimonialForm({ name: t.name, role: t.role || '', text: t.text, photo_url: t.photo_url || '' });
    setEditingId(t.id);
    setIsAdding(true);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = { ...userForm };
      if (editingId && !payload.password) delete payload.password;
      
      const { error } = editingId 
        ? await supabase.from('users').update(payload).eq('id', editingId)
        : await supabase.from('users').insert([payload]);

      if (error) throw error;
      setUserForm({ username: '', password: '', role: 'staff', display_name: '' });
      setIsAdding(false);
      setEditingId(null);
      await fetchData();
    } catch (err: any) {
      setAlertDialog({ isOpen: true, message: "Error saving user: " + err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleEditUser = (u: any) => {
    setUserForm({ username: u.username, password: '', role: u.role, display_name: u.display_name });
    setEditingId(u.id);
    setIsAdding(true);
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalFileUrl = documentForm.file_url;
      if (documentFile) {
        const fileExt = documentFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('customer-docs').upload(fileName, documentFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('customer-docs').getPublicUrl(fileName);
        finalFileUrl = publicUrl;
      }

      const payload = { ...documentForm, file_url: finalFileUrl };
      const { error } = editingId 
        ? await supabase.from('documents').update(payload).eq('id', editingId)
        : await supabase.from('documents').insert([payload]);

      if (error) throw error;
      setDocumentForm({ title: '', category: 'Internal', file_url: '', status: 'draft', customer_id: '' });
      setDocumentFile(null);
      setIsAdding(false);
      setEditingId(null);
      await fetchData();
    } catch (err: any) {
      setAlertDialog({ isOpen: true, message: "Error saving document: " + err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleEditDocument = (doc: any) => {
    setDocumentForm({ 
      title: doc.title, 
      category: doc.category || 'Internal', 
      file_url: doc.file_url || '', 
      status: doc.status || 'draft',
      customer_id: doc.customer_id || ''
    });
    setEditingId(doc.id);
    setIsAdding(true);
  };

  const handleAddDocCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = editingId 
        ? await supabase.from('document_categories').update(docCategoryForm).eq('id', editingId)
        : await supabase.from('document_categories').insert([docCategoryForm]);
      if (error) throw error;
      setDocCategoryForm({ name: '', description: '' });
      setIsAdding(false);
      setEditingId(null);
      await fetchData();
    } catch (err: any) {
      setAlertDialog({ isOpen: true, message: "Error saving category: " + err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleEditDocCategory = (cat: any) => {
    setDocCategoryForm({ name: cat.name, description: cat.description || '' });
    setEditingId(cat.id);
    setIsAdding(true);
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (campaignForm.is_active) {
        // Deactivate other active campaigns of the same language target
        await supabase.from('campaigns').update({ is_active: false }).eq('lang', campaignForm.lang);
      }
      const payload = {
        name: campaignForm.name,
        is_active: campaignForm.is_active,
        lang: campaignForm.lang,
        hero_promo: campaignForm.hero_promo,
        hero_title1: campaignForm.hero_title1,
        hero_title2: campaignForm.hero_title2,
        hero_subtitle: campaignForm.hero_subtitle,
        hero_cta_call: campaignForm.hero_cta_call,
        hero_cta_services: campaignForm.hero_cta_services,
        hero_trust_title: campaignForm.hero_trust_title,
        hero_trust_subtitle: campaignForm.hero_trust_subtitle,
        footer_quote: campaignForm.footer_quote,
        footer_discount: campaignForm.footer_discount
      };
      const { error } = editingId 
        ? await supabase.from('campaigns').update(payload).eq('id', editingId)
        : await supabase.from('campaigns').insert([payload]);
      if (error) throw error;
      setCampaignForm({
        name: '',
        is_active: false,
        lang: 'all',
        hero_promo: '',
        hero_title1: '',
        hero_title2: '',
        hero_subtitle: '',
        hero_cta_call: '',
        hero_cta_services: '',
        hero_trust_title: '',
        hero_trust_subtitle: '',
        footer_quote: '',
        footer_discount: ''
      });
      setIsAdding(false);
      setEditingId(null);
      await fetchData();
    } catch (err: any) {
      setAlertDialog({ isOpen: true, message: "Error saving campaign: " + err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleEditCampaign = (c: any) => {
    setCampaignForm({
      name: c.name,
      is_active: c.is_active || false,
      lang: c.lang || 'all',
      hero_promo: c.hero_promo || '',
      hero_title1: c.hero_title1 || '',
      hero_title2: c.hero_title2 || '',
      hero_subtitle: c.hero_subtitle || '',
      hero_cta_call: c.hero_cta_call || '',
      hero_cta_services: c.hero_cta_services || '',
      hero_trust_title: c.hero_trust_title || '',
      hero_trust_subtitle: c.hero_trust_subtitle || '',
      footer_quote: c.footer_quote || '',
      footer_discount: c.footer_discount || ''
    });
    setEditingId(c.id);
    setIsAdding(true);
  };

  const handleToggleCampaignActive = async (id: string, currentStatus: boolean, lang: string) => {
    setSaving(true);
    try {
      const nextStatus = !currentStatus;
      if (nextStatus) {
        await supabase.from('campaigns').update({ is_active: false }).eq('lang', lang);
      }
      const { error } = await supabase.from('campaigns').update({ is_active: nextStatus }).eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (err: any) {
      setAlertDialog({ isOpen: true, message: "Error toggling status: " + err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...roleForm, permissions: roleForm.permissions.join(',') };
      const { error } = editingId 
        ? await supabase.from('roles').update(payload).eq('id', editingId)
        : await supabase.from('roles').insert([payload]);
      if (error) throw error;
      setRoleForm({ name: '', permissions: [] });
      setIsAdding(false);
      setEditingId(null);
      await fetchData();
    } catch (err: any) {
      setAlertDialog({ isOpen: true, message: "Failed to save role: " + err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleEditRole = (role: any) => {
    const perms = Array.isArray(role.permissions) 
      ? role.permissions 
      : (typeof role.permissions === 'string' ? role.permissions.split(',') : []);
    setRoleForm({ name: role.name, permissions: perms });
    setEditingId(role.id);
    setIsAdding(true);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const realTable = getTableName(activeTab);
    setConfirmDialog({
      isOpen: true,
      message: `Are you sure you want to delete ${selectedIds.length} selected items?`,
      onConfirm: async () => {
        setSaving(true);
        try {
          const { error } = await supabase.from(realTable).delete().in('id', selectedIds);
          if (error) throw error;
          setSelectedIds([]);
          await fetchData();
        } catch (err: any) {
          setAlertDialog({ isOpen: true, message: "Bulk delete failed: " + err.message });
        } finally {
          setSaving(false);
          setConfirmDialog(null);
        }
      }
    });
  };

  const toggleSelectAll = () => {
    const currentData = activeTab === 'leads' ? leads :
                       activeTab === 'clients' ? clients :
                       activeTab === 'customers' ? customers :
                       activeTab === 'pipeline' ? deals :
                       activeTab === 'faq' ? faqs :
                       activeTab === 'testimonials' ? testimonials :
                       activeTab === 'documents' ? documents :
                       activeTab === 'doc_categories' ? docCategories :
                       activeTab === 'campaigns' ? campaigns :
                       users;
    
    const filtered = currentData.filter(item => {
        const str = JSON.stringify(item).toLowerCase();
        return str.includes(searchQuery.toLowerCase());
    });

    if (selectedIds.length === filtered.length && filtered.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(item => item.id.toString()));
    }
  };

  const toggleSelect = (id: string) => {
    const idStr = id.toString();
    setSelectedIds(prev => prev.includes(idStr) ? prev.filter(i => i !== idStr) : [...prev, idStr]);
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 font-sans transition-colors duration-300">
      {confirmDialog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-neutral-200 dark:border-neutral-800">
            <h3 className="text-xl font-bold mb-4 dark:text-white">{t.backend.common.confirmTitle}</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-8">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDialog(null)} className="px-5 py-2.5 rounded-full text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-medium">{t.backend.common.cancel}</button>
              <button onClick={confirmDialog.onConfirm} className="px-5 py-2.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors font-medium">{t.backend.common.delete}</button>
            </div>
          </div>
        </div>
      )}

      {alertDialog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-neutral-200 dark:border-neutral-800">
            <h3 className="text-xl font-bold mb-4 dark:text-white">{t.backend.common.notice}</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-8">{alertDialog.message}</p>
            <div className="flex justify-end">
              <button onClick={() => setAlertDialog(null)} className="px-5 py-2.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors font-medium">{t.backend.common.close}</button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedIds.length > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xl px-4">
             <div className="bg-neutral-900 dark:bg-neutral-800 text-white p-4 rounded-[2rem] shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-xl">
               <div className="flex items-center gap-4 ml-4">
                 <div className="bg-blue-600 px-3 py-1 rounded-full text-xs font-black">{selectedIds.length}</div>
                 <p className="text-sm font-bold text-neutral-300 tracking-tight uppercase">{t.backend.common.selected}</p>
               </div>
               <div className="flex gap-2">
                 <button onClick={() => setSelectedIds([])} className="bg-neutral-800 dark:bg-neutral-700 hover:bg-neutral-700 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all">{t.backend.common.deselect}</button>
                 <button onClick={handleBulkDelete} disabled={saving} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50">
                   {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                   {t.backend.common.bulkDelete}
                 </button>
               </div>
             </div>
          </div>
        )}
      </AnimatePresence>

      <nav className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-neutral-900 dark:text-white font-display">KTD Admin</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-blue-600 transition-colors" />
            <input type="text" placeholder={t.backend.search} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 pl-12 pr-4 py-2.5 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all text-neutral-900 dark:text-white" />
          </div>
          <LanguageSwitcher />
          <ThemeToggle />
          <button onClick={() => fetchData()} disabled={loading} className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl hover:text-blue-600 transition-all">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={onLogout} className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-neutral-600 hover:text-red-600 transition-all">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <div className={`w-full flex flex-col ${menuStyle === 'vertical' ? 'md:flex-row' : 'flex-col'} gap-8 p-6 md:p-8`}>
        {menuStyle === 'horizontal' ? (
          <nav className="flex flex-wrap items-center gap-2 bg-white dark:bg-neutral-900 p-2 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm transition-all z-20">
            {[
              { 
                id: 'crm', 
                icon: Database, 
                label: t.backend.crm,
                subItems: [
                  { id: 'leads', icon: Mail, label: t.backend.leads },
                  { id: 'customers', icon: Building2, label: t.backend.customers },
                  { id: 'pipeline', icon: TrendingUp, label: t.backend.pipeline },
                  { id: 'documents', icon: FileText, label: t.backend.documents },
                ]
              },
              { id: 'clients', icon: Building2, label: t.backend.clients },
              { id: 'faq', icon: HelpCircle, label: t.backend.faq },
              { id: 'testimonials', icon: UserCheck, label: t.backend.testimonials },
              { id: 'campaigns', icon: Megaphone, label: t.backend.campaigns },
              { id: 'users', icon: Users, label: t.backend.users, adminOnly: true },
              { 
                id: 'settings', 
                icon: Settings, 
                label: t.backend.settings,
                subItems: [
                  { id: 'profile', icon: User, label: t.backend.profile },
                  { id: 'appearance', icon: Palette, label: t.backend.appearance }
                ]
              }
            ].filter(t => !t.adminOnly || isAdmin).map(item => {
              const isActive = activeTab === item.id || item.subItems?.some(s => s.id === activeTab);
              const isOpen = openDropdown === item.id;

              return (
                <div 
                  key={item.id} 
                  className="relative group"
                  onMouseEnter={() => setOpenDropdown(item.id)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    onClick={() => {
                      if (item.subItems) {
                        setOpenDropdown(isOpen ? null : item.id);
                      } else {
                        setActiveTab(item.id as any);
                      }
                    }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                        : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                    {item.subItems && <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : 'opacity-60'}`} />}
                  </button>
                  
                  {item.subItems && (
                    <div className={`absolute top-full ${item.id === 'settings' ? 'right-0' : 'left-0'} mt-2 w-48 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-xl transition-all z-50 p-2 space-y-1 ${
                      isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                    }`}>
                      {item.subItems.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => {
                            setActiveTab(sub.id as any);
                            setOpenDropdown(null);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                            activeTab === sub.id 
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                              : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                          }`}
                        >
                          <sub.icon className="w-3.5 h-3.5" />
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        ) : (
          <aside className="w-full md:w-64 space-y-2">
            {[
              { 
                id: 'crm', 
                icon: Database, 
                label: t.backend.crm,
                subItems: [
                  { id: 'leads', icon: Mail, label: t.backend.leads, count: leads.length },
                  { id: 'customers', icon: Building2, label: t.backend.customers, count: customers.length },
                  { id: 'pipeline', icon: TrendingUp, label: t.backend.pipeline, count: deals.length },
                  { id: 'documents', icon: FileText, label: t.backend.documents, count: documents.length },
                ]
              },
              { id: 'clients', icon: Building2, label: t.backend.clients, count: clients.length },
              { id: 'faq', icon: HelpCircle, label: t.backend.faq, count: faqs.length },
              { id: 'testimonials', icon: UserCheck, label: t.backend.testimonials, count: testimonials.length },
              { id: 'campaigns', icon: Megaphone, label: t.backend.campaigns, count: campaigns.length },
              { id: 'users', icon: Users, label: t.backend.users, count: users.length, adminOnly: true },
              { 
                id: 'settings', 
                icon: Settings, 
                label: t.backend.settings,
                subItems: [
                  { id: 'profile', icon: User, label: t.backend.profile },
                  { id: 'appearance', icon: Palette, label: t.backend.appearance }
                ]
              }
            ].filter(t => !t.adminOnly || isAdmin).map(item => {
              const isSubItemActive = item.subItems?.some(sub => sub.id === activeTab);
              const isActive = activeTab === item.id || isSubItemActive;
              
              return (
                <div key={item.id} className="space-y-1">
                  <button 
                    onClick={() => {
                      setActiveTab(item.id as any);
                    }}
                    className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xl shadow-blue-200/50' 
                        : 'bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                    {item.count !== undefined && <span className="ml-auto bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-full text-[10px]">{item.count}</span>}
                    {item.subItems && (
                      <span className="ml-auto opacity-40">
                        <ChevronDown className={`w-4 h-4 transition-transform ${isSubItemActive || activeTab === item.id ? 'rotate-180' : ''}`} />
                      </span>
                    )}
                  </button>
                  
                  {item.subItems && (isSubItemActive || activeTab === item.id) && (
                    <div className="ml-4 pl-4 border-l-2 border-neutral-200 dark:border-neutral-800 space-y-1 py-1">
                      {item.subItems.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => setActiveTab(sub.id as any)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                            activeTab === sub.id 
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                              : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                          }`}
                        >
                          <sub.icon className="w-4 h-4" />
                          {sub.label}
                          {sub.count !== undefined && <span className="ml-auto bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full text-[10px]">{sub.count}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </aside>
        )}

        <main className="flex-1">
          {activeTab === 'profile' ? (
            <UserProfile user={user} />
          ) : activeTab === 'appearance' ? (
            <div className="space-y-8">
              <div className="bg-white dark:bg-neutral-900 p-8 rounded-[2.5rem] border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-2xl">
                    <Palette className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white">{t.backend.appearance}</h3>
                    <p className="text-sm text-neutral-500">{t.backend.navStyle}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-sm font-black text-neutral-400 uppercase tracking-widest">{t.backend.navStyle}</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setMenuStyle('vertical')}
                        className={`p-6 rounded-3xl border-2 transition-all text-left flex flex-col gap-4 ${
                          menuStyle === 'vertical' 
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                            : 'border-neutral-100 dark:border-neutral-800 hover:border-blue-200 dark:hover:border-blue-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Columns className={`w-6 h-6 ${menuStyle === 'vertical' ? 'text-blue-600' : 'text-neutral-400'}`} />
                          {menuStyle === 'vertical' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900 dark:text-white">{t.backend.vertical}</p>
                          <p className="text-xs text-neutral-500 mt-1">Traditional layout with fixed left navigation</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setMenuStyle('horizontal')}
                        className={`p-6 rounded-3xl border-2 transition-all text-left flex flex-col gap-4 ${
                          menuStyle === 'horizontal' 
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                            : 'border-neutral-100 dark:border-neutral-800 hover:border-blue-200 dark:hover:border-blue-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Layout className={`w-6 h-6 ${menuStyle === 'horizontal' ? 'text-blue-600' : 'text-neutral-400'}`} />
                          {menuStyle === 'horizontal' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900 dark:text-white">{t.backend.horizontal}</p>
                          <p className="text-xs text-neutral-500 mt-1">Modern top-down navigation for wider workspace</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-black text-neutral-400 uppercase tracking-widest">{t.backend.theme}</label>
                    <div className="bg-neutral-50 dark:bg-neutral-800/50 p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Monitor className="w-5 h-5 text-neutral-500" />
                          <div>
                            <p className="font-bold text-neutral-900 dark:text-white">{t.backend.system}</p>
                            <p className="text-xs text-neutral-500">Theme follows your OS settings</p>
                          </div>
                        </div>
                        <ThemeToggle />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
                  <button
                    onClick={handleSaveAppearance}
                    disabled={saving}
                    className="bg-indigo-600 text-white px-10 py-4 rounded-2xl text-sm font-black hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
                    {t.backend.common.save}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className={`grid grid-cols-1 ${activeTab === 'pipeline' ? 'lg:grid-cols-4' : 'md:grid-cols-3'} gap-6`}>
                {activeTab === 'pipeline' ? (
                  <>
                    <div className="bg-white dark:bg-neutral-900 p-6 rounded-[2rem] border border-neutral-200 dark:border-neutral-800 shadow-sm border-l-4 border-l-blue-500">
                      <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mb-1">Pipeline Volume</p>
                      <p className="text-2xl font-black text-neutral-900 dark:text-white uppercase italic">
                        <span className="text-blue-600 mr-1">$</span>
                        {pipelineStats.totalValue.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 p-6 rounded-[2rem] border border-neutral-200 dark:border-neutral-800 shadow-sm border-l-4 border-l-green-500">
                      <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mb-1">Closed Won Total</p>
                      <p className="text-2xl font-black text-neutral-900 dark:text-white uppercase italic">
                        <span className="text-green-600 mr-1">$</span>
                        {pipelineStats.wonValue.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 p-6 rounded-[2rem] border border-neutral-200 dark:border-neutral-800 shadow-sm border-l-4 border-l-red-500">
                      <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mb-1">Closed Lost Total</p>
                      <p className="text-2xl font-black text-neutral-900 dark:text-white uppercase italic">
                        <span className="text-red-600 mr-1">$</span>
                        {pipelineStats.lostValue.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 p-6 rounded-[2rem] border border-neutral-200 dark:border-neutral-800 shadow-sm">
                      <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Opportunities</p>
                      <p className="text-2xl font-black text-neutral-900 dark:text-white uppercase italic">{pipelineStats.count}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-white dark:bg-neutral-900 p-6 rounded-[2rem] border border-neutral-200 dark:border-neutral-800 shadow-sm">
                      <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mb-1">Scope</p>
                      <p className="text-2xl font-black text-blue-600 uppercase italic">{activeTab}</p>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 p-6 rounded-[2rem] border border-neutral-200 dark:border-neutral-800 shadow-sm">
                      <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Items</p>
                      <p className="text-2xl font-black text-neutral-900 dark:text-white uppercase italic">
                        {activeTab === 'leads' ? leads.length :
                         activeTab === 'clients' ? clients.length :
                         activeTab === 'customers' ? customers.length :
                         activeTab === 'pipeline' ? deals.length :
                         activeTab === 'faq' ? faqs.length :
                         activeTab === 'testimonials' ? testimonials.length :
                         activeTab === 'crm' ? leads.length + customers.length + deals.length :
                         activeTab === 'documents' ? documents.length :
                         activeTab === 'campaigns' ? campaigns.length :
                         activeTab === 'users' ? users.length : 0}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 p-6 rounded-[2rem] border border-neutral-200 dark:border-neutral-800 shadow-sm">
                      <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mb-1">Status</p>
                      <p className="text-lg font-bold text-green-600 flex items-center gap-1"><Shield className="w-4 h-4" /> LIVE</p>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/50 flex justify-between items-center transition-colors">
                  <h2 className="font-bold text-xs text-neutral-400 uppercase tracking-widest">
                    {activeTab === 'faq' ? 'FAQ' : 
                     activeTab === 'crm' ? 'CRM Gateway' : 
                     activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management
                  </h2>
                  {canManageCurrentTab && (
                    <button 
                      onClick={() => setIsAdding(!isAdding)} 
                      className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-xl active:scale-95 ${
                        activeTab === 'crm' 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/30 ring-2 ring-blue-400/20' 
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20'
                      }`}
                    >
                      {isAdding ? <X className="w-4 h-4" /> : (activeTab === 'crm' ? <Database className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />)}
                      {isAdding ? "Cancel" : (editingId ? "Edit Item" : (activeTab === 'crm' ? "New CRM Item" : "Add New Item"))}
                    </button>
                  )}
                </div>

                {activeTab === 'leads' && <LeadsTab leads={leads} searchQuery={searchQuery} selectedIds={selectedIds} toggleSelect={toggleSelect} toggleSelectAll={toggleSelectAll} handleDelete={handleDelete} canManage={canManageCurrentTab} />}
                {activeTab === 'customers' && <CustomersTab customers={customers} searchQuery={searchQuery} isAdding={isAdding} editingId={editingId} customerForm={customerForm} setCustomerForm={setCustomerForm} onAddCustomer={handleAddCustomer} onEditCustomer={handleEditCustomer} onDeleteCustomer={handleDelete} canManage={canManageCurrentTab} saving={saving} selectedIds={selectedIds} toggleSelect={toggleSelect} toggleSelectAll={toggleSelectAll} />}
                {activeTab === 'pipeline' && <PipelineTab deals={deals} customers={customers} searchQuery={searchQuery} isAdding={isAdding} editingId={editingId} dealForm={dealForm} setDealForm={setDealForm} onAddDeal={handleAddDeal} onEditDeal={handleEditDeal} onUpdateDealStage={handleUpdateDealStage} onDeleteDeal={handleDelete} canManage={canManageCurrentTab} saving={saving} selectedIds={selectedIds} toggleSelect={toggleSelect} toggleSelectAll={toggleSelectAll} />}
                {activeTab === 'clients' && <ClientsTab clients={clients} searchQuery={searchQuery} isAdding={isAdding} editingId={editingId} clientForm={clientForm} setClientForm={setClientForm} logoFile={logoFile} setLogoFile={setLogoFile} onAddClient={handleAddClient} onEditClient={handleEditClient} onDeleteClient={handleDelete} canManage={canManageCurrentTab} saving={saving} selectedIds={selectedIds} toggleSelect={toggleSelect} toggleSelectAll={toggleSelectAll} />}
                {activeTab === 'faq' && <FAQTab faqs={faqs} searchQuery={searchQuery} isAdding={isAdding} editingId={editingId} faqForm={faqForm} setFaqForm={setFaqForm} onAddFAQ={handleAddFAQ} onEditFAQ={handleEditFAQ} onDeleteFAQ={handleDelete} canManage={canManageCurrentTab} saving={saving} selectedIds={selectedIds} toggleSelect={toggleSelect} toggleSelectAll={toggleSelectAll} />}
                {activeTab === 'testimonials' && <TestimonialsTab testimonials={testimonials} searchQuery={searchQuery} isAdding={isAdding} editingId={editingId} testimonialForm={testimonialForm} setTestimonialForm={setTestimonialForm} testimonialFile={testimonialFile} setTestimonialFile={setTestimonialFile} onAddTestimonial={handleAddTestimonial} onEditTestimonial={handleEditTestimonial} onDeleteTestimonial={handleDelete} canManage={canManageCurrentTab} saving={saving} selectedIds={selectedIds} toggleSelect={toggleSelect} toggleSelectAll={toggleSelectAll} />}
                {activeTab === 'crm' && (
                  <div className="p-8 text-center bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800">
                    <AnimatePresence mode="wait">
                      {isAdding ? (
                        <motion.div 
                          key="crm-adding"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="max-w-2xl mx-auto"
                        >
                          <div className="bg-blue-50 dark:bg-blue-900/10 p-8 rounded-[2.5rem] border border-blue-100 dark:border-blue-800/30 mb-8">
                            <Sparkles className="w-10 h-10 text-blue-600 mx-auto mb-4" />
                            <h3 className="text-2xl font-black text-neutral-900 dark:text-white uppercase italic">Select Entry Type</h3>
                            <p className="text-neutral-500 mt-2 font-medium">Which type of record would you like to create in the CRM system?</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <button 
                              onClick={() => { setActiveTab('leads'); setIsAdding(true); }}
                              className="group p-8 bg-white dark:bg-neutral-800 rounded-3xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left"
                            >
                              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Mail className="w-6 h-6 text-blue-600" />
                              </div>
                              <h4 className="text-lg font-black text-neutral-900 dark:text-white uppercase italic">Manual Lead</h4>
                              <p className="text-sm text-neutral-500 mt-1">New service inquiry.</p>
                            </button>
                            <button 
                              onClick={() => { setActiveTab('customers'); setIsAdding(true); }}
                              className="group p-8 bg-white dark:bg-neutral-800 rounded-3xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left"
                            >
                              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Building2 className="w-6 h-6 text-indigo-600" />
                              </div>
                              <h4 className="text-lg font-black text-neutral-900 dark:text-white uppercase italic">Corporate Client</h4>
                              <p className="text-sm text-neutral-500 mt-1">Register verified partner.</p>
                            </button>
                            <button 
                              onClick={() => { setActiveTab('pipeline'); setIsAdding(true); }}
                              className="group p-8 bg-white dark:bg-neutral-800 rounded-3xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left"
                            >
                              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                              </div>
                              <h4 className="text-lg font-black text-neutral-900 dark:text-white uppercase italic">New Deal</h4>
                              <p className="text-sm text-neutral-500 mt-1">Initialize sales opportunity.</p>
                            </button>
                            <button 
                              onClick={() => { setActiveTab('documents'); setIsAdding(true); }}
                              className="group p-8 bg-white dark:bg-neutral-800 rounded-3xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left"
                            >
                              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <FileText className="w-6 h-6 text-amber-600" />
                              </div>
                              <h4 className="text-lg font-black text-neutral-900 dark:text-white uppercase italic">Document Entry</h4>
                              <p className="text-sm text-neutral-500 mt-1">Categorize new record.</p>
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="crm-gateway"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <Database className="w-12 h-12 text-blue-500 mx-auto mb-4 opacity-20" />
                          <h3 className="text-xl font-black text-neutral-900 dark:text-white uppercase italic">CRM System Gateway</h3>
                          <p className="text-neutral-500 mt-2 max-w-md mx-auto font-medium">Unified management for all leads and client interactions. This module bridges the gap between potential inquiries and loyal partners.</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 max-w-4xl mx-auto">
                            <button onClick={() => setActiveTab('leads')} className="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-3xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all border border-neutral-100 dark:border-neutral-700 hover:border-blue-200 group text-left">
                              <Mail className="w-6 h-6 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                              <h4 className="font-black text-neutral-900 dark:text-white uppercase italic text-sm">Incoming Leads</h4>
                              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">{leads.length} Pending</p>
                            </button>
                            <button onClick={() => setActiveTab('customers')} className="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-3xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all border border-neutral-100 dark:border-neutral-700 hover:border-blue-200 group text-left">
                              <Building2 className="w-6 h-6 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                              <h4 className="font-black text-neutral-900 dark:text-white uppercase italic text-sm">Customers</h4>
                              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">{customers.length} Active</p>
                            </button>
                            <button onClick={() => setActiveTab('pipeline')} className="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-3xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all border border-neutral-100 dark:border-neutral-700 hover:border-blue-200 group text-left">
                              <TrendingUp className="w-6 h-6 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                              <h4 className="font-black text-neutral-900 dark:text-white uppercase italic text-sm">Sales Pipeline</h4>
                              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">{deals.length} Active</p>
                            </button>
                            <button onClick={() => setActiveTab('documents')} className="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-3xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all border border-neutral-100 dark:border-neutral-700 hover:border-blue-200 group text-left">
                              <FileText className="w-6 h-6 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                              <h4 className="font-black text-neutral-900 dark:text-white uppercase italic text-sm">Documents</h4>
                              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">{documents.length} Records</p>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                {activeTab === 'users' && (
                  <UsersTab 
                    users={users} 
                    searchQuery={searchQuery} 
                    isAdding={isAdding} 
                    editingId={editingId} 
                    userForm={userForm} 
                    setUserForm={setUserForm} 
                    roles={roles} 
                    onAddUser={handleAddUser} 
                    onEditUser={handleEditUser} 
                    onDeleteUser={handleDelete} 
                    canManage={canManageCurrentTab} 
                    saving={saving} 
                    currentUser={user} 
                    selectedIds={selectedIds} 
                    toggleSelect={toggleSelect} 
                    toggleSelectAll={toggleSelectAll}
                    roleForm={roleForm}
                    setRoleForm={setRoleForm}
                    onAddRole={handleAddRole}
                    onEditRole={handleEditRole}
                    onDeleteRole={handleDelete}
                  />
                )}
                {activeTab === 'documents' && (
                  <DocumentsTab 
                    documents={documents} 
                    searchQuery={searchQuery} 
                    isAdding={isAdding} 
                    editingId={editingId} 
                    documentForm={documentForm} 
                    setDocumentForm={setDocumentForm} 
                    documentFile={documentFile} 
                    setDocumentFile={setDocumentFile} 
                    docCategories={docCategories} 
                    onAddDocument={handleAddDocument} 
                    onEditDocument={handleEditDocument}
                    onDeleteDocument={handleDelete} 
                    canManage={canManageCurrentTab} 
                    saving={saving} 
                    selectedIds={selectedIds} 
                    toggleSelect={toggleSelect} 
                    toggleSelectAll={toggleSelectAll} 
                    categoryForm={docCategoryForm}
                    setCategoryForm={setDocCategoryForm}
                    onAddCategory={handleAddDocCategory}
                    onEditCategory={handleEditDocCategory}
                    onDeleteCategory={handleDelete}
                    customers={customers}
                  />
                )}
                {activeTab === 'campaigns' && (
                  <CampaignsTab 
                    campaigns={campaigns}
                    searchQuery={searchQuery}
                    isAdding={isAdding}
                    setIsAdding={setIsAdding}
                    editingId={editingId}
                    setEditingId={setEditingId}
                    campaignForm={campaignForm}
                    setCampaignForm={setCampaignForm}
                    onSaveCampaign={handleSaveCampaign}
                    onEditCampaign={handleEditCampaign}
                    onDeleteCampaign={handleDelete}
                    onToggleActive={handleToggleCampaignActive}
                    canManage={canManageCurrentTab}
                    saving={saving}
                    selectedIds={selectedIds}
                    toggleSelect={toggleSelect}
                    toggleSelectAll={toggleSelectAll}
                  />
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
