"use client";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import AccountSettings from "@/components/account/AccountSettings";
import DriversTab from "./DriversTab";
import VehiclesTab from "./VehiclesTab";
import FleetPanel from "@/components/fleet/FleetPanel";
import BillingPanel from "@/components/operations/BillingPanel";
import StaffPanel from "@/components/operations/StaffPanel";
import { operationsCopy } from "@/components/operations/operations-copy";
import { useOperationData } from "@/components/operations/useOperationData";
interface PortalData {
  company: {
    id: number;
    name: string;
    is_test: boolean;
    subscription_status: string;
  };
  companies: { id: number; name: string; is_test: boolean }[];
  membership_role: string;
  can_manage_fleet: boolean;
  can_view_billing: boolean;
  can_manage_staff: boolean;
  drivers: any[];
  vehicles: any[];
  drivers_total: number;
  vehicles_total: number;
  summary: { drivers: number; vehicles: number; active_vehicles: number };
}
export default function CompanyDashboard() {
  const { logout } = useAuth(),
    { language } = useLanguage(),
    c = operationsCopy[language];
  const [company, setCompany] = useState(""),
    [tab, setTab] = useState("account"),
    [driverOffset, setDriverOffset] = useState(0),
    [vehicleOffset, setVehicleOffset] = useState(0),
    [search, setSearch] = useState(""),
    [query, setQuery] = useState(""),
    [state, setState] = useState("all");
  const params = new URLSearchParams({
    drivers_offset: String(driverOffset),
    vehicles_offset: String(vehicleOffset),
    q: query,
    state,
  });
  if (company) params.set("company_id", company);
  const { data, error, loading, reload } = useOperationData<PortalData>(
    "/company-portal?" + params.toString(),
  );
  function move(kind: string, n: number) {
    if (kind === "drivers") setDriverOffset(n);
    else setVehicleOffset(n);
  }
  return (
    <div
      className="min-h-screen bg-background"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="text-xs tracking-widest text-muted-foreground">
              JOUW DRIVER / COMPANY
            </p>
            <h1 className="mt-1 text-xl font-semibold">
              {data?.company.name || c.profile}
            </h1>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button variant="outline" onClick={reload} disabled={loading}>
              {c.refresh}
            </Button>
            <Button variant="outline" onClick={logout}>
              {language === "ar"
                ? "تسجيل الخروج"
                : language === "fr"
                  ? "Déconnexion"
                  : "Afmelden"}
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl space-y-6 p-5 sm:p-8">
        {loading && <p role="status">{c.loading}</p>}
        {error && (
          <div role="alert">
            <p>{c.error}</p>
            <Button onClick={reload}>{c.retry}</Button>
          </div>
        )}
        {data && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2">
                <Badge variant="outline">
                  {c[data.membership_role as "owner"] || data.membership_role}
                </Badge>
                <Badge variant="outline">
                  {data.company.subscription_status}
                </Badge>
                {data.company.is_test && (
                  <Badge variant="outline">{c.test}</Badge>
                )}
              </div>
              {data.companies.length > 1 && (
                <Select
                  value={String(data.company.id)}
                  onValueChange={(v) => {
                    setCompany(v);
                    setDriverOffset(0);
                    setVehicleOffset(0);
                    setTab("account");
                  }}
                >
                  <SelectTrigger className="w-64" aria-label={c.profile}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {data.companies.map((co) => (
                      <SelectItem key={co.id} value={String(co.id)}>
                        {co.name}
                        {co.is_test ? " · " + c.test : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            {data.company.is_test && (
              <p className="rounded-xl border p-4 text-sm">{c.trial}</p>
            )}
            {data.can_manage_fleet && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  [c.drivers, data.summary.drivers],
                  [c.vehicles, data.summary.vehicles],
                  [c.active + " · " + c.vehicles, data.summary.active_vehicles],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border bg-card p-5">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="mt-2 text-3xl font-semibold tabular-nums">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <Tabs
              value={tab}
              onValueChange={setTab}
              dir={language === "ar" ? "rtl" : "ltr"}
            >
              <div className="overflow-x-auto">
                <TabsList className="h-auto min-w-max justify-start p-1">
                  {data.can_manage_fleet && (
                    <>
                      <TabsTrigger className="min-h-11" value="drivers">
                        {c.drivers}
                      </TabsTrigger>
                      <TabsTrigger className="min-h-11" value="vehicles">
                        {c.vehicles}
                      </TabsTrigger>
                      <TabsTrigger className="min-h-11" value="fleet">
                        {language === "ar"
                          ? "الأسطول"
                          : language === "fr"
                            ? "Flotte"
                            : "Vloot"}
                      </TabsTrigger>
                    </>
                  )}
                  {data.can_view_billing && (
                    <TabsTrigger className="min-h-11" value="billing">
                      {c.billing}
                    </TabsTrigger>
                  )}
                  {data.can_manage_staff && (
                    <TabsTrigger className="min-h-11" value="staff">
                      {c.staff}
                    </TabsTrigger>
                  )}
                  <TabsTrigger className="min-h-11" value="account">
                    {c.profile}
                  </TabsTrigger>
                </TabsList>
              </div>
              {data.can_manage_fleet &&
                (["drivers", "vehicles"] as const).map((kind) => (
                  <TabsContent key={kind} value={kind} className="space-y-4">
                    <form
                      noValidate
                      className="flex flex-wrap items-end gap-3 rounded-xl border p-4"
                      onSubmit={(e) => {
                        e.preventDefault();
                        setQuery(search);
                        setDriverOffset(0);
                        setVehicleOffset(0);
                      }}
                    >
                      <div className="min-w-40 flex-1 space-y-2">
                        <Label htmlFor={"portal-search-" + kind}>
                          {c.search}
                        </Label>
                        <Input
                          id={"portal-search-" + kind}
                          value={search}
                          maxLength={100}
                          onChange={(e) => setSearch(e.target.value)}
                        />
                      </div>
                      <Select
                        value={state}
                        onValueChange={(v) => {
                          setState(v);
                          setDriverOffset(0);
                          setVehicleOffset(0);
                        }}
                      >
                        <SelectTrigger className="w-40" aria-label={c.status}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "all",
                            "active",
                            "inactive",
                            "suspended",
                            "maintenance",
                          ].map((value) => (
                            <SelectItem key={value} value={value}>
                              {c[value as "active"] || value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="outline">{c.search}</Button>
                    </form>
                    {kind === "drivers" ? (
                      <DriversTab
                        drivers={data.drivers}
                        companyId={data.company.id}
                        onRefresh={reload}
                      />
                    ) : (
                      <VehiclesTab
                        vehicles={data.vehicles}
                        companyId={data.company.id}
                        onRefresh={reload}
                      />
                    )}
                    <div className="flex flex-wrap justify-between gap-3">
                      <span>
                        {c.total}:{" "}
                        {kind === "drivers"
                          ? data.drivers_total
                          : data.vehicles_total}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          disabled={
                            (kind === "drivers"
                              ? driverOffset
                              : vehicleOffset) === 0
                          }
                          onClick={() =>
                            move(
                              kind,
                              Math.max(
                                0,
                                (kind === "drivers"
                                  ? driverOffset
                                  : vehicleOffset) - 25,
                              ),
                            )
                          }
                        >
                          {c.previous}
                        </Button>
                        <Button
                          variant="outline"
                          disabled={
                            (kind === "drivers"
                              ? driverOffset
                              : vehicleOffset) +
                              25 >=
                            (kind === "drivers"
                              ? data.drivers_total
                              : data.vehicles_total)
                          }
                          onClick={() =>
                            move(
                              kind,
                              (kind === "drivers"
                                ? driverOffset
                                : vehicleOffset) + 25,
                            )
                          }
                        >
                          {c.next}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              {data.can_manage_fleet && (
                <TabsContent value="fleet">
                  <FleetPanel companyId={data.company.id} />
                </TabsContent>
              )}
              {data.can_view_billing && (
                <TabsContent value="billing">
                  <BillingPanel
                    companyId={data.company.id}
                    isTest={data.company.is_test}
                  />
                </TabsContent>
              )}
              {data.can_manage_staff && (
                <TabsContent value="staff">
                  <StaffPanel companyId={data.company.id} />
                </TabsContent>
              )}
              <TabsContent value="account">
                <AccountSettings />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}
