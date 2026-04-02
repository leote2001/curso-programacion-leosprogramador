import Link from "next/link";
import { ShareButtons } from "../components/ShareButtons";
export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
        <header>
          <h1>Curso Programación Desde Cero + IA</h1>
          <nav>
            <Link href={"/"}>Inicio</Link>
            <Link href={"/preinscription"}>Preinscripción</Link>
          </nav>
        </header>
        <main>
        {children}
        </main>
        <footer>
          <h2>Compartir</h2>
          <ShareButtons url={process.env.NEXT_PUBLIC_FRONTEND_BASE_URL as string} title="Curso Programación Desde Cero + IA" />
          <p>Copyright &copy;{new Date().getFullYear()}. Desarrollado por <a target="_blank" href="https://leosprogramador.portfolio-ls.online"><b>Leo S Programador</b></a>.</p>
        </footer>
</>      
  );
}
