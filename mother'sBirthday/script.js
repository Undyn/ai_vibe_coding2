const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealElements = document.querySelectorAll("[data-reveal]");

if (!reducedMotion && "IntersectionObserver" in window) {
  document.body.classList.add("motion-ready");

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  revealElements.forEach((element) => revealObserver.observe(element));

  const petalLayer = document.querySelector(".petal-layer");
  if (petalLayer) {
    const petals = [
      [5, 23, -2, -70, 11], [14, 29, -17, 100, 15], [25, 21, -9, -95, 10],
      [36, 27, -22, 75, 13], [47, 19, -5, -65, 16], [58, 25, -14, 110, 11],
      [68, 22, -25, -85, 14], [78, 30, -11, 95, 12], [89, 20, -19, -75, 16],
      [96, 26, -7, 80, 10], [31, 32, -28, 120, 12], [73, 18, -3, -100, 13],
    ];

    petals.forEach(([left, duration, delay, drift, size]) => {
      const petal = document.createElement("span");
      petal.className = "floating-petal";
      petal.style.setProperty("--petal-left", `${left}%`);
      petal.style.setProperty("--petal-duration", `${duration}s`);
      petal.style.setProperty("--petal-delay", `${delay}s`);
      petal.style.setProperty("--petal-drift", `${drift}px`);
      petal.style.setProperty("--petal-size", `${size}px`);
      petalLayer.append(petal);
    });
  }
}

const openCardButton = document.querySelector("#open-card");
const closeCardButton = document.querySelector("#close-card");
const birthdayMessage = document.querySelector("#birthday-message");

if (openCardButton && closeCardButton && birthdayMessage) {
  openCardButton.addEventListener("click", () => {
    openCardButton.hidden = true;
    openCardButton.setAttribute("aria-expanded", "true");
    birthdayMessage.hidden = false;
    closeCardButton.focus();
  });

  closeCardButton.addEventListener("click", () => {
    birthdayMessage.hidden = true;
    openCardButton.hidden = false;
    openCardButton.setAttribute("aria-expanded", "false");
    openCardButton.focus();
  });
}