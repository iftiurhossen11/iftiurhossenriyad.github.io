/* ============================================
   PORTFOLIO SCRIPT — MD Iftiur Hossen Riyad
   ============================================ */

(function () {
  'use strict';

  /* 1. THEME TOGGLE */
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;

  const savedTheme = localStorage.getItem('theme') || 'dark';
  html.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

  /* 2. MOBILE HAMBURGER MENU */
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('open');
    });

    document.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('open');
      });
    });

    document.addEventListener('click', (e) => {
      if (
        navMenu.classList.contains('open') &&
        !navMenu.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('open');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('open');
      }
    });
  }

  /* 3. NAVBAR SCROLL EFFECT */
  const navbar = document.getElementById('navbar');

  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  /* 4. ACTIVE NAV LINK ON SCROLL */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (sections.length && navLinks.length) {
    window.addEventListener('scroll', () => {
      let current = '';
      const scrollPos = window.scrollY + 120;

      sections.forEach((section) => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          current = section.getAttribute('id');
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
          link.classList.add('active');
        }
      });
    });
  }

  /* 5. SCROLL REVEAL ANIMATION */
  const revealElements = document.querySelectorAll(
    '.section-header, .about-grid, .skills-grid, .lab-box, .project-card, .mygenie-card, .research-card, .cert-card, .achievement-card, .leadership-card, .interactive-terminal, .creative-card, .timeline-item, .contact-grid'
  );

  revealElements.forEach((el) => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    revealElements.forEach((el) => observer.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('active'));
  }

  /* 6. SHARED COMMANDS DICTIONARY */
  const commands = {
    help: () => [
      { text: 'Available commands:', cls: 'info' },
      { text: '  cat about.txt      — Display personal background & philosophy', cls: 'muted' },
      { text: '  cat startup.txt    — View MyGenie startup overview', cls: 'muted' },
      { text: '  ls prototypes/     — List active prototypes & visions', cls: 'muted' },
      { text: '  fetch projects     — Display classic projects with GitHub links', cls: 'muted' },
      { text: '  cat certs.txt      — View certified security trainings', cls: 'muted' },
      { text: '  cat workflow.txt   — View development methodology', cls: 'muted' },
      { text: '  whoami             — Who am I?', cls: 'muted' },
      { text: '  contact --send     — Jump to contact form', cls: 'muted' },
      { text: '  clear              — Clear the terminal', cls: 'muted' },
    ],

    'cat about.txt': () => [
      { text: '═══════════════════════════════════════', cls: 'info' },
      { text: 'MD IFTIUR HOSSEN RIYAD', cls: 'success' },
      { text: '═══════════════════════════════════════', cls: 'info' },
      { text: 'Cyber Security Engineering Undergraduate @ UFTB', cls: '' },
      { text: 'Founder & CEO @ MyGenie', cls: '' },
      { text: 'Security Researcher & Tech Innovator', cls: '' },
      { text: '', cls: '' },
      { text: 'Location : Gazipur, Dhaka, Bangladesh', cls: 'muted' },
      { text: 'Focus    : IDS, Threat Detection, RAG AI, GRC', cls: 'muted' },
      { text: 'Mission  : Building secure, resilient,', cls: 'muted' },
      { text: '           human-centric technology ecosystems.', cls: 'muted' },
      { text: '', cls: '' },
      { text: 'Beyond security — Bengali poet, traveler,', cls: '' },
      { text: 'and independent historical researcher.', cls: '' },
    ],

    'cat startup.txt': () => [
      { text: '═══════════════════════════════════════', cls: 'info' },
      { text: 'MyGenie — AI-Powered Assistant', cls: 'success' },
      { text: '═══════════════════════════════════════', cls: 'info' },
      { text: 'Role     : Founder & CEO / Product & Security Lead', cls: '' },
      { text: 'Co-Founders : Md Eyasin (CTO), Md Zahed Hossen (COO)', cls: '' },
      { text: '', cls: '' },
      { text: 'Vision   : Empower South Asian small businesses', cls: 'muted' },
      { text: '           with a secure, Bangla-first AI assistant.', cls: 'muted' },
      { text: '', cls: '' },
      { text: 'Features : Bilingual AI · Workspace Isolation ·', cls: '' },
      { text: '           Multi-channel (WhatsApp, Messenger, Email)', cls: '' },
      { text: '           Human Staff Handoff · Prompt Grounding', cls: '' },
    ],

    'ls prototypes/': () => [
      { text: 'drwxr-xr-x  APON/         — Multi-Service Trusted Digital Ecosystem', cls: '' },
      { text: 'drwxr-xr-x  CampusNet/     — Secure Inter-University Network', cls: '' },
      { text: 'drwxr-xr-x  IR-Prohori/    — AI Assistant for Digital Safety', cls: '' },
      { text: 'drwxr-xr-x  NOJORGHOR/     — Threat Detection & Response Platform', cls: '' },
      { text: 'drwxr-xr-x  SURAKSHA/      — Emergency Alert & Rescue Coordination', cls: '' },
      { text: '', cls: '' },
      { text: '5 prototypes available. Use "fetch projects" for classic repos.', cls: 'info' },
    ],

    'fetch projects': () => [
      { text: 'Fetching classic engineering projects...', cls: 'info' },
      { text: '', cls: '' },
      { text: '▸ ThreatGuard — Intrusion Detection System', cls: 'success' },
      { text: '  https://github.com/iftiurhossenriyad/ThreatGuard-Intrusion-Detection-System', cls: 'muted' },
      { text: '', cls: '' },
      { text: '▸ SecureAudit — GRC Toolkit for Kali Linux', cls: 'success' },
      { text: '  https://github.com/iftiurhossenriyad/SecureAudRT', cls: 'muted' },
      { text: '', cls: '' },
      { text: '▸ Buy & Sell Platform — E-Commerce DSA App', cls: 'success' },
      { text: '  https://github.com/iftiurhossenriyad/Buy-And-Sell-Platform', cls: 'muted' },
      { text: '', cls: '' },
      { text: '▸ EduQuiz — Full-Stack E-Learning Platform', cls: 'success' },
      { text: '  https://github.com/iftiurhossenriyad/eduquiz', cls: 'muted' },
    ],

    'cat certs.txt': () => [
      { text: '═══════════════════════════════════════', cls: 'info' },
      { text: 'Certifications — Red Team Leaders / TCM / 10MS', cls: 'success' },
      { text: '═══════════════════════════════════════', cls: 'info' },
      { text: '✓ AV/EDR Evasion Practical Techniques   (Aug 9, 2026)', cls: '' },
      { text: '✓ Offensive Agent AI Course             (Aug 9, 2026)', cls: '' },
      { text: '✓ Introduction to Bug Bounty            (Aug 12, 2026)', cls: '' },
      { text: '✓ Foundations of Log Analysis           (Aug 13, 2026)', cls: '' },
      { text: '✓ Malware Analysis Introduction v1      (Aug 13, 2026)', cls: '' },
      { text: '✓ Introduction to Offensive Security AI (Aug 17, 2026)', cls: '' },
      { text: '✓ AI 100: Fundamentals (TCM)            (Aug 7, 2026)', cls: '' },
      { text: '✓ Programming 100: Fundamentals (TCM)   (Aug 6, 2026)', cls: '' },
      { text: '✓ Linux 100: Fundamentals (TCM)         (Jan 15, 2026)', cls: '' },
      { text: '✓ C Programming Fundamentals (10MS)     (Feb 18, 2026)', cls: '' },
    ],

    'cat workflow.txt': () => [
      { text: '═══════════════════════════════════════', cls: 'info' },
      { text: 'Development Methodology', cls: 'success' },
      { text: '═══════════════════════════════════════', cls: 'info' },
      { text: '▪ Security-by-Design & Zero Trust', cls: '' },
      { text: '  RBAC, workspace isolation, least-privilege.', cls: 'muted' },
      { text: '▪ Modular Architecture', cls: '' },
      { text: '  Clean OOP C++/Java, decoupled microservices,', cls: 'muted' },
      { text: '  standardized REST API contracts.', cls: 'muted' },
      { text: '▪ Bilingual & Grounded UX', cls: '' },
      { text: '  Bangla + English interfaces with strict', cls: 'muted' },
      { text: '  prompt grounding, low hallucination.', cls: 'muted' },
      { text: '▪ Agile Execution & Prototyping', cls: '' },
      { text: '  Rapid MVP deployment, iterative threat modeling,', cls: 'muted' },
      { text: '  dynamic risk auditing, continuous testing.', cls: 'muted' },
    ],

    whoami: () => [
      { text: 'md_iftiur_hossen_riyad', cls: 'success' },
      { text: 'Cyber Security Engineer · Founder · Poet', cls: 'muted' },
    ],

    'contact --send': () => {
      const contact = document.getElementById('contact');
      if (contact) {
        contact.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          const nameInput = document.getElementById('name');
          if (nameInput) nameInput.focus();
        }, 800);
      }
      return [{ text: 'Redirecting to contact form...', cls: 'success' }];
    },

    clear: () => {
      const fullWin = document.getElementById('terminalWindow');
      const heroWin = document.getElementById('heroTerminalBody');
      if (fullWin) fullWin.innerHTML = '';
      if (heroWin) heroWin.innerHTML = '';
      return [];
    },
  };

  commands['ls'] = commands['ls prototypes/'];
  commands['projects'] = commands['fetch projects'];
  commands['certs'] = commands['cat certs.txt'];

  /* 7. UTILITY */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* 8. FULL TERMINAL MODE */
  const terminalWindow = document.getElementById('terminalWindow');
  const terminalInput = document.getElementById('terminalInput');

  if (terminalWindow && terminalInput) {
    let history = [];
    let historyIndex = -1;

    function printOutput(text, cls) {
      const line = document.createElement('div');
      line.className = 'terminal-line';
      const output = document.createElement('span');
      output.className = 'output ' + (cls || '');
      output.textContent = text;
      line.appendChild(output);
      terminalWindow.appendChild(line);
      terminalWindow.scrollTop = terminalWindow.scrollHeight;
    }

    function handleCommand(raw) {
      const input = raw.trim();
      if (!input) return;

      const echoLine = document.createElement('div');
      echoLine.className = 'terminal-line';
      echoLine.innerHTML =
        '<span class="prompt">riyad@security-lab:~$</span>' +
        '<span class="output"> ' +
        escapeHtml(input) +
        '</span>';
      terminalWindow.appendChild(echoLine);
      terminalWindow.scrollTop = terminalWindow.scrollHeight;

      history.push(input);
      historyIndex = history.length;

      const fn = commands[input];
      if (typeof fn === 'function') {
        const result = fn();
        if (Array.isArray(result)) {
          result.forEach((l) => printOutput(l.text, l.cls));
        }
      } else {
        printOutput(
          `command not found: ${input}. Type "help" for available commands.`,
          'error'
        );
      }

      const blank = document.createElement('div');
      blank.className = 'terminal-line';
      blank.innerHTML = '&nbsp;';
      terminalWindow.appendChild(blank);
      terminalWindow.scrollTop = terminalWindow.scrollHeight;
    }

    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const value = terminalInput.value;
        terminalInput.value = '';
        handleCommand(value);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
          historyIndex--;
          terminalInput.value = history[historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < history.length - 1) {
          historyIndex++;
          terminalInput.value = history[historyIndex];
        } else {
          historyIndex = history.length;
          terminalInput.value = '';
        }
      }
    });

    const terminalSection = document.getElementById('terminal');
    if (terminalSection) {
      terminalSection.addEventListener('click', () => {
        terminalInput.focus();
      });
    }
  }

  /* 9. HERO INTERACTIVE TERMINAL */
  const heroTerminalBody = document.getElementById('heroTerminalBody');
  const heroTerminalInput = document.getElementById('heroTerminalInput');

  if (heroTerminalBody && heroTerminalInput) {
    let heroHistory = [];
    let heroHistoryIndex = -1;

    function heroPrintOutput(text, cls) {
      const line = document.createElement('div');
      line.className = 'terminal-line';
      const span = document.createElement('span');
      span.className = 'output ' + (cls || '');
      span.textContent = text;
      line.appendChild(span);
      heroTerminalBody.appendChild(line);
      heroTerminalBody.scrollTop = heroTerminalBody.scrollHeight;
    }

    function heroHandleCommand(raw) {
      const input = raw.trim();
      if (!input) return;

      const echo = document.createElement('div');
      echo.className = 'terminal-line';
      echo.innerHTML =
        '<span class="prompt">$</span>' +
        '<span class="output"> ' +
        escapeHtml(input) +
        '</span>';
      heroTerminalBody.appendChild(echo);

      heroHistory.push(input);
      heroHistoryIndex = heroHistory.length;

      const fn = commands[input];
      if (typeof fn === 'function') {
        const result = fn();
        if (Array.isArray(result)) {
          result.forEach((l) => heroPrintOutput(l.text, l.cls));
        }
      } else {
        heroPrintOutput(
          `command not found: ${input}. Type "help" for available commands.`,
          'error'
        );
      }

      const blank = document.createElement('div');
      blank.className = 'terminal-line';
      blank.innerHTML = '&nbsp;';
      heroTerminalBody.appendChild(blank);
      heroTerminalBody.scrollTop = heroTerminalBody.scrollHeight;
    }

    heroTerminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const value = heroTerminalInput.value;
        heroTerminalInput.value = '';
        heroHandleCommand(value);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (heroHistoryIndex > 0) {
          heroHistoryIndex--;
          heroTerminalInput.value = heroHistory[heroHistoryIndex];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (heroHistoryIndex < heroHistory.length - 1) {
          heroHistoryIndex++;
          heroTerminalInput.value = heroHistory[heroHistoryIndex];
        } else {
          heroHistoryIndex = heroHistory.length;
          heroTerminalInput.value = '';
        }
      }
    });

    const preview = heroTerminalBody.closest('.terminal-preview');
    if (preview) {
      preview.addEventListener('click', () => heroTerminalInput.focus());
    }
  }

  /* 10. CONTACT FORM — AJAX SUBMIT */
  const contactForm = document.querySelector('.contact-form');

  if (contactForm) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'form-message';
    msgDiv.style.display = 'none';
    contactForm.appendChild(msgDiv);

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      msgDiv.style.display = 'none';
      msgDiv.className = 'form-message';

      try {
        const formData = new FormData(contactForm);
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          msgDiv.classList.add('success');
          msgDiv.textContent = '✅ Message sent successfully! I will get back to you soon.';
          msgDiv.style.display = 'block';
          contactForm.reset();
        } else {
          const data = await response.json().catch(() => ({}));
          msgDiv.classList.add('error');
          msgDiv.textContent = '❌ ' + (data.error || 'Something went wrong. Please try again.');
          msgDiv.style.display = 'block';
        }
      } catch (err) {
        msgDiv.classList.add('error');
        msgDiv.textContent = '❌ Network error. Please check your connection.';
        msgDiv.style.display = 'block';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  /* 11. CONSOLE EASTER EGG */
  console.log(
    '%c👋 Hello, curious developer!',
    'color: #00d9ff; font-size: 16px; font-weight: bold;'
  );
  console.log(
    '%cLooking for bugs? Feel free to reach out:',
    'color: #9ba8b8; font-size: 12px;'
  );
  console.log(
    '%cmdiftiurhossenriyad@gmail.com',
    'color: #10b981; font-size: 12px; font-family: monospace;'
  );
})();