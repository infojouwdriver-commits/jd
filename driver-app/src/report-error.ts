import {ApiError} from './api';
export function reportErrorKey(status:number){return status===404?'reportUpdateRequired':status===401?'signInAgain':status===403?'reportDenied':[0,408].includes(status)?'reportOffline':'reportError';}
export function reportErrorStatus(error:unknown){return error instanceof ApiError?error.status:503;}
