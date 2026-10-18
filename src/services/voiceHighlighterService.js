/**
 * Synchronized Voice & AI Audio Highlighter Engine
 * Plays speech sentence-by-sentence via resilient Google TTS endpoints
 * while highlighting the corresponding text/element in real-time.
 */

const TTS_ENDPOINTS = [
    { base: 'https://translate.googleapis.com/translate_tts', client: 'gtx' },
    { base: 'https://translate.google.com/translate_tts', client: 'tw-ob' },
    { base: 'https://translate.googleapis.com/translate_tts', client: 'dict-chrome-ex' }
];

class VoiceHighlighterEngine {
    constructor() {
        this.audio = null;
        this.chunks = [];
        this.currentIndex = -1;
        this.state = 'stopped'; // 'playing' | 'paused' | 'stopped'
        this.color = localStorage.getItem('alcommerce_speech_hl_color') || '#ffeb3b';
        this.speed = parseFloat(localStorage.getItem('alcommerce_speech_speed') || '1.0');
        this.lang = 'si';
        this.listeners = new Set();
        this.onChunkCallback = null;
        this.onCompleteCallback = null;
        this.activeHighlightElements = [];
        
        // Apply initial color to document
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
        this.listeners.forEach(fn => fn(payload));
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
     * Splits text into natural sentence chunks strictly capped at 95 characters
     * for Google TTS URL length compatibility.
     */
    splitIntoChunks(text) {
        if (!text) return [];
        // Clean markdown symbols to make audio sound smooth and human
        const clean = text
            .replace(/```[\s\S]*?```/g, '')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            .replace(/[#*_~>]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        const sentences = clean.split(/(?<=[.?!।\n])\s+/);
        const chunks = [];

        sentences.forEach(sentence => {
            const trimmed = sentence.trim();
            if (!trimmed) return;

            if (trimmed.length <= 95) {
                chunks.push(trimmed);
            } else {
                // Split long sentence by comma or words
                const words = trimmed.split(' ');
                let current = '';
                for (const w of words) {
                    if ((current + ' ' + w).trim().length > 95) {
                        if (current.trim()) chunks.push(current.trim());
                        current = w;
                    } else {
                        current = (current + ' ' + w).trim();
                    }
                }
                if (current.trim()) chunks.push(current.trim());
            }
        });

        return chunks;
    }

    /**
     * Start reading a raw text string with synchronized highlight callback
     */
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

    /**
     * Extract and read all readable DOM elements from a container (e.g., .ptm-note-content)
     * and highlight each element in real-time as it is spoken.
     */
    speakContainer(containerElement, options = {}) {
        this.stop();
        if (!containerElement) return;

        const elements = containerElement.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th');
        const compiledChunks = [];

        elements.forEach((el, elIndex) => {
            const rawText = el.innerText?.trim();
            if (!rawText || el.offsetParent === null) return;
            // Ignore outer li if it has child paragraphs
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

        // Smooth scroll if element is not in center viewport
        const rect = el.getBoundingClientRect();
        if (rect.top < 120 || rect.bottom > window.innerHeight - 100) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    playChunk(index) {
        if (index < 0 || index >= this.chunks.length) {
            this.stop();
            if (this.onCompleteCallback) this.onCompleteCallback();
            return;
        }

        this.currentIndex = index;
        const currentItem = this.chunks[index];

        // Apply DOM Highlight
        if (currentItem.element) {
            this.highlightElement(currentItem.element);
        }

        if (this.onChunkCallback) {
            this.onChunkCallback(index, this.chunks.length, currentItem.text);
        }

        this.notify();

        const endpoint = TTS_ENDPOINTS[Math.floor(Math.random() * TTS_ENDPOINTS.length)];
        const url = `${endpoint.base}?ie=UTF-8&q=${encodeURIComponent(currentItem.text)}&tl=${this.lang}&client=${endpoint.client}`;

        if (this.audio) {
            this.audio.pause();
            this.audio = null;
        }

        this.audio = new Audio(url);
        const thisId = index;

        this.audio.onended = () => {
            if (this.state === 'playing' && this.currentIndex === thisId) {
                setTimeout(() => {
                    if (this.state === 'playing' && this.currentIndex === thisId) {
                        this.playChunk(index + 1);
                    }
                }, 220);
            }
        };

        this.audio.onerror = (e) => {
            console.warn('[VoiceHighlighter] Audio error, skipping chunk', e);
            if (this.state === 'playing' && this.currentIndex === thisId) {
                setTimeout(() => {
                    if (this.state === 'playing') this.playChunk(index + 1);
                }, 600);
            }
        };

        if (this.state === 'playing') {
            this.audio.play().catch(err => {
                console.warn('[VoiceHighlighter] Playback prevented by browser policy:', err);
                if (err.name === 'NotAllowedError') {
                    this.state = 'paused';
                    this.notify();
                } else {
                    setTimeout(() => {
                        if (this.state === 'playing' && this.currentIndex === thisId) {
                            this.playChunk(index + 1);
                        }
                    }, 500);
                }
            });
        }
    }

    pause() {
        if (this.audio && this.state === 'playing') {
            this.audio.pause();
            this.state = 'paused';
            this.notify();
        }
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
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
            this.audio = null;
        }
        this.clearHighlights();
        this.state = 'stopped';
        this.currentIndex = -1;
        this.chunks = [];
        this.notify();
    }
}

export const voiceHighlighter = new VoiceHighlighterEngine();
