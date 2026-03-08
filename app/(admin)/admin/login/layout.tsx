
export default function AdminLoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
        <header>
          <h1>Admin - Login</h1>
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
