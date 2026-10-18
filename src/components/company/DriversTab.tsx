
"use client";

import {AlertDialog,AlertDialogContent,AlertDialogHeader,AlertDialogTitle,AlertDialogDescription,AlertDialogFooter,AlertDialogCancel} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { User, Plus, Pencil, Trash2, Loader2, Phone } from 'lucide-react';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';

interface Driver {
  id: number;
  full_name: string;
  phone: string;
  national_id?: string;
  driver_license?: string;
  status: string;
}

interface DriversTabProps {
  drivers: Driver[];
  onRefresh: () => void;
  companyId:number;
}

const emptyForm = { full_name: '', phone: '', password: '', national_id: '', driver_license: '' };

export default function DriversTab({ drivers, onRefresh,companyId }: DriversTabProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteTarget,setDeleteTarget]=useState<number|null>(null);
  const [deleteError,setDeleteError]=useState('');

  const openAdd = () => { setEditingDriver(null); setForm(emptyForm); setShowDialog(true); };
  const openEdit = (d: Driver) => {
    setEditingDriver(d);
    setForm({ full_name: d.full_name, phone: d.phone, password: '', national_id: d.national_id || '', driver_license: d.driver_license || '' });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (loading) return;
    if (!form.full_name || !form.phone) {
      toast.error('Full name and phone are required');
      return;
    }
    if (!editingDriver && !form.password) {
      toast.error('Password is required for new drivers');
      return;
    }
    if (form.password && (form.password.length < 12 || new TextEncoder().encode(form.password).length > 72)) {
      toast.error('Use at least 12 characters, up to 72 UTF-8 bytes'); return;
    }
    setLoading(true);
    try {
      if (editingDriver) {
        const { password, ...profile } = form;
        await api.put(`/company-portal/drivers?company_id=${companyId}&id=${editingDriver.id}`, { ...profile, ...(password ? { password } : {}) });
        toast.success('Driver updated successfully');
      } else {
        await api.post(`/company-portal/drivers?company_id=${companyId}`, form);
        toast.success('Driver added successfully');
      }
      setShowDialog(false);
      setDeleteTarget(null);onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if(deletingId!==null)return;
    if(deletingId!==null)return;
    setDeletingId(id);setDeleteError('');
    try {
      await api.delete(`/company-portal/drivers?company_id=${companyId}&id=${id}`);
      toast.success('Driver deactivated; trip history retained');
      setDeleteTarget(null);onRefresh();
    } catch (err: any) {
      setDeleteError(err.message || 'Operation failed');
    } finally {
      setDeletingId(null);
    }
  };

  const statusColor = (s: string) =>
    s === 'active' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
    s === 'suspended' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
    'bg-gray-500/10 text-gray-600 border-gray-500/20';

  return (
    <div className="space-y-4">
      <AlertDialog open={deleteTarget!==null} onOpenChange={v=>{if(!v&&deletingId===null)setDeleteTarget(null);}}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Deactivate # {deleteTarget}</AlertDialogTitle><AlertDialogDescription>The record leaves active operation. Historical trips remain available.</AlertDialogDescription></AlertDialogHeader>{deleteError&&<p role="alert" className="text-destructive">{deleteError}</p>}<AlertDialogFooter><AlertDialogCancel disabled={deletingId!==null}>Cancel</AlertDialogCancel><Button variant="destructive" disabled={deletingId!==null} onClick={()=>{if(deleteTarget!==null)void handleDelete(deleteTarget);}}>Deactivate</Button></AlertDialogFooter></AlertDialogContent></AlertDialog>

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{drivers.length} driver(s) registered</p>
        <Button onClick={openAdd} size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> Add Driver
        </Button>
      </div>

      {drivers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <User className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No drivers registered yet</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {drivers.map((d) => (
            <Card key={d.id} className="border border-border/50">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{d.full_name}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        <span>{d.phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className={`text-xs ${statusColor(d.status)}`}>{d.status}</Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(d)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => {setDeleteError('');setDeleteTarget(d.id);}}
                      disabled={deletingId === d.id}
                    >
                      {deletingId === d.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingDriver ? 'Edit Driver' : 'Add New Driver'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Full Name *</Label>
              <Input placeholder="Driver full name" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone Number *</Label>
              <Input placeholder="+32 XXX XX XX XX" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>{editingDriver ? 'New Password (leave blank to keep current)' : 'Password *'}</Label>
              <Input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>National ID</Label>
                <Input placeholder="Optional" value={form.national_id} onChange={e => setForm(f => ({ ...f, national_id: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Driver License</Label>
                <Input placeholder="Optional" value={form.driver_license} onChange={e => setForm(f => ({ ...f, driver_license: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingDriver ? 'Save Changes' : 'Add Driver'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
