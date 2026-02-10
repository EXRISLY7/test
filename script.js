// Modüller ve Sınıflar
class Game {
    constructor() {
        this.hayirTik = 0;
        this.isKaciyor = false;
        this.maxAttempts = 3;
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.createFloatingHearts();
        this.playBackgroundMusic();
    }

    cacheElements() {
        // DOM Elementleri
        this.evetBtn = document.getElementById('evetBtn');
        this.hayirBtn = document.getElementById('hayirBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.damageOverlay = document.getElementById('damage-overlay');
        this.damageEdges = document.querySelectorAll('.damage-edge');
        this.whiteScreen = document.getElementById('white-screen');
        this.heartExplosion = document.getElementById('heartExplosion');
        this.sonEkran = document.getElementById('son-ekran');
        this.counterNumber = document.querySelector('.counter-number');
        this.buttonsContainer = document.querySelector('.buttons-container');

        // Audio Elementleri
        this.heartbeatAudio = document.getElementById('heartbeatLoop');
        this.sadAudio = document.getElementById('sadSound');
        this.happyAudio = document.getElementById('happySound');

        // Element koleksiyonları
        this.mainElements = {
            heart: document.querySelector('.heart-pulse'),
            title: document.querySelector('.main-title'),
            subtitle: document.querySelector('.subtitle'),
            buttons: document.querySelector('.buttons-container'),
            counter: document.getElementById('counter'),
            floatingHearts: document.getElementById('floatingHearts')
        };
    }

    bindEvents() {
        this.hayirBtn.addEventListener('click', () => this.handleHayirClick());
        this.evetBtn.addEventListener('click', () => this.handleEvetClick());
        this.restartBtn?.addEventListener('click', () => this.restartGame());
    }

    // Yüzen Kalpler
    createFloatingHearts() {
        const container = document.getElementById('floatingHearts');
        const heartCount = window.innerWidth < 768 ? 8 : 12;

        for (let i = 0; i < heartCount; i++) {
            const heart = document.createElement('div');
            heart.className = 'float-heart';
            heart.innerHTML = '❤️';
            heart.style.left = `${Math.random() * 100}vw`;
            heart.style.animationDuration = `${18 + Math.random() * 15}s`;
            heart.style.animationDelay = `${Math.random() * 20}s`;
            container.appendChild(heart);
        }
    }

    // Ses Kontrolleri
    playBackgroundMusic() {
        if (this.heartbeatAudio) {
            this.heartbeatAudio.volume = 0.12;
            this.heartbeatAudio.play().catch(e => console.log('Audio play failed:', e));
        }
    }

    playSound(audio, volume = 0.7) {
        if (audio) {
            audio.currentTime = 0;
            audio.volume = volume;
            audio.play().catch(e => console.log('Sound play failed:', e));
        }
    }

    // Hasar Efekti
    triggerDamageEffect() {
        document.body.classList.add('shake-active');
        setTimeout(() => document.body.classList.remove('shake-active'), 900);

        this.damageOverlay.classList.add('active');
        this.damageEdges.forEach(el => el.classList.add('active'));

        setTimeout(() => {
            this.damageOverlay.classList.remove('active');
            this.damageEdges.forEach(el => el.classList.remove('active'));
        }, 1300);
    }

    // Buton Konumlandırma
    getSafePosition() {
        const containerRect = this.buttonsContainer.getBoundingClientRect();
        const padding = 20;
        const maxX = containerRect.width - this.hayirBtn.offsetWidth - padding * 2;
        const maxY = containerRect.height - this.hayirBtn.offsetHeight - padding * 2;

        let x = padding + Math.random() * (maxX * 0.7);
        let y = padding + Math.random() * (maxY * 0.6);

        // EVET butonundan uzak dur
        const evetRect = this.evetBtn.getBoundingClientRect();
        const hayirW = this.hayirBtn.offsetWidth;
        const evetCenterX = evetRect.left - containerRect.left + evetRect.width / 2;
        const evetCenterY = evetRect.top - containerRect.top + evetRect.height / 2;

        if (Math.abs(x - evetCenterX) < hayirW * 1.6 && Math.abs(y - evetCenterY) < hayirW * 1.6) {
            x = evetCenterX + hayirW * 1.8 + Math.random() * 30;
            if (x > maxX) x = maxX - hayirW;
        }

        return {
            x: Math.min(maxX, Math.max(padding, x)),
            y: Math.min(maxY, Math.max(padding, y))
        };
    }

    moveHayirButton() {
        const pos = this.getSafePosition();
        this.hayirBtn.style.left = `${pos.x}px`;
        this.hayirBtn.style.top = `${pos.y}px`;
    }

    startRunning() {
        if (this.isKaciyor) return;
        this.isKaciyor = true;
        this.hayirBtn.classList.add('running');
        this.moveHayirButton();
    }

    // Kül Efekti
    createAshEffect() {
        this.hayirBtn.classList.add('ash-fade');
        this.playSound(this.sadAudio);

        const rect = this.hayirBtn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 18; i++) {
            setTimeout(() => {
                const isBroken = i < 6;
                const particle = document.createElement('div');
                particle.className = isBroken ? 'ash-particle broken-heart' : 'ash-particle';
                if (isBroken) particle.innerHTML = '💔';
                particle.style.left = `${centerX}px`;
                particle.style.top = `${centerY}px`;

                document.body.appendChild(particle);

                const angle = Math.random() * Math.PI * 2;
                const distance = 60 + Math.random() * 140;
                const translateX = Math.cos(angle) * distance;
                const translateY = Math.sin(angle) * distance - 30;

                particle.animate([
                    { opacity: 0, transform: 'scale(0.2) translate(0,0)' },
                    { opacity: 0.9, transform: `translate(${translateX}px, ${translateY}px) scale(1.3)`, offset: 0.4 },
                    { opacity: 0, transform: `translate(${translateX * 1.6}px, ${translateY * 1.6 + 70}px) scale(0.1)` }
                ], {
                    duration: 1300 + Math.random() * 600,
                    easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)'
                }).onfinish = () => particle.remove();
            }, i * 55);
        }
    }

    destroyButton() {
        this.createAshEffect();
        setTimeout(() => {
            if (this.hayirBtn.parentElement) {
                this.hayirBtn.remove();
            }
        }, 1700);
    }

    // Kalp Patlaması
    createHeartExplosion() {
        this.whiteScreen.classList.add('show');
        this.playSound(this.happyAudio, 0.6);

        for (let i = 0; i < 100; i++) {
            setTimeout(() => {
                const heart = document.createElement('div');
                heart.className = 'heart-particle';
                heart.innerHTML = Math.random() > 0.4 ? '❤️' : '💖';
                const angle = Math.random() * Math.PI * 2;
                const distance = 80 + Math.random() * 280;
                const translateX = Math.cos(angle) * distance + 'vw';
                const translateY = Math.sin(angle) * distance + 'vh';
                heart.style.left = '50vw';
                heart.style.top = '50vh';
                heart.style.fontSize = `${18 + Math.random() * 30}px`;
                
                this.heartExplosion.appendChild(heart);

                heart.animate([
                    { transform: 'translate(-50%,-50%) scale(0.1)', opacity: 0 },
                    { transform: `translate(calc(-50% + ${translateX}), calc(-50% + ${translateY})) scale(1.3)`, opacity: 1, offset: 0.4 },
                    { transform: `translate(calc(-50% + ${translateX * 1.5}), calc(-50% + ${translateY * 1.5})) scale(0.4)`, opacity: 0 }
                ], {
                    duration: 1400 + Math.random() * 900,
                    easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)'
                }).onfinish = () => heart.remove();
            }, i * 40);
        }
    }

    // Event Handlers
    handleHayirClick() {
        this.hayirTik++;
        this.updateCounter();
        
        this.triggerDamageEffect();

        if (this.hayirTik === 1) {
            this.startRunning();
        }

        if (this.hayirTik <= this.maxAttempts) {
            this.moveHayirButton();
            
            if (this.hayirTik === this.maxAttempts) {
                setTimeout(() => this.destroyButton(), 400);
            } else {
                this.createAshEffect();
            }
        }
    }

    handleEvetClick() {
        this.createHeartExplosion();
        
        setTimeout(() => {
            this.heartbeatAudio.pause();
            this.showFinalScreen();
        }, 2200);
    }

    updateCounter() {
        if (this.counterNumber) {
            this.counterNumber.textContent = this.hayirTik;
        }
    }

    showFinalScreen() {
        // Ana ekranı gizle
        Object.values(this.mainElements).forEach(el => {
            if (el) el.style.display = 'none';
        });

        // Final ekranını göster
        this.whiteScreen.classList.remove('show');
        this.sonEkran.classList.add('show');
    }

    restartGame() {
        // Sayfayı yenile
        window.location.reload();
    }
}

// Uygulamayı Başlat
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    
    // Global erişim için (isteğe bağlı)
    window.game = game;
});