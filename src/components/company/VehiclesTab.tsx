"use client";
import FleetRecordsTab from "@/components/operations/FleetRecordsTab";
export default function VehiclesTab({
  vehicles,
  ...props
}: {
  vehicles: {
    id: number;
    status: string;
    [key: string]: string | number | undefined;
  }[];
  companyId: number;
  onRefresh: () => void;
}) {
  return <FleetRecordsTab entity="vehicle" rows={vehicles} {...props} />;
}
