import React,{createContext,useContext,useState} from 'react';
import {periodDates,type Period} from '../activity-filters';
const Context=createContext<ReturnType<typeof useStateValue>|null>(null);
function useStateValue(){const [value,setValue]=useState(()=>({...periodDates('monthly'),period:'monthly' as Period,platform:'all',status:'all'}));return {value,setValue};}
export function ActivityProvider({children}:{children:React.ReactNode}){const state=useStateValue();return <Context.Provider value={state}>{children}</Context.Provider>;}
export function useActivityFilters(){const state=useContext(Context);if(!state)throw Error('Activity provider required');return state;}
