/* ============================================
   LS CHECK — script.js
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  /* ---- Navbar scroll shadow ---- */
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 10);
  });

  /* ---- Hamburger menu ---- */
  const hamburger = document.querySelector(".hamburger");
  const drawer = document.querySelector(".nav-drawer");
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    drawer.classList.toggle("open");
  });

  /* Close drawer when a link inside is clicked */
  drawer.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("open");
      drawer.classList.remove("open");
    });
  });

  /* ---- Smooth scroll for anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      const offset = 80; /* navbar height */
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  /* ---- IntersectionObserver: fade-up animations ---- */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));

  /* ---- Stagger delay for grid children ---- */
  document
    .querySelectorAll(".services-grid, .steps-grid, .why-grid")
    .forEach((grid) => {
      grid.querySelectorAll(".fade-up").forEach((card, i) => {
        card.style.transitionDelay = `${i * 70}ms`;
      });
    });

  /* ---- Placa input: auto uppercase + mask ---- */
  const placaInput = document.getElementById("placa-input");
  if (placaInput) {
    placaInput.addEventListener("input", (e) => {
      let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (val.length > 7) val = val.slice(0, 7);
      e.target.value = val;
    });
  }

  /* ---- Consultar button ---- */
  const consultarBtns = document.querySelectorAll(".consultar-trigger");
  consultarBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const placa = placaInput ? placaInput.value.trim() : "";
      const waNumber = "5587996541760";
      const msg = placa
        ? `Olá! Quero consultar o veículo de placa *${placa}*.`
        : `Olá! Tenho interesse na consulta veicular.`;
      const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
      window.open(url, "_blank");
    });
  });

  /* ---- WhatsApp float click ---- */
  const waFloat = document.querySelector(".whatsapp-float");
  if (waFloat) {
    waFloat.addEventListener("click", () => {
      const waNumber = "5587996541760";
      const msg = "Olá! Tenho interesse na consulta veicular da LS Check.";
      window.open(
        `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`,
        "_blank",
      );
    });
  }

  /* ---- Active nav link on scroll ---- */
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link[data-section]");

  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach((section) => {
      if (window.scrollY >= section.offsetTop - 100) {
        current = section.id;
      }
    });
    navLinks.forEach((link) => {
      link.classList.toggle("active-link", link.dataset.section === current);
    });
  });
});
