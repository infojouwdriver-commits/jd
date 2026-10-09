
import CrudOperations from '@/lib/crud-operations';
import { generateAdminUserToken } from '@/lib/auth';

export async function userRegisterCallback(user: {
  id: string;
  email: string;
  role: string;
  user_type?: string;
}): Promise<void> {
  try {
    const adminToken = await generateAdminUserToken();

    // Distributor users don't need a driver profile
    if (user.user_type === 'distributor') {
      void 0;
      return;
    }

    // للسائقين الجدد: لا ننشئ شركة أو سائق مؤقت هنا
    // سيتم إنشاء كل شيء بشكل صحيح عبر /driver-registration API
    // بعد إكمال نموذج التسجيل متعدد الخطوات
    void 0;

  } catch (error) {
    console.error("Operation failed");
  }
}
