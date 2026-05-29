"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`nav ${scrolled ? "scrolled" : ""} ${isOpen ? "is-open" : ""}`}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center' }}>
          <Image
            src="/logo_white.png"
            alt="Orion Logo"
            width={120}
            height={40}
            style={{ objectFit: 'contain', transition: '0.3s', filter: 'invert(1) brightness(0)' }}
            priority
            sizes="(max-width: 768px) 120px, 120px"
            quality={75}
          />
        </Link>

        <ul className={`nav-links ${isOpen ? "active" : ""}`}>
          <li><Link href="/#inicio" onClick={() => setIsOpen(false)}>Inicio</Link></li>
          <li><Link href="/#nosotros" onClick={() => setIsOpen(false)}>Nosotros</Link></li>
          <li><Link href="/#servicios" onClick={() => setIsOpen(false)}>Servicios</Link></li>
          <li><Link href="/#metodologia" onClick={() => setIsOpen(false)}>Metodología</Link></li>
          <li><Link href="/#portafolio" onClick={() => setIsOpen(false)}>Portafolio</Link></li>
          <li><Link href="/#contacto" onClick={() => setIsOpen(false)}>Contacto</Link></li>
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="burger" onClick={() => setIsOpen(!isOpen)} aria-label="Alternar Menú">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
