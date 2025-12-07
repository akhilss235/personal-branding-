"use client";
import { useEffect, useState } from "react";

export default function Header() {
  const [navOpen, setNavOpen] = useState(false);

  // Smooth Scroll, Tab, Reveal, Scroll Depth
  useEffect(() => {
    const root = document.documentElement;

    // ---------- Scroll Progress ----------
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      const clamped = Math.min(Math.max(progress, 0), 1);
      root.style.setProperty("--scroll-progress", clamped.toString());
    };

    // Intersection Reveal
    const observer = new IntersectionObserver((entries) =>
      entries.forEach(entry => entry.isIntersecting && entry.target.classList.add("is-visible"))
    ,{ threshold: 0.2 });

    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

    // Smooth scroll anchor
    document.querySelectorAll('a[href^="#"]').forEach((link) =>
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (!href || href === "#") return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        window.scrollTo({ top: target.offsetTop - 80, behavior: "smooth" });
        setNavOpen(false);
      })
    );

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <header className="site-header">
      <div className="header-inner container">
        
        {/* Brand */}
        <a href="#hero" className="brand-mark">
          <div className="brand-icon"><span>AK</span></div>
          <div>
            <div className="brand-text-main">Anoop Krishna V A</div>
            <div className="brand-text-sub">Creative Systems Architect · Diver</div>
          </div>
        </a>

        {/* Navigation */}
        <div className="nav-main" data-open={navOpen}>
          <nav className="nav-links">
            <a href="/" className="nav-link">Home</a>
            <a href="/About" className="nav-link">About</a>
            <a href="/Work" className="nav-link">Work</a>
             <a href="/Frameworks" className="nav-link">Frameworks</a>
             <a href="/Speaking" className="nav-link">Speaking</a>
             <a href="/Thoughts" className="nav-link">Thoughts</a>
           <a href="/contact" className="nav-link">Contact</a>
          </nav>

          <a className="nav-cta" href="/ANOOP_KRISHNA_Resume.pdf" target="_blank" rel="noopener">
            <span>Resume</span> <span>↗</span>
          </a>

          {/* Mobile Toggle */}
          <button className="nav-toggle" onClick={() => setNavOpen(!navOpen)} aria-label="Toggle Navigation">
            <span></span><span></span>
          </button>
        </div>
      </div>
    </header>
  );
}





        // <nav className="nav-links">
        //     <a href="/" className="nav-link">Home</a>
        //     <a href="/About" className="nav-link">About</a>
        //     <a href="/Work" className="nav-link">Work</a>
        //     <a href="/Frameworks" className="nav-link">Frameworks</a>
        //     <a href="/Speaking" className="nav-link">Speaking</a>
        //     <a href="/Thoughts" className="nav-link">Thoughts</a>
        //     <a href="/contact" className="nav-link">Contact</a>
        //   </nav>