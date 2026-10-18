import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, SkipBack, SkipForward, Volume2, X, Palette, Sliders } from 'lucide-react';
import { voiceHighlighter } from '../services/voiceHighlighterService';

export default function VoiceReaderWidget() {
    const [engineState, setEngineState] = useState({
        state: 'stopped',
        currentIndex: -1,
        totalChunks: 0,
        currentText: '',
        color: '#ffeb3b'
    });
    const [showColorPicker, setShowColorPicker] = useState(false);

    useEffect(() => {
        const unsubscribe = voiceHighlighter.subscribe((state) => {
            setEngineState(state);
        });
        return unsubscribe;
    }, []);

    if (engineState.state === 'stopped') return null;

    const colors = [
        { name: 'Gold', hex: '#ffeb3b' },
        { name: 'Emerald', hex: '#34d399' },
        { name: 'Cyan', hex: '#38bdf8' },
        { name: 'Pink', hex: '#f472b6' },
        { name: 'Amber', hex: '#fbbf24' }
    ];

    const isPlaying = engineState.state === 'playing';

    return (
        <div className="voice-reader-floating-bar animate-slide-up">
            <div className="voice-bar-left">
                <div className={`voice-pulsing-badge ${isPlaying ? 'pulsing' : ''}`}>
                    <Volume2 size={16} />
                </div>
                <div className="voice-text-info">
                    <span className="voice-reading-label">
                        {isPlaying ? 'AI Voice Teacher Reading...' : 'Paused'} 
                        {engineState.totalChunks > 0 && ` (${engineState.currentIndex + 1}/${engineState.totalChunks})`}
                    </span>
                    <p className="voice-current-snippet" title={engineState.currentText}>
                        {engineState.currentText || 'Ready...'}
                    </p>
                </div>
            </div>

            <div className="voice-bar-controls">
                <button 
                    className="btn-voice-ctrl"
                    onClick={() => voiceHighlighter.prev()}
                    title="Previous Sentence"
                >
                    <SkipBack size={15} />
                </button>

                <button 
                    className="btn-voice-ctrl btn-voice-play"
                    onClick={() => voiceHighlighter.togglePlayPause()}
                    title={isPlaying ? "Pause" : "Play"}
                >
                    {isPlaying ? <Pause size={17} /> : <Play size={17} />}
                </button>

                <button 
                    className="btn-voice-ctrl"
                    onClick={() => voiceHighlighter.next()}
                    title="Next Sentence"
                >
                    <SkipForward size={15} />
                </button>

                <button 
                    className="btn-voice-ctrl"
                    onClick={() => voiceHighlighter.stop()}
                    title="Stop Voice Reader"
                >
                    <Square size={14} />
                </button>

                <div className="voice-palette-wrap">
                    <button 
                        className="btn-voice-ctrl"
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        title="Highlight Color"
                    >
                        <Palette size={15} />
                    </button>

                    {showColorPicker && (
                        <div className="voice-color-dropdown">
                            <span className="dropdown-label">Highlight Color:</span>
                            <div className="color-swatches">
                                {colors.map(c => (
                                    <button 
                                        key={c.hex}
                                        className={`color-swatch-circle ${engineState.color === c.hex ? 'active' : ''}`}
                                        style={{ backgroundColor: c.hex }}
                                        onClick={() => {
                                            voiceHighlighter.setColor(c.hex);
                                            setShowColorPicker(false);
                                        }}
                                        title={c.name}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <button 
                    className="btn-voice-ctrl btn-voice-close"
                    onClick={() => voiceHighlighter.stop()}
                    title="Close"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
