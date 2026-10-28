
import "./cockpit.css";
import "./driver-experience.css";
import { DriverLayoutShell } from "@/components/driver/DriverLayoutShell";

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DriverLayoutShell>{children}</DriverLayoutShell>;
}
