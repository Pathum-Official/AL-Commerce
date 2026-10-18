/**
 * Resilient Synchronized Voice & AI Audio Highlighter Engine
 * Cleans text from LaTeX formulas, HTML/temp_page blocks, emojis & symbols
 * to prevent 404s and playback abort errors on TTS engines.
 */

const TTS_ENDPOINTS = [
    { base: 'https://translate.googleapis.com/translate_tts', client: 'gtx' },
    { base: 'https://translate.google.com/translate_tts', client: 'tw-ob' }
];

class VoiceHighlighterEngine {
    constructor() {
        this.audio = null;
        this.chunks = [];
        this.currentIndex = -1;
        this.state = 'stopped'; // 'playing' | 'paused' | 'stopped'
        this.color = localStorage.getItem('alcommerce_speech_hl_color') || '#ffeb3b';
        this.lang = 'si';
        this.listeners = new Set();
        this.onChunkCallback = null;
        this.onCompleteCallback = null;
        this.activeHighlightElements = [];
        this.playTimeout = null;

        if (typeof document !== 'undefined') {
            document.documentElement.style.setProperty('--speech-hl-color', this.color);
        }
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notify() {
        const payload = {
            state: this.state,
            currentIndex: this.currentIndex,
            totalChunks: this.chunks.length,
            currentText: this.chunks[this.currentIndex]?.text || '',
            color: this.color
        };
        this.listeners.forEach(fn => {
            try { fn(payload); } catch (e) { /* ignore listener error */ }
        });
    }

    setColor(newColor) {
        this.color = newColor;
        localStorage.setItem('alcommerce_speech_hl_color', newColor);
        if (typeof document !== 'undefined') {
            document.documentElement.style.setProperty('--speech-hl-color', newColor);
        }
        this.notify();
    }

    /**
     * Cleans text and splits into safe natural sentence chunks of <= 65 chars
     */
    splitIntoChunks(text) {
        if (!text) return [];

        // 1. Strip <temp_page> blocks completely (raw simulation code should never be spoken)
        let clean = text.replace(/<temp_page[\s\S]*?<\/temp_page>/gi, ' ');
        // 2. Strip any HTML tags
        clean = clean.replace(/<\/?[^>]+(>|$)/g, ' ');
        // 3. Strip KaTeX/LaTeX display & inline math formulas ($$...$$, $...$)
        clean = clean.replace(/\$\$[\s\S]*?\$\$/g, ' ');
        clean = clean.replace(/\$[^$\n]+\$/g, ' ');
        clean = clean.replace(/\\[a-zA-Z]+/g, ' ');
        // 4. Strip code blocks
        clean = clean.replace(/```[\s\S]*?```/g, ' ');
        clean = clean.replace(/`([^`]+)`/g, '$1');
        // 5. Strip markdown links [label](url) -> label
        clean = clean.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
        // 6. Strip emojis and unicode symbols (which cause Google TTS 404s)
        clean = clean.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, ' ');
        // 7. Strip special symbols { } [ ] ( ) | ~ # * _ = + \ / ^ % $
        clean = clean.replace(/[{}[\]()|~#*_=+\\/^%$]/g, ' ');
        // 8. Replace dashes and quotes
        clean = clean.replace(/-{2,}/g, ' ');
        clean = clean.replace(/["'""'']/g, ' ');
        // 9. Normalize whitespace
        clean = clean.replace(/\s+/g, ' ').trim();

        if (!clean) return [];

        const sentences = clean.split(/(?<=[.?!।\n])\s+/);
        const chunks = [];

        sentences.forEach(sentence => {
            const trimmed = sentence.trim();
            if (!trimmed) return;

            if (trimmed.length <= 65) {
                chunks.push(trimmed);
            } else {
                const words = trimmed.split(' ');
                let current = '';
                for (const w of words) {
                    if ((current + ' ' + w).trim().length > 65) {
                        if (current.trim()) chunks.push(current.trim());
                        current = w;
                    } else {
                        current = (current + ' ' + w).trim();
                    }
                }
                if (current.trim()) chunks.push(current.trim());
            }
        });

        // Filter out any chunk that is purely numbers or punctuation
        return chunks.filter(c => /[a-zA-Z\u0D80-\u0DFF]/.test(c));
    }

    speakText(text, options = {}) {
        this.stop();
        const rawChunks = this.splitIntoChunks(text);
        if (rawChunks.length === 0) return;

        this.chunks = rawChunks.map((t, idx) => ({
            id: `chunk_${idx}`,
            text: t,
            elements: options.element ? [options.element] : []
        }));

        this.lang = options.lang || 'si';
        this.onChunkCallback = options.onChunk || null;
        this.onCompleteCallback = options.onComplete || null;
        this.state = 'playing';
        this.playChunk(0);
    }

    speakContainer(containerElement, options = {}) {
        this.stop();
        if (!containerElement) return;

        const elements = containerElement.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th');
        const compiledChunks = [];

        elements.forEach((el, elIndex) => {
            const rawText = el.innerText?.trim();
            if (!rawText || el.offsetParent === null) return;
            if (el.tagName === 'LI' && el.querySelector('p')) return;

            const subChunks = this.splitIntoChunks(rawText);
            subChunks.forEach((sub, subIdx) => {
                compiledChunks.push({
                    id: `node_${elIndex}_${subIdx}`,
                    text: sub,
                    element: el
                });
            });
        });

        if (compiledChunks.length === 0) return;

        this.chunks = compiledChunks;
        this.lang = options.lang || 'si';
        this.onChunkCallback = options.onChunk || null;
        this.onCompleteCallback = options.onComplete || null;
        this.state = 'playing';
        this.playChunk(0);
    }

    clearHighlights() {
        if (typeof document === 'undefined') return;
        document.querySelectorAll('.active-ai-element, .active-speech-element').forEach(el => {
            el.classList.remove('active-ai-element');
            el.classList.remove('active-speech-element');
        });
        this.activeHighlightElements = [];
    }

    highlightElement(el) {
        this.clearHighlights();
        if (!el) return;
        el.classList.add('active-ai-element');
        this.activeHighlightElements = [el];

        const rect = el.getBoundingClientRect();
        if (rect.top < 120 || rect.bottom > window.innerHeight - 100) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    playChunk(index) {
        if (this.playTimeout) {
            clearTimeout(this.playTimeout);
            this.playTimeout = null;
        }

        if (index < 0 || index >= this.chunks.length) {
            this.stop();
            if (this.onCompleteCallback) this.onCompleteCallback();
            return;
        }

        this.currentIndex = index;
        const currentItem = this.chunks[index];

        if (currentItem.element) {
            this.highlightElement(currentItem.element);
        }

        if (this.onChunkCallback) {
            this.onChunkCallback(index, this.chunks.length, currentItem.text);
        }

        this.notify();

        // 1. Try Browser SpeechSynthesis if supported and has voices
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const synth = window.speechSynthesis;
            const voices = synth.getVoices ? synth.getVoices() : [];
            const sinhalaVoice = voices.find(v => v.lang.startsWith('si') || v.lang.startsWith('ta'));

            if (sinhalaVoice) {
                synth.cancel();
                const utter = new SpeechSynthesisUtterance(currentItem.text);
                utter.voice = sinhalaVoice;
                utter.lang = this.lang;
                utter.rate = 1.0;
                utter.onend = () => {
                    if (this.state === 'playing' && this.currentIndex === index) {
                        this.playTimeout = setTimeout(() => this.playChunk(index + 1), 200);
                    }
                };
                utter.onerror = () => {
                    this.playWithGoogleTTS(currentItem.text, index);
                };
                synth.speak(utter);
                return;
            }
        }

        // 2. Play with safe Google TTS
        this.playWithGoogleTTS(currentItem.text, index);
    }

    playWithGoogleTTS(cleanText, index) {
        if (this.audio) {
            this.audio.onended = null;
            this.audio.onerror = null;
            this.audio.pause();
            this.audio = null;
        }

        const endpoint = TTS_ENDPOINTS[Math.floor(Math.random() * TTS_ENDPOINTS.length)];
        const safeQuery = encodeURIComponent(cleanText.slice(0, 65));
        const url = `${endpoint.base}?ie=UTF-8&q=${safeQuery}&tl=${this.lang}&client=${endpoint.client}`;

        this.audio = new Audio(url);
        const thisId = index;

        this.audio.onended = () => {
            if (this.state === 'playing' && this.currentIndex === thisId) {
                this.playTimeout = setTimeout(() => {
                    if (this.state === 'playing' && this.currentIndex === thisId) {
                        this.playChunk(index + 1);
                    }
                }, 200);
            }
        };

        this.audio.onerror = () => {
            // Smoothly move to next chunk on audio error without rapid spinning
            if (this.state === 'playing' && this.currentIndex === thisId) {
                this.playTimeout = setTimeout(() => {
                    if (this.state === 'playing') this.playChunk(index + 1);
                }, 500);
            }
        };

        if (this.state === 'playing') {
            const playPromise = this.audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    if (err.name === 'NotAllowedError') {
                        this.state = 'paused';
                        this.notify();
                    } else if (err.name !== 'AbortError') {
                        this.playTimeout = setTimeout(() => {
                            if (this.state === 'playing' && this.currentIndex === thisId) {
                                this.playChunk(index + 1);
                            }
                        }, 500);
                    }
                });
            }
        }
    }

    pause() {
        if (this.audio && this.state === 'playing') {
            this.audio.pause();
        }
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.pause();
        }
        this.state = 'paused';
        this.notify();
    }

    resume() {
        if (this.state === 'paused') {
            this.state = 'playing';
            if (this.audio) {
                this.audio.play().catch(() => this.playChunk(this.currentIndex));
            } else {
                this.playChunk(this.currentIndex);
            }
            this.notify();
        }
    }

    togglePlayPause() {
        if (this.state === 'playing') {
            this.pause();
        } else if (this.state === 'paused') {
            this.resume();
        }
    }

    next() {
        if (this.currentIndex < this.chunks.length - 1) {
            this.playChunk(this.currentIndex + 1);
        }
    }

    prev() {
        if (this.currentIndex > 0) {
            this.playChunk(this.currentIndex - 1);
        }
    }

    stop() {
        if (this.playTimeout) {
            clearTimeout(this.playTimeout);
            this.playTimeout = null;
        }
        if (this.audio) {
            this.audio.onended = null;
            this.audio.onerror = null;
            this.audio.pause();
            this.audio.currentTime = 0;
            this.audio = null;
        }
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        this.clearHighlights();
        this.state = 'stopped';
        this.currentIndex = -1;
        this.chunks = [];
        this.notify();
    }
}

export const voiceHighlighter = new VoiceHighlighterEngine();
