// Router imports removed
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle2, Lock, Brain, Lightbulb, ChevronDown, X, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";

// Quiz Questions Data
const QUIZ_QUESTIONS: Record<number, any[]> = {
  1: [
    {
      id: 1,
      question: "What is the main purpose of having a test and control plot?",
      options: [
        "To use more land",
        "To compare two practices fairly and see which is better",
        "To confuse neighboring farmers",
        "To plant two different crops"
      ],
      correct: 1
    },
    {
      id: 2,
      question: "Which factor should be SAME in both test and control plots?",
      options: [
        "Only the fertilizer dosage",
        "Everything EXCEPT the practice you're testing",
        "The crops planted",
        "Nothing, they can be completely different"
      ],
      correct: 1
    },
    {
      id: 3,
      question: "Why is this experimental design better than just trying something new on your whole field?",
      options: [
        "It's always better to do experiments",
        "It lets you compare before risking your whole harvest",
        "It costs less money",
        "It doesn't matter, they're the same"
      ],
      correct: 1
    }
  ],
  2: [
    {
      id: 1,
      question: "Which of these should be INCLUDED in your experiment cost calculation?",
      options: [
        "Only seed cost",
        "Seeds + fertilizer only",
        "Seeds, fertilizer, pesticide, labor, transport, rent",
        "Only what you can see, not hidden costs"
      ],
      correct: 2
    },
    {
      id: 2,
      question: "If you get 20% higher yield but spent 50% more money, is the new method better?",
      options: [
        "Always yes, higher yield is always good",
        "Always no, you spent too much",
        "Not necessarily - compare profit, not just yield",
        "It depends on the weather"
      ],
      correct: 2
    },
    {
      id: 3,
      question: "What is the most accurate time to record harvest market prices?",
      options: [
        "Whatever the middleman tells you",
        "Based on last year's prices",
        "When you actually sell - check local market at that time",
        "Government minimum support price always"
      ],
      correct: 2
    },
    {
      id: 4,
      question: "Why should you adjust labor cost if you did it yourself?",
      options: [
        "You shouldn't count your own labor",
        "You should pay yourself market wages for accurate profit calculation",
        "Labor cost doesn't matter for profit",
        "Only count it if you're tired"
      ],
      correct: 1
    },
    {
      id: 5,
      question: "Which expense is often FORGOTTEN but important?",
      options: [
        "Water",
        "Transportation to market",
        "Equipment maintenance",
        "All of the above"
      ],
      correct: 3
    }
  ],
  3: [
    {
      id: 1,
      question: "A new organic fertilizer costs 3x more but increases yield by 15%. To decide if it's worth it, what should you compare?",
      options: [
        "Just the fertilizer cost",
        "Total profit per acre with the new vs old method",
        "Yield increase only",
        "What everyone else is doing"
      ],
      correct: 1
    },
    {
      id: 2,
      question: "You find a method that gives 30% more profit on 1 acre. What should you do next?",
      options: [
        "Immediately use it on your entire farm",
        "Tell everyone about it before testing more",
        "Test it on 2-3 acres next season to confirm results",
        "Forget about it, one test is enough"
      ],
      correct: 2
    },
    {
      id: 3,
      question: "How many seasons of data should you have before making a big change on your farm?",
      options: [
        "Just one successful test",
        "At least 2-3 years to account for different weather patterns",
        "5+ years minimum",
        "Data doesn't matter, follow your gut"
      ],
      correct: 1
    },
    {
      id: 4,
      question: "What's the best way to find your highest-profit crop?",
      options: [
        "Plant what neighbors plant",
        "Grow whatever gives highest yield",
        "Calculate profit (money in - money out) for each crop you grow",
        "Ask a salesman which seed is best"
      ],
      correct: 2
    }
  ]
};

const LESSONS = [
  {
    id: 1,
    title: "What is Test vs Control?",
    description: "Understanding the basics of comparing two practices fairly",
    duration: "2 min",
    unlocked: true,
    completed: false,
  },
  {
    id: 2,
    title: "Setting Up Fair Experiments",
    description: "Keep everything same except the practice you want to test",
    duration: "3 min",
    unlocked: true,
    completed: false,
  },
  {
    id: 3,
    title: "Why Profit > Yield",
    description: "Higher yield doesn't always mean more money in your pocket",
    duration: "2 min",
    unlocked: true,
    completed: false,
  },
  {
    id: 4,
    title: "Recording Costs Accurately",
    description: "Don't forget labor, transport, and hidden costs",
    duration: "2 min",
    unlocked: false,
    completed: false,
  },
  {
    id: 5,
    title: "Understanding Soil Health",
    description: "What your soil test results mean and how to use them",
    duration: "3 min",
    unlocked: false,
    completed: false,
  },
  {
    id: 6,
    title: "Interpreting Your Results",
    description: "How to read comparison reports and make decisions",
    duration: "3 min",
    unlocked: false,
    completed: false,
  },
];

const QUIZZES = [
  {
    id: 1,
    title: "Test vs Control Basics",
    questions: 3,
    difficulty: "Beginner",
    topic: "Understanding Experiments",
    completed: false,
  },
  {
    id: 2,
    title: "Cost Calculation Quiz",
    questions: 5,
    difficulty: "Intermediate",
    topic: "Financial Planning",
    completed: false,
  },
  {
    id: 3,
    title: "Profit Optimization",
    questions: 4,
    difficulty: "Advanced",
    topic: "Business Strategy",
    completed: false,
  },
];

const TIPS = [
  {
    category: "💡 Crop Management",
    tips: [
      "Test only 1 change at a time - this makes it clear what caused the difference",
      "Use at least 0.5 acre for each test - small plots can have uneven soil or water",
      "Record everything same way - same time of day, same measurements",
      "Keep a diary - note rainfall, temperature, any unusual events",
    ]
  },
  {
    category: "💰 Profit Maximization",
    tips: [
      "Don't just count yield - count every rupee spent and earned",
      "Include: seeds, fertilizer, pesticide, labor, transport, rent",
      "Find local market prices when selling - not just wholesale rates",
      "Test new varieties on small plots first before full field",
    ]
  },
  {
    category: "🌱 Soil & Water",
    tips: [
      "Get soil test done once every 2-3 years from your district office",
      "Irrigation timing matters more than quantity - morning watering wastes less",
      "Mulching reduces water loss by 20-30% even in dry season",
      "Intercropping can reduce pests by 15-25% naturally",
    ]
  },
  {
    category: "📊 Tracking & Planning",
    tips: [
      "Use our app to track every cost and harvest - patterns emerge over time",
      "Compare THIS season with LAST season same time - not different crops",
      "Plan next year's tests based on THIS year's profit differences",
      "Share results with neighboring farmers - learn together",
    ]
  }
];

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState<'lessons' | 'quizzes' | 'tips'>('lessons');
  const [expandedTip, setExpandedTip] = useState<string | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const handleAnswerSelect = (questionId: number, answerIdx: number) => {
    if (!quizSubmitted) {
      setSelectedAnswers(prev => ({ ...prev, [questionId]: answerIdx }));
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < (QUIZ_QUESTIONS[selectedQuiz.id]?.length || 0) - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
    }
  };

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
  };

  const calculateScore = () => {
    const questions = QUIZ_QUESTIONS[selectedQuiz.id] || [];
    let correct = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correct) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const closeQuiz = () => {
    setSelectedQuiz(null);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setQuizSubmitted(false);
  };

  const currentQuestion = QUIZ_QUESTIONS[selectedQuiz?.id]?.[currentQuestionIdx];
  const score = calculateScore();
  const totalQuestions = QUIZ_QUESTIONS[selectedQuiz?.id]?.length || 0;

  return (
    <div>
      <AppHeader title="Learn" />
      <main className="mx-auto max-w-lg px-4 py-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 sticky top-20 bg-white/95 backdrop-blur pt-2 pb-4 z-10">
          {[
            { id: 'lessons', label: '📚 Lessons', icon: BookOpen },
            { id: 'quizzes', label: '🧠 Quizzes', icon: Brain },
            { id: 'tips', label: '💡 Tips', icon: Lightbulb },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'lessons' | 'quizzes' | 'tips')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all",
                activeTab === tab.id
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              )}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Lessons Tab */}
        {activeTab === 'lessons' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <h2 className="text-display text-xl font-bold mb-2">Micro-Lessons</h2>
            <p className="text-sm text-slate-600 mb-6">
              Short lessons to help you run better experiments and understand your results
            </p>
            <div className="space-y-3">
              {LESSONS.map((lesson, idx) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card
                    className={cn(
                      "flex items-center gap-3 p-4 transition-all cursor-pointer hover:shadow-md",
                      lesson.unlocked ? "hover:border-green-300" : "opacity-60",
                      lesson.completed && "bg-gradient-to-r from-green-50 to-emerald-50"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        lesson.completed
                          ? "bg-green-100"
                          : lesson.unlocked
                          ? "bg-blue-100"
                          : "bg-slate-100"
                      )}
                    >
                      {lesson.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : lesson.unlocked ? (
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Lock className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-slate-900">{lesson.title}</h3>
                      <p className="text-xs text-slate-600">{lesson.description}</p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {lesson.duration}
                    </Badge>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quizzes Tab */}
        {activeTab === 'quizzes' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <h2 className="text-display text-xl font-bold mb-2">Interactive Quizzes</h2>
            <p className="text-sm text-slate-600 mb-6">
              Test your knowledge with quick quizzes on farming best practices
            </p>
            <div className="space-y-3">
              {QUIZZES.map((quiz, idx) => (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="p-4 hover:shadow-md transition-all cursor-pointer hover:border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-slate-900">{quiz.title}</h3>
                        <p className="text-xs text-slate-600">{quiz.topic}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {quiz.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">{quiz.questions} questions</span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedQuiz(quiz)}
                        className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-xs font-medium hover:shadow-lg transition-all"
                      >
                        {quiz.completed ? "Retake" : "Start"}
                      </motion.button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tips Tab */}
        {activeTab === 'tips' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <h2 className="text-display text-xl font-bold mb-2">Tips & Tricks</h2>
            <p className="text-sm text-slate-600 mb-6">
              Practical advice to improve your farming and profits
            </p>
            <div className="space-y-3">
              {TIPS.map((section, idx) => (
                <motion.div
                  key={section.category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="overflow-hidden border-slate-200 hover:shadow-md transition-all">
                    <button
                      onClick={() => setExpandedTip(expandedTip === section.category ? null : section.category)}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                    >
                      <h3 className="text-sm font-semibold text-slate-900">{section.category}</h3>
                      <motion.div
                        animate={{ rotate: expandedTip === section.category ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-4 w-4 text-slate-600" />
                      </motion.div>
                    </button>

                    {expandedTip === section.category && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-slate-200 bg-slate-50"
                      >
                        <div className="p-4 space-y-3">
                          {section.tips.map((tip, tipIdx) => (
                            <motion.div
                              key={tipIdx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: tipIdx * 0.05 }}
                              className="flex gap-3 text-sm"
                            >
                              <span className="text-lg">📌</span>
                              <p className="text-slate-700 leading-relaxed">{tip}</p>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quiz Modal */}
        {selectedQuiz && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
              className="w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto"
            >
              {/* Quiz Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-4 flex items-center justify-between rounded-t-3xl">
                <div className="flex-1">
                  <h2 className="font-bold text-lg">{selectedQuiz.title}</h2>
                  <p className="text-xs opacity-90">Question {currentQuestionIdx + 1} of {totalQuestions}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={closeQuiz}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Progress Bar */}
              <div className="h-1 bg-slate-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentQuestionIdx + 1) / totalQuestions) * 100}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-600"
                />
              </div>

              <div className="p-6 space-y-6">
                {/* Question Results View */}
                {quizSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Score Card */}
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 text-center border-2 border-blue-200"
                    >
                      <div className="mb-3">
                        {score >= 80 ? (
                          <div className="text-5xl font-bold text-green-600 mb-2">🎉</div>
                        ) : score >= 60 ? (
                          <div className="text-5xl font-bold text-yellow-600 mb-2">⭐</div>
                        ) : (
                          <div className="text-5xl font-bold text-orange-600 mb-2">💪</div>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">Your Score</p>
                      <p className="text-5xl font-bold text-blue-600">{score}%</p>
                      <p className="text-sm text-slate-600 mt-2">
                        {Object.keys(selectedAnswers).filter(qId => selectedAnswers[parseInt(qId)] === QUIZ_QUESTIONS[selectedQuiz.id]?.find(q => q.id === parseInt(qId))?.correct).length} / {totalQuestions} correct
                      </p>
                    </motion.div>

                    {/* Review Answers */}
                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-900">Review Your Answers</h3>
                      {QUIZ_QUESTIONS[selectedQuiz.id]?.map((q, idx) => {
                        const userAnswer = selectedAnswers[q.id];
                        const isCorrect = userAnswer === q.correct;
                        return (
                          <motion.div
                            key={q.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={cn(
                              "p-4 rounded-xl border-2",
                              isCorrect
                                ? "bg-green-50 border-green-200"
                                : "bg-red-50 border-red-200"
                            )}
                          >
                            <div className="flex items-start gap-3">
                              {isCorrect ? (
                                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                              ) : (
                                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                              )}
                              <div className="flex-1">
                                <p className="font-medium text-sm text-slate-900 mb-2">{q.question}</p>
                                <p className={cn(
                                  "text-xs mb-2",
                                  isCorrect ? "text-green-700" : "text-red-700"
                                )}>
                                  Your answer: {q.options[userAnswer || 0]}
                                </p>
                                {!isCorrect && (
                                  <p className="text-xs text-green-700">
                                    ✓ Correct answer: {q.options[q.correct]}
                                  </p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Close Button */}
                    <Button
                      onClick={closeQuiz}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-medium"
                      size="lg"
                    >
                      Done
                    </Button>
                  </motion.div>
                ) : (
                  <>
                    {/* Question Display */}
                    {currentQuestion && (
                      <motion.div
                        key={currentQuestion.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                      >
                        <h3 className="text-lg font-bold text-slate-900 leading-relaxed">
                          {currentQuestion.question}
                        </h3>

                        {/* Answer Options */}
                        <div className="space-y-3">
                          {currentQuestion.options.map((option: string, idx: number) => (
                            <motion.button
                              key={idx}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleAnswerSelect(currentQuestion.id, idx)}
                              className={cn(
                                "w-full p-4 rounded-xl text-left font-medium transition-all border-2",
                                selectedAnswers[currentQuestion.id] === idx
                                  ? "bg-blue-100 border-blue-500 text-blue-900"
                                  : "bg-slate-50 border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={cn(
                                    "flex h-6 w-6 items-center justify-center rounded-full border-2 font-bold text-sm",
                                    selectedAnswers[currentQuestion.id] === idx
                                      ? "bg-blue-500 border-blue-500 text-white"
                                      : "border-slate-300"
                                  )}
                                >
                                  {String.fromCharCode(65 + idx)}
                                </div>
                                {option}
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-3 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handlePrevQuestion}
                        disabled={currentQuestionIdx === 0}
                        className="flex-1 py-3 px-4 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-slate-200 text-slate-700 hover:bg-slate-300"
                      >
                        ← Previous
                      </motion.button>
                      {currentQuestionIdx < totalQuestions - 1 ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleNextQuestion}
                          className="flex-1 py-3 px-4 rounded-xl font-medium transition-all bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700"
                        >
                          Next →
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSubmitQuiz}
                          className="flex-1 py-3 px-4 rounded-xl font-medium transition-all bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                        >
                          Submit Quiz ✓
                        </motion.button>
                      )}
                    </div>

                    {/* Question Indicators */}
                    <div className="flex flex-wrap gap-2 justify-center pt-4">
                      {QUIZ_QUESTIONS[selectedQuiz.id]?.map((q, idx) => (
                        <motion.button
                          key={q.id}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setCurrentQuestionIdx(idx)}
                          className={cn(
                            "w-8 h-8 rounded-full font-bold text-xs transition-all",
                            currentQuestionIdx === idx
                              ? "bg-blue-500 text-white ring-2 ring-blue-300"
                              : selectedAnswers[q.id] !== undefined
                              ? "bg-green-100 text-green-700 border border-green-300"
                              : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                          )}
                        >
                          {idx + 1}
                        </motion.button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
