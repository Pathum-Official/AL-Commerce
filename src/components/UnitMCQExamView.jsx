import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  HelpCircle, 
  RotateCcw, 
  Award, 
  ArrowLeft, 
  ArrowRight, 
  Flag, 
  Sparkles, 
  ChevronRight,
  BookOpen,
  Check,
  AlertCircle,
  Shuffle,
  LayoutGrid,
  ChevronDown
} from 'lucide-react';
import { getUnitMCQs } from '../data/mcqQuestionBank';

// Fisher-Yates array shuffling algorithm
function shuffleArray(arr) {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Randomize both question sequence and choices positions within each question
function randomizeQuestionPaper(rawQuestions) {
  if (!rawQuestions || rawQuestions.length === 0) return [];

  // 1. Shuffle the list of questions randomly
  const shuffledQuestions = shuffleArray(rawQuestions);

  // 2. For each question, clean static prefixes and shuffle options randomly
  return shuffledQuestions.map((q, qIdx) => {
    // Clean any hardcoded "(1)", "(1 වන ප්‍රශ්නය)", or bracket prefixes like "[විෂය නිර්දේශ...]" from question text
    const cleanQuestionText = (q.question || '')
      .replace(/^\(\d+(?: වන ප්‍රශ්නය|\))\s*/, '')
      .replace(/^\[.*?\]\s*/, '')
      .trim();

    // Identify the exact correct answer text string before shuffling
    const rawOptions = q.options || [];
    const correctOptionText = rawOptions[q.correctIndex] !== undefined
      ? rawOptions[q.correctIndex]
      : rawOptions[0];

    // Clean any "(1)" or "1." from option items
    const cleanedOptions = rawOptions.map(opt => 
      typeof opt === 'string' ? opt.replace(/^(\(\d+\)|\d+\.|\([A-E]\))\s*/, '').trim() : opt
    );
    const cleanedCorrectText = typeof correctOptionText === 'string'
      ? correctOptionText.replace(/^(\(\d+\)|\d+\.|\([A-E]\))\s*/, '').trim()
      : correctOptionText;

    // Shuffle the options array
    const shuffledOptions = shuffleArray(cleanedOptions);

    // Locate the new index of the correct answer
    const newCorrectIndex = shuffledOptions.indexOf(cleanedCorrectText);

    return {
      ...q,
      id: qIdx + 1, // Normalized 1 to 50
      displayNumber: qIdx + 1,
      question: cleanQuestionText,
      options: shuffledOptions,
      correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0,
      originalTopic: q.topic || ''
    };
  });
}

export default function UnitMCQExamView({
  unit,
  subject,
  onBackToGuide
}) {
  const [mcqList, setMcqList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [qId]: optionIndex }
  const [flagged, setFlagged] = useState({}); // { [qId]: boolean }
  const [examMode, setExamMode] = useState('practice'); // 'practice' | 'exam'
  const [timeLeft, setTimeLeft] = useState(3600); // 60 mins in seconds
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reviewFilter, setReviewFilter] = useState('all'); // 'all' | 'incorrect' | 'flagged'
  const [shuffleToast, setShuffleToast] = useState(false);
  const [isPaletteOpenMobile, setIsPaletteOpenMobile] = useState(false);

  // Load & randomize questions for current unit
  const loadNewRandomPaper = () => {
    const raw = getUnitMCQs(subject.id, unit.unitNumber);
    const randomized = randomizeQuestionPaper(raw);
    setMcqList(randomized);
    setCurrentIndex(0);
    setUserAnswers({});
    setFlagged({});
    setIsSubmitted(false);
    setTimeLeft(3600);
    setShuffleToast(true);
    setTimeout(() => setShuffleToast(false), 2500);
  };

  useEffect(() => {
    loadNewRandomPaper();
  }, [unit, subject]);

  // Timer in Exam Mode
  useEffect(() => {
    if (examMode !== 'exam' || isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examMode, isSubmitted]);

  const currentQ = mcqList[currentIndex];
  if (!currentQ) return null;

  const handleSelectOption = (optIdx) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [currentQ.id]: optIdx
    }));
  };

  const handleToggleFlag = () => {
    setFlagged(prev => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id]
    }));
  };

  const calculateScore = () => {
    let score = 0;
    mcqList.forEach(q => {
      if (userAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  const totalQuestions = mcqList.length;
  const answeredCount = Object.keys(userAnswers).length;
  const score = calculateScore();
  const percentage = Math.round((score / totalQuestions) * 100);

  const getGrade = (pct) => {
    if (pct >= 85) return { grade: "A+ Distinction", color: "#10b981", sinhala: "විශිෂ්ට සාමාර්ථය" };
    if (pct >= 75) return { grade: "A Very Good", color: "#34d399", sinhala: "ඉතා හොඳ සාමාර්ථය" };
    if (pct >= 65) return { grade: "B Good", color: "#60a5fa", sinhala: "හොඳ සාමාර්ථය" };
    if (pct >= 55) return { grade: "C Credit", color: "#fbbf24", sinhala: "සම්මාන සාමාර්ථය" };
    if (pct >= 40) return { grade: "S Simple Pass", color: "#f97316", sinhala: "සාමාන්‍ය සාමාර්ථය" };
    return { grade: "W Fail", color: "#ef4444", sinhala: "නැවත පෙනී සිටින්න" };
  };

  const gradeInfo = getGrade(percentage);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleRetake = () => {
    loadNewRandomPaper();
  };

  return (
    <div className="ptm-mcq-engine">
      {/* Top Header / Mode Bar - Clean Responsive Hierarchy */}
      <div className="mcq-engine-header">
        {/* Title and Action Row */}
        <div className="mcq-title-row">
          <div className="mcq-title-left">
            <span className="unit-pill">Unit {String(unit.unitNumber).padStart(2, '0')}</span>
            <h2 className="mcq-unit-heading">{unit.title}</h2>
          </div>

          {!isSubmitted && (
            <button 
              className="btn-submit-exam"
              onClick={() => setIsSubmitted(true)}
              title="Submit exam and view detailed scoring report"
            >
              <Check size={16} /> <span>Complete & Submit</span>
            </button>
          )}
        </div>

        {/* Row 3: Mode, Timer & Shuffle Action Controls */}
        <div className="mcq-controls-row">
          {!isSubmitted && (
            <div className="mode-toggle-pill">
              <button 
                className={`mode-btn ${examMode === 'practice' ? 'active' : ''}`}
                onClick={() => setExamMode('practice')}
                title="පිළිතුර සමඟ ක්ෂණික විවරණය බලන්න"
              >
                <Sparkles size={14} /> Practice Mode
              </button>
              <button 
                className={`mode-btn ${examMode === 'exam' ? 'active' : ''}`}
                onClick={() => setExamMode('exam')}
                title="මිනිත්තු 60 ක නියමිත කාල විභාගය"
              >
                <Clock size={14} /> Timed (60m)
              </button>
            </div>
          )}

          {examMode === 'exam' && !isSubmitted && (
            <div className={`exam-timer ${timeLeft < 300 ? 'urgent' : ''}`}>
              <Clock size={15} />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}

          {/* Randomizer Shuffle Button */}
          <button 
            className="btn-shuffle-paper" 
            onClick={loadNewRandomPaper}
            title="ප්‍රශ්න සහ පිළිතුරු අහඹු ලෙස මාරු කර නව ප්‍රශ්න පත්‍රයක් ජනනය කරන්න"
          >
            <Shuffle size={14} />
            <span>Shuffle Paper</span>
          </button>
        </div>
      </div>

      {/* Shuffle Notice Toast */}
      {shuffleToast && (
        <div className="shuffle-toast-alert">
          <Shuffle size={16} className="text-emerald-400" />
          <span>ප්‍රශ්න සහ පිළිතුරු අහඹු ලෙස සාර්ථකව මාරු විය! (Questions & Options Randomized)</span>
        </div>
      )}

      {/* Active Question View */}
      {!isSubmitted && (
        <div className="mcq-layout-grid">
          {/* Main Question Card */}
          <div className="mcq-question-card">
            <div className="question-header-row">
              <div className="q-badge-group">
                <span className="q-counter-badge">
                  Question {currentIndex + 1} / {totalQuestions}
                </span>
                {currentQ.topic && (
                  <span className="q-topic-badge">{currentQ.topic}</span>
                )}
                <span className="q-random-badge hide-on-xs" title="Questions and choices are dynamically randomized">
                  <Shuffle size={11} /> Auto-Randomized
                </span>
              </div>

              <button 
                className={`btn-flag-q ${flagged[currentQ.id] ? 'active' : ''}`}
                onClick={handleToggleFlag}
                title="Flag question for review"
              >
                <Flag size={14} />
                <span>{flagged[currentQ.id] ? 'Flagged' : 'Flag'}</span>
              </button>
            </div>

            {/* Question Text - Direct, Clean Question without brackets or redundant (1) prefix */}
            <h3 className="question-text-sinhala">
              {currentQ.question}
            </h3>

            {/* 5 Options List */}
            <div className="options-stack">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = userAnswers[currentQ.id] === optIdx;
                const isCorrect = currentQ.correctIndex === optIdx;

                let optClass = 'option-item-row';
                if (isSelected) optClass += ' selected';
                if (examMode === 'practice' && userAnswers[currentQ.id] !== undefined) {
                  if (isCorrect) optClass += ' correct-answer';
                  else if (isSelected) optClass += ' wrong-answer';
                }

                return (
                  <div 
                    key={optIdx} 
                    className={optClass}
                    onClick={() => handleSelectOption(optIdx)}
                  >
                    <div className="option-marker">
                      ({optIdx + 1})
                    </div>
                    <div className="option-text">{opt}</div>
                    {examMode === 'practice' && userAnswers[currentQ.id] !== undefined && isCorrect && (
                      <CheckCircle2 size={18} className="text-emerald-400 ml-auto flex-shrink-0" />
                    )}
                    {examMode === 'practice' && userAnswers[currentQ.id] !== undefined && isSelected && !isCorrect && (
                      <XCircle size={18} className="text-red-400 ml-auto flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Practice Mode Instant Explanation (විවරණය) */}
            {examMode === 'practice' && userAnswers[currentQ.id] !== undefined && (
              <div className="practice-explanation-card">
                <div className="explanation-header">
                  <BookOpen size={16} className="text-amber-400 flex-shrink-0" />
                  <h4>ප්‍රශ්න විවරණය (Detailed Theory Explanation)</h4>
                </div>
                <p className="explanation-body">{currentQ.explanation}</p>
              </div>
            )}

            {/* Bottom Nav Buttons */}
            <div className="question-nav-footer">
              <button 
                className="btn-q-nav"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => prev - 1)}
              >
                <ArrowLeft size={16} /> Prev
              </button>

              <div className="q-progress-indicator">
                {currentIndex + 1} / {totalQuestions}
              </div>

              <button 
                className="btn-q-nav next"
                disabled={currentIndex === totalQuestions - 1}
                onClick={() => setCurrentIndex(prev => prev + 1)}
              >
                Next <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Mobile Question Palette Accordion Toggle Button */}
          <div className="mobile-palette-toggle-wrapper show-on-mobile">
            <button 
              className="btn-mobile-palette-toggle"
              onClick={() => setIsPaletteOpenMobile(prev => !prev)}
            >
              <LayoutGrid size={16} />
              <span>Question Palette ({answeredCount}/{totalQuestions} Answered)</span>
              <ChevronDown size={16} className={`chevron-toggle ${isPaletteOpenMobile ? 'open' : ''}`} />
            </button>
          </div>

          {/* Right: Question Navigation Palette (Desktop always visible, Mobile collapsible) */}
          <div className={`mcq-palette-panel ${isPaletteOpenMobile ? 'mobile-show' : 'mobile-hide'}`}>
            <h4 className="palette-title">Question Palette (1 - {totalQuestions})</h4>
            <div className="palette-stats-row">
              <span className="stat-pill answered">{answeredCount} Answered</span>
              <span className="stat-pill remaining">{totalQuestions - answeredCount} Left</span>
            </div>

            <div className="palette-grid">
              {mcqList.map((q, idx) => {
                const isAnswered = userAnswers[q.id] !== undefined;
                const isCurrent = idx === currentIndex;
                const isFlagged = flagged[q.id];

                let pillClass = 'palette-btn';
                if (isCurrent) pillClass += ' current';
                if (isAnswered) pillClass += ' answered';
                if (isFlagged) pillClass += ' flagged';

                return (
                  <button
                    key={q.id}
                    className={pillClass}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setIsPaletteOpenMobile(false); // Close drawer on selection for clean mobile UX
                    }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="palette-legend">
              <span><span className="legend-dot answered"></span> Answered</span>
              <span><span className="legend-dot flagged"></span> Flagged</span>
              <span><span className="legend-dot remaining"></span> Left</span>
            </div>
          </div>
        </div>
      )}

      {/* Submitted Results & Scorecard View */}
      {isSubmitted && (
        <div className="mcq-results-container">
          <div className="result-hero-card">
            <div className="result-badge-row">
              <span className="grade-badge" style={{ borderColor: gradeInfo.color, color: gradeInfo.color }}>
                <Award size={18} /> {gradeInfo.grade}
              </span>
              <span className="sinhala-grade">{gradeInfo.sinhala}</span>
            </div>

            <div className="result-score-circle">
              <span className="big-score">{score}</span>
              <span className="total-score">/ {totalQuestions}</span>
            </div>

            <h2 className="result-status-title">
              {percentage >= 75 ? "විශිෂ්ට සාමාර්ථයක්! විභාගයට පූර්ණ සූදානම්!" : (percentage >= 40 ? "හොඳ උත්සාහයක්! වැරදුණු ප්‍රශ්න නැවත පුහුණු වන්න." : "තවත් සිද්ධාන්ත අධ්‍යයනය කර නැවත පෙනී සිටින්න.")}
            </h2>

            <div className="result-stats-bar">
              <div className="res-stat-col">
                <span className="res-num">{percentage}%</span>
                <span className="res-label">Accuracy Score</span>
              </div>
              <div className="res-stat-col">
                <span className="res-num">{score}</span>
                <span className="res-label">Correct</span>
              </div>
              <div className="res-stat-col">
                <span className="res-num">{totalQuestions - score}</span>
                <span className="res-label">Incorrect</span>
              </div>
            </div>

            <div className="result-actions-row">
              <button className="btn-retake" onClick={handleRetake}>
                <Shuffle size={16} /> නව අහඹු ප්‍රශ්න පත්‍රයක් (New Shuffled Test)
              </button>
              <button className="btn-back-theory" onClick={onBackToGuide}>
                <BookOpen size={16} /> Back to Master Guide
              </button>
            </div>
          </div>

          {/* Full Question Review List with Explanations */}
          <div className="review-section">
            <div className="review-header-bar">
              <h3>ප්‍රශ්න විවරණ සමාලෝචනය (Detailed Review)</h3>
              <div className="review-filters">
                <button 
                  className={`btn-filter-pill ${reviewFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setReviewFilter('all')}
                >
                  All ({totalQuestions})
                </button>
                <button 
                  className={`btn-filter-pill ${reviewFilter === 'incorrect' ? 'active' : ''}`}
                  onClick={() => setReviewFilter('incorrect')}
                >
                  Incorrect ({totalQuestions - score})
                </button>
              </div>
            </div>

            <div className="review-questions-list">
              {mcqList
                .filter(q => {
                  if (reviewFilter === 'incorrect') return userAnswers[q.id] !== q.correctIndex;
                  return true;
                })
                .map((q, qIdx) => {
                  const userChoice = userAnswers[q.id];
                  const isCorrect = userChoice === q.correctIndex;

                  return (
                    <div key={qIdx} className={`review-card ${isCorrect ? 'is-correct' : 'is-wrong'}`}>
                      <div className="review-card-top">
                        <span className="review-q-num">Q{q.displayNumber || q.id}.</span>
                        <h4 className="review-q-text">{q.question}</h4>
                        <span className={`status-pill ${isCorrect ? 'correct' : 'wrong'}`}>
                          {isCorrect ? 'Correct (+1)' : 'Incorrect (0)'}
                        </span>
                      </div>

                      <div className="review-options">
                        {q.options.map((opt, optIdx) => {
                          const isUserSelected = userChoice === optIdx;
                          const isAnswer = q.correctIndex === optIdx;

                          let cls = 'review-opt';
                          if (isAnswer) cls += ' correct-opt';
                          if (isUserSelected && !isAnswer) cls += ' wrong-user-opt';

                          return (
                            <div key={optIdx} className={cls}>
                              <span className="opt-letter">({optIdx + 1})</span>
                              <span>{opt}</span>
                              {isAnswer && <span className="answer-tag">✓ නිවැරදි</span>}
                              {isUserSelected && !isAnswer && <span className="user-tag">✗ ඔබ තේරූ</span>}
                            </div>
                          );
                        })}
                      </div>

                      {/* Detailed Sinhala Analysis */}
                      <div className="review-explanation-box">
                        <div className="exp-title">
                          <BookOpen size={15} className="text-amber-400" />
                          <span>විවරණය (Theory Explanation):</span>
                        </div>
                        <p className="exp-text">{q.explanation}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
