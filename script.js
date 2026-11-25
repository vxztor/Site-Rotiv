document.addEventListener('DOMContentLoaded', function () {

    // ================================================
    // CONFIGURAÇÕES GLOBAIS
    // ================================================

    const PHONE_NUMBER = '5521971129223';
    const INITIAL_BATCH = 12;
    window.currentWhatsAppLink = 'https://wa.me/5521971129223?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20Rotiv%20e%20gostaria%20de%20solicitar%20um%20or%C3%A7amento.';

    // ================================================
    // ANO DE COPYRIGHT DINÂMICO
    // ================================================

    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = String(new Date().getFullYear());
    }

    // ================================================
    // MENU MOBILE
    // ================================================

    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    function closeMobileMenu() {
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
            if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
        }
    }

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('hidden');
            const expanded = !mobileMenu.classList.contains('hidden');
            this.setAttribute('aria-expanded', String(expanded));
        });
    }

    // ================================================
    // GALERIA DINÂMICA (SINCRONIZADA DO GOOGLE DRIVE)
    // Lê data/gallery.json gerado pelo GitHub Actions
    // ================================================

    let GALLERY_DATA = {
        'eletrica': [],
        'ar-condicionado': [],
        'comandos': [],
        'wallbox': []
    };

    const TAB_LABELS = {
        'eletrica': 'Elétrica',
        'ar-condicionado': 'Ar-Condicionado',
        'comandos': 'Comandos Elétricos',
        'wallbox': 'Wallbox'
    };

    const renderedCounts = {
        'eletrica': document.querySelectorAll('[data-grid="eletrica"] a.js-gallery-item').length,
        'ar-condicionado': 0,
        'comandos': 0,
        'wallbox': 0
    };

    let galleryLoadedPromise = fetch('data/gallery.json', { cache: 'no-cache' })
        .then(function (resp) {
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            return resp.json();
        })
        .then(function (data) {
            GALLERY_DATA = data;
            // Atualiza contadores nas abas e botões "Carregar mais"
            Object.keys(TAB_LABELS).forEach(function (tabKey) {
                const items = GALLERY_DATA[tabKey] || [];
                const tabBtn = document.querySelector('.gallery-tab[data-tab="' + tabKey + '"]');
                if (tabBtn) {
                    tabBtn.textContent = TAB_LABELS[tabKey] + ' (' + items.length + ')';
                }
                updateLoadMoreButton(tabKey);
            });
            return data;
        })
        .catch(function (err) {
            console.warn('Não foi possível carregar data/gallery.json:', err);
            return GALLERY_DATA;
        });

    function createGalleryCard(item, tabKey, index) {
        const link = document.createElement('a');
        link.href = item.full;
        link.className = 'gallery-card js-gallery-item';
        link.setAttribute('data-gallery', tabKey);
        link.setAttribute('data-index', String(index));
        link.setAttribute('aria-label', 'Ampliar foto: ' + item.alt);

        const frame = document.createElement('div');
        frame.className = 'gallery-card-frame';

        const img = document.createElement('img');
        img.src = item.thumb;
        img.alt = item.alt;
        img.width = item.w;
        img.height = item.h;
        img.loading = 'lazy';
        img.decoding = 'async';

        frame.appendChild(img);
        link.appendChild(frame);
        return link;
    }

    function updateLoadMoreButton(tabKey) {
        const items = GALLERY_DATA[tabKey] || [];
        const btn = document.querySelector('[data-load-more="' + tabKey + '"]');
        if (!btn) return;
        const remaining = items.length - (renderedCounts[tabKey] || 0);
        if (remaining <= 0) {
            btn.style.display = 'none';
        } else {
            btn.style.display = '';
            btn.textContent = 'Carregar mais fotos (+' + remaining + ')';
        }
    }

    function renderBatch(tabKey, countToRender) {
        const items = GALLERY_DATA[tabKey] || [];
        const grid = document.querySelector('[data-grid="' + tabKey + '"]');
        if (!grid) return;

        const start = renderedCounts[tabKey] || 0;
        const end = Math.min(items.length, countToRender);
        if (start < end) {
            const fragment = document.createDocumentFragment();
            for (let i = start; i < end; i++) {
                fragment.appendChild(createGalleryCard(items[i], tabKey, i));
            }
            grid.appendChild(fragment);
            renderedCounts[tabKey] = end;
        }
        updateLoadMoreButton(tabKey);
    }

    // Abas da galeria (carregamento sob demanda)
    const galleryTabs = document.querySelectorAll('.gallery-tab');
    const galleryContents = document.querySelectorAll('.gallery-content');

    galleryTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            const tabName = tab.getAttribute('data-tab');

            galleryTabs.forEach(function (t) {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            galleryContents.forEach(function (content) {
                const isTarget = content.id === tabName + '-gallery';
                content.classList.toggle('hidden', !isTarget);
            });

            galleryLoadedPromise.then(function () {
                if (renderedCounts[tabName] === 0) {
                    renderBatch(tabName, INITIAL_BATCH);
                }
            });
        });
    });

    // Botões "Carregar mais fotos"
    document.querySelectorAll('[data-load-more]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const tabName = btn.getAttribute('data-load-more');
            galleryLoadedPromise.then(function () {
                const items = GALLERY_DATA[tabName] || [];
                renderBatch(tabName, items.length);
            });
        });
    });

    // ================================================
    // LIGHTBOX INSTANTÂNEO (GLIGHTBOX DINÂMICO)
    // ================================================

    let activeLightbox = null;

    const loadedAssets = {};
    function loadStylesheetOnce(href) {
        if (loadedAssets[href]) return loadedAssets[href];
        loadedAssets[href] = new Promise(function (resolve) {
            if (document.querySelector('link[href="' + href + '"]')) {
                resolve();
                return;
            }
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = resolve;
            link.onerror = resolve;
            document.head.appendChild(link);
        });
        return loadedAssets[href];
    }

    function loadScriptOnce(src) {
        if (loadedAssets[src]) return loadedAssets[src];
        loadedAssets[src] = new Promise(function (resolve, reject) {
            if (document.querySelector('script[src="' + src + '"]')) {
                resolve();
                return;
            }
            const s = document.createElement('script');
            s.src = src;
            s.async = true;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
        return loadedAssets[src];
    }

    function ensureGLightbox() {
        if (typeof GLightbox !== 'undefined') return Promise.resolve();
        return Promise.all([
            loadStylesheetOnce('https://cdn.jsdelivr.net/npm/glightbox/dist/css/glightbox.min.css'),
            loadScriptOnce('https://cdn.jsdelivr.net/gh/mcstudios/glightbox/dist/js/glightbox.min.js')
        ]);
    }

    function ensureSwiper() {
        if (typeof Swiper !== 'undefined') return Promise.resolve();
        return Promise.all([
            loadStylesheetOnce('https://unpkg.com/swiper/swiper-bundle.min.css'),
            loadScriptOnce('https://unpkg.com/swiper/swiper-bundle.min.js')
        ]);
    }

    const galeriaSection = document.getElementById('galeria');
    if (galeriaSection && 'IntersectionObserver' in window) {
        const galeriaObserver = new IntersectionObserver(function (entries) {
            if (entries.some(function (entry) { return entry.isIntersecting; })) {
                galeriaObserver.disconnect();
                ensureGLightbox().catch(function () {});
            }
        }, { rootMargin: '400px 0px' });
        galeriaObserver.observe(galeriaSection);
    }

    document.addEventListener('click', function (e) {
        const link = e.target.closest('a.js-gallery-item');
        if (!link) return;

        e.preventDefault();

        const tabKey = link.getAttribute('data-gallery');
        const index = parseInt(link.getAttribute('data-index') || '0', 10);

        Promise.all([galleryLoadedPromise, ensureGLightbox()]).then(function () {
            if (typeof GLightbox === 'undefined') return;
            const items = GALLERY_DATA[tabKey] || [];
            if (!items.length) return;

            const elements = items.map(function (item) {
                return {
                    href: item.full,
                    type: 'image',
                    alt: item.alt
                };
            });

            if (activeLightbox) {
                try { activeLightbox.destroy(); } catch (_) {}
            }

            activeLightbox = GLightbox({
                elements: elements,
                startAt: isNaN(index) ? 0 : index,
                loop: true,
                touchNavigation: true,
                keyboardNavigation: true,
                closeOnOutsideClick: true,
                width: '90vw',
                height: 'auto',
                zoomable: false,
                draggable: true
            });

            activeLightbox.open();
        });
    });

    // ================================================
    // AVALIAÇÕES DO GOOGLE DINÂMICAS (CARROSSEL 4 EM 4)
    // ================================================

    let reviewsSwiper = null;
    let reviewsActivated = false;

    function initSwiper() {
        if (typeof Swiper === 'undefined' || !document.querySelector('.mySwiper')) return;
        if (reviewsSwiper) {
            try { reviewsSwiper.destroy(true, true); } catch (_) {}
        }
        reviewsSwiper = new Swiper('.mySwiper', {
            slidesPerView: 1,
            spaceBetween: 16,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            },
            pagination: {
                el: '.avaliacoes-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.reviews-nav-next',
                prevEl: '.reviews-nav-prev',
            },
            breakpoints: {
                640:  { slidesPerView: 2, spaceBetween: 18 },
                1024: { slidesPerView: 4, spaceBetween: 20 },
            },
            autoHeight: false,
            loop: true,
        });
    }

    function activateReviewsSwiper() {
        reviewsActivated = true;
        ensureSwiper().then(initSwiper).catch(function () {});
    }

    const avaliacoesSection = document.getElementById('avaliacoes');
    if (avaliacoesSection && 'IntersectionObserver' in window) {
        const reviewsObserver = new IntersectionObserver(function (entries) {
            if (entries.some(function (entry) { return entry.isIntersecting; })) {
                reviewsObserver.disconnect();
                activateReviewsSwiper();
            }
        }, { rootMargin: '500px 0px' });
        reviewsObserver.observe(avaliacoesSection);
    } else if (avaliacoesSection) {
        activateReviewsSwiper();
    }

    document.querySelectorAll('.reviews-nav-next, .reviews-nav-prev').forEach(function (btn) {
        btn.addEventListener('click', function () {
            if (!reviewsSwiper) activateReviewsSwiper();
        }, { once: true });
    });

    const GOOGLE_G_SVG =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="review-google-logo" aria-hidden="true">' +
        '<path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>' +
        '<path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.6 18.9 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>' +
        '<path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.5 26.7 36 24 36c-5.2 0-9.7-3.3-11.3-8H6.5C9.8 35.7 16.4 44 24 44z"/>' +
        '<path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.6l6.2 5.2C37 39 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/>' +
        '</svg>';

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    fetch('data/reviews.json', { cache: 'no-cache' })
        .then(function (resp) {
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            return resp.json();
        })
        .then(function (data) {
            if (typeof data.rating === 'number') {
                document.querySelectorAll('[data-reviews-rating]').forEach(function (el) {
                    el.textContent = data.rating.toFixed(1);
                });
            }
            if (typeof data.totalReviews === 'number') {
                document.querySelectorAll('[data-reviews-count]').forEach(function (el) {
                    el.textContent = String(data.totalReviews);
                });
            }
            const grid = document.getElementById('reviews-grid');
            if (grid && Array.isArray(data.reviews) && data.reviews.length > 0) {
                grid.innerHTML = data.reviews.slice(0, 12).map(function (r) {
                    const starsCount = Math.max(1, Math.min(5, Number(r.rating) || 5));
                    const starsHtml = '<i class="fas fa-star" aria-hidden="true"></i>'.repeat(starsCount);
                    const author = escapeHtml(r.author || 'Cliente Rotiv');
                    const initial = escapeHtml(r.initial || author.charAt(0).toUpperCase());
                    const color = /^#[0-9a-fA-F]{3,6}$/.test(r.color || '') ? r.color : '#0E4666';
                    const timeAgo = escapeHtml(r.timeAgo || '');
                    const text = escapeHtml(r.text || '');
                    const avatarHtml = r.avatar
                        ? '<img src="' + escapeHtml(r.avatar) + '" alt="Foto de ' + author + '" class="review-avatar-img" width="42" height="42" loading="lazy" decoding="async">'
                        : '<div class="review-avatar" style="background:' + color + ';" aria-hidden="true">' + initial + '</div>';

                    return (
                        '<div class="swiper-slide h-auto">' +
                        '  <article class="review-card">' +
                        '    <div class="review-card-header">' +
                        '      ' + avatarHtml +
                        '      <div class="review-author-info">' +
                        '        <span class="review-author-name">' + author + '</span>' +
                        (timeAgo ? '        <span class="review-time">' + timeAgo + '</span>' : '') +
                        '      </div>' +
                        '      ' + GOOGLE_G_SVG +
                        '    </div>' +
                        '    <div class="review-stars" role="img" aria-label="Avaliação: ' + starsCount + ' estrelas">' + starsHtml + '</div>' +
                        '    <p class="review-text">' + text + '</p>' +
                        '  </article>' +
                        '</div>'
                    );
                }).join('');
                if (reviewsActivated || typeof Swiper !== 'undefined') {
                    activateReviewsSwiper();
                }
            }
        })
        .catch(function () {
            // Mantém o HTML estático como fallback seguro
        });

    // ================================================
    // SMOOTH SCROLL PARA ÂNCORAS INTERNAS
    // ================================================

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;

            e.preventDefault();
            const offset = window.innerWidth < 768 ? 62 : 64;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;

            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            closeMobileMenu();
        });
    });

    // ================================================
    // MAPA INTERATIVO — ÁREA DE ATENDIMENTO
    // ================================================

    const regionPills = document.querySelectorAll('[data-region-pill]');
    const mapSvg = document.querySelector('.rotiv-rj-map');

    if (regionPills.length && mapSvg) {
        const polyMap = {
            'nova-iguacu': 'nova-iguacu',
            'baixada': 'baixada',
            'centro': 'rio',
            'zona-norte': 'rio',
            'zona-sul': 'rio',
            'zona-oeste': 'rio',
            'metropolitana': 'metropolitana'
        };

        function highlightRegion(regionId) {
            regionPills.forEach(function (p) {
                p.classList.toggle('is-active', p.getAttribute('data-region-pill') === regionId);
            });
            mapSvg.classList.toggle('has-focus', Boolean(regionId));

            const targetPoly = regionId ? polyMap[regionId] : null;
            mapSvg.querySelectorAll('.map-poly').forEach(function (el) {
                el.classList.toggle('is-highlighted', Boolean(targetPoly && el.getAttribute('data-map-region') === targetPoly));
            });
            mapSvg.querySelectorAll('.map-pin-group').forEach(function (el) {
                el.classList.toggle('is-highlighted', Boolean(regionId && el.getAttribute('data-pin-region') === regionId));
            });
        }

        let lockedRegion = null;
        regionPills.forEach(function (pill) {
            const rid = pill.getAttribute('data-region-pill');
            pill.addEventListener('mouseenter', function () {
                if (!lockedRegion) highlightRegion(rid);
            });
            pill.addEventListener('mouseleave', function () {
                if (!lockedRegion) highlightRegion(null);
            });
            pill.addEventListener('click', function () {
                lockedRegion = lockedRegion === rid ? null : rid;
                highlightRegion(lockedRegion);
            });
        });
    }

    // ================================================
    // FAQ ACCORDION
    // ================================================

    document.querySelectorAll('.faq-question').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const answer = this.nextElementSibling;
            const isOpen = this.getAttribute('aria-expanded') === 'true';

            document.querySelectorAll('.faq-question').forEach(function (other) {
                if (other !== btn) {
                    other.setAttribute('aria-expanded', 'false');
                    const otherAnswer = other.nextElementSibling;
                    if (otherAnswer) otherAnswer.hidden = true;
                }
            });

            this.setAttribute('aria-expanded', String(!isOpen));
            if (answer) answer.hidden = isOpen;
        });
    });

    // Compatibilidade para qualquer chamada externa
    window.openWhatsApp = function () {
        if (typeof window.gtag_report_conversion === 'function') window.gtag_report_conversion();
        window.open(window.currentWhatsAppLink, '_blank', 'noopener,noreferrer');
    };

    window.openWhatsAppBlog = window.openWhatsApp;

    window.openWhatsAppService = function (serviceType) {
        const mensagens = {
            'refrigeração':       'Olá, gostaria de solicitar um serviço de refrigeração e ar-condicionado.',
            'elétrica':           'Olá, gostaria de solicitar um serviço de instalações elétricas.',
            'automação':          'Olá, gostaria de solicitar um serviço de automação residencial.',
            'padrão light':       'Olá! Vi no site que vocês instalam Padrão Light e gostaria de mais informações.',
            'quadros elétricos':  'Olá! Gostaria de solicitar um orçamento para a fabricação de um quadro elétrico.',
            'instalação wallbox': 'Olá! Gostaria de solicitar um orçamento para uma instalação de carregador Wallbox.'
        };
        const message = mensagens[serviceType] || 'Olá, gostaria de solicitar um orçamento.';
        const url = 'https://wa.me/' + PHONE_NUMBER + '?text=' + encodeURIComponent(message);
        if (typeof window.gtag_report_conversion === 'function') window.gtag_report_conversion();
        window.open(url, '_blank', 'noopener,noreferrer');
    };

});
