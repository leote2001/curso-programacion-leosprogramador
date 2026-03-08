import Link from "next/link";
export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
        <header>
          <h1>Curso Intro a la programación</h1>
          <nav>
            <Link href={"/"}>Inicio</Link>
            <Link href={"/preinscription"}>Preinscripción</Link>
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
