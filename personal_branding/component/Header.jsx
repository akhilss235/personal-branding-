"use client";

import { useEffect } from "react";

export default function Navbar() {
  useEffect(() => {
    /* Smooth hash navigation */
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        const el = document.querySelector(id);
        if (!el) return;
        e.preventDefault();
        const top = el.getBoundingClientRect().top + window.pageYOffset - 86;
        window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
        history.replaceState(null, "", id);
      });
    });

    /* Mobile drawer logic */
    const drawer = document.getElementById("drawer");
    const open = document.getElementById("openDrawer");
    const close = document.getElementById("closeDrawer");

    function setOpen(v) {
      drawer?.classList.toggle("open", v);
      drawer?.setAttribute("aria-hidden", v ? "false" : "true");
      document.body.style.overflow = v ? "hidden" : "";
    }

    open?.addEventListener("click", () => setOpen(true));
    close?.addEventListener("click", () => setOpen(false));

    drawer?.addEventListener("click", (e) => {
      if (e.target?.hasAttribute("data-close")) setOpen(false);
    });

    drawer?.querySelectorAll("[data-nav]").forEach((a) => {
      a.addEventListener("click", () => setOpen(false));
    });

    /* Keyboard shortcuts */
    const map = {
      1: "#surface",
      2: "#depth-10",
      3: "#depth-20",
      4: "#depth-30",
      5: "#depth-40",
      6: "#depth-50",
      7: "#contact",
    };

    const keyListener = (e) => {
      if (e.key === "Escape") setOpen(false);
      if (map[e.key] && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const el = document.querySelector(map[e.key]);
        if (el) {
          const top =
            el.getBoundingClientRect().top + window.pageYOffset - 86;
          window.scrollTo({ top, behavior: "smooth" });
          history.replaceState(null, "", map[e.key]);
        }
      }
    };

    window.addEventListener("keydown", keyListener);

    return () => {
      window.removeEventListener("keydown", keyListener);
    };
  }, []);

  return (
    <>
      {/* Mobile Drawer */}
      <div id="drawer" className="drawer" aria-hidden="true">
        <div className="backdrop" data-close></div>

        <div className="panel" role="dialog" aria-modal="true">
          <div className="">
<a href="#hero" className="brand-mark">
          <div className="brand-icon"><span>AK</span></div>
          <div>
            <div className="brand-text-main">Anoop Krishna V </div>
          </div>
        </a>

            <button className="menuBtn" id="closeDrawer" aria-label="Close menu">
              ✕
            </button>
          </div>

          <div className="drawerBody">
            <a href="/" data-nav>
              <span>Home</span> <span className="kbd">1</span>
            </a>
            <a href="#About" data-nav>
              <span>About</span> <span className="kbd">2</span>
            </a>
            <a href="#work" data-nav>
              <span>Work</span> <span className="kbd">3</span>
            </a>
            <a href="#depth-30" data-nav>
              <span>Frameworks</span> <span className="kbd">4</span>
            </a>
            <a href="#Speaking" data-nav>
              <span>Speaking</span> <span className="kbd">5</span>
            </a>
            <a href="#Thoughts" data-nav>
              <span>Thoughts</span> <span className="kbd">6</span>
            </a>
            <a href="#Contact" data-nav>
              <span>Contact</span> <span className="kbd">7</span>
            </a>
          </div>
        </div>
      </div>

      {/* Top Navigation Bar */}
      <header className="topbar">
        <div className="mx-5">
          <div className="nav">
<a href="#hero" className="brand-mark">
          <div className="brand-icon"><span>AK</span></div>
          <div>
            <div className="brand-text-main">Anoop Krishna V </div>
          </div>
        </a>

            <nav className="navlinks">
              <a href="/" className="active">
                Home
              </a>
              <a href="#About">About</a>
              <a href="#work">Work</a>
              <a href="#Frameworks">Frameworks</a>
              <a href="#Speaking">Speaking</a>
              <a href="#Thoughts">Thoughts</a>
              <a href="#contact">Contact</a>
            </nav>

            <div className="ctaRow">
              {/* <button className="btn" id="copyEmail">
                <span className="dot"></span>
                Copy email
              </button> */}

              {/* <a className="btn gold" href="#contact">
                <span className="dot"></span>
                Start a dive
              </a> */}
            </div>

            <button className="menuBtn" id="openDrawer">
              ☰
            </button>
          </div>
        </div>
      </header>
    </>
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