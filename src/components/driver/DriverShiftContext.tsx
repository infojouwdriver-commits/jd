'use client';
import {createContext,useContext} from 'react';
import type {DriverShift} from '@/lib/driver-shifts';
export const DriverShiftContext=createContext<DriverShift|null>(null);
export const useDriverShift=()=>useContext(DriverShiftContext);

export const DriverReceiptContext=createContext<{tripId:number|null;remember:(id:number)=>void}|null>(null);
export const useDriverReceipt=()=>useContext(DriverReceiptContext);
