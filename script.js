document.addEventListener('DOMContentLoaded', function () {

    // Initialize WhatsApp link variable
    window.currentWhatsAppLink = 'https://wa.me/message/GJJKUM7Q6UJTA1';

    // WhatsApp Function
    window.openWhatsApp = function() {
        window.open(window.currentWhatsAppLink, '_blank');
    }

    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu) {
                mobileMenu.classList.toggle('hidden');
            }
        });
    }

    // Gallery Tabs
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

    // "Load More" photos data
    const imagensEletricas = [
        {url: "imagens/eletrica-24.jpg", descricao: "Serviço de elétrica"},
        {url: "imagens/eletrica-25.jpg", descricao: "Serviço de elétrica"},
        {url: "imagens/eletrica-26.jpg", descricao: "Serviço de elétrica"},
        {url: "imagens/eletrica-27.jpg", descricao: "Serviço de elétrica"},
        {url: "imagens/eletrica-28.jpg", descricao: "Serviço de elétrica"},
        {url: "imagens/eletrica-29.jpg", descricao: "Serviço de elétrica"},
        {url: "imagens/eletrica-30.jpg", descricao: "Serviço de elétrica"},
        {url: "imagens/eletrica-31.jpg", descricao: "Serviço de elétrica"},
        {url: "imagens/eletrica-32.jpg", descricao: "Serviço de elétrica"},
        {url: "imagens/eletrica-33.jpg", descricao: "Serviço de elétrica"},
        {url: "imagens/eletrica-34.jpg", descricao: "Serviço de elétrica"},
        {url: "imagens/eletrica-35.jpg", descricao: "Serviço de elétrica"},
        {url: "imagens/eletrica-36.jpg", descricao: "Serviço de elétrica"},
        {url: "imagens/eletrica-37.jpg", descricao: "Serviço de elétrica"},
        {url: "imagens/eletrica-38.jpg", descricao: "Serviço de elétrica"},
        {url: "imagens/eletrica-39.jpg.jpeg", descricao: "Serviço de elétrica"}
    ];

    const imagensArCondicionado = [
    {url: "imagens/ar-condicionado-24.jpeg", descricao: "Serviço de ar-condicionado"}
];


    // Initialize GLightbox for Gallery
    const lightbox = GLightbox({
        selector: '.glightbox',
        loop: true,
        touchNavigation: true,
    });

    // "Load More" photos functionality
    const loadMoreBtn = document.getElementById('load-more-eletrica');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            const electricalGallery = document.querySelector('#eletrica-gallery .grid');
            if (electricalGallery) {
                imagensEletricas.forEach(imageData => {
                    const newLink = document.createElement('a');
                    newLink.href = imageData.url;
                    newLink.className = 'glightbox';
                    newLink.setAttribute('data-gallery', 'eletrica');
                    
                    newLink.innerHTML = `
                        <div class="bg-white p-1 rounded-lg shadow-md gallery-image">
                            <div class="h-40 sm:h-52 rounded overflow-hidden">
                                <img src="${imageData.url}" alt="${imageData.descricao}" class="w-full h-full object-cover">
                            </div>
                        </div>
                    `;
                    electricalGallery.appendChild(newLink);
                });

                // ESSENCIAL: Avisa a galeria que novas imagens foram adicionadas
                lightbox.reload();
                
                this.style.display = 'none';
            }
        });
    }

    const loadMoreArBtn = document.getElementById('load-more-ar');
if (loadMoreArBtn) {
    loadMoreArBtn.addEventListener('click', function() {
        const arGallery = document.querySelector('#ar-condicionado-gallery .grid');
        if (arGallery) {
            imagensArCondicionado.forEach(imageData => {
                const newLink = document.createElement('a');
                newLink.href = imageData.url;
                newLink.className = 'glightbox';
                newLink.setAttribute('data-gallery', 'ar-condicionado');

                newLink.innerHTML = `
                    <div class="bg-white p-1 rounded-lg shadow-md gallery-image">
                        <div class="h-40 sm:h-52 rounded overflow-hidden">
                            <img src="${imageData.url}" alt="${imageData.descricao}" class="w-full h-full object-cover">
                        </div>
                    </div>
                `;

                arGallery.appendChild(newLink);
            });

            // Atualiza o GLightbox
            lightbox.reload();

            // Esconde o botão depois de carregar
            this.style.display = 'none';
        }
    });
}

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                let offset = 80; // Default offset for desktop
                if (window.innerWidth < 768) offset = 60; // Offset for mobile
                else if (window.innerWidth < 1024) offset = 70; // Offset for tablet
                
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

    // Initialize Swiper Carousel for Reviews
    const swiper = new Swiper('.mySwiper', {
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
// ================================================ //
// FUNÇÃO PARA WHATSAPP COM MENSAGEM DE SERVIÇO     //
// ================================================ //

function openWhatsAppService(serviceType) {
    let message = "";
    const phoneNumber = "5521971129223"; // Seu número de telefone

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
        default:
            message = "Olá, gostaria de solicitar um orçamento.";
            break;
    }

    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(url, '_blank');
    event.preventDefault(); // Previne o comportamento padrão do link
}