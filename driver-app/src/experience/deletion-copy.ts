export const deletionCopy = {
  ar: {
    title: 'حذف حسابي', track: 'متابعة طلب الحذف', send: 'تأكيد وإرسال طلب الحذف', refresh: 'تحديث الحالة',
    details: 'تطلب حذف حسابك الشخصي وبياناته. ستُغلق جلساتك عند التنفيذ. تُحفظ السجلات التي يوجب القانون الاحتفاظ بها خلال المدة المقررة. إغلاق الشركة والاشتراك إجراء مستقل.',
    pending: 'تم استلام طلب الحذف', due: 'الحذف المتوقع بحلول', completed: 'اكتمل حذف الحساب',
    receipt: 'رمز المتابعة الخاص', save: 'احفظ هذا الرمز لمتابعة الطلب من شاشة الدخول بعد حذف الحساب.',
    unknown: 'لم نعثر على طلب لهذا الرمز.', password: 'تحقق من كلمة المرور الحالية.', recover: 'استعادة رمز المتابعة',
  },
  fr: {
    title: 'Supprimer mon compte', track: 'Suivre la demande de suppression', send: 'Confirmer et envoyer la demande', refresh: 'Actualiser le statut',
    details: 'Votre compte personnel et ses données seront supprimés et vos sessions seront fermées. Les données soumises à une obligation légale restent conservées pendant la durée requise. La fermeture de l’entreprise et de son abonnement suit une procédure distincte.',
    pending: 'Demande de suppression reçue', due: 'Suppression prévue au plus tard le', completed: 'Compte supprimé',
    receipt: 'Code de suivi privé', save: 'Conservez ce code pour suivre la demande depuis l’écran de connexion après la suppression.',
    unknown: 'Aucune demande ne correspond à ce code.', password: 'Vérifiez votre mot de passe actuel.', recover: 'Récupérer un code de suivi',
  },
  nl: {
    title: 'Mijn account verwijderen', track: 'Verwijderingsverzoek volgen', send: 'Verzoek bevestigen en versturen', refresh: 'Status vernieuwen',
    details: 'Uw persoonlijke account en gegevens worden verwijderd en uw sessies worden beëindigd. Gegevens met een wettelijke bewaarplicht blijven gedurende de vereiste termijn bewaard. Voor de sluiting van het bedrijf en het abonnement geldt een aparte procedure.',
    pending: 'Verwijderingsverzoek ontvangen', due: 'Verwijdering verwacht uiterlijk op', completed: 'Account verwijderd',
    receipt: 'Privé-opvolgcode', save: 'Bewaar deze code om het verzoek na verwijdering vanaf het inlogscherm te volgen.',
    unknown: 'Er is geen verzoek gevonden voor deze code.', password: 'Controleer uw huidige wachtwoord.', recover: 'Opvolgcode herstellen',
  },
  en: {
    title: 'Delete my account', track: 'Track deletion request', send: 'Confirm and send deletion request', refresh: 'Check status',
    details: 'Your personal account and its data will be deleted and your sessions will end. Records subject to a legal retention obligation are kept for the required period. Closing the company and its subscription is a separate process.',
    pending: 'Deletion request received', due: 'Expected deletion by', completed: 'Account deleted',
    receipt: 'Private tracking code', save: 'Save this code to track your request from the sign-in screen after deletion.',
    unknown: 'No request was found for this code.', password: 'Check your current password.', recover: 'Recover a tracking code',
  },
} as const;
