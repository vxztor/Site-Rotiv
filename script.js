document.addEventListener('DOMContentLoaded', function () {

    // ================================================
    // CONFIGURAÇÕES GLOBAIS
    // ================================================

    const PHONE_NUMBER = "5521971129223";
    window.currentWhatsAppLink = 'https://wa.me/message/GJJKUM7Q6UJTA1';
    // Controle de carregamento completo da galeria
    let eletricaCarregada = false;
    let arCarregada = false;
    let comandosCarregada = false;
    let wallboxCarregada = false;
    // ================================================
    // ANO DE COPYRIGHT DINÂMICO
    // ================================================

    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // ================================================
    // MENU MOBILE
    // ================================================

    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function () {
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu) {
                mobileMenu.classList.toggle('hidden');
                const expanded = !mobileMenu.classList.contains('hidden');
                this.setAttribute('aria-expanded', expanded);
            }
        });
    }

    // ================================================
    // ABAS DA GALERIA
    // ================================================

    const galleryTabs = document.querySelectorAll('.gallery-tab');
    const galleryContents = document.querySelectorAll('.gallery-content');

    galleryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            galleryTabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            const tabName = tab.getAttribute('data-tab');

            galleryContents.forEach(content => {
                content.classList.add('hidden');
                if (content.id === `${tabName}-gallery`) {
                    content.classList.remove('hidden');
                }
            });
        });
    });

    // ================================================
    // LIGHTBOX
    // ================================================

    const lightbox = GLightbox({
        selector: '.glightbox',
        loop: true,
        touchNavigation: true,
        width: '90vw',
        height: 'auto',
        zoomable: false,
        draggable: true,
    });

    // ================================================
    // SISTEMA DE IMAGENS COM FALLBACK DE EXTENSÃO
    // ================================================

    const EXTENSOES_PADRAO = ['webp', 'jpg', 'jpeg', 'png'];

    function tentarCarregarImagem(caminhos) {
        return new Promise((resolve, reject) => {
            let indice = 0;

            function testarProxima() {
                if (indice >= caminhos.length) {
                    reject(new Error('Nenhuma imagem encontrada.'));
                    return;
                }

                const img = new Image();
                const caminhoAtual = caminhos[indice];

                img.onload = () => resolve(caminhoAtual);
                img.onerror = () => {
                    indice++;
                    testarProxima();
                };

                img.src = caminhoAtual;
            }

            testarProxima();
        });
    }

    function montarListaDeCaminhos(pasta, nomeBase, extensoes = EXTENSOES_PADRAO) {
        return extensoes.map(ext => `${pasta}/${nomeBase}.${ext}`);
    }

    async function criarCardImagem({ pasta, nome, alt, gallery }) {
        // Se nome já tem extensão (ex: "comando-01.jpg"), testa só esse caminho
        // Se não, testa todas as extensões padrão
        let caminhos;
        if (/\.\w{2,4}$/.test(nome)) {
            caminhos = [`${pasta}/${nome}`];
        } else {
            caminhos = montarListaDeCaminhos(pasta, nome);
        }

        try {
            const caminhoValido = await tentarCarregarImagem(caminhos);

            const link = document.createElement('a');
            link.href = caminhoValido;
            link.className = 'glightbox';
            link.setAttribute('data-gallery', gallery);

            link.innerHTML = `
                <div class="bg-white p-1 rounded-lg shadow-md gallery-image">
                    <div class="h-40 sm:h-52 rounded overflow-hidden">
                        <img
                            src="${caminhoValido}"
                            alt="${alt}"
                            class="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                        >
                    </div>
                </div>
            `;

            return link;
        } catch (error) {
            console.warn(`Imagem não encontrada: ${nome}`);
            return null;
        }
    }

    async function renderizarImagens(container, imagens, galleryName, pasta = 'imagens') {
        for (const imagem of imagens) {
            const card = await criarCardImagem({
                pasta: pasta,
                nome: imagem.nome,
                alt: imagem.alt,
                gallery: galleryName
            });

            if (card) container.appendChild(card);
        }

        lightbox.reload();
    }

    // ================================================
    // IMAGENS EXTRAS DA GALERIA
    // ================================================

    const imagensEletricasExtras = [
        { nome: "eletrica-24", alt: "Serviço de elétrica em Nova Iguaçu" },
        { nome: "eletrica-25", alt: "Serviço de elétrica com terminal WAGO" },
        { nome: "eletrica-26", alt: "Montagem de quadro elétrico em Nova Iguaçu" },
        { nome: "eletrica-27", alt: "Serviço de elétrica residencial" },
        { nome: "eletrica-28", alt: "Serviço de elétrica comercial" },
        { nome: "eletrica-29", alt: "Serviço de elétrica profissional" },
        { nome: "eletrica-30", alt: "Instalação elétrica organizada" },
        { nome: "eletrica-31", alt: "Serviço elétrico com acabamento profissional" },
        { nome: "eletrica-32", alt: "Execução de instalação elétrica" },
        { nome: "eletrica-33", alt: "Serviço de elétrica em ambiente residencial" },
        { nome: "eletrica-34", alt: "Infraestrutura elétrica em residência" },
        { nome: "eletrica-35", alt: "Serviço de elétrica com segurança" },
        { nome: "eletrica-36", alt: "Montagem e organização elétrica" },
        { nome: "eletrica-37", alt: "Serviço técnico de elétrica" },
        { nome: "eletrica-38", alt: "Instalação elétrica realizada pela ROTIV" },
        { nome: "eletrica-39", alt: "Serviço de elétrica com acabamento limpo" },
        { nome: "eletrica-40", alt: "Serviço de elétrica" },
        { nome: "eletrica-41", alt: "Padrão de entrada instalado" },
        { nome: "eletrica-42", alt: "Serviço de elétrica com DPS e DR" },
        { nome: "eletrica-43", alt: "Serviço de elétrica com disjuntor exclusivo" }
    ];

    const imagensArExtras = [
        { nome: "ar-condicionado-24", alt: "Serviço de instalação de ar-condicionado" },
        { nome: "ar-condicionado-25", alt: "Instalação de ar-condicionado residencial" },
        { nome: "ar-condicionado-26", alt: "Serviço técnico de ar-condicionado" },
        { nome: "ar-condicionado-27", alt: "Instalação profissional de ar-condicionado" },
        { nome: "ar-condicionado-28", alt: "Serviço de ar-condicionado com acabamento limpo" },
        { nome: "ar-condicionado-29", alt: "Instalação de ar-condicionado em Nova Iguaçu" },
        { nome: "ar-condicionado-30", alt: "Serviço de ar-condicionado com segurança" },
        { nome: "ar-condicionado-31", alt: "Instalação de ar-condicionado comercial" },
        { nome: "ar-condicionado-32", alt: "Serviço de ar-condicionado com organização" },
        { nome: "ar-condicionado-33", alt: "Instalação de ar-condicionado residencial e comercial" },
        { nome: "ar-condicionado-34", alt: "Serviço de ar-condicionado com acabamento profissional" },
        { nome: "ar-condicionado-35", alt: "Instalação de ar-condicionado com terminal WAGO" },
        { nome: "ar-condicionado-36", alt: "Serviço de ar-condicionado em ambiente residencial" },
        { nome: "ar-condicionado-37", alt: "Instalação de ar-condicionado com segurança" },
        { nome: "ar-condicionado-38", alt: "Serviço de ar-condicionado realizado pela ROTIV" },
        { nome: "ar-condicionado-39", alt: "Instalação de ar-condicionado com acabamento limpo" }
    ];

    const imagensComandosExtras = [
        { nome: "comando-09", alt: "Fabricação de painel de controle elétrico – eletricista ROTIV RJ" },
        { nome: "comando-10", alt: "Quadro elétrico residencial montado pela ROTIV em Nova Iguaçu" },
        { nome: "comando-11", alt: "Montagem de comando elétrico com relé – ROTIV Elétrica Nova Iguaçu" },
        { nome: "comando-12", alt: "Painel elétrico industrial com acabamento profissional – ROTIV" },
        { nome: "comando-13", alt: "Instalação de quadro de disjuntores em condomínio – ROTIV RJ" },
        { nome: "comando-14", alt: "Quadro elétrico com DPS e DR instalado pela ROTIV em Nova Iguaçu" },
        { nome: "comando-15", alt: "Painel de comando elétrico finalizado pela equipe ROTIV" },
        { nome: "comando-16", alt: "Montagem de quadro elétrico com organização de cabos – ROTIV" },
        { nome: "comando-17", alt: "Painel elétrico com disjuntor exclusivo para segurança – ROTIV RJ" },
        { nome: "comando-18", alt: "Instalação de quadro de comando elétrico residencial – ROTIV" },
        { nome: "comando-19", alt: "Quadro elétrico com aterramento adequado – ROTIV Nova Iguaçu" },
        { nome: "comando-20", alt: "Painel elétrico com acabamento limpo e profissional – ROTIV" },
        { nome: "comando-21", alt: "Montagem de quadro elétrico com terminal WAGO – ROTIV RJ" },
        { nome: "comando-22", alt: "Painel de comando elétrico com organização de cabos – ROTIV" },
        { nome: "comando-23", alt: "Instalação de quadro elétrico com proteção elétrica – ROTIV Nova Iguaçu" }
    ];

    const imagensWallboxExtras = [
        { nome: "outros-11", alt: "Ponto de recarga para veículo elétrico instalado pela ROTIV" },
        { nome: "outros-12", alt: "Wallbox com cabeamento dimensionado para carga segura – ROTIV RJ" },
        { nome: "outros-13", alt: "Instalação de carregador Wallbox 7kW em residência – ROTIV Nova Iguaçu" },
        { nome: "outros-14", alt: "Wallbox com tomada tipo 2 instalado pela ROTIV no Rio de Janeiro" },
        { nome: "outros-15", alt: "Infraestrutura elétrica para Wallbox em condomínio – ROTIV" },
        { nome: "outros-16", alt: "Carregador elétrico Wallbox com disjuntor exclusivo – ROTIV Nova Iguaçu" },
        { nome: "outros-17", alt: "Instalação de Wallbox com organização de cabos profissional – ROTIV" },
        { nome: "outros-18", alt: "Ponto de abastecimento elétrico para veículo instalado pela ROTIV RJ" },
        { nome: "outros-19", alt: "Wallbox com aterramento adequado e proteção elétrica – ROTIV" }
    ];

    // ================================================
    // BOTÕES CARREGAR MAIS
    // ================================================

    const loadMoreBtn = document.getElementById('load-more-eletrica');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', async function () {
            const electricalGallery = document.querySelector('#eletrica-gallery .grid');
            if (!electricalGallery) return;

            this.disabled = true;
            this.textContent = 'Carregando...';

            await renderizarImagens(electricalGallery, imagensEletricasExtras, 'eletrica', 'imagens/eletrica');
            eletricaCarregada = true;
            this.style.display = 'none';
        });
    }

    const loadMoreArBtn = document.getElementById('load-more-ar');
    if (loadMoreArBtn) {
        loadMoreArBtn.addEventListener('click', async function () {
            const arGallery = document.querySelector('#ar-condicionado-gallery .grid');
            if (!arGallery) return;

            this.disabled = true;
            this.textContent = 'Carregando...';

            await renderizarImagens(arGallery, imagensArExtras, 'ar-condicionado', 'imagens/ar-condicionado');
            arCarregada = true;
            this.style.display = 'none';
        });
    }

    const loadMoreComandosBtn = document.getElementById('load-more-comandos');
    if (loadMoreComandosBtn) {
        loadMoreComandosBtn.addEventListener('click', async function () {
            const comandosGallery = document.querySelector('#comandos-gallery .grid');
            if (!comandosGallery) return;

            this.disabled = true;
            this.textContent = 'Carregando...';

            await renderizarImagens(comandosGallery, imagensComandosExtras, 'comandos', 'imagens/comandos-eletricos');
            comandosCarregada = true;
            this.style.display = 'none';
        });
    }

    const loadMoreWallboxBtn = document.getElementById('load-more-wallbox');
    if (loadMoreWallboxBtn) {
        loadMoreWallboxBtn.addEventListener('click', async function () {
            const wallboxGallery = document.querySelector('#wallbox-gallery .grid');
            if (!wallboxGallery) return;

            this.disabled = true;
            this.textContent = 'Carregando...';

            await renderizarImagens(wallboxGallery, imagensWallboxExtras, 'wallbox', 'imagens/outros');
            wallboxCarregada = true;
            this.style.display = 'none';
        });
    }

    // ================================================
    // PRÉ-CARREGAMENTO AO ABRIR O LIGHTBOX
    // Ao clicar em qualquer imagem da galeria, carrega
    // todas as extras silenciosamente antes de abrir,
    // garantindo navegação completa pela seta direita.
    // ================================================

    document.addEventListener('click', async function (e) {
        const link = e.target.closest('a.glightbox');
        if (!link) return;

        const gallery = link.getAttribute('data-gallery');

        if (gallery === 'eletrica' && !eletricaCarregada) {
            e.preventDefault();
            e.stopImmediatePropagation();

            const container = document.querySelector('#eletrica-gallery .grid');
            if (container) {
                await renderizarImagens(container, imagensEletricasExtras, 'eletrica', 'imagens/eletrica');
                eletricaCarregada = true;
                const btn = document.getElementById('load-more-eletrica');
                if (btn) btn.style.display = 'none';
            }

            lightbox.open(link);

        } else if (gallery === 'ar-condicionado' && !arCarregada) {
            e.preventDefault();
            e.stopImmediatePropagation();

            const container = document.querySelector('#ar-condicionado-gallery .grid');
            if (container) {
                await renderizarImagens(container, imagensArExtras, 'ar-condicionado', 'imagens/ar-condicionado');
                arCarregada = true;
                const btn = document.getElementById('load-more-ar');
                if (btn) btn.style.display = 'none';
            }

            lightbox.open(link);

        } else if (gallery === 'comandos' && !comandosCarregada) {
            e.preventDefault();
            e.stopImmediatePropagation();

            const container = document.querySelector('#comandos-gallery .grid');
            if (container) {
                await renderizarImagens(container, imagensComandosExtras, 'comandos', 'imagens/comandos-eletricos');
                comandosCarregada = true;
                const btn = document.getElementById('load-more-comandos');
                if (btn) btn.style.display = 'none';
            }

            lightbox.open(link);

        } else if (gallery === 'wallbox' && !wallboxCarregada) {
            e.preventDefault();
            e.stopImmediatePropagation();

            const container = document.querySelector('#wallbox-gallery .grid');
            if (container) {
                await renderizarImagens(container, imagensWallboxExtras, 'wallbox', 'imagens/outros');
                wallboxCarregada = true;
                const btn = document.getElementById('load-more-wallbox');
                if (btn) btn.style.display = 'none';
            }

            lightbox.open(link);
        }
    }, true);

    // ================================================
    // SMOOTH SCROLL
    // ================================================

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');

            // Ignora links sem destino real (ex: href="#")
            if (!targetId || targetId === '#') return;

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                let offset = 80;
                if (window.innerWidth < 768) offset = 60;
                else if (window.innerWidth < 1024) offset = 70;

                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;

                window.scrollTo({ top: targetPosition, behavior: 'smooth' });

                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });
    });

    // ================================================
    // SWIPER (AVALIAÇÕES)
    // ================================================

    new Swiper('.mySwiper', {
        slidesPerView: 1,
        spaceBetween: 24,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
        },
        pagination: {
            el: '.avaliacoes-pagination',
            clickable: true,
        },
        breakpoints: {
            768:  { slidesPerView: 2, spaceBetween: 24 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
        },
        autoHeight: false,
        loop: true,
    });

    // ================================================
    // FAQ ACCORDION
    // ================================================

    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', function () {
            const answer = this.nextElementSibling;
            const isOpen = this.getAttribute('aria-expanded') === 'true';

            // Fecha todos os outros
            document.querySelectorAll('.faq-question').forEach(other => {
                if (other !== this) {
                    other.setAttribute('aria-expanded', 'false');
                    const otherAnswer = other.nextElementSibling;
                    if (otherAnswer) otherAnswer.hidden = true;
                }
            });

            // Alterna o atual
            this.setAttribute('aria-expanded', String(!isOpen));
            if (answer) answer.hidden = isOpen;
        });
    });

    // ================================================
    // WHATSAPP GERAL
    // ================================================

    window.openWhatsApp = function () {
        window.open(window.currentWhatsAppLink, '_blank', 'noopener,noreferrer');
    };

});

// ================================================
// WHATSAPP POR SERVIÇO
// ================================================

function openWhatsAppService(serviceType) {
    const PHONE_NUMBER = "5521971129223";

    const mensagens = {
        'refrigeração':           'Olá, gostaria de solicitar um serviço de refrigeração.',
        'elétrica':               'Olá, gostaria de solicitar um serviço de instalações elétricas.',
        'automação':              'Olá, gostaria de solicitar um serviço de automação residencial.',
        'padrão light':           'Olá! Vi no site que vocês instalam Padrão Light e gostaria de mais informações.',
        'quadros elétricos':      'Olá! Gostaria de solicitar um orçamento para a fabricação de um quadro elétrico.',
        'instalação wallbox':     'Olá! Gostaria de solicitar um orçamento para uma instalação de carregador Wallbox.',
    };

    const message = mensagens[serviceType] || 'Olá, gostaria de solicitar um orçamento.';
    const url = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
}