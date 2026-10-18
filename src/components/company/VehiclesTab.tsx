
"use client";

import {AlertDialog,AlertDialogContent,AlertDialogHeader,AlertDialogTitle,AlertDialogDescription,AlertDialogFooter,AlertDialogCancel} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Car, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  plate_number: string;
  vin?: string;
  status: string;
}

interface VehiclesTabProps {
  vehicles: Vehicle[];
  onRefresh: () => void;
  companyId:number;
}

const emptyForm = { brand: '', model: '', plate_number: '', vin: '' };

export default function VehiclesTab({ vehicles, onRefresh,companyId }: VehiclesTabProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteTarget,setDeleteTarget]=useState<number|null>(null);
  const [deleteError,setDeleteError]=useState('');

  const openAdd = () => { setEditingVehicle(null); setForm(emptyForm); setShowDialog(true); };
  const openEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setForm({ brand: v.brand, model: v.model, plate_number: v.plate_number, vin: v.vin || '' });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.brand || !form.model || !form.plate_number) {
      toast.error('Brand, model and plate number are required');
      return;
    }
    setLoading(true);
    try {
      if (editingVehicle) {
        await api.put(`/company-portal/vehicles?company_id=${companyId}&id=${editingVehicle.id}`, form);
        toast.success('Vehicle updated successfully');
      } else {
        await api.post(`/company-portal/vehicles?company_id=${companyId}`, form);
        toast.success('Vehicle added successfully');
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
    setDeletingId(id);setDeleteError('');
    try {
      await api.delete(`/company-portal/vehicles?company_id=${companyId}&id=${id}`);
      toast.success('Vehicle removed');
      setDeleteTarget(null);onRefresh();
    } catch (err: any) {
      setDeleteError(err.message || 'Operation failed');
    } finally {
      setDeletingId(null);
    }
  };

  const statusColor = (s: string) =>
    s === 'active' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
    s === 'maintenance' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' :
    'bg-red-500/10 text-red-600 border-red-500/20';

  return (
    <div className="space-y-4">
      <AlertDialog open={deleteTarget!==null} onOpenChange={v=>{if(!v&&deletingId===null)setDeleteTarget(null);}}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Deactivate # {deleteTarget}</AlertDialogTitle><AlertDialogDescription>The record leaves active operation. Historical trips remain available.</AlertDialogDescription></AlertDialogHeader>{deleteError&&<p role="alert" className="text-destructive">{deleteError}</p>}<AlertDialogFooter><AlertDialogCancel disabled={deletingId!==null}>Cancel</AlertDialogCancel><Button variant="destructive" disabled={deletingId!==null} onClick={()=>{if(deleteTarget!==null)void handleDelete(deleteTarget);}}>Deactivate</Button></AlertDialogFooter></AlertDialogContent></AlertDialog>

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{vehicles.length} vehicle(s) registered</p>
        <Button onClick={openAdd} size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> Add Vehicle
        </Button>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Car className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No vehicles registered yet</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {vehicles.map((v) => (
            <Card key={v.id} className="border border-border/50">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Car className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{v.brand} {v.model}</p>
                      <p className="text-sm text-muted-foreground font-mono">{v.plate_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className={`text-xs ${statusColor(v.status)}`}>{v.status}</Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(v)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => {setDeleteError('');setDeleteTarget(v.id);}}
                      disabled={deletingId === v.id}
                    >
                      {deletingId === v.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
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
            <DialogTitle>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Brand *</Label>
                <Input placeholder="Toyota" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Model *</Label>
                <Input placeholder="Camry" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Plate Number *</Label>
              <Input placeholder="1-ABC-123" value={form.plate_number} onChange={e => setForm(f => ({ ...f, plate_number: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>VIN (optional)</Label>
              <Input placeholder="Vehicle identification number" value={form.vin} onChange={e => setForm(f => ({ ...f, vin: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingVehicle ? 'Save Changes' : 'Add Vehicle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
