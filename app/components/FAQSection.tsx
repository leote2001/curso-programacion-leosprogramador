"use client";
import { useState } from "react";

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 flex justify-between items-center"
      >
        <span>{question}</span>
        <span>{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="p-4 bg-gray-900 text-gray-300">
          {answer}
        </div>
      )}
    </div>
  );
}

export function FAQSection() {
  const faqs = [
    {
      q: "¿Necesito experiencia previa?",
      a: "No. El curso está pensado desde cero, paso a paso."
    },
    {
      q: "¿Las clases quedan grabadas?",
      a: "Sí, vas a poder acceder a las grabaciones."
    },
    {
      q: "¿Qué necesito para empezar?",
      a: "Solo una computadora y conexión a internet."
    },
    {
      q: "¿Incluye soporte?",
      a: "Sí, vas a tener acceso a una comunidad privada."
    }
  ];

  return (
    <section className="py-20 px-6 bg-gray-900">
      <h2 className="text-3xl font-bold text-center mb-12">
        Preguntas frecuentes
      </h2>

      <div className="max-w-3xl mx-auto space-y-4">
        <FAQItem question="¿Cómo me inscribo al curso?" answer="Una vez que hacés clic en Preinscripción debés llenar el formulario y seleccionar a que edición del curso querés inscribirte. Al enviar el formulario recibirás un mail con un enlace de pago para abonar la inscripción. Luego de confirmado el pago te enviaremos un correo de confirmación." />
        <FAQItem question="¿Qué métodos de pago puedo usar para abonar la inscripción?" answer="El curso se abona con Mercadopago (solo Argentina)." />
        {faqs.map((item, i) => (
          <FAQItem key={i} question={item.q} answer={item.a} />
        ))}
      </div>
    </section>
  );
}