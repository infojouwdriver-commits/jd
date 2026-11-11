import type { MarketingLocale } from './marketing-content';
import { calculatorText } from './marketing-resources';
import type { calculateSettlement } from './public-driver-settlement';

export async function downloadSettlement(locale: MarketingLocale, driver: string, d: ReturnType<typeof calculateSettlement>) {
  const { jsPDF } = await import('jspdf');
  const t = (key: string) => calculatorText(locale, key);
  const regional = () => locale === 'nl' ? 'nl-BE' : 'fr-BE';
  const currency = new Intl.NumberFormat(regional(), { style: 'currency', currency: 'EUR' });
  const percentages = new Intl.NumberFormat(regional(), { style: 'percent', maximumFractionDigits: 2 });
  const money = (value: number) => currency.format(value / 100);
  const rate = (value: number) => '\u2066' + percentages.format(value / 10000) + '\u2069';

    const canvas = document.createElement('canvas');
    canvas.width = 1240; canvas.height = 1754;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas unavailable');
    const ctx = context;
    const navy = '#122238', gold = '#efd59d', ink = '#18263a';
    function box(x: number,y: number,w: number,h: number,color: string) { ctx.fillStyle=color; ctx.fillRect(x,y,w,h); }
    function text(value: string,x: number,y: number,{size=28,bold=false,color=ink,rtl=locale==='ar',right=true,width=1030}={}) {
      ctx.font = (bold ? '700 ' : '400 ') + size + 'px "Noto Sans Arabic", "DejaVu Sans", Arial, sans-serif';
      ctx.textBaseline='middle'; ctx.textAlign='left'; ctx.direction=rtl?'rtl':'ltr'; ctx.fillStyle=color;
      const actual=ctx.measureText(value).width, scale=actual>width?width/actual:1;
      ctx.save();ctx.translate(right?x-actual*scale:x,y);ctx.scale(scale,1);ctx.fillText(value,0,0);ctx.restore();
    }
    const amount = (value: number,x: number,y: number,options: Parameters<typeof text>[3] = {})=>text(money(value),x,y,{rtl:false,width:300,...options});
    box(0,0,1240,1754,'#fff'); box(0,0,1240,240,navy); box(0,240,1240,8,'#c39e55');
    text('JOUW DRIVER',1160,67,{size:26,bold:true,color:gold,rtl:false});
    text(t('كشف مستحقات السائق'),1160,145,{size:57,bold:true,color:'#fff'});
    text(t('تفصيل الدخل والنقد والمصاريف'),1160,202,{size:27,color:'#e0e7f0'});
    text(t('اسم السائق'),1160,309); text(driver,1160,365,{size:39,bold:true,width:720});
    text(t('تاريخ إنشاء التقرير'),80,309,{size:24,right:false});
    text(new Intl.DateTimeFormat(regional(),{timeZone:'Europe/Brussels'}).format(new Date()),80,365,{rtl:false,right:false});
    text(t('تفاصيل الدخل حسب المنصة'),1160,454,{size:36,bold:true});
    box(80,500,1080,65,navy);
    for(const [label,x] of ([[t('المنصة'),1125],[t('الدخل الإجمالي'),735],[t('النقد المقبوض'),375]] as [string, number][])) text(label,x,532,{size:25,bold:true,color:'#fff'});
    for(const [i,line] of [...d.rows,{platform:t('الإجمالي'),income:d.income,cash:d.cash}].entries()){
      const y=565+i*65, total=i===d.rows.length;
      box(80,y,1080,65,total?'#e4eaf2':i%2?'#fff':'#f1f4f8');
      text(line.platform,1125,y+32,{bold:true,rtl:total && locale==='ar'});
      amount(line.income,735,y+32,{bold:total}); amount(line.cash,375,y+32,{bold:total});
    }
    text(t('تفاصيل التسوية'),1160,956,{size:36,bold:true});
    const breakdown: [string, number][] = [
      [t('حصة السائق من الدخل')+' ('+rate(d.share)+')',d.gross],[t('إجمالي تكلفة الوقود'),d.fuel],
      [t('حصة السائق من الوقود')+' ('+rate(d.fuelShare)+')',d.driverFuel],
      [t('حصة الشركة من الوقود')+' ('+rate(10000-d.fuelShare)+')',d.companyFuel],
      [t('النقد المقبوض المخصوم من رصيد السائق'),d.cash],[t('المصاريف الأخرى'),d.expenses]
    ];
    for(const [i,[label,value]] of breakdown.entries()){
      const y=990+i*66;
      box(80,y+65,1080,1,'#d5dde7'); text(label,1150,y+32,{width:730}); amount(value,110,y+32,{right:false,bold:true});
    }
    box(80,1420,1080,135,navy);
    text(t(d.balance < 0 ? 'المبلغ المستحق على السائق' : 'صافي مستحقات السائق'),1120,1487,{size:34,bold:true,color:'#fff',width:630});
    amount(Math.abs(d.balance),120,1487,{size:47,bold:true,color:d.balance<0?'#ffb8ae':gold,right:false});
    text(t('الصافي = حصة الدخل − النقد المقبوض − حصة الوقود − المصاريف الأخرى'),1160,1610,{size:24});
    box(80,1670,1080,1,'#d5dde7'); text('jouww.com',80,1708,{size:23,rtl:false,right:false});
    const pdf = new jsPDF({ format: 'a4', unit: 'mm' });
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 210, 297);
    pdf.save('JOUW-DRIVER-Settlement.pdf');
}
