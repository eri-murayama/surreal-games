/* Navbar scroll effect */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
});

/* Hamburger menu */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

/* Category filter tabs */
const tabs = document.querySelectorAll('.category-tab');
const cards = document.querySelectorAll('.article-card');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const category = tab.dataset.category;

    cards.forEach(card => {
      if (category === 'all' || card.dataset.category === category) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });

    /* featuredカードはAllのときだけ横幅いっぱい */
    const featured = document.querySelector('.article-card.featured');
    if (featured) {
      featured.style.gridColumn = category === 'all' ? '1 / -1' : '';
      featured.style.gridTemplateColumns = category === 'all' ? '1.2fr 1fr' : '';
    }
  });
});

/* Newsletter form */
document.getElementById('newsletterForm').addEventListener('submit', (e) => {
  e.preventDefault();
  alert('サンプルのため送信されません');
});

/* Fade-in on scroll (Intersection Observer) */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
