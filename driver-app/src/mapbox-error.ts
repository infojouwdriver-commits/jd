export function mapboxErrorMessage(payload?:{type?:string;error?:string;message?:string}) {
 const text=payload?.error??payload?.message??'';
 if(/\b(401|403)\b|unauthori[sz]ed|forbidden|access token|not authori[sz]ed/i.test(text))return 'رفض Mapbox مفتاح هذه النسخة. يلزم إعداد مفتاح للتطبيق الأصلي ثم تحديث التطبيق.';
 if(/network|connection|timeout|resolve host|offline/i.test(text))return 'تعذّر الاتصال بخدمة الخريطة. تحقق من اتصال الهاتف ثم أعد المحاولة.';
 return 'تعذّر تحميل الخريطة. أعد المحاولة؛ قياس الرحلة مستقل عن تحميلها.';
}
