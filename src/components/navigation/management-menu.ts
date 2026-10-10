import { Building2, Users, Car, MapPin, Settings, Bell, MessageSquare, ShieldCheck, UserCog, CheckCircle, Shield, Megaphone, TestTube } from 'lucide-react';

/** One route catalog shared by the workspace and dashboard. */
export const managementMenu = [
  { title: 'الشركات', description: 'الحسابات والعقود والأسعار', icon: Building2, href: '/admin/companies', group: 'التشغيل' },
  { title: 'السائقون', description: 'الملفات والصلاحيات والمركبات', icon: Users, href: '/admin/drivers', group: 'التشغيل' },
  { title: 'المركبات', description: 'الأسطول وتعيين السيارات', icon: Car, href: '/admin/vehicles', group: 'التشغيل' },
  { title: 'الرحلات', description: 'السجل والأسعار وحالة الإرسال', icon: MapPin, href: '/admin/trips', group: 'التشغيل' },
  { title: 'الإشعارات', description: 'إرسال التحديثات للسائقين', icon: Bell, href: '/admin/notifications', group: 'التواصل' },
  { title: 'الرسائل', description: 'محادثات الشركة والسائقين', icon: MessageSquare, href: '/admin/messages', group: 'التواصل' },
  { title: 'الموزعون', description: 'الحسابات والعمولات', icon: UserCog, href: '/admin/distributors', group: 'الإدارة' },
  { title: 'طلبات الموافقة', description: 'مراجعة التعديلات المطلوبة', icon: CheckCircle, href: '/admin/approval-requests', group: 'الإدارة' },
  { title: 'المستخدمون', description: 'أمان الحسابات وصلاحيات الإدارة', icon: ShieldCheck, href: '/admin/users', group: 'الإدارة' },
  { title: 'الإعلانات', description: 'المحتوى والمساحات الإعلانية', icon: Megaphone, href: '/admin/ad-slots', group: 'الإدارة' },
  { title: 'الخصوصية', description: 'طلبات البيانات وسجل الامتثال', icon: Shield, href: '/admin/gdpr', group: 'الإدارة' },
  { title: 'مزامنة Chiron', description: 'متابعة الإرسال وإعادة المحاولة', icon: Settings, href: '/admin/chiron-sync', group: 'التكامل' },
  { title: 'اختبار Chiron', description: 'التحقق من الرحلات التجريبية', icon: TestTube, href: '/admin/test-trips', group: 'التكامل' },
];
