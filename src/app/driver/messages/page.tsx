
'use client';

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageSquare, Send, Mail, MailOpen, Clock, User, AlertCircle, Plus, Lock, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { driverTranslations } from '@/locales/driver';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Message {
  id: number; sender_user_id: number; sender_type: string; sender_name: string;
  subject: string; message_body: string; message_priority: string; recipient_type: string;
  target_company_id: number | null; is_broadcast: boolean; parent_message_id: number | null;
  status: string; is_locked: boolean; resolved_at: string | null; last_activity_at: string;
  created_at: string; is_read: boolean; read_at: string | null; recipient_id: number;
}

interface Reply {
  id: number; parent_message_id: number; reply_message_id: number; sender_user_id: number;
  sender_name: string; sender_type: string; reply_body: string; created_at: string;
}

const glassCard = {
  background: 'rgba(10,15,30,0.75)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(212,175,55,0.15)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
};

export default function DriverMessagesPage() {
  const { language } = useLanguage();
  const t = driverTranslations[language];
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [newMessageDialogOpen, setNewMessageDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyText, setReplyText] = useState('');
  const [newMessage, setNewMessage] = useState({ subject: '', message_body: '', message_priority: 'normal' });

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await api.get<Message[]>('/messages/driver');
      setMessages(data);
    } catch (error: any) { toast.error(error.message || t.error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMessages(); }, []);

  const markAsRead = async (message: Message) => {
    if (message.is_read) return;
    try {
      await api.post('/messages/mark-read', { message_id: message.id });
      setMessages(prev => prev.map(m => m.id === message.id ? { ...m, is_read: true, read_at: new Date().toISOString() } : m));
    } catch (error: any) { console.error("Operation failed"); }
  };

  const handleViewReplies = async (message: Message) => {
    setSelectedMessage(message);
    markAsRead(message);
    try {
      const data = await api.get<Reply[]>(`/messages/replies?message_id=${message.id}`);
      setReplies(data);
      setReplyDialogOpen(true);
    } catch (error: any) { toast.error(error.message || t.error); }
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) { toast.error(language === 'nl' ? 'Antwoordtekst is vereist' : 'Le texte de la réponse est requis'); return; }
    if (selectedMessage.is_locked || selectedMessage.status === 'resolved') { toast.error(language === 'nl' ? 'Kan niet antwoorden op een opgelost bericht.' : 'Impossible de répondre à un message résolu.'); return; }
    try {
      await api.post('/messages/replies', { parent_message_id: selectedMessage.id, reply_body: replyText, sender_type: 'driver' });
      toast.success(language === 'nl' ? 'Antwoord succesvol verzonden' : 'Réponse envoyée avec succès');
      setReplyText('');
      handleViewReplies(selectedMessage);
      fetchMessages();
    } catch (error: any) { toast.error(error.message || t.error); }
  };

  const handleSendNewMessage = async () => {
    if (!newMessage.subject.trim() || !newMessage.message_body.trim()) { toast.error(language === 'nl' ? 'Onderwerp en bericht zijn vereist' : 'Le sujet et le message sont requis'); return; }
    try {
      await api.post('/messages', { sender_type: 'driver', subject: newMessage.subject, message_body: newMessage.message_body, message_priority: newMessage.message_priority, recipient_type: 'individual', is_broadcast: false });
      toast.success(language === 'nl' ? 'Bericht succesvol verzonden' : 'Message envoyé avec succès');
      setNewMessageDialogOpen(false);
      setNewMessage({ subject: '', message_body: '', message_priority: 'normal' });
      fetchMessages();
    } catch (error: any) { toast.error(error.message || (language === 'nl' ? 'Verzenden mislukt' : "Échec de l'envoi")); }
  };

  const getPriorityStyle = (priority: string): React.CSSProperties => {
    const styles: Record<string, React.CSSProperties> = {
      urgent: { background: 'rgba(239,68,68,0.18)', color: '#f87171', border: '1px solid rgba(239,68,68,0.35)' },
      high: { background: 'rgba(249,115,22,0.18)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.35)' },
      normal: { background: 'rgba(59,130,246,0.18)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.35)' },
      low: { background: 'rgba(212,175,55,0.12)', color: 'rgba(212,175,55,0.9)', border: '1px solid rgba(212,175,55,0.25)' },
    };
    return styles[priority] || styles.normal;
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = { urgent: t.urgent, high: t.high, normal: t.normal, low: t.low };
    return labels[priority] || priority;
  };

  const unreadCount = messages.filter(m => !m.is_read).length;

  const dialogInputStyle = {
    background: 'rgba(10,15,30,0.7)',
    border: '1px solid rgba(212,175,55,0.2)',
    color: 'white',
    borderRadius: '1rem',
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
        <MessageSquare className="w-10 h-10" style={{ color: '#d4af37' }} />
      </motion.div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-black tracking-tight"
              style={{ background: 'linear-gradient(90deg, #b8860b, #d4af37, #ffd700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              {t.messages || 'Berichten'}
            </h1>
            {unreadCount > 0 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
                className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.35)', color: '#f87171' }}
              >
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-red-400" />
                {unreadCount} {t.newMessages || 'nieuwe berichten'}
              </motion.div>
            )}
          </div>
          <Dialog open={newMessageDialogOpen} onOpenChange={setNewMessageDialogOpen}>
            <DialogTrigger asChild>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold"
                style={{ background: 'linear-gradient(135deg, #b8860b, #d4af37)', color: '#1a1200', boxShadow: '0 4px 16px rgba(212,175,55,0.3)' }}
              >
                <Plus className="w-4 h-4" />
                {language === 'nl' ? 'Nieuw' : 'Nouveau'}
              </motion.button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl max-h-[90vh] overflow-y-auto" style={{ background: 'rgba(5,10,20,0.99)', border: '1px solid rgba(212,175,55,0.25)' }}>
              <DialogHeader>
                <DialogTitle style={{ color: 'white' }}>{language === 'nl' ? 'Bericht naar beheer' : 'Message à la direction'}</DialogTitle>
                <DialogDescription style={{ color: 'rgba(212,175,55,0.78)' }}>
                  {language === 'nl' ? 'Stuur een bericht of vraag naar het beheer' : 'Envoyez un message ou une question à la direction'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label style={{ color: 'rgba(212,175,55,0.85)', fontSize: '0.75rem', fontWeight: '600' }}>{language === 'nl' ? 'Onderwerp *' : 'Sujet *'}</Label>
                  <Input value={newMessage.subject} onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                    className="rounded-2xl mt-2 border-0"
                    style={{ ...dialogInputStyle }}
                    placeholder={language === 'nl' ? 'Onderwerp van het bericht' : 'Sujet du message'}
                  />
                </div>
                <div>
                  <Label style={{ color: 'rgba(212,175,55,0.85)', fontSize: '0.75rem', fontWeight: '600' }}>{language === 'nl' ? 'Bericht *' : 'Message *'}</Label>
                  <Textarea value={newMessage.message_body} onChange={(e) => setNewMessage({ ...newMessage, message_body: e.target.value })}
                    className="rounded-2xl mt-2 border-0 min-h-[120px]"
                    style={{ ...dialogInputStyle }}
                    placeholder={language === 'nl' ? 'Berichttekst' : 'Texte du message'}
                  />
                </div>
                <div>
                  <Label style={{ color: 'rgba(212,175,55,0.85)', fontSize: '0.75rem', fontWeight: '600' }}>{language === 'nl' ? 'Prioriteit' : 'Priorité'}</Label>
                  <Select value={newMessage.message_priority} onValueChange={(value) => setNewMessage({ ...newMessage, message_priority: value })}>
                    <SelectTrigger className="rounded-2xl mt-2 border-0" style={{ background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(212,175,55,0.2)', color: 'white' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent style={{ background: 'rgba(5,10,20,0.98)', border: '1px solid rgba(212,175,55,0.25)' }}>
                      <SelectItem value="low" style={{ color: 'white' }}>{t.low}</SelectItem>
                      <SelectItem value="normal" style={{ color: 'white' }}>{t.normal}</SelectItem>
                      <SelectItem value="high" style={{ color: 'white' }}>{t.high}</SelectItem>
                      <SelectItem value="urgent" style={{ color: 'white' }}>{t.urgent}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <button onClick={handleSendNewMessage}
                  className="w-full h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #b8860b, #d4af37)', color: '#1a1200' }}
                >
                  <Send className="w-4 h-4" />
                  {language === 'nl' ? 'Bericht verzenden' : 'Envoyer le message'}
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-sm" style={{ color: 'rgba(212,175,55,0.78)' }}>{t.messagesFromManagement || 'Berichten van het beheer'}</p>
      </motion.div>

      {/* Messages List */}
      <div className="space-y-3">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <div className="p-12 rounded-3xl text-center" style={glassCard}>
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
                  <MessageSquare className="w-10 h-10" style={{ color: 'rgba(212,175,55,0.6)' }} />
                </div>
                <p style={{ color: 'rgba(212,175,55,0.78)' }}>{t.noMessages || 'Geen berichten'}</p>
              </div>
            </motion.div>
          ) : (
            messages.map((message, index) => (
              <motion.div key={message.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ delay: index * 0.05 }} whileHover={{ scale: 1.01 }}>
                <div
                  className="p-5 rounded-3xl cursor-pointer transition-all"
                  style={{ ...glassCard, ...(message.is_read ? {} : { border: '1px solid rgba(212,175,55,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,175,55,0.12)' }) }}
                  onClick={() => handleViewReplies(message)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ${message.sender_type === 'admin' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-purple-500 to-purple-600'}`}
                      style={{ boxShadow: message.sender_type === 'admin' ? '0 4px 16px rgba(59,130,246,0.4)' : '0 4px 16px rgba(168,85,247,0.4)' }}
                    >
                      {message.is_read ? <MailOpen className="w-5 h-5 text-white" /> : <Mail className="w-5 h-5 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-base font-bold text-white">{message.subject}</h3>
                        {!message.is_read && (
                          <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1"
                            style={{ background: '#d4af37', boxShadow: '0 0 8px rgba(212,175,55,0.8)' }}
                          />
                        )}
                      </div>
                      <p className="text-sm mb-3 line-clamp-2" style={{ color: 'rgba(255,255,255,0.78)' }}>{message.message_body}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={getPriorityStyle(message.message_priority)}>
                          {getPriorityLabel(message.message_priority)}
                        </span>
                        <div className="flex items-center gap-1 text-xs" style={{ color: 'rgba(212,175,55,0.7)' }}>
                          <Clock className="w-3 h-3" />
                          <span>{new Date(message.created_at).toLocaleDateString(language === 'nl' ? 'nl-BE' : 'fr-BE')}</span>
                        </div>
                        {message.status === 'resolved' && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(34,197,94,0.18)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.35)' }}>
                            <CheckCircle2 className="w-3 h-3 inline mr-1" />{language === 'nl' ? 'Opgelost' : 'Résolu'}
                          </span>
                        )}
                        {message.is_locked && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(249,115,22,0.18)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.35)' }}>
                            <Lock className="w-3 h-3 inline mr-1" />{language === 'nl' ? 'Vergrendeld' : 'Verrouillé'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="rounded-3xl max-h-[90vh] overflow-y-auto max-w-2xl" style={{ background: 'rgba(5,10,20,0.99)', border: '1px solid rgba(212,175,55,0.25)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'white' }}>{selectedMessage?.subject}</DialogTitle>
            <DialogDescription style={{ color: 'rgba(212,175,55,0.78)' }}>{t.messageDetails || 'Berichtdetails'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {selectedMessage && (
              <div className="flex items-center gap-2 flex-wrap">
                {selectedMessage.status === 'resolved' && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(34,197,94,0.18)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.35)' }}>
                    <CheckCircle2 className="w-3 h-3 inline mr-1" />{language === 'nl' ? 'Opgelost' : 'Résolu'}
                  </span>
                )}
                {selectedMessage.is_locked && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(249,115,22,0.18)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.35)' }}>
                    <Lock className="w-3 h-3 inline mr-1" />{language === 'nl' ? 'Vergrendeld' : 'Verrouillé'}
                  </span>
                )}
              </div>
            )}

            <div className="p-4 rounded-2xl" style={{ background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(212,175,55,0.15)' }}>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4" style={{ color: 'rgba(212,175,55,0.7)' }} />
                <p className="text-sm font-medium" style={{ color: 'rgba(212,175,55,0.85)' }}>
                  {selectedMessage?.sender_type === 'admin' ? (t.fromManagement || 'Van beheer') : (language === 'nl' ? 'U' : 'Vous')}
                </p>
              </div>
              <p className="text-sm text-white">{selectedMessage?.message_body}</p>
              <p className="text-xs mt-2" style={{ color: 'rgba(212,175,55,0.65)' }}>
                {selectedMessage && new Date(selectedMessage.created_at).toLocaleString(language === 'nl' ? 'nl-BE' : 'fr-BE')}
              </p>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {replies.length === 0 ? (
                <p className="text-center text-sm py-4" style={{ color: 'rgba(212,175,55,0.65)' }}>{t.noReplies || 'Nog geen antwoorden'}</p>
              ) : (
                replies.map((reply) => (
                  <div key={reply.id} className="p-4 rounded-2xl" style={{ background: reply.sender_type === 'admin' ? 'rgba(59,130,246,0.12)' : 'rgba(168,85,247,0.12)', border: reply.sender_type === 'admin' ? '1px solid rgba(59,130,246,0.25)' : '1px solid rgba(168,85,247,0.25)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4" style={{ color: 'rgba(212,175,55,0.7)' }} />
                      <p className="text-sm font-medium text-white">{reply.sender_name}</p>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={reply.sender_type === 'admin' ? { background: 'rgba(59,130,246,0.18)', color: '#93c5fd' } : { background: 'rgba(168,85,247,0.18)', color: '#c084fc' }}>
                        {reply.sender_type === 'admin' ? (language === 'nl' ? 'Beheer' : 'Direction') : (language === 'nl' ? 'Chauffeur' : 'Chauffeur')}
                      </span>
                    </div>
                    <p className="text-sm text-white mb-2">{reply.reply_body}</p>
                    <p className="text-xs" style={{ color: 'rgba(212,175,55,0.65)' }}>{new Date(reply.created_at).toLocaleString(language === 'nl' ? 'nl-BE' : 'fr-BE')}</p>
                  </div>
                ))
              )}
            </div>

            {selectedMessage && !selectedMessage.is_locked && selectedMessage.status !== 'resolved' ? (
              <div className="space-y-2">
                <Label style={{ color: 'rgba(212,175,55,0.85)', fontSize: '0.75rem', fontWeight: '600' }}>{t.addReply || 'Antwoord toevoegen'}</Label>
                <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)}
                  className="rounded-2xl border-0 min-h-[100px]"
                  style={{ background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(212,175,55,0.2)', color: 'white' }}
                  placeholder={t.writeReply || 'Schrijf hier uw antwoord...'}
                />
                <button onClick={handleSendReply}
                  className="w-full h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #b8860b, #d4af37)', color: '#1a1200' }}
                >
                  <Send className="w-4 h-4" />{t.sendReply || 'Antwoord verzenden'}
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl flex items-center gap-2" style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)' }}>
                <AlertCircle className="w-5 h-5 text-orange-400" />
                <p className="text-sm text-orange-300">
                  {language === 'nl' ? 'Kan niet antwoorden op dit bericht omdat het is opgelost. Open een nieuw bericht.' : 'Impossible de répondre à ce message car il est résolu. Ouvrez un nouveau message.'}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
