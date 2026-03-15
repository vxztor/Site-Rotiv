document.addEventListener('DOMContentLoaded', function () {
    window.currentWhatsAppLink = 'https://wa.me/message/GJJKUM7Q6UJTA1';

    window.openWhatsApp = function () {
        window.open(window.currentWhatsAppLink, '_blank');
    };

    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function () {
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu) {
                mobileMenu.classList.toggle('hidden');
            }
        });
    }

    const galleryTabs = document.querySelectorAll('.gallery-tab');
    const galleryContents = document.querySelectorAll('.gallery-content');

    galleryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            galleryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const tabName = tab.getAttribute('data-tab');

            galleryContents.forEach(content => {
                content.classList.add('hidden');
                if (content.id === `${tabName}-gallery`) {
                    content.classList.remove('hidden');
                }
            });
        });
    });

    const lightbox = GLightbox({
        selector: '.glightbox',
        loop: true,
        touchNavigation: true,
    });

    // ====================================================
    // SISTEMA NOVO DE IMAGENS COM FALLBACK DE EXTENSÃO
    // ====================================================

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
        const caminhos = montarListaDeCaminhos(pasta, nome);

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
            console.warn(`Imagem não encontrada para: ${nome}`);
            return null;
        }
    }

    async function renderizarImagens(container, imagens, galleryName) {
        for (const imagem of imagens) {
            const card = await criarCardImagem({
                pasta: 'imagens',
                nome: imagem.nome,
                alt: imagem.alt,
                gallery: galleryName
            });

            if (card) {
                container.appendChild(card);
            }
        }

        lightbox.reload();
    }

    // ====================================================
    // AQUI VOCÊ SÓ CADASTRA NOME + ALT
    // ====================================================

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
        { nome: "eletrica-39", alt: "Serviço de elétrica com acabamento limpo" }
    ];

    const imagensArExtras = [
        { nome: "ar-condicionado-24", alt: "Serviço de instalação de ar-condicionado" },
        { nome: "ar-condicionado-25", alt: "Instalação de ar-condicionado residencial" },
        { nome: "ar-condicionado-26", alt: "Serviço técnico de ar-condicionado" },
        { nome: "ar-condicionado-27", alt: "Instalação profissional de ar-condicionado" }
    ];

    const loadMoreBtn = document.getElementById('load-more-eletrica');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', async function () {
            const electricalGallery = document.querySelector('#eletrica-gallery .grid');
            if (!electricalGallery) return;

            this.disabled = true;
            this.textContent = 'Carregando...';

            await renderizarImagens(electricalGallery, imagensEletricasExtras, 'eletrica');

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

            await renderizarImagens(arGallery, imagensArExtras, 'ar-condicionado');

            this.style.display = 'none';
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                let offset = 80;
                if (window.innerWidth < 768) offset = 60;
                else if (window.innerWidth < 1024) offset = 70;

                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });
    });

    new Swiper('.mySwiper', {
        slidesPerView: 1,
        spaceBetween: 20,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        breakpoints: {
            768: { slidesPerView: 2, spaceBetween: 30 },
            1024: { slidesPerView: 3, spaceBetween: 30 },
        },
        autoHeight: false,
        loop: true,
    });
});

// ================================================
// FUNÇÃO PARA WHATSAPP COM MENSAGEM DE SERVIÇO
// ================================================
function openWhatsAppService(serviceType) {
    let message = "";
    const phoneNumber = "5521971129223";

    switch (serviceType) {
        case 'refrigeração':
            message = "Olá, gostaria de solicitar um serviço de refrigeração.";
            break;
        case 'elétrica':
            message = "Olá, gostaria de solicitar um serviço de instalações elétricas.";
            break;
        case 'automação':
            message = "Olá, gostaria de solicitar um serviço de automação residencial.";
            break;
        case 'padrão light':
            message = "Olá! Vi no site que vocês instalam Padrão Light e gostaria de mais informações.";
            break;
        case 'instalações comerciais':
            message = "Olá! Gostaria de fazer um orçamento para um projeto de instalação elétrica comercial.";
            break;
        case 'quadros elétricos':
            message = "Olá! Gostaria de solicitar um orçamento para a fabricação de um quadro elétrico.";
            break;
        case 'instalação wallbox':
            message = "Olá! Gostaria de solicitar um orçamento para uma instalação de carregador Wallbox.";
        break;   
        default:
            message = "Olá, gostaria de solicitar um orçamento.";
            break;
    }

    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(url, '_blank');
}