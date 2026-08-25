import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  BookOpen, 
  Clock, 
  MessageCircle, 
  GraduationCap, 
  Target, 
  ArrowRight, 
  Sparkles, 
  History, 
  Play, 
  CheckCircle2, 
  Award,
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/utils/api';

interface SessionRecord {
  _id: string;
  subject: string;
  topic: string;
  durationSeconds: number;
  status: string;
  startedAt: string;
  notes?: string;
}

interface SessionStats {
  totalSessions: number;
  completedSessions: number;
  totalDurationMinutes: number;
  sessionsThisWeek: number;
  uniqueTopics: number;
  subjectCounts: Record<string, number>;
}

interface TopicDetail {
  topic: string;
  studied: boolean;
  assessed: boolean;
  score: number | null;
  status: string;
}

interface SubjectCurriculum {
  subject: string;
  description: string;
  color: string;
  totalTopics: number;
  completedCount: number;
  completedTopics: string[];
  allTopics: string[];
  topicDetails?: TopicDetail[];
  progressPercentage: number;
  totalDurationMinutes: number;
  sessionCount: number;
  nextTopic: string;
  masteryLevel: string;
}

interface CurriculumData {
  totalCatalogTopics: number;
  totalUniqueCompleted: number;
  totalUniqueMastered?: number;
  overallPercentage: number;
  subjects: SubjectCurriculum[];
}

interface AssessmentRecord {
  _id: string;
  subject: string;
  topic: string;
  scoreAchieved: number;
  totalPossibleScore: number;
  percentageScore: number;
  masteryStatus: 'In Progress' | 'Proficient' | 'Mastered';
  completedAt: string;
}

interface AssessmentStats {
  totalAssessments: number;
  averageScore: number;
  masteredTopicsCount: number;
  strongestSubjects: Array<{ subject: string; avgScore: number; count: number }>;
  needsPracticeTopics: Array<{ subject: string; topic: string; score: number }>;
  recentAssessments: AssessmentRecord[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<SessionStats>({
    totalSessions: 0,
    completedSessions: 0,
    totalDurationMinutes: 0,
    sessionsThisWeek: 0,
    uniqueTopics: 0,
    subjectCounts: {}
  });
  const [curriculum, setCurriculum] = useState<CurriculumData | null>(null);
  const [assessmentStats, setAssessmentStats] = useState<AssessmentStats | null>(null);
  const [recentSessions, setRecentSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Student';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, historyRes, curriculumRes, assessStatsRes] = await Promise.all([
          api.get('/sessions/stats').catch(() => ({ data: { data: null } })),
          api.get('/sessions/history?limit=5').catch(() => ({ data: { data: [] } })),
          api.get('/sessions/curriculum').catch(() => ({ data: { data: null } })),
          api.get('/assessments/stats').catch(() => ({ data: { data: null } }))
        ]);

        if (statsRes.data?.data) {
          setStats(statsRes.data.data);
        }
        if (historyRes.data?.data) {
          setRecentSessions(historyRes.data.data);
        }
        if (curriculumRes.data?.data) {
          setCurriculum(curriculumRes.data.data);
        }
        if (assessStatsRes.data?.data) {
          setAssessmentStats(assessStatsRes.data.data);
        }
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDuration = (seconds: number) => {
    if (!seconds) return '1 min';
    const mins = Math.round(seconds / 60);
    return mins > 0 ? `${mins} min` : `${seconds}s`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleLaunchTopic = (subjectName: string, topicName: string) => {
    navigate(`/session?subject=${encodeURIComponent(subjectName)}&topic=${encodeURIComponent(topicName)}`);
  };

  const handleTakeAssessment = (subjectName: string, topicName: string) => {
    navigate(`/assessment?subject=${encodeURIComponent(subjectName)}&topic=${encodeURIComponent(topicName)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mentor-surface via-background to-mentor-surface p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Greeting */}
        <motion.div
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-gradient-to-r from-mentor-primary/10 via-mentor-secondary/10 to-transparent p-6 sm:p-8 rounded-3xl border border-mentor-primary/20 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mentor-primary/20 text-mentor-primary text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Learning & Knowledge Verification</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Welcome back, <span className="gradient-text">{firstName}</span>!
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Learn interactively with your AI tutor, then test your understanding with adaptive 5-question knowledge checks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/library')}
              className="rounded-full px-5 h-11 border-border/80 text-foreground hover:bg-muted"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Explore Library
            </Button>
            <Button 
              onClick={() => navigate('/session')}
              className="rounded-full px-6 h-11 bg-gradient-to-r from-mentor-primary to-mentor-secondary hover:opacity-95 text-white font-semibold shadow-md gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Start Tutor Session
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Real Dynamic Stats Overview */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Card 1: Study Sessions */}
          <Card className="glass border-border/40 rounded-2xl shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sessions This Week</p>
                <p className="text-3xl font-extrabold text-foreground">{stats.sessionsThisWeek || 0}</p>
                <p className="text-xs text-muted-foreground">{stats.totalSessions || 0} lifetime sessions</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-mentor-primary/10 text-mentor-primary flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Total Study Time */}
          <Card className="glass border-border/40 rounded-2xl shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Study Time</p>
                <p className="text-3xl font-extrabold text-foreground">
                  {stats.totalDurationMinutes || 0} <span className="text-base font-normal text-muted-foreground">min</span>
                </p>
                <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Active Progress
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-mentor-secondary/10 text-mentor-secondary flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Topics Mastered & Verified */}
          <Card className="glass border-border/40 rounded-2xl shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Topics Mastered</p>
                <p className="text-3xl font-extrabold text-foreground">
                  {curriculum?.totalUniqueMastered || stats.uniqueTopics || 0}
                  {curriculum ? <span className="text-sm font-normal text-muted-foreground"> / {curriculum.totalCatalogTopics}</span> : ''}
                </p>
                <p className="text-xs text-muted-foreground">
                  {curriculum ? `${curriculum.overallPercentage}% curriculum completed` : 'across subjects'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Assessment Performance */}
          <Card className="glass border-border/40 rounded-2xl shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assessment Avg</p>
                <p className="text-3xl font-extrabold text-foreground">
                  {assessmentStats && assessmentStats.totalAssessments > 0 ? `${assessmentStats.averageScore}%` : 'N/A'}
                </p>
                <p className="text-xs text-green-500 font-medium">
                  {assessmentStats?.totalAssessments || 0} knowledge checks taken
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Phase 4 & Phase 5 Curriculum Progress Section */}
        {curriculum && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <Card className="glass border-border/40 rounded-3xl shadow-sm overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-mentor-primary/10 text-mentor-primary flex items-center justify-center">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Curriculum Learning & Mastery Progress</CardTitle>
                      <CardDescription>
                        Unique topics completed through 1-on-1 tutoring and verified by AI assessments
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-card/60 px-4 py-2 rounded-2xl border border-border/40">
                    <span className="text-xs font-semibold text-muted-foreground">Overall Completion:</span>
                    <span className="text-sm font-bold text-mentor-primary">{curriculum.overallPercentage}%</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Subject Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {curriculum.subjects.map((sub) => (
                    <div
                      key={sub.subject}
                      className="p-4 rounded-2xl bg-card border border-border/50 hover:border-mentor-primary/40 transition-all flex flex-col justify-between space-y-4 shadow-sm"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-bold text-base text-foreground">{sub.subject}</span>
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            sub.masteryLevel === 'Mastered' 
                              ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                              : sub.masteryLevel === 'Proficient'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {sub.masteryLevel}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{sub.description}</p>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{sub.completedCount} of {sub.totalTopics} topics</span>
                          <span className="font-semibold text-foreground">{sub.progressPercentage}%</span>
                        </div>
                        <Progress value={sub.progressPercentage} className="h-2 rounded-full" />
                      </div>

                      {/* Stats & Actions */}
                      <div className="pt-2 border-t border-border/30 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {sub.totalDurationMinutes}m • {sub.sessionCount} sessions
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleLaunchTopic(sub.subject, sub.nextTopic)}
                            className="font-semibold text-mentor-primary hover:underline flex items-center gap-1"
                          >
                            <span>{sub.completedCount === 0 ? 'Start' : 'Next'}: {sub.nextTopic.split(' ')[0]}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Phase 5 Recent Assessments & Recent Study Sessions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Recent AI Knowledge Checks (Assessments) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="glass border-border/40 rounded-3xl shadow-sm h-full flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-mentor-primary/10 text-mentor-primary flex items-center justify-center">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Recent AI Assessments</CardTitle>
                      <CardDescription>Knowledge checks testing topic comprehension</CardDescription>
                    </div>
                  </div>
                  {assessmentStats && assessmentStats.totalAssessments > 0 && (
                    <Badge variant="outline" className="text-xs">
                      Avg: {assessmentStats.averageScore}%
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 flex-1">
                {assessmentStats && assessmentStats.recentAssessments && assessmentStats.recentAssessments.length > 0 ? (
                  <div className="space-y-2.5">
                    {assessmentStats.recentAssessments.map((a) => (
                      <div
                        key={a._id}
                        onClick={() => navigate(`/assessment?id=${a._id}`)}
                        className="p-3.5 rounded-2xl bg-card/60 hover:bg-muted border border-border/40 hover:border-mentor-primary/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-mentor-primary">{a.subject}</span>
                            <span className="text-[11px] text-muted-foreground">{formatDate(a.completedAt)}</span>
                          </div>
                          <p className="text-xs font-semibold text-foreground group-hover:text-mentor-primary transition-colors truncate">
                            {a.topic}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <Badge className={`text-xs font-bold ${
                            a.percentageScore >= 85
                              ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30'
                              : a.percentageScore >= 60
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          }`}>
                            {a.percentageScore}% ({a.masteryStatus})
                          </Badge>
                          <span className="text-xs text-mentor-primary font-medium group-hover:translate-x-0.5 transition-transform">
                            Review →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center space-y-3 text-muted-foreground">
                    <Award className="w-10 h-10 mx-auto text-muted-foreground/40" />
                    <p className="text-xs">No assessments completed yet. Take a knowledge check after your next tutoring session!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Right: Recent Study Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <Card className="glass border-border/40 rounded-3xl shadow-sm h-full flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-mentor-primary/10 text-mentor-primary flex items-center justify-center">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Recent Study Sessions</CardTitle>
                    <CardDescription>Your tracked 1-on-1 tutor history</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 flex-1">
                {recentSessions.length > 0 ? (
                  <div className="space-y-2.5">
                    {recentSessions.map((rec) => (
                      <div
                        key={rec._id}
                        className="p-3.5 rounded-2xl bg-card/60 hover:bg-muted border border-border/40 hover:border-mentor-primary/40 transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-mentor-primary">{rec.subject}</span>
                          <span className="text-[11px] text-muted-foreground">{formatDate(rec.startedAt)}</span>
                        </div>
                        <p className="text-xs font-semibold text-foreground line-clamp-1">
                          {rec.topic}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/30">
                          <span>{formatDuration(rec.durationSeconds)} study time</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleTakeAssessment(rec.subject, rec.topic)}
                              className="text-xs font-semibold text-mentor-primary hover:underline flex items-center gap-1"
                            >
                              <Award className="w-3 h-3" />
                              <span>Test Knowledge</span>
                            </button>
                            <span className="text-muted-foreground">•</span>
                            <button
                              onClick={() => handleLaunchTopic(rec.subject, rec.topic)}
                              className="text-xs text-muted-foreground hover:text-foreground"
                            >
                              Resume
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center space-y-3 text-muted-foreground">
                    <BookOpen className="w-10 h-10 mx-auto text-muted-foreground/40" />
                    <p className="text-xs">No sessions recorded yet. Start your first session from the Library!</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => navigate('/library')}
                      className="rounded-full text-xs"
                    >
                      Go to Library
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}