import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Lightbulb, 
  Layers, 
  HelpCircle, 
  FileCheck, 
  Upload, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft, 
  RotateCw, 
  Sparkles, 
  Award, 
  Download, 
  FileText 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../services/audioEngine';
import { evaluateCommerceAnswer } from '../services/geminiService';

export default function LevelModal({ 
  level, 
  subject, 
  onClose, 
  onCompleteLevel 
}) {
  const [currentStep, setCurrentStep] = useState(1); // 1: Story, 2: Theory, 3: Flashcards, 4: MCQ, 5: AI Evaluator

  // Flashcards state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // MCQ state
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);

  // AI Evaluator state
  const [inputMode, setInputMode] = useState('text'); // 'text' | 'image'
  const [typedAnswer, setTypedAnswer] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [evalError, setEvalError] = useState('');

  if (!level) return null;

  const story = level.story || {};
  const theory = level.theory || {};
  const flashcards = level.flashcards || [];
  const mcqs = level.mcqs || [];
  const currentMcq = mcqs[0];
  const evalQ = level.evaluatorQuestion || {};

  // Handlers for Flashcards
  const handleFlipCard = () => {
    sound.playFlip();
    setIsFlipped(!isFlipped);
  };

  const handleNextCard = () => {
    sound.playClick();
    setIsFlipped(false);
    setCardIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevCard = () => {
    sound.playClick();
    setIsFlipped(false);
    setCardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  // Handlers for MCQ
  const handleSelectOption = (idx) => {
    if (isAnswerSubmitted) return;
    sound.playClick();
    setSelectedOption(idx);
    setIsAnswerSubmitted(true);
    if (idx === currentMcq.correct) {
      sound.playSuccess();
    } else {
      sound.playError();
    }
  };

  // Handlers for Image Upload (Handwritten work)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle AI Paper Evaluation
  const handleRunEvaluation = async () => {
    if (inputMode === 'text' && !typedAnswer.trim()) {
      setEvalError("කරුණාකර ඔබගේ පිළිතුර ලියා ඇතුළත් කරන්න.");
      return;
    }
    if (inputMode === 'image' && !imagePreview) {
      setEvalError("කරුණාකර ඔබගේ අත්අකුරු පිළිතුරු පත්‍රයේ ඡායාරූපයක් එක් කරන්න.");
      return;
    }

    setEvalError('');
    setIsEvaluating(true);
    sound.playClick();

    try {
      let handwrittenData = null;
      if (inputMode === 'image' && imagePreview) {
        // Strip data:image/jpeg;base64, prefix
        const base64Data = imagePreview.split(',')[1];
        const mimeType = imageFile?.type || 'image/jpeg';
        handwrittenData = { mimeType, data: base64Data };
      }

      const result = await evaluateCommerceAnswer({
        subject: subject.name,
        levelTitle: level.title,
        question: evalQ.question,
        studentAnswer: typedAnswer,
        handwrittenImage: handwrittenData,
        rubric: evalQ.rubricGuide
      });

      setEvalResult(result);
      sound.playSuccess();

      // Trigger Confetti if passed!
      if (result.passed) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      setEvalError(err.message || "ඇගයීමේ දෝෂයක් මතු විය. නැවත උත්සාහ කරන්න.");
      sound.playError();
    } finally {
      setIsEvaluating(false);
    }
  };

  // Level Clear Handler
  const handleFinishLevel = () => {
    sound.playLevelUp();
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 }
    });
    const earnedStars = evalResult?.score >= 8 ? 3 : evalResult?.score >= 5 ? 2 : 1;
    onCompleteLevel(level.id, earnedStars);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="portal-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: subject.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff' }}>
              {level.number}
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                {level.title}
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                {subject.name} • {level.tag}
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* 5-Step Navigation Tabs */}
        <div className="modal-steps-nav">
          <button 
            onClick={() => { sound.playClick(); setCurrentStep(1); }} 
            className={`step-tab ${currentStep === 1 ? 'active' : ''}`}
          >
            <Lightbulb size={16} />
            <span>1. සරල කතාව</span>
          </button>

          <button 
            onClick={() => { sound.playClick(); setCurrentStep(2); }} 
            className={`step-tab ${currentStep === 2 ? 'active' : ''}`}
          >
            <BookOpen size={16} />
            <span>2. මූලික සටහන්</span>
          </button>

          <button 
            onClick={() => { sound.playClick(); setCurrentStep(3); }} 
            className={`step-tab ${currentStep === 3 ? 'active' : ''}`}
          >
            <Layers size={16} />
            <span>3. ස්මෘති කාඩ්පත්</span>
          </button>

          <button 
            onClick={() => { sound.playClick(); setCurrentStep(4); }} 
            className={`step-tab ${currentStep === 4 ? 'active' : ''}`}
          >
            <HelpCircle size={16} />
            <span>4. පෙරහුරු MCQ</span>
          </button>

          <button 
            onClick={() => { sound.playClick(); setCurrentStep(5); }} 
            className={`step-tab ${currentStep === 5 ? 'active' : ''}`}
            style={currentStep === 5 ? { background: 'linear-gradient(135deg, #6366f1, #ec4899)', color: '#fff' } : {}}
          >
            <FileCheck size={16} />
            <span>5. AI සජීවී ඇගයීම</span>
          </button>
        </div>

        {/* Modal Step Content */}
        <div className="modal-content-body">
          {/* STEP 1: Story / Intuition */}
          {currentStep === 1 && (
            <div style={{ maxWidth: '720px', margin: '0 auto' }}>
              <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px', borderColor: 'rgba(99, 102, 241, 0.4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818cf8', marginBottom: '12px', fontWeight: 700 }}>
                  <Sparkles size={18} />
                  <span>එදිනෙදා ජීවිතයෙන් තේරුම් ගනිමු</span>
                </div>
                <h4 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '14px', fontFamily: 'var(--font-sinhala)' }}>
                  {story.analogy}
                </h4>
                <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.8, fontFamily: 'var(--font-sinhala)' }}>
                  {story.content}
                </p>
              </div>

              {story.whyItMatters && (
                <div className="glass-panel" style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                  <h5 style={{ color: '#34d399', fontWeight: 700, marginBottom: '6px', fontSize: '0.95rem' }}>
                    💡 ඇයි අපි මේක විභාගයට ඉගෙන ගන්නේ?
                  </h5>
                  <p style={{ color: '#e2e8f0', fontSize: '0.9rem', lineHeight: 1.6, fontFamily: 'var(--font-sinhala)' }}>
                    {story.whyItMatters}
                  </p>
                </div>
              )}

              <div style={{ textAlign: 'right', marginTop: '28px' }}>
                <button onClick={() => { sound.playClick(); setCurrentStep(2); }} className="btn-primary">
                  <span>ඊළඟට: මූලික සටහන් බලමු</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Theory & Key Notes */}
          {currentStep === 2 && (
            <div style={{ maxWidth: '760px', margin: '0 auto' }}>
              <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '1.2rem', color: '#fff' }}>
                  {theory.summary}
                </h4>
                {theory.downloadUrl && (
                  <a 
                    href={theory.downloadUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="hud-btn"
                    style={{ textDecoration: 'none' }}
                  >
                    <Download size={15} />
                    <span>නිබන්ධනය (PDF) බාගත කරන්න</span>
                  </a>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {theory.keyPoints?.map((item, idx) => (
                  <div key={idx} className="glass-panel" style={{ padding: '18px 22px' }}>
                    <h5 style={{ color: subject.color, fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>
                      {item.term}
                    </h5>
                    <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.65, fontFamily: 'var(--font-sinhala)' }}>
                      {item.definition}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
                <button onClick={() => { sound.playClick(); setCurrentStep(1); }} className="hud-btn">
                  <ChevronLeft size={18} />
                  <span>කලින් පිටුව</span>
                </button>
                <button onClick={() => { sound.playClick(); setCurrentStep(3); }} className="btn-primary">
                  <span>ඊළඟට: ස්මෘති කාඩ්පත් පුහුණුව</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: 3D Flashcards */}
          {currentStep === 3 && (
            <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '10px' }}>
                කාඩ්පත මත ක්ලික් කර පිළිතුර පෙරළා බලන්න ({cardIndex + 1} / {flashcards.length})
              </p>

              {flashcards.length > 0 && (
                <div className="flashcard-stage" onClick={handleFlipCard}>
                  <div className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`}>
                    {/* Front */}
                    <div className="flashcard-face flashcard-front">
                      <span style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                        ප්‍රශ්නය / සංකල්පය
                      </span>
                      <h4 style={{ fontSize: '1.25rem', color: '#fff', fontFamily: 'var(--font-sinhala)', lineHeight: 1.6 }}>
                        {flashcards[cardIndex]?.q}
                      </h4>
                      <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.8rem' }}>
                        <RotateCw size={14} />
                        <span>පිළිතුර බැලීමට ක්ලික් කරන්න</span>
                      </div>
                    </div>

                    {/* Back */}
                    <div className="flashcard-face flashcard-back">
                      <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                        නිවැරදි පිළිතුර / විවරණය
                      </span>
                      <p style={{ fontSize: '1.15rem', color: '#f8fafc', fontFamily: 'var(--font-sinhala)', lineHeight: 1.6 }}>
                        {flashcards[cardIndex]?.a}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Flashcard Controls */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '20px' }}>
                <button onClick={handlePrevCard} className="hud-btn">
                  <ChevronLeft size={18} />
                  <span>කලින් කාඩ්පත</span>
                </button>
                <button onClick={handleFlipCard} className="hud-btn">
                  <RotateCw size={16} />
                  <span>පෙරළන්න</span>
                </button>
                <button onClick={handleNextCard} className="hud-btn">
                  <span>ඊළඟ කාඩ්පත</span>
                  <ChevronRight size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '34px' }}>
                <button onClick={() => { sound.playClick(); setCurrentStep(2); }} className="hud-btn">
                  <ChevronLeft size={18} />
                  <span>මූලික සටහන්</span>
                </button>
                <button onClick={() => { sound.playClick(); setCurrentStep(4); }} className="btn-primary">
                  <span>ඊළඟට: පෙරහුරු MCQ</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Interactive MCQ Drill */}
          {currentStep === 4 && (
            <div style={{ maxWidth: '720px', margin: '0 auto' }}>
              {currentMcq ? (
                <div>
                  <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', marginBottom: '10px', fontSize: '0.85rem', fontWeight: 700 }}>
                      <HelpCircle size={16} />
                      <span>පසුගිය විභාග බහුවරණ ආකෘතිය</span>
                    </div>
                    <h4 style={{ fontSize: '1.15rem', color: '#fff', fontFamily: 'var(--font-sinhala)', lineHeight: 1.6 }}>
                      {currentMcq.question}
                    </h4>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {currentMcq.options.map((opt, idx) => {
                      let btnClass = 'mcq-option-btn';
                      if (isAnswerSubmitted) {
                        if (idx === currentMcq.correct) btnClass += ' correct';
                        else if (selectedOption === idx) btnClass += ' wrong';
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectOption(idx)}
                          disabled={isAnswerSubmitted}
                          className={btnClass}
                        >
                          <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800 }}>
                            {['A', 'B', 'C', 'D'][idx]}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Rationale / විවරණය */}
                  {isAnswerSubmitted && (
                    <div className="glass-panel" style={{ marginTop: '20px', padding: '20px', background: selectedOption === currentMcq.correct ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)', borderColor: selectedOption === currentMcq.correct ? '#10b981' : '#ef4444' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: selectedOption === currentMcq.correct ? '#34d399' : '#f87171', fontWeight: 700, marginBottom: '8px' }}>
                        {selectedOption === currentMcq.correct ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span>{selectedOption === currentMcq.correct ? 'විශිෂ්ටයි! පිළිතුර නිවැරදියි.' : 'පිළිතුර වැරදියි. විවරණය බලන්න.'}</span>
                      </div>
                      <p style={{ color: '#e2e8f0', fontSize: '0.9rem', lineHeight: 1.6, fontFamily: 'var(--font-sinhala)' }}>
                        <strong>විවරණය:</strong> {currentMcq.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: '#94a3b8' }}>මෙම කොටස සඳහා MCQ ප්‍රශ්න සූදානම් වෙමින් පවතී.</p>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
                <button onClick={() => { sound.playClick(); setCurrentStep(3); }} className="hud-btn">
                  <ChevronLeft size={18} />
                  <span>ස්මෘති කාඩ්පත්</span>
                </button>
                <button onClick={() => { sound.playClick(); setCurrentStep(5); }} className="btn-primary">
                  <span>ඊළඟට: AI සජීවී ඇගයීම</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: AI Live Examiner & Marking Simulator */}
          {currentStep === 5 && (
            <div style={{ maxWidth: '780px', margin: '0 auto' }}>
              {/* Question Capsule */}
              <div className="glass-panel" style={{ padding: '22px', marginBottom: '20px', borderColor: 'rgba(236, 72, 153, 0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#f472b6', fontWeight: 800 }}>
                    {evalQ.examYear || 'G.C.E. A/L Structured Question'}
                  </span>
                  <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px' }}>
                    ලකුණු 10
                  </span>
                </div>
                <h4 style={{ fontSize: '1.05rem', color: '#fff', fontFamily: 'var(--font-sinhala)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                  {evalQ.question}
                </h4>
              </div>

              {/* Submission Mode Selector */}
              <div className="evaluator-input-tabs">
                <button 
                  onClick={() => { sound.playClick(); setInputMode('text'); }}
                  className={`eval-tab-btn ${inputMode === 'text' ? 'active' : ''}`}
                >
                  <FileText size={16} />
                  <span>පෙළ මගින් ලියන්න (Type Answer)</span>
                </button>

                <button 
                  onClick={() => { sound.playClick(); setInputMode('image'); }}
                  className={`eval-tab-btn ${inputMode === 'image' ? 'active' : ''}`}
                >
                  <ImageIcon size={16} />
                  <span>අත්අකුරු කොළයේ ඡායාරූපයක් එක් කරන්න (Handwritten Upload)</span>
                </button>
              </div>

              {/* Mode 1: Text Input */}
              {inputMode === 'text' && (
                <textarea
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  placeholder="ඔබගේ සම්පූර්ණ පිළිතුර මෙහි ටයිප් කරන්න... (සිංහලෙන් හෝ ඉංග්‍රීසියෙන්)"
                  className="eval-textarea"
                />
              )}

              {/* Mode 2: Photo Upload */}
              {inputMode === 'image' && (
                <div>
                  <label className="file-dropzone" style={{ display: 'block' }}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      style={{ display: 'none' }} 
                    />
                    {imagePreview ? (
                      <div>
                        <img 
                          src={imagePreview} 
                          alt="Handwritten Answer" 
                          style={{ maxHeight: '200px', borderRadius: '8px', margin: '0 auto 10px', display: 'block' }} 
                        />
                        <span style={{ color: '#34d399', fontSize: '0.85rem' }}>✓ ඡායාරූපය සාර්ථකව තෝරා ගන්නා ලදී. වෙනස් කිරීමට ක්ලික් කරන්න.</span>
                      </div>
                    ) : (
                      <div>
                        <Upload size={32} color="#818cf8" style={{ margin: '0 auto 10px' }} />
                        <h5 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '4px' }}>
                          ඔබ අතින් ලියූ පිළිතුරු පත්‍රයේ ඡායාරූපය මෙතැනට Drag කරන්න හෝ තෝරන්න
                        </h5>
                        <p style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                          JPG, PNG සහාය දක්වයි • Gemini Multimodal Vision මගින් කියවනු ලැබේ
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              )}

              {evalError && (
                <div style={{ color: '#f87171', fontSize: '0.85rem', marginTop: '10px' }}>
                  {evalError}
                </div>
              )}

              {/* Grade with AI Button */}
              <div style={{ marginTop: '18px', textAlign: 'center' }}>
                <button
                  onClick={handleRunEvaluation}
                  disabled={isEvaluating}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
                >
                  {isEvaluating ? (
                    <>
                      <Sparkles size={18} className="animate-spin" />
                      <span>විභාග දෙපාර්තමේන්තු ලකුණු දීමේ පටිපාටිය අනුව පරීක්ෂා කරමින් පවතී...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck size={18} />
                      <span>AI ප්‍රධාන පරීක්ෂක මගින් ලකුණු ලබා ගන්න (Grade Answer)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Evaluation Result Report Card */}
              {evalResult && (
                <div className="glass-panel" style={{ marginTop: '24px', padding: '24px', borderColor: evalResult.passed ? '#10b981' : '#f59e0b' }}>
                  {/* Score & Grade Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>ලබාගත් ලකුණු ප්‍රමාණය:</span>
                      <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff' }}>
                        {evalResult.score} / {evalResult.maxScore || 10}
                      </div>
                    </div>
                    <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: evalResult.passed ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900, color: '#fff', boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)' }}>
                      {evalResult.grade || 'A'}
                    </div>
                  </div>

                  <p style={{ color: '#e2e8f0', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '18px', fontFamily: 'var(--font-sinhala)' }}>
                    {evalResult.feedbackSummary}
                  </p>

                  {/* Rubric Breakdown */}
                  {evalResult.rubricChecklist?.length > 0 && (
                    <div style={{ marginBottom: '18px' }}>
                      <h5 style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px' }}>
                        ලකුණු ලැබුණු ආකාරය (Marking Scheme Checklist)
                      </h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {evalResult.rubricChecklist.map((r, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {r.status === 'pass' ? <CheckCircle2 size={16} color="#34d399" /> : <AlertCircle size={16} color="#fbbf24" />}
                              <span style={{ color: '#fff', fontFamily: 'var(--font-sinhala)' }}>{r.criterion}</span>
                            </div>
                            <span style={{ fontWeight: 800, color: '#818cf8' }}>
                              {r.earned} / {r.max}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Points */}
                  {evalResult.missingPoints?.length > 0 && (
                    <div style={{ marginBottom: '18px', background: 'rgba(239, 68, 68, 0.08)', padding: '14px', borderRadius: '10px' }}>
                      <h5 style={{ color: '#f87171', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                        ⚠️ අඩුපාඩු සහ අතපසු වූ කරුණු:
                      </h5>
                      <ul style={{ paddingLeft: '20px', color: '#fca5a5', fontSize: '0.88rem', lineHeight: 1.6, fontFamily: 'var(--font-sinhala)' }}>
                        {evalResult.missingPoints.map((mp, idx) => (
                          <li key={idx}>{mp}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Model Answer */}
                  {evalResult.modelAnswer && (
                    <div style={{ marginBottom: '18px', background: 'rgba(99, 102, 241, 0.08)', padding: '14px', borderRadius: '10px' }}>
                      <h5 style={{ color: '#818cf8', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                        ⭐ පූර්ණ ආදර්ශ පිළිතුර (Model Answer):
                      </h5>
                      <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.7, whiteSpace: 'pre-line', fontFamily: 'var(--font-sinhala)' }}>
                        {evalResult.modelAnswer}
                      </p>
                    </div>
                  )}

                  {/* Pro Exam Tip */}
                  {evalResult.proExamTip && (
                    <div style={{ color: '#38bdf8', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '20px' }}>
                      📌 <strong>විභාග උපදෙස:</strong> {evalResult.proExamTip}
                    </div>
                  )}

                  {/* Level Clear Action */}
                  <div style={{ textAlign: 'center' }}>
                    <button
                      onClick={handleFinishLevel}
                      className="btn-primary"
                      style={{ background: 'linear-gradient(135deg, #10b981, #059669)', width: '100%', justifyContent: 'center' }}
                    >
                      <Award size={20} />
                      <span>මට්ටම සාර්ථකව අවසන් කර ඉදිරියට යන්න! (Claim Stars & Advance)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
