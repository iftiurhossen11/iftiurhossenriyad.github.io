/* ============================================
   PORTFOLIO SCRIPT — Md Iftiur Hossen Riyad
   ============================================ */

(function () {
  'use strict';

  /* 1. THEME TOGGLE */
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;
  const languageToggle = document.getElementById('langToggle');
  let currentPost = null;

  const blogCategoryTranslationKeys = {
    technical: 'blog_category_technical',
    cybersecurity: 'blog_category_cybersecurity',
    tutorials: 'blog_category_tutorials',
    projects: 'blog_category_projects',
    poetry: 'blog_category_poetry',
    awareness: 'blog_category_awareness',
    personal: 'blog_category_personal'
  };

  function localizedPost(post, language) {
    return post.localized?.[language] || post;
  }

  function formatPostDate(post, language) {
    const publishedAt = new Date(post.publishedAt);
    if (Number.isNaN(publishedAt.getTime())) {
      console.error(`Blog post "${post.id}" has an invalid publication timestamp.`);
      return '';
    }
    const dateTime = new Intl.DateTimeFormat(language, {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: 'Asia/Dhaka',
      hourCycle: language === 'bn' ? 'h23' : undefined
    }).format(publishedAt);
    return `${dateTime} · ${translations[language].blog_timezone}`;
  }

  function updateBlogLanguage(language) {
    const cards = [...document.querySelectorAll('.blog-card[data-post-id]')];
    cards.forEach((card) => {
      const post = postsData?.[card.dataset.postId];
      if (!post) {
        console.error(`Blog card "${card.dataset.postId}" has no matching post data.`);
        return;
      }
      const localized = localizedPost(post, language);
      card.querySelector('[data-post-title]').textContent = localized.title;
      card.querySelector('[data-post-excerpt]').textContent = localized.excerpt;
      card.querySelector('[data-post-date]').dataset.publishedAt = post.publishedAt;
    });

    document.querySelectorAll('.blog-grid').forEach((grid) => {
      [...grid.querySelectorAll('.blog-card[data-post-id]')]
        .sort((left, right) => Date.parse(postsData[right.dataset.postId].publishedAt) -
          Date.parse(postsData[left.dataset.postId].publishedAt))
        .forEach((card) => grid.appendChild(card));
    });

    document.querySelectorAll('.blog-date[data-published-at]').forEach((date) => {
      const postId = date.closest('[data-post-id]')?.dataset.postId || 'blog entry';
      date.dateTime = date.dataset.publishedAt;
      date.textContent = formatPostDate(
        { id: postId, publishedAt: date.dataset.publishedAt },
        language
      );
    });

    if (!currentPost) return;

    const localized = localizedPost(currentPost, language);
    const author = localized.author || currentPost.author;
    const pageTitle = `${localized.title} — ${author}`;
    document.title = pageTitle;
    document.getElementById('pageTitle')?.replaceChildren(document.createTextNode(pageTitle));
    document.getElementById('ogTitle')?.setAttribute('content', pageTitle);
    document.getElementById('twitterTitle')?.setAttribute('content', pageTitle);
    document.querySelector('meta[name="description"]')?.setAttribute('content', localized.excerpt);
    document.getElementById('ogDescription')?.setAttribute('content', localized.excerpt);
    document.getElementById('twitterDescription')?.setAttribute('content', localized.excerpt);

    const category = document.getElementById('postCategory');
    const categoryKey = blogCategoryTranslationKeys[currentPost.category] || 'blog_category_technical';
    category.className = `blog-category ${currentPost.category}`;
    category.dataset.i18n = categoryKey;
    category.textContent = translations[language][categoryKey];

    const date = document.getElementById('postDate');
    date.dataset.publishedAt = currentPost.publishedAt;
    date.dateTime = currentPost.publishedAt;
    date.textContent = formatPostDate(currentPost, language);
    document.getElementById('postTitle').textContent = localized.title;
    document.getElementById('postByline').textContent =
      `${translations[language].post_by_author_prefix} ${author}`;
    document.getElementById('postContent').innerHTML = localized.content;
  }

  function getDhakaDateTimeInputValue() {
    const dateParts = Object.fromEntries(
      new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Dhaka',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
      }).formatToParts(new Date()).map(({ type, value }) => [type, value])
    );
    return `${dateParts.year}-${dateParts.month}-${dateParts.day}T${dateParts.hour}:${dateParts.minute}`;
  }

  function translatedMarkup(key, htmlContent = false) {
    if (!key) return '';
    const fallback = translations.en[key] || key;
    return `<span data-i18n="${escapeHtml(key)}"${htmlContent ? ' data-i18n-html' : ''}>${htmlContent ? fallback : escapeHtml(fallback)}</span>`;
  }

  function contentMarkup(key, value, htmlContent = false) {
    return key ? translatedMarkup(key, htmlContent) : escapeHtml(value || '');
  }

  function contentSpan(key, value) {
    if (!key) return `<span>${escapeHtml(value || '')}</span>`;
    const fallback = translations.en[key] || key;
    return `<span data-i18n="${escapeHtml(key)}">${escapeHtml(fallback)}</span>`;
  }

  function renderCertifications() {
    const container = document.getElementById('certGrid');
    if (!container) return;
    if (typeof certificationsData === 'undefined') {
      console.error('Certification data is unavailable.');
      return;
    }
    const icons = {
      star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8l-6.2 3.2L7 14.2 2 9.3l6.9-1L12 2z"/>',
      clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
      target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
      document: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
      layers: '<path d="m12 2 10 5-10 5L2 7l10-5z"/><path d="m2 12 10 5 10-5M2 17l10 5 10-5"/>',
      pin: '<path d="M12 22s7-5.7 7-13a7 7 0 1 0-14 0c0 7.3 7 13 7 13z"/><circle cx="12" cy="9" r="2.5"/>',
      code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
      terminal: '<path d="m4 17 6-6-6-6M12 19h8"/>',
      education: '<path d="m2 10 10-5 10 5-10 5-10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
      file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
      shield: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"/><path d="m9 12 2 2 4-4"/>',
      award: '<circle cx="12" cy="8" r="6"/><path d="m8.2 13-1.4 9L12 19l5.2 3-1.4-9"/>'
    };
    container.innerHTML = certificationsData.map((cert) => {
      const title = translations.en[cert.titleKey] || cert.title || 'Certificate';
      return `
        <article class="cert-card">
          <div class="cert-image-wrapper">
            <img src="${escapeHtml(cert.preview)}" alt="" class="cert-image" loading="lazy" decoding="async">
            <button class="cert-image-trigger" type="button" data-image="${escapeHtml(cert.image)}#view=FitH" data-title-key="${escapeHtml(cert.titleKey)}" aria-label="${escapeHtml(translations[html.lang]?.cert_view_certificate || translations.en.cert_view_certificate)}" data-i18n-aria-label="cert_view_certificate">
              <span class="cert-overlay"><span class="cert-view-btn">🔍 ${translatedMarkup('cert_view_certificate')}</span></span>
            </button>
          </div>
          <div class="cert-card-body">
            <div class="cert-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">${icons[cert.icon] || icons.star}</svg></div>
            <h4>${contentMarkup(cert.titleKey, cert.title)}</h4>
            <p class="cert-issuer">${escapeHtml(cert.issuer)}</p>
            <p class="cert-date">${contentMarkup(cert.dateKey, cert.date)}</p>
            <div class="cert-actions">
              <a href="${escapeHtml(cert.verifyUrl)}" target="_blank" rel="noopener noreferrer" class="cert-verify">${translatedMarkup('cert_verify')}</a>
              <a href="${escapeHtml(cert.image)}" target="_blank" rel="noopener noreferrer" class="cert-pdf-link">${translatedMarkup('cert_open_pdf')}</a>
            </div>
          </div>
        </article>
      `;
    }).join('');
    container.querySelectorAll('.cert-image').forEach((preview) => {
      preview.addEventListener('load', () => {
        preview.closest('.cert-image-wrapper').classList.add('is-loaded');
      }, { once: true });
      preview.addEventListener('error', () => {
        const wrapper = preview.closest('.cert-image-wrapper');
        wrapper.classList.add('image-error');
        wrapper.classList.remove('is-loaded');
      }, { once: true });
    });
    const search = document.getElementById('certSearch');
    if (search) {
      search.addEventListener('input', updateCertificationSearch);
      updateCertificationSearch();
    }
  }

  function updateCertificationSearch() {
    const search = document.getElementById('certSearch');
    const status = document.getElementById('certSearchStatus');
    const container = document.getElementById('certGrid');
    if (!search || !status || !container) return;

    const query = search.value.trim().normalize('NFKC').toLocaleLowerCase(html.lang);
    const cards = [...container.querySelectorAll('.cert-card')];
    let matches = 0;

    cards.forEach((card) => {
      const text = card.textContent.normalize('NFKC').toLocaleLowerCase(html.lang);
      const isMatch = !query || text.includes(query);
      card.classList.toggle('hidden', !isMatch);
      if (isMatch) matches += 1;
    });

    const number = (value) => new Intl.NumberFormat(html.lang).format(value);
    status.textContent = translations[html.lang].cert_search_status
      .replace('{matches}', number(matches))
      .replace('{total}', number(cards.length));
  }

  function initCertificationLightbox() {
    const container = document.getElementById('certGrid');
    const lightbox = document.getElementById('certLightbox');
    const lightboxImage = document.getElementById('certLightboxImage');
    const closeButton = document.getElementById('certLightboxClose');
    if (!container || !lightbox || !lightboxImage || !closeButton) return;

    let activeTrigger = null;
    const closeLightbox = () => {
      lightbox.style.display = 'none';
      lightboxImage.src = 'about:blank';
      document.body.classList.remove('cert-lightbox-open');
      if (activeTrigger) activeTrigger.focus();
      activeTrigger = null;
    };

    container.addEventListener('click', (event) => {
      const trigger = event.target.closest('.cert-image-trigger');
      if (!trigger) return;
      event.preventDefault();
      activeTrigger = trigger;
      const title = translations[html.lang]?.[trigger.dataset.titleKey] || 'Certificate';
      lightboxImage.src = trigger.dataset.image;
      lightboxImage.title = `${title} Certificate`;
      lightbox.style.display = 'flex';
      document.body.classList.add('cert-lightbox-open');
      closeButton.focus();
    });

    closeButton.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && lightbox.style.display !== 'none') {
        closeLightbox();
      }
    });
  }

  function renderSkills() {
    const container = document.getElementById('skillsGrid');
    if (!container) return;
    if (typeof skillsData === 'undefined') {
      console.error('Skills data is unavailable.');
      return;
    }
    container.innerHTML = skillsData.map((category) => `
      <div class="skill-card">
        <h3>${contentMarkup(category.titleKey, category.title)}</h3>
        <div class="skill-tags">
          ${category.tags.map((tag) => typeof tag === 'string' ? contentSpan('', tag) : contentSpan(tag.key, tag.label)).join('')}
        </div>
      </div>
    `).join('');
  }

  function renderProjectCards(projects, container) {
    if (!container) return;
    container.innerHTML = projects.map((project) => {
      const header = project.statusKey || project.statusLabel || project.status
        ? `<div class="project-header"><span class="project-status ${escapeHtml(project.status || '')}">${contentMarkup(project.statusKey, project.statusLabel || project.status)}</span><h3>${escapeHtml(project.name)}</h3><p class="project-role">${contentMarkup(project.roleKey, project.role)}</p></div>`
        : `<h3>${escapeHtml(project.name)}</h3><p class="project-role">${contentMarkup(project.roleKey, project.role)}</p>`;
      const features = project.features?.length
        ? `<div class="project-features">${project.features.map((feature) => typeof feature === 'string' ? contentSpan('', feature) : contentSpan(feature.key, feature.label)).join('')}</div>`
        : '';
      const tech = project.tech?.length
        ? `<div class="project-tech">${project.tech.map((tag) => typeof tag === 'string' ? contentSpan('', tag) : contentSpan(tag.key, tag.label)).join('')}</div>`
        : '';
      const context = project.contextKey || project.context
        ? `<p class="project-context">${contentMarkup(project.contextKey, project.context)}</p>`
        : '';
      const link = project.githubLink
        ? `<a href="${escapeHtml(project.githubLink)}" target="_blank" rel="noopener" class="project-link">${translatedMarkup('project_view_repository')}</a>`
        : '';
      const screenshots = Array.isArray(project.screenshots) && project.screenshots.length
        ? `<div class="project-screenshot-gallery">
            <button type="button" class="project-screenshot-main${project.visualType === 'mockup' ? ' project-ui-mockup' : ''}" data-project-name="${escapeHtml(project.name)}" aria-label="${escapeHtml(translations[html.lang]?.[project.visualType === 'mockup' ? 'project_view_ui_mockup' : 'project_view_image'] || 'View full-size project visual')}" data-i18n-aria-label="${project.visualType === 'mockup' ? 'project_view_ui_mockup' : 'project_view_image'}">
              <img src="${escapeHtml(project.screenshots[0])}" alt="" loading="lazy" decoding="async" />
              ${project.visualType === 'mockup' ? `<span class="project-mockup-label" data-i18n="project_ui_mockup">${translations[html.lang]?.project_ui_mockup || translations.en.project_ui_mockup}</span>` : ''}
              <span class="project-screenshot-zoom" aria-hidden="true">⤢</span>
            </button>
            ${project.screenshots.length > 1 ? `<div class="project-screenshots" role="group" aria-label="${escapeHtml(project.name)} screenshots">
              ${project.screenshots.map((image, index) => `
                <button type="button" class="screenshot-thumb${index === 0 ? ' active' : ''}" data-index="${index}" data-image="${escapeHtml(image)}" data-project-name="${escapeHtml(project.name)}" aria-pressed="${index === 0}" aria-label="Show ${escapeHtml(project.name)} screenshot ${index + 1}">
                  <img src="${escapeHtml(image)}" alt="" loading="lazy" />
                </button>`).join('')}
            </div>` : ''}
          </div>`
        : '';
      return `<article class="project-card">${screenshots}${header}<p class="project-desc">${contentMarkup(project.descriptionKey, project.description)}</p>${features}${tech}${context}${link}</article>`;
    }).join('');
  }

  function setProjectScreenshot(gallery, index) {
    const thumb = gallery.querySelector(`.screenshot-thumb[data-index="${index}"]`);
    const mainImage = gallery.querySelector('.project-screenshot-main img');
    const mainButton = gallery.querySelector('.project-screenshot-main');
    if (!mainImage || !mainButton) return null;
    if (!gallery.querySelector('.screenshot-thumb')) {
      return {
        imageUrl: mainImage.src,
        alt: mainImage.alt,
        projectName: mainButton.dataset.projectName,
        total: 1,
        isMockup: mainButton.classList.contains('project-ui-mockup')
      };
    }
    if (!thumb) return null;
    mainImage.src = thumb.dataset.image;
    mainImage.alt = `${thumb.dataset.projectName} screenshot ${index + 1}`;
    gallery.querySelectorAll('.screenshot-thumb').forEach((button) => {
      const isActive = button === thumb;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
    return {
      imageUrl: thumb.dataset.image,
      alt: mainImage.alt,
      projectName: thumb.dataset.projectName,
      total: gallery.querySelectorAll('.screenshot-thumb').length,
      isMockup: mainButton.classList.contains('project-ui-mockup')
    };
  }

  function initializeProjectImageViewer() {
    const viewer = document.createElement('dialog');
    viewer.className = 'project-image-viewer';
    viewer.setAttribute('aria-labelledby', 'projectImageViewerHeading');
    viewer.innerHTML = `
      <div class="project-image-viewer-content">
        <header class="project-image-viewer-header">
          <div>
            <p id="projectImageViewerHeading" data-i18n="project_image_viewer_title">Project screenshot</p>
            <h2 class="project-image-viewer-name"></h2>
          </div>
          <button type="button" class="project-image-viewer-close" data-i18n-aria-label="project_image_viewer_close" aria-label="Close image viewer">×</button>
        </header>
        <div class="project-image-viewer-stage">
          <button type="button" class="project-image-viewer-nav previous" data-direction="-1" data-i18n-aria-label="project_image_viewer_previous" aria-label="Previous screenshot">‹</button>
          <img class="project-image-viewer-image" alt="" />
          <button type="button" class="project-image-viewer-nav next" data-direction="1" data-i18n-aria-label="project_image_viewer_next" aria-label="Next screenshot">›</button>
        </div>
        <footer class="project-image-viewer-footer">
          <span class="project-image-viewer-count"></span>
          <span data-i18n="project_image_viewer_hint">Use the arrows to browse project screenshots</span>
        </footer>
      </div>`;
    document.body.appendChild(viewer);

    const image = viewer.querySelector('.project-image-viewer-image');
    const name = viewer.querySelector('.project-image-viewer-name');
    const count = viewer.querySelector('.project-image-viewer-count');
    const heading = viewer.querySelector('#projectImageViewerHeading');
    const footer = viewer.querySelector('.project-image-viewer-footer');
    const navigationButtons = viewer.querySelectorAll('.project-image-viewer-nav');
    const closeButton = viewer.querySelector('.project-image-viewer-close');
    let activeGallery = null;
    let activeIndex = 0;
    let lastTrigger = null;

    const showImage = (index) => {
      if (!activeGallery) return;
      const total = Math.max(activeGallery.querySelectorAll('.screenshot-thumb').length, 1);
      activeIndex = (index + total) % total;
      const selected = setProjectScreenshot(activeGallery, activeIndex);
      if (!selected) return;
      image.src = selected.imageUrl;
      image.alt = selected.alt || `${selected.projectName} ${translations[html.lang]?.[selected.isMockup ? 'project_ui_mockup' : 'project_image_viewer_title'] || ''}`;
      name.textContent = selected.projectName;
      count.textContent = `${activeIndex + 1} / ${total}`;
      navigationButtons.forEach((button) => { button.hidden = total < 2; });
      footer.hidden = total < 2;
      heading.dataset.i18n = selected.isMockup ? 'project_ui_mockup' : 'project_image_viewer_title';
      heading.textContent = translations[html.lang]?.[heading.dataset.i18n] || translations.en[heading.dataset.i18n];
    };

    document.addEventListener('click', (event) => {
      const thumb = event.target.closest('.project-screenshot-gallery .screenshot-thumb');
      if (thumb) {
        setProjectScreenshot(thumb.closest('.project-screenshot-gallery'), Number(thumb.dataset.index));
        return;
      }
      const trigger = event.target.closest('.project-screenshot-main');
      if (!trigger) return;
      activeGallery = trigger.closest('.project-screenshot-gallery');
      if (!activeGallery) return;
      lastTrigger = trigger;
      const selectedThumb = activeGallery.querySelector('.screenshot-thumb.active');
      showImage(Number(selectedThumb?.dataset.index || 0));
      viewer.showModal();
      document.body.classList.add('project-image-viewer-open');
      closeButton.focus();
    });

    viewer.addEventListener('click', (event) => {
      if (event.target === viewer) {
        viewer.close();
        return;
      }
      const navigation = event.target.closest('.project-image-viewer-nav');
      if (navigation) showImage(activeIndex + Number(navigation.dataset.direction));
    });

    viewer.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        viewer.close();
        return;
      }
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      showImage(activeIndex + (event.key === 'ArrowRight' ? 1 : -1));
    });

    viewer.addEventListener('close', () => {
      image.removeAttribute('src');
      activeGallery = null;
      document.body.classList.remove('project-image-viewer-open');
      if (lastTrigger?.isConnected) lastTrigger.focus();
      lastTrigger = null;
    });
    closeButton.addEventListener('click', () => viewer.close());
  }

  function renderProjects() {
    const featuredContainer = document.getElementById('featuredProjectsGrid');
    const classicContainer = document.getElementById('classicProjectsGrid');
    if (!featuredContainer && !classicContainer) return;
    if (typeof projectsData === 'undefined') {
      console.error('Project data is unavailable.');
      return;
    }
    renderProjectCards(projectsData.featured || [], featuredContainer);
    renderProjectCards(projectsData.classic || [], classicContainer);

    const search = document.getElementById('projectSearch');
    if (search) {
      search.addEventListener('input', updateProjectSearch);
      updateProjectSearch();
    }
  }

  function updateProjectSearch() {
    const search = document.getElementById('projectSearch');
    const status = document.getElementById('projectSearchStatus');
    if (!search || !status) return;

    const query = search.value.trim().normalize('NFKC').toLocaleLowerCase(html.lang);
    const cards = [...document.querySelectorAll('#featuredProjectsGrid .project-card, #classicProjectsGrid .project-card')];
    let matches = 0;

    cards.forEach((card) => {
      const text = card.textContent.normalize('NFKC').toLocaleLowerCase(html.lang);
      const isMatch = !query || text.includes(query);
      card.classList.toggle('hidden', !isMatch);
      if (isMatch) matches += 1;
    });

    const message = translations[html.lang].projects_search_status;
    status.textContent = message
      .replace('{matches}', new Intl.NumberFormat(html.lang).format(matches))
      .replace('{total}', new Intl.NumberFormat(html.lang).format(cards.length));
  }

  function renderAchievements() {
    const achievementContainer = document.getElementById('achievementsGrid');
    const leadershipContainer = document.getElementById('leadershipGrid');
    if (!achievementContainer && !leadershipContainer) return;
    if (typeof achievementsData === 'undefined') {
      console.error('Achievement data is unavailable.');
      return;
    }
    if (achievementContainer) {
      achievementContainer.innerHTML = achievementsData.achievements.map((item) => `
        <div class="achievement-card">
          <span class="achievement-badge">${contentMarkup(item.badgeKey, item.badge)}</span>
          <h3>${contentMarkup(item.titleKey, item.title)}</h3>
          <p class="achievement-org">${item.organizationKey ? translatedMarkup(item.organizationKey) : escapeHtml(item.organization)}</p>
          <p>${contentMarkup(item.descriptionKey, item.description, item.descriptionHtml)}</p>
        </div>
      `).join('');
    }
    if (leadershipContainer) {
      leadershipContainer.innerHTML = achievementsData.leadership.map((item) => `
        <div class="leadership-card">
          <h4>${contentMarkup(item.titleKey, item.title)}</h4>
          <p>${contentMarkup(item.descriptionKey, item.description)}</p>
        </div>
      `).join('');
    }
  }

  function renderTestimonials() {
    const container = document.getElementById('testimonialsGrid');
    if (!container) return;
    const section = document.getElementById('testimonials');
    const navLinks = document.querySelectorAll('a[href="#testimonials"]');
    if (typeof testimonialsData === 'undefined') {
      if (section) section.hidden = true;
      navLinks.forEach((link) => { link.hidden = true; });
      console.error('Testimonials data is unavailable.');
      return;
    }
    const publishedTestimonials = testimonialsData.filter(
      (testimonial) => testimonial.isPlaceholder !== true
    );
    if (publishedTestimonials.length === 0) {
      if (section) section.hidden = true;
      navLinks.forEach((link) => { link.hidden = true; });
      return;
    }
    if (section) section.hidden = false;
    navLinks.forEach((link) => { link.hidden = false; });
    container.innerHTML = publishedTestimonials.map((testimonial) => {
      const avatar = testimonial.avatar
        ? `<img src="${escapeHtml(testimonial.avatar)}" alt="${escapeHtml(testimonial.name)}" loading="lazy" />`
        : escapeHtml(Array.from(testimonial.name.trim())[0] || '?');
      const author = `
        <div class="testimonial-author">
          <div class="testimonial-avatar">${avatar}</div>
          <div class="testimonial-info">
            <h4 class="testimonial-name">${escapeHtml(testimonial.name)}</h4>
            <p class="testimonial-role">${escapeHtml(testimonial.role)}</p>
            <p class="testimonial-org">${escapeHtml(testimonial.organization)}</p>
            <span class="testimonial-relationship">${escapeHtml(testimonial.relationship)}</span>
          </div>
        </div>`;
      const authorContent = testimonial.linkedin
        ? `<a class="testimonial-author-link" href="${escapeHtml(testimonial.linkedin)}" target="_blank" rel="noopener noreferrer">${author}</a>`
        : author;
      return `
        <article class="testimonial-card">
          <div class="testimonial-quote-icon" aria-hidden="true">"</div>
          <p class="testimonial-quote">${escapeHtml(testimonial.quote)}</p>
          ${authorContent}
        </article>`;
    }).join('');
  }

  function renderResearch() {
    const container = document.getElementById('researchGrid');
    if (!container) return;
    if (typeof researchData === 'undefined') {
      console.error('Research data is unavailable.');
      return;
    }
    container.innerHTML = researchData.map((item) => `
      <div class="research-card">
        <div class="research-status ${escapeHtml(item.statusClass || '')}">${contentMarkup(item.statusKey, item.status)}</div>
        <h3>${contentMarkup(item.titleKey, item.title)}</h3>
        ${item.venueKey || item.venue ? `<p class="research-venue">${contentMarkup(item.venueKey, item.venue)}</p>` : ''}
        <p class="research-domain">${contentMarkup(item.domainKey, item.domain)}</p>
        ${item.noteKey || item.note ? `<p class="research-note">${contentMarkup(item.noteKey, item.note)}</p>` : ''}
      </div>
    `).join('');
  }

  function renderEducation() {
    const container = document.getElementById('educationTimeline');
    if (!container) return;
    if (typeof educationData === 'undefined') {
      console.error('Education data is unavailable.');
      return;
    }
    container.innerHTML = educationData.map((item) => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <span class="timeline-date">${contentMarkup(item.dateKey, item.date)}</span>
          <h3>${contentMarkup(item.titleKey, item.title)}</h3>
          <p class="timeline-org">${contentMarkup(item.organizationKey, item.organization)}</p>
          ${item.detailsKey || item.details ? `<p>${contentMarkup(item.detailsKey, item.details)}</p>` : ''}
        </div>
      </div>
    `).join('');
  }

  function renderRoadmap() {
    const container = document.getElementById('roadmapTimeline');
    if (!container) return;
    if (typeof roadmapData === 'undefined') {
      console.error('Roadmap data is unavailable.');
      return;
    }
    container.innerHTML = roadmapData.map((item) => `
      <article class="roadmap-item">
        <div class="roadmap-year">${escapeHtml(item.year)}</div>
        <div class="roadmap-content">
          ${item.badgeKey || item.badge ? `<span class="roadmap-badge">${contentMarkup(item.badgeKey, item.badge)}</span>` : ''}
          <h3>${contentMarkup(item.titleKey, item.title)}</h3>
          <p>${contentMarkup(item.descriptionKey, item.description)}</p>
        </div>
      </article>
    `).join('');
  }

  function renderSkillEvidence() {
    const container = document.getElementById('skillEvidenceGrid');
    if (!container) return;
    if (typeof projectsData === 'undefined' || typeof certificationsData === 'undefined' || typeof postsData === 'undefined') {
      console.error('Skills evidence data is unavailable.');
      return;
    }

    const repositories = (projectsData.classic || []).filter((project) => project.githubLink);
    const technicalArticles = Object.values(postsData).filter((post) => post.category === 'technical');
    const number = (value) => new Intl.NumberFormat(html.lang).format(value);

    container.innerHTML = `
      <article class="skill-evidence-card">
        <h4>${translations[html.lang].skill_evidence_repositories}</h4>
        <p>${translations[html.lang].skill_evidence_repositories_count.replace('{count}', number(repositories.length))}</p>
        <ul>${repositories.map((project) => `<li><a href="${escapeHtml(project.githubLink)}" target="_blank" rel="noopener noreferrer">${escapeHtml(project.name)}</a></li>`).join('')}</ul>
      </article>
      <article class="skill-evidence-card">
        <h4>${translations[html.lang].skill_evidence_certificates}</h4>
        <p>${translations[html.lang].skill_evidence_certificates_count.replace('{count}', number(certificationsData.length))}</p>
        <a href="#certifications">${translations[html.lang].skill_evidence_view_certificates}</a>
      </article>
      <article class="skill-evidence-card">
        <h4>${translations[html.lang].skill_evidence_articles}</h4>
        <p>${translations[html.lang].skill_evidence_articles_count.replace('{count}', number(technicalArticles.length))}</p>
        <a href="blog.html#technical-articles">${translations[html.lang].skill_evidence_view_articles}</a>
      </article>`;
  }

  function renderServices() {
    const container = document.getElementById('servicesGrid');
    if (!container) return;
    if (typeof servicesData === 'undefined') {
      console.error('Services data is unavailable.');
      return;
    }
    container.innerHTML = servicesData.map((service) => `
      <article class="service-card">
        <div class="service-icon" aria-hidden="true">${escapeHtml(service.icon || '✨')}</div>
        <h3>${contentMarkup(service.titleKey, service.title)}</h3>
        <p>${contentMarkup(service.descriptionKey, service.description)}</p>
        ${service.features?.length ? `<ul>${service.features.map((feature) => `<li>${contentMarkup(typeof feature === 'string' ? feature : feature.key, typeof feature === 'string' ? undefined : feature.label)}</li>`).join('')}</ul>` : ''}
        ${service.projectUrl ? `<a href="${escapeHtml(service.projectUrl)}" class="btn btn-outline" target="_blank" rel="noopener noreferrer" data-i18n="service_view_project">See related project →</a>` : ''}
      </article>
    `).join('');
  }

  function renderUses() {
    const container = document.getElementById('usesGrid');
    if (!container) return;
    if (typeof usesData === 'undefined') {
      console.error('Uses data is unavailable.');
      return;
    }
    container.innerHTML = usesData.map((category) => `
      <section class="uses-category" data-uses-category="${escapeHtml(category.id || '')}">
        <h2>${escapeHtml(category.icon || '•')} ${contentMarkup(category.titleKey, category.title)}</h2>
        <div class="uses-items">
          ${(category.items || []).map((item) => `
            <article class="uses-item">
              <span class="uses-emoji" aria-hidden="true">${escapeHtml(item.emoji || '•')}</span>
              <div>
                <h3>${contentMarkup(item.nameKey, item.name)}</h3>
                <p>${contentMarkup(item.descriptionKey, item.description)}</p>
              </div>
            </article>`).join('')}
        </div>
      </section>
    `).join('');
  }

  function renderResources() {
    const container = document.getElementById('resourcesGrid');
    if (!container) return;
    if (typeof resourcesData === 'undefined') {
      console.error('Resource data is unavailable.');
      return;
    }
    const language = html.lang === 'bn' ? 'bn' : 'en';
    container.innerHTML = resourcesData.map((resource) => {
      const title = resource.titleKey
        ? translations[language][resource.titleKey]
        : (language === 'bn' ? resource.titleBn : resource.titleEn) || resource.title || '';
      const description = resource.descriptionKey
        ? translations[language][resource.descriptionKey]
        : (language === 'bn' ? resource.descriptionBn : resource.descriptionEn) || resource.description || '';
      const rawDownloadUrl = String(resource.downloadUrl || '').trim();
      const isPlaceholder = !rawDownloadUrl || rawDownloadUrl === '#';
      const isSafeDownloadUrl = isPlaceholder ||
        (/^https:\/\//i.test(rawDownloadUrl) && !/[\u0000-\u0020"'<>]/.test(rawDownloadUrl)) ||
        (!/^[a-z][a-z\d+.-]*:/i.test(rawDownloadUrl) && !rawDownloadUrl.startsWith('//') && !/[\u0000-\u0020"'<>]/.test(rawDownloadUrl));
      const downloadUrl = isSafeDownloadUrl ? rawDownloadUrl || '#' : '#';
      const actionLabel = translations[language][resource.actionKey || 'resource_download'];
      return `
        <article class="resource-card${resource.featured ? ' featured' : ''}">
          <div class="resource-icon" aria-hidden="true">${escapeHtml(resource.icon || '📄')}</div>
          ${resource.featured ? `<span class="resource-featured" data-i18n="resource_featured">${translations[language].resource_featured}</span>` : ''}
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(description)}</p>
          <div class="resource-meta">
            ${isPlaceholder || !isSafeDownloadUrl
              ? `<span class="resource-filetype" data-i18n="resource_coming_soon_short">${translations[language].resource_coming_soon_short}</span>`
              : `<span class="resource-filetype">${escapeHtml(resource.fileType || 'FILE')}</span>${resource.fileSize ? `<span>${escapeHtml(resource.fileSize)}</span>` : ''}`}
          </div>
          ${isPlaceholder || !isSafeDownloadUrl
            ? ''
            : `<a class="btn btn-primary resource-download" href="${escapeHtml(downloadUrl)}"${resource.external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escapeHtml(actionLabel)}</a>`}
        </article>`;
    }).join('');
  }

  function initializeCalendly() {
    const widget = document.querySelector('[data-calendly-widget]');
    const placeholder = document.getElementById('bookingPlaceholder');
    if (!widget || !placeholder) return;
    const bookingUrl = widget.dataset.url || '';
    const configured = /^https:\/\/calendly\.com\/[a-z0-9_-]+(?:\/.*)?$/i.test(bookingUrl);
    const directLink = placeholder.querySelector('.booking-direct-link');
    const loadButton = placeholder.querySelector('#loadCalendly');
    const loading = document.getElementById('bookingLoading');
    widget.dataset.locale = html.lang === 'bn' ? 'bn' : 'en';
    widget.classList.toggle('calendly-inline-widget', configured);
    if (widget.dataset.calendlyInitializationStarted === 'true') return;
    widget.style.display = 'none';
    placeholder.hidden = false;
    if (loadButton) loadButton.hidden = !configured;
    if (!configured) return;
    if (!loadButton || loadButton.dataset.calendlyHandler === 'ready') return;
    loadButton.dataset.calendlyHandler = 'ready';
    loadButton.addEventListener('click', () => {
      if (widget.dataset.calendlyInitializationStarted === 'true') return;
      widget.dataset.calendlyInitializationStarted = 'true';
      loadButton.hidden = true;
      widget.style.display = 'block';
      placeholder.hidden = true;
      if (directLink) directLink.hidden = true;
      if (loading) {
        loading.hidden = false;
        window.setTimeout(() => { loading.hidden = true; }, 3000);
      }

      let settled = false;
      let observer;
      const fallbackTimer = window.setTimeout(showFallback, 5000);
      function showFallback() {
        if (settled) return;
        settled = true;
        window.clearTimeout(fallbackTimer);
        if (observer) observer.disconnect();
        widget.style.display = 'none';
        placeholder.hidden = false;
        if (loading) loading.hidden = true;
        const fallbackText = placeholder.querySelector('[data-i18n="book_call_fallback_text"]');
        if (fallbackText) {
          fallbackText.dataset.i18n = 'book_call_load_error';
          fallbackText.textContent = translations[html.lang].book_call_load_error;
        }
        if (directLink) directLink.hidden = false;
      }
      function watchForCalendlyFrame() {
        const iframe = widget.querySelector('iframe');
        if (!iframe || iframe.dataset.portfolioLoadHandler === 'ready') return;
        iframe.dataset.portfolioLoadHandler = 'ready';
        iframe.addEventListener('load', () => {
          if (settled) return;
          settled = true;
          window.clearTimeout(fallbackTimer);
          if (observer) observer.disconnect();
          if (loading) loading.hidden = true;
        }, { once: true });
        iframe.addEventListener('error', showFallback, { once: true });
      }
      observer = new MutationObserver(watchForCalendlyFrame);
      observer.observe(widget, { childList: true, subtree: true });
      watchForCalendlyFrame();

      if (!document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://assets.calendly.com/assets/external/widget.js';
        script.async = true;
        script.onerror = showFallback;
        document.body.appendChild(script);
      }
    });
  }

  function initializeServiceWorker() {
    if (
      html.hasAttribute('data-admin-app') ||
      !('serviceWorker' in navigator) ||
      !window.isSecureContext
    ) return;
    navigator.serviceWorker.register('./service-worker.js')
      .then(async (registration) => {
        await registration.update();
        console.info('Portfolio offline support is ready.', registration.scope);
      })
      .catch((error) => {
        console.warn('Portfolio offline support could not be registered.', error);
      });
  }

  function initializeInstallPrompt() {
    const banner = document.getElementById('pwaInstallBanner');
    const installButton = document.getElementById('pwaInstallButton');
    const dismissButton = document.getElementById('pwaInstallDismiss');
    if (!banner || !installButton || !dismissButton) return;
    let installPrompt;
    const hideBanner = () => {
      banner.hidden = true;
      installPrompt = undefined;
    };

    try {
      if (localStorage.getItem('pwa-install-dismissed') === 'true') return;
    } catch (error) {
      console.warn('Install-prompt preference could not be read.', error);
    }

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      installPrompt = event;
      banner.hidden = false;
    });
    installButton.addEventListener('click', async () => {
      if (!installPrompt) return;
      try {
        await installPrompt.prompt();
        await installPrompt.userChoice;
        hideBanner();
      } catch (error) {
        console.warn('The app install prompt could not be opened.', error);
      }
    });
    dismissButton.addEventListener('click', () => {
      try {
        localStorage.setItem('pwa-install-dismissed', 'true');
      } catch (error) {
        console.warn('Install-prompt preference could not be saved.', error);
      }
      hideBanner();
    });
    window.addEventListener('appinstalled', hideBanner);
  }

  function initializeVisitorStats() {
    const visitDisplay = document.getElementById('visitorCount');
    const visitLabel = document.getElementById('visitorCountLabel');
    const onlineDisplay = document.getElementById('onlineCount');
    const updatedDisplay = document.getElementById('statsUpdated');
    if (!visitDisplay && !onlineDisplay && !updatedDisplay) return;
    let visitCountValue = null;
    let onlineCountValue = null;

    const setUpdatedTime = () => {
      if (!updatedDisplay) return;
      updatedDisplay.dateTime = new Date().toISOString();
      updatedDisplay.textContent = new Intl.DateTimeFormat(html.lang, {
        dateStyle: 'medium',
        timeStyle: 'short',
        hourCycle: html.lang === 'bn' ? 'h23' : undefined
      }).format(new Date());
    };

    const fallbackVisitCount = () => {
      try {
        const key = 'portfolio-visit-count';
        const storedCount = Number(localStorage.getItem(key));
        const count = (Number.isSafeInteger(storedCount) && storedCount > 0 ? storedCount : 0) + 1;
        localStorage.setItem(key, String(count));
        return count;
      } catch {
        return null;
      }
    };

    const updateLocaleDisplays = () => {
      if (visitDisplay && visitCountValue !== null) {
        visitDisplay.textContent = visitCountValue.toLocaleString(html.lang);
      }
      if (visitLabel) {
        visitLabel.dataset.i18n = 'stats_visits_local';
        visitLabel.textContent = translations[html.lang].stats_visits_local;
      }
      if (onlineDisplay && onlineCountValue !== null) {
        onlineDisplay.textContent = onlineCountValue.toLocaleString(html.lang);
      }
      setUpdatedTime();
    };

    const updateVisitCount = () => {
      if (!visitDisplay) return;
      visitCountValue = fallbackVisitCount();
      updateLocaleDisplays();
    };

    const sessionIdKey = 'portfolio-active-session-id';
    const activeSessionsKey = 'portfolio-active-sessions';
    let sessionId;
    try {
      sessionId = sessionStorage.getItem(sessionIdKey);
      if (!sessionId) {
        sessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        sessionStorage.setItem(sessionIdKey, sessionId);
      }
    } catch (error) {
      console.warn('Active-session estimate could not identify this tab.', error);
      sessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
    const showActiveSessions = (sessions, now = Date.now()) => {
      if (!onlineDisplay) return;
      try {
        const activeCount = Object.entries(sessions)
          .filter(([, timestamp]) => Number(timestamp) > now - 45000);
        onlineCountValue = activeCount.length;
        onlineDisplay.textContent = onlineCountValue.toLocaleString(html.lang);
      } catch (error) {
        console.warn('Active-session estimate could not be updated.', error);
        onlineCountValue = null;
        onlineDisplay.textContent = '—';
      }
      setUpdatedTime();
    };
    const heartbeat = () => {
      if (!onlineDisplay) return;
      try {
        const now = Date.now();
        const sessions = JSON.parse(localStorage.getItem(activeSessionsKey) || '{}');
        const active = Object.fromEntries(Object.entries(sessions)
          .filter(([, timestamp]) => Number(timestamp) > now - 45000));
        active[sessionId] = now;
        localStorage.setItem(activeSessionsKey, JSON.stringify(active));
        showActiveSessions(active, now);
      } catch (error) {
        console.warn('Active-session estimate could not be updated.', error);
        onlineDisplay.textContent = '—';
      }
    };

    updateVisitCount();
    heartbeat();
    if (onlineDisplay) window.setInterval(heartbeat, 15000);
    window.addEventListener('storage', (event) => {
      if (event.key !== activeSessionsKey) return;
      try {
        const sessions = JSON.parse(event.newValue || '{}');
        showActiveSessions(sessions);
      } catch (error) {
        console.warn('Active-session update could not be read.', error);
      }
    });
    window.addEventListener('pagehide', () => {
      try {
        const sessions = JSON.parse(localStorage.getItem(activeSessionsKey) || '{}');
        delete sessions[sessionId];
        localStorage.setItem(activeSessionsKey, JSON.stringify(sessions));
      } catch (error) {
        console.warn('Active-session estimate could not be cleared.', error);
      }
    });
    window.addEventListener('languagechange', updateLocaleDisplays);
  }

  function initializeSignatureGenerator() {
    const form = document.getElementById('signatureForm');
    if (!form) return;
    const preview = document.getElementById('signaturePreview');
    const htmlOutput = document.getElementById('signatureHtml');
    const textOutput = document.getElementById('signatureText');
    const status = document.getElementById('signatureStatus');
    const fields = Object.fromEntries([...form.elements]
      .filter((field) => field.name)
      .map((field) => [field.name, field]));
    const safeLink = (value, type) => {
      const trimmed = value.trim();
      if (!trimmed) return '';
      if (type === 'email') return `mailto:${trimmed}`;
      if (type === 'phone') return `tel:${trimmed.replace(/[^\d+*#]/g, '')}`;
      try {
        const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
        return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
      } catch {
        return '';
      }
    };
    const setStatus = (key) => {
      status.dataset.i18n = key;
      status.textContent = translations[html.lang][key];
    };

    function updateSignature() {
      const values = Object.fromEntries(Object.entries(fields)
        .map(([key, field]) => [key, field.value.trim()]));
      const nameParts = values.name.split(/\s+/).filter(Boolean);
      const initialsText = nameParts.length
        ? `${nameParts[0][0]}${nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : ''}`.toUpperCase()
        : '—';
      const contact = [
        ['email', values.email, safeLink(values.email, 'email')],
        ['phone', values.phone, safeLink(values.phone, 'phone')]
      ].filter(([, value]) => value);
      const links = [
        ['website', values.website, safeLink(values.website, 'url')],
        ['linkedin', values.linkedin, safeLink(values.linkedin, 'url')]
      ].filter(([, value]) => value);
      const rows = [
        `<strong style="font-size:16px;color:#111">${escapeHtml(values.name)}</strong>`,
        values.role ? `<span style="color:#445;display:block">${escapeHtml(values.role)}</span>` : '',
        contact.length ? `<span style="display:block">${contact.map(([, label, href]) => `<a href="${escapeHtml(href)}" style="color:#075985;text-decoration:none">${escapeHtml(label)}</a>`).join(' | ')}</span>` : '',
        links.length ? `<span style="display:block">${links.map(([, label, href]) => `<a href="${escapeHtml(href)}" style="color:#075985;text-decoration:none">${escapeHtml(label)}</a>`).join(' | ')}</span>` : '',
        `<span style="display:block;margin-top:8px;color:#075985;font-weight:700">${escapeHtml(initialsText)}</span>`
      ].filter(Boolean);
      const signatureHtml = `<table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;color:#111"><tr><td style="border-left:3px solid #00a6c7;padding:2px 0 2px 12px">${rows.join('')}</td></tr></table>`;
      const textParts = [
        values.name,
        values.role,
        contact.map(([, label]) => label).join(' | '),
        links.map(([, label]) => label).join(' | ')
      ].filter(Boolean);
      htmlOutput.textContent = signatureHtml;
      textOutput.textContent = textParts.join('\n');
      preview.replaceChildren();
      const name = document.createElement('strong');
      name.textContent = values.name;
      const role = document.createElement('span');
      role.textContent = values.role;
      preview.append(name, role);
      [contact, links].forEach((group) => {
        if (!group.length) return;
        const row = document.createElement('div');
        group.forEach(([key, label, href], index) => {
          if (index) row.append(document.createTextNode(' | '));
          const anchor = document.createElement('a');
          anchor.textContent = label;
          anchor.href = href;
          if (key === 'website' || key === 'linkedin') {
            anchor.target = '_blank';
            anchor.rel = 'noopener noreferrer';
          }
          row.append(anchor);
        });
        preview.append(row);
      });
      const initials = document.createElement('span');
      initials.className = 'signature-initials';
      initials.textContent = initialsText;
      preview.append(initials);
    }

    form.addEventListener('input', updateSignature);
    updateSignature();

    async function copyText(text) {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          const temporary = document.createElement('textarea');
          temporary.value = text;
          temporary.setAttribute('readonly', '');
          temporary.style.position = 'fixed';
          temporary.style.opacity = '0';
          document.body.append(temporary);
          temporary.select();
          const copied = document.execCommand('copy');
          temporary.remove();
          if (!copied) throw new Error('Clipboard copy was rejected.');
        }
        setStatus('signature_copied');
      } catch (error) {
        console.error('Could not copy email signature.', error);
        setStatus('signature_copy_error');
      }
    }

    document.getElementById('copySignatureHtml')
      .addEventListener('click', () => copyText(htmlOutput.textContent));
    document.getElementById('copySignatureText')
      .addEventListener('click', () => copyText(textOutput.textContent));
    document.getElementById('downloadSignature').addEventListener('click', () => {
      try {
        const file = new Blob([htmlOutput.textContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'riyad-email-signature.html';
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        setStatus('signature_downloaded');
      } catch (error) {
        console.error('Could not download email signature.', error);
        setStatus('signature_copy_error');
      }
    });
  }

  function socialIcon(name) {
    const paths = {
      github: '<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>',
      tryhackme: '<path d="M12 2 2 7v10l10 5 10-5V7L12 2zm0 2.18L19.5 8 12 11.82 4.5 8 12 4.18zM4 9.5l7 3.5v6.32l-7-3.5V9.5zm9 9.82V13l7-3.5v6.32l-7 3.5z"/>',
      hackthebox: '<path d="M12 2 21 7v10l-9 5-9-5V7l9-5zm0 2.3L5.3 8 12 11.7 18.7 8 12 4.3zM5 9.7v6.6l6 3.3v-6.6L5 9.7zm14 0-6 3.3v6.6l6-3.3V9.7z"/>',
      facebook: '<path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.025 1.792-4.71 4.533-4.71 1.312 0 2.686.236 2.686.236v2.98h-1.513c-1.49 0-1.956.93-1.956 1.885v2.269h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>'
    };
    return `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${paths[name] || ''}</svg>`;
  }

  function renderSocialLinks() {
    if (typeof socialData === 'undefined') return;
    const hero = document.getElementById('heroSocials');
    if (hero) {
      hero.innerHTML = socialData.links.filter((link) => link.showInHero).map((link) => `
        <a href="${escapeHtml(link.href)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(link.name)}">${socialIcon(link.icon)}</a>
      `).join('');
    }
    const footer = document.getElementById('footerSocialLinks');
    if (footer) {
      footer.innerHTML = socialData.links.map((link) => `
        <a href="${escapeHtml(link.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.name)}</a>
      `).join('');
    }
    const contact = document.getElementById('contactInfo');
    if (contact) {
      const icons = {
        email: '<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="m22 6-10 7L2 6"/>',
        phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
        location: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>'
      };
      contact.innerHTML = socialData.contact.map((item) => {
        const icon = `<div class="contact-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">${icons[item.type]}</svg></div>`;
        const value = item.valueKey
          ? translatedMarkup(item.valueKey)
          : escapeHtml(item.value);
        const contents = `${icon}<div><h4>${contentMarkup(item.titleKey, item.title)}</h4><p>${value}</p></div>`;
        const contactContents = item.type === 'location'
          ? `${icon}<div><h4>${contentMarkup(item.titleKey, item.title)}</h4><p class="contact-location-value">${escapeHtml(item.value)}</p></div>`
          : contents;
        return item.href
          ? `<a href="${escapeHtml(item.href)}" class="contact-item">${contactContents}</a>`
          : `<div class="contact-item">${contactContents}</div>`;
      }).join('');
      const email = socialData.contact.find((item) => item.type === 'email');
      const phone = socialData.contact.find((item) => item.type === 'phone');
      const location = socialData.contact.find((item) => item.type === 'location');
      const heroLocation = document.getElementById('heroLocation');
      if (heroLocation && location) heroLocation.textContent = location.value;
      const aboutLocation = document.getElementById('aboutLocation');
      if (aboutLocation && location) aboutLocation.textContent = location.value;
      const fallback = document.getElementById('contactFallback');
      if (fallback && email) {
        fallback.innerHTML = `Or email me directly at <a href="${escapeHtml(email.href)}">${escapeHtml(email.value)}</a>`;
      }
      const contactForm = document.querySelector('.contact-form');
      if (contactForm && email) {
        contactForm.dataset.contactEmail = email.value;
      }
      if (contactForm && phone) {
        contactForm.dataset.contactPhone = phone.value;
      }
    }
  }

  function renderPortfolioData() {
    renderCertifications();
    renderProjects();
    renderSkills();
    renderSkillEvidence();
    renderAchievements();
    renderTestimonials();
    renderSocialLinks();
    renderEducation();
    renderResearch();
    renderRoadmap();
    renderServices();
    renderUses();
    renderResources();
  }

  function setLanguage(lang) {
    const selectedLanguage = lang === 'bn' ? 'bn' : 'en';
    html.lang = selectedLanguage;
    localStorage.setItem('language', selectedLanguage);
    window.dispatchEvent(new Event('languagechange'));
    document.querySelectorAll('[data-language-content]').forEach((element) => {
      const content = element.dataset[`${selectedLanguage}Content`];
      if (content !== undefined) {
        element.textContent = content;
      }
    });

    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const key = element.dataset.i18n;
      const translatedText = translations[selectedLanguage]?.[key];
      if (translatedText !== undefined) {
        if (element.hasAttribute('data-i18n-html')) {
          element.innerHTML = translatedText;
        } else {
          element.textContent = translatedText;
        }
      }
    });

    document.querySelectorAll('[data-cert-title-key]').forEach((image) => {
      const title = translations[selectedLanguage]?.[image.dataset.certTitleKey] || 'Certificate';
      image.title = `${title} Certificate`;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
      const key = element.dataset.i18nPlaceholder;
      const translatedPlaceholder = translations[selectedLanguage]?.[key];
      if (translatedPlaceholder !== undefined) {
        element.setAttribute('placeholder', translatedPlaceholder);
      }
    });

    document.querySelectorAll('[data-i18n-content]').forEach((element) => {
      const key = element.dataset.i18nContent;
      const translatedContent = translations[selectedLanguage]?.[key];
      if (translatedContent !== undefined) {
        element.setAttribute('content', translatedContent);
      }
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
      const key = element.dataset.i18nAriaLabel;
      const translatedLabel = translations[selectedLanguage]?.[key];
      if (translatedLabel !== undefined) {
        element.setAttribute('aria-label', translatedLabel);
      }
    });

    document.querySelectorAll('[data-terminal-source]').forEach((element) => {
      const sourceText = element.dataset.terminalSource;
      element.textContent =
        translations[selectedLanguage]?.terminal_output?.[sourceText] || sourceText;
    });

    document.querySelectorAll('[data-terminal-command]').forEach((element) => {
      const message = translations[selectedLanguage].terminal_command_not_found;
      element.textContent = message.replace(
        '{command}',
        element.dataset.terminalCommand
      );
    });

    if (typeof socialData !== 'undefined') {
      const location = socialData.contact.find((item) => item.type === 'location');
      if (location) {
        const locationText = selectedLanguage === 'bn'
          ? location.valueBn || location.value
          : location.value;
        const heroLocation = document.getElementById('heroLocation');
        const aboutLocation = document.getElementById('aboutLocation');
        const contactLocation = document.querySelector('#contactInfo .contact-location-value');
        if (heroLocation) heroLocation.textContent = locationText;
        if (aboutLocation) aboutLocation.textContent = locationText;
        if (contactLocation) contactLocation.textContent = locationText;
      }
    }

    document.querySelectorAll('[data-post-author]').forEach((element) => {
      element.textContent =
        `${translations[selectedLanguage].post_by_author_prefix} ${element.dataset.postAuthor}`;
    });

    if (typeof postsData !== 'undefined') {
      updateBlogLanguage(selectedLanguage);
    }
    renderResources();
    initializeCalendly();
    const statsUpdated = document.getElementById('statsUpdated');
    if (statsUpdated) {
      statsUpdated.dateTime = new Date().toISOString();
      statsUpdated.textContent = new Intl.DateTimeFormat(selectedLanguage, {
        dateStyle: 'medium',
        timeStyle: 'short',
        hourCycle: selectedLanguage === 'bn' ? 'h23' : undefined
      }).format(new Date());
    }

    if (languageToggle) {
      languageToggle.querySelector('.lang-bn').textContent =
        selectedLanguage === 'bn' ? 'বাংলা' : 'BN';
      languageToggle.querySelector('.lang-en').classList.toggle(
        'active',
        selectedLanguage === 'en'
      );
      languageToggle.querySelector('.lang-bn').classList.toggle(
        'active',
        selectedLanguage === 'bn'
      );
    }
    renderSkillEvidence();
    updateProjectSearch();
    updateCertificationSearch();
  }

  window.setLanguage = setLanguage;

  renderPortfolioData();
  initializeProjectImageViewer();
  initCertificationLightbox();
  const savedLanguage = localStorage.getItem('language');
  setLanguage(savedLanguage === 'bn' ? 'bn' : 'en');
  initializeCalendly();
  initializeServiceWorker();
  initializeInstallPrompt();
  initializeVisitorStats();
  initializeSignatureGenerator();

  if (languageToggle) {
    languageToggle.addEventListener('click', () => {
      setLanguage(html.lang === 'bn' ? 'en' : 'bn');
    });
  }

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

  /* COOKIE CONSENT + GOOGLE ANALYTICS CONTROL */
  (function initCookieConsent() {
    const cookieKey = 'cookieConsent';
    const GA_ID = 'G-82EWL4BGPD';
    const measurementId =
      document.querySelector('meta[name="ga4-measurement-id"]')?.content || GA_ID;
    const banner = document.getElementById('cookieBanner');

    function loadAnalytics() {
      if (!measurementId) return;
      if (window[`ga-disable-${measurementId}`] === true) return;
      if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${measurementId}"]`)) {
        return;
      }
      if (!/^G-[A-Z0-9]+$/.test(measurementId)) {
        console.error('Google Analytics Measurement ID is invalid.');
        return;
      }

      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', measurementId, {
        anonymize_ip: true,
        send_page_view: true,
        cookie_flags: 'SameSite=None;Secure'
      });

      const analyticsScript = document.createElement('script');
      analyticsScript.async = true;
      analyticsScript.src =
        `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      analyticsScript.onerror = () => {
        console.warn('Google Analytics could not be loaded; the portfolio will continue without analytics.');
      };
      analyticsScript.onload = () => {
        if (typeof window.gtag === 'function') {
          console.log(
            `%c📊 GA4 loaded with ID: ${measurementId}`,
            'color: #00d9ff; font-weight: bold;'
          );
        }
      };
      document.head.appendChild(analyticsScript);

      window.checkGA = function () {
        console.log('GA Config Check:');
        console.log('  Measurement ID:', measurementId);
        console.log('  Consent:', localStorage.getItem(cookieKey));
        console.log(
          '  GA Disabled:',
          window[`ga-disable-${measurementId}`] === true
        );
        console.log('  gtag loaded:', typeof window.gtag === 'function');
        console.log('  DataLayer length:', window.dataLayer?.length || 0);
      };
    }

    const consent = localStorage.getItem(cookieKey);
    if (consent === 'accepted') {
      loadAnalytics();
    } else if (consent === 'declined') {
      if (measurementId) {
        window[`ga-disable-${measurementId}`] = true;
      }
    }

    if (!banner) return;

    const acceptButton = document.getElementById('cookieAccept');
    const declineButton = document.getElementById('cookieDecline');

    if (consent !== 'accepted' && consent !== 'declined') {
      window.setTimeout(() => {
        banner.style.display = 'flex';
        window.setTimeout(() => {
          banner.classList.add('visible');
        }, 0);
      }, 1500);
    }

    function dismissBanner() {
      banner.classList.remove('visible');
      window.setTimeout(() => {
        banner.style.display = 'none';
      }, 400);
    }

    if (acceptButton) {
      acceptButton.addEventListener('click', () => {
        localStorage.setItem(cookieKey, 'accepted');
        loadAnalytics();
        dismissBanner();
      });
    }

    if (declineButton) {
      declineButton.addEventListener('click', () => {
        localStorage.setItem(cookieKey, 'declined');
        if (measurementId) {
          window[`ga-disable-${measurementId}`] = true;
        }
        dismissBanner();
      });
    }
  })();

  /* 2. MOBILE HAMBURGER MENU */
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');

  if (hamburger && navMenu) {
    const setMenuOpen = (isOpen) => {
      hamburger.classList.toggle('active', isOpen);
      navMenu.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    };

    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      setMenuOpen(!navMenu.classList.contains('open'));
    });

    document.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        setMenuOpen(false);
      });
    });

    document.addEventListener('click', (e) => {
      if (
        navMenu.classList.contains('open') &&
        !navMenu.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        setMenuOpen(false);
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
    '.section-header, .about-grid, .skills-grid, .lab-box, .project-card, .mygenie-card, .research-card, .cert-card, .achievement-card, .leadership-card, .testimonial-card, .interactive-terminal, .creative-card, .timeline-item, .contact-grid'
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
    help: () => {
      const keys = [
        'terminal_help_title',
        'terminal_help_about',
        'terminal_help_startup',
        'terminal_help_prototypes',
        'terminal_help_projects',
        'terminal_help_certs',
        'terminal_help_workflow',
        'terminal_help_whoami',
        'terminal_help_contact',
        'terminal_help_clear',
        'terminal_help_linux',
        'terminal_help_files',
        'terminal_help_system',
        'terminal_help_network',
        'terminal_help_safety',
        'terminal_help_history'
      ];
      return keys.map((key, index) => ({
        text: translations[html.lang][key],
        key,
        cls: index === 0 ? 'info' : 'muted'
      }));
    },

    'cat about.txt': () => [
      { text: '═══════════════════════════════════════', cls: 'info' },
      { text: 'Md Iftiur Hossen Riyad', cls: 'success' },
      { text: '═══════════════════════════════════════', cls: 'info' },
      { text: 'Cyber Security Engineering Undergraduate @ UFTB', cls: '' },
      { text: 'Founder & CEO @ MyGenie', cls: '' },
      { text: 'Security Researcher & Tech Innovator', cls: '' },
      { text: '', cls: '' },
      { text: `Location : ${typeof socialData !== 'undefined' ? socialData.contact.find((item) => item.type === 'location')?.value || '' : ''}`, cls: 'muted' },
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

    'ls prototypes/': () => {
      if (typeof projectsData === 'undefined') {
        return [{ text: 'Project data is unavailable.', cls: 'error' }];
      }
      return [
        ...projectsData.featured.map((project) => ({
          text: `drwxr-xr-x  ${project.name}/ — ${translations[html.lang][project.roleKey] || project.role || ''}`,
          cls: ''
        })),
        { text: '', cls: '' },
        { text: `${projectsData.featured.length} prototypes available. Use "fetch projects" for classic repos.`, cls: 'info' },
      ];
    },

    'fetch projects': () => {
      if (typeof projectsData === 'undefined') {
        return [{ text: 'Project data is unavailable.', cls: 'error' }];
      }
      return [
        { text: 'Fetching classic engineering projects...', cls: 'info' },
        { text: '', cls: '' },
        ...projectsData.classic.flatMap((project) => [
          { text: `▸ ${project.name}`, cls: 'success' },
          ...(project.githubLink ? [{ text: `  ${project.githubLink}`, cls: 'muted' }] : []),
          { text: '', cls: '' },
        ]),
      ];
    },

    'cat certs.txt': () => {
      if (typeof certificationsData === 'undefined') {
        return [{ text: 'Certification data is unavailable.', cls: 'error' }];
      }
      return [
        { text: '═══════════════════════════════════════', cls: 'info' },
        { text: 'Professional Certifications', cls: 'success' },
        { text: '═══════════════════════════════════════', cls: 'info' },
        ...certificationsData.map((cert) => ({
          text: `✓ ${translations[html.lang][cert.titleKey] || cert.title || cert.titleKey} — ${translations[html.lang][cert.dateKey] || cert.date || ''}`,
          cls: ''
        })),
      ];
    },

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

  commands['ls'] = () => runShellCommand('ls');
  commands['projects'] = commands['fetch projects'];
  commands['certs'] = commands['cat certs.txt'];
  commands['cls'] = commands.clear;
  commands['dir'] = commands['ls'];

  let virtualDirectory = '~';

  function shellLine(text, cls = '', key) {
    return { text, cls, key };
  }

  function runShellCommand(input) {
    const [command, ...args] = input.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
    if (!command) return [];
    const normalizedCommand = command.toLowerCase();
    const argumentText = args.join(' ');
    const home = '/home/riyad';
    const currentPath = virtualDirectory === '~'
      ? home
      : `${home}/${virtualDirectory}`;
    const directories = {
      '~': ['about.txt', 'certs.txt', 'projects/', 'prototypes/', 'startup.txt', 'workflow.txt'],
      'projects': ['EduQuiz/', 'SecureAudit/', 'ThreatGuard/', 'Buy-Sell-Platform/'],
      'prototypes': ['APON/', 'CampusNet/', 'IR-Prohori/', 'NOJORGHOR/', 'SURAKSHA/'],
      'certs': ['certs.txt'],
      'documents': ['about.txt', 'startup.txt', 'workflow.txt']
    };

    if (['sudo', 'apt', 'apt-get', 'dpkg', 'rm', 'mv', 'chmod', 'chown', 'shutdown', 'reboot', 'python', 'python3', 'bash', 'sh', 'curl', 'wget'].includes(normalizedCommand)) {
      return [shellLine(translations[html.lang].terminal_shell_blocked, 'error', 'terminal_shell_blocked')];
    }

    if (['nmap', 'msfconsole', 'msfvenom', 'sqlmap', 'hydra', 'john', 'aircrack-ng', 'wireshark', 'tcpdump', 'nc', 'netcat'].includes(normalizedCommand)) {
      return [shellLine(translations[html.lang].terminal_shell_security_tools, 'error', 'terminal_shell_security_tools')];
    }

    switch (normalizedCommand) {
      case 'pwd':
        return [shellLine(currentPath, 'info')];
      case 'ls': {
        const target = args.find((arg) => !arg.startsWith('-'));
        const directory = target === undefined || target === '.' ? virtualDirectory : target.replace(/\/$/, '').replace(/^\.?\//, '');
        if (directory === '..') {
          return [shellLine(virtualDirectory === '~' ? home : home, 'info')];
        }
        if (directory === '/home/riyad' || directory === '~') {
          const entries = [...directories['~']];
          if (args.some((arg) => arg.startsWith('-') && arg.includes('a'))) {
            entries.unshift('.bashrc', '.profile');
          }
          return entries.map((item) => shellLine(
            args.some((arg) => arg.startsWith('-') && arg.includes('l'))
              ? `${item.endsWith('/') ? 'drwxr-xr-x' : '-rw-r--r--'}  riyad riyad  ${item}`
              : item
          ));
        }
        const entries = directories[directory];
        if (!entries) return [shellLine(`ls: cannot access '${target}': No such file or directory`, 'error')];
        return entries.map((item) => shellLine(
          args.some((arg) => arg.startsWith('-') && arg.includes('l'))
            ? `${item.endsWith('/') ? 'drwxr-xr-x' : '-rw-r--r--'}  riyad riyad  ${item}`
            : item
        ));
      }
      case 'cd': {
        const target = args[0]?.replace(/\/$/, '') || '~';
        const nextDirectory = target === '~' || target === '/home/riyad' || target === '..' && virtualDirectory === '~'
          ? '~'
          : target === '..'
            ? '~'
            : target.replace(/^\.?\//, '');
        if (nextDirectory !== '~' && !directories[nextDirectory]) {
          return [shellLine(`cd: ${args[0]}: No such directory`, 'error')];
        }
        virtualDirectory = nextDirectory;
        return [];
      }
      case 'echo':
        return [shellLine(args.join(' ').replace(/^"|"$/g, ''))];
      case 'uname':
        return [shellLine(args.includes('-a')
          ? 'Linux security-lab 6.8.0-demo x86_64 GNU/Linux (browser simulation)'
          : 'Linux', 'info')];
      case 'hostname':
        return [shellLine('security-lab', 'info')];
      case 'date':
        return [shellLine(new Intl.DateTimeFormat(html.lang === 'bn' ? 'bn-BD' : 'en-US', {
          dateStyle: 'full',
          timeStyle: 'long',
          timeZone: 'Asia/Dhaka'
        }).format(new Date()), 'info')];
      case 'id':
        return [shellLine('uid=1000(riyad) gid=1000(riyad) groups=1000(riyad),27(sudo)')];
      case 'whoami':
        return commands.whoami();
      case 'cat':
        if (args[0] === '/etc/os-release') {
          return [shellLine('NAME="Riyad Security Lab"', 'success'), shellLine('PRETTY_NAME="Riyad Security Lab (browser simulation)"')];
        }
        if (args[0] === '/etc/hostname') return [shellLine('security-lab')];
        return [shellLine(`cat: ${args[0] || ''}: file not found. Try "help" for available demo files.`, 'error')];
      case 'head':
      case 'tail': {
        const countIndex = args.indexOf('-n');
        const count = countIndex >= 0 ? Number.parseInt(args[countIndex + 1], 10) : 10;
        const file = args.find((arg, index) => !arg.startsWith('-') && !(countIndex >= 0 && index === countIndex + 1));
        const readFile = commands[`cat ${file}`];
        if (!Number.isInteger(count) || count < 1 || !file || typeof readFile !== 'function') {
          return [shellLine(`Usage: ${normalizedCommand} [-n lines] {about.txt|startup.txt|certs.txt|workflow.txt}`, 'muted')];
        }
        const lines = readFile();
        return normalizedCommand === 'head' ? lines.slice(0, count) : lines.slice(-count);
      }
      case 'tree':
        return [
          shellLine('.', 'info'),
          ...['├── about.txt', '├── certs.txt', '├── projects/', '│   ├── EduQuiz/', '│   ├── SecureAudit/', '│   └── ThreatGuard/', '├── prototypes/', '└── workflow.txt'].map((line) => shellLine(line))
        ];
      case 'ip':
        if (['addr', 'address', 'a', 'link'].includes(args[0])) {
          return [
            shellLine('1: lo: <LOOPBACK,UP> mtu 65536', 'info'),
            shellLine('    inet 127.0.0.1/8 scope host lo'),
            shellLine('2: eth0: <BROADCAST,MULTICAST,UP> mtu 1500'),
            shellLine('    inet 192.0.2.10/24 scope global eth0  (documentation-only demo address)')
          ];
        }
        if (args[0] === 'route') return [shellLine('default via 192.0.2.1 dev eth0  (simulated route)')];
        return [shellLine('Usage: ip {addr|route}', 'muted')];
      case 'ifconfig':
        return [
          shellLine('lo: flags=73<UP,LOOPBACK,RUNNING>  inet 127.0.0.1'),
          shellLine('eth0: flags=4163<UP,BROADCAST,RUNNING>  inet 192.0.2.10  (demo only)')
        ];
      case 'ping':
        if (!['localhost', '127.0.0.1', '::1'].includes(args[0])) {
          return [shellLine(translations[html.lang].terminal_shell_network_blocked, 'error', 'terminal_shell_network_blocked')];
        }
        return [
          shellLine(`PING ${args[0]}: simulated loopback test (no network packets sent)`, 'info'),
          shellLine('64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time<1 ms'),
          shellLine('--- simulated ping statistics ---'),
          shellLine('1 packets transmitted, 1 received, 0% packet loss')
        ];
      case 'which': {
        const available = ['cat', 'cd', 'clear', 'date', 'echo', 'help', 'hostname', 'id', 'ip', 'ls', 'ping', 'pwd', 'tree', 'uname', 'whoami'];
        return args.map((name) => shellLine(available.includes(name)
          ? `/usr/bin/${name} (simulated)`
          : `${name}: command not available in this browser demo`, available.includes(name) ? 'success' : 'error'));
      }
      case 'man': {
        const manuals = {
          cat: 'cat FILE — display one of the portfolio demo files (for example: cat about.txt)',
          cd: 'cd [DIR] — change directory inside the read-only virtual filesystem',
          clear: 'clear — clear the terminal output',
          echo: 'echo TEXT — print text in the terminal',
          ls: 'ls [-la] [DIR] — list entries in the virtual filesystem',
          ping: 'ping localhost — run a simulated loopback check; no network traffic is sent',
          pwd: 'pwd — print the current virtual directory',
          uname: 'uname [-a] — show simulated environment information',
          help: 'help — list supported demo commands'
        };
        return [shellLine(manuals[args[0]] || `No demo manual available for ${args[0] || 'that command'}.`, 'info')];
      }
      default:
        return null;
    }
  }

  /* 7. UTILITY */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* 8. FULL TERMINAL MODE */
  const terminalWindow = document.getElementById('terminalWindow');
  const terminalInput = document.getElementById('terminalInput');
  const terminalSubmit = document.getElementById('terminalSubmit');

  if (terminalWindow && terminalInput) {
    let history = [];
    let historyIndex = -1;

    function printOutput(text, cls, key) {
      const line = document.createElement('div');
      line.className = 'terminal-line';
      const output = document.createElement('span');
      output.className = 'output ' + (cls || '');
      if (key) {
        output.dataset.i18n = key;
      } else {
        output.dataset.terminalSource = text;
      }
      output.textContent =
        (key && translations[html.lang][key]) ||
        translations[html.lang]?.terminal_output?.[text] ||
        text;
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
        `<span class="prompt">riyad@security-lab:${virtualDirectory}$</span>` +
        '<span class="output"> ' +
        escapeHtml(input) +
        '</span>';
      terminalWindow.appendChild(echoLine);
      terminalWindow.scrollTop = terminalWindow.scrollHeight;

      history.push(input);
      historyIndex = history.length;

      const fn = commands[input];
      const result = input === 'history'
        ? history.map((entry, index) => ({ text: `${String(index + 1).padStart(4, ' ')}  ${entry}` }))
        : typeof fn === 'function' ? fn() : runShellCommand(input);
      if (Array.isArray(result)) {
        result.forEach((l) => printOutput(l.text, l.cls, l.key));
      } else {
        const output = document.createElement('div');
        output.className = 'terminal-line';
        const message = document.createElement('span');
        message.className = 'output error';
        message.dataset.terminalCommand = input;
        message.textContent = translations[html.lang].terminal_command_not_found.replace(
          '{command}',
          input
        );
        output.appendChild(message);
        terminalWindow.appendChild(output);
        terminalWindow.scrollTop = terminalWindow.scrollHeight;
      }

      if (input !== 'clear') {
        const blank = document.createElement('div');
        blank.className = 'terminal-line';
        blank.innerHTML = '&nbsp;';
        terminalWindow.appendChild(blank);
        terminalWindow.scrollTop = terminalWindow.scrollHeight;
      }
    }

    function submitTerminalCommand() {
      const value = terminalInput.value;
      terminalInput.value = '';
      handleCommand(value);
      terminalInput.focus();
    }

    terminalSubmit?.addEventListener('click', submitTerminalCommand);

    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitTerminalCommand();
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
  const heroTerminalSubmit = document.getElementById('heroTerminalSubmit');

  if (heroTerminalBody && heroTerminalInput) {
    let heroHistory = [];
    let heroHistoryIndex = -1;

    function heroPrintOutput(text, cls, key) {
      const line = document.createElement('div');
      line.className = 'terminal-line';
      const span = document.createElement('span');
      span.className = 'output ' + (cls || '');
      if (key) {
        span.dataset.i18n = key;
      } else {
        span.dataset.terminalSource = text;
      }
      span.textContent =
        (key && translations[html.lang][key]) ||
        translations[html.lang]?.terminal_output?.[text] ||
        text;
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
      const result = input === 'history'
        ? heroHistory.map((entry, index) => ({ text: `${String(index + 1).padStart(4, ' ')}  ${entry}` }))
        : typeof fn === 'function' ? fn() : runShellCommand(input);
      if (Array.isArray(result)) {
        result.forEach((l) => heroPrintOutput(l.text, l.cls, l.key));
      } else {
        const errorLine = document.createElement('div');
        errorLine.className = 'terminal-line';
        const errorOutput = document.createElement('span');
        errorOutput.className = 'output error';
        errorOutput.dataset.terminalCommand = input;
        errorOutput.textContent = translations[html.lang].terminal_command_not_found.replace(
          '{command}',
          input
        );
        errorLine.appendChild(errorOutput);
        heroTerminalBody.appendChild(errorLine);
        heroTerminalBody.scrollTop = heroTerminalBody.scrollHeight;
      }

      if (input !== 'clear') {
        const blank = document.createElement('div');
        blank.className = 'terminal-line';
        blank.innerHTML = '&nbsp;';
        heroTerminalBody.appendChild(blank);
        heroTerminalBody.scrollTop = heroTerminalBody.scrollHeight;
      }
    }

    function submitHeroTerminalCommand() {
      const value = heroTerminalInput.value;
      heroTerminalInput.value = '';
      heroHandleCommand(value);
      heroTerminalInput.focus();
    }

    heroTerminalSubmit?.addEventListener('click', submitHeroTerminalCommand);

    heroTerminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitHeroTerminalCommand();
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
    const contactSubject = document.getElementById('contactSubject');
    const contactReplyTo = document.getElementById('contactReplyTo');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'form-message';
    msgDiv.style.display = 'none';
    msgDiv.dataset.i18n = 'contact_error';
    contactForm.appendChild(msgDiv);

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!contactForm.reportValidity()) return;

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalButtonText = submitBtn.innerHTML;
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 10000);

      submitBtn.disabled = true;
      submitBtn.dataset.i18n = 'contact_sending';
      submitBtn.textContent = translations[html.lang].contact_sending;

      msgDiv.style.display = 'none';
      msgDiv.className = 'form-message';

      try {
        const nameVal = contactForm.querySelector('[name="name"]').value.trim();
        const emailVal = contactForm.querySelector('[name="email"]').value.trim();
        if (contactSubject) {
          contactSubject.value = `Portfolio Contact: ${nameVal} (${emailVal})`;
        }
        if (contactReplyTo) {
          contactReplyTo.value = emailVal;
        }

        const formData = new FormData(contactForm);
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          },
          signal: controller.signal
        });

        if (response.ok) {
          msgDiv.classList.add('success');
          msgDiv.dataset.i18n = 'contact_success';
          msgDiv.textContent = translations[html.lang].contact_success;
          msgDiv.style.display = 'block';
          contactForm.reset();
        } else {
          msgDiv.classList.add('error');
          const errorKey =
            response.status === 422
              ? 'contact_validation_error'
              : response.status === 429
                ? 'contact_rate_limit_error'
                : 'contact_error';
          msgDiv.dataset.i18n = errorKey;
          msgDiv.textContent = translations[html.lang][errorKey];
          msgDiv.style.display = 'block';
        }
      } catch (err) {
        msgDiv.classList.add('error');
        msgDiv.dataset.i18n = 'contact_network_error';
        msgDiv.textContent = translations[html.lang].contact_network_error;
        msgDiv.style.display = 'block';
      } finally {
        window.clearTimeout(timeout);
        submitBtn.disabled = false;
        submitBtn.dataset.i18n = 'contact_send';
        submitBtn.innerHTML = originalButtonText;
      }
    });
  }

  /* NEWSLETTER SIGNUP — AJAX SUBMIT */
  const newsletterForm = document.querySelector('.newsletter-form');

  if (newsletterForm) {
    const newsletterMessage =
      newsletterForm.querySelector('.newsletter-message');
    const newsletterButton =
      newsletterForm.querySelector('button[type="submit"]');

    newsletterForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!newsletterForm.reportValidity()) return;

      const originalButtonText = newsletterButton.textContent;
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 10000);
      newsletterButton.disabled = true;
      newsletterButton.textContent = 'Sending...';
      newsletterMessage.style.display = 'none';

      try {
        const formData = new FormData(newsletterForm);
        const newsletterEmail = newsletterForm.elements.email.value;
        formData.set('_replyto', newsletterEmail);
        const subjectField = newsletterForm.querySelector('[name="_subject"]');
        if (subjectField) {
          subjectField.value = `New subscriber: ${newsletterEmail}`;
          formData.set('_subject', subjectField.value);
        }
        const response = await fetch(newsletterForm.action, {
          method: 'POST',
          body: formData,
          headers: { Accept: 'application/json' },
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`Newsletter request failed with status ${response.status}.`);
        }

        newsletterMessage.className =
          'newsletter-message form-message success';
        newsletterMessage.dataset.i18n = 'newsletter_success';
        newsletterMessage.textContent = translations[html.lang].newsletter_success;
        newsletterForm.reset();
      } catch (error) {
        newsletterMessage.className =
          'newsletter-message form-message error';
        newsletterMessage.dataset.i18n = 'newsletter_error';
        newsletterMessage.textContent = translations[html.lang].newsletter_error;
      } finally {
        window.clearTimeout(timeout);
        newsletterMessage.style.display = 'block';
        newsletterButton.disabled = false;
        newsletterButton.textContent = originalButtonText;
      }
    });
  }

  /* 11. BLOG FILTERS */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const blogCards = document.querySelectorAll('.blog-card');
  const blogSections = document.querySelectorAll('.blog-category-section');

  if (filterButtons.length && blogCards.length) {
    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const filter = button.dataset.filter;

        filterButtons.forEach((filterButton) => {
          const isActive = filterButton === button;
          filterButton.classList.toggle('active', isActive);
          filterButton.setAttribute('aria-pressed', String(isActive));
        });

        blogSections.forEach((section) => {
          section.hidden = filter !== 'all' && section.dataset.blogSection !== filter;
        });
      });
    });
  }

  /* 12. ADMIN PANEL — BLOG POST GENERATOR */
  const adminForm = document.getElementById('adminForm');

  if (adminForm) {
    const titleInput = document.getElementById('postTitle');
    const dateInput = document.getElementById('postDate');
    const categoryInput = document.getElementById('postCategory');
    const excerptInput = document.getElementById('postExcerpt');
    const outputBox = document.getElementById('adminOutput');
    const generatedCode = document.getElementById('generatedCode');
    const copyBtn = document.getElementById('copyCodeBtn');
    const clearBtn = document.getElementById('adminClearBtn');
    const copyStatus = document.getElementById('copyStatus');
    const draftKey = 'admin-blog-draft';
    const categoryLabels = {
      technical: 'Technical',
      cybersecurity: 'Cybersecurity',
      tutorials: 'Tutorials',
      projects: 'Projects',
      poetry: 'Poetry',
      awareness: 'Awareness',
      personal: 'Personal'
    };
    let draftTimer;

    dateInput.value = getDhakaDateTimeInputValue();

    const clearDraft = () => {
      window.clearTimeout(draftTimer);
      try {
        localStorage.removeItem(draftKey);
      } catch (error) {
        console.error('Could not clear the blog post draft.', error);
      }
    };
    const saveDraft = () => {
      window.clearTimeout(draftTimer);
      draftTimer = window.setTimeout(() => {
        const draft = Object.fromEntries(
          [...adminForm.elements]
            .filter((field) => field.name)
            .map((field) => [field.name, field.value])
        );
        try {
          localStorage.setItem(draftKey, JSON.stringify(draft));
        } catch (error) {
          console.error('Could not save the blog post draft.', error);
        }
      }, 500);
    };

    let savedDraft;
    try {
      savedDraft = localStorage.getItem(draftKey);
    } catch (error) {
      console.error('Could not read the saved blog post draft.', error);
    }
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        [...adminForm.elements].forEach((field) => {
          if (field.name && typeof draft[field.name] === 'string') {
            field.value = draft[field.name];
          }
        });
      } catch (error) {
        console.error('Saved blog post draft is invalid JSON.', error);
        try {
          localStorage.removeItem(draftKey);
        } catch (removeError) {
          console.error('Could not remove the invalid blog post draft.', removeError);
        }
      }
    }
    adminForm.addEventListener('input', saveDraft);
    adminForm.addEventListener('change', saveDraft);

    adminForm.addEventListener('submit', (event) => {
      event.preventDefault();

      if (!adminForm.reportValidity()) return;

      const category = categoryInput.value;
      if (!Object.hasOwn(categoryLabels, category)) {
        categoryInput.setCustomValidity('Select a valid post category.');
        categoryInput.reportValidity();
        categoryInput.setCustomValidity('');
        return;
      }

      const categoryLabel = categoryLabels[category];
      const categoryTranslationKey = blogCategoryTranslationKeys[category];
      const title = escapeHtml(titleInput.value.trim());
      const publishedAt = `${dateInput.value}:00+06:00`;
      if (Number.isNaN(new Date(publishedAt).getTime())) {
        dateInput.setCustomValidity('Enter a valid publication date and time.');
        dateInput.reportValidity();
        dateInput.setCustomValidity('');
        return;
      }
      const safePublishedAt = escapeHtml(publishedAt);
      const date = escapeHtml(formatPostDate({ id: 'draft', publishedAt }, html.lang));
      const excerpt = escapeHtml(excerptInput.value.trim());
      const html = [
        `<!-- ${categoryLabel.toUpperCase()} POST -->`,
        `<article class="blog-card" data-category="${category}">`,
        '  <div class="blog-card-header">',
        `    <span class="blog-category ${category}" data-i18n="${categoryTranslationKey}">${categoryLabel}</span>`,
        `    <time class="blog-date" datetime="${safePublishedAt}" data-published-at="${safePublishedAt}">${date}</time>`,
        '  </div>',
        `  <h3>${title}</h3>`,
        `  <p class="blog-excerpt">${excerpt}</p>`,
        '  <a href="#" class="blog-read-more">Read More →</a>',
        '</article>'
      ].join('\n');

      generatedCode.textContent = html;
      outputBox.style.display = 'block';
      copyStatus.textContent = '';
      copyBtn.classList.remove('copied');
      clearDraft();
      outputBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    copyBtn.addEventListener('click', async () => {
      const text = generatedCode.textContent;
      let copied = false;

      try {
        if (!navigator.clipboard?.writeText) {
          throw new Error('Clipboard API is unavailable.');
        }
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch (clipboardError) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();

        try {
          copied = document.execCommand('copy');
        } catch (fallbackError) {
          copied = false;
        } finally {
          textarea.remove();
        }
      }

      if (copied) {
        copyStatus.textContent = 'Code copied to clipboard.';
        copyBtn.classList.add('copied');
      } else {
        copyStatus.textContent =
          'Could not copy automatically. Select and copy the code above.';
        copyBtn.classList.remove('copied');
      }
    });

    clearBtn.addEventListener('click', () => {
      adminForm.reset();
      dateInput.value = getDhakaDateTimeInputValue();
      document.getElementById('postAuthor').value = 'Md Iftiur Hossen Riyad';
      outputBox.style.display = 'none';
      generatedCode.textContent = '';
      copyStatus.textContent = '';
      copyBtn.classList.remove('copied');
      clearDraft();
    });
  }

  /* ADMIN PANEL — DATA SECTION MANAGERS */
  const dataManagerHost = document.getElementById('dataManagerPanels');
  if (dataManagerHost) {
    const managerConfigs = [
      {
        id: 'certifications', title: 'Certifications', file: 'data-certifications.js',
        targetName: 'certificationsData', current: () => certificationsData,
        currentLabel: (item) => translations.en[item.titleKey] || item.title || 'Untitled certificate',
        fields: [
          { name: 'title', label: 'Title', required: true },
          { name: 'issuer', label: 'Issuer', required: true },
          { name: 'date', label: 'Date', required: true },
          { name: 'verifyUrl', label: 'Verify URL', type: 'url', required: true },
          { name: 'icon', label: 'Icon', type: 'select', options: ['star', 'clock', 'target', 'file', 'layers', 'shield', 'award'] },
          { name: 'image', label: 'Certificate Image Path', placeholder: 'e.g., certs/red-team-1.pdf' }
        ],
        build: (v) => ({ id: managerId(v.title), title: v.title, issuer: v.issuer, date: v.date, verifyUrl: v.verifyUrl, icon: v.icon, image: v.image })
      },
      {
        id: 'projects', title: 'Projects', file: 'data-projects.js', targetName: 'projectsData.featured or projectsData.classic',
        current: () => [
          ...projectsData.featured.map((item) => ({ item, group: 'featured' })),
          ...projectsData.classic.map((item) => ({ item, group: 'classic' }))
        ],
        currentLabel: ({ item, group }) => `[${group}] ${item.name}`,
        fields: [
          { name: 'name', label: 'Name', required: true },
          { name: 'role', label: 'Role', required: true },
          { name: 'description', label: 'Description', type: 'textarea', required: true },
          { name: 'status', label: 'Status', type: 'select', options: ['prototype', 'working', 'proposal'] },
          { name: 'tech', label: 'Tech Tags (comma-separated)', placeholder: 'C++, Cryptography, OOP' },
          { name: 'features', label: 'Features (comma-separated)', placeholder: 'Feature one, Feature two' },
          { name: 'screenshots', label: 'Screenshot paths (comma-separated)', placeholder: 'screenshots/project-1.png, screenshots/project-2.png' },
          { name: 'context', label: 'Context', placeholder: 'Project context or collaborators' },
          { name: 'githubLink', label: 'GitHub Link', type: 'url' },
          { name: 'projectType', label: 'Project Type', type: 'select', options: ['featured', 'classic'], required: true }
        ],
        build: (v) => ({
          name: v.name, role: v.role, description: v.description, status: v.status,
          tech: splitCsv(v.tech), features: splitCsv(v.features), screenshots: splitCsv(v.screenshots),
          context: v.context, githubLink: v.githubLink
        }),
        targetFor: (v) => `projectsData.${v.projectType}`
      },
      {
        id: 'skills', title: 'Skills', file: 'data-skills.js', targetName: 'skillsData',
        current: () => skillsData,
        currentLabel: (item) => translations.en[item.titleKey] || item.title || 'Untitled category',
        fields: [
          { name: 'title', label: 'Category Title', required: true },
          { name: 'tags', label: 'Skills (comma-separated)', type: 'textarea', required: true, placeholder: 'C, C++, Java, Python' }
        ],
        build: (v) => ({ title: v.title, tags: splitCsv(v.tags) })
      },
      {
        id: 'achievements', title: 'Achievements', file: 'data-achievements.js', targetName: 'achievementsData.achievements or achievementsData.leadership',
        current: () => [
          ...achievementsData.achievements.map((item) => ({ item, group: 'achievements' })),
          ...achievementsData.leadership.map((item) => ({ item, group: 'leadership' }))
        ],
        currentLabel: ({ item, group }) => `[${group}] ${translations.en[item.titleKey] || item.title || 'Untitled item'}`,
        fields: [
          { name: 'badge', label: 'Badge', placeholder: 'e.g., Fellowship 2026' },
          { name: 'title', label: 'Title', required: true },
          { name: 'organization', label: 'Organization' },
          { name: 'description', label: 'Description', type: 'textarea', required: true },
          { name: 'recordType', label: 'Type', type: 'select', options: ['achievement', 'leadership'], required: true }
        ],
        build: (v) => v.recordType === 'leadership'
          ? { title: v.title, description: v.description }
          : { badge: v.badge, title: v.title, organization: v.organization, description: v.description },
        targetFor: (v) => `achievementsData.${v.recordType === 'leadership' ? 'leadership' : 'achievements'}`
      },
      {
        id: 'education', title: 'Education', file: 'data-education.js', targetName: 'educationData',
        current: () => educationData,
        currentLabel: (item) => translations.en[item.titleKey] || item.title || 'Untitled education',
        fields: [
          { name: 'date', label: 'Date Label', required: true },
          { name: 'title', label: 'Degree', required: true },
          { name: 'organization', label: 'Institution', required: true },
          { name: 'details', label: 'Details' }
        ],
        build: (v) => ({ date: v.date, title: v.title, organization: v.organization, details: v.details })
      },
      {
        id: 'research', title: 'Research', file: 'data-research.js', targetName: 'researchData',
        current: () => researchData,
        currentLabel: (item) => translations.en[item.titleKey] || item.title || 'Untitled research',
        fields: [
          { name: 'status', label: 'Status', required: true },
          { name: 'title', label: 'Title', required: true },
          { name: 'venue', label: 'Venue' },
          { name: 'domain', label: 'Domain', type: 'textarea' },
          { name: 'note', label: 'Note' },
          { name: 'independent', label: 'Independent research', type: 'checkbox' }
        ],
        build: (v) => ({
          status: v.status, title: v.title, venue: v.venue, domain: v.domain, note: v.note,
          statusClass: v.independent ? 'independent' : ''
        })
      },
      {
        id: 'social', title: 'Social Links', file: 'data-social.js', targetName: 'socialData.links',
        current: () => socialData.links,
        currentLabel: (item) => `${item.name}: ${item.href}`,
        fields: [
          { name: 'name', label: 'Platform', required: true },
          { name: 'href', label: 'URL', type: 'url', required: true },
          { name: 'icon', label: 'Icon', placeholder: 'e.g., github' },
          { name: 'showInHero', label: 'Show in home-page hero', type: 'checkbox' }
        ],
        build: (v) => ({ name: v.name, href: v.href, icon: v.icon, showInHero: v.showInHero })
      },
      {
        id: 'contact', title: 'Contact Info', file: 'data-social.js', targetName: 'socialData.contact',
        current: () => socialData.contact,
        currentLabel: (item) => `${item.type}: ${item.value}`,
        fields: [
          { name: 'type', label: 'Type', type: 'select', options: ['email', 'phone', 'location'], required: true },
          { name: 'title', label: 'Label', required: true },
          { name: 'value', label: 'Value', required: true },
          { name: 'href', label: 'Link', placeholder: 'mailto:..., tel:..., or leave empty', allowedProtocols: ['http:', 'https:', 'mailto:', 'tel:'] }
        ],
        build: (v) => ({ type: v.type, title: v.title, value: v.value, href: v.href })
      },
      {
        id: 'roadmap', title: 'Roadmap', file: 'data-roadmap.js', targetName: 'roadmapData',
        current: () => roadmapData,
        currentLabel: (item) => `${item.year}: ${translations.en[item.titleKey] || item.title || 'Untitled milestone'}`,
        fields: [
          { name: 'year', label: 'Year', required: true },
          { name: 'badge', label: 'Badge (optional)', placeholder: 'e.g., Current' },
          { name: 'title', label: 'Milestone title', required: true },
          { name: 'description', label: 'Description', type: 'textarea', required: true }
        ],
        build: (v) => ({ year: v.year, badge: v.badge, title: v.title, description: v.description })
      },
      {
        id: 'services', title: 'Services', file: 'data-services.js', targetName: 'servicesData',
        current: () => servicesData,
        currentLabel: (item) => translations.en[item.titleKey] || item.title || 'Untitled service',
        fields: [
          { name: 'icon', label: 'Icon', placeholder: 'e.g., 🛡️' },
          { name: 'title', label: 'Service title', required: true },
          { name: 'description', label: 'Description', type: 'textarea', required: true },
          { name: 'features', label: 'Included items (comma-separated)', placeholder: 'Assessment, Report, Recommendations' }
        ],
        build: (v) => ({ icon: v.icon, title: v.title, description: v.description, features: splitCsv(v.features) })
      },
      {
        id: 'uses', title: 'Uses', file: 'data-uses.js', targetName: 'usesData[category].items',
        current: () => usesData.flatMap((category) => category.items.map((item) => ({ ...item, categoryId: category.id }))),
        currentLabel: (item) => {
          const category = usesData.find((entry) => entry.id === item.categoryId);
          return `${translations.en[category?.titleKey] || item.categoryId}: ${translations.en[item.nameKey] || item.name || 'Untitled tool'}`;
        },
        fields: [
          { name: 'category', label: 'Category', type: 'select', options: usesData.map((category) => category.id), required: true },
          { name: 'emoji', label: 'Emoji', placeholder: 'e.g., 💻' },
          { name: 'name', label: 'Tool / item name', required: true },
          { name: 'description', label: 'Description', type: 'textarea', required: true }
        ],
        build: (v) => ({ emoji: v.emoji, name: v.name, description: v.description }),
        targetFor: (v) => `usesData.find(category => category.id === '${v.category}').items`
      },
      {
        id: 'resources', title: 'Resources', file: 'data-resources.js', targetName: 'resourcesData',
        current: () => resourcesData,
        currentLabel: (item) => translations.en[item.titleKey] || item.titleEn || item.title || 'Untitled resource',
        fields: [
          { name: 'icon', label: 'Icon', placeholder: 'e.g., 📄' },
          { name: 'titleEn', label: 'Title (English)', required: true },
          { name: 'titleBn', label: 'Title (Bengali)', required: true },
          { name: 'descriptionEn', label: 'Description (English)', type: 'textarea', required: true },
          { name: 'descriptionBn', label: 'Description (Bengali)', type: 'textarea', required: true },
          { name: 'fileType', label: 'File type', placeholder: 'PDF, DOCX, ZIP' },
          { name: 'fileSize', label: 'File size', placeholder: '2.5 MB' },
          { name: 'downloadUrl', label: 'Download path', placeholder: 'resources/guide.pdf (use # until ready)' },
          { name: 'featured', label: 'Feature this resource', type: 'checkbox' }
        ],
        build: (v) => ({
          icon: v.icon, titleEn: v.titleEn, titleBn: v.titleBn,
          descriptionEn: v.descriptionEn, descriptionBn: v.descriptionBn,
          fileType: v.fileType, fileSize: v.fileSize,
          downloadUrl: v.downloadUrl || '#', featured: v.featured
        })
      }
    ];

    const jsString = (value) =>
      `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r\n|\r|\n/g, '\\n').replace(/\t/g, '\\t')}'`;
    const jsValue = (value) => Array.isArray(value)
      ? `[${value.map(jsString).join(', ')}]`
      : typeof value === 'boolean'
        ? String(value)
        : typeof value === 'number'
          ? String(value)
          : jsString(value);
    const formatObject = (object) => `  {\n${Object.entries(object)
      .map(([key, value]) => `    ${key}: ${jsValue(value)},`)
      .join('\n')}\n  },`;
    const managerId = (value) => value
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const splitCsv = (value) => value.split(',').map((item) => item.trim()).filter(Boolean);

    const makeField = (definition, managerIdValue) => {
      const wrapper = document.createElement('div');
      wrapper.className = `admin-form-group${definition.type === 'checkbox' ? ' admin-form-checkbox' : ''}`;
      if (definition.type === 'checkbox') {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.name = definition.name;
        input.dataset.managerField = definition.name;
        label.append(input, document.createTextNode(definition.label));
        wrapper.appendChild(label);
        return wrapper;
      }
      const id = `${managerIdValue}-${definition.name}`;
      const label = document.createElement('label');
      label.htmlFor = id;
      label.textContent = definition.label;
      let field;
      if (definition.type === 'select') {
        field = document.createElement('select');
        definition.options.forEach((option) => {
          const optionNode = document.createElement('option');
          optionNode.value = option;
          optionNode.textContent = option;
          field.appendChild(optionNode);
        });
      } else if (definition.type === 'textarea') {
        field = document.createElement('textarea');
        field.rows = 4;
      } else {
        field = document.createElement('input');
        field.type = definition.type || 'text';
      }
      field.id = id;
      field.name = definition.name;
      field.dataset.managerField = definition.name;
      if (definition.min !== undefined) field.min = definition.min;
      if (definition.max !== undefined) field.max = definition.max;
      if (definition.allowedProtocols) {
        field.dataset.allowedProtocols = definition.allowedProtocols.join(',');
      }
      if (definition.required) field.required = true;
      if (definition.placeholder) field.placeholder = definition.placeholder;
      wrapper.append(label, field);
      return wrapper;
    };

    managerConfigs.forEach((config) => {
      const panel = document.createElement('section');
      panel.className = 'admin-tab-panel';
      panel.dataset.panel = config.id;
      panel.hidden = true;

      const heading = document.createElement('h2');
      heading.className = 'admin-panel-title';
      heading.textContent = `${config.title} Manager`;
      const description = document.createElement('p');
      description.className = 'admin-panel-desc';
      description.textContent = `Add an item to ${config.file}; existing entries are shown below.`;
      panel.append(heading, description);

      const currentList = document.createElement('section');
      currentList.className = 'admin-current-list';
      const currentHeading = document.createElement('h3');
      currentHeading.textContent = 'Current Items';
      const currentItems = document.createElement('ul');
      currentItems.className = 'admin-current-items';
      currentItems.id = `current-${config.id}-list`;
      config.current().forEach((item) => {
        const listItem = document.createElement('li');
        listItem.textContent = config.currentLabel(item);
        currentItems.appendChild(listItem);
      });
      currentList.append(currentHeading, currentItems);

      const form = document.createElement('form');
      form.className = 'admin-form manager-form';
      form.noValidate = false;
      form.dataset.manager = config.id;
      config.fields.forEach((field) => form.appendChild(makeField(field, config.id)));

      const actions = document.createElement('div');
      actions.className = 'admin-actions';
      const generate = document.createElement('button');
      generate.type = 'submit';
      generate.className = 'btn btn-primary';
      generate.textContent = `Generate ${config.title.replace(/ Info$/, '')} Code`;
      const clear = document.createElement('button');
      clear.type = 'button';
      clear.className = 'btn btn-outline';
      clear.textContent = 'Clear Form';
      actions.append(generate, clear);
      form.appendChild(actions);

      const preview = document.createElement('section');
      preview.className = 'admin-preview-section';
      const previewHeading = document.createElement('h3');
      previewHeading.className = 'admin-preview-title';
      previewHeading.textContent = 'Live Preview';
      const previewContent = document.createElement('pre');
      previewContent.className = 'admin-manager-preview';
      previewContent.textContent = 'Complete the form to preview the data object.';
      preview.append(previewHeading, previewContent);

      const output = document.createElement('section');
      output.className = 'admin-output';
      output.style.display = 'none';
      output.setAttribute('aria-live', 'polite');
      const outputHeader = document.createElement('div');
      outputHeader.className = 'admin-output-header';
      const outputTitle = document.createElement('h2');
      outputTitle.textContent = 'Generated Code';
      const copy = document.createElement('button');
      copy.type = 'button';
      copy.className = 'copy-btn';
      copy.textContent = '📋 Copy Code';
      const outputCode = document.createElement('code');
      const pre = document.createElement('pre');
      pre.appendChild(outputCode);
      const copyStatus = document.createElement('p');
      copyStatus.className = 'admin-copy-status';
      copyStatus.setAttribute('role', 'status');
      outputHeader.append(outputTitle, copy);
      output.append(outputHeader, pre, copyStatus);

      const instructions = document.createElement('section');
      instructions.className = 'admin-instructions';
      const instructionsTitle = document.createElement('h4');
      instructionsTitle.textContent = '📝 How to add this item:';
      const instructionsList = document.createElement('ol');
      const target = document.createElement('code');
      target.textContent = config.targetName;
      const fileCode = document.createElement('code');
      fileCode.textContent = config.file;
      [
        `Copy the generated JavaScript code above.`,
        `Open ${config.file} in VS Code.`,
        `Paste the object into ${config.targetName} before its closing bracket.`,
        'Save the file and push your changes to GitHub.'
      ].forEach((text) => {
        const item = document.createElement('li');
        if (text.includes(config.file)) {
          item.append('Open ', fileCode.cloneNode(true), ' in VS Code.');
        } else if (text.includes(config.targetName)) {
          item.append('Paste the object into ', target.cloneNode(true), ' before its closing bracket.');
        } else {
          item.textContent = text;
        }
        instructionsList.appendChild(item);
      });
      instructions.append(instructionsTitle, instructionsList);

      panel.append(currentList, form, preview, output, instructions);
      dataManagerHost.appendChild(panel);

      setupAdminTab(config, form, previewContent, output, outputCode, copy, copyStatus, clear);
    });

    function setupAdminTab(config, form, preview, output, outputCode, copyButton, copyStatus, clearButton) {
      const draftKey = `admin-${config.id}-draft`;
      const inputs = [...form.querySelectorAll('[data-manager-field]')];
      const readValues = () => Object.fromEntries(inputs.map((input) => [
        input.dataset.managerField,
        input.type === 'checkbox' ? input.checked : input.value.trim()
      ]));
      const buildObject = (values) => config.build(values);
      const refreshPreview = () => {
        const values = readValues();
        const object = buildObject(values);
        preview.textContent = Object.values(values).some((value) => value !== '' && value !== false)
          ? `${config.targetFor ? `Target: ${config.targetFor(values)}\n` : ''}${formatObject(object)}`
          : 'Complete the form to preview the data object.';
      };
      let draftTimer;
      const saveDraft = () => {
        window.clearTimeout(draftTimer);
        draftTimer = window.setTimeout(() => {
          try {
            localStorage.setItem(draftKey, JSON.stringify(readValues()));
          } catch (error) {
            console.error(`Could not save ${config.title.toLowerCase()} draft.`, error);
          }
        }, 500);
      };
      try {
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) {
          const values = JSON.parse(savedDraft);
          inputs.forEach((input) => {
            const value = values[input.dataset.managerField];
            if (input.type === 'checkbox' && typeof value === 'boolean') input.checked = value;
            else if (typeof value === 'string') input.value = value;
          });
        }
      } catch (error) {
        console.error(`Could not restore ${config.title.toLowerCase()} draft.`, error);
        localStorage.removeItem(draftKey);
      }
      inputs.forEach((input) => {
        input.addEventListener('input', () => {
          input.setCustomValidity('');
          refreshPreview();
          saveDraft();
        });
        input.addEventListener('change', () => {
          refreshPreview();
          saveDraft();
        });
      });
      refreshPreview();

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        let invalidUrl = false;
        inputs.forEach((input) => {
          if (input.type !== 'url' && !input.dataset.allowedProtocols) return;
          input.setCustomValidity('');
          const value = input.value.trim();
          if (!value) return;
          try {
            const url = new URL(value);
            const allowed = (input.dataset.allowedProtocols || 'http:,https:').split(',');
            if (!allowed.includes(url.protocol)) {
              input.setCustomValidity(`Allowed URL protocols: ${allowed.join(', ')}.`);
              invalidUrl = true;
            }
          } catch (error) {
            input.setCustomValidity('Enter a valid URL.');
            invalidUrl = true;
          }
        });
        if (invalidUrl) {
          form.reportValidity();
          return;
        }
        if (!form.reportValidity()) return;
        const values = readValues();
        const object = buildObject(values);
        outputCode.textContent = formatObject(object);
        output.style.display = 'block';
        copyStatus.textContent = '';
        copyButton.classList.remove('copied');
        output.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });

      copyButton.addEventListener('click', async () => {
        let copied = false;
        try {
          if (!navigator.clipboard?.writeText) throw new Error('Clipboard API is unavailable.');
          await navigator.clipboard.writeText(outputCode.textContent);
          copied = true;
        } catch (error) {
          console.warn('Clipboard API unavailable; trying the copy fallback.', error);
          const textarea = document.createElement('textarea');
          textarea.value = outputCode.textContent;
          textarea.setAttribute('readonly', '');
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          try {
            copied = document.execCommand('copy');
          } catch (fallbackError) {
            console.error(`Could not copy ${config.title.toLowerCase()} code.`, fallbackError);
          } finally {
            textarea.remove();
          }
        }
        copyStatus.textContent = copied
          ? '✅ Copied!'
          : 'Could not copy automatically. Select and copy the code above.';
        copyButton.classList.toggle('copied', copied);
      });

      clearButton.addEventListener('click', () => {
        window.clearTimeout(draftTimer);
        form.reset();
        refreshPreview();
        output.style.display = 'none';
        outputCode.textContent = '';
        copyStatus.textContent = '';
        copyButton.classList.remove('copied');
        try {
          localStorage.removeItem(draftKey);
        } catch (error) {
          console.error(`Could not remove ${config.title.toLowerCase()} draft.`, error);
        }
      });
    }
  }

  /* ADMIN PANEL — TABS AND TESTIMONIAL GENERATOR */
  const adminTabs = document.getElementById('adminTabs');
  if (adminTabs) {
    const tabs = [...adminTabs.querySelectorAll('.admin-tab')];
    const panels = [...document.querySelectorAll('.admin-tab-panel')];
    const activateTab = (tabName) => {
      const selectedTab = tabs.find((tab) => tab.dataset.tab === tabName) || tabs[0];
      tabs.forEach((tab) => {
        const active = tab === selectedTab;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', String(active));
      });
      panels.forEach((panel) => {
        const active = panel.dataset.panel === selectedTab.dataset.tab;
        panel.classList.toggle('active', active);
        panel.hidden = !active;
      });
      localStorage.setItem('admin-active-tab', selectedTab.dataset.tab);
    };

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => activateTab(tab.dataset.tab));
    });
    activateTab(localStorage.getItem('admin-active-tab') || 'blog');
  }

  const testimonialForm = document.getElementById('testimonialForm');
  if (testimonialForm) {
    const draftKey = 'admin-testimonial-draft';
    const fields = {
      name: document.getElementById('tName'),
      role: document.getElementById('tRole'),
      relationship: document.getElementById('tRelationship'),
      organization: document.getElementById('tOrganization'),
      quote: document.getElementById('tQuote'),
      linkedin: document.getElementById('tLinkedin'),
      avatar: document.getElementById('tAvatar'),
      isPlaceholder: document.getElementById('tIsPlaceholder')
    };
    const preview = {
      quote: document.getElementById('previewQuote'),
      avatar: document.getElementById('previewAvatar'),
      name: document.getElementById('previewName'),
      role: document.getElementById('previewRole'),
      organization: document.getElementById('previewOrg'),
      relationship: document.getElementById('previewRelationship')
    };
    const output = document.getElementById('testimonialOutput');
    const code = document.getElementById('generatedTestimonialCode');
    const formStatus = document.getElementById('testimonialFormStatus');
    const copyButton = document.getElementById('copyTestimonialBtn');
    const copyStatus = document.getElementById('testimonialCopyStatus');
    let saveDraftTimer;

    const fieldValues = () => Object.fromEntries(
      Object.entries(fields).map(([key, field]) => [
        key,
        field.type === 'checkbox' ? field.checked : field.value
      ])
    );

    const updatePreview = () => {
      const values = fieldValues();
      preview.quote.textContent = values.quote.trim() || 'Your quote will appear here...';
      preview.name.textContent = values.name.trim() || 'Name';
      preview.role.textContent = values.role.trim() || 'Role';
      preview.organization.textContent = values.organization.trim() || 'Organization';
      preview.relationship.textContent = values.relationship.trim() || 'Relationship';

      preview.avatar.replaceChildren();
      const avatarUrl = values.avatar.trim();
      if (avatarUrl) {
        try {
          const parsedUrl = new URL(avatarUrl);
          if (parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:') {
            const image = document.createElement('img');
            image.src = parsedUrl.href;
            image.alt = values.name.trim() || 'Testimonial author';
            image.addEventListener('error', () => {
              preview.avatar.textContent = Array.from(values.name.trim())[0] || '?';
            }, { once: true });
            preview.avatar.appendChild(image);
            return;
          }
        } catch (error) {
          console.warn('Preview avatar URL is invalid.', error);
        }
      }
      preview.avatar.textContent = Array.from(values.name.trim())[0] || '?';
    };

    const saveDraft = () => {
      window.clearTimeout(saveDraftTimer);
      saveDraftTimer = window.setTimeout(() => {
        try {
          localStorage.setItem(draftKey, JSON.stringify(fieldValues()));
        } catch (error) {
          console.error('Could not save the testimonial draft.', error);
          formStatus.textContent = 'Could not save the draft in this browser.';
        }
      }, 500);
    };

    const restoreDraft = () => {
      let savedDraft;
      try {
        savedDraft = localStorage.getItem(draftKey);
      } catch (error) {
        console.error('Could not read the saved testimonial draft.', error);
        return;
      }
      if (!savedDraft) return;
      try {
        const draft = JSON.parse(savedDraft);
        Object.entries(fields).forEach(([key, field]) => {
          if (typeof draft[key] === 'string' && field.type !== 'checkbox') {
            field.value = draft[key];
          } else if (key === 'isPlaceholder' && typeof draft[key] === 'boolean') {
            field.checked = draft[key];
          }
        });
      } catch (error) {
        console.error('Saved testimonial draft is invalid JSON.', error);
        localStorage.removeItem(draftKey);
      }
    };

    const toJsString = (value) =>
      `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r\n|\r|\n/g, '\\n').replace(/\t/g, '\\t')}'`;
    const validateHttpUrl = (field) => {
      field.setCustomValidity('');
      if (!field.value.trim()) return true;
      try {
        const url = new URL(field.value.trim());
        if (url.protocol === 'https:' || url.protocol === 'http:') return true;
      } catch (error) {
        field.setCustomValidity('Enter a valid HTTP or HTTPS URL.');
        return false;
      }
      field.setCustomValidity('Only HTTP and HTTPS URLs are allowed.');
      return false;
    };
    const createId = (name) => name
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    restoreDraft();
    updatePreview();
    Object.values(fields).forEach((field) => {
      field.addEventListener('input', () => {
        updatePreview();
        saveDraft();
      });
      field.addEventListener('change', saveDraft);
    });

    document.getElementById('generateTestimonialBtn').addEventListener('click', () => {
      formStatus.textContent = '';
      const safeUrls = [fields.linkedin, fields.avatar].every(validateHttpUrl);
      if (!safeUrls) {
        testimonialForm.reportValidity();
        return;
      }
      if (!testimonialForm.reportValidity()) return;
      const values = fieldValues();
      const entry = [
        '  {',
        `    id: ${toJsString(createId(values.name.trim()))},`,
        `    quote: ${toJsString(values.quote.trim())},`,
        `    name: ${toJsString(values.name.trim())},`,
        `    role: ${toJsString(values.role.trim())},`,
        `    organization: ${toJsString(values.organization.trim())},`,
        `    relationship: ${toJsString(values.relationship.trim())},`,
        `    avatar: ${toJsString(values.avatar.trim())},`,
        `    linkedin: ${toJsString(values.linkedin.trim())},`,
        `    isPlaceholder: ${values.isPlaceholder}`,
        '  },'
      ].join('\n');
      code.textContent = entry;
      output.style.display = 'block';
      copyStatus.textContent = '';
      copyButton.classList.remove('copied');
      try {
        localStorage.removeItem(draftKey);
      } catch (error) {
        console.error('Generated code, but the saved draft could not be cleared.', error);
      }
      output.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    copyButton.addEventListener('click', async () => {
      let copied = false;
      try {
        if (!navigator.clipboard?.writeText) {
          throw new Error('Clipboard API is unavailable.');
        }
        await navigator.clipboard.writeText(code.textContent);
        copied = true;
      } catch (clipboardError) {
        console.warn('Clipboard API unavailable; trying the copy fallback.', clipboardError);
        const textarea = document.createElement('textarea');
        textarea.value = code.textContent;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          copied = document.execCommand('copy');
        } catch (fallbackError) {
          console.error('Could not copy testimonial code.', fallbackError);
        } finally {
          textarea.remove();
        }
      }

      copyStatus.textContent = copied
        ? '✅ Copied!'
        : 'Could not copy automatically. Select and copy the code above.';
      copyButton.classList.toggle('copied', copied);
    });

    document.getElementById('clearTestimonialBtn').addEventListener('click', () => {
      window.clearTimeout(saveDraftTimer);
      testimonialForm.reset();
      updatePreview();
      output.style.display = 'none';
      code.textContent = '';
      copyStatus.textContent = '';
      formStatus.textContent = '';
      copyButton.classList.remove('copied');
      try {
        localStorage.removeItem(draftKey);
      } catch (error) {
        console.error('Could not clear the saved testimonial draft.', error);
        formStatus.textContent = 'Form cleared, but the saved draft could not be removed.';
      }
    });
  }

  /* DYNAMIC POST LOADER */
  const postArticle = document.getElementById('postArticle');
  const postNotFound = document.getElementById('postNotFound');

  if (postArticle) {
    const postId = new URLSearchParams(window.location.search).get('id');
    const post =
      typeof postsData !== 'undefined' &&
      postId &&
      Object.prototype.hasOwnProperty.call(postsData, postId)
        ? postsData[postId]
        : null;

    if (post) {
      const postUrl = new URL(`post.html?id=${encodeURIComponent(post.id)}`, 'https://iftiurhossenriyad.github.io/');
      document.getElementById('ogUrl')?.setAttribute('content', postUrl.href);
      document.getElementById('canonicalUrl')?.setAttribute('href', postUrl.href);
      currentPost = post;
      updateBlogLanguage(html.lang);
    } else {
      postArticle.style.display = 'none';
      if (postNotFound) {
        postNotFound.style.display = 'block';
      }
      document.title = `${translations[html.lang].post_not_found} — Md Iftiur Hossen Riyad`;
    }
  }

  /* 13. CONSOLE EASTER EGG */
  console.log(
    '%c👋 Hello, curious developer!',
    'color: #00d9ff; font-size: 16px; font-weight: bold;'
  );
  console.log(
    '%cLooking for bugs? Feel free to reach out:',
    'color: #9ba8b8; font-size: 12px;'
  );
  const contactEmail = typeof socialData !== 'undefined'
    ? socialData.contact.find((item) => item.type === 'email')?.value
    : '';
  console.log(
    `%c${contactEmail || ''}`,
    'color: #10b981; font-size: 12px; font-family: monospace;'
  );
})();