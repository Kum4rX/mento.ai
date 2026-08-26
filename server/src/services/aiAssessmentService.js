const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

// Stop words for heuristic keyword filtering
const STOP_WORDS = new Set([
  'about', 'above', 'after', 'again', 'against', 'also', 'although', 'among', 'and',
  'another', 'any', 'are', 'around', 'because', 'been', 'before', 'being', 'between',
  'both', 'can', 'could', 'describe', 'did', 'does', 'doing', 'down', 'during', 'each',
  'explain', 'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having', 'her',
  'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'into', 'its', 'itself',
  'just', 'more', 'most', 'must', 'name', 'nor', 'not', 'now', 'only', 'other', 'our',
  'ours', 'ourselves', 'out', 'over', 'own', 'same', 'should', 'some', 'such', 'than',
  'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these',
  'they', 'this', 'those', 'through', 'too', 'under', 'until', 'very', 'was', 'were',
  'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with',
  'would', 'discuss', 'compare', 'state', 'give', 'example', 'mention', 'identify'
]);

// Curated academic topic knowledge base for resilient offline/fallback generation
const ACADEMIC_TOPIC_KNOWLEDGE = {
  "Laws of Motion": {
    mcqs: [
      {
        question: "Which of the following statements correctly describes Newton's First Law of Motion?",
        options: [
          "An object remains at rest or in uniform straight-line motion unless acted upon by a net external force",
          "The rate of change of momentum is proportional to the applied unbalanced force",
          "Forces always occur in matched action-reaction pairs acting on the same object",
          "Mechanical energy is strictly conserved only in non-inertial reference frames"
        ],
        correctAnswer: "An object remains at rest or in uniform straight-line motion unless acted upon by a net external force",
        explanation: "Newton's First Law defines inertia: an object maintains its state of rest or uniform motion unless an external net force acts on it."
      },
      {
        question: "A constant net force of 24 N is applied to an object with a mass of 6 kg. What is the resulting acceleration?",
        options: ["4 m/s²", "144 m/s²", "0.25 m/s²", "18 m/s²"],
        correctAnswer: "4 m/s²",
        explanation: "According to Newton's Second Law, F = ma, so acceleration a = F / m = 24 N / 6 kg = 4 m/s²."
      },
      {
        question: "Why do action and reaction forces in Newton's Third Law never cancel each other out?",
        options: [
          "They act on two completely different interacting bodies",
          "They have different magnitudes in real-world scenarios",
          "The reaction force occurs with a slight time delay after the action force",
          "They always act along parallel but non-collinear axes"
        ],
        correctAnswer: "They act on two completely different interacting bodies",
        explanation: "Action and reaction forces act simultaneously on different bodies, so they cannot cancel each other out to produce zero net force on a single body."
      }
    ],
    shortAnswers: [
      {
        question: "Explain why a passenger in a moving car is jolted forward when the brakes are suddenly applied, identifying the specific physical law involved.",
        evaluationCriteria: "Must identify Newton's First Law (Law of Inertia) and explain that the passenger's body continues in forward motion at constant velocity while the vehicle decelerates beneath them until an external force (seatbelt) stops them.",
        modelAnswer: "When the car brakes, the passenger lurches forward due to inertia (Newton's First Law). The passenger's body tends to maintain its forward state of motion at constant velocity until an external restraining force, such as a seatbelt, acts upon it to decelerate."
      },
      {
        question: "Describe how Newton's Third Law explains the forward propulsion of a rocket in the vacuum of space.",
        evaluationCriteria: "Must state that the rocket engine exerts a backward force on the exhaust gases, and the exhaust gases exert an equal and opposite forward reaction force on the rocket.",
        modelAnswer: "A rocket expels high-velocity exhaust gases backward. According to Newton's Third Law, the exhaust gases exert an equal and opposite forward thrust force on the rocket itself, propelling it forward without needing atmosphere to push against."
      }
    ]
  },
  "Data Structures": {
    mcqs: [
      {
        question: "What is the worst-case time complexity of searching for an element in an unbalanced Binary Search Tree (BST)?",
        options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"],
        correctAnswer: "O(n)",
        explanation: "In an unbalanced BST (e.g., when elements are inserted in sorted order), the tree degenerates into a linked list, leading to O(n) search time."
      },
      {
        question: "Which data structure follows the First-In, First-Out (FIFO) principle and is commonly used for Breadth-First Search (BFS)?",
        options: ["Queue", "Stack", "Binary Heap", "Hash Table"],
        correctAnswer: "Queue",
        explanation: "A Queue operates on FIFO ordering, making it the ideal structure for level-by-level traversal in Breadth-First Search."
      },
      {
        question: "How does a Hash Table achieve an average-case O(1) time complexity for lookup and insertion operations?",
        options: [
          "By using a hash function to compute an index directly from the key into an array of buckets",
          "By maintaining all keys in a self-balancing binary search tree",
          "By performing sequential binary searches across sorted memory blocks",
          "By allocating contiguous memory with pointer-linked dynamic resizing"
        ],
        correctAnswer: "By using a hash function to compute an index directly from the key into an array of buckets",
        explanation: "A hash function maps keys to array indices in constant time, allowing direct O(1) average lookup and insertion when collisions are minimized."
      }
    ],
    shortAnswers: [
      {
        question: "Compare the trade-offs between an Array and a Singly Linked List regarding random access and element insertion at the beginning.",
        evaluationCriteria: "Must mention: Arrays provide O(1) random access by index but O(n) insertion at the front due to shifting. Linked Lists require O(n) to access arbitrary indices but O(1) insertion at the head.",
        modelAnswer: "Arrays provide O(1) constant-time random access using index arithmetic, but inserting at the beginning requires O(n) time to shift elements. In contrast, a singly linked list enables O(1) insertion at the head by updating pointers, but requires O(n) time for random access by traversing from the head."
      },
      {
        question: "Explain what a hash collision is and describe one common method used to resolve collisions in Hash Tables.",
        evaluationCriteria: "Must define collision (two different keys producing the same hash index) and explain either Separate Chaining (linked lists in buckets) or Open Addressing (probing for next empty slot).",
        modelAnswer: "A hash collision occurs when two distinct keys produce the same hash code/index. A common resolution technique is Separate Chaining, where each table slot holds a linked list (or balanced tree) of all key-value pairs that hash to that specific bucket."
      }
    ]
  },
  "Calculus & Derivatives": {
    mcqs: [
      {
        question: "What does the first derivative f'(x) of a continuous, differentiable function geometrically represent at a point x = a?",
        options: [
          "The slope of the tangent line to the graph of f(x) at x = a",
          "The cumulative area under the curve between 0 and a",
          "The concavity and inflection behavior of f(x) at x = a",
          "The maximum distance of the function from the x-axis"
        ],
        correctAnswer: "The slope of the tangent line to the graph of f(x) at x = a",
        explanation: "The first derivative represents the instantaneous rate of change, which is the slope of the tangent line at that point."
      },
      {
        question: "Using the Product Rule, what is the derivative of the function h(x) = f(x) · g(x)?",
        options: [
          "f'(x)g(x) + f(x)g'(x)",
          "f'(x)g'(x)",
          "f'(x)g(x) - f(x)g'(x)",
          "(f'(x)g(x) - f(x)g'(x)) / (g(x))²"
        ],
        correctAnswer: "f'(x)g(x) + f(x)g'(x)",
        explanation: "The Product Rule states that d/dx [f(x)g(x)] = f'(x)g(x) + f(x)g'(x)."
      },
      {
        question: "What condition is necessary for a critical point x = c of a differentiable function f(x) to be an inflection point?",
        options: [
          "The second derivative f''(x) must change signs across x = c",
          "The first derivative f'(x) must equal zero and remain zero",
          "The function value f(c) must equal the global maximum",
          "The second derivative f''(c) must be strictly positive"
        ],
        correctAnswer: "The second derivative f''(x) must change signs across x = c",
        explanation: "An inflection point occurs where the concavity changes, which requires f''(x) to change signs (from positive to negative or vice versa)."
      }
    ],
    shortAnswers: [
      {
        question: "State the Chain Rule and explain its purpose in differentiating composite functions such as f(g(x)).",
        evaluationCriteria: "Must state formula d/dx[f(g(x))] = f'(g(x)) * g'(x) and explain that it differentiates the outer function evaluated at inner function multiplied by derivative of inner function.",
        modelAnswer: "The Chain Rule states that for a composite function y = f(g(x)), the derivative is dy/dx = f'(g(x)) · g'(x). It allows us to differentiate composite functions by taking the derivative of the outer function with respect to the inner function and multiplying by the derivative of the inner function."
      },
      {
        question: "How does the Second Derivative Test determine whether a critical point where f'(c) = 0 is a local maximum, local minimum, or inconclusive?",
        evaluationCriteria: "Must mention: If f''(c) > 0, it is concave up and a local minimum. If f''(c) < 0, it is concave down and a local maximum. If f''(c) = 0, the test is inconclusive.",
        modelAnswer: "At a critical point where f'(c) = 0: if f''(c) > 0, the graph is concave upward, making c a local minimum; if f''(c) < 0, the graph is concave downward, making c a local maximum; if f''(c) = 0, the test is inconclusive and the First Derivative Test must be used."
      }
    ]
  },
  "Chemical Bonding": {
    mcqs: [
      {
        question: "Which type of chemical bond is formed through the electrostatic attraction between oppositely charged ions created by electron transfer?",
        options: ["Ionic Bond", "Nonpolar Covalent Bond", "Metallic Bond", "Hydrogen Bond"],
        correctAnswer: "Ionic Bond",
        explanation: "Ionic bonding occurs when one atom transfers electrons to another, creating cations and anions held together by strong electrostatic forces."
      },
      {
        question: "What is the primary factor that determines whether a covalent bond between two atoms is polar or nonpolar?",
        options: [
          "The difference in electronegativity between the two bonded atoms",
          "The total number of valence electrons in the molecule",
          "The atomic mass ratio of the bonded elements",
          "The physical state of the substance at standard temperature"
        ],
        correctAnswer: "The difference in electronegativity between the two bonded atoms",
        explanation: "Electronegativity difference determines unequal electron sharing: a significant difference (0.4 to 1.7) yields a polar covalent bond."
      },
      {
        question: "According to VSEPR theory, what is the geometric molecular shape of a water molecule (H2O)?",
        options: ["Bent", "Linear", "Trigonal Planar", "Tetrahedral"],
        correctAnswer: "Bent",
        explanation: "Oxygen has 2 bonding pairs and 2 lone pairs, resulting in a tetrahedral electron geometry and a bent molecular geometry with a ~104.5° bond angle."
      }
    ],
    shortAnswers: [
      {
        question: "Explain the Octet Rule and describe one exception to this rule found in common chemical compounds.",
        evaluationCriteria: "Must define the Octet Rule (atoms gain, lose, or share electrons to attain 8 valence electrons). Must describe a valid exception: incomplete octet (e.g. H with 2, B with 6), expanded octet (e.g. SF6, PCl5), or odd-electron species (NO).",
        modelAnswer: "The Octet Rule states that atoms tend to form bonds until they are surrounded by 8 valence electrons, achieving a stable noble gas electron configuration. A common exception is an expanded octet, where period 3+ elements with accessible d-orbitals accommodate more than 8 electrons (e.g., SF6 has 12 electrons around sulfur)."
      },
      {
        question: "Compare the physical properties of typical ionic compounds and molecular covalent compounds regarding melting point and electrical conductivity.",
        evaluationCriteria: "Must mention: Ionic compounds have high melting points and conduct electricity when molten/dissolved (due to mobile ions). Molecular covalent compounds have lower melting points and do not conduct electricity in any state.",
        modelAnswer: "Ionic compounds have high melting points due to strong lattice electrostatic forces and conduct electricity when molten or dissolved in water because ions are free to move. In contrast, molecular covalent compounds have lower melting points due to weaker intermolecular forces and do not conduct electricity because they lack mobile charged particles."
      }
    ]
  }
};

/**
 * Generate 5 dynamic assessment questions for a given subject and topic
 */
exports.generateQuestions = async (subject, topic) => {
  if (GEMINI_API_KEY) {
    try {
      const prompt = `You are an expert academic assessment creator for an intelligent tutoring system.
Create a rigorous, highly topic-specific 5-question knowledge check for:
Subject: "${subject}"
Topic: "${topic}"

CRITICAL REQUIREMENTS:
- Exactly 5 questions: 3 Multiple Choice Questions (MCQs) and 2 Conceptual Short Answer Questions.
- EVERY question must be deeply specific to "${topic}". Do NOT generate vague or generic filler questions.
- MCQs must have 4 distinct, plausible options with exactly one correct answer and a concise explanation.
- Short Answer questions must test deep conceptual mechanisms, principles, or problem-solving scenarios, and include both evaluationCriteria (key terms and principles required for grading) and a modelAnswer.
- Return ONLY valid JSON matching this schema:
{
  "questions": [
    {
      "id": "q1",
      "type": "mcq",
      "question": "Topic-specific question text...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Exact matching string of correct option",
      "explanation": "Brief explanation of why this is correct."
    },
    {
      "id": "q2",
      "type": "mcq",
      "question": "Topic-specific question text...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Exact matching string",
      "explanation": "Explanation..."
    },
    {
      "id": "q3",
      "type": "mcq",
      "question": "Topic-specific question text...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Exact matching string",
      "explanation": "Explanation..."
    },
    {
      "id": "q4",
      "type": "short_answer",
      "question": "Conceptual question testing core mechanisms of ${topic}...",
      "evaluationCriteria": "Essential scientific/technical concepts and keywords required in student answer.",
      "modelAnswer": "Clear, complete model answer."
    },
    {
      "id": "q5",
      "type": "short_answer",
      "question": "Scenario or application-based conceptual question on ${topic}...",
      "evaluationCriteria": "Essential principles and reasoning steps required for full credit.",
      "modelAnswer": "Clear, complete model answer."
    }
  ]
}`;

      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
            responseMimeType: "application/json",
            temperature: 0.4
          }
        },
        { 
          headers: { 'Content-Type': 'application/json' }, 
          timeout: 30000 
        }
      );

      const rawText = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText);
        if (parsed.questions && parsed.questions.length === 5) {
          console.log(`[AI-ASSESSMENT] Successfully generated 5 dynamic questions via Gemini (${GEMINI_MODEL}) for ${subject} -> ${topic}`);
          return parsed.questions.map((q, idx) => ({
            id: `q${idx + 1}`,
            type: q.type || (idx < 3 ? 'mcq' : 'short_answer'),
            question: q.question,
            options: q.options || [],
            correctAnswer: q.correctAnswer || (q.options ? q.options[0] : (q.modelAnswer || '')),
            explanation: q.explanation || '',
            evaluationCriteria: q.evaluationCriteria || '',
            modelAnswer: q.modelAnswer || ''
          }));
        }
      }
    } catch (err) {
      console.warn(`[AI-ASSESSMENT] Gemini dynamic generation failed/timed out (${err.response?.data?.error?.message || err.message}). Falling back to curated domain knowledge base.`);
    }
  }

  // Resilient Domain Fallback Generation (ONLY when Gemini API fails or is unconfigured)
  return generateFallbackQuestions(subject, topic);
};

/**
 * Domain-specific fallback question generator
 */
function generateFallbackQuestions(subject, topic) {
  if (ACADEMIC_TOPIC_KNOWLEDGE[topic]) {
    const data = ACADEMIC_TOPIC_KNOWLEDGE[topic];
    return [
      ...data.mcqs.map((q, idx) => ({ id: `q${idx + 1}`, type: 'mcq', ...q })),
      ...data.shortAnswers.map((q, idx) => ({ 
        id: `q${idx + 4}`, 
        type: 'short_answer', 
        correctAnswer: q.modelAnswer || q.evaluationCriteria,
        ...q 
      }))
    ];
  }

  // Generic fallback if topic is outside curated catalog
  return [
    {
      id: "q1",
      type: "mcq",
      question: `Which fundamental principle governs the behavior and analysis of ${topic} in ${subject}?`,
      options: [
        `The foundational theoretical laws and mathematical relationships governing ${topic}`,
        `Arbitrary observational heuristics without underlying mechanisms`,
        `A localized phenomenon that contradicts standard principles of ${subject}`,
        `None of the above`
      ],
      correctAnswer: `The foundational theoretical laws and mathematical relationships governing ${topic}`,
      explanation: `${topic} is established on core systematic principles of ${subject}.`
    },
    {
      id: "q2",
      type: "mcq",
      question: `In applied problem solving for ${topic}, which systematic approach is essential?`,
      options: [
        `Identifying governing parameters, applying relevant formulas, and verifying constraints`,
        `Estimating outcomes without reference to underlying principles`,
        `Assuming static conditions regardless of dynamic variables`,
        `Disregarding boundary conditions and conservation laws`
      ],
      correctAnswer: `Identifying governing parameters, applying relevant formulas, and verifying constraints`,
      explanation: `Systematic problem solving in ${topic} requires identifying governing laws and solving step-by-step.`
    },
    {
      id: "q3",
      type: "mcq",
      question: `What represents a critical analytical requirement when working with ${topic}?`,
      options: [
        `Ensuring dimensional consistency and validating assumptions against physical or logical bounds`,
        `Assuming all relationships are linear across all operational scales`,
        `Ignoring edge cases and transient states`,
        `Treating dependent variables as completely isolated factors`
      ],
      correctAnswer: `Ensuring dimensional consistency and validating assumptions against physical or logical bounds`,
      explanation: `Rigorous analysis in ${topic} requires maintaining consistency and testing boundary conditions.`
    },
    {
      id: "q4",
      type: "short_answer",
      question: `Explain the primary conceptual mechanism of ${topic} and discuss its importance in ${subject}.`,
      evaluationCriteria: `Must accurately describe the core mechanism of ${topic} and provide a valid application or conceptual significance.`,
      modelAnswer: `${topic} operates through core theoretical and practical mechanisms that govern behavior in ${subject}, enabling predictive modeling and problem solving.`,
      correctAnswer: `${topic} operates through core theoretical and practical mechanisms that govern behavior in ${subject}.`
    },
    {
      id: "q5",
      type: "short_answer",
      question: `What key assumptions, boundary conditions, or constraints govern the validity of ${topic}?`,
      evaluationCriteria: `Must describe boundary conditions, assumptions, or operational constraints relevant to ${topic}.`,
      modelAnswer: `The validity of ${topic} depends on defined boundary conditions, standard operational assumptions, and conservation or structural constraints.`,
      correctAnswer: `The validity of ${topic} depends on defined boundary conditions and standard operational assumptions.`
    }
  ];
}

/**
 * Normalizes text for comparison (lowercase, removes punctuation, collapses whitespace)
 */
function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Deterministic pre-evaluation guard to detect question copy/repetition, trivial, or filler answers
 */
function detectInvalidOrEchoAnswer(questionText, studentAnswer, subject, topic) {
  if (!studentAnswer || typeof studentAnswer !== 'string') {
    return { isInvalid: true, status: 'unanswered', points: 0, reason: 'Empty answer provided.' };
  }

  const rawTrimmed = studentAnswer.trim();
  if (rawTrimmed.length === 0) {
    return { isInvalid: true, status: 'unanswered', points: 0, reason: 'Empty answer provided.' };
  }

  if (rawTrimmed.length < 4) {
    return { 
      isInvalid: true, 
      status: 'incorrect', 
      points: 0, 
      reason: 'Answer is too short to contain substantive explanation.' 
    };
  }

  const normQ = normalizeText(questionText);
  const normA = normalizeText(studentAnswer);
  const normSubject = normalizeText(subject);
  const normTopic = normalizeText(topic);

  // 1. Exact match between student answer and question
  if (normA === normQ) {
    return {
      isInvalid: true,
      status: 'incorrect',
      points: 0,
      reason: 'The submitted answer is an exact copy of the question without providing an explanation.'
    };
  }

  // 2. Question contains the entire student answer and student answer is sufficiently long
  if (normQ.includes(normA) && normA.length >= 12) {
    return {
      isInvalid: true,
      status: 'incorrect',
      points: 0,
      reason: 'The submitted answer is a snippet copied directly from the question prompt.'
    };
  }

  // 3. Student answer contains the entire question with only minor additions
  if (normA.includes(normQ)) {
    const remainingText = normA.replace(normQ, '').trim();
    if (remainingText.length < 15) {
      return {
        isInvalid: true,
        status: 'incorrect',
        points: 0,
        reason: 'The submitted answer copies the question prompt with negligible additional content.'
      };
    }
  }

  // 4. Lexical word overlap check against question (detect echoing)
  const qWords = normQ.split(/\s+/).filter(w => w.length > 2);
  const aWords = normA.split(/\s+/).filter(w => w.length > 2);

  if (aWords.length >= 4) {
    const qWordSet = new Set(qWords);
    const commonWords = aWords.filter(w => qWordSet.has(w));
    const uniqueNewWords = aWords.filter(w => !qWordSet.has(w) && !STOP_WORDS.has(w));

    const echoRatio = commonWords.length / aWords.length;
    // If 65%+ of the student's words are copied from the question AND they offer fewer than 4 new substantive words
    if (echoRatio >= 0.65 && uniqueNewWords.length < 4) {
      return {
        isInvalid: true,
        status: 'incorrect',
        points: 0,
        reason: 'The answer merely echoes or paraphrases the question prompt without providing an actual answer.'
      };
    }
  }

  // 5. Topic/Subject name only check
  if (normA === normTopic || normA === normSubject || normA === `${normSubject} ${normTopic}` || normA === `${normTopic} in ${normSubject}`) {
    return {
      isInvalid: true,
      status: 'incorrect',
      points: 0,
      reason: 'The submitted answer contains only the subject or topic title without an explanation.'
    };
  }

  // 6. Generic / Trivial Non-Answers
  const TRIVIAL_PHRASES = [
    'i dont know', 'i do not know', 'idk', 'no idea', 'not sure', 'dont know',
    'yes', 'no', 'none', 'na', 'n a', 'nothing', 'skip', 'as above', 'same',
    'it is important', 'because it is science', 'because science', 'test', 'hello',
    'please help', 'answers', 'explanation', 'this is the answer'
  ];

  if (TRIVIAL_PHRASES.includes(normA)) {
    return {
      isInvalid: true,
      status: 'incorrect',
      points: 0,
      reason: 'The submitted answer is generic or non-responsive.'
    };
  }

  return { isInvalid: false };
}

/**
 * Evaluate submitted assessment answers using AI semantic grading and deterministic MCQ matching
 */
exports.evaluateAssessment = async (subject, topic, questions, studentAnswers) => {
  let scoreAchieved = 0;
  const totalPossibleScore = questions.length * 2; // 2 points per question (10 max)
  const evaluatedQuestions = [];
  const strengths = [];
  const needsPractice = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const studentAnswer = studentAnswers[q.id] || studentAnswers[`q${i + 1}`] || '';
    let isCorrect = 'unanswered';
    let questionScore = 0;
    let feedback = '';

    if (!studentAnswer || studentAnswer.trim() === '') {
      isCorrect = 'unanswered';
      questionScore = 0;
      feedback = 'No answer was provided for this question.';
      needsPractice.push(`${q.type === 'mcq' ? 'MCQ' : 'Conceptual'} Q${i + 1}: Missed question on ${topic}`);
    } else if (q.type === 'mcq') {
      // Deterministic evaluation for MCQ
      const normalizedStudent = studentAnswer.trim().toLowerCase();
      const normalizedCorrect = (q.correctAnswer || '').trim().toLowerCase();

      if (normalizedStudent === normalizedCorrect || normalizedStudent.startsWith(normalizedCorrect) || normalizedCorrect.startsWith(normalizedStudent)) {
        isCorrect = 'correct';
        questionScore = 2;
        feedback = `Correct! ${q.explanation || 'Great job selecting the right answer.'}`;
        strengths.push(`MCQ Q${i + 1}: Understood ${q.question.substring(0, 45)}...`);
      } else {
        isCorrect = 'incorrect';
        questionScore = 0;
        feedback = `Incorrect. The correct answer is: "${q.correctAnswer}". ${q.explanation || ''}`;
        needsPractice.push(`MCQ Q${i + 1}: Review concepts for "${q.question.substring(0, 40)}..."`);
      }
    } else if (q.type === 'short_answer') {
      // 1. Run Pre-Evaluation Anti-Echo Guard
      const guardCheck = detectInvalidOrEchoAnswer(q.question, studentAnswer, subject, topic);
      if (guardCheck.isInvalid) {
        isCorrect = guardCheck.status;
        questionScore = guardCheck.points;
        feedback = `Incorrect (Score: 0/2). ${guardCheck.reason}`;
        needsPractice.push(`Conceptual Q${i + 1}: Answer did not provide the required explanation on "${q.question.substring(0, 35)}..."`);
      } else {
        // 2. Semantic AI grading for genuine student answers
        const gradingResult = await evaluateShortAnswerWithAI(subject, topic, q, studentAnswer);
        isCorrect = gradingResult.status;
        questionScore = gradingResult.points;
        feedback = gradingResult.feedback;

        if (questionScore === 2) {
          strengths.push(`Conceptual Q${i + 1}: Mastered core reasoning on "${q.question.substring(0, 45)}..."`);
        } else if (questionScore === 1) {
          needsPractice.push(`Conceptual Q${i + 1}: Partial understanding of "${q.question.substring(0, 40)}...". ${gradingResult.improvementTip || ''}`);
        } else {
          needsPractice.push(`Conceptual Q${i + 1}: Key misconceptions on "${q.question.substring(0, 40)}...". ${gradingResult.improvementTip || ''}`);
        }
      }
    }

    scoreAchieved += questionScore;

    evaluatedQuestions.push({
      id: q.id,
      type: q.type,
      question: q.question,
      options: q.options || [],
      correctAnswer: q.correctAnswer || q.modelAnswer || '',
      explanation: q.explanation || '',
      evaluationCriteria: q.evaluationCriteria || '',
      modelAnswer: q.modelAnswer || '',
      studentAnswer,
      isCorrect,
      score: questionScore,
      feedback
    });
  }

  const percentageScore = Math.round((scoreAchieved / totalPossibleScore) * 100);

  let masteryStatus = 'In Progress';
  if (percentageScore >= 85) {
    masteryStatus = 'Mastered';
  } else if (percentageScore >= 60) {
    masteryStatus = 'Proficient';
  } else {
    masteryStatus = 'In Progress';
  }

  return {
    questions: evaluatedQuestions,
    scoreAchieved,
    totalPossibleScore,
    percentageScore,
    masteryStatus,
    strengths: strengths.slice(0, 4),
    needsPractice: needsPractice.slice(0, 4)
  };
};

/**
 * Semantically evaluate a single short-answer response using Gemini or heuristic semantic evaluator
 */
async function evaluateShortAnswerWithAI(subject, topic, questionObj, studentAnswer) {
  if (GEMINI_API_KEY && studentAnswer && studentAnswer.length > 5) {
    try {
      const prompt = `You are a rigorous, highly objective academic evaluator grading a student's conceptual short-answer response for an intelligent tutoring system.
Subject: "${subject}"
Topic: "${topic}"
Question: "${questionObj.question}"
Evaluation Rubric / Criteria: "${questionObj.evaluationCriteria || ''}"
Model Answer: "${questionObj.modelAnswer || questionObj.correctAnswer || ''}"
Student Answer: "${studentAnswer}"

CRITICAL EVALUATION & ANTI-CHEATING RULES:
1. DETECT COPY-PASTE & QUESTION REPETITION:
   - If the student copied, echoed, or slightly paraphrased the QUESTION text instead of providing an explanation: award "status": "incorrect", "points": 0.
   - If the student merely states the topic name or writes generic filler ("it is important in real world", "because of science") without substantive facts: award "status": "incorrect", "points": 0.
   - Never award points simply because words in the student answer overlap with the question prompt.

2. SUBSTANTIVE CONCEPTUAL EVALUATION:
   - The student MUST directly address what was asked (Explain, Describe, Why, How, Compare, What assumptions, Give an example) by providing actual physical/mathematical/scientific mechanisms.
   - "correct" (2 points): Directly and accurately explains the core scientific/mathematical mechanism with the key principles specified in the rubric/model answer.
   - "partially_correct" (1 point): Demonstrates genuine partial understanding with valid reasoning, but has minor gaps, lacks completeness, or misses key justification.
   - "incorrect" (0 points): Fails to answer the question, repeats the question, contains major misconceptions, is off-topic, or provides generic filler.

Return ONLY valid JSON matching this schema:
{
  "status": "correct" | "partially_correct" | "incorrect",
  "points": 2 | 1 | 0,
  "feedback": "Concise 1-2 sentence constructive feedback specifying what was correct or what mechanism was missing.",
  "improvementTip": "Actionable concept review tip."
}`;

      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.1 }
        },
        { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
      );

      const rawText = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText);
        if (parsed.status && typeof parsed.points === 'number') {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('[AI-ASSESSMENT] Gemini short-answer grading fallback triggered:', err.message);
    }
  }

  // Heuristic domain evaluation fallback (ONLY when Gemini API is unreachable)
  return fallbackHeuristicGrading(questionObj, studentAnswer);
}

/**
 * Strict heuristic grading fallback that checks for substantive domain facts NOT in the question
 */
function fallbackHeuristicGrading(questionObj, studentAnswer) {
  const normQ = normalizeText(questionObj.question);
  const qWords = new Set(normQ.split(/\s+/));

  // Extract substantive target tokens from model answer & rubric that are NOT in the question
  const targetText = `${questionObj.modelAnswer || ''} ${questionObj.evaluationCriteria || ''}`;
  const targetTokens = new Set(
    normalizeText(targetText)
      .split(/\s+/)
      .filter(w => w.length > 3 && !qWords.has(w) && !STOP_WORDS.has(w))
  );

  // Extract student's substantive words that are NOT in the question
  const studentTokens = normalizeText(studentAnswer)
    .split(/\s+/)
    .filter(w => w.length > 3 && !qWords.has(w) && !STOP_WORDS.has(w));

  let matchedKeywords = 0;
  const matchedSet = new Set();
  for (const token of studentTokens) {
    if (targetTokens.has(token) && !matchedSet.has(token)) {
      matchedSet.add(token);
      matchedKeywords += 1;
    }
  }

  // Strict domain-fact threshold without length-based shortcuts
  if (matchedKeywords >= 3 && studentTokens.length >= 6) {
    return {
      status: 'correct',
      points: 2,
      feedback: 'Accurate conceptual explanation incorporating key domain principles.',
      improvementTip: 'Continue applying these principles to complex multi-step scenarios.'
    };
  } else if (matchedKeywords >= 2 && studentTokens.length >= 4) {
    return {
      status: 'partially_correct',
      points: 1,
      feedback: 'Demonstrated partial understanding, but your explanation could be strengthened with more detailed mechanisms.',
      improvementTip: 'Review the complete theoretical derivation and governing constraints.'
    };
  } else {
    return {
      status: 'incorrect',
      points: 0,
      feedback: 'The response does not provide the required scientific/mathematical explanation.',
      improvementTip: 'Review the core foundational principles and mechanisms for this topic.'
    };
  }
}
