"use client";
import FleetRecordsTab from "@/components/operations/FleetRecordsTab";
export default function DriversTab({
  drivers,
  ...props
}: {
  drivers: {
    id: number;
    status: string;
    [key: string]: string | number | undefined;
  }[];
  companyId: number;
  onRefresh: () => void;
}) {
  return <FleetRecordsTab entity="driver" rows={drivers} {...props} />;
}
