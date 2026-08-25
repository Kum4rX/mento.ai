import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  HelpCircle, 
  Award, 
  RotateCcw, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Loader2,
  GraduationCap
} from 'lucide-react';
import { api } from '@/utils/api';

interface Question {
  id: string;
  type: 'mcq' | 'short_answer';
  question: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  studentAnswer?: string;
  isCorrect?: 'correct' | 'partially_correct' | 'incorrect' | 'unanswered';
  score?: number;
  feedback?: string;
}

interface AssessmentResult {
  _id: string;
  subject: string;
  topic: string;
  scoreAchieved: number;
  totalPossibleScore: number;
  percentageScore: number;
  masteryStatus: 'In Progress' | 'Proficient' | 'Mastered';
  strengths: string[];
  needsPractice: string[];
  questions: Question[];
  completedAt: string;
}

export default function Assessment() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  const subject = searchParams.get('subject') || 'Physics';
  const topic = searchParams.get('topic') || 'Laws of Motion';
  const sessionId = searchParams.get('sessionId') || '';
  const existingAssessmentId = searchParams.get('id') || '';

  const [loading, setLoading] = useState(true);
  const [assessmentId, setAssessmentId] = useState<string | null>(existingAssessmentId || null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize or fetch assessment
  useEffect(() => {
    const initAssessment = async () => {
      try {
        setLoading(true);
        setError(null);

        if (existingAssessmentId) {
          // Fetch existing assessment review
          const res = await api.get(`/assessments/${existingAssessmentId}`);
          if (res.data?.data) {
            setResult(res.data.data);
            setQuestions(res.data.data.questions || []);
            setAssessmentId(res.data.data._id);
          }
        } else {
          // Generate new assessment
          const res = await api.post('/assessments/generate', {
            subject,
            topic,
            sessionId: sessionId || null
          });

          if (res.data?.data) {
            setAssessmentId(res.data.data._id);
            setQuestions(res.data.data.questions || []);
          }
        }
      } catch (err: any) {
        console.error('Error initializing assessment:', err);
        setError(err.response?.data?.message || 'Failed to initialize assessment. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initAssessment();
  }, [existingAssessmentId, subject, topic, sessionId]);

  const handleSelectOption = (qId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleTextChange = (qId: string, text: string) => {
    setAnswers(prev => ({ ...prev, [qId]: text }));
  };

  const handleSubmitAssessment = async () => {
    if (!assessmentId) return;

    try {
      setSubmitting(true);
      setError(null);

      const res = await api.post(`/assessments/${assessmentId}/submit`, {
        answers
      });

      if (res.data?.data) {
        setResult(res.data.data);
        setQuestions(res.data.data.questions || []);
      }
    } catch (err: any) {
      console.error('Error submitting assessment:', err);
      setError(err.response?.data?.message || 'Failed to submit assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 bg-gradient-to-br from-mentor-surface via-background to-mentor-surface">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-5 max-w-md p-8 rounded-3xl glass border border-border/50 shadow-xl"
        >
          <div className="relative mx-auto w-16 h-16">
            <Loader2 className="w-16 h-16 animate-spin text-mentor-primary" />
            <div className="absolute inset-0 bg-gradient-to-r from-mentor-primary to-mentor-secondary rounded-full blur opacity-30"></div>
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mentor-primary/10 text-mentor-primary text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Knowledge Check</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">Generating Assessment</h2>
            <p className="text-sm text-muted-foreground">
              Creating 5 adaptive questions for <strong className="text-foreground">{subject}</strong>: <span className="text-mentor-primary">{topic}</span>.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center space-y-4 glass border-border/50">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <h2 className="text-xl font-bold text-foreground">Assessment Unavailable</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={() => navigate('/dashboard')} className="rounded-full">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  // RESULTS VIEW
  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mentor-surface via-background to-mentor-surface p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Summary */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 sm:p-8 rounded-3xl glass border border-border/50 shadow-sm text-center space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-mentor-primary/10 text-mentor-primary text-xs font-semibold">
              <Award className="w-4 h-4" />
              <span>Knowledge Verification Complete</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Assessment Results 🎉
            </h1>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              You tested your understanding on <strong className="text-foreground">{result.subject}</strong>: <span className="text-mentor-primary">{result.topic}</span>.
            </p>

            {/* Score & Mastery Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <div className="px-6 py-4 rounded-2xl bg-card border border-border/50 shadow-sm flex items-center gap-3">
                <span className="text-3xl font-extrabold text-foreground">{result.scoreAchieved} / {result.totalPossibleScore}</span>
                <Badge className={`text-sm px-3 py-1 font-bold ${
                  result.percentageScore >= 85 
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30' 
                    : result.percentageScore >= 60
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                }`}>
                  {result.percentageScore}% Score
                </Badge>
              </div>

              <div className="px-6 py-4 rounded-2xl bg-card border border-border/50 shadow-sm flex items-center gap-2.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Topic Mastery:</span>
                <Badge className={`text-sm px-3 py-1 font-bold ${
                  result.masteryStatus === 'Mastered'
                    ? 'bg-green-500 text-white'
                    : result.masteryStatus === 'Proficient'
                    ? 'bg-blue-500 text-white'
                    : 'bg-amber-500 text-white'
                }`}>
                  {result.masteryStatus}
                </Badge>
              </div>
            </div>
          </motion.div>

          {/* Strengths & Needs Practice Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card className="glass border-border/40 rounded-3xl shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <CardTitle className="text-lg">Key Strengths Demonstrated</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {result.strengths && result.strengths.length > 0 ? (
                  result.strengths.map((str, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-foreground p-3 rounded-xl bg-green-500/5 border border-green-500/20">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic">Keep practicing to build your core strengths.</p>
                )}
              </CardContent>
            </Card>

            {/* Needs Practice */}
            <Card className="glass border-border/40 rounded-3xl shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-5 h-5" />
                  <CardTitle className="text-lg">Recommended Areas for Practice</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {result.needsPractice && result.needsPractice.length > 0 ? (
                  result.needsPractice.map((np, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-foreground p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>{np}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-2 text-xs text-green-600 p-3 rounded-xl bg-green-500/5 border border-green-500/20">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Flawless understanding! Ready for advanced topics.</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowReview(!showReview)}
              className="rounded-full px-6 border-border/80"
            >
              {showReview ? 'Hide Answers' : 'Review All 5 Questions'}
              {showReview ? <ChevronUp className="w-4 h-4 ml-1.5" /> : <ChevronDown className="w-4 h-4 ml-1.5" />}
            </Button>
            <Button
              onClick={() => navigate(`/session?subject=${encodeURIComponent(result.subject)}&topic=${encodeURIComponent(result.topic)}`)}
              className="rounded-full px-6 bg-gradient-to-r from-mentor-primary to-mentor-secondary text-white font-semibold shadow-md"
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              Continue Learning Topic
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="rounded-full px-5"
            >
              Back to Dashboard
            </Button>
          </div>

          {/* Question Review Breakdown */}
          {showReview && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 pt-4"
            >
              <h3 className="text-xl font-bold text-foreground">Detailed Question Review</h3>
              {result.questions.map((q, idx) => (
                <Card key={q.id || idx} className="glass border-border/50 rounded-2xl overflow-hidden shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-xs font-semibold">
                        Q{idx + 1} • {q.type === 'mcq' ? 'Multiple Choice' : 'Conceptual'}
                      </Badge>
                      <Badge className={`text-xs ${
                        q.isCorrect === 'correct'
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30'
                          : q.isCorrect === 'partially_correct'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
                      }`}>
                        {q.score} / 2 pts ({q.isCorrect?.replace('_', ' ')})
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-semibold text-foreground pt-1.5">
                      {q.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-2 text-xs">
                    <div className="p-3 rounded-xl bg-card border border-border/40 space-y-1">
                      <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Your Answer:</p>
                      <p className="text-foreground font-medium">{q.studentAnswer || '(No answer provided)'}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/40 border border-border/40 space-y-1">
                      <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Correct / Model Answer:</p>
                      <p className="text-foreground font-medium">{q.correctAnswer}</p>
                    </div>

                    {q.feedback && (
                      <div className="p-3 rounded-xl bg-mentor-primary/5 border border-mentor-primary/20 text-mentor-primary space-y-0.5">
                        <p className="font-bold text-[10px] uppercase tracking-wider">AI Tutor Feedback:</p>
                        <p className="text-foreground">{q.feedback}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // ACTIVE QUESTION TEST VIEW
  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  const currentAnswer = answers[currentQ.id] || '';
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-mentor-surface via-background to-mentor-surface p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Header & Progress */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="text-xs rounded-full gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Exit
          </Button>

          <div className="text-center space-y-0.5">
            <span className="text-xs font-bold text-mentor-primary">{subject}</span>
            <h2 className="text-sm font-semibold text-foreground line-clamp-1">{topic}</h2>
          </div>

          <Badge variant="outline" className="text-xs font-bold">
            Question {currentIndex + 1} of {questions.length}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <Progress value={progressPercent} className="h-2 rounded-full" />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass border-border/50 rounded-3xl shadow-sm overflow-hidden">
              <CardHeader className="pb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mentor-primary/10 text-mentor-primary text-xs font-semibold w-fit mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{currentQ.type === 'mcq' ? 'Multiple Choice' : 'Conceptual Understanding'}</span>
                </div>
                <CardTitle className="text-lg sm:text-xl font-bold text-foreground leading-snug">
                  {currentQ.question}
                </CardTitle>
                <CardDescription>
                  {currentQ.type === 'mcq' ? 'Select the single best option.' : 'Explain concisely in your own words (1-3 sentences).'}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-2">
                {currentQ.type === 'mcq' && currentQ.options && (
                  <div className="space-y-3">
                    {currentQ.options.map((option, optIdx) => {
                      const isSelected = currentAnswer === option;
                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleSelectOption(currentQ.id, option)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-sm font-medium ${
                            isSelected
                              ? 'bg-mentor-primary/10 border-mentor-primary text-mentor-primary shadow-sm font-bold'
                              : 'bg-card border-border/60 hover:border-mentor-primary/40 hover:bg-muted/40 text-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                              isSelected ? 'bg-mentor-primary text-white' : 'bg-muted text-muted-foreground'
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{option}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-mentor-primary" />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {currentQ.type === 'short_answer' && (
                  <div className="space-y-2">
                    <Textarea
                      rows={4}
                      value={currentAnswer}
                      onChange={(e) => handleTextChange(currentQ.id, e.target.value)}
                      placeholder="Type your explanation here..."
                      className="rounded-2xl border-border/60 p-4 text-sm bg-card resize-none focus-visible:ring-mentor-primary"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Tip: Include key scientific/mathematical principles or real-world mechanisms in your explanation.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Bar */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button
            variant="outline"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            className="rounded-full px-5 border-border/80"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Previous
          </Button>

          {currentIndex < questions.length - 1 ? (
            <Button
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              className="rounded-full px-6 bg-gradient-to-r from-mentor-primary to-mentor-secondary text-white font-semibold shadow-md"
            >
              Next Question
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          ) : (
            <Button
              disabled={submitting}
              onClick={handleSubmitAssessment}
              className="rounded-full px-7 bg-gradient-to-r from-mentor-primary to-mentor-secondary hover:opacity-95 text-white font-bold shadow-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Grading with AI...
                </>
              ) : (
                <>
                  Submit Assessment
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
