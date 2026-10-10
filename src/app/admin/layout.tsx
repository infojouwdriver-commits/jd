import ManagementShell from '@/components/navigation/ManagementShell';
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <ManagementShell>{children}</ManagementShell>;
}
