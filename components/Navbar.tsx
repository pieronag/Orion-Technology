"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <nav className={`nav ${scrolled ? "scrolled" : ""} ${isOpen ? "is-open" : ""}`}>
      <div className="container">
        <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
          <Image src="/logo_white.png" alt="Orion Logo" width={90} height={30} style={{ objectFit: 'contain', filter: 'invert(1) brightness(0)' }} priority />
        </Link>
        <ul className={`nav-links ${isOpen ? "active" : ""}`}>
          <li><Link href="/#inicio" onClick={() => setIsOpen(false)}>Inicio</Link></li>
          <li><Link href="/#nosotros" onClick={() => setIsOpen(false)}>Nosotros</Link></li>
          <li><Link href="/#servicios" onClick={() => setIsOpen(false)}>Servicios</Link></li>
          <li><Link href="/#metodologia" onClick={() => setIsOpen(false)}>Metodología</Link></li>
          <li><Link href="/#portafolio" onClick={() => setIsOpen(false)}>Portafolio</Link></li>
          <li><Link href="/#contacto" onClick={() => setIsOpen(false)}>Contacto</Link></li>
        </ul>
        <button className="burger" onClick={() => setIsOpen(!isOpen)} aria-label="Menú">
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </nav>
  );
}
