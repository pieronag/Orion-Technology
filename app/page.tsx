import React from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import BackToTop from "@/components/BackToTop";
import { projects } from "@/data/projects";
import { Cpu, Smartphone, Map, Settings, Shield, Frame, Rocket, Layers, Code, Zap, ChevronRight, CheckCircle2, LayoutTemplate, MessageCircle, BarChart3, Database, CreditCard, Receipt } from "lucide-react";

export default function Home() {
  return (
    <main>
      <div className="mesh-bg"></div>
      <Navbar />

      {/* Hero Section */}
      <section id="inicio" className="hero container">
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <h1 className="text-gradient" style={{ fontSize: "clamp(3.5rem, 8vw, 6.5rem)", letterSpacing: "-0.05em", lineHeight: "1", marginTop: "2rem" }}>
            Desarrollo de Software a tu Medida
          </h1>
          <p className="subtitle" style={{ margin: "1.5rem auto 3rem", fontSize: "1.3rem" }}>
            Creamos herramientas digitales que ayudan a tu empresa a crecer. Soluciones fáciles de usar, rápidas y pensadas para dar resultados reales desde el primer día.
          </p>
          <div className="flex-center" style={{ gap: "1rem", flexWrap: "wrap" }}>
            <a href="#portafolio" className="btn btn-primary">Ver Nuestros Trabajos</a>
            <a href="#contacto" className="btn btn-outline">Hablemos de tu idea</a>
          </div>
        </div>
      </section>

      {/* Filosofía */}
      <section id="nosotros" className="section container" style={{ paddingTop: "2rem" }}>
        <div className="bento-grid">
          <div className="bento-col-8 glass-panel" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <h2 style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)", marginBottom: "1.5rem", lineHeight: "1.1" }}>Tecnología que multiplica el potencial de tu empresa</h2>
            <p className="text-muted" style={{ fontSize: "1.1rem", lineHeight: "1.8", color: "var(--text-muted)", marginBottom: "1rem" }}>
              Desde el año <strong>2020</strong>, en Orion Technology nos dedicamos a transformar negocios mediante el desarrollo de sistemas a medida y plataformas web corporativas. Hemos ayudado a decenas de empresas a digitalizar sus procesos operativos y aumentar sus ventas de forma drástica.
            </p>
            <p className="text-muted" style={{ fontSize: "1.1rem", lineHeight: "1.8", color: "var(--text-muted)" }}>
              Sabemos que cada negocio es único, por eso no utilizamos plantillas. Construimos software industrial desde cero que se adapta a tu forma de trabajar, para que tu equipo sea más rápido y eficiente. Nosotros nos encargamos de toda la complejidad técnica y los servidores, para que tú te enfoques exclusivamente en hacer crecer tu empresa.
            </p>
          </div>
          <div className="bento-col-4 glass-panel" style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "2.5rem", gap: "1.5rem" }}>
            <div>
              <h3 style={{ fontSize: "1.8rem", marginBottom: "0.8rem", fontWeight: "800", lineHeight: "1.2", letterSpacing: "-0.03em" }}>Facilidades de Pago</h3>
              <p className="text-muted" style={{ fontSize: "1.05rem", lineHeight: "1.6", marginBottom: "1.2rem", color: "var(--text-muted)" }}>
                Simplificamos tu inversión tecnológica. Paga de forma segura con crédito o débito, y recibe siempre tu factura electrónica para mantener el orden de tu empresa.
              </p>
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "var(--bg)", padding: "0.6rem 1rem", borderRadius: "8px", border: "1px solid var(--glass-border)" }}>
                  <CreditCard size={18} color="var(--primary)" />
                  <span style={{ fontWeight: "700", fontSize: "0.85rem" }}>Crédito y Débito</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "var(--bg)", padding: "0.6rem 1rem", borderRadius: "8px", border: "1px solid var(--glass-border)" }}>
                  <Receipt size={18} color="var(--primary)" />
                  <span style={{ fontWeight: "700", fontSize: "0.85rem" }}>Factura Electrónica</span>
                </div>
              </div>
            </div>
            
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", marginTop: "auto", paddingTop: "1rem" }}>
              <span style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--text-muted)", fontWeight: "800" }}>Alianza Oficial</span>
              <div style={{ width: "100%", display: "flex", justifyContent: "center", transition: "transform 0.3s ease", cursor: "default" }} className="hover-scale">
                <Image src="/Getnet-logo.webp" alt="Getnet Logo" width={160} height={55} style={{ objectFit: "contain", filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.3))" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Stack Tecnológico */}
        <div className="glass-panel" style={{ marginTop: "2rem", padding: "3rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem" }}>
          <div style={{ textAlign: "center" }}>
             <h3 style={{ fontSize: "0.9rem", marginBottom: "0.5rem", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: "800" }}>Stack Tecnológico</h3>
             <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)" }}>Nuestras Herramientas</h2>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", justifyContent: "center", maxWidth: "900px" }}>
            {[
              { name: "Next.js", icon: Layers },
              { name: "React", icon: Code },
              { name: "React Native", icon: Smartphone },
              { name: "Node.js", icon: Cpu },
              { name: "Tailwind CSS", icon: Frame },
              { name: "TypeScript", icon: Code },
              { name: "Firebase", icon: Shield },
              { name: "MySQL", icon: Database },
              { name: "Prisma ORM", icon: Database },
              { name: "Vercel Edge", icon: Zap },
              { name: "Inteligencia Artificial", icon: Rocket }
            ].map((tool, idx) => (
              <div key={idx} className="hover-scale" style={{ 
                display: "flex", alignItems: "center", gap: "0.5rem", 
                padding: "0.8rem 1.2rem", 
                background: "var(--bg)", 
                border: "1px solid var(--glass-border)", 
                borderRadius: "10px",
                fontSize: "0.95rem",
                color: "var(--text)",
                fontWeight: "700",
                transition: "transform 0.3s ease, border-color 0.3s ease"
              }}>
                <tool.icon size={18} color="var(--primary)" />
                {tool.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Servicios Principales */}
      <section id="servicios" className="section container" style={{ paddingTop: "2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>Lo que podemos hacer por ti</h2>
        </div>

        <div className="kanban-board">
          {/* Columna 1 */}
          <div className="kanban-column">
            <div className="kanban-column-header">
              <span>Desarrollo Core</span>
              <span style={{ background: "var(--bg)", padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.75rem", color: "var(--text-muted)" }}>3</span>
            </div>
            
            <div className="kanban-card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <Settings size={24} color="var(--primary)" />
                <h3 style={{ fontSize: "1.2rem", margin: 0 }}>Sistemas a Medida (ERP)</h3>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", margin: 0, lineHeight: "1.6" }}>
                Automatiza finanzas, inventarios y clientes en una plataforma única y fácil de usar.
              </p>
            </div>

            <div className="kanban-card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <Smartphone size={24} color="var(--primary)" />
                <h3 style={{ fontSize: "1.2rem", margin: 0 }}>Apps Móviles</h3>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", margin: 0, lineHeight: "1.6" }}>
                Lleva tu negocio al bolsillo de tus clientes con aplicaciones rápidas y nativas.
              </p>
            </div>

            <div className="kanban-card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <Cpu size={24} color="var(--primary)" />
                <h3 style={{ fontSize: "1.2rem", margin: 0 }}>Automatización e IA</h3>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", margin: 0, lineHeight: "1.6" }}>
                Integramos Inteligencia Artificial y bots para que tu empresa funcione en piloto automático.
              </p>
            </div>
          </div>

          {/* Columna 2 */}
          <div className="kanban-column">
            <div className="kanban-column-header">
              <span>Presencia Web</span>
              <span style={{ background: "var(--bg)", padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.75rem", color: "var(--text-muted)" }}>3</span>
            </div>
            
            <div className="kanban-card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <Frame size={24} color="var(--primary)" />
                <h3 style={{ fontSize: "1.2rem", margin: 0 }}>Webs Corporativas</h3>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", margin: 0, lineHeight: "1.6" }}>
                Sitios web robustos, ultrarrápidos y con múltiples secciones para empresas sólidas.
              </p>
            </div>

            <div className="kanban-card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <BarChart3 size={24} color="var(--primary)" />
                <h3 style={{ fontSize: "1.2rem", margin: 0 }}>E-Commerce</h3>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", margin: 0, lineHeight: "1.6" }}>
                Tiendas virtuales de alto tráfico preparadas para vender miles de productos sin colapsar.
              </p>
            </div>

            <div className="kanban-card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <LayoutTemplate size={24} color="var(--primary)" />
                <h3 style={{ fontSize: "1.2rem", margin: 0 }}>Landing Pages</h3>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", margin: 0, lineHeight: "1.6" }}>
                Páginas de un solo sitio enfocadas al 100% en vender un producto específico o captar leads.
              </p>
            </div>
          </div>

          {/* Columna 3 */}
          <div className="kanban-column">
            <div className="kanban-column-header">
              <span>Soporte y Estrategia</span>
              <span style={{ background: "var(--bg)", padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.75rem", color: "var(--text-muted)" }}>3</span>
            </div>
            
            <div className="kanban-card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <Layers size={24} color="var(--primary)" />
                <h3 style={{ fontSize: "1.2rem", margin: 0 }}>Diseño UI/UX</h3>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", margin: 0, lineHeight: "1.6" }}>
                Diseñamos maquetas interactivas y pantallas antes de programar para garantizar la mejor experiencia.
              </p>
            </div>

            <div className="kanban-card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <Database size={24} color="var(--primary)" />
                <h3 style={{ fontSize: "1.2rem", margin: 0 }}>Servicio Técnico</h3>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", margin: 0, lineHeight: "1.6" }}>
                Soporte y evolución continua. Mantenimiento 24/7 y optimización de servidores en la nube.
              </p>
            </div>

            <div className="kanban-card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <MessageCircle size={24} color="var(--primary)" />
                <h3 style={{ fontSize: "1.2rem", margin: 0 }}>Consultoría CTO</h3>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", margin: 0, lineHeight: "1.6" }}>
                Guiamos las decisiones técnicas de tu empresa para escalar rápido sin gastar de más.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Metodología */}
      <section id="metodologia" className="section container" style={{ paddingTop: "2rem" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>Nuestro proceso de trabajo</h2>
          </div>

          <div className="timeline">
            {[
              { n: "01", t: "Descubrimos tu necesidad real", d: "Antes de tocar una computadora, nos sentamos contigo a escuchar. Entendemos a fondo cómo funciona tu negocio, cuáles son tus cuellos de botella y qué problemas exactos te están costando dinero o tiempo.", i: Rocket },
              { n: "02", t: "Armamos el plan maestro", d: "Con toda la información en mano, diseñamos un mapa de ruta. Decidimos qué herramientas tecnológicas (como bases de datos o tipos de servidores) usaremos para que el proyecto sea económico hoy pero pueda crecer mañana.", i: Layers },
              { n: "03", t: "Diseñamos las pantallas (Lo visual)", d: "Creamos maquetas y prototipos interactivos. Básicamente te mostramos fotos de cómo se verá tu sistema terminado y cómo se navegará, para que nos des el visto bueno antes de que empecemos a programar.", i: Frame },
              { n: "04", t: "Construimos el sistema a medida", d: "Aquí entra la magia. Nuestros expertos escriben el código asegurándose de que tu plataforma sea muy rápida, segura y nunca se caiga. Construimos los motores detrás de todo para que funcionen de manera invisible y perfecta.", i: Code },
              { n: "05", t: "Hacemos pruebas exhaustivas", d: "No entregamos nada con errores. Revisamos cada detalle, cada botón y cada formulario. Simulamos escenarios de mucho tráfico para asegurar que el sistema aguante sin problemas cuando tus clientes lo usen.", i: Shield },
              { n: "06", t: "El Gran Lanzamiento", d: "Subimos tu sistema a internet en servidores mundiales ultrarrápidos. Te capacitamos a ti y a tu equipo para que sepan usarlo a la perfección desde el primer segundo.", i: Zap },
              { n: "07", t: "Soporte y acompañamiento continuo", d: "No te dejamos solo. Seguimos a tu lado para ayudarte ante cualquier duda, actualizar el sistema por temas de seguridad y mejorarlo o agregarle nuevas funciones conforme tu negocio vaya creciendo y necesitando más cosas.", i: Settings }
            ].map((step, idx) => (
              <div key={idx} className="timeline-item">
                <div className="timeline-num">{step.n}</div>
                <div className="glass-panel" style={{ padding: "2rem", flex: 1 }}>
                  <h3 style={{ fontSize: "1.4rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <step.i size={20} color="var(--primary)" /> {step.t}
                  </h3>
                  <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "1.05rem", lineHeight: "1.7" }}>{step.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portafolio */}
      <section id="portafolio" className="section container" style={{ paddingTop: "2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>Proyectos Recientes</h2>
        </div>

        <div className="bento-grid">
          {projects.map((proj, idx) => {
            const progress = proj.progress || 0;
            return (
              <Link key={idx} href={`/portfolio/${proj.id}`} className={idx < 2 ? "bento-col-6 glass-panel" : "bento-col-4 glass-panel"} style={{ padding: "2.5rem", display: "flex", flexDirection: "column", textDecoration: "none", color: "inherit", transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, border-color 0.4s ease" }}>
                
                <div style={{ position: "relative", width: "100%", height: "240px", borderRadius: "12px", overflow: "hidden", marginBottom: "1.5rem" }}>
                  <Image src={proj.image} alt={proj.title} fill style={{ objectFit: "cover", transition: "transform 0.5s ease" }} className="hover-scale" />
                  <div style={{ position: "absolute", top: "1rem", right: "1rem", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", padding: "0.4rem 0.8rem", borderRadius: "20px", fontSize: "0.75rem", color: "#fff", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.5rem", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: progress === 100 ? "#10b981" : "#f59e0b", boxShadow: `0 0 8px ${progress === 100 ? '#10b981' : '#f59e0b'}` }}></div>
                    {progress === 100 ? 'Operativo' : 'En Desarrollo'}
                  </div>
                </div>

                <h3 style={{ fontSize: "1.6rem", marginBottom: "0.3rem", fontWeight: "800", letterSpacing: "-0.02em" }}>{proj.title}</h3>
                <span style={{ display: "block", color: "var(--primary)", fontWeight: "700", marginBottom: "1rem", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{proj.category}</span>
                
                <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", flex: 1, fontSize: "0.95rem", lineHeight: "1.6" }}>{proj.description}</p>
                
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
                  {proj.tech.slice(0, 3).map((t, i) => (
                    <span key={i} style={{ fontSize: "0.75rem", padding: "0.3rem 0.8rem", background: "var(--bg)", border: "1px solid var(--glass-border)", borderRadius: "6px", color: "var(--text)", fontWeight: "600" }}>
                      {t}
                    </span>
                  ))}
                  {proj.tech.length > 3 && (
                    <span style={{ fontSize: "0.75rem", padding: "0.3rem 0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>+{proj.tech.length - 3}</span>
                  )}
                </div>
                
                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--primary)", fontWeight: "700", fontSize: "0.9rem" }}>
                  Explorar Caso de Éxito <ChevronRight size={18} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Contacto / CTA */}
      <section id="contacto" className="section container" style={{ paddingBottom: "10rem" }}>
        <div className="glass-panel" style={{ textAlign: "center", padding: "5rem 2rem", background: "linear-gradient(135deg, var(--glass) 0%, rgba(124, 58, 237, 0.05) 100%)" }}>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", marginBottom: "1.5rem" }}>¿Listo para empezar?</h2>
          <p className="subtitle" style={{ margin: "0 auto 2.5rem" }}>
            Hablemos sobre tu idea y cómo podemos ayudarte a hacerla realidad en tiempo récord.
          </p>
          <a href="https://wa.me/56950194398?text=Hola%20Equipo%20de%20Orion%20Technology%21%20%F0%9F%91%8B%20He%20visitado%20su%20p%C3%A1gina%20web%20y%20me%20interesa%20cotizar%20el%20desarrollo%20de%20un%20proyecto%20tecnol%C3%B3gico%20para%20mi%20negocio.%20%C2%BFMe%20pueden%20asesorar%3F" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ gap: "0.5rem", padding: "1rem 2.5rem", fontSize: "1.1rem", fontWeight: "700", color: "#ffffff" }}>
            <MessageCircle size={22} /> Cotizar mi proyecto ahora
          </a>
        </div>
      </section>
      <BackToTop />
    </main>
  );
}
