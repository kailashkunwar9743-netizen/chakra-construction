/* =========================================================
   CHAKRA CONSTRUCTION — SCRIPT.JS
   Fourteen small, independent features live in this file:
     1. Mobile hamburger menu
     2. Gallery lightbox (click a photo to enlarge it)
     3. Scroll-reveal animation (fade/slide-in as you scroll)
     4. 3D tilt effect on cards (desktop hover only)
     5. Contact form validation + mailto submit (no backend yet)
     6. Dark / light mode toggle
     7. Animated statistics counters
     8. Construction story interactive timeline
     9. Interactive machinery cards
     10. Project planning form validation + mailto submit
     11. Scroll-driven "build the project" building animation
     12. Cinematic intro overlay
     13. Blueprint vs reality slider
     14. Interactive service-area map
========================================================= */

/* ---------- 1. MOBILE HAMBURGER MENU ---------- */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  // toggle the "open" class, which style.css uses to slide the menu in/out
  const isOpen = navLinks.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', isOpen);
});

// Close the mobile menu automatically after tapping a link
navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

/* ---------- 2. GALLERY LIGHTBOX ---------- */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');

// Every photo with the "gallery-img" class opens the lightbox when clicked
document.querySelectorAll('.gallery-img').forEach((img) => {
  img.addEventListener('click', () => {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add('open');
  });
});

function closeLightbox() {
  lightbox.classList.remove('open');
  lightboxImg.src = '';
}

lightboxClose.addEventListener('click', closeLightbox);

// Also close if the visitor clicks the dark background (not the image itself)
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});

// Also close on the Escape key
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeLightbox();
});

/* ---------- 3. SCROLL-REVEAL ANIMATION ----------
   Every element with class="reveal" starts hidden (see style.css).
   IntersectionObserver watches the page and adds "in-view" to
   each one the moment it scrolls into the viewport, which
   triggers the fade + slide-up transition. Once revealed, an
   element stays revealed (we stop observing it). */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

/* ---------- 4. 3D TILT CARDS ----------
   On mouse move over a .tilt-card, we work out how far the
   cursor is from the card's center (as a -1 to 1 value on each
   axis) and use that to rotate the card slightly in 3D. Moving
   the mouse away resets it flat. Skipped on touch devices, since
   there's no hover there. */
const supportsHover = window.matchMedia('(hover: hover)').matches;

if (supportsHover) {
  document.querySelectorAll('.tilt-card').forEach((card) => {
    card.addEventListener('mousemove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;  // -0.5 to 0.5
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      const maxTilt = 6; // degrees — kept small so it feels subtle, not gimmicky
      card.style.transform = `perspective(700px) rotateX(${-y * maxTilt}deg) rotateY(${x * maxTilt}deg) scale(1.015)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg) scale(1)';
    });
  });
}

/* ---------- 5. CONTACT FORM ----------
   This version has no backend yet, so instead of sending the
   data to a server, we:
     a) check that the required fields are filled in
     b) open the visitor's email app with the message pre-filled
   When a backend is added later, replace the "mailto" part
   below with a fetch() call to your API endpoint. */
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

contactForm.addEventListener('submit', (event) => {
  event.preventDefault(); // stop the page from reloading

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const projectType = document.getElementById('projectType').value;
  const message = document.getElementById('message').value.trim();

  if (!name || !email || !message) {
    formStatus.textContent = 'Please fill in your name, email and message.';
    return;
  }

  // Build a pre-filled email to the company address
  const subject = encodeURIComponent(`Website inquiry — ${projectType}`);
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nProject Type: ${projectType}\n\nMessage:\n${message}`
  );

  window.location.href = `mailto:chakraconstructionpvtltd@gmail.com?subject=${subject}&body=${body}`;

  formStatus.textContent = 'Opening your email app to send this message...';
  contactForm.reset();
});

/* ---------- 6. DARK / LIGHT MODE TOGGLE ----------
   The theme lives as data-theme="dark" or "light" on <html>,
   which style.css's CSS variables key off. We check localStorage
   first (the visitor's last choice), then fall back to their
   system's light/dark setting, then default to dark. */
const themeToggle = document.getElementById('themeToggle');
const htmlEl = document.documentElement;

function applyTheme(theme) {
  htmlEl.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'light' ? '☀️' : '🌙';
}

const savedTheme = localStorage.getItem('chakra-theme');
const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
applyTheme(savedTheme || (systemPrefersLight ? 'light' : 'dark'));

themeToggle.addEventListener('click', () => {
  const next = htmlEl.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  applyTheme(next);
  localStorage.setItem('chakra-theme', next);
});

/* ---------- 7. ANIMATED STATISTICS ----------
   Each .stat-number has a data-target (the final value). When
   the stats strip scrolls into view, we count up from 0 to that
   number over about a second. Runs once per page load. */
const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 1000; // milliseconds
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(progress * target);
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      statObserver.unobserve(el);
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll('.stat-number').forEach((el) => statObserver.observe(el));

/* ---------- 8. CONSTRUCTION STORY TIMELINE ----------
   Clicking a step: marks it active, shows its matching
   description (matched by data-index), and grows the progress
   line to that step's position along the track. */
const timelineSteps = document.querySelectorAll('.timeline-step');
const timelineDescs = document.querySelectorAll('.timeline-desc');
const timelineProgress = document.getElementById('timelineProgress');

function setActiveStep(index) {
  timelineSteps.forEach((step) => {
    step.classList.toggle('active', step.dataset.index === String(index));
  });
  timelineDescs.forEach((desc) => {
    desc.hidden = desc.dataset.index !== String(index);
  });
  const percent = (index / (timelineSteps.length - 1)) * 100;
  timelineProgress.style.width = `${percent}%`;
}

timelineSteps.forEach((step) => {
  step.addEventListener('click', () => setActiveStep(step.dataset.index));
});

/* ---------- 9. INTERACTIVE MACHINERY CARDS ----------
   Tapping a card toggles its "open" class, which style.css uses
   to expand/collapse the description underneath. */
document.querySelectorAll('.machine-card').forEach((card) => {
  card.addEventListener('click', () => card.classList.toggle('open'));
});

/* ---------- 10. PROJECT PLANNING FORM ----------
   Same no-backend-yet approach as the contact form: validate,
   then hand off to the visitor's email app via mailto. */
const planForm = document.getElementById('planForm');
const planFormStatus = document.getElementById('planFormStatus');

planForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const buildingType = document.getElementById('buildingType').value;
  const area = document.getElementById('area').value.trim();
  const location = document.getElementById('planLocation').value.trim();
  const requirements = document.getElementById('requirements').value.trim();
  const wantsBudget = document.querySelector('[name="wantsBudget"]').checked;
  const wantsConsultation = document.querySelector('[name="wantsConsultation"]').checked;

  if (!location || !requirements) {
    planFormStatus.textContent = 'Please fill in the location and project requirements.';
    return;
  }

  const subject = encodeURIComponent(`Project Inquiry — ${buildingType}`);
  const body = encodeURIComponent(
    `Building Type: ${buildingType}\nApproximate Area: ${area || 'Not specified'}\nLocation: ${location}\n` +
    `Wants Budget Estimate: ${wantsBudget ? 'Yes' : 'No'}\nWants Consultation: ${wantsConsultation ? 'Yes' : 'No'}\n\n` +
    `Requirements:\n${requirements}`
  );

  window.location.href = `mailto:chakraconstructionpvtltd@gmail.com?subject=${subject}&body=${body}`;

  planFormStatus.textContent = 'Opening your email app to send this inquiry...';
  planForm.reset();
});

/* ---------- 11. BUILD THE PROJECT (scroll-driven building) ----------
   The #build section is very tall and its content is "sticky", so the
   drawing stays on screen while you scroll. We turn how far you have
   scrolled through the section (0 to 1) into a stage number (0 to 7).
   Every .bld-part whose data-stage is <= the current stage gets the
   "on" class (style.css fades it in). Clicking a visible part shows its
   description. Visitors who prefer reduced motion see the finished
   building straight away. */
const buildSection = document.getElementById('build');
const buildParts = document.querySelectorAll('.bld-part');
const buildStageName = document.getElementById('buildStageName');
const buildStageDesc = document.getElementById('buildStageDesc');
const buildProgressFill = document.getElementById('buildProgressFill');
const buildInfo = document.getElementById('buildInfo');

const buildStages = [
  ['Idea & Blueprint', 'Every project starts as an idea and a set of drawings, before any ground is broken.'],
  ['Foundation', 'The foundation goes in first. Raft and mat foundations spread the building load over the ground.'],
  ['Columns', 'Reinforced columns rise from the foundation to carry the structure.'],
  ['Beams & Slabs', 'Beams and slabs tie the columns together and form each floor.'],
  ['Walls', 'Walls enclose the space and give the building its shape.'],
  ['Roof', 'The roof completes the structure and protects it from the weather.'],
  ['Finishing', 'Doors, windows, plaster and paint make the building ready for use.'],
  ['Completed Building', 'Inspected, quality-checked and ready to hand over.']
];

let currentBuildStage = -1;

function setBuildStage(stage) {
  if (stage === currentBuildStage) return;
  currentBuildStage = stage;
  buildParts.forEach((part) => {
    part.classList.toggle('on', Number(part.dataset.stage) <= stage);
  });
  buildStageName.textContent = buildStages[stage][0];
  buildStageDesc.textContent = buildStages[stage][1];
  buildProgressFill.style.width = `${(stage / (buildStages.length - 1)) * 100}%`;
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function updateBuildFromScroll() {
  if (reduceMotion) { setBuildStage(buildStages.length - 1); return; }
  const rect = buildSection.getBoundingClientRect();
  const scrollable = rect.height - window.innerHeight;
  const progress = Math.min(Math.max(-rect.top / scrollable, 0), 1);
  setBuildStage(Math.min(Math.floor(progress * buildStages.length), buildStages.length - 1));
}

let buildTicking = false;
window.addEventListener('scroll', () => {
  if (buildTicking) return;
  buildTicking = true;
  requestAnimationFrame(() => { updateBuildFromScroll(); buildTicking = false; });
}, { passive: true });
updateBuildFromScroll();

// Tapping a visible part shows what it does
buildParts.forEach((part) => {
  part.addEventListener('click', () => {
    buildParts.forEach((p) => p.classList.remove('picked'));
    part.classList.add('picked');
    buildInfo.textContent = part.dataset.info;
  });
});

/* ---------- 12. CINEMATIC INTRO ----------
   The overlay (in index.html) draws blueprint lines, shows the logo,
   then waits for "Enter Project". We remember that it was seen for
   this browser session so it doesn't replay on every scroll-up/refresh. */
const intro = document.getElementById('intro');
if (intro) {
  const closeIntro = () => {
    intro.classList.add('leave');
    document.documentElement.classList.remove('intro-open');
    try { sessionStorage.setItem('chakra-intro', '1'); } catch (e) {}
    setTimeout(() => intro.remove(), 800);
  };
  document.getElementById('introEnter').addEventListener('click', closeIntro);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeIntro(); });
}

/* ---------- 13. BLUEPRINT vs REALITY SLIDER ----------
   The range input (invisible, on top) sets a CSS variable --pos.
   style.css uses it to clip the photo layer and place the handle. */
const compare = document.getElementById('compare');
const compareRange = document.getElementById('compareRange');
compareRange.addEventListener('input', () => {
  compare.style.setProperty('--pos', `${compareRange.value}%`);
});

/* ---------- 14. SERVICE-AREA MAP ----------
   To add a project to a town, add a line to its "projects" list.
   Only list projects that are real and confirmed. */
const areas = {
  Kohalpur: {
    text: 'Service area with completed and upcoming work.',
    projects: ['2-Storey Residential Building — Completed', 'Building Construction — Upcoming']
  },
  Nepalgunj: { text: 'Service area. Contact us to discuss a project here.', projects: [] },
  Dhangadhi: { text: 'Service area. Contact us to discuss a project here.', projects: [] },
  Ghorahi:   { text: 'Service area. Contact us to discuss a project here.', projects: [] }
};
const mapDots = document.querySelectorAll('.map-dot');
function showArea(name) {
  const area = areas[name];
  mapDots.forEach((d) => d.classList.toggle('active', d.dataset.area === name));
  document.getElementById('mapTitle').textContent = name;
  document.getElementById('mapText').textContent = area.text;
  const list = document.getElementById('mapList');
  list.innerHTML = '';
  area.projects.forEach((p) => {
    const li = document.createElement('li');
    li.textContent = p;
    list.appendChild(li);
  });
}
mapDots.forEach((dot) => {
  dot.addEventListener('click', () => showArea(dot.dataset.area));
  dot.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showArea(dot.dataset.area); }
  });
});
