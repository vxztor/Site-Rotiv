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
        {url: "imagens/eletrica-28.jpg", descricao: "Serviço de elétrica"}
    ];

    // "Load More" photos functionality
    const loadMoreBtn = document.getElementById('load-more-eletrica');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            const electricalGallery = document.querySelector('#eletrica-gallery .grid');
            if (electricalGallery) {
                imagensEletricas.forEach(imageData => {
                    const newItem = document.createElement('div');
                    newItem.className = 'bg-white p-1 rounded-lg shadow-md gallery-image';
                    newItem.innerHTML = `
                        <div class="h-40 sm:h-52 rounded overflow-hidden">
                            <img src="${imageData.url}" alt="${imageData.descricao}" class="w-full h-full object-cover">
                        </div>
                    `;
                    electricalGallery.appendChild(newItem);
                });
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
    // O VSCode pode sublinhar 'Swiper' como um erro, mas é seguro ignorar,
    // pois a biblioteca Swiper é carregada no HTML antes deste script.
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
            768: {
                slidesPerView: 2,
                spaceBetween: 30,
            },
            1024: {
                slidesPerView: 3,
                spaceBetween: 30,
            },
        },
         // Garante que os slides tenham a mesma altura
        autoHeight: false,
        // Habilita o loop
        loop: true,
    });
});