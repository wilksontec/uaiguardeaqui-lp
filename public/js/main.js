document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    });

    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                obs.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

    // ROTAÇÃO INTELIGENTE DE COPY (Tempo humanizado e quebras em 3 linhas)
    const heroContainer = document.getElementById('dynamic-hero-text');
    if (heroContainer) {
        const slides = [
            {
                h1: 'Falta espaço na sua casa<br>ou apartamento?<br><span class="highlight">A gente resolve.</span>',
                p: 'Liberte seu lar da desorganização e recupere sua paz. Guarde móveis, caixas e objetos sazonais em um box seguro e privativo. Sua casa não é um depósito.'
            },
            {
                h1: 'O espaço da sua<br>empresa está <span class="highlight">custando</span><br><span class="highlight">caro demais?</span>',
                p: 'Não pague aluguel comercial para usar como depósito. Guarde arquivos mortos, móveis e maquinários com segurança 24h e zero burocracia imobiliária.'
            },
            {
                h1: 'O seu estoque<br>está limitando o<br><span class="highlight">seu crescimento?</span>',
                p: 'A solução ágil para representantes comerciais e prestadores de serviço. Armazene seu estoque com fácil acesso no Vale do Aço. Você tranca e leva a chave.'
            }
        ];

        let currentIndex = 0;

        // Aumentado para 9000ms (9 segundos) para tempo de leitura adequado
        setInterval(() => {
            heroContainer.style.opacity = '0';
            heroContainer.style.transform = 'translateY(-15px)';

            setTimeout(() => {
                currentIndex = (currentIndex + 1) % slides.length;
                heroContainer.innerHTML = `<h1>${slides[currentIndex].h1}</h1><p>${slides[currentIndex].p}</p>`;
                heroContainer.style.transform = 'translateY(15px)';
                void heroContainer.offsetWidth;
                heroContainer.style.opacity = '1';
                heroContainer.style.transform = 'translateY(0)';
            }, 800); // Tempo do fade prolongado para 0.8s
        }, 9000); 
    }
});
