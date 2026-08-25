import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Mail, 
  Clock, 
  Award, 
  BookOpen, 
  GraduationCap, 
  CheckCircle2, 
  Target,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/utils/api';
import { useNavigate } from 'react-router-dom';

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

interface AssessmentStats {
  totalAssessments: number;
  averageScore: number;
  masteredTopicsCount: number;
  strongestSubjects: Array<{ subject: string; avgScore: number; count: number }>;
  needsPracticeTopics: Array<{ subject: string; topic: string; score: number }>;
}

export default function Profile() {
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const [statsRes, curriculumRes, assessStatsRes] = await Promise.all([
          api.get('/sessions/stats').catch(() => ({ data: { data: null } })),
          api.get('/sessions/curriculum').catch(() => ({ data: { data: null } })),
          api.get('/assessments/stats').catch(() => ({ data: { data: null } }))
        ]);

        if (statsRes.data?.data) {
          setStats(statsRes.data.data);
        }
        if (curriculumRes.data?.data) {
          setCurriculum(curriculumRes.data.data);
        }
        if (assessStatsRes.data?.data) {
          setAssessmentStats(assessStatsRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const formatHoursAndMinutes = (totalMinutes: number) => {
    if (!totalMinutes) return '0 min';
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours === 0) return `${mins} min`;
    return `${hours}h ${mins}m`;
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mentor-surface via-background to-mentor-surface p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8 rounded-3xl glass border border-border/50 shadow-sm"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-mentor-primary to-mentor-secondary flex items-center justify-center text-white text-2xl font-extrabold shadow-lg shadow-mentor-primary/20">
            {getInitials(user?.name)}
          </div>

          <div className="space-y-1.5 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{user?.name || 'Student'}</h1>
              <Badge variant="secondary" className="bg-mentor-primary/10 text-mentor-primary font-semibold text-xs rounded-full px-2.5">
                Active Learner
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-4 h-4" />
              {user?.email || 'student@mento.ai'}
            </p>
          </div>

          <Button
            onClick={() => navigate('/library')}
            className="rounded-full bg-gradient-to-r from-mentor-primary to-mentor-secondary hover:opacity-95 text-white shadow-md text-xs font-semibold px-5"
          >
            <BookOpen className="w-4 h-4 mr-1.5" />
            Explore Subjects
          </Button>
        </motion.div>

        {/* Real Stats Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="glass border-border/40 rounded-2xl shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completed Sessions</p>
                <p className="text-2xl font-extrabold text-foreground mt-1">{stats.completedSessions || 0}</p>
                <p className="text-[11px] text-muted-foreground">{stats.totalSessions || 0} initiated</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-mentor-primary/10 text-mentor-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/40 rounded-2xl shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Study Time</p>
                <p className="text-2xl font-extrabold text-foreground mt-1">{formatHoursAndMinutes(stats.totalDurationMinutes)}</p>
                <p className="text-[11px] text-green-500 font-medium">{stats.sessionsThisWeek} sessions this week</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-mentor-secondary/10 text-mentor-secondary flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/40 rounded-2xl shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unique Topics</p>
                <p className="text-2xl font-extrabold text-foreground mt-1">{stats.uniqueTopics || 0}</p>
                <p className="text-[11px] text-muted-foreground">across academic catalog</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/40 rounded-2xl shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Knowledge Score</p>
                <p className="text-2xl font-extrabold text-foreground mt-1">
                  {assessmentStats && assessmentStats.totalAssessments > 0 ? `${assessmentStats.averageScore}%` : 'N/A'}
                </p>
                <p className="text-[11px] text-green-500 font-medium">
                  {assessmentStats?.totalAssessments || 0} checks completed
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Phase 5 Learning Assessment Overview */}
        {assessmentStats && assessmentStats.totalAssessments > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <Card className="glass border-border/40 rounded-3xl shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-mentor-primary" />
                  <CardTitle className="text-xl">Learning Assessment Overview</CardTitle>
                </div>
                <CardDescription>
                  Verified comprehension analytics based on your AI knowledge checks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Strongest Subjects */}
                  <div className="p-4 rounded-2xl bg-card border border-border/50 space-y-3 shadow-sm">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Strongest Subjects</span>
                    </div>
                    {assessmentStats.strongestSubjects.length > 0 ? (
                      <div className="space-y-2">
                        {assessmentStats.strongestSubjects.map((sub) => (
                          <div key={sub.subject} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-muted/40 border border-border/30">
                            <span className="font-bold text-foreground">{sub.subject}</span>
                            <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30 text-xs font-bold">
                              {sub.avgScore}% avg ({sub.count} checks)
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Complete more checks to track subject rankings.</p>
                    )}
                  </div>

                  {/* Topics Needing Practice */}
                  <div className="p-4 rounded-2xl bg-card border border-border/50 space-y-3 shadow-sm">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>Topics Needing Practice (&lt; 70%)</span>
                    </div>
                    {assessmentStats.needsPracticeTopics.length > 0 ? (
                      <div className="space-y-2">
                        {assessmentStats.needsPracticeTopics.map((item) => (
                          <div key={item.topic} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                            <div>
                              <span className="font-bold text-foreground block">{item.topic}</span>
                              <span className="text-[10px] text-muted-foreground">{item.subject}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs font-bold">
                                {item.score}%
                              </Badge>
                              <button
                                onClick={() => navigate(`/assessment?subject=${encodeURIComponent(item.subject)}&topic=${encodeURIComponent(item.topic)}`)}
                                className="text-xs text-mentor-primary font-semibold hover:underline"
                              >
                                Retest →
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-green-600 p-3 rounded-xl bg-green-500/5 border border-green-500/20">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>All tested topics meet proficiency standards!</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Detailed Curriculum Progress Overview */}
        {curriculum && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="glass border-border/40 rounded-3xl shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-mentor-primary" />
                  <CardTitle className="text-xl">Subject Mastery Breakdown</CardTitle>
                </div>
                <CardDescription>
                  Detailed breakdown of your unique completed topics per academic discipline
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {curriculum.subjects.map((sub) => (
                    <div
                      key={sub.subject}
                      className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm space-y-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-base text-foreground">{sub.subject}</h4>
                          <p className="text-xs text-muted-foreground">{sub.totalDurationMinutes} minutes study time • {sub.sessionCount} sessions</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {sub.completedCount}/{sub.totalTopics} Topics
                        </Badge>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Mastery Level</span>
                          <span className="font-semibold text-foreground">{sub.progressPercentage}% ({sub.masteryLevel})</span>
                        </div>
                        <Progress value={sub.progressPercentage} className="h-2 rounded-full" />
                      </div>

                      {/* Completed Topic Badges */}
                      <div className="space-y-1.5">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Completed Topics</p>
                        <div className="flex flex-wrap gap-1.5">
                          {sub.completedTopics.length > 0 ? (
                            sub.completedTopics.map((topicName) => (
                              <span
                                key={topicName}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-green-500/10 text-green-700 dark:text-green-300 text-xs font-medium border border-green-500/20"
                              >
                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                                {topicName}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground italic">No topics completed yet</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}