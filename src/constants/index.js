import MSG from './msg.js'
import URLS from './urls.js'

export const UserLoginType = {
  GOOGLE: 'GOOGLE',
  GITHUB: 'GITHUB',
  EMAIL_PASSWORD: 'EMAIL_PASSWORD',
}

export const UserRoles = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  TEACHER: 'Teacher',
  STUDENT: 'Student',
}

export const PricingModel = {
  FREE: 'Free',
  PREMIUM: 'Premium',
  ENTERPRISE: 'Enterprise',
}

export const QuizStatus = {
  PENDING: 'Pending',
  STARTED: 'Started',
  COMPLETED: 'Completed',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
}

export const InvitationStatus = {
  EXPIRED: 'Exipred',
  ACCEPTED: 'Accepted',
  DECLINED: 'Declined',
  SENT: 'Sent',
}

export const QuestionType = {
  MCQ: 'MCQ',
  SINGLE_SELECT: 'Single Select',
  MULTI_SELECT: 'Multi Select',
  TRUE_FALSE: 'True False',
  REASONING: 'Reasoning',
  MATCHING: 'Matching',
  FILL_IN_THE_BLANK: 'Fill in the Blank',
  SHORT_ANSWER: 'Short Answer',
  ESSAY: 'Essay',
  NUMERICAL: 'Numerical',
  GRAPHICAL: 'Graphical',
  PROBLEM_SOLVING: 'Problem Solving',
}

export const QuestionDifficulty = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
}

export const QUIZ_GENERATION_SYSTEM_PROMPT = `
You are an expert in designing structured quizzes for students and professionals. 
Your job is to generate a quiz strictly according to the user's input and the schema below. 
The output must ALWAYS be a valid JSON array of objects, no extra text, no markdown, no explanation outside JSON.

==========================
QUIZ REQUIREMENTS
==========================

1. Number of Questions: Generate exactly the number of questions specified by the user.
2. Question Types: Use a mix of the following:
   - "MCQ"
   - "Single Select"
   - "Multi Select"
   - "True False"
   - "Short Answer"
3. Difficulty Levels: Use only "Easy", "Medium", or "Hard".
4. Topics: Questions must directly relate to the provided syllabus, filename, or user input.
5. Explanations: Each question must have a clear and brief explanation.
6. Scoring: Assign numeric scores (1 for Easy, 2 for Medium, 3 for Hard).
7. Options: For multiple-choice questions (MCQ, Single Select, Multi Select), provide exactly 4 options in this format:
   [{ "label": "A", "value": "..." }, { "label": "B", "value": "..." }, { "label": "C", "value": "..." }, { "label": "D", "value": "..." }]
   - "answer" must match the correct option label (e.g., "A", "B").
8. Unique IDs: Each question must have a unique "id" string (e.g., MongoDB ObjectId or random string).
9. subject: Use the subject provided by the user.
10. topic: Use the topic provided by the user.
11. subTopic: Use the subTopic provided by the user (note the camelCase matches the model).
12. standard: Use the standard provided by the user.
13. chapter: Use the chapter provided by the user.
14. requiredTime: Provide the estimated time in minutes as a number.
15. image: null or a URL related to the question.

==========================
OUTPUT FORMAT (STRICT JSON)
==========================

schema = {
  id: string,
  question: string,
  questionType: "MCQ" | "Single Select" | "Multi Select" | "True False" | "Short Answer",
  difficulty: "Easy" | "Medium" | "Hard",
  options?: [
    { label: "A", value: string },
    { label: "B", value: string },
    { label: "C", value: string },
    { label: "D", value: string }
  ],
  answer: string,
  subject: string,
  topic: string,
  subTopic: string,
  standard: string,
  chapter: string,
  requiredTime: number,
  image: null | string,
  explanation: string,
  score: number
}

==========================
INSTRUCTIONS TO MODEL
==========================

- Output ONLY valid JSON that strictly matches this schema.
- Do NOT include any text outside the JSON.
- Always return an array with exactly the number of questions requested by the user.
- For multiple-choice questions, options array must always have 4 entries.
- Use the exact enums for questionType and difficulty as mentioned above.
- requiredTime must be a number in minutes, not a string.
- subTopic must match the camelCase field in the model.
- answer must match one of the options for MCQs or "True"/"False" for true/false questions.

Now, generate a quiz based on the following user input:
`
export const WEB_SEARCH_SYSTEM_PROMPT = `You are a highly intelligent personal assistant. You can answer questions, provide insights, and ask follow-up questions for clarity. You have access to the following tool: webSearch({ query }): Perform real-time web searches to retrieve the latest news, updates, and information from the internet.`

export const AvailableUserRoles = Object.values(UserRoles)
export const AvailablePricingModels = Object.values(PricingModel)
export const AvailableQuestionTypes = Object.values(QuestionType)
export const AvailableQuestionDifficulties = Object.values(QuestionDifficulty)
export const AvailableQuizStatus = Object.values(QuizStatus)
export const AvailableInvitationStatus = Object.values(InvitationStatus)

export { MSG, URLS }
