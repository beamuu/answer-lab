import type { AnswerEntry, ResultSummary, Sheet } from '../types/sheets'

const STORAGE_KEY = 'answersheets_v1'

export const loadSheets = (): Sheet[] => {
  if (typeof window === 'undefined') return []
  try {
    const cached = window.localStorage.getItem(STORAGE_KEY)
    return cached ? (JSON.parse(cached) as Sheet[]) : []
  } catch (error) {
    console.warn('Failed to parse saved sheets', error)
    return []
  }
}

export const persistSheets = (sheets: Sheet[]) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sheets))
  } catch (error) {
    console.warn('Unable to store sheets', error)
  }
}

export const createBlankAnswers = (count: number): AnswerEntry[] =>
  Array.from({ length: count }, () => ({ ua: null, aa: null }))

export const summarizeSheet = (sheet: Sheet): ResultSummary => {
  return sheet.answers.reduce<ResultSummary>(
    (acc, answer) => {
      if (answer.ua === null || answer.ua === undefined) {
        acc.noAnswer += 1
      } else if (answer.ua === answer.aa) {
        acc.correct += 1
      } else {
        acc.incorrect += 1
      }
      return acc
    },
    { correct: 0, incorrect: 0, noAnswer: 0, total: sheet.questionCount },
  )
}

export { STORAGE_KEY }
