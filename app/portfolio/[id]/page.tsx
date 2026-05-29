import { projects } from "@/data/projects";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  ArrowLeft, Terminal, Shield, Zap, BookOpen, LayoutDashboard, CheckCircle2, ChevronRight
} from "lucide-react";
import "@/app/portfolio.css";



export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = projects.find((p) => p.id === id);

  if (!project) return { title: "Proyecto no encontrado" };

  const techKeywords = project.tech.join(", ");
  const dynamicKeywords = `${project.title}, ${project.category}, desarrollo de software a medida, ${techKeywords}, Orion Technology portfolio`;

  return {
    title: `${project.title} - ${project.category}`,
    description: project.description,
    keywords: dynamicKeywords,
    openGraph: {
      title: `${project.title} | Orion Technology`,
      description: project.description,
      url: `https://www.oriontechnology.cl/portfolio/${project.id}`,
      siteName: "Orion Technology",
      images: [
        {
          url: project.image,
          width: 1200,
          height: 630,
          alt: `Vista de ${project.title}`,
        },
      ],
      locale: "es_CL",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} | Orion Technology`,
      description: project.description,
      images: [project.image],
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = projects.find((p) => p.id === id);

  if (!project) {
    notFound();
  }

  const p = project;

  return (
    <div className="doc-layout">
      
      {/* SIDEBAR DE DOCUMENTACIÓN */}
      <aside className="doc-sidebar">
        <Link href="/#portafolio" className="doc-back">
          <ArrowLeft size={18} /> Volver al Portafolio
        </Link>

        <div className="doc-title-block">
          <p className="doc-description-top" style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.75rem", lineHeight: 1.5 }}>
            {p.description}
          </p>
          <h1 className="doc-title" style={{ marginBottom: "0.75rem", fontSize: "1.8rem" }}>{p.title}</h1>
          <span className="doc-category" style={{ display: "inline-block", background: "var(--bg)", padding: "0.4rem 0.8rem", borderRadius: "20px", border: "1px solid var(--glass-border)", fontSize: "0.75rem" }}>
            {p.category}
          </span>
        </div>

        <div className="doc-nav-title">Navegación del Proyecto</div>
        <nav className="doc-nav">
          <a href="#resumen"><ChevronRight size={14} style={{display:'inline', marginRight:'5px'}}/> Resumen Ejecutivo</a>
          <a href="#arquitectura"><ChevronRight size={14} style={{display:'inline', marginRight:'5px'}}/> Arquitectura Técnica</a>
          <a href="#modulos"><ChevronRight size={14} style={{display:'inline', marginRight:'5px'}}/> Módulos Operativos</a>
          <a href="#tecnologia"><ChevronRight size={14} style={{display:'inline', marginRight:'5px'}}/> Stack Tecnológico</a>
          {p.gallery && p.gallery.length > 0 && (
            <a href="#galeria"><ChevronRight size={14} style={{display:'inline', marginRight:'5px'}}/> Evidencia Visual</a>
          )}
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="doc-content">
        
        {/* RESUMEN */}
        <section id="resumen" className="doc-section">
          <div className="doc-hero">
            <Image src={p.image} alt={p.title} fill priority />
          </div>
          
          <h2 className="doc-section-title"><BookOpen size={28} color="var(--primary)" /> Resumen Ejecutivo</h2>
          <p className="doc-text">{p.longDescription}</p>

          <div className="doc-grid-2">
            <div className="doc-card">
              <h3 className="doc-card-title">El Desafío Inicial</h3>
              <p className="doc-card-text">{p.challenge}</p>
            </div>
            <div className="doc-card" style={{ borderColor: "var(--primary)", background: "rgba(124, 58, 237, 0.02)" }}>
              <h3 className="doc-card-title">Solución Implementada</h3>
              <p className="doc-card-text">{p.solution}</p>
            </div>
          </div>
        </section>

        {/* ARQUITECTURA */}
        <section id="arquitectura" className="doc-section">
          <h2 className="doc-section-title"><Shield size={28} color="var(--primary)" /> Arquitectura Técnica</h2>
          <p className="doc-text">
            Este sistema fue construido bajo los más altos estándares corporativos. Sus características fundamentales son:
          </p>
          <ul className="doc-feature-list">
            {p.features.map((f, i) => (
              <li key={i} className="doc-feature-item">
                <CheckCircle2 size={20} className="doc-feature-icon" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* MODULOS */}
        <section id="modulos" className="doc-section">
          <h2 className="doc-section-title"><LayoutDashboard size={28} color="var(--primary)" /> Módulos Operativos</h2>
          <p className="doc-text">
            La plataforma se divide en centros de operación específicos para maximizar la eficiencia y facilitar el uso diario:
          </p>
          
          <div className="doc-grid-2">
            {p.modules?.map((m, i) => (
              <div key={i} className="doc-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 className="doc-card-title" style={{ margin: 0 }}>{m.name}</h3>
                  <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--primary)', background: 'var(--bg)', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
                    {m.statusLabel || "OPERATIVO"}
                  </span>
                </div>
                <ul className="doc-feature-list" style={{ gap: '0.5rem' }}>
                  {m.details.map((d, idx) => (
                    <li key={idx} className="doc-feature-item" style={{ fontSize: '0.9rem' }}>
                      <Zap size={14} className="doc-feature-icon" style={{ marginTop: '0.25rem' }} />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* TECNOLOGÍA */}
        <section id="tecnologia" className="doc-section">
          <h2 className="doc-section-title"><Terminal size={28} color="var(--primary)" /> Stack Tecnológico</h2>
          <p className="doc-text">
            Utilizamos infraestructura de nivel mundial para asegurar que el sistema nunca falle bajo presión de usuarios o datos.
          </p>
          <div className="doc-tech-list">
            {p.tech.map((t, idx) => (
              <div key={idx} className="doc-tech-pill">{t}</div>
            ))}
          </div>
        </section>

        {/* GALERÍA */}
        {p.gallery && p.gallery.length > 0 && (
          <section id="galeria" className="doc-section">
            <h2 className="doc-section-title">Evidencia Visual</h2>
            <div className="doc-gallery-grid">
              {p.gallery.map((item, index) => (
                <div key={index} className="doc-gallery-item">
                  <Image src={item.image} alt={item.title} fill />
                  <div className="doc-gallery-caption">
                    <h3 style={{ fontSize: "1rem", margin: "0 0 0.2rem", fontWeight: 800 }}>{item.title}</h3>
                    <p style={{ margin: 0, opacity: 0.8, fontSize: "0.85rem" }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

export async function generateStaticParams() {
  return projects.map((project) => ({
    id: project.id,
  }));
}
