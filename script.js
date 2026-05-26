/* =============================================
   장기봉 포트폴리오 - script.js
   =============================================
   01. 헤더 스크롤 효과
   02. 햄버거 메뉴
   03. 타이핑 애니메이션
   04. 숫자 카운팅 애니메이션
   05. 스크롤 진입 애니메이션 (IntersectionObserver)
   06. 스킬바 애니메이션
   07. 스킬 탭 전환
   08. 네비게이션 액티브 표시
   09. 스크롤 탑 버튼
   10. 부드러운 스크롤 (앵커 링크)
============================================= */

"use strict";

/* =============================================
   01. 헤더 스크롤 효과
============================================= */
(function initHeaderScroll() {
    const header = document.getElementById("header");
    if (!header) return;

    const onScroll = () => {
        if (window.scrollY > 40) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // 초기 실행
})();

/* =============================================
   02. 햄버거 메뉴 (모바일)
============================================= */
(function initHamburger() {
    const hamburger = document.getElementById("hamburger");
    const mobileMenu = document.getElementById("mobile-menu");
    if (!hamburger || !mobileMenu) return;

    const toggle = (forceClose = false) => {
        const isOpen = !forceClose && !hamburger.classList.contains("open");

        hamburger.classList.toggle("open", isOpen);
        mobileMenu.classList.toggle("open", isOpen);
        hamburger.setAttribute("aria-expanded", String(isOpen));
        mobileMenu.setAttribute("aria-hidden", String(!isOpen));
    };

    // 버튼 클릭
    hamburger.addEventListener("click", () => toggle());

    // 모바일 메뉴 링크 클릭 시 닫기
    mobileMenu.querySelectorAll(".mobile-nav-link").forEach((link) => {
        link.addEventListener("click", () => toggle(true));
    });

    // 메뉴 외부 클릭 시 닫기
    document.addEventListener("click", (e) => {
        if (
            hamburger.classList.contains("open") &&
            !hamburger.contains(e.target) &&
            !mobileMenu.contains(e.target)
        ) {
            toggle(true);
        }
    });

    // ESC 키 닫기
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && hamburger.classList.contains("open")) {
            toggle(true);
            hamburger.focus();
        }
    });
})();

/* =============================================
   03. 타이핑 애니메이션
============================================= */
(function initTyped() {
    const el = document.getElementById("typed-text");
    if (!el) return;

    const words = ["& UI/UX 디자이너", "웹 접근성 전문가", "크로스브라우징 마스터", "& 퍼블리셔"];
    let wIdx = 0;
    let cIdx = 0;
    let deleting = false;
    let timer = null;

    const TYPING_SPEED = 100; // 타이핑 속도 (ms)
    const DELETE_SPEED = 60; // 삭제 속도 (ms)
    const PAUSE_END = 2000; // 단어 완성 후 대기 (ms)
    const PAUSE_START = 400; // 삭제 완료 후 대기 (ms)

    const type = () => {
        const current = words[wIdx];

        if (!deleting) {
            // 타이핑
            cIdx++;
            el.textContent = current.slice(0, cIdx);

            if (cIdx === current.length) {
                // 단어 완성 → 대기 후 삭제 시작
                deleting = true;
                timer = setTimeout(type, PAUSE_END);
                return;
            }
            timer = setTimeout(type, TYPING_SPEED);
        } else {
            // 삭제
            cIdx--;
            el.textContent = current.slice(0, cIdx);

            if (cIdx === 0) {
                // 삭제 완료 → 다음 단어
                deleting = false;
                wIdx = (wIdx + 1) % words.length;
                timer = setTimeout(type, PAUSE_START);
                return;
            }
            timer = setTimeout(type, DELETE_SPEED);
        }
    };

    // 접근성: prefers-reduced-motion 존중
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
        el.textContent = words[0];
        return;
    }

    // 1초 딜레이 후 시작
    timer = setTimeout(type, 1000);
})();

/* =============================================
   04. 숫자 카운팅 애니메이션
============================================= */
(function initCountUp() {
    const nums = document.querySelectorAll(".stat-num[data-target]");
    if (!nums.length) return;

    const easeOut = (t) => 1 - Math.pow(1 - t, 3); // ease-out cubic
    const DURATION = 1800; // ms

    const animateNum = (el) => {
        if (el.dataset.animated) return;
        el.dataset.animated = "true";

        const target = parseInt(el.dataset.target, 10);
        const start = performance.now();

        const step = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / DURATION, 1);
            const value = Math.floor(easeOut(progress) * target);

            el.textContent = value;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target;
            }
        };

        requestAnimationFrame(step);
    };

    // IntersectionObserver로 뷰포트 진입 시 실행
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateNum(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.5 },
    );

    nums.forEach((num) => observer.observe(num));
})();

/* =============================================
   05. 스크롤 진입 애니메이션 (fade-up)
============================================= */
(function initFadeUp() {
    const elements = document.querySelectorAll(".fade-up");
    if (!elements.length) return;

    // prefers-reduced-motion: 즉시 표시
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        elements.forEach((el) => el.classList.add("visible"));
        return;
    }

    // 딜레이 자동 부여 (같은 섹션 내 형제 요소)
    const sections = {};
    elements.forEach((el) => {
        const section = el.closest("section, .cert-row, .works-grid, .skill-list, .tools-grid");
        if (!section) return;
        const key = section.id || section.className;
        if (!sections[key]) sections[key] = [];
        sections[key].push(el);
    });

    Object.values(sections).forEach((group) => {
        group.forEach((el, i) => {
            el.style.transitionDelay = `${i * 0.1}s`;
        });
    });

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -40px 0px",
        },
    );

    elements.forEach((el) => observer.observe(el));
})();

/* =============================================
   06. 스킬바 채워지기 애니메이션
============================================= */
(function initSkillBars() {
    const fills = document.querySelectorAll(".skill-bar__fill");
    if (!fills.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const fill = entry.target;
                    const width = fill.dataset.width || "0";
                    // 약간의 딜레이 후 트랜지션 실행
                    setTimeout(() => {
                        fill.style.width = width + "%";
                    }, 200);
                    observer.unobserve(fill);
                }
            });
        },
        { threshold: 0.3 },
    );

    fills.forEach((fill) => observer.observe(fill));
})();

/* =============================================
   07. 스킬 탭 전환
============================================= */
(function initSkillTabs() {
    const tabs = document.querySelectorAll(".skill-tab");
    const panels = document.querySelectorAll(".skills__panel");
    if (!tabs.length || !panels.length) return;

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const targetId = tab.getAttribute("aria-controls");

            // 모든 탭 비활성화
            tabs.forEach((t) => {
                t.classList.remove("skill-tab--active");
                t.setAttribute("aria-selected", "false");
            });

            // 모든 패널 숨김
            panels.forEach((p) => {
                p.classList.add("skills__panel--hidden");
            });

            // 선택된 탭 & 패널 활성화
            tab.classList.add("skill-tab--active");
            tab.setAttribute("aria-selected", "true");

            const panel = document.getElementById(targetId);
            if (panel) {
                panel.classList.remove("skills__panel--hidden");

                // 패널이 새로 보일 때 스킬바 재애니메이션
                const fills = panel.querySelectorAll(".skill-bar__fill");
                fills.forEach((fill) => {
                    // 이미 채워진 경우 재실행 방지
                    if (!fill.dataset.animated) {
                        fill.dataset.animated = "true";
                        const width = fill.dataset.width || "0";
                        fill.style.width = "0%";
                        setTimeout(() => {
                            fill.style.width = width + "%";
                        }, 100);
                    }
                });

                // fade-up 재실행
                const fadeEls = panel.querySelectorAll(".fade-up");
                fadeEls.forEach((el, i) => {
                    el.style.transitionDelay = `${i * 0.08}s`;
                    el.classList.add("visible");
                });
            }
        });

        // 키보드 접근성: 화살표 키 탭 이동
        tab.addEventListener("keydown", (e) => {
            const tabList = Array.from(tabs);
            const idx = tabList.indexOf(tab);
            let newIdx = -1;

            if (e.key === "ArrowRight") newIdx = (idx + 1) % tabList.length;
            if (e.key === "ArrowLeft") newIdx = (idx - 1 + tabList.length) % tabList.length;

            if (newIdx >= 0) {
                e.preventDefault();
                tabList[newIdx].focus();
                tabList[newIdx].click();
            }
        });
    });
})();

/* =============================================
   08. 네비게이션 액티브 표시 (스크롤 감지)
============================================= */
(function initActiveNav() {
    const navLinks = document.querySelectorAll(".nav-link[data-section]");
    const mobileLinks = document.querySelectorAll(".mobile-nav-link[data-section]");
    const sections = document.querySelectorAll("section[id]");
    if (!sections.length) return;

    const setActive = (id) => {
        [...navLinks, ...mobileLinks].forEach((link) => {
            const match = link.dataset.section === id;
            link.classList.toggle("active", match);
        });
    };

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActive(entry.target.id);
                }
            });
        },
        {
            rootMargin: `-${document.getElementById("header")?.offsetHeight || 72}px 0px -60% 0px`,
            threshold: 0,
        },
    );

    sections.forEach((sec) => observer.observe(sec));
})();

/* =============================================
   09. 스크롤 탑 버튼
============================================= */
(function initScrollTop() {
    const btn = document.getElementById("scrollTop");
    if (!btn) return;

    const onScroll = () => {
        if (window.scrollY > 400) {
            btn.removeAttribute("hidden");
        } else {
            btn.setAttribute("hidden", "");
        }
    };

    btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
})();

/* =============================================
   10. 부드러운 앵커 스크롤
============================================= */
(function initSmoothScroll() {
    const HEADER_H = () => document.getElementById("header")?.offsetHeight || 72;

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", (e) => {
            const href = anchor.getAttribute("href");
            if (href === "#") return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();

            const top = target.getBoundingClientRect().top + window.scrollY - HEADER_H();
            window.scrollTo({ top, behavior: "smooth" });

            // 포커스 접근성
            target.setAttribute("tabindex", "-1");
            target.focus({ preventScroll: true });
        });
    });
})();

/* =============================================
   11. 프로젝트 필터 (works.html)
============================================= */
(function initProjectFilter() {
    const filterButtons = document.querySelectorAll(".project-filter__btn");
    const projectCards = document.querySelectorAll(".project-card[data-category]");
    if (!filterButtons.length || !projectCards.length) return;

    const applyFilter = (filter) => {
        projectCards.forEach((card, index) => {
            const categories = (card.dataset.category || "").split(/\s+/).filter(Boolean);
            const visible = filter === "all" || categories.includes(filter);

            card.classList.toggle("is-hidden", !visible);

            if (visible) {
                card.style.transitionDelay = `${Math.min(index * 0.05, 0.3)}s`;
                requestAnimationFrame(() => {
                    card.classList.add("visible");
                });
            }
        });
    };

    filterButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const filter = btn.dataset.filter;

            filterButtons.forEach((b) => {
                b.classList.remove("project-filter__btn--active");
                b.setAttribute("aria-selected", "false");
            });

            btn.classList.add("project-filter__btn--active");
            btn.setAttribute("aria-selected", "true");
            applyFilter(filter);
        });
    });

    applyFilter("all");
})();

/* =============================================
   초기화 완료 로그
============================================= */
console.log(
    "%c KIBONG PORTFOLIO ",
    "background:#2563EB;color:#fff;font-size:14px;font-weight:bold;padding:4px 8px;border-radius:4px;",
    "\n웹 퍼블리셔 장기봉의 포트폴리오입니다 🚀",
);
