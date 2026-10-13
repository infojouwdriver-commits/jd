
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Car, Users, LogOut, Loader2, RefreshCw, RadioTower } from 'lucide-react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/components/auth/AuthProvider';
import { ThemeToggle } from '@/components/ThemeToggle';
import { toast } from 'sonner';
import AccountSettings from '@/components/account/AccountSettings';
import DriversTab from './DriversTab';
import VehiclesTab from './VehiclesTab';
import FleetPanel from '@/components/fleet/FleetPanel';

interface CompanyData {
  company: {
    id: number;
    name: string;
    email: string;
    phone: string;
    subscription_status: string;
  };
  drivers: any[];
  vehicles: any[];
}

export default function CompanyDashboard() {
  const { logout } = useAuth();
  const [data, setData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const result = await api.get<CompanyData>('/company-portal');
      setData(result);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load company data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const statusColor = (s: string) =>
    s === 'active' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
    s === 'suspended' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
    'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  const { company, drivers, vehicles } = data;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-sm leading-tight">{company.name}</h1>
              <Badge variant="outline" className={`text-[10px] h-4 ${statusColor(company.subscription_status)}`}>
                {company.subscription_status}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => fetchData(true)} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={logout} className="text-destructive hover:text-destructive">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{drivers.length}</p>
                <p className="text-xs text-muted-foreground">Drivers</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Car className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{vehicles.length}</p>
                <p className="text-xs text-muted-foreground">Vehicles</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <Car className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {vehicles.filter((v: any) => v.status === 'active').length}
                </p>
                <p className="text-xs text-muted-foreground">Active Vehicles</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Company Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="drivers">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="drivers" className="flex-1 gap-2">
                  <Users className="w-4 h-4" /> Drivers ({drivers.length})
                </TabsTrigger>
                <TabsTrigger value="vehicles" className="flex-1 gap-2">
                  <Car className="w-4 h-4" /> Vehicles ({vehicles.length})
                </TabsTrigger>
                <TabsTrigger value="fleet" className="flex-1 gap-2">
                  <RadioTower className="w-4 h-4" /> الأسطول
                </TabsTrigger>
                <TabsTrigger value="account">حسابي</TabsTrigger>
          </TabsList>
              <TabsContent value="drivers">
                <DriversTab drivers={drivers} onRefresh={() => fetchData(true)} />
              </TabsContent>
              <TabsContent value="vehicles">
                <VehiclesTab vehicles={vehicles} onRefresh={() => fetchData(true)} />
              </TabsContent>
              <TabsContent value="fleet"><FleetPanel /></TabsContent>
              <TabsContent value="account"><AccountSettings /></TabsContent>
        </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
