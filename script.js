document.addEventListener("DOMContentLoaded", function () {
  setupMenuBurger();
  setupInfiniteGallery();
  setupSectionsCarousel();
});

// Проверяем предпочтения пользователя относительно motion
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

// Плавная прокрутка с учетом предпочтений
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    const targetId = this.getAttribute("href");
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      const headerHeight = document.querySelector(".header").offsetHeight;
      const targetPosition =
        targetElement.getBoundingClientRect().top +
        window.pageYOffset -
        headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: motionQuery.matches ? "auto" : "smooth",
      });
    }
  });
});

function setupMenuBurger() {
  // Меню-бургер
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");

  menuToggle.addEventListener("click", function () {
    nav.classList.toggle("active");
    menuToggle.classList.toggle("active");
  });

  // Плавная прокрутка к якорям
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      // Закрываем меню при клике на мобильных
      if (window.innerWidth <= 768) {
        nav.classList.remove("active");
        menuToggle.classList.remove("active");
      }

      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        const headerHeight = document.querySelector(".header").offsetHeight;
        const targetPosition =
          targetElement.getBoundingClientRect().top +
          window.pageYOffset -
          headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  // Закрытие меню при клике вне его области
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".header-container") && window.innerWidth <= 768) {
      nav.classList.remove("active");
      menuToggle.classList.remove("active");
    }
  });
}

// Infinite Gallery Logic
function setupInfiniteGallery() {
  const galleryTrack = document.querySelector(".gallery-track");
  if (!galleryTrack) return;

  // Клонируем изображения для бесшовной прокрутки
  const images = galleryTrack.querySelectorAll("img");
  if (images.length < 4) return; // Минимум 4 изображения

  // Рассчитываем общую ширину
  const firstImage = images[0];
  const style = window.getComputedStyle(firstImage);
  const margin = parseFloat(style.marginRight);
  const imageWidth = firstImage.offsetWidth + margin;

  // Оптимизация скорости анимации
  const duration = images.length * 2.5; // 2.5s на каждое изображение

  // Создаем keyframes динамически
  const keyframes = `
        @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(calc(-${
              (imageWidth * images.length) / 2
            }px)); }
        }
    `;

  // Добавляем стили в документ
  const styleElement = document.createElement("style");
  styleElement.innerHTML = keyframes;
  document.head.appendChild(styleElement);

  // Применяем анимацию
  galleryTrack.style.animation = `scroll ${duration}s linear infinite`;

  // Пауза при наведении
  galleryTrack.addEventListener("mouseenter", () => {
    galleryTrack.style.animationPlayState = "paused";
  });

  galleryTrack.addEventListener("mouseleave", () => {
    galleryTrack.style.animationPlayState = "running";
  });
}

window.addEventListener("resize", () => {
  setupInfiniteGallery();
});

// Carousel Logic
function setupSectionsCarousel() {
  checkSectionsCarousel();

  const track = document.querySelector(".sections-track");
  if (!track) return;

  const cards = Array.from(document.querySelectorAll(".section-card"));
  const prevBtn = document.querySelector(".carousel-button.prev");
  const nextBtn = document.querySelector(".carousel-button.next");

  if (cards.length < 4) return; // Минимум 4 карточки (2 оригинальные + 2 дубли)

  // Разделяем оригинальные и дублированные карточки
  const originalCards = cards.slice(0, cards.length / 2);
  const cardWidth = originalCards[0].offsetWidth + 24; // width + gap
  const visibleCards = Math.floor(track.offsetWidth / cardWidth);

  let currentIndex = 0;
  const totalOriginalCards = originalCards.length;

  // Функция обновления позиции
  const updatePosition = () => {
    track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    track.style.transition = "transform 0.5s ease";
  };

  // Проверка границ с мгновенным переходом
  const checkBoundaries = () => {
    track.style.transition = "none";

    if (currentIndex >= totalOriginalCards) {
      currentIndex = 0;
      track.style.transform = `translateX(0)`;
    } else if (currentIndex < 0) {
      currentIndex = totalOriginalCards - 1;
      track.style.transform = `translateX(-${
        (totalOriginalCards - 1) * cardWidth
      }px)`;
    }
  };

  // Обработчики кнопок
  nextBtn.addEventListener("click", () => {
    currentIndex++;
    updatePosition();

    // После анимации проверяем границы
    setTimeout(checkBoundaries, 500);
  });

  prevBtn.addEventListener("click", () => {
    currentIndex--;
    updatePosition();

    // После анимации проверяем границы
    setTimeout(checkBoundaries, 500);
  });

  // Touch события
  let startX, moveX;
  track.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    track.style.transition = "none";
  });

  track.addEventListener("touchmove", (e) => {
    e.preventDefault();
    moveX = e.touches[0].clientX;
    const diff = moveX - startX;
    track.style.transform = `translateX(calc(-${
      currentIndex * cardWidth
    }px + ${diff}px))`;
  });

  track.addEventListener("touchend", () => {
    const diff = moveX - startX;

    if (Math.abs(diff) > 50) {
      if (diff < 0) {
        currentIndex++;
      } else {
        currentIndex--;
      }
      updatePosition();
      setTimeout(checkBoundaries, 500);
    } else {
      updatePosition(); // Возврат на место если свайп слабый
    }
  });

  // Реинициализация при ресайзе
  window.addEventListener("resize", () => {
    currentIndex = 0;
    track.style.transition = "none";
    track.style.transform = "translateX(0)";
  });
}

function checkSectionsCarousel() {
  const track = document.querySelector(".sections-track");
  const cards = document.querySelectorAll(".section-card");
  const prevBtn = document.querySelector(".carousel-button.prev");
  const nextBtn = document.querySelector(".carousel-button.next");

  if (!track || cards.length === 0) return;

  let currentPosition = 0;
  const cardWidth = cards[0].offsetWidth + 20; // Ширина + отступ

  function updateCarousel() {
    track.style.transform = `translateX(-${currentPosition}px)`;
  }

  nextBtn.addEventListener("click", function () {
    if (currentPosition < (cards.length - 1) * cardWidth) {
      currentPosition += cardWidth;
      updateCarousel();
    }
  });

  prevBtn.addEventListener("click", function () {
    if (currentPosition > 0) {
      currentPosition -= cardWidth;
      updateCarousel();
    }
  });

  // Проверка видимости при загрузке
  setTimeout(() => {
    cards.forEach((card) => {
      card.style.visibility = "visible";
    });
  }, 100);
}
