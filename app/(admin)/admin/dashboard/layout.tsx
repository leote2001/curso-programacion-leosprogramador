import LogoutButton from "@/app/components/LogoutButton";
import Link from "next/link";
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header>
        <h1>Admin - Dashboard</h1>
        <LogoutButton />
        <nav>
          <Link href={"/admin/dashboard/"}>Home</Link>
          <Link href={"/admin/dashboard/create-course-edition"}>Crear cohorte</Link>
        </nav>
      </header>
      <main>
        {children}
      </main>
      <footer>
        <p>Copyright &copy;2026</p>
      </footer>
    </>
  );
}
