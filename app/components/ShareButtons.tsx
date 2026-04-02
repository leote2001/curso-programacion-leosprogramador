"use client";
import {
    WhatsappShareButton,
    FacebookShareButton,
    TwitterShareButton,
    LinkedinShareButton,
    WhatsappIcon,
    FacebookIcon,
    TwitterIcon,
    LinkedinIcon
  } from "react-share";
  
  // 🔹 Componente reutilizable de botones de compartir
  export function ShareButtons({ url, title }: { url: string; title: string }) {
    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(url);
        alert("Link copiado!");
      } catch {
        alert("No se pudo copiar el link");
      }
    };
  
    return (
      <div className="flex justify-center gap-4 mt-8 flex-wrap">
        <WhatsappShareButton url={url} title={title} separator=" | ">
          <WhatsappIcon size={40} round />
        </WhatsappShareButton>
  
        <FacebookShareButton url={url} title={title}>
          <FacebookIcon size={40} round />
        </FacebookShareButton>
  
        <TwitterShareButton url={url} title={title}>
          <TwitterIcon size={40} round />
        </TwitterShareButton>
  
        <LinkedinShareButton url={url} summary="Aprende programación desde cero y el uso de la IA."                 >
          <LinkedinIcon size={40} round />
        </LinkedinShareButton>
  
        {/* Botón copiar link */}
        <button
          onClick={handleCopy}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-xl text-sm"
        >
          Copiar link
        </button>
      </div>
    );
  }
  
  export default function LandingPage() {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const title = "Aprendé Programación desde Cero + IA";
  
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        {/* Hero */}
        <section className="text-center py-20 px-6">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Aprendé Programación desde Cero + Inteligencia Artificial
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Curso online de 6 semanas pensado para principiantes. Sin experiencia previa. 
            Aprendé a crear tus primeras aplicaciones y usar IA como un profesional.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-2xl text-lg font-semibold shadow-lg">
            Inscribirme ahora
          </button>
  
          {/* Share buttons */}
          <ShareButtons url={shareUrl} title={title} />
        </section>
  
        {/* Beneficios */}
        <section className="py-16 px-6 bg-gray-900">
          <h2 className="text-3xl font-bold text-center mb-12">
            ¿Qué vas a aprender?
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-gray-800 p-6 rounded-2xl shadow">
              <h3 className="text-xl font-semibold mb-3">Fundamentos de programación</h3>
              <p className="text-gray-400">
                Variables, lógica, funciones y todo lo necesario para empezar desde cero.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-2xl shadow">
              <h3 className="text-xl font-semibold mb-3">Uso de IA</h3>
              <p className="text-gray-400">
                Aprendé a usar herramientas de IA para programar mejor y más rápido.
              </p>
            </div>
          </div>
        </section>
  
        {/* Detalles del curso */}
        <section className="py-16 px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Detalles del curso
          </h2>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <div className="bg-gray-900 p-6 rounded-2xl">
              <p><strong>Duración:</strong> 6 semanas</p>
              <p><strong>Clases:</strong> 1 por semana (2 horas)</p>
              <p><strong>Modalidad:</strong> Online en vivo</p>
            </div>
            <div className="bg-gray-900 p-6 rounded-2xl">
              <p><strong>Nivel:</strong> Principiante</p>
              <p><strong>Incluye:</strong> Grabaciones + material</p>
              <p><strong>Soporte:</strong> Grupo privado</p>
            </div>
          </div>
        </section>
  
        {/* CTA */}
        <section className="py-20 px-6 text-center bg-blue-600">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Empezá hoy mismo tu camino en la programación 🚀
          </h2>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-2xl text-lg font-semibold shadow">
            Reservar mi lugar
          </button>
        </section>
  
        {/* Footer */}
        <footer className="py-6 text-center text-gray-500">
          © {new Date().getFullYear()} Curso Programación + IA
        </footer>
      </main>
    );
  }
  