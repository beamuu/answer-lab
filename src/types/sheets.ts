export type SheetMode = 'answer' | 'key' | 'review'

export type AnswerEntry = {
  ua: number | null
  aa: number | null
}

export type Sheet = {
  id: string
  name: string
  questionCount: number
  choiceCount: number
  answers: AnswerEntry[]
  updatedAt: number
}

export type ResultSummary = {
  correct: number
  incorrect: number
  noAnswer: number
  total: number
}

export type SheetPayload = {
  name: string
  questionCount: number
  choiceCount: number
}
