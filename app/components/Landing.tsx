"use client";

import { useRouter } from "next/navigation";

export default function Landing() {
  const router = useRouter();
    return (
<>      
        {/* Hero */}
        <section className="text-center py-20 px-6">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Aprendé Programación desde Cero + Inteligencia Artificial
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Curso online de 6 semanas pensado para principiantes. Sin experiencia previa. 
            En solo 6 semanas vas a entender cómo funciona la programación y cómo usar inteligencia artificial para potenciarte.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-2xl text-lg font-semibold shadow-lg" onClick={() => router.push("/preinscription")}>
            Preinscribirme ahora
          </button>
  
        </section>
  
        {/* Beneficios */}
        <section className="py-16 px-6 bg-gray-900">
          <h3 className="text-3xl font-bold text-center mb-12">
            Lo que vas a lograr 
          </h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-gray-800 p-6 rounded-2xl shadow">
              
              <p className="text-gray-400">
                Entender como funciona la programación
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-2xl shadow">
              
              <p className="text-gray-400">
                Crear tus primeras apps
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-2xl shadow">
              
              <p className="text-gray-400">
                Usar IA como herramienta real 
              </p>
            </div>
          </div>
        </section>
{/* TEMARIO */}
<section className="py-16 px-6 max-w-5xl mx-auto">
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-10">
          Temario del Curso
        </h3>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Semana 1 */}
          <div className="bg-gray-900 p-6 rounded-2xl shadow">
            <h4 className="text-xl font-semibold mb-2">Semana 1</h4>
            <p className="text-gray-300">	
              Introducción a la programación. Qué es programar. Lógica básica y primeros conceptos.
            </p>
          </div>

          {/* Semana 2 */}
          <div className="bg-gray-900 p-6 rounded-2xl shadow">
            <h4 className="text-xl font-semibold mb-2">Semana 2</h4>
            <p className="text-gray-300">
              Variables, tipos de datos y operadores. Pensamiento lógico aplicado.
            </p>
          </div>

          {/* Semana 3 */}
          <div className="bg-gray-900 p-6 rounded-2xl shadow">
            <h4 className="text-xl font-semibold mb-2">Semana 3</h4>
            <p className="text-gray-300">
              Condicionales (if, else). Toma de decisiones en programación.
            </p>
          </div>

          {/* Semana 4 */}
          <div className="bg-gray-900 p-6 rounded-2xl shadow">
            <h4 className="text-xl font-semibold mb-2">Semana 4</h4>
            <p className="text-gray-300">
              Bucles (loops). Automatización de tareas repetitivas.
            </p>
          </div>

          {/* Semana 5 */}
          <div className="bg-gray-900 p-6 rounded-2xl shadow">
            <h4 className="text-xl font-semibold mb-2">Semana 5</h4>
            <p className="text-gray-300">
              Funciones. Organización del código. Introducción a buenas prácticas.
            </p>
          </div>

          {/* Semana 6 */}
          <div className="bg-gray-900 p-6 rounded-2xl shadow">
            <h4 className="text-xl font-semibold mb-2">Semana 6</h4>
            <p className="text-gray-300">
              Introducción a la Inteligencia Artificial aplicada a programación. Cómo usar IA para aprender y programar mejor. Proyecto final
            </p>
          </div>
        </div>
      </section>  
        {/* Detalles del curso */}
        <section className="py-16 px-6">
          <h3 className="text-3xl font-bold text-center mb-12">
            Detalles del curso
          </h3>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <div className="bg-gray-900 p-6 rounded-2xl">
              <p><strong>Duración:</strong> 6 semanas</p>
              <p><strong>Clases:</strong> 1 por semana (2 horas)</p>
              <p><strong>Modalidad:</strong> Online en vivo</p>
            </div>
            <div className="bg-gray-900 p-6 rounded-2xl">
              <p><strong>Nivel:</strong> Principiante</p>
              <p><strong>Incluye:</strong> Grabaciones + material</p>
              <p><strong>Soporte:</strong> Grupo de Whatsapp</p>
            </div>
          </div>
        </section>
      <p><b>Cupos limitados!</b></p>
        {/* CTA */}
        <section className="py-20 px-6 text-center bg-blue-600">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Empezá hoy mismo tu camino en la programación 🚀
          </h2>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-2xl text-lg font-semibold shadow" onClick={() => router.push("/preinscription")}>
            Preinscribirme ahora
          </button>
        </section>
  </>      
    );
  }
  