import Link from "next/link";
import { ShareButtons } from "../components/ShareButtons";
import SocialMediaLinks from "../components/SocialMediaLinks";
import About from "../components/About";
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
            <Link href={"/faq"}>Preguntas frecuentes</Link>
            <a target="_blank" href="https://leosprogramador.portfolio-ls.online">Leo S Programador</a>
          </nav>
        </header>
        <main>
        {children}
        </main>
        <hr />
        <footer>
          <About />
          <SocialMediaLinks />
          <hr />
          <h2>Compartir</h2>
          <ShareButtons />
          <p>Copyright &copy;{new Date().getFullYear()}. Desarrollado por <a target="_blank" href="https://leosprogramador.portfolio-ls.online"><b>Leo S Programador</b></a>.</p>
        </footer>
</>      
  );
}
