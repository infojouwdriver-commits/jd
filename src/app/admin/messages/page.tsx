
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare,
  ArrowLeft,
  Plus,
  Send,
  Reply,
  Trash2,
  Mail,
  MailOpen,
  Clock,
  User,
  Inbox,
  SendHorizontal,
  Lock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Message {
  id: number;
  sender_user_id: number;
  sender_type: string;
  sender_name: string;
  sender_email: string | null;
  subject: string;
  message_body: string;
  message_priority: string;
  recipient_type: string;
  target_company_id: number | null;
  is_broadcast: boolean;
  parent_message_id: number | null;
  status: string;
  is_locked: boolean;
  resolved_at: string | null;
  resolved_by_user_id: number | null;
  last_activity_at: string;
  created_at: string;
}

interface Company {
  id: number;
  name: string;
}

interface Driver {
  id: number;
  user_id: number;
  full_name: string;
  company_id: number;
}

interface Reply {
  id: number;
  parent_message_id: number;
  reply_message_id: number;
  sender_user_id: number;
  sender_name: string;
  sender_type: string;
  reply_body: string;
  created_at: string;
}

export default function AdminMessagesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [newMessage, setNewMessage] = useState({
    subject: '',
    message_body: '',
    message_priority: 'normal',
    recipient_type: 'all_drivers',
    target_company_id: '',
    recipient_user_id: ''
  });
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
    if (!isLoading && user && !user.isAdmin) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await api.get<Message[]>('/messages');
      setMessages(data);
    } catch (error: any) {
      toast.error(error.message || 'فشل تحميل الرسائل');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const data = await api.get<Company[]>('/companies');
      setCompanies(data);
    } catch (error: any) {
      toast.error(error.message || 'فشل تحميل الشركات');
    }
  };

  const fetchDrivers = async () => {
    try {
      const data = await api.get<Driver[]>('/drivers');
      setDrivers(data);
    } catch (error: any) {
      toast.error(error.message || 'فشل تحميل السائقين');
    }
  };

  useEffect(() => {
    if (user?.isAdmin === true) {
      fetchMessages();
      fetchCompanies();
      fetchDrivers();
    }
  }, [user]);

  const handleCreateMessage = async () => {
    if (!newMessage.subject || !newMessage.message_body) {
      toast.error('الموضوع والرسالة مطلوبان');
      return;
    }

    try {
      const messageData: any = {
        sender_type: 'admin',
        subject: newMessage.subject,
        message_body: newMessage.message_body,
        message_priority: newMessage.message_priority,
        recipient_type: newMessage.recipient_type,
        is_broadcast: newMessage.recipient_type !== 'individual'
      };

      if (newMessage.recipient_type === 'specific_company' && newMessage.target_company_id) {
        messageData.target_company_id = parseInt(newMessage.target_company_id);
      }

      if (newMessage.recipient_type === 'individual' && newMessage.recipient_user_id) {
        messageData.recipient_user_id = parseInt(newMessage.recipient_user_id);
      }

      await api.post('/messages', messageData);
      
      toast.success('تم إرسال الرسالة بنجاح');
      
      setDialogOpen(false);
      setNewMessage({
        subject: '',
        message_body: '',
        message_priority: 'normal',
        recipient_type: 'all_drivers',
        target_company_id: '',
        recipient_user_id: ''
      });
      fetchMessages();
    } catch (error: any) {
      toast.error(error.message || 'فشل إرسال الرسالة');
    }
  };

  const handleViewReplies = async (message: Message) => {
    setSelectedMessage(message);
    try {
      const data = await api.get<Reply[]>(`/messages/replies?message_id=${message.id}`);
      setReplies(data);
      setReplyDialogOpen(true);
    } catch (error: any) {
      toast.error(error.message || 'فشل تحميل الردود');
    }
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) {
      toast.error('نص الرد مطلوب');
      return;
    }

    if (selectedMessage.is_locked || selectedMessage.status === 'resolved') {
      toast.error('لا يمكن الرد على رسالة تم حلها');
      return;
    }

    try {
      await api.post('/messages/replies', {
        parent_message_id: selectedMessage.id,
        reply_body: replyText,
        sender_type: 'admin'
      });
      
      toast.success('تم إرسال الرد بنجاح');
      setReplyText('');
      handleViewReplies(selectedMessage);
      fetchMessages();
    } catch (error: any) {
      toast.error(error.message || 'فشل إرسال الرد');
    }
  };

  const handleResolveMessage = async (message: Message) => {
    try {
      await api.put(`/messages?id=${message.id}`, {
        status: 'resolved'
      });
      
      toast.success('تم تحديد الرسالة كمحلولة');
      fetchMessages();
      
      if (selectedMessage?.id === message.id) {
        setReplyDialogOpen(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'فشل تحديث حالة الرسالة');
    }
  };

  const handleDeleteMessage = async () => {
    if (!messageToDelete) return;

    try {
      await api.delete(`/messages?id=${messageToDelete.id}`);
      
      toast.success('تم حذف الرسالة بنجاح');
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
      fetchMessages();
      
      if (selectedMessage?.id === messageToDelete.id) {
        setReplyDialogOpen(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'فشل حذف الرسالة');
    }
  };

  const confirmDelete = (message: Message) => {
    setMessageToDelete(message);
    setDeleteDialogOpen(true);
  };

  const getPriorityBadge = (priority: string): React.ReactElement | null => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0">عاجل</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-0">عالي</Badge>;
      case 'normal':
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">عادي</Badge>;
      case 'low':
        return <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-0">منخفض</Badge>;
      default:
        return null;
    }
  };

  const getRecipientLabel = (message: Message) => {
    switch (message.recipient_type) {
      case 'all_drivers':
        return 'جميع السائقين';
      case 'specific_company':
        const company = companies.find(c => c.id === message.target_company_id);
        return company ? `شركة: ${company.name}` : 'شركة معينة';
      case 'all_active_drivers':
        return 'السائقون النشطون فقط';
      case 'individual':
        return 'سائق محدد';
      default:
        return message.recipient_type;
    }
  };

  const sentMessages = messages.filter(m => m.sender_type === 'admin');
  const receivedMessages = messages.filter(m => m.sender_type === 'driver');

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-2xl">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              الرسائل الداخلية
            </h1>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600">
                  <Plus className="w-5 h-5 ml-2" />
                  رسالة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>إرسال رسالة جديدة</DialogTitle>
                  <DialogDescription>
                    أرسل رسالة للسائقين
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>الموضوع *</Label>
                    <Input
                      value={newMessage.subject}
                      onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                      className="rounded-2xl mt-2"
                      placeholder="موضوع الرسالة"
                    />
                  </div>
                  <div>
                    <Label>الرسالة *</Label>
                    <Textarea
                      value={newMessage.message_body}
                      onChange={(e) => setNewMessage({ ...newMessage, message_body: e.target.value })}
                      className="rounded-2xl mt-2 min-h-[120px]"
                      placeholder="نص الرسالة"
                    />
                  </div>
                  <div>
                    <Label>الأولوية</Label>
                    <Select
                      value={newMessage.message_priority}
                      onValueChange={(value) => setNewMessage({ ...newMessage, message_priority: value })}
                    >
                      <SelectTrigger className="rounded-2xl mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">منخفضة</SelectItem>
                        <SelectItem value="normal">عادية</SelectItem>
                        <SelectItem value="high">عالية</SelectItem>
                        <SelectItem value="urgent">عاجلة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>المستلمون</Label>
                    <Select
                      value={newMessage.recipient_type}
                      onValueChange={(value) => setNewMessage({ ...newMessage, recipient_type: value })}
                    >
                      <SelectTrigger className="rounded-2xl mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_drivers">جميع السائقين</SelectItem>
                        <SelectItem value="specific_company">شركة معينة</SelectItem>
                        <SelectItem value="all_active_drivers">السائقون النشطون فقط</SelectItem>
                        <SelectItem value="individual">سائق محدد</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newMessage.recipient_type === 'specific_company' && (
                    <div>
                      <Label>اختر الشركة</Label>
                      <Select
                        value={newMessage.target_company_id}
                        onValueChange={(value) => setNewMessage({ ...newMessage, target_company_id: value })}
                      >
                        <SelectTrigger className="rounded-2xl mt-2">
                          <SelectValue placeholder="اختر الشركة" />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id.toString()}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {newMessage.recipient_type === 'individual' && (
                    <div>
                      <Label>اختر السائق</Label>
                      <Select
                        value={newMessage.recipient_user_id}
                        onValueChange={(value) => setNewMessage({ ...newMessage, recipient_user_id: value })}
                      >
                        <SelectTrigger className="rounded-2xl mt-2">
                          <SelectValue placeholder="اختر السائق" />
                        </SelectTrigger>
                        <SelectContent>
                          {drivers.map((driver) => (
                            <SelectItem key={driver.id} value={driver.user_id.toString()}>
                              {driver.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <Button 
                    onClick={handleCreateMessage}
                    className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600"
                  >
                    <Send className="w-5 h-5 ml-2" />
                    إرسال الرسالة
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 rounded-3xl border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">إجمالي الرسائل</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{messages.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-3xl border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">الرسائل المرسلة</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {sentMessages.length}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                <SendHorizontal className="w-7 h-7 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-3xl border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">الرسائل الواردة</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {receivedMessages.length}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Inbox className="w-7 h-7 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 rounded-2xl">
            <TabsTrigger value="all" className="rounded-2xl">الكل ({messages.length})</TabsTrigger>
            <TabsTrigger value="sent" className="rounded-2xl">المرسلة ({sentMessages.length})</TabsTrigger>
            <TabsTrigger value="received" className="rounded-2xl">الواردة ({receivedMessages.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <MessagesList 
              messages={messages} 
              companies={companies}
              onViewReplies={handleViewReplies}
              onResolve={handleResolveMessage}
              onDelete={confirmDelete}
              getPriorityBadge={getPriorityBadge}
              getRecipientLabel={getRecipientLabel}
            />
          </TabsContent>

          <TabsContent value="sent">
            <MessagesList 
              messages={sentMessages} 
              companies={companies}
              onViewReplies={handleViewReplies}
              onResolve={handleResolveMessage}
              onDelete={confirmDelete}
              getPriorityBadge={getPriorityBadge}
              getRecipientLabel={getRecipientLabel}
            />
          </TabsContent>

          <TabsContent value="received">
            <MessagesList 
              messages={receivedMessages} 
              companies={companies}
              onViewReplies={handleViewReplies}
              onResolve={handleResolveMessage}
              onDelete={confirmDelete}
              getPriorityBadge={getPriorityBadge}
              getRecipientLabel={getRecipientLabel}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="rounded-3xl max-h-[90vh] overflow-y-auto max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>{selectedMessage?.subject}</DialogTitle>
                <DialogDescription className="mt-1">
                  من: {selectedMessage?.sender_name}
                </DialogDescription>
              </div>
              {selectedMessage && (
                <div className="flex gap-2">
                  {selectedMessage.status === 'open' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-2xl"
                      onClick={() => handleResolveMessage(selectedMessage)}
                    >
                      <CheckCircle2 className="w-4 h-4 ml-1" />
                      تم الحل
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="rounded-2xl"
                    onClick={() => {
                      confirmDelete(selectedMessage);
                      setReplyDialogOpen(false);
                    }}
                  >
                    <Trash2 className="w-4 h-4 ml-1" />
                    حذف
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Status Badge */}
            {selectedMessage && (
              <div className="flex items-center gap-2">
                {selectedMessage.status === 'resolved' && (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                    <CheckCircle2 className="w-3 h-3 ml-1" />
                    تم الحل
                  </Badge>
                )}
                {selectedMessage.is_locked && (
                  <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-0">
                    <Lock className="w-3 h-3 ml-1" />
                    مقفلة
                  </Badge>
                )}
              </div>
            )}

            {/* Original Message */}
            <Card className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">الرسالة الأصلية:</p>
              <p className="text-sm text-slate-900 dark:text-white">{selectedMessage?.message_body}</p>
              <p className="text-xs text-slate-500 mt-2">
                {selectedMessage && new Date(selectedMessage.created_at).toLocaleString('ar-SA')}
              </p>
            </Card>

            {/* Replies */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {replies.length === 0 ? (
                <p className="text-center text-sm text-slate-500 py-4">لا توجد ردود بعد</p>
              ) : (
                replies.map((reply) => (
                  <Card key={reply.id} className={`p-4 rounded-2xl ${
                    reply.sender_type === 'admin' 
                      ? 'bg-blue-50 dark:bg-blue-900/20' 
                      : 'bg-purple-50 dark:bg-purple-900/20'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {reply.sender_name}
                      </p>
                      <Badge className={`border-0 text-xs ${
                        reply.sender_type === 'admin'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      }`}>
                        {reply.sender_type === 'admin' ? 'إدارة' : 'سائق'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-900 dark:text-white mb-2">{reply.reply_body}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(reply.created_at).toLocaleString('ar-SA')}
                    </p>
                  </Card>
                ))
              )}
            </div>

            {/* Reply Input */}
            {selectedMessage && !selectedMessage.is_locked && selectedMessage.status !== 'resolved' ? (
              <div className="space-y-2">
                <Label>إضافة رد</Label>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="rounded-2xl min-h-[100px]"
                  placeholder="اكتب ردك هنا..."
                />
                <Button 
                  onClick={handleSendReply}
                  className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600"
                >
                  <Send className="w-5 h-5 ml-2" />
                  إرسال الرد
                </Button>
              </div>
            ) : (
              <Card className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm font-medium">
                    لا يمكن الرد على هذه الرسالة لأنها تم حلها. يرجى فتح رسالة جديدة.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه الرسالة؟ سيتم حذف الرسالة وجميع الردود المرتبطة بها نهائياً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl">إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              className="rounded-2xl bg-red-500 hover:bg-red-600"
              onClick={handleDeleteMessage}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface MessagesListProps {
  messages: Message[];
  companies: Company[];
  onViewReplies: (message: Message) => void;
  onResolve: (message: Message) => void;
  onDelete: (message: Message) => void;
  getPriorityBadge: (priority: string) => React.ReactElement | null;
  getRecipientLabel: (message: Message) => string;
}

function MessagesList({ 
  messages, 
  companies, 
  onViewReplies, 
  onResolve,
  onDelete,
  getPriorityBadge, 
  getRecipientLabel 
}: MessagesListProps) {
  return (
    <div className="space-y-4">
      <AnimatePresence>
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Card className="p-12 rounded-3xl border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
              <div className="text-center">
                <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-10 h-10 text-slate-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400">لا توجد رسائل</p>
              </div>
            </Card>
          </motion.div>
        ) : (
          messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                className="p-6 rounded-3xl border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:scale-[1.02] transition-transform duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                      message.sender_type === 'admin' 
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30'
                        : 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/30'
                    }`}>
                      {message.sender_type === 'admin' ? (
                        <Send className="w-5 h-5 text-white" />
                      ) : (
                        <User className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          {message.subject}
                        </h3>
                        {getPriorityBadge(message.message_priority)}
                        <Badge className={`border-0 ${
                          message.sender_type === 'admin'
                            ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {message.sender_type === 'admin' ? 'مرسلة' : 'واردة'}
                        </Badge>
                        {message.status === 'resolved' && (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                            <CheckCircle2 className="w-3 h-3 ml-1" />
                            تم الحل
                          </Badge>
                        )}
                        {message.is_locked && (
                          <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-0">
                            <Lock className="w-3 h-3 ml-1" />
                            مقفلة
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-slate-500" />
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          من: <span className="font-medium">{message.sender_name}</span>
                        </p>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                        {message.message_body}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {getRecipientLabel(message)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(message.last_activity_at || message.created_at).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-2xl"
                      onClick={() => onViewReplies(message)}
                    >
                      <Reply className="w-4 h-4" />
                    </Button>
                    {message.status === 'open' && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-2xl"
                        onClick={() => onResolve(message)}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="rounded-2xl"
                      onClick={() => onDelete(message)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  );
}
