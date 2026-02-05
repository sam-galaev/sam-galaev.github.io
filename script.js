const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwW8GC_1ZSkXCsuQ6Ufhozo37GvPG-uKoCtyXIbXI8kULxVuwPM83f8ZeFx3s8_dULM4w/exec";

const form = document.querySelector("#rsvp-form");
const statusEl = document.querySelector("#form-status");
const pairFields = document.querySelector("#pair-fields");
const drinksField = document.querySelector("#drinks-field");
const foodField = document.querySelector("#food-field");

const attendanceInputs = document.querySelectorAll("input[name='attendance']");

const isWithPartner = (value) => value === "Буду со своей парой";

const updatePairFields = () => {
  const selected = document.querySelector("input[name='attendance']:checked");
  const show = selected && isWithPartner(selected.value);
  pairFields.classList.toggle("is-visible", show);
  pairFields.setAttribute("aria-hidden", String(!show));
  pairFields.querySelectorAll("input").forEach((input) => {
    input.required = show;
    if (!show) {
      input.value = "";
    }
  });
};

attendanceInputs.forEach((input) => {
  input.addEventListener("change", updatePairFields);
});
updatePairFields();

const collectGroup = (groupName) => {
  return Array.from(document.querySelectorAll(`[data-group='${groupName}']:checked`))
    .map((item) => item.value)
    .join(", ");
};

const hasCheckedInGroup = (groupName) => {
  return document.querySelectorAll(`[data-group='${groupName}']:checked`).length > 0;
};

const setStatus = (message, state) => {
  statusEl.textContent = message;
  if (state) {
    statusEl.dataset.state = state;
  } else {
    delete statusEl.dataset.state;
  }
};

const validateForm = () => {
  const missing = [];

  const firstName = form.querySelector("input[name='first_name']");
  const lastName = form.querySelector("input[name='last_name']");
  if (!firstName.value.trim()) missing.push("Имя");
  if (!lastName.value.trim()) missing.push("Фамилия");

  const attendance = document.querySelector("input[name='attendance']:checked");
  if (!attendance) {
    missing.push("Присутствие");
  } else if (isWithPartner(attendance.value)) {
    const partnerFirst = form.querySelector("input[name='partner_first_name']");
    const partnerLast = form.querySelector("input[name='partner_last_name']");
    if (!partnerFirst.value.trim()) missing.push("Имя пары");
    if (!partnerLast.value.trim()) missing.push("Фамилия пары");
  }

  const secondDay = document.querySelector("input[name='second_day']:checked");
  if (!secondDay) missing.push("Второй день");

  if (!hasCheckedInGroup("drinks")) missing.push("Напитки");
  if (!hasCheckedInGroup("food")) missing.push("Еда");

  if (missing.length > 0) {
    setStatus(
      `Пожалуйста, заполните обязательные поля: ${missing.join(", ")}.`,
      "error"
    );
    return false;
  }

  return true;
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  drinksField.value = collectGroup("drinks");
  foodField.value = collectGroup("food");

  if (!validateForm()) {
    return;
  }

  if (!SCRIPT_URL || SCRIPT_URL.includes("PASTE")) {
    setStatus("Форма ещё не подключена к таблице.", "error");
    return;
  }

  setStatus("Отправляем ваш ответ...", "loading");

  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      body: new FormData(form),
      mode: "no-cors",
    });

    form.reset();
    updatePairFields();
    setStatus("Спасибо! Мы получили ваш ответ.", "success");
  } catch (error) {
    setStatus("Не удалось отправить. Попробуйте позже.", "error");
  }
});

const revealElements = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealElements.forEach((el) => observer.observe(el));
} else {
  revealElements.forEach((el) => el.classList.add("is-visible"));
}

const timelineItems = document.querySelectorAll(".timeline li");
if (timelineItems.length) {
  if ("IntersectionObserver" in window) {
    const timelineObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    timelineItems.forEach((item) => timelineObserver.observe(item));
  } else {
    timelineItems.forEach((item) => item.classList.add("is-visible"));
  }
}

const bgAudio = document.querySelector("#bg-audio");
const introOverlay = document.querySelector("#intro-overlay");
const introSeal = document.querySelector("#intro-seal");

const startAudioFrom = (seconds) => {
  if (!bgAudio) return;
  const playFrom = () => {
    const duration = Number.isFinite(bgAudio.duration) ? bgAudio.duration : seconds;
    bgAudio.currentTime = Math.min(seconds, duration);
    const playPromise = bgAudio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  };

  if (bgAudio.readyState >= 1) {
    playFrom();
  } else {
    bgAudio.addEventListener("loadedmetadata", playFrom, { once: true });
  }
};

if (introSeal && introOverlay) {
  introSeal.addEventListener("click", () => {
    document.body.classList.add("intro-open");
    document.body.classList.remove("intro-locked");
    introOverlay.setAttribute("aria-hidden", "true");
    startAudioFrom(48);
    window.setTimeout(() => {
      introOverlay.style.display = "none";
    }, 1200);
  });
}

if (bgAudio) {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      bgAudio.pause();
    } else if (bgAudio.paused && document.body.classList.contains("intro-open")) {
      bgAudio.play().catch(() => {});
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);

  bgAudio.addEventListener("ended", () => {
    startAudioFrom(48);
  });
}

const lightbox = document.querySelector("#lightbox");
if (lightbox) {
  const lightboxImage = lightbox.querySelector(".lightbox-image");
  const closeBtn = lightbox.querySelector(".lightbox-close");
  const zoomInBtn = lightbox.querySelector("[data-zoom='in']");
  const zoomOutBtn = lightbox.querySelector("[data-zoom='out']");
  const galleryImages = document.querySelectorAll(".gallery-image");
  const state = { scale: 1, x: 0, y: 0, isDragging: false, startX: 0, startY: 0 };

  const applyTransform = () => {
    lightboxImage.style.setProperty("--scale", state.scale);
    lightboxImage.style.setProperty("--x", `${state.x}px`);
    lightboxImage.style.setProperty("--y", `${state.y}px`);
  };

  const resetTransform = () => {
    state.scale = 1;
    state.x = 0;
    state.y = 0;
    applyTransform();
  };

  const openLightbox = (img) => {
    lightboxImage.src = img.src;
    lightboxImage.alt = img.alt || "";
    resetTransform();
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  const zoomBy = (delta) => {
    state.scale = Math.min(3, Math.max(1, state.scale + delta));
    if (state.scale === 1) {
      state.x = 0;
      state.y = 0;
    }
    applyTransform();
  };

  galleryImages.forEach((img) => {
    img.addEventListener("click", () => openLightbox(img));
  });

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  closeBtn.addEventListener("click", closeLightbox);
  zoomInBtn.addEventListener("click", () => zoomBy(0.2));
  zoomOutBtn.addEventListener("click", () => zoomBy(-0.2));

  lightbox.addEventListener("wheel", (event) => {
    event.preventDefault();
    zoomBy(event.deltaY < 0 ? 0.15 : -0.15);
  }, { passive: false });

  lightboxImage.addEventListener("pointerdown", (event) => {
    if (state.scale <= 1) return;
    state.isDragging = true;
    state.startX = event.clientX - state.x;
    state.startY = event.clientY - state.y;
    lightboxImage.classList.add("is-dragging");
  });

  window.addEventListener("pointermove", (event) => {
    if (!state.isDragging) return;
    state.x = event.clientX - state.startX;
    state.y = event.clientY - state.startY;
    applyTransform();
  });

  window.addEventListener("pointerup", () => {
    state.isDragging = false;
    lightboxImage.classList.remove("is-dragging");
  });

  lightboxImage.addEventListener("dblclick", () => {
    if (state.scale > 1) {
      resetTransform();
    } else {
      state.scale = 2;
      applyTransform();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
      closeLightbox();
    }
  });
}
