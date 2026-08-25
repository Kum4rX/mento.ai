import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  AlertCircle, 
  Loader2, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  BookOpen, 
  Lightbulb, 
  Target,
  Clock,
  Sparkles,
  HelpCircle,
  GraduationCap,
  MessageSquareQuote,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { useTavus } from '@/contexts/TavusContext';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import { tavusService } from '@/services/tavusService';
import { api } from '@/utils/api';

export default function Session() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const conversationUrl = searchParams.get('url');
  
  // Intelligent Learning Context parameters
  const subject = searchParams.get('subject') || 'General Science';
  const topic = searchParams.get('topic') || 'Concept Exploration';
  const goal = searchParams.get('goal') || '';

  const { createConversation, clearError } = useTavus();
  const { user } = useAuth();

  const [loading, setLoading] = useState(!conversationUrl);
  const [error, setError] = useState<string | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Live Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Clear any existing errors when component mounts
  useEffect(() => {
    clearError();
    return () => {
      clearError();
    };
  }, [clearError]);

  // Initialize Conversation with Intelligent Context
  useEffect(() => {
    const initConversation = async () => {
      if (conversationUrl) return;
      
      try {
        setLoading(true);
        setError(null);

        // 1. Create Tavus conversation with pedagogical context
        const response = await createConversation({
          subject,
          topic,
          customGoal: goal
        });

        const newUrl = response.conversation_url;
        const newId = response.conversation_id;

        // 2. Record Session in MongoDB
        try {
          const sessionStartRes = await api.post('/sessions/start', {
            subject,
            topic,
            customGoal: goal,
            conversationId: newId
          });
          if (sessionStartRes.data?.data?._id) {
            setActiveSessionId(sessionStartRes.data.data._id);
          }
        } catch (dbErr) {
          console.warn('Could not record session in database:', dbErr);
        }

        const params = new URLSearchParams(location.search);
        params.set('url', newUrl);
        navigate(`/session?${params.toString()}`, { replace: true });
      } catch (err) {
        console.error('Failed to start contextual conversation:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize video session. Please try again.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    initConversation();
  }, [conversationUrl, createConversation, navigate, subject, topic, goal, location.search]);

  const handleEndSession = async () => {
    clearError();
    setError(null);

    // Complete session in MongoDB
    if (activeSessionId) {
      try {
        await api.post(`/sessions/${activeSessionId}/end`, {
          durationSeconds: elapsedSeconds
        });
      } catch (err) {
        console.warn('Could not complete session record in DB:', err);
      }
    }

    try {
      let conversationId = null;
      if (conversationUrl) {
        const match = conversationUrl.match(/([a-zA-Z0-9]+)$/);
        if (match) {
          conversationId = match[1];
        }
      }
      if (conversationId) {
        await tavusService.endConversation(conversationId);
      }
    } catch (err) {
      console.error('Failed to end session on backend:', err);
    }

    navigate('/dashboard');
  };

  const handleReturnHome = () => {
    clearError();
    setError(null);
    navigate('/dashboard');
  };

  // Suggested doubts to ask the AI tutor
  const doubtSuggestions = [
    `Can you give me an intuitive real-world analogy for ${topic}?`,
    `What are the most common misconceptions students have about this?`,
    `Can we solve a step-by-step example problem together?`,
    `How does ${topic} connect to practical applications?`
  ];

  if (loading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-mentor-surface p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-md p-8 rounded-3xl glass border border-border/50 shadow-xl"
        >
          <div className="relative mx-auto w-16 h-16">
            <Loader2 className="w-16 h-16 animate-spin text-mentor-primary" />
            <div className="absolute inset-0 bg-gradient-to-r from-mentor-primary to-mentor-secondary rounded-full blur opacity-30"></div>
          </div>
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mentor-primary/10 text-mentor-primary text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Configuring Learning Context</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Preparing Your AI Tutor
            </h2>
            <p className="text-sm text-muted-foreground">
              Connecting teacher replica for <strong className="text-foreground">{subject}</strong>: <span className="text-mentor-primary">{topic}</span>.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border/40 text-xs text-muted-foreground flex items-center justify-center gap-2">
            <GraduationCap className="w-4 h-4 text-mentor-primary" />
            <span>Personalized for {user?.name || 'Student'}</span>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error || !conversationUrl) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-mentor-surface p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg"
        >
          <Alert variant="destructive" className="relative overflow-hidden rounded-3xl p-6 sm:p-8 shadow-xl border-destructive/30">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-destructive/10 text-destructive flex-shrink-0">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="space-y-2 flex-1">
                <AlertTitle className="text-xl font-bold">Session Notice</AlertTitle>
                <AlertDescription className="text-sm leading-relaxed">
                  {error || 'Unable to connect to the live video stream. Third-party Tavus conversation API credits may be temporarily exhausted, but your contextual learning module is ready.'}
                </AlertDescription>
                
                {/* Context Recap */}
                <div className="mt-4 p-3 rounded-xl bg-destructive/5 border border-destructive/20 text-xs space-y-1">
                  <p><strong>Configured Subject:</strong> {subject}</p>
                  <p><strong>Configured Topic:</strong> {topic}</p>
                  {goal && <p><strong>Specific Doubt:</strong> {goal}</p>}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 pt-4 border-t border-destructive/20">
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="flex-1 rounded-xl"
              >
                Retry Connection
              </Button>
              <Button 
                variant="default"
                onClick={handleReturnHome}
                className="flex-1 rounded-xl bg-destructive text-white hover:bg-destructive/90"
              >
                Back to Dashboard
              </Button>
            </div>
          </Alert>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] bg-mentor-surface flex flex-col p-3 sm:p-6 max-w-7xl mx-auto w-full space-y-4">
      {/* Top Intelligent Context Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl glass border border-border/50 shadow-sm">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleReturnHome}
            className="rounded-xl text-muted-foreground hover:text-foreground h-9"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Dashboard
          </Button>

          <div className="h-6 w-[1px] bg-border/60 hidden sm:block" />

          {/* Context Details */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-mentor-primary/10 text-mentor-primary text-xs font-bold uppercase tracking-wider">
              {subject}
            </span>
            <span className="font-semibold text-sm sm:text-base text-foreground">
              {topic}
            </span>
            {goal && (
              <span className="text-xs text-muted-foreground italic hidden lg:inline">
                ("{goal}")
              </span>
            )}
          </div>
        </div>

        {/* Live Timer & Controls */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          {/* Live Clock */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border/50 text-xs font-mono font-medium text-foreground">
            <Clock className="w-3.5 h-3.5 text-mentor-primary animate-pulse" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium border border-green-500/20">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span>Live Session</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNotes(!showNotes)}
            className="rounded-full text-xs h-8 gap-1.5"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Doubt Prompts</span>
          </Button>

          <Button 
            variant="destructive"
            size="sm"
            onClick={handleEndSession}
            className="rounded-full text-xs font-semibold h-8 gap-1.5 shadow-sm"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>End Session</span>
          </Button>
        </div>
      </div>

      {/* Main Video & Interactive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1">
        {/* Video Call Screen */}
        <div className={`relative rounded-3xl overflow-hidden bg-black/40 border border-border/50 shadow-lg min-h-[500px] flex flex-col justify-between ${showNotes ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
          {/* Daily.co WebRTC Frame */}
          <div className="absolute inset-0">
            <iframe
              src={conversationUrl}
              className="w-full h-full border-0"
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              allowFullScreen
              title={`mento.ai session on ${subject}: ${topic}`}
              onError={() => setError('Failed to load video session')}
            />
          </div>

          {/* Top Floating Badge */}
          <div className="relative z-10 p-4 flex justify-between items-start pointer-events-none">
            <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs flex items-center gap-2 pointer-events-auto">
              <GraduationCap className="w-4 h-4 text-mentor-secondary" />
              <span>AI Tutor: <strong>mento.ai Phoenix-3</strong></span>
            </div>
          </div>

          {/* Bottom Call Bar */}
          <div className="relative z-10 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-center gap-4">
            <Button 
              variant={isMicOn ? "secondary" : "destructive"} 
              size="icon"
              onClick={() => setIsMicOn(!isMicOn)}
              className="rounded-full w-11 h-11 shadow-lg"
              title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
            >
              {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </Button>
            
            <Button 
              variant={isVideoOn ? "secondary" : "destructive"} 
              size="icon"
              onClick={() => setIsVideoOn(!isVideoOn)}
              className="rounded-full w-11 h-11 shadow-lg"
              title={isVideoOn ? "Turn Camera Off" : "Turn Camera On"}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </Button>

            <Button 
              variant="destructive"
              onClick={handleEndSession}
              className="rounded-full px-6 py-2 h-11 font-semibold flex items-center gap-2 shadow-lg"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End & Save Session</span>
            </Button>
          </div>
        </div>

        {/* Doubt Prompts & Topic Guide Sidebar */}
        {showNotes && (
          <motion.div
            className="lg:col-span-1 glass rounded-3xl p-5 border border-border/50 shadow-md flex flex-col justify-between space-y-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <h4 className="font-bold text-sm text-foreground">Topic Quick Doubts</h4>
                </div>
                <button
                  onClick={() => setShowNotes(false)}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  Close
                </button>
              </div>

              <p className="text-xs text-muted-foreground">
                Speak these questions to your tutor for instant step-by-step doubt clarification:
              </p>

              <div className="space-y-2.5">
                {doubtSuggestions.map((prompt, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-card border border-border/60 hover:border-mentor-primary/40 text-xs text-foreground space-y-1 shadow-sm transition-colors"
                  >
                    <div className="flex items-center gap-1.5 text-mentor-primary font-semibold">
                      <MessageSquareQuote className="w-3.5 h-3.5" />
                      <span>Prompt {idx + 1}</span>
                    </div>
                    <p className="text-muted-foreground font-normal leading-relaxed">
                      "{prompt}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-mentor-primary/10 border border-mentor-primary/20 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-mentor-primary flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Progress Tracking Active
              </p>
              <p>Your session duration and {subject} mastery will be saved to your dashboard when you finish.</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
