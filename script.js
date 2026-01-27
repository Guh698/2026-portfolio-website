gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrollToPlugin, Observer);

let smoother;
let homeObserver;
let homeTickerFunc;

function mainOpening() {
  let openingTimeline = gsap.timeline();

  openingTimeline.fromTo(
    ".work",
    {
      clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
    },
    {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      stagger: { amount: 0.3, from: "random" },
      duration: 1.3,
      ease: "power3.inOut",
    },
  );

  openingTimeline.fromTo(
    ["header span, header a, footer a, .about-page-link"],
    {
      opacity: 0,
      filter: "blur(3px)",
    },
    {
      opacity: 1,
      filter: "blur(0px)",
      duration: 1.7,
    },
    "-=0.3",
  );
}

function workPagesOpening() {
  gsap.fromTo(
    [".work-hero h1, .work-hero p"],
    {
      opacity: 0,
      filter: "blur(3px)",
    },
    {
      duration: 1.7,
      opacity: 1,
      filter: "blur(0px)",
    },
  );

  gsap.fromTo(
    ["header span, header a, footer a"],
    {
      opacity: 0,
      filter: "blur(3px)",
    },
    {
      opacity: 1,
      filter: "blur(0px)",
      duration: 1.7,
    },
  );
}

function aboutPageOpening() {
  gsap.fromTo(
    ".about-hero span",
    {
      opacity: 0,
      filter: "blur(3px)",
    },
    {
      duration: 1.7,
      opacity: 1,
      filter: "blur(0px)",
    },
  );

  gsap.fromTo(
    ["header span, header a, footer a"],
    {
      opacity: 0,
      filter: "blur(3px)",
    },
    {
      opacity: 1,
      filter: "blur(0px)",
      duration: 1.7,
    },
  );
}

function initSmoothScroll() {
  if (ScrollSmoother.get()) ScrollSmoother.get().kill();

  smoother = ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 1,
    effects: true,
    smoothTouch: 0.1,
  });
}

function initHomeCarousel() {
  const cards = gsap.utils.toArray(".work");

  if (cards.length === 0) return;

  const wakeUpVideos = () => {
    const videos = document.querySelectorAll("video");
    videos.forEach((video) => {
      video.muted = true;
      video.currentTime = 0;

      const playPromise = video.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log("Autoplay bloqueado, aguardando toque...");
        });
      }
    });
  };
  wakeUpVideos();

  const unlockOnTouch = () => {
    wakeUpVideos();
    window.removeEventListener("touchstart", unlockOnTouch);
    window.removeEventListener("click", unlockOnTouch);
  };

  window.addEventListener("touchstart", unlockOnTouch, { once: true });
  window.addEventListener("click", unlockOnTouch, { once: true });

  if (ScrollSmoother.get()) ScrollSmoother.get().kill();

  document.body.style.height = "100vh";
  document.body.style.overflow = "hidden";

  let spacer = 0;
  let cardHeight;
  let totalHeight;
  let wrapper;

  let targetY = 0;
  let currentY = 0;
  const ease = 0.08;
  let isPaused = false;

  function updateMetrics() {
    if (!cards[0]) return;

    cards.forEach((card) => (card.style.height = ""));
    const rawHeight = cards[0].clientHeight;
    cards.forEach((card) => (card.style.height = `${rawHeight}px`));

    cardHeight = rawHeight + spacer;
    totalHeight = cardHeight * cards.length;

    wrapper = gsap.utils.wrap(-totalHeight / 2, totalHeight / 2);
  }

  updateMetrics();

  let lastWidth = window.innerWidth;
  window.addEventListener("resize", () => {
    if (window.innerWidth !== lastWidth) {
      lastWidth = window.innerWidth;
      updateMetrics();
    }
  });

  homeObserver = Observer.create({
    target: window,
    type: "wheel,touch,pointer",
    preventDefault: true,
    onChange: (self) => {
      if (isPaused) return;
      const isWheel = self.event.type.includes("wheel");
      const direction = isWheel ? 1 : -1;
      const sensitivity = isWheel ? 0.7 : 1.2;
      targetY += self.deltaY * sensitivity * direction;
    },
  });

  const togglePause = () => (isPaused = !isPaused);
  cards.forEach((card) => card.addEventListener("click", togglePause));

  homeTickerFunc = () => {
    if (isPaused) return;

    currentY += (targetY - currentY) * ease;

    const centerScreen = window.innerHeight / 2;

    cards.forEach((card, i) => {
      let yPos = i * cardHeight - currentY;

      yPos = wrapper(yPos);

      let finalY = centerScreen + yPos - cardHeight / 2;

      const cardCenter = finalY + cardHeight / 2;
      const distFromCenter = Math.abs(centerScreen - cardCenter);

      const zIndex = Math.round(1000 - distFromCenter);

      gsap.set(card, {
        y: finalY,
        zIndex: zIndex,
        force3D: true,
      });
    });
  };

  gsap.ticker.add(homeTickerFunc);
}

function killHomeCarousel() {
  if (homeObserver) {
    homeObserver.disable();
    homeObserver.kill();
    homeObserver = null;
  }

  Observer.getAll().forEach((o) => o.kill());

  if (homeTickerFunc) {
    gsap.ticker.remove(homeTickerFunc);
    homeTickerFunc = null;
  }

  ScrollTrigger.normalizeScroll(false);
}

function scrollTop() {
  let scrollBtn = document.querySelector(".top-scroll-btn");

  if (scrollBtn) {
    scrollBtn.addEventListener("click", () => {
      gsap.to(window, {
        scrollTo: 0,
        duration: 1.7,
        ease: "power3.inOut",
      });
    });
  }
}

barba.init({
  sync: true,
  debug: true,

  views: [
    {
      namespace: "home",
      beforeEnter() {
        document.body.classList.add("is-home");
        document.body.classList.remove("is-work");
      },
      afterEnter() {
        initHomeCarousel();
        mainOpening();
      },
      beforeLeave() {
        killHomeCarousel();
      },
    },
    {
      namespace: "Studio JEMD",
      beforeEnter() {
        document.body.classList.remove("is-home");
        document.body.classList.add("is-work");
        document.body.style.overflow = "auto";
        document.body.style.height = "auto";
        document.body.style.touchAction = "auto";
      },
      afterEnter() {
        workPagesOpening();
        scrollTop();
      },
    },
    {
      namespace: "Éminence",
      beforeEnter() {
        document.body.classList.remove("is-home");
        document.body.classList.add("is-work");
        document.body.style.overflow = "auto";
        document.body.style.height = "auto";
        document.body.style.touchAction = "auto";
      },
      afterEnter() {
        workPagesOpening();
        scrollTop();
      },
    },
    {
      namespace: "Nocturna",
      beforeEnter() {
        document.body.classList.remove("is-home");
        document.body.classList.add("is-work");
        document.body.style.overflow = "auto";
        document.body.style.height = "auto";
        document.body.style.touchAction = "auto";
      },
      afterEnter() {
        workPagesOpening();
        scrollTop();
      },
    },
    {
      namespace: "Woode",
      beforeEnter() {
        document.body.classList.remove("is-home");
        document.body.classList.add("is-work");
        document.body.style.overflow = "auto";
        document.body.style.height = "auto";
        document.body.style.touchAction = "auto";
      },
      afterEnter() {
        workPagesOpening();
        scrollTop();
      },
    },
    {
      namespace: "Luiz Gustavo",
      beforeEnter() {
        document.body.classList.remove("is-home");
        document.body.classList.add("is-work");
        document.body.style.overflow = "auto";
        document.body.style.height = "auto";
        document.body.style.touchAction = "auto";
      },
      afterEnter() {
        aboutPageOpening();
        scrollTop();
      },
    },
  ],

  transitions: [
    {
      name: "default-transition",

      once(data) {
        if (data.next.namespace === "home") {
          initHomeCarousel();
          mainOpening();
        } else {
          initSmoothScroll();
        }
        gsap.from(data.next.container, { opacity: 0, duration: 1 });
      },

      leave(data) {
        const done = this.async();

        if (smoother) {
          smoother.kill();
          smoother = null;
        }

        gsap.to(data.current.container, {
          opacity: 0,
          duration: 0.5,
          onComplete: done,
        });
      },

      enter(data) {
        const wrapper = document.querySelector("#smooth-wrapper");
        if (wrapper) wrapper.style.cssText = "";

        window.scrollTo(0, 0);

        setTimeout(() => {
          if (data.next.namespace !== "home") {
            initSmoothScroll();
            ScrollTrigger.refresh();
          }
        }, 10);

        gsap.fromTo(
          data.next.container,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.8,
            clearProps: "all",
            onComplete: () => {
              ScrollTrigger.refresh();
            },
          },
        );
      },
    },
  ],
});
