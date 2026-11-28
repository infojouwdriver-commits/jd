export const legalSlugs = ['terms', 'privacy', 'cookies', 'distance-sales'] as const;
export type LegalSlug = typeof legalSlugs[number];
export const legalLocales = ['fr', 'nl', 'ar'] as const;
export type LegalLocale = typeof legalLocales[number];

export const legalTitles = {
 fr: ['Conditions d’utilisation', 'Politique de confidentialité', 'Politique relative aux cookies', 'Informations précontractuelles et vente à distance'],
 nl: ['Gebruiksvoorwaarden', 'Privacybeleid', 'Cookiebeleid', 'Precontractuele informatie en verkoop op afstand'],
 ar: ['شروط الخدمة', 'سياسة الخصوصية', 'سياسة ملفات تعريف الارتباط', 'معلومات ما قبل التعاقد والبيع عن بُعد'],
} as const;

export const legalSections: Record<LegalLocale, Record<LegalSlug, [string, string][]>> = {
 fr: {
  terms: [
   ['La plateforme', 'JOUW DRIVER propose aux professionnels du taxi des outils de gestion des chauffeurs, véhicules, courses, services et factures. Les fonctionnalités disponibles dépendent du compte et des intégrations configurées.'],
   ['Comptes et usage', 'Gardez vos identifiants personnels et signalez tout accès suspect. L’exploitant vérifie ses données, ses autorisations et le résultat des déclarations. La disponibilité d’un outil de préparation ne prouve pas la réception d’une déclaration officielle.'],
   ['Estimations et assistance', 'Les itinéraires, durées et données de circulation sont indicatifs. Utilisez la page Contact pour signaler une anomalie ou demander de l’aide. Les modalités commerciales de l’abonnement figurent dans la fiche précontractuelle et dans l’offre soumise à signature.'],
  ],
  privacy: [
   ['Compte et activité', 'Nous utilisons les coordonnées du compte, les données professionnelles, les courses et la facturation pour fournir le service ou, lorsque votre société est cliente, pour notre intérêt légitime à gérer les accès et les opérations demandées. Les contrôles de sécurité protègent la plateforme. Les données exigées par la loi sont traitées pour respecter ces obligations. Les informations peuvent aussi provenir de votre exploitant. Sans les données nécessaires au compte ou à la course, la fonction correspondante ne peut pas être fournie.'],
   ['Localisation et destinataires', 'Les fonctions de trajet utilisent la localisation avec l’autorisation de l’appareil. Les outils concernés transmettent des requêtes à Mapbox, Photon/OpenStreetMap, Nominatim ou BigDataCloud. Les services configurés peuvent transmettre des déclarations à Chiron, envoyer des e-mails via notre prestataire et ouvrir le paiement chez Stripe. L’exploitant et les équipes habilitées accèdent aux données selon leur rôle. L’hébergement utilise OVHcloud.'],
   ['Documents et conservation', 'La preuve de signature peut comprendre l’identité déclarée, l’e-mail, l’horodatage, l’adresse IP et l’empreinte du document. Les données sont conservées pendant l’utilisation du compte, puis selon les obligations applicables, la finalité et les délais nécessaires à la défense de droits. Contactez-nous pour connaître les garanties applicables à un éventuel transfert hors EEE.'],
   ['Vos droits', 'Demandez l’accès, la rectification, l’effacement, la limitation, l’opposition ou la portabilité selon les conditions du RGPD. Vous pouvez retirer un consentement à tout moment et introduire une plainte auprès de l’Autorité de protection des données belge. Le centre de confidentialité permet aussi d’obtenir votre relevé et de déposer une demande.'],
  ],
  cookies: [
   ['Session et préférences', 'La session authentifiée et ses mécanismes de sécurité nécessitent des cookies. Le choix de confidentialité est conservé dans le stockage du navigateur et, lorsque disponible, dans le cookie gdpr_cookie_consent pendant 180 jours. Le stockage local peut également conserver la langue et les réglages demandés.'],
   ['Votre choix', 'Les catégories facultatives sont désactivées par défaut. Vous pouvez revoir vos choix ou retirer votre consentement depuis les préférences de cette page.'],
  ],
  'distance-sales': [
   ['Offre professionnelle', 'L’abonnement logiciel s’adresse aux exploitants professionnels. Il donne accès aux outils décrits dans l’offre et aux fonctions disponibles pour le compte concerné. Consultez les éléments de votre commande puis signez l’offre pour conclure le contrat.'],
   ['Prix et durée', 'L’offre annuelle standard prévoit douze mensualités de 50 € TTC (TVA belge de 21 %), soit 600 € TTC au total, sans reconduction automatique. La facture indique les modalités de paiement disponibles et l’échéance. Consultez le contrat avant signature pour les conditions d’accès, les dates et la fin de l’abonnement.'],
   ['Demandes et rétractation', 'Contactez-nous pour une question de facturation, d’exécution ou de réclamation. Si vous contractez en qualité de consommateur et que le régime légal de vente à distance s’applique, le droit de rétractation légal est en principe de 14 jours après la conclusion d’un contrat de services. Adressez votre décision sans ambiguïté au contact indiqué ci-dessous. Les exceptions et règles de commencement anticipé dépendent du contrat et de la loi.'],
  ],
 },
 nl: {
  terms: [
   ['Het platform', 'JOUW DRIVER biedt taxiprofessionals software voor chauffeurs, voertuigen, ritten, diensten en facturen. Beschikbare functies hangen af van het account en de ingestelde koppelingen.'],
   ['Toegang en gebruik', 'Houd uw inloggegevens persoonlijk en meld verdachte toegang. De exploitant controleert gegevens, vergunningen en de uitkomst van aangiften. De mogelijkheid een aangifte voor te bereiden bewijst geen ontvangst door de overheid.'],
   ['Ramingen en ondersteuning', 'Routes, reistijden en verkeersgegevens zijn indicatief. Meld fouten of vraag hulp via Contact. De commerciële bepalingen staan in de precontractuele informatie en het aanbod dat u ondertekent.'],
  ],
  privacy: [
   ['Account en activiteit', 'Wij verwerken contactgegevens, beroepsgegevens, ritten en facturatie om de dienst te leveren of, wanneer uw onderneming klant is, vanuit ons gerechtvaardigd belang om toegang en aangevraagde activiteiten te beheren. Beveiliging beschermt het platform. Wettelijk vereiste gegevens worden voor die verplichtingen verwerkt. Gegevens kunnen ook van uw exploitant komen. Zonder verplichte account- of ritgegevens werkt de betrokken functie niet.'],
   ['Locatie en ontvangers', 'Ritfuncties gebruiken locatie met toestemming op het toestel. Kaartfuncties kunnen gegevens doorgeven aan Mapbox, Photon/OpenStreetMap, Nominatim of BigDataCloud. Ingestelde diensten kunnen ritten melden aan Chiron, e-mail via onze leverancier sturen of betalen via Stripe aanbieden. Exploitanten en bevoegde medewerkers hebben toegang volgens hun rol. OVHcloud verzorgt hosting.'],
   ['Documenten en bewaring', 'Bewijs van ondertekening kan de opgegeven identiteit, e-mail, tijd, IP-adres en de vingerafdruk van het document omvatten. Wij bewaren gegevens tijdens het gebruik van het account en daarna volgens wettelijke termijnen, het doel en de noodzakelijke verdediging van rechten. Vraag ons naar de waarborgen voor eventuele doorgifte buiten de EER.'],
   ['Uw rechten', 'U kunt inzage, correctie, wissing, beperking, bezwaar en overdraagbaarheid vragen volgens de AVG. U kunt toestemming intrekken en een klacht indienen bij de Belgische Gegevensbeschermingsautoriteit. In het privacycentrum kunt u uw overzicht downloaden en een verzoek indienen.'],
  ],
  cookies: [
   ['Sessie en voorkeuren', 'Aanmelden en sessiebeveiliging gebruiken noodzakelijke cookies. Uw privacykeuze wordt opgeslagen in de browser en, wanneer beschikbaar, 180 dagen in de cookie gdpr_cookie_consent. Lokale opslag kan ook de taal en gevraagde instellingen onthouden.'],
   ['Uw keuze', 'Optionele categorieën staan standaard uit. U kunt uw keuzes aanpassen of uw toestemming intrekken via de voorkeuren op deze pagina.'],
  ],
  'distance-sales': [
   ['Zakelijk aanbod', 'Het softwareabonnement is bestemd voor professionele exploitanten. Het geeft toegang tot de aangeboden hulpmiddelen en de functies die voor het account beschikbaar zijn. Controleer uw bestelling en onderteken het aanbod om de overeenkomst te sluiten.'],
   ['Prijs en looptijd', 'Het standaardjaarabonnement bestaat uit twaalf maandelijkse termijnen van € 50 inclusief 21% Belgische btw, in totaal € 600, zonder automatische verlenging. De factuur vermeldt de beschikbare betaalwijzen en de vervaldatum. Raadpleeg vóór ondertekening de overeenkomst voor toegang, data en afloop.'],
   ['Vragen en herroeping', 'Neem contact op bij vragen over facturatie, uitvoering of klachten. Sluit u als consument een dienstenovereenkomst waarop de wettelijke regels voor verkoop op afstand van toepassing zijn, dan geldt in beginsel een herroepingstermijn van 14 dagen na sluiting. Meld uw besluit ondubbelzinnig via onderstaande contactgegevens. Uitzonderingen en vervroegde uitvoering volgen de overeenkomst en de wet.'],
  ],
 },
 ar: {
  terms: [
   ['المنصة', 'يوفّر JOUW DRIVER أدوات لمشغّلي سيارات الأجرة لإدارة السائقين والمركبات والرحلات والورديات والفواتير. تختلف الميزات المتاحة حسب الحساب والتكاملات المفعّلة.'],
   ['الحساب والاستخدام', 'حافظ على خصوصية بيانات الدخول وأبلغ عن أي دخول مشبوه. يتحقق المشغّل من البيانات والتراخيص ونتيجة إرسال التصاريح. إمكانية إعداد تصريح لا تثبت استلامه لدى الجهة الرسمية.'],
   ['التقديرات والدعم', 'المسارات والأوقات وحالة المرور تقديرية. استخدم صفحة التواصل للإبلاغ عن مشكلة أو طلب المساعدة. تفاصيل الاشتراك التجارية موجودة في معلومات ما قبل التعاقد والعرض المقدّم للتوقيع.'],
  ],
  privacy: [
   ['الحساب والنشاط', 'نستخدم بيانات الحساب والعمل والرحلات والفواتير لتقديم الخدمة، أو وفق مصلحتنا المشروعة في إدارة الوصول والعمليات المطلوبة عندما تكون شركتك هي العميل. تستخدم المنصة ضوابط أمان لحماية الحسابات وتعالج البيانات المطلوبة قانونًا للوفاء بتلك الالتزامات. قد ترد بيانات من مشغّل الأسطول. غياب البيانات الضرورية يمنع توفير الوظيفة المرتبطة بها.'],
   ['الموقع والجهات المستلمة', 'تستخدم وظائف الرحلات موقع الجهاز بإذنه. قد ترسل وظائف الخرائط طلبات إلى Mapbox أو Photon/OpenStreetMap أو Nominatim أو BigDataCloud. حسب إعدادات الحساب، تُرسل التصاريح إلى Chiron والرسائل عبر مزوّد البريد، ويُفتح الدفع لدى Stripe. يصل المشغّل والموظفون المخوّلون للبيانات وفق صلاحياتهم. يستخدم النظام استضافة OVHcloud.'],
   ['المستندات والاحتفاظ', 'قد يتضمن إثبات التوقيع الاسم المصرّح به والبريد والتوقيت وعنوان IP وبصمة المستند. تُحفظ البيانات أثناء استخدام الحساب وبعده حسب الغرض والالتزامات القانونية والمدد اللازمة للدفاع عن الحقوق. تواصل معنا للاستفسار عن ضمانات أي نقل خارج المنطقة الاقتصادية الأوروبية.'],
   ['حقوقك', 'يمكنك طلب الوصول أو التصحيح أو المحو أو التقييد أو الاعتراض أو نقل البيانات حسب شروط اللائحة العامة لحماية البيانات. يمكنك سحب الموافقة وتقديم شكوى إلى سلطة حماية البيانات البلجيكية. يتيح مركز الخصوصية تنزيل كشف الحساب وتقديم طلب.'],
  ],
  cookies: [
   ['الجلسة والتفضيلات', 'يستخدم تسجيل الدخول وأمان الجلسة ملفات تعريف ارتباط ضرورية. يُحفظ اختيار الخصوصية في تخزين المتصفح، وعند توفره في ملف gdpr_cookie_consent لمدة 180 يومًا. قد يحفظ التخزين المحلي اللغة والإعدادات المطلوبة أيضًا.'],
   ['خياراتك', 'الفئات الاختيارية معطّلة افتراضيًا. يمكنك مراجعة اختياراتك أو سحب الموافقة من إعدادات ملفات تعريف الارتباط في هذه الصفحة.'],
  ],
  'distance-sales': [
   ['العرض المهني', 'اشتراك البرمجيات مخصّص لمشغّلي سيارات الأجرة المهنيين. يتيح استخدام الأدوات الواردة في العرض والوظائف المتاحة للحساب. راجع تفاصيل الطلب ووقّع العرض لإبرام العقد.'],
   ['السعر والمدة', 'العرض السنوي القياسي 12 قسطًا شهريًا بقيمة 50 يورو شامل ضريبة القيمة المضافة البلجيكية 21٪، بإجمالي 600 يورو، ومن دون تجديد تلقائي. تعرض الفاتورة وسائل الدفع المتاحة وتاريخ الاستحقاق. راجع شروط الوصول والتواريخ وانتهاء الاشتراك قبل التوقيع.'],
   ['الاستفسارات والعدول', 'تواصل معنا بشأن الفوترة أو تنفيذ العقد أو الشكاوى. إذا تعاقدت كمستهلك وانطبقت قواعد البيع عن بُعد، فمهلة العدول عن عقد الخدمات تكون من حيث المبدأ 14 يومًا من إبرامه. أبلغنا بقرارك بوضوح باستخدام بيانات التواصل أدناه. تخضع الاستثناءات والبدء المبكر للعقد والقانون.'],
  ],
 },
};
