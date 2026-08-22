(function () {
    'use strict';

    const CONFIG = {
        heartCount: 16,
        heartSymbols: ['♥', '♡', '❤️', '💕', '💗', '💖'],
        heartMinSize: 12,
        heartMaxSize: 28,
        heartMinDuration: 12,
        heartMaxDuration: 26,
        particleCount: 50,
        particleColors: [
            'rgba(232, 160, 184, 0.6)',
            'rgba(232, 201, 160, 0.5)',
            'rgba(200, 176, 224, 0.5)',
            'rgba(255, 107, 138, 0.4)'
        ],
        preloaderMinTime: 1600,
        revealThreshold: 0.15,
        // Together since September 15, 2025
        togetherDate: new Date('2025-09-15T00:00:00')
    };

    const LOVE_NOTES = [
        "You are my everything, Baby.",
        "Dumbo, you still make my heart race.",
        "Every bunked class with you was worth it.",
        "6 AM was easy when it meant seeing you.",
        "I love you more than words can hold.",
        "You are my favorite person in every room.",
        "Thank you for choosing me, Beepana.",
        "My Dumbo. My Baby. My home.",
        "I still get soft when I think about you.",
        "Yours, always — Evan."
    ];

    const FLOAT_MSGS = [
        "I love you", "My Baby", "Dumbo ❤️", "You're my everything",
        "Beepana", "Yours", "Forever", "My person", "Stay close"
    ];

    const QUIZ = [
        { q: "What makes a perfect date?", options: ["Quiet time together", "Loud parties only", "Shopping all day", "Staying silent"], a: 0 },
        { q: "The best way to say I love you is...", options: ["Only with gifts", "Through actions and words", "Once a year", "Never saying it"], a: 1 },
        { q: "What should we always make time for?", options: ["Only work", "Each other", "Phones", "Arguments"], a: 1 },
        { q: "The most romantic place is...", options: ["Anywhere you are", "Only fancy restaurants", "Only beaches", "Only movies"], a: 0 },
        { q: "Growing together means...", options: ["Becoming boring", "Choosing each other daily", "Giving up dreams", "Living apart"], a: 1 },
        { q: "When one of us is stressed, the other should...", options: ["Listen and stay close", "Ignore it", "Make it about themselves", "Disappear"], a: 0 },
        { q: "What do early mornings mean when they involve you?", options: ["Worth it", "Too early", "Annoying", "Pointless"], a: 0 },
        { q: "Bunking college is best when...", options: ["It's with you", "Alone", "Never", "For no reason"], a: 0 }
    ];

    const BALLOON_WISHES = [
        "May your coffee always be perfect.",
        "May you always feel as loved as you are, Baby.",
        "May every hard day end with soft arms around you.",
        "May your dreams keep growing wings.",
        "May you never forget how extraordinary you are.",
        "May laughter find you easily this year.",
        "May you have courage and peace in equal measure.",
        "May someone (me) always choose you first.",
        "May ordinary Tuesdays feel special.",
        "May you look in the mirror and like who you see.",
        "May this year write beautiful chapters for you.",
        "Happy Birthday, my Dumbo. I love you."
    ];

    const Storage = {
        get(key, fallback) {
            try {
                const v = localStorage.getItem('bday_' + key);
                return v !== null ? JSON.parse(v) : fallback;
            } catch { return fallback; }
        },
        set(key, value) {
            try { localStorage.setItem('bday_' + key, JSON.stringify(value)); } catch {}
        }
    };

    const DOM = {
        preloader: document.getElementById('preloader'),
        heartsContainer: document.getElementById('hearts-container'),
        particlesCanvas: document.getElementById('particles-canvas'),
        mainNav: document.getElementById('main-nav'),
        navToggle: document.getElementById('nav-toggle'),
        navLinks: document.querySelector('.nav-links'),
        playMusicBtn: document.getElementById('play-music-btn'),
        backgroundMusic: document.getElementById('background-music'),
        floatingMessages: document.getElementById('floating-messages')
    };

    function prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /* Preloader */
    function initPreloader() {
        const start = performance.now();
        function hide() {
            const remaining = Math.max(0, CONFIG.preloaderMinTime - (performance.now() - start));
            setTimeout(() => {
                if (DOM.preloader) {
                    DOM.preloader.classList.add('hidden');
                    setTimeout(() => DOM.preloader && DOM.preloader.remove(), 900);
                }
            }, remaining);
        }
        if (document.readyState === 'complete') hide();
        else {
            window.addEventListener('load', hide);
            setTimeout(hide, 4000);
        }
    }

    /* Floating hearts */
    function createFloatingHeart() {
        if (!DOM.heartsContainer) return;
        const heart = document.createElement('span');
        heart.className = 'floating-heart';
        heart.textContent = CONFIG.heartSymbols[Math.floor(Math.random() * CONFIG.heartSymbols.length)];
        const size = CONFIG.heartMinSize + Math.random() * (CONFIG.heartMaxSize - CONFIG.heartMinSize);
        const left = Math.random() * 100;
        const duration = CONFIG.heartMinDuration + Math.random() * (CONFIG.heartMaxDuration - CONFIG.heartMinDuration);
        const delay = Math.random() * 4;
        heart.style.cssText = `left:${left}%;font-size:${size}px;animation-duration:${duration}s;animation-delay:${delay}s;opacity:${0.15 + Math.random() * 0.35}`;
        DOM.heartsContainer.appendChild(heart);
        setTimeout(() => heart.remove(), (duration + delay) * 1000);
    }

    function initFloatingHearts() {
        for (let i = 0; i < CONFIG.heartCount; i++) setTimeout(createFloatingHeart, i * 400);
        setInterval(() => { if (!document.hidden) createFloatingHeart(); }, 1800);
    }

    /* Particles */
    function initParticles() {
        const canvas = DOM.particlesCanvas;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let particles = [];
        let width = 0, height = 0;

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        }

        function createParticle() {
            return {
                x: Math.random() * width,
                y: Math.random() * height,
                radius: 1 + Math.random() * 2.5,
                color: CONFIG.particleColors[Math.floor(Math.random() * CONFIG.particleColors.length)],
                speedX: (Math.random() - 0.5) * 0.4,
                speedY: (Math.random() - 0.5) * 0.4,
                opacity: 0.2 + Math.random() * 0.5,
                life: 0,
                maxLife: 200 + Math.random() * 300
            };
        }

        function initArray() {
            particles = [];
            for (let i = 0; i < CONFIG.particleCount; i++) particles.push(createParticle());
        }

        function update() {
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.speedX;
                p.y += p.speedY;
                p.life++;
                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;
                if (p.life > p.maxLife) particles[i] = createParticle();
            }
        }

        function draw() {
            ctx.clearRect(0, 0, width, height);
            for (const p of particles) {
                const lifeRatio = 1 - (p.life / p.maxLife);
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color.replace(/[\d.]+\)$/g, `${p.opacity * lifeRatio})`);
                ctx.fill();
            }
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const a = particles[i], b = particles[j];
                    const dx = a.x - b.x, dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.strokeStyle = `rgba(232, 160, 184, ${0.08 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            if (!document.hidden) { update(); draw(); }
            requestAnimationFrame(animate);
        }

        resize();
        initArray();
        animate();
        window.addEventListener('resize', () => {
            resize();
            particles.forEach(p => { p.x = Math.min(p.x, width); p.y = Math.min(p.y, height); });
        });
    }

    /* Navigation */
    function initNavigation() {
        window.addEventListener('scroll', () => {
            const current = window.pageYOffset || document.documentElement.scrollTop;
            if (DOM.mainNav) DOM.mainNav.classList.toggle('scrolled', current > 60);
        }, { passive: true });

        if (DOM.navToggle && DOM.navLinks) {
            DOM.navToggle.addEventListener('click', () => {
                DOM.navLinks.classList.toggle('open');
                DOM.navToggle.classList.toggle('open');
            });
            DOM.navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    DOM.navLinks.classList.remove('open');
                    DOM.navToggle.classList.remove('open');
                });
            });
        }

        const navAnchors = document.querySelectorAll('.nav-link');
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
                }
            });
        }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });
        document.querySelectorAll('section[id], header[id]').forEach(s => sectionObserver.observe(s));
    }

    /* Scroll reveal */
    function initScrollReveal() {
        const els = document.querySelectorAll('.reason-card, .promise-item, .gallery-item, .letter-paper, .wish-card, .finale-content, .game-card, .quiz-card, .timeline-item');
        els.forEach(el => el.classList.add('fade-in-section'));
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: CONFIG.revealThreshold, rootMargin: '0px 0px -40px 0px' });
        els.forEach(el => observer.observe(el));
    }

    /* Music */
    function initMusicToggle() {
        if (!DOM.playMusicBtn || !DOM.backgroundMusic) return;
        let isPlaying = false;
        DOM.playMusicBtn.addEventListener('click', () => {
            if (isPlaying) {
                DOM.backgroundMusic.pause();
                DOM.playMusicBtn.textContent = 'Play Our Song 🎵';
                isPlaying = false;
            } else {
                DOM.backgroundMusic.play().then(() => {
                    DOM.playMusicBtn.textContent = 'Pause Our Song ⏸';
                    isPlaying = true;
                }).catch(() => {
                    DOM.playMusicBtn.textContent = 'Click again to play';
                });
            }
        });
    }

    /* Days together */
    function initLoveDays() {
        const el = document.getElementById('love-days');
        if (!el) return;
        const now = new Date();
        const diff = now - CONFIG.togetherDate;
        const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
        el.textContent = days.toLocaleString();
    }

    /* Daily note */
    function showRandomNote() {
        const el = document.getElementById('daily-note');
        if (el) el.textContent = LOVE_NOTES[Math.floor(Math.random() * LOVE_NOTES.length)];
    }

    /* Floating messages */
    function spawnFloatingMessage() {
        if (!DOM.floatingMessages || prefersReducedMotion()) return;
        const el = document.createElement('span');
        el.className = 'float-msg';
        el.textContent = FLOAT_MSGS[Math.floor(Math.random() * FLOAT_MSGS.length)];
        el.style.left = (10 + Math.random() * 80) + '%';
        el.style.animationDuration = (8 + Math.random() * 10) + 's';
        DOM.floatingMessages.appendChild(el);
        setTimeout(() => el.remove(), 18000);
    }

    /* Unlocked notes */
    function unlockNote(text) {
        let unlocked = Storage.get('unlockedNotes', []);
        if (unlocked.includes(text)) return;
        unlocked.push(text);
        Storage.set('unlockedNotes', unlocked);
        renderUnlockedNotes();
        const live = document.getElementById('aria-live-region');
        if (live) live.textContent = 'New love note unlocked';
    }

    function renderUnlockedNotes() {
        const list = document.getElementById('notes-list');
        if (!list) return;
        const unlocked = Storage.get('unlockedNotes', []);
        if (!unlocked.length) {
            list.innerHTML = '<li class="empty">Play a game to unlock your first note 💌</li>';
            return;
        }
        list.innerHTML = unlocked.map(n => `<li>${n}</li>`).join('');
    }

    /* ===== HEART CATCHER ===== */
    const HeartsGame = {
        score: 0, lives: 5, running: false, interval: null, area: null,
        start() {
            this.area = document.getElementById('hearts-area');
            if (!this.area) return;
            this.score = 0; this.lives = 5; this.running = true;
            this.updateUI();
            this.area.innerHTML = '';
            this.area.classList.add('playing');
            this.spawnLoop();
        },
        updateUI() {
            const s = document.getElementById('hearts-score');
            const l = document.getElementById('hearts-lives');
            const b = document.getElementById('hearts-best');
            if (s) s.textContent = this.score;
            if (l) l.textContent = this.lives;
            const best = Storage.get('heartsBest', 0);
            if (b) b.textContent = Math.max(best, this.score);
        },
        spawnLoop() {
            if (!this.running) return;
            this.spawnHeart();
            const delay = Math.max(400, 900 - this.score * 8);
            this.interval = setTimeout(() => this.spawnLoop(), delay);
        },
        spawnHeart() {
            if (!this.area || !this.running) return;
            const h = document.createElement('button');
            h.className = 'falling-heart';
            h.textContent = ['❤️', '💕', '💖', '💗', '💓'][Math.floor(Math.random() * 5)];
            h.style.left = (5 + Math.random() * 85) + '%';
            h.style.animationDuration = (2.2 + Math.random() * 1.8) + 's';
            const catchFn = (e) => {
                e.preventDefault(); e.stopPropagation();
                this.score += 1; h.remove(); this.updateUI();
                if (this.score === 10 || this.score === 25 || this.score === 50)
                    unlockNote(`Heart Catcher ${this.score}: You catch my heart every time, Baby.`);
            };
            h.addEventListener('click', catchFn);
            h.addEventListener('touchstart', catchFn, { passive: false });
            this.area.appendChild(h);
            h.addEventListener('animationend', () => {
                if (h.parentNode) {
                    h.remove(); this.lives -= 1; this.updateUI();
                    if (this.lives <= 0) this.end();
                }
            });
        },
        end() {
            this.running = false;
            clearTimeout(this.interval);
            const best = Storage.get('heartsBest', 0);
            if (this.score > best) Storage.set('heartsBest', this.score);
            this.updateUI();
            unlockNote(`You scored ${this.score} in Heart Catcher. My heart is yours, Dumbo.`);
            if (this.area) {
                this.area.classList.remove('playing');
                this.area.innerHTML = `<p class="game-over">Game over! Score: ${this.score}</p><button class="btn-primary game-start" data-game="hearts">Play Again</button>`;
                this.bindStart();
            }
        },
        bindStart() {
            document.querySelectorAll('[data-game="hearts"]').forEach(btn => btn.onclick = () => this.start());
        }
    };

    /* ===== MEMORY MATCH ===== */
    const MemoryGame = {
        symbols: ['❤️', '💕', '💖', '💗', '💓', '💞', '💝', '♡'],
        flipped: [], matched: 0, moves: 0, locked: false,
        start() {
            const board = document.getElementById('memory-board');
            if (!board) return;
            this.matched = 0; this.moves = 0; this.flipped = []; this.locked = false;
            const pair = [...this.symbols, ...this.symbols].sort(() => Math.random() - 0.5);
            board.innerHTML = '';
            board.classList.add('playing');
            pair.forEach((sym, i) => {
                const card = document.createElement('button');
                card.className = 'memory-card';
                card.dataset.symbol = sym;
                card.innerHTML = '<span class="back">?</span><span class="front">' + sym + '</span>';
                card.addEventListener('click', () => this.flip(card));
                board.appendChild(card);
            });
            this.updateUI();
        },
        updateUI() {
            const m = document.getElementById('memory-moves');
            const p = document.getElementById('memory-pairs');
            const b = document.getElementById('memory-best');
            if (m) m.textContent = this.moves;
            if (p) p.textContent = this.matched;
            const best = Storage.get('memoryBest', null);
            if (b) b.textContent = best !== null ? best : '—';
        },
        flip(card) {
            if (this.locked || card.classList.contains('flipped') || card.classList.contains('matched')) return;
            card.classList.add('flipped');
            this.flipped.push(card);
            if (this.flipped.length === 2) {
                this.moves++; this.updateUI(); this.locked = true;
                const [a, b] = this.flipped;
                if (a.dataset.symbol === b.dataset.symbol) {
                    a.classList.add('matched'); b.classList.add('matched');
                    this.matched++; this.flipped = []; this.locked = false;
                    this.updateUI();
                    if (this.matched === 8) this.win();
                } else {
                    setTimeout(() => {
                        a.classList.remove('flipped'); b.classList.remove('flipped');
                        this.flipped = []; this.locked = false;
                    }, 700);
                }
            }
        },
        win() {
            const best = Storage.get('memoryBest', 999);
            if (this.moves < best) Storage.set('memoryBest', this.moves);
            this.updateUI();
            unlockNote(`Memory Match in ${this.moves} moves. You remember us perfectly, Baby.`);
            const board = document.getElementById('memory-board');
            if (board) {
                setTimeout(() => {
                    board.innerHTML = `<p class="game-over">You matched them all in ${this.moves} moves! 💕</p><button class="btn-primary game-start" data-game="memory">Play Again</button>`;
                    board.classList.remove('playing');
                    document.querySelectorAll('[data-game="memory"]').forEach(btn => btn.onclick = () => this.start());
                }, 600);
            }
        }
    };

    /* ===== LOVE TAP ===== */
    const TapGame = {
        score: 0, timeLeft: 10, running: false, timer: null,
        start() {
            const area = document.getElementById('tap-area');
            const heart = document.getElementById('tap-heart');
            if (!area || !heart) return;
            this.score = 0; this.timeLeft = 10; this.running = true;
            this.updateUI();
            area.classList.add('playing');
            const startBtn = area.querySelector('.game-start');
            if (startBtn) startBtn.style.display = 'none';
            heart.style.transform = 'scale(1)';
            const tap = (e) => {
                if (!this.running) return;
                e.preventDefault();
                this.score++; this.updateUI();
                heart.style.transform = `scale(${1 + Math.min(this.score * 0.015, 0.8)})`;
            };
            heart.onclick = tap;
            heart.ontouchstart = tap;
            this.timer = setInterval(() => {
                this.timeLeft--; this.updateUI();
                if (this.timeLeft <= 0) this.end();
            }, 1000);
        },
        updateUI() {
            const s = document.getElementById('tap-score');
            const t = document.getElementById('tap-time');
            const b = document.getElementById('tap-best');
            if (s) s.textContent = this.score;
            if (t) t.textContent = this.timeLeft;
            const best = Storage.get('tapBest', 0);
            if (b) b.textContent = Math.max(best, this.score);
        },
        end() {
            this.running = false;
            clearInterval(this.timer);
            const best = Storage.get('tapBest', 0);
            if (this.score > best) Storage.set('tapBest', this.score);
            this.updateUI();
            unlockNote(`Love Tap: ${this.score} taps. That’s how fast my heart beats for you.`);
            const area = document.getElementById('tap-area');
            if (area) {
                area.classList.remove('playing');
                const heart = document.getElementById('tap-heart');
                if (heart) { heart.onclick = null; heart.ontouchstart = null; }
                let msg = area.querySelector('.game-over');
                if (!msg) { msg = document.createElement('p'); msg.className = 'game-over'; area.appendChild(msg); }
                msg.textContent = `Time’s up! ${this.score} taps 💕`;
                let btn = area.querySelector('.game-start');
                if (!btn) {
                    btn = document.createElement('button');
                    btn.className = 'btn-primary game-start';
                    btn.dataset.game = 'tap';
                    btn.textContent = 'Play Again';
                    area.appendChild(btn);
                }
                btn.style.display = '';
                btn.onclick = () => this.start();
            }
        }
    };

    /* ===== BALLOONS ===== */
    const BalloonGame = {
        popped: 0,
        start() {
            const area = document.getElementById('balloons-area');
            if (!area) return;
            this.popped = 0;
            area.innerHTML = '';
            area.classList.add('playing');
            const colors = ['#e8a0b8', '#e8c9a0', '#c8b0e0', '#ff6b8a', '#f0dcc0', '#d4b8c8'];
            BALLOON_WISHES.forEach((wish, i) => {
                const b = document.createElement('button');
                b.className = 'balloon';
                b.style.setProperty('--balloon-color', colors[i % colors.length]);
                b.style.left = (8 + (i % 4) * 22 + Math.random() * 6) + '%';
                b.style.animationDelay = (i * 0.15) + 's';
                b.innerHTML = '<span class="balloon-body"></span><span class="balloon-string"></span>';
                b.addEventListener('click', () => this.pop(b, wish, area));
                b.addEventListener('touchstart', (e) => { e.preventDefault(); this.pop(b, wish, area); }, { passive: false });
                area.appendChild(b);
            });
            this.updateUI();
        },
        pop(btn, wish, area) {
            if (btn.classList.contains('popped')) return;
            btn.classList.add('popped');
            this.popped++;
            this.updateUI();
            const toast = document.createElement('div');
            toast.className = 'wish-toast';
            toast.textContent = wish;
            area.appendChild(toast);
            setTimeout(() => toast.remove(), 3500);
            if (this.popped === 1) unlockNote('First balloon: ' + wish);
            if (this.popped === 12) {
                unlockNote('All balloons popped. Every wish is already yours, Baby.');
                setTimeout(() => {
                    area.classList.remove('playing');
                    area.innerHTML = `<p class="game-over">All wishes released 🎈💕</p><button class="btn-primary game-start" data-game="balloons">Release Again</button>`;
                    document.querySelectorAll('[data-game="balloons"]').forEach(b => b.onclick = () => this.start());
                }, 800);
            }
        },
        updateUI() {
            const s = document.getElementById('balloon-score');
            if (s) s.textContent = this.popped;
        }
    };

    /* ===== QUIZ ===== */
    const Quiz = {
        questions: [], current: 0, score: 0, limit: 8,
        start() {
            this.questions = QUIZ.slice().sort(() => Math.random() - 0.5).slice(0, this.limit);
            this.current = 0; this.score = 0;
            document.getElementById('quiz-intro').classList.add('hidden');
            document.getElementById('quiz-result').classList.add('hidden');
            document.getElementById('quiz-play').classList.remove('hidden');
            document.getElementById('quiz-total').textContent = this.questions.length;
            this.showQuestion();
        },
        showQuestion() {
            const q = this.questions[this.current];
            if (!q) return this.finish();
            document.getElementById('quiz-question').textContent = q.q;
            document.getElementById('quiz-current').textContent = this.current + 1;
            const bar = document.getElementById('quiz-progress-bar');
            if (bar) bar.style.width = ((this.current / this.questions.length) * 100) + '%';
            const opts = document.getElementById('quiz-options');
            opts.innerHTML = '';
            q.options.forEach((opt, i) => {
                const btn = document.createElement('button');
                btn.className = 'quiz-option';
                btn.textContent = opt;
                btn.addEventListener('click', () => this.answer(i === q.a, btn));
                opts.appendChild(btn);
            });
        },
        answer(correct, btn) {
            document.querySelectorAll('.quiz-option').forEach(o => o.disabled = true);
            if (correct) { btn.classList.add('correct'); this.score++; }
            else btn.classList.add('wrong');
            setTimeout(() => { this.current++; this.showQuestion(); }, 700);
        },
        finish() {
            document.getElementById('quiz-play').classList.add('hidden');
            document.getElementById('quiz-result').classList.remove('hidden');
            const pct = Math.round((this.score / this.questions.length) * 100);
            document.getElementById('quiz-result-score').textContent = `You got ${this.score} out of ${this.questions.length} (${pct}%)`;
            let title = 'Beautiful', msg = 'You understand love so well.';
            if (pct >= 90) { title = 'Soulmate energy 💕'; msg = 'You know this heart by heart. I love you, Baby.'; }
            else if (pct >= 70) { title = 'So much love here'; msg = 'You’re tuned into us. That means everything.'; }
            else if (pct >= 50) { title = 'Still learning together'; msg = 'Every answer is a chance to grow closer.'; }
            else { title = 'The best is yet to come'; msg = 'We have a lifetime to learn each other better.'; }
            document.getElementById('quiz-result-title').textContent = title;
            document.getElementById('quiz-result-message').textContent = msg;
            unlockNote(`Quiz ${pct}%: ${msg}`);
            const bar = document.getElementById('quiz-progress-bar');
            if (bar) bar.style.width = '100%';
        }
    };

    function bindGames() {
        document.querySelectorAll('[data-game="hearts"]').forEach(btn => btn.onclick = () => HeartsGame.start());
        document.querySelectorAll('[data-game="memory"]').forEach(btn => btn.onclick = () => MemoryGame.start());
        document.querySelectorAll('[data-game="tap"]').forEach(btn => btn.onclick = () => TapGame.start());
        document.querySelectorAll('[data-game="balloons"]').forEach(btn => btn.onclick = () => BalloonGame.start());
        const quizStart = document.getElementById('quiz-start');
        if (quizStart) quizStart.onclick = () => Quiz.start();
        const quizRetry = document.getElementById('quiz-retry');
        if (quizRetry) quizRetry.onclick = () => Quiz.start();
        const newNote = document.getElementById('new-note-btn');
        if (newNote) newNote.onclick = showRandomNote;
    }

    function initEasterEggs() {
        const finale = document.getElementById('finale-hearts');
        if (finale) {
            let clicks = 0;
            finale.style.cursor = 'pointer';
            finale.addEventListener('click', () => {
                clicks++;
                for (let i = 0; i < 8; i++) setTimeout(createFloatingHeart, i * 80);
                if (clicks >= 5) {
                    unlockNote('You found the secret heart burst. I love you endlessly, Dumbo.');
                    clicks = 0;
                }
            });
        }
    }

    function init() {
        initPreloader();
        initNavigation();
        initMusicToggle();
        initLoveDays();
        renderUnlockedNotes();
        showRandomNote();
        bindGames();
        HeartsGame.bindStart();

        const hb = document.getElementById('hearts-best');
        if (hb) hb.textContent = Storage.get('heartsBest', 0);
        const mb = document.getElementById('memory-best');
        if (mb) {
            const v = Storage.get('memoryBest', null);
            mb.textContent = v !== null ? v : '—';
        }
        const tb = document.getElementById('tap-best');
        if (tb) tb.textContent = Storage.get('tapBest', 0);

        if (!prefersReducedMotion()) {
            initFloatingHearts();
            initParticles();
            initScrollReveal();
            initEasterEggs();
            setInterval(spawnFloatingMessage, 7000);
            setTimeout(spawnFloatingMessage, 2500);
        } else {
            document.querySelectorAll('.fade-in-section, .animate-fade-up').forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'none';
            });
        }
        console.log('%cMade with love for Beepana ❤️ — Evan', 'font-family: Georgia, serif; font-size: 14px; color: #e8a0b8;');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();