import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Calculator, 
  Microscope, 
  Code,
  Globe, 
  Sparkles,
  Search, 
  Filter, 
  Star, 
  Clock, 
  Users,
  ArrowRight,
  X,
  GraduationCap,
  HelpCircle,
  Play
} from 'lucide-react';

interface Subject {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  gradient: string;
  difficulty: string;
  topics: {
    name: string;
    description: string;
    estimatedTime: string;
  }[];
}

const subjects: Subject[] = [
  {
    id: "physics",
    title: "Physics",
    description: "Mechanics, Thermodynamics, Electromagnetism, Quantum Concepts",
    icon: Microscope,
    color: "bg-blue-600",
    gradient: "from-blue-600 to-cyan-500",
    difficulty: "High School & College",
    topics: [
      { name: "Laws of Motion", description: "Newton's 3 laws, momentum, friction & free body diagrams", estimatedTime: "25 min" },
      { name: "Thermodynamics", description: "Heat transfer, entropy, and thermal equilibrium", estimatedTime: "30 min" },
      { name: "Electromagnetism", description: "Coulomb's law, magnetic fields, and electromagnetic induction", estimatedTime: "35 min" },
      { name: "Optics & Light", description: "Refraction, lenses, wave optics, and diffraction", estimatedTime: "20 min" },
      { name: "Work, Energy & Power", description: "Conservation of energy, kinetic and potential energy", estimatedTime: "25 min" }
    ]
  },
  {
    id: "mathematics",
    title: "Mathematics",
    description: "Calculus, Linear Algebra, Geometry, Statistics & Probability",
    icon: Calculator,
    color: "bg-indigo-600",
    gradient: "from-indigo-600 to-purple-500",
    difficulty: "All Levels",
    topics: [
      { name: "Calculus & Derivatives", description: "Limits, chain rule, optimization, and tangents", estimatedTime: "30 min" },
      { name: "Integration & Areas", description: "Definite integrals, substitution, and Riemann sums", estimatedTime: "35 min" },
      { name: "Linear Algebra", description: "Matrices, vectors, determinants, and linear transformations", estimatedTime: "30 min" },
      { name: "Quadratic Equations", description: "Factoring, discriminant, and parabolic functions", estimatedTime: "20 min" },
      { name: "Probability & Statistics", description: "Bayes theorem, normal distributions, and variance", estimatedTime: "25 min" }
    ]
  },
  {
    id: "chemistry",
    title: "Chemistry",
    description: "Organic Reactions, Atomic Structure, Chemical Bonding, Equilibrium",
    icon: Sparkles,
    color: "bg-emerald-600",
    gradient: "from-emerald-600 to-teal-400",
    difficulty: "All Levels",
    topics: [
      { name: "Chemical Bonding", description: "Ionic, covalent, metallic bonds and Lewis structures", estimatedTime: "25 min" },
      { name: "Periodic Table & Trends", description: "Electronegativity, ionization energy, atomic radius", estimatedTime: "20 min" },
      { name: "Organic Reaction Mechanisms", description: "Nucleophilic substitution, addition, elimination", estimatedTime: "40 min" },
      { name: "Acids, Bases & pH", description: "Equilibrium constants, titration, buffer solutions", estimatedTime: "25 min" },
      { name: "Stoichiometry & Moles", description: "Balancing equations and calculating chemical yields", estimatedTime: "20 min" }
    ]
  },
  {
    id: "computer-science",
    title: "Computer Science",
    description: "Data Structures, Algorithms, AI Concepts, Web Development",
    icon: Code,
    color: "bg-cyan-600",
    gradient: "from-cyan-600 to-blue-500",
    difficulty: "Beginner to Advanced",
    topics: [
      { name: "Data Structures", description: "Arrays, linked lists, trees, graphs, and hash tables", estimatedTime: "35 min" },
      { name: "Algorithms & Big-O", description: "Sorting, binary search, recursion, and time complexity", estimatedTime: "30 min" },
      { name: "Machine Learning Basics", description: "Supervised learning, neural networks, gradient descent", estimatedTime: "40 min" },
      { name: "React & Modern Web", description: "Components, hooks, state management, and virtual DOM", estimatedTime: "30 min" },
      { name: "Databases & SQL", description: "Relational queries, indexing, and NoSQL architecture", estimatedTime: "25 min" }
    ]
  },
  {
    id: "biology",
    title: "Biology",
    description: "Cellular Biology, Genetics, Human Physiology, Ecology",
    icon: BookOpen,
    color: "bg-amber-600",
    gradient: "from-amber-600 to-orange-500",
    difficulty: "All Levels",
    topics: [
      { name: "Cell Structure & Function", description: "Organelles, membrane transport, and cellular respiration", estimatedTime: "25 min" },
      { name: "Genetics & DNA Replication", description: "Mendelian genetics, RNA translation, transcription", estimatedTime: "30 min" },
      { name: "Photosynthesis", description: "Light reactions, Calvin cycle, and chlorophyll dynamics", estimatedTime: "20 min" },
      { name: "Human Nervous System", description: "Neurons, action potentials, and synaptic transmission", estimatedTime: "30 min" }
    ]
  },
  {
    id: "history",
    title: "History & Social Sciences",
    description: "World Civilizations, Modern History, Economics & Governance",
    icon: Globe,
    color: "bg-rose-600",
    gradient: "from-rose-600 to-pink-500",
    difficulty: "All Levels",
    topics: [
      { name: "World War II & Global Impact", description: "Key alliances, pivotal battles, and post-war geopolitics", estimatedTime: "30 min" },
      { name: "The Industrial Revolution", description: "Technological shifts, urbanization, and economic impact", estimatedTime: "25 min" },
      { name: "Ancient Civilizations", description: "Mesopotamia, Egypt, Greece, Rome and early governance", estimatedTime: "25 min" },
      { name: "Microeconomics Principles", description: "Supply, demand, elasticity, and market equilibrium", estimatedTime: "25 min" }
    ]
  }
];

const popularResources = [
  {
    title: "Newton's Laws of Motion Explained",
    subject: "Physics",
    topic: "Laws of Motion",
    duration: "25 min",
    rating: 4.9,
    students: 1420
  },
  {
    title: "Derivatives & Chain Rule Mastery",
    subject: "Mathematics",
    topic: "Calculus & Derivatives",
    duration: "30 min",
    rating: 4.8,
    students: 1850
  },
  {
    title: "Chemical Bonding & Molecular Shapes",
    subject: "Chemistry",
    topic: "Chemical Bonding",
    duration: "25 min",
    rating: 4.9,
    students: 980
  },
  {
    title: "Binary Trees & Graph Traversal",
    subject: "Computer Science",
    topic: "Data Structures",
    duration: "35 min",
    rating: 4.9,
    students: 2100
  }
];

export default function Library() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [customGoal, setCustomGoal] = useState<string>('');

  const filteredSubjects = subjects.filter(sub => {
    const query = searchQuery.toLowerCase();
    const matchesSubject = sub.title.toLowerCase().includes(query) || sub.description.toLowerCase().includes(query);
    const matchesTopics = sub.topics.some(t => t.name.toLowerCase().includes(query) || t.description.toLowerCase().includes(query));
    return matchesSubject || matchesTopics;
  });

  const handleStartSession = (subjectTitle: string, topicName: string, goal?: string) => {
    const params = new URLSearchParams();
    params.set('subject', subjectTitle);
    params.set('topic', topicName);
    if (goal && goal.trim() !== '') {
      params.set('goal', goal.trim());
    }
    navigate(`/session?${params.toString()}`);
  };

  const handleOpenSubjectModal = (subject: Subject) => {
    setSelectedSubject(subject);
    setSelectedTopic(subject.topics[0]?.name || '');
    setCustomGoal('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mentor-surface via-background to-mentor-surface p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <motion.div
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-gradient-to-r from-mentor-primary/10 via-mentor-secondary/10 to-transparent p-6 sm:p-8 rounded-3xl border border-mentor-primary/20 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mentor-primary/20 text-mentor-primary text-xs font-semibold">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Contextual AI Learning Library</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              What would you like to <span className="gradient-text">master today?</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Choose any subject and topic. Your AI tutor will receive your exact learning context and teach you step-by-step with real-time doubt clarification.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subjects, topics, or formulas..."
                className="pl-10 pr-4 py-2 bg-card border-border rounded-full text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-mentor-primary/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Subjects Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Academic Subjects</h2>
              <p className="text-sm text-muted-foreground">Select a subject to explore topics or launch a live AI tutoring session</p>
            </div>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {filteredSubjects.map((subject, index) => {
              const Icon = subject.icon;
              return (
                <motion.div
                  key={subject.id}
                  className="group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="glass border-border/40 hover:border-mentor-primary/50 transition-all duration-300 flex flex-col justify-between h-full rounded-2xl shadow-sm hover:shadow-md overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${subject.gradient} flex items-center justify-center shadow-md shadow-mentor-primary/10 group-hover:scale-105 transition-transform duration-300`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                          {subject.difficulty}
                        </span>
                      </div>
                      <CardTitle className="text-xl text-foreground group-hover:text-mentor-primary transition-colors">
                        {subject.title}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm line-clamp-2">
                        {subject.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0 space-y-4">
                      {/* Topic Badges */}
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Key Topics</p>
                        <div className="flex flex-wrap gap-1.5">
                          {subject.topics.map((t) => (
                            <button
                              key={t.name}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartSession(subject.title, t.name);
                              }}
                              className="px-2.5 py-1 text-xs bg-mentor-primary/10 hover:bg-mentor-primary hover:text-white text-mentor-primary font-medium rounded-lg transition-colors text-left"
                              title={`Start learning ${t.name}`}
                            >
                              {t.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button 
                        className="w-full bg-gradient-to-r from-mentor-primary to-mentor-secondary hover:opacity-95 text-white font-medium rounded-xl flex items-center justify-center gap-2 shadow-sm"
                        onClick={() => handleOpenSubjectModal(subject)}
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Select Topic & Start AI Session</span>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Popular Learning Resources / Quick Starts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="glass border-border/40 rounded-2xl shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center">
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <CardTitle className="text-xl">Popular Learning Modules</CardTitle>
                  <CardDescription>Most requested topics for 1-on-1 AI doubt clarification</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {popularResources.map((resource, index) => (
                  <motion.div
                    key={resource.title}
                    className="p-4 rounded-xl glass hover:glass-strong border border-border/40 hover:border-mentor-primary/40 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 group"
                    onClick={() => handleStartSession(resource.subject, resource.topic)}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-mentor-primary/10 text-mentor-primary">
                            {resource.subject}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{resource.topic}</span>
                        </div>
                        <h4 className="font-semibold text-foreground group-hover:text-mentor-primary transition-colors">
                          {resource.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 flex-shrink-0">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="text-xs font-bold">{resource.rating}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/30">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {resource.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {resource.students.toLocaleString()} students
                        </span>
                      </div>
                      <span className="font-semibold text-mentor-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Launch AI Tutor
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Interactive Topic Selection Modal */}
      <AnimatePresence>
        {selectedSubject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              className="bg-card text-card-foreground border border-border w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedSubject(null)}
                className="absolute top-5 right-5 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${selectedSubject.gradient} flex items-center justify-center text-white shadow-md`}>
                  {(() => {
                    const Icon = selectedSubject.icon;
                    return <Icon className="w-6 h-6" />;
                  })()}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{selectedSubject.title} Session</h3>
                  <p className="text-sm text-muted-foreground">Select a topic to configure your 1-on-1 AI tutor</p>
                </div>
              </div>

              {/* Topic Picker */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <span>1. Choose Focus Topic</span>
                  <span className="text-xs text-muted-foreground font-normal">(Required)</span>
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {selectedSubject.topics.map((t) => {
                    const isSelected = selectedTopic === t.name;
                    return (
                      <button
                        key={t.name}
                        onClick={() => setSelectedTopic(t.name)}
                        className={`p-3.5 rounded-xl border text-left transition-all flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'border-mentor-primary bg-mentor-primary/10 shadow-sm'
                            : 'border-border/60 hover:border-mentor-primary/40 hover:bg-muted/40'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p className={`font-semibold text-sm ${isSelected ? 'text-mentor-primary' : 'text-foreground'}`}>
                            {t.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{t.description}</p>
                        </div>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full flex-shrink-0">
                          {t.estimatedTime}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Custom Doubt / Question Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-mentor-primary" />
                  <span>2. Specific Question or Doubt (Optional)</span>
                </label>
                <Input
                  type="text"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  placeholder="e.g. Can you explain why momentum is conserved in collisions?"
                  className="rounded-xl bg-muted/40 border-border"
                />
              </div>

              {/* Launch CTA */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <Button
                  variant="ghost"
                  className="w-full sm:w-auto rounded-xl"
                  onClick={() => setSelectedSubject(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="w-full sm:flex-1 bg-gradient-to-r from-mentor-primary to-mentor-secondary hover:opacity-95 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-md"
                  onClick={() => {
                    handleStartSession(selectedSubject.title, selectedTopic, customGoal);
                    setSelectedSubject(null);
                  }}
                  disabled={!selectedTopic}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Tutor Session ({selectedTopic || 'Select Topic'})</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
