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
  
  export function ShareButtons() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = "Curso Programación Desde Cero + IA";
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
  
  