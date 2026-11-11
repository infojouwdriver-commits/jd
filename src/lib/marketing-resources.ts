import type { MarketingLocale } from './marketing-content';

export const resourcePages = ['driver-calculator', 'faq', 'flanders-taxi-guide', 'chiron'] as const;
export type ResourcePage = (typeof resourcePages)[number];
export const resourceHref = (locale: MarketingLocale, page: ResourcePage) => `/${locale}/solutions/resources/${page}`;
export const resourceCopy = {
  "ar": {
    "faq": "الأسئلة الشائعة",
    "guide": "دليل فلاندرز",
    "source": "المصدر الرسمي",
    "faqDesc": "أجوبة عن الاشتراك والفواتير والورديات.",
    "guideDesc": "Chiron والترخيص وبطاقة السائق، مع روابط المصادر الرسمية.",
    "questions": [
      [
        "كيف أشترك وأفعّل حساب شركتي؟",
        "قدّم طلب تسجيل الشركة، ثم تابع مراجعة الطلب وتوقيع العقد وفاتورة الشهر الأول."
      ],
      [
        "هل الحاسبة مجانية؟",
        "نعم. تستطيع حساب المستحقات وتحميل كشف PDF مباشرة بدون حساب.",
        "calc"
      ],
      [
        "كيف ينحسب النقد مع حصة السائق؟",
        "أدخل النقد ضمن إجمالي دخل المنصة، ثم سجّله في خانة النقد. يُخصم كامل المبلغ بعد حساب حصة السائق.",
        "calc"
      ],
      [
        "شو الفرق بين فاتورة الرحلة وكشف الوردية؟",
        "فاتورة الرحلة تتعلق برحلة العميل، وكشف الوردية يوثّق فترة عمل السائق."
      ],
      [
        "وين بلاقي معلومات Chiron؟",
        "دليل فلاندرز يجمع رابط التسجيل الرسمي ونقاط البداية للربط.",
        "guide"
      ]
    ],
    "guides": [
      [
        "Chiron وتسجيل الرحلات",
        "شو هو سجل الرحلات، وكيف تبدأ التسجيل والاختبار."
      ],
      [
        "ترخيص شركة تاكسي",
        "خطوات الطلب والوثائق المطلوبة من الشركة."
      ],
      [
        "بطاقة سائق التاكسي",
        "المستندات وخطوات طلب Bestuurderspas."
      ],
      [
        "كشف الوردية وإيصال الرحلة",
        "أين تجد النماذج الرسمية لـ Dienststaat وVervoerbewijs."
      ]
    ]
  },
  "fr": {
    "faq": "Questions fréquentes",
    "guide": "Guide de la Flandre",
    "source": "Source officielle",
    "faqDesc": "Abonnement, factures et services des chauffeurs.",
    "guideDesc": "Chiron, autorisations et carte de chauffeur avec les sources officielles.",
    "questions": [
      [
        "Comment souscrire et activer mon compte entreprise ?",
        "Introduisez la demande de création, puis suivez sa validation, la signature du contrat et la facture du premier mois."
      ],
      [
        "Le calculateur est-il gratuit ?",
        "Oui. Calculez le solde et téléchargez le relevé PDF sans compte.",
        "calc"
      ],
      [
        "Comment les espèces sont-elles traitées ?",
        "Incluez-les dans les recettes de la plateforme et indiquez-les aussi dans la colonne Espèces. Le montant est déduit intégralement après le calcul de la part du chauffeur.",
        "calc"
      ],
      [
        "Quelle différence entre facture et feuille de service ?",
        "La facture concerne la course du client. La feuille de service concerne la période de travail du chauffeur."
      ],
      [
        "Où trouver les informations Chiron ?",
        "Le guide de la Flandre réunit le lien officiel et les premières étapes de la connexion.",
        "guide"
      ]
    ],
    "guides": [
      [
        "Chiron et enregistrement des courses",
        "Le registre des courses, l’inscription et les premiers tests."
      ],
      [
        "Autorisation d’exploiter un taxi",
        "Démarches et documents pour l’entreprise."
      ],
      [
        "Carte de chauffeur de taxi",
        "Documents et démarches pour la Bestuurderspas."
      ],
      [
        "Feuille de service et titre de transport",
        "Où trouver les modèles officiels Dienststaat et Vervoerbewijs."
      ]
    ]
  },
  "nl": {
    "faq": "Veelgestelde vragen",
    "guide": "Gids voor Vlaanderen",
    "source": "Officiële bron",
    "faqDesc": "Abonnementen, facturen en chauffeursdiensten.",
    "guideDesc": "Chiron, vergunningen en bestuurderspas met officiële bronnen.",
    "questions": [
      [
        "Hoe sluit ik een abonnement af en activeer ik mijn bedrijfsaccount?",
        "Dien de registratie van uw bedrijf in en volg de goedkeuring, ondertekening en factuur voor de eerste maand."
      ],
      [
        "Is de calculator gratis?",
        "Ja. Bereken het saldo en download het pdf-overzicht zonder account.",
        "calc"
      ],
      [
        "Hoe wordt contant geld verrekend?",
        "Neem het op in de inkomsten van het platform en vul het ook in bij Contant. Het volledige bedrag wordt na de berekening van het chauffeursaandeel afgetrokken.",
        "calc"
      ],
      [
        "Wat is het verschil tussen een factuur en een dienststaat?",
        "Een factuur betreft de rit van de klant. Een dienststaat betreft de werkperiode van de chauffeur."
      ],
      [
        "Waar vind ik informatie over Chiron?",
        "De gids voor Vlaanderen bevat de officiële link en de eerste stappen voor de aansluiting.",
        "guide"
      ]
    ],
    "guides": [
      [
        "Chiron en ritregistratie",
        "De rittendatabank, aanmelding en eerste tests."
      ],
      [
        "Taxivergunning aanvragen",
        "Stappen en documenten voor de onderneming."
      ],
      [
        "Bestuurderspas voor taxichauffeurs",
        "De aanvraagprocedure en benodigde documenten."
      ],
      [
        "Dienststaat en vervoerbewijs",
        "Waar u de officiële modellen vindt."
      ]
    ]
  }
} satisfies Record<MarketingLocale, {
  faq: string; guide: string; source: string; faqDesc: string; guideDesc: string;
  questions: [string, string, ('calc' | 'guide')?][]; guides: [string, string][];
}>;
const calculatorCopy: Record<string, { fr: string; nl: string }> = {
  "حاسبة مستحقات السائق": {
    "fr": "Calcul du solde chauffeur",
    "nl": "Afrekening voor taxichauffeurs"
  },
  "احسب صافي مستحقات السائق وحمّل كشف PDF مجانًا، بدون اشتراك.": {
    "fr": "Calculez le solde et téléchargez gratuitement le relevé PDF, sans abonnement.",
    "nl": "Bereken het chauffeursaldo en download gratis het pdf-overzicht zonder abonnement."
  },
  "مساحة إعلان تجريبية": {
    "fr": "Emplacement publicitaire de démonstration",
    "nl": "Voorbeeld van een advertentieplaats"
  },
  "اسم السائق": {
    "fr": "Nom du chauffeur",
    "nl": "Naam van de chauffeur"
  },
  "أدخل اسم السائق لتحميل التقرير": {
    "fr": "Saisissez le nom du chauffeur",
    "nl": "Vul de naam van de chauffeur in"
  },
  "المنصة": {
    "fr": "Plateforme",
    "nl": "Platform"
  },
  "الدخل €": {
    "fr": "Recettes €",
    "nl": "Inkomsten €"
  },
  "النقد €": {
    "fr": "Espèces €",
    "nl": "Contant €"
  },
  "الدخل": {
    "fr": "Recettes",
    "nl": "Inkomsten"
  },
  "النقد": {
    "fr": "Espèces",
    "nl": "Contant"
  },
  "الدخل يشمل النقد المقبوض. يُخصم كامل النقد الذي بقي مع السائق بعد حساب حصته.": {
    "fr": "Les recettes incluent les espèces. Le montant conservé par le chauffeur est déduit après calcul de sa part.",
    "nl": "De inkomsten omvatten contant geld. Het bedrag dat de chauffeur behoudt, wordt afgetrokken na de berekening van zijn aandeel."
  },
  "حصة السائق من الدخل %": {
    "fr": "Part chauffeur des recettes %",
    "nl": "Aandeel chauffeur in inkomsten %"
  },
  "إجمالي الوقود €": {
    "fr": "Coût du carburant €",
    "nl": "Totale brandstofkosten €"
  },
  "حصة السائق من الوقود %": {
    "fr": "Part chauffeur du carburant %",
    "nl": "Aandeel chauffeur in brandstof %"
  },
  "مصاريف أخرى على السائق €": {
    "fr": "Autres frais du chauffeur €",
    "nl": "Overige kosten voor chauffeur €"
  },
  "إجمالي الدخل": {
    "fr": "Recettes totales",
    "nl": "Totale inkomsten"
  },
  "إجمالي النقد المخصوم": {
    "fr": "Total des espèces déduites",
    "nl": "Totaal contant ingehouden"
  },
  "حصة السائق قبل الخصومات": {
    "fr": "Part chauffeur avant déductions",
    "nl": "Aandeel chauffeur vóór aftrek"
  },
  "حصة السائق من الوقود": {
    "fr": "Part chauffeur du carburant",
    "nl": "Brandstofaandeel chauffeur"
  },
  "حصة الشركة من الوقود": {
    "fr": "Part entreprise du carburant",
    "nl": "Brandstofaandeel onderneming"
  },
  "المصاريف الأخرى": {
    "fr": "Autres frais",
    "nl": "Overige kosten"
  },
  "صافي مستحقات السائق": {
    "fr": "Net à verser au chauffeur",
    "nl": "Netto te betalen aan chauffeur"
  },
  "المبلغ المستحق على السائق": {
    "fr": "Montant dû par le chauffeur",
    "nl": "Bedrag te betalen door chauffeur"
  },
  "تحميل التقرير PDF": {
    "fr": "Télécharger le relevé PDF",
    "nl": "Download pdf-overzicht"
  },
  "كيف تنحسب التسوية؟": {
    "fr": "Comment se calcule le décompte ?",
    "nl": "Hoe wordt het saldo berekend?"
  },
  "تُحسب نسبة السائق من إجمالي دخل المنصات. بعدها يُخصم النقد اللي قبضه السائق، وحصته من الوقود، والمصاريف المسجّلة عليه. حصة الشركة من الوقود تظهر في الكشف لتوضيح التقسيم.": {
    "fr": "La part du chauffeur est calculée sur le total des recettes. On déduit ensuite les espèces encaissées, sa part du carburant et ses autres frais. La part de l’entreprise figure sur le relevé.",
    "nl": "Het chauffeursaandeel wordt berekend over de totale inkomsten. Daarna worden contant geld, het chauffeursaandeel in de brandstof en overige kosten afgetrokken. Het aandeel van de onderneming staat op het overzicht."
  },
  "أدخل مبالغ من صفر فأعلى ونسبًا بين 0 و100.": {
    "fr": "Saisissez des montants positifs ou nuls et des pourcentages de 0 à 100.",
    "nl": "Voer bedragen vanaf nul en percentages tussen 0 en 100 in."
  },
  "النقد يتجاوز الدخل في: ": {
    "fr": "Les espèces dépassent les recettes pour : ",
    "nl": "Contant is hoger dan de inkomsten voor: "
  },
  "أدخل اسم السائق.": {
    "fr": "Saisissez le nom du chauffeur.",
    "nl": "Vul de naam van de chauffeur in."
  },
  "كشف مستحقات السائق": {
    "fr": "Relevé de décompte chauffeur",
    "nl": "Afrekening chauffeur"
  },
  "تفصيل الدخل والنقد والمصاريف": {
    "fr": "Détail des recettes, espèces et frais",
    "nl": "Overzicht van inkomsten, contant geld en kosten"
  },
  "تاريخ إنشاء التقرير": {
    "fr": "Date du relevé",
    "nl": "Datum van het overzicht"
  },
  "تفاصيل الدخل حسب المنصة": {
    "fr": "Recettes par plateforme",
    "nl": "Inkomsten per platform"
  },
  "الدخل الإجمالي": {
    "fr": "Recettes totales",
    "nl": "Totale inkomsten"
  },
  "النقد المقبوض": {
    "fr": "Espèces encaissées",
    "nl": "Contant ontvangen"
  },
  "الإجمالي": {
    "fr": "Total",
    "nl": "Totaal"
  },
  "تفاصيل التسوية": {
    "fr": "Détail du décompte",
    "nl": "Details van de afrekening"
  },
  "حصة السائق من الدخل": {
    "fr": "Part chauffeur des recettes",
    "nl": "Aandeel chauffeur in inkomsten"
  },
  "إجمالي تكلفة الوقود": {
    "fr": "Coût total du carburant",
    "nl": "Totale brandstofkosten"
  },
  "النقد المقبوض المخصوم من رصيد السائق": {
    "fr": "Espèces déduites du solde du chauffeur",
    "nl": "Contant ingehouden op het chauffeursaldo"
  },
  "الصافي = حصة الدخل − النقد المقبوض − حصة الوقود − المصاريف الأخرى": {
    "fr": "Net = part des recettes − espèces − part carburant − autres frais",
    "nl": "Netto = inkomstenaandeel − contant − brandstofaandeel − overige kosten"
  },
  "مساحة إعلان تجريبية أعلى الصفحة": {
    "fr": "Emplacement publicitaire en haut",
    "nl": "Advertentieplaats bovenaan"
  },
  "مساحة إعلان تجريبية بجانب الحاسبة": {
    "fr": "Emplacement publicitaire latéral",
    "nl": "Advertentieplaats naast de calculator"
  },
  "مساحة إعلان تجريبية أسفل الشرح": {
    "fr": "Emplacement publicitaire en bas",
    "nl": "Advertentieplaats onderaan"
  }
};
export function calculatorText(locale: MarketingLocale, key: string) {
  return locale === 'ar' ? key : calculatorCopy[key]?.[locale] ?? key;
}

export const calculatorDescription = {
  ar: 'احسب حصة سائق التاكسي من دخل Uber وBolt وHeetch والتاكسيمتر بعد خصم النقد والوقود، وحمّل كشف PDF مجانًا.',
  fr: 'Calculez le solde du chauffeur de taxi pour Uber, Bolt, Heetch et le taximètre après déduction des espèces et du carburant. Relevé PDF gratuit.',
  nl: 'Bereken het saldo van een taxichauffeur voor Uber, Bolt, Heetch en de taximeter na aftrek van contant geld en brandstof. Gratis pdf-overzicht.',
};

export const resourceTitles: Record<MarketingLocale, Record<ResourcePage, string>> = {
  ar: { 'driver-calculator': 'حاسبة مستحقات سائق التاكسي', faq: 'الأسئلة الشائعة عن JOUW DRIVER', 'flanders-taxi-guide': 'دليل التاكسي في فلاندرز', chiron: 'Chiron وتسجيل رحلات التاكسي في فلاندرز' },
  fr: { 'driver-calculator': 'Calcul du solde d’un chauffeur de taxi', faq: 'Questions fréquentes sur JOUW DRIVER', 'flanders-taxi-guide': 'Guide du taxi en Flandre', chiron: 'Chiron et enregistrement des courses de taxi en Flandre' },
  nl: { 'driver-calculator': 'Afrekening voor taxichauffeurs berekenen', faq: 'Veelgestelde vragen over JOUW DRIVER', 'flanders-taxi-guide': 'Taxigids voor Vlaanderen', chiron: 'Chiron en ritregistratie voor taxi’s in Vlaanderen' },
};

const taxiSource = 'https://www.vlaanderen.be/mobiliteit-en-openbare-werken/taxi/';
export const taxiGuideSources = ['rittendatabank-chiron', 'vergunning-voor-taxidiensten', 'bestuurderspas-voor-taxichauffeurs', 'vergunning-voor-taxidiensten'].map((path) => taxiSource + path);
export const chironGuide = {
  ar: ['Chiron هو سجل الرحلات المركزي في فلاندرز. يُرسل مشغّل التاكسي بيانات رحلاته إلى السجل.', 'سجّل شركتك أولًا في بيئة الاختبار. جهّز بيانات اتصال الاختبار لمسؤول التقنية عندك.', 'أرسل عشر رسائل اختبار: خمس بدايات وخمس نهايات. راجع رمز الخطأ في دليل الحكومة إذا رفضت رسالة.', 'بعد مرحلة الاختبار، سجّل في بيئة الإنتاج. راجع تأكيد الاستلام لبداية الرحلة ونهايتها.'],
  fr: ['Chiron est la banque de données centrale des courses en Flandre. L’exploitant d’un service de taxi y transmet les informations de ses courses.', 'Inscrivez d’abord votre entreprise dans l’environnement de test. Préparez les identifiants de test pour votre responsable technique.', 'Envoyez dix messages de test : cinq départs et cinq arrivées. En cas de rejet, consultez le code d’erreur dans la documentation officielle.', 'Après les tests, inscrivez-vous dans l’environnement de production. Vérifiez la confirmation de réception du départ et de l’arrivée.'],
  nl: ['Chiron is de centrale rittendatabank van Vlaanderen. Uitbaters van taxidiensten sturen hun ritgegevens naar die databank.', 'Registreer uw bedrijf eerst in de testomgeving. Bezorg de testgegevens aan uw IT-verantwoordelijke.', 'Verstuur tien testberichten: vijf vertrekken en vijf aankomsten. Raadpleeg bij afwijzing de officiële documentatie over de foutcode.', 'Registreer u na het testen in de productieomgeving. Controleer de ontvangstbevestiging voor het vertrek en de aankomst.'],
};
