export const marketingOrigin = 'https://jouww.com';
export const marketingLocales = ['fr', 'nl', 'ar'] as const;
export const marketingTopics = ['fleet', 'shifts', 'invoicing'] as const;

export type MarketingLocale = (typeof marketingLocales)[number];
export type MarketingTopic = (typeof marketingTopics)[number];

type Benefit = { title: string; text: string };
type Question = { question: string; answer: string };
export type SolutionCopy = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  introduction: string;
  benefits: [Benefit, Benefit, Benefit];
  steps: [string, string, string];
  questions: [Question, Question];
};
type LocaleCopy = {
  name: string;
  hubTitle: string;
  hubDescription: string;
  hubIntroduction: string;
  learnMore: string;
  overview: string;
  stepsTitle: string;
  questionsTitle: string;
  nextTitle: string;
  homeLabel: string;
  companyLink: string;
  caution: string;
  solutions: Record<MarketingTopic, SolutionCopy>;
};

export const marketingCopy: Record<MarketingLocale, LocaleCopy> = {
  fr: {
    name: 'Français',
    hubTitle: 'Solutions pour les entreprises de taxi en Belgique',
    hubDescription: 'Découvrez les outils JOUW DRIVER pour organiser une entreprise de taxi, suivre les services des chauffeurs et consulter la facturation.',
    hubIntroduction: 'Une activité de taxi repose sur des informations fiables : chauffeurs, véhicules, trajets, services et documents. Découvrez comment organiser ces tâches dans un espace de travail commun.',
    learnMore: 'Découvrir cette solution',
    overview: 'En pratique',
    stepsTitle: 'Un déroulement simple',
    questionsTitle: 'Questions fréquentes',
    nextTitle: 'Explorer les autres solutions',
    homeLabel: 'Accueil',
    companyLink: 'Inscrire une entreprise',
    caution: 'Les fonctionnalités et intégrations externes dépendent de leur configuration. JOUW DRIVER ne garantit pas, à lui seul, une conformité ou une homologation réglementaire.',
    solutions: {
      fleet: {
        slug: 'gestion-entreprise-taxi',
        eyebrow: 'Gestion de société de taxi',
        title: 'Organiser votre entreprise de taxi au même endroit',
        description: 'Gestion de société de taxi en Belgique : chauffeurs, véhicules, trajets et accès adaptés aux rôles, avec JOUW DRIVER.',
        introduction: 'Entre les chauffeurs sur le terrain et les personnes qui gèrent la société, les mêmes informations doivent rester compréhensibles. JOUW DRIVER réunit des espaces distincts pour consulter l’équipe, les véhicules, les trajets et les documents de l’activité.',
        benefits: [
          { title: 'Équipe et véhicules', text: 'Retrouvez les chauffeurs et les véhicules dans un espace de gestion, avec des demandes de changement soumises à validation administrative.' },
          { title: 'Visibilité sur les trajets', text: 'Consultez les trajets et leurs informations depuis le portail selon vos droits, sans confondre les données d’une société avec celles d’une autre.' },
          { title: 'Accès selon le rôle', text: 'Distinguez les espaces du chauffeur, de l’entreprise et de l’administration pour travailler avec les informations utiles.' },
        ],
        steps: ['Créer une demande d’inscription pour votre société.', 'Faire examiner la demande et configurer les accès.', 'Consulter les chauffeurs, véhicules et trajets dans votre espace.'],
        questions: [
          { question: 'Un chauffeur peut-il accéder aux données de toute l’entreprise ?', answer: 'Le portail prévoit des espaces et des droits distincts. Les données affichées dépendent du compte et des autorisations attribuées.' },
          { question: 'Faut-il remplacer tous les outils existants ?', answer: 'Non. Les possibilités d’importation ou de connexion dépendent des intégrations configurées. Vérifiez leur état avant de les utiliser dans votre processus.' },
        ],
      },
      shifts: {
        slug: 'suivi-services-chauffeurs',
        eyebrow: 'Services des chauffeurs',
        title: 'Suivre les services et les relevés de compteur des chauffeurs',
        description: 'Suivi des services de chauffeurs de taxi : début, pause, reprise, fin et relevés de compteur déclarés par le chauffeur.',
        introduction: 'Un service ne se résume pas à une liste de courses. Il commence avec un relevé de compteur, comprend des changements d’état et se termine avec un second relevé. Cet historique permet de relire les informations déclarées.',
        benefits: [
          { title: 'Début et fin explicites', text: 'Le chauffeur déclare les valeurs du compteur au début et à la fin du service. Elles ne sont pas devinées à partir du GPS.' },
          { title: 'Pause sans clôture', text: 'Une pause peut être enregistrée puis le service repris, sans créer artificiellement un nouveau service.' },
          { title: 'Document distinct', text: 'Un relevé de service en PDF néerlandais est séparé des factures adressées aux clients.' },
        ],
        steps: ['Démarrer le service et saisir la valeur du compteur.', 'Déclarer les pauses et reprendre le service au besoin.', 'Terminer avec la valeur finale et consulter le relevé.'],
        questions: [
          { question: 'Le GPS calcule-t-il automatiquement le kilométrage du compteur ?', answer: 'Non. Les relevés du compteur sont saisis explicitement par le chauffeur.' },
          { question: 'Le relevé de service remplace-t-il un document officiel ?', answer: 'Non. Les exigences varient selon les autorités et la région. Vérifiez les obligations applicables à votre activité.' },
        ],
      },
      invoicing: {
        slug: 'facturation-entreprise-taxi',
        eyebrow: 'Documents et facturation',
        title: 'Garder les documents et la facturation de taxi organisés',
        description: 'Consultez les factures, les contrats et les documents liés aux activités de taxi dans des espaces dédiés, avec JOUW DRIVER.',
        introduction: 'Les contrats, les factures et les relevés de travail n’ont pas le même usage. Les séparer facilite la vérification de chaque pièce et évite de mélanger la facturation des clients avec le suivi des chauffeurs.',
        benefits: [
          { title: 'Documents séparés', text: 'Le relevé de service du chauffeur reste indépendant de la facture du client.' },
          { title: 'Consultation des factures', text: 'Les espaces de gestion permettent de consulter et de contrôler les documents de facturation selon les autorisations.' },
          { title: 'Contrats et historique', text: 'Les contrats et les échéances d’abonnement disposent de leurs propres parcours, distincts des courses.' },
        ],
        steps: ['Vérifier les informations associées aux trajets ou au contrat.', 'Consulter les documents dans l’espace approprié.', 'Contrôler les montants et la situation avant tout envoi ou règlement.'],
        questions: [
          { question: 'Les relevés des chauffeurs sont-ils ajoutés aux factures clients ?', answer: 'Non. Le relevé de service est un document distinct et ne constitue pas une ligne supplémentaire sur la facture du client.' },
          { question: 'Les documents sont-ils automatiquement envoyés par e-mail ?', answer: 'L’envoi dépend de la configuration et de la disponibilité du service de messagerie. Une facture consultable ne prouve pas son envoi.' },
        ],
      },
    },
  },
  nl: {
    name: 'Nederlands',
    hubTitle: 'Oplossingen voor taxibedrijven in België',
    hubDescription: 'Ontdek JOUW DRIVER voor taxibedrijven: chauffeurs en voertuigen beheren, diensten registreren en factuurdocumenten bekijken.',
    hubIntroduction: 'Een taxibedrijf werkt met chauffeurs, voertuigen, ritten, diensten en documenten. Ontdek hoe u deze informatie overzichtelijk houdt met aparte toegang voor chauffeurs, bedrijven en beheerders.',
    learnMore: 'Bekijk deze oplossing',
    overview: 'In de praktijk',
    stepsTitle: 'Zo verloopt het',
    questionsTitle: 'Veelgestelde vragen',
    nextTitle: 'Andere oplossingen ontdekken',
    homeLabel: 'Startpagina',
    companyLink: 'Bedrijf registreren',
    caution: 'De werking van externe koppelingen hangt af van hun configuratie. JOUW DRIVER garandeert op zichzelf geen wettelijke goedkeuring of naleving van alle taxivoorschriften.',
    solutions: {
      fleet: {
        slug: 'taxibedrijf-beheren',
        eyebrow: 'Taxibedrijf beheren',
        title: 'Uw taxibedrijf overzichtelijk beheren',
        description: 'Taxibedrijf beheren in België: chauffeurs, voertuigen, ritten en toegangsrechten in een gezamenlijke werkruimte.',
        introduction: 'De chauffeur is onderweg, terwijl het bedrijf de dagelijkse werking opvolgt. Duidelijke gegevens en rollen helpen beide kanten samenwerken. JOUW DRIVER bundelt de toegang tot chauffeurs, voertuigen, ritten en werkdocumenten.',
        benefits: [
          { title: 'Chauffeurs en voertuigen', text: 'Bekijk gegevens van uw team en vloot. Verzoeken om chauffeurs of voertuigen te wijzigen worden aan de beheerder voorgelegd.' },
          { title: 'Overzicht van ritten', text: 'Raadpleeg ritinformatie in het bedrijfsportaal volgens de rechten van uw account.' },
          { title: 'Gescheiden toegangsrollen', text: 'Chauffeurs, bedrijven en beheerders gebruiken verschillende ingangen en zien informatie die past bij hun rol.' },
        ],
        steps: ['Dien een aanvraag in om uw bedrijf te registreren.', 'Laat de aanvraag beoordelen en richt de toegangen in.', 'Bekijk chauffeurs, voertuigen en ritten in het bedrijfsportaal.'],
        questions: [
          { question: 'Ziet iedere chauffeur alle bedrijfsgegevens?', answer: 'Nee. Welke gegevens zichtbaar zijn, hangt af van de rol en de aan het account toegekende rechten.' },
          { question: 'Zijn externe taxiplatformen meteen gekoppeld?', answer: 'Niet noodzakelijk. Koppelingen moeten afzonderlijk worden ingesteld en gecontroleerd voordat u ze kunt gebruiken.' },
        ],
      },
      shifts: {
        slug: 'chauffeursdiensten-registreren',
        eyebrow: 'Dienstregistratie',
        title: 'Diensten en tellerstanden van taxichauffeurs registreren',
        description: 'Diensten van taxichauffeurs registreren met begin- en eindstand, pauze en hervatting, plus een afzonderlijke dienststaat.',
        introduction: 'Een dienst heeft een begin, een eventuele pauze en een einde. Door de tellerstanden expliciet op te geven, blijft duidelijk welke waarden de chauffeur werkelijk heeft ingevoerd en welke ritten bij de dienst horen.',
        benefits: [
          { title: 'Tellerstand bij start en einde', text: 'De chauffeur voert de begin- en eindstand zelf in. GPS wordt niet gebruikt om die standen te raden.' },
          { title: 'Pauzeren en hervatten', text: 'Een rustperiode onderbreekt de dienst zonder hem af te sluiten.' },
          { title: 'Aparte dienststaat', text: 'Een Nederlandstalige PDF-dienststaat staat los van de facturen voor passagiers.' },
        ],
        steps: ['Start de dienst en vul de tellerstand in.', 'Registreer een pauze en hervat wanneer nodig.', 'Sluit de dienst af en bekijk de dienststaat.'],
        questions: [
          { question: 'Wordt de tellerstand automatisch met GPS berekend?', answer: 'Nee, de chauffeur geeft deze kilometerstand zelf op.' },
          { question: 'Is deze dienststaat automatisch rechtsgeldig voor elke gemeente?', answer: 'Nee. Welke documenten verplicht zijn, hangt af van de bevoegde overheid. Controleer de vereisten voor uw vergunning.' },
        ],
      },
      invoicing: {
        slug: 'taxi-facturatie-documenten',
        eyebrow: 'Facturen en documenten',
        title: 'Facturen en bedrijfsdocumenten gescheiden houden',
        description: 'Beheer het overzicht van taxifacturen, contracten en documenten zonder chauffeursdiensten met klantenfacturen te verwarren.',
        introduction: 'Een klantenfactuur, een abonnementsovereenkomst en een dienststaat horen bij verschillende processen. Door ze apart te raadplegen, wordt controle gemakkelijker voor het bedrijf en de administratie.',
        benefits: [
          { title: 'Dienststaten apart', text: 'Diensten van chauffeurs worden niet als extra onderdeel aan een klantenfactuur toegevoegd.' },
          { title: 'Facturen raadplegen', text: 'Bevoegde gebruikers kunnen factuurgegevens en documenten binnen hun eigen werkruimte bekijken.' },
          { title: 'Eigen contractproces', text: 'Abonnementscontracten en betaaltermijnen staan los van de ritadministratie.' },
        ],
        steps: ['Controleer de rit- of contractgegevens.', 'Open het bijbehorende document in het juiste onderdeel.', 'Controleer de status en gegevens vóór verzending of betaling.'],
        questions: [
          { question: 'Verschijnt een dienststaat op de factuur van een klant?', answer: 'Nee. De dienststaat van de chauffeur wordt afzonderlijk behandeld.' },
          { question: 'Worden alle documenten automatisch gemaild?', answer: 'Niet standaard. Versturen hangt af van de ingestelde e-maildienst en de betreffende actie. Een document dat bestaat, is niet noodzakelijk verzonden.' },
        ],
      },
    },
  },
  ar: {
    name: 'العربية',
    hubTitle: 'حلول لإدارة شركات التاكسي في بلجيكا',
    hubDescription: 'تعرّف على أدوات JOUW DRIVER لتنظيم السائقين والمركبات والورديات ومستندات الفوترة لشركات التاكسي في بلجيكا.',
    hubIntroduction: 'تحتاج شركة التاكسي إلى متابعة السائقين والمركبات والرحلات والورديات والوثائق. تساعدك المساحات المخصصة لكل دور على مراجعة العمل ومشاركة المعلومات بشكل منظم.',
    learnMore: 'اكتشف هذا الحل',
    overview: 'كيف يساعدك النظام',
    stepsTitle: 'خطوات العمل',
    questionsTitle: 'أسئلة شائعة',
    nextTitle: 'حلول أخرى',
    homeLabel: 'الرئيسية',
    companyLink: 'تسجيل شركة',
    caution: 'التكاملات الخارجية تتطلب إعداداً وتحققاً منفصلين. استخدام JOUW DRIVER وحده لا يعني حصول الشركة على موافقة تنظيمية أو استيفاء جميع الشروط القانونية.',
    solutions: {
      fleet: {
        slug: 'taxi-company-management',
        eyebrow: 'إدارة شركة التاكسي',
        title: 'إدارة السائقين والمركبات والرحلات من مكان واحد',
        description: 'نظّم بيانات شركة التاكسي والسائقين والمركبات والرحلات في بلجيكا مع صلاحيات مخصصة لكل مستخدم.',
        introduction: 'بين السائق على الطريق وإدارة الشركة، من المهم أن تكون البيانات واضحة ويمكن الرجوع إليها. يجمع JOUW DRIVER مساحات مخصصة لإدارة الفريق والمركبات والاطلاع على الرحلات والوثائق المرتبطة بالعمل.',
        benefits: [
          { title: 'تنظيم الفريق والمركبات', text: 'راجع ملفات السائقين والمركبات وطلبات إضافتها أو تعديلها، مع إرسال التغييرات التي تتطلب موافقة إلى الإدارة.' },
          { title: 'متابعة الرحلات', text: 'اطلع على معلومات الرحلات من بوابة الشركة وفق الصلاحيات الممنوحة للحساب.' },
          { title: 'فصل الأدوار', text: 'بوابات وصلاحيات مختلفة للسائق وصاحب الشركة والإدارة، لتحديد المعلومات التي يستطيع كل طرف الوصول إليها.' },
        ],
        steps: ['قدّم طلب تسجيل شركتك.', 'تُراجع الإدارة الطلب وتُضبط صلاحيات الوصول.', 'ابدأ بمراجعة السائقين والمركبات والرحلات من مساحة شركتك.'],
        questions: [
          { question: 'هل يشاهد السائق بيانات جميع الشركات؟', answer: 'لا، يعتمد الوصول على حساب المستخدم والصلاحيات الخاصة به.' },
          { question: 'هل تتصل جميع المنصات الخارجية تلقائياً؟', answer: 'لا، يجب إعداد كل تكامل والتحقق من حالته قبل الاعتماد عليه.' },
        ],
      },
      shifts: {
        slug: 'driver-shift-management',
        eyebrow: 'إدارة الورديات',
        title: 'تسجيل ورديات السائق وقراءات العداد بشكل واضح',
        description: 'ابدأ وردية السائق بقراءة العداد، وسجّل الاستراحة والاستئناف ثم أنهِ الوردية بقراءة نهائية وكشف مستقل.',
        introduction: 'الوردية ليست مجرد مجموع الرحلات. تبدأ بقراءة عداد صريحة، وقد تتضمن استراحة، ثم تنتهي بقراءة جديدة. هذا التسلسل يسهّل مراجعة بيانات الدوام التي أدخلها السائق.',
        benefits: [
          { title: 'قراءة العداد عند البداية والنهاية', text: 'يسجّل السائق القراءات بنفسه ولا يتم تقديرها تلقائياً عبر GPS.' },
          { title: 'استراحة دون إنهاء الوردية', text: 'يمكن إيقاف العمل مؤقتاً ثم استئنافه مع الاحتفاظ بسجل الوردية.' },
          { title: 'كشف وردية مستقل', text: 'يمكن مراجعة كشف PDF باللغة الهولندية بشكل منفصل عن فواتير العملاء.' },
        ],
        steps: ['اضغط بدء الوردية وأدخل قراءة العداد.', 'اختر الاستراحة والاستئناف عند الحاجة.', 'أنه الوردية بإدخال القراءة النهائية وراجع الكشف.'],
        questions: [
          { question: 'هل يحتسب التطبيق قراءة العداد باستخدام GPS؟', answer: 'لا. قراءة عداد المركبة يُدخلها السائق بشكل صريح.' },
          { question: 'هل كشف الوردية بديل تلقائي عن كل الوثائق الرسمية؟', answer: 'لا. يجب التأكد من متطلبات البلدية أو الجهة المختصة حسب منطقة العمل.' },
        ],
      },
      invoicing: {
        slug: 'taxi-invoices-documents',
        eyebrow: 'الفواتير والوثائق',
        title: 'نظّم فواتير التاكسي والعقود والوثائق دون خلطها',
        description: 'حل لتنظيم وعرض فواتير الشركات ووثائق الاشتراك وكشوف الورديات بشكل مستقل عن بعضها.',
        introduction: 'فاتورة العميل وعقد الاشتراك وكشف وردية السائق مستندات مختلفة في الهدف والمحتوى. فصلها في النظام يساعد الإدارة على مراجعة المستند الصحيح والحالة المرتبطة به.',
        benefits: [
          { title: 'فواتير العملاء مستقلة', text: 'لا تتحول ورديات السائق إلى بنود مضافة على فاتورة العميل.' },
          { title: 'مراجعة المستندات', text: 'يمكن للمستخدم المخوّل الاطلاع على مستندات الفوترة والتفاصيل حسب صلاحياته.' },
          { title: 'عقود منفصلة', text: 'يملك عقد الاشتراك ومواعيد دفعاته مسار متابعة مختلفاً عن الرحلات اليومية.' },
        ],
        steps: ['راجع بيانات الرحلة أو العقد المطلوب.', 'افتح المستند من القسم المخصص له.', 'تحقق من التفاصيل وحالة الدفع أو الإرسال قبل اتخاذ الإجراء.'],
        questions: [
          { question: 'هل تظهر ورديات السائق على فاتورة الزبون؟', answer: 'لا. كشف الوردية مستند مستقل عن فاتورة العميل.' },
          { question: 'هل إرسال الفواتير عبر البريد مضمون تلقائياً؟', answer: 'تعتمد عملية الإرسال على ضبط مزوّد البريد وتنفيذ الإجراء. وجود الفاتورة في النظام لا يعني أنها أُرسلت بالفعل.' },
        ],
      },
    },
  },
};

export function isMarketingLocale(value: string): value is MarketingLocale {
  return marketingLocales.some((locale) => locale === value);
}

export function solutionHref(locale: MarketingLocale, topic: MarketingTopic): string {
  return '/' + locale + '/solutions/' + marketingCopy[locale].solutions[topic].slug;
}

export function hubHref(locale: MarketingLocale): string {
  return '/' + locale + '/solutions';
}

export function findSolution(locale: MarketingLocale, slug: string): MarketingTopic | null {
  return marketingTopics.find((key) => marketingCopy[locale].solutions[key].slug === slug) ?? null;
}

export function languageAlternates(topic?: MarketingTopic): Record<string, string> {
  const path = (locale: MarketingLocale) => topic ? solutionHref(locale, topic) : hubHref(locale);
  return {
    'fr-BE': path('fr'),
    'nl-BE': path('nl'),
    'ar': path('ar'),
    ...(topic ? {} : { 'x-default': '/' }),
  };
}
