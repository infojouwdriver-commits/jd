import {notFound} from 'next/navigation';
import CompanyWorkspace from '@/components/operations/CompanyWorkspace';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;const company=Number(id);if(!Number.isSafeInteger(company)||company<1)notFound();return <CompanyWorkspace id={company}/>;}
