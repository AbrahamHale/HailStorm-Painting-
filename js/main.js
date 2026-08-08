// HailStorm Painting — site interactions

// Mobile navigation toggle
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');

navToggle.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});

// Close the mobile menu when a link is tapped
mainNav.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    mainNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
});

// Show a confirmation note when the contact form is submitted
const contactForm = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');

contactForm.addEventListener('submit', () => {
  formNote.hidden = false;
});

// Keep the footer year current
document.getElementById('year').textContent = new Date().getFullYear();

// Prefer the original PNG badge in the hero if images/logo.png is uploaded
const heroLogo = document.getElementById('heroLogo');

if (heroLogo) {
  const probe = new Image();
  probe.onload = () => {
    heroLogo.src = 'images/logo.png';
    heroLogo.classList.add('is-photo');
  };
  probe.src = 'images/logo.png';
}
