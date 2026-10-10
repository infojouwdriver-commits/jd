
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface PlatformContract {
  id: number;
  company_id: number;
  platform_name: string;
  contract_number: string;
  contractor_name: string;
  contract_start_date: string | null;
  contract_end_date: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export default function PlatformContractsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const companyId = params.id as string;

  const [contracts, setContracts] = useState<PlatformContract[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<PlatformContract | null>(null);
  const [formData, setFormData] = useState({
    platform_name: 'uber',
    contract_number: '',
    contractor_name: '',
    contract_start_date: '',
    contract_end_date: '',
    is_active: true,
    notes: ''
  });

  useEffect(() => {
    if (!isLoading && user && !user.isAdmin) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.isAdmin && companyId) {
      fetchContracts();
    }
  }, [user, companyId]);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const data = await api.get<PlatformContract[]>(`/platform-contracts?company_id=${companyId}`);
      setContracts(data || []);
    } catch (error: any) {
      console.error("Operation failed");
      toast.error('فشل تحميل عقود المنصات');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من الحقول المطلوبة
    if (!formData.platform_name || !formData.contract_number || !formData.contractor_name) {
      toast.error('جميع الحقول الأساسية مطلوبة');
      return;
    }

    try {
      // تنظيف البيانات قبل الإرسال
      const cleanedData = {
        platform_name: formData.platform_name.toLowerCase().trim(),
        contract_number: formData.contract_number.trim(),
        contractor_name: formData.contractor_name.trim(),
        contract_start_date: formData.contract_start_date || null,
        contract_end_date: formData.contract_end_date || null,
        is_active: formData.is_active,
        notes: formData.notes.trim() || null
      };

      if (editingContract) {
        await api.put('/platform-contracts', {
          id: editingContract.id,
          ...cleanedData
        });
        toast.success('تم تحديث العقد بنجاح');
      } else {
        await api.post('/platform-contracts', {
          company_id: parseInt(companyId),
          ...cleanedData
        });
        toast.success('تم إنشاء العقد بنجاح');
      }
      
      setDialogOpen(false);
      setEditingContract(null);
      resetForm();
      fetchContracts();
    } catch (error: any) {
      console.error("Operation failed");
      toast.error(error.message || 'فشلت العملية');
    }
  };

  const handleEdit = (contract: PlatformContract) => {
    setEditingContract(contract);
    setFormData({
      platform_name: contract.platform_name.toLowerCase(),
      contract_number: contract.contract_number,
      contractor_name: contract.contractor_name,
      contract_start_date: contract.contract_start_date || '',
      contract_end_date: contract.contract_end_date || '',
      is_active: contract.is_active,
      notes: contract.notes || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا العقد؟')) return;
    
    try {
      await api.delete(`/platform-contracts?id=${id}`);
      toast.success('تم حذف العقد بنجاح');
      fetchContracts();
    } catch (error: any) {
      toast.error('فشل حذف العقد: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      platform_name: 'uber',
      contract_number: '',
      contractor_name: '',
      contract_start_date: '',
      contract_end_date: '',
      is_active: true,
      notes: ''
    });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'uber': return '⚫';
      case 'bolt': return '🟢';
      case 'heetch': return '🟣';
      default: return '📱';
    }
  };

  const getPlatformDisplayName = (platform: string) => {
    return platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();
  };

  if (isLoading || !user?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href={`/admin/companies/${companyId}/settings`}>
              <Button variant="outline" size="icon" className="rounded-xl">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">عقود المنصات الخارجية</h1>
              <p className="text-muted-foreground">إدارة عقود Uber و Bolt و Heetch</p>
            </div>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditingContract(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                إضافة عقد جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingContract ? 'تعديل العقد' : 'إضافة عقد جديد'}</DialogTitle>
                <DialogDescription>
                  أدخل معلومات عقد المنصة الخارجية
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="platform_name">المنصة *</Label>
                  <Select 
                    value={formData.platform_name} 
                    onValueChange={(value) => setFormData({ ...formData, platform_name: value.toLowerCase() })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uber">
                        <div className="flex items-center gap-2">
                          <span>⚫</span>
                          <span>Uber</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="bolt">
                        <div className="flex items-center gap-2">
                          <span>🟢</span>
                          <span>Bolt</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="heetch">
                        <div className="flex items-center gap-2">
                          <span>🟣</span>
                          <span>Heetch</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="contract_number">رقم العقد (Contractnummer) *</Label>
                  <Input
                    id="contract_number"
                    value={formData.contract_number}
                    onChange={(e) => setFormData({ ...formData, contract_number: e.target.value })}
                    placeholder="أدخل رقم العقد"
                    className="rounded-xl"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="contractor_name">اسم المتعاقد (Contractant) *</Label>
                  <Input
                    id="contractor_name"
                    value={formData.contractor_name}
                    onChange={(e) => setFormData({ ...formData, contractor_name: e.target.value })}
                    placeholder="مثال: Uber Belgium"
                    className="rounded-xl"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contract_start_date">تاريخ البداية</Label>
                    <Input
                      id="contract_start_date"
                      type="date"
                      value={formData.contract_start_date}
                      onChange={(e) => setFormData({ ...formData, contract_start_date: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contract_end_date">تاريخ النهاية</Label>
                    <Input
                      id="contract_end_date"
                      type="date"
                      value={formData.contract_end_date}
                      onChange={(e) => setFormData({ ...formData, contract_end_date: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">العقد نشط</Label>
                </div>

                <div>
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="ملاحظات إضافية (اختياري)"
                    className="rounded-xl"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1 rounded-xl">
                    <X className="w-4 h-4 mr-2" />
                    إلغاء
                  </Button>
                  <Button type="submit" className="flex-1 rounded-xl">
                    <Save className="w-4 h-4 mr-2" />
                    {editingContract ? 'تحديث' : 'حفظ'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Contracts List */}
        <div className="grid gap-4">
          {loading ? (
            <Card className="p-12 rounded-3xl text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </Card>
          ) : contracts.length === 0 ? (
            <Card className="p-12 rounded-3xl text-center">
              <p className="text-muted-foreground">لا توجد عقود منصات حتى الآن</p>
            </Card>
          ) : (
            contracts.map((contract) => (
              <Card key={contract.id} className="rounded-3xl border-border/50 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{getPlatformIcon(contract.platform_name)}</div>
                      <div>
                        <CardTitle className="text-xl">{getPlatformDisplayName(contract.platform_name)}</CardTitle>
                        <CardDescription>
                          {contract.is_active ? (
                            <span className="text-green-600 dark:text-green-400">● نشط</span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400">● غير نشط</span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(contract)} className="rounded-xl">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDelete(contract.id)} className="rounded-xl text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">رقم العقد (Contractnummer)</p>
                      <p className="font-semibold">{contract.contract_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">المتعاقد (Contractant)</p>
                      <p className="font-semibold">{contract.contractor_name}</p>
                    </div>
                    {contract.contract_start_date && (
                      <div>
                        <p className="text-sm text-muted-foreground">تاريخ البداية</p>
                        <p className="font-semibold">{new Date(contract.contract_start_date).toLocaleDateString('ar-SA')}</p>
                      </div>
                    )}
                    {contract.contract_end_date && (
                      <div>
                        <p className="text-sm text-muted-foreground">تاريخ النهاية</p>
                        <p className="font-semibold">{new Date(contract.contract_end_date).toLocaleDateString('ar-SA')}</p>
                      </div>
                    )}
                    {contract.notes && (
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">ملاحظات</p>
                        <p className="font-semibold">{contract.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
