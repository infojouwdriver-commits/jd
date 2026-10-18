export type ConnectionFailure='offline'|'timeout'|'transport'|'server_response';
export function connectionFailure(error:unknown,online:boolean|undefined):ConnectionFailure{
 if(online===false)return 'offline';
 if(error instanceof Error&&['AbortError','TimeoutError'].includes(error.name))return 'timeout';
 return 'transport';
}
export function connectionMessage(kind:ConnectionFailure,language='fr'){
 const messages={ar:{offline:'الجهاز غير متصل بالإنترنت. عملك المحفوظ لا يُحذف.',timeout:'انتهت مهلة الاتصال بالخادم. تحقق من نتيجة العملية قبل تكرارها.',transport:'تعذر الوصول إلى الخادم. قد تكون المشكلة في الشبكة أو الخدمة.',server_response:'استجابة الخادم غير صالحة. حاول مجددًا لاحقًا.'},fr:{offline:'Cet appareil est hors ligne. Les données enregistrées sont conservées.',timeout:'Le serveur ne répond pas à temps. Vérifiez le résultat avant de recommencer.',transport:'Impossible de joindre le serveur. Vérifiez le réseau ou réessayez plus tard.',server_response:'Réponse du serveur invalide. Réessayez plus tard.'},nl:{offline:'Dit apparaat is offline. Opgeslagen gegevens blijven behouden.',timeout:'De server reageert niet op tijd. Controleer het resultaat voordat u opnieuw probeert.',transport:'De server is niet bereikbaar. Controleer het netwerk of probeer later opnieuw.',server_response:'Ongeldig serverantwoord. Probeer later opnieuw.'}};
 return messages[language.startsWith('ar')?'ar':language.startsWith('nl')?'nl':'fr'][kind];
}
