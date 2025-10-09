// Tailwind Configuration
tailwind.config = {
    theme: {
        extend: {
            colors: {
                'rotiv-blue': '#0E4666',
                'rotiv-orange': '#F47C20',
            },
            screens: {
                'xs': '375px',
                'sm': '640px',
                'md': '768px',
                'lg': '1024px',
                'xl': '1280px',
                '2xl': '1536px',
            }
        },
        fontFamily: {
            'sans': ['Montserrat', 'sans-serif'],
        }
    }
}

// ================================================ //
// JAVASCRIPT FUNCTIONALITY
// ================================================ //

// Initialize WhatsApp link variable
window.currentWhatsAppLink = 'https://wa.me/message/GJJKUM7Q6UJTA1';

// WhatsApp Function - Works on both mobile and desktop
function openWhatsApp() {
    window.open(window.currentWhatsAppLink || 'https://wa.me/message/GJJKUM7Q6UJTA1', '_blank');
}

// Mobile Menu Toggle
document.getElementById('menu-toggle').addEventListener('click', function() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('hidden');
});

// Gallery Tabs
const galleryTabs = document.querySelectorAll('.gallery-tab');
const galleryContents = document.querySelectorAll('.gallery-content');

galleryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        galleryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        galleryContents.forEach(content => content.classList.add('hidden'));
        const tabName = tab.getAttribute('data-tab');
        document.getElementById(`${tabName}-gallery`).classList.remove('hidden');
    });
});

// Arrays de imagens para carregar mais
const imagensEletricas = [
    {url: "eletrica-24.jpg", descricao: "Serviço de elétrica"},
    {url: "eletrica-25.jpg", descricao: "Serviço de elétrica"},
    {url: "eletrica-26.jpg", descricao: "Serviço de elétrica"},
    {url: "eletrica-27.jpg", descricao: "Serviço de elétrica"},
    {url: "eletrica-28.jpg", descricao: "Serviço de elétrica"}
];

// Load More Photos Functionality
document.getElementById('load-more-eletrica').addEventListener('click', function() {
    const electricalGallery = document.querySelector('#eletrica-gallery .grid');
    
    for (let i = 0; i < imagensEletricas.length; i++) {
        const imageData = imagensEletricas[i];
        
        const newItem = document.createElement('div');
        newItem.className = 'bg-white p-1 rounded-lg shadow-md gallery-image';
        newItem.innerHTML = `
            <div class="h-40 sm:h-52 rounded overflow-hidden">
                <img src="${imageData.url}" alt="${imageData.descricao}" class="w-full h-full object-cover">
            </div>
        `;
        electricalGallery.appendChild(newItem);
    }
    
    this.style.display = 'none';
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            let offset = 80;
            if (window.innerWidth < 768) {
                offset = 60;
            } else if (window.innerWidth < 1024) {
                offset = 70;
            }
            
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            const mobileMenu = document.getElementById('mobile-menu');
            if (!mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
            }
        }
    });
});

// Ajustes para dispositivos móveis
function adjustForMobile() {
    if (window.innerHeight < 500 && window.innerWidth > window.innerHeight) {
        const profileImages = document.querySelectorAll('.profile-image');
        profileImages.forEach(img => {
            img.style.width = '120px';
            img.style.height = '120px';
        });
    } else {
        const profileImages = document.querySelectorAll('.profile-image');
        profileImages.forEach(img => {
            if (window.innerWidth < 640) {
                img.style.width = '160px';
                img.style.height = '160px';
            } else {
                img.style.width = '';
                img.style.height = '';
            }
        });
    }
    
    const heroContactBtn = document.querySelector('.hero-contact-btn-container');
    if (window.innerWidth < 768) {
        heroContactBtn.style.bottom = '6%';
    } else if (window.innerWidth < 1024) {
        heroContactBtn.style.bottom = '10%';
    } else {
        heroContactBtn.style.bottom = '12%';
    }
}

window.addEventListener('load', adjustForMobile);
window.addEventListener('resize', adjustForMobile);

// Previne zoom em dispositivos iOS
document.addEventListener('touchstart', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        e.target.style.fontSize = '16px';
    }
}, { passive: true });

// Melhora o desempenho em dispositivos móveis
let resizeTimer;
window.addEventListener('resize', function() {
    document.body.classList.add('resize-animation-stopper');
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        document.body.classList.remove('resize-animation-stopper');
    }, 400);
});