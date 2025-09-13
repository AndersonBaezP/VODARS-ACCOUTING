document.addEventListener("DOMContentLoaded", () => {
  // ===============================
  // ANIMACIÓN AL HACER SCROLL
  // ===============================
  const observerOptions = { threshold: 0.15 };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animated");
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll(".animate-on-scroll").forEach(el => {
    revealObserver.observe(el);
  });

  // ===============================
  // EFECTO HOVER EN CARDS DE SERVICIO
  // ===============================
  const serviceCards = document.querySelectorAll(".service-card");

  serviceCards.forEach(card => {
    const icon = card.querySelector("i");

    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-12px) scale(1.03)";
      if (icon) icon.style.transform = "scale(1.2) rotate(6deg)";
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateY(0) scale(1)";
      if (icon) icon.style.transform = "scale(1) rotate(0)";
    });
  });

  // ===============================
  // ANIMACIÓN ESCALONADA (STAGGER)
  // ===============================
  const staggerElements = document.querySelectorAll(".service-card, .about-content");
  staggerElements.forEach((el, i) => {
    el.style.animationDelay = `${i * 0.2}s`;
    el.classList.add("animate-on-scroll");
  });

  // ===============================
  // PARALLAX SUAVE
  // ===============================
  const parallaxElements = document.querySelectorAll(".about-content");
  window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset * 0.1;
    parallaxElements.forEach(el => {
      el.style.transform = `translateY(${scrolled}px)`;
    });
  });

  // ===============================
  // EFECTO CONTADOR
  // ===============================
  const animateCounter = (el, target, duration = 2000) => {
    let start = 0;
    const increment = target / (duration / 16);
    const counter = setInterval(() => {
      start += increment;
      el.textContent = Math.floor(start);
      if (start >= target) {
        el.textContent = target;
        clearInterval(counter);
      }
    }, 16);
  };

  document.querySelectorAll("[data-counter]").forEach(counter => {
    const target = +counter.getAttribute("data-counter");
    const counterObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateCounter(counter, target);
        counterObserver.disconnect();
      }
    });
    counterObserver.observe(counter);
  });

  // ===============================
  // SMOOTH SCROLL
  // ===============================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", e => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // ===============================
  // EFECTO DE ESCRITURA (TYPEWRITER)
  // ===============================
  const typeWriter = (el, text, speed = 90) => {
    if (el.dataset.typed) return; // evitar escribir dos veces
    el.dataset.typed = true;
    let i = 0;
    el.innerHTML = "";
    el.style.borderRight = "2px solid #f5f0e7ff";

    const type = () => {
      if (i < text.length) {
        el.innerHTML += text.charAt(i);
        i++;
        setTimeout(type, speed);
      } else {
        setTimeout(() => el.style.borderRight = "none", 1000);
      }
    };
    type();
  };

  document.querySelectorAll("h2").forEach((title, i) => {
    const originalText = title.textContent;
    const titleObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setTimeout(() => typeWriter(title, originalText), i * 500);
        titleObserver.disconnect();
      }
    });
    titleObserver.observe(title);
  });

  // ===============================
  // EFECTO LOADING PAGE
  // ===============================
  window.addEventListener("load", () => {
    document.body.classList.add("loaded");
    document.querySelectorAll(".animate-on-scroll").forEach((el, i) => {
      setTimeout(() => {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }, i * 200);
    });
  });

});



