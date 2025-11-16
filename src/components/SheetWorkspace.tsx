import { Box, Button, Card, Flex, Heading, Separator, Switch, Text } from '@radix-ui/themes'
import styled from 'styled-components'
import { useMemo, useState } from 'react'
import type { ResultSummary, Sheet, SheetMode } from '../types/sheets'
import { ResultSummary as Summary } from './ResultSummary'

type SheetWorkspaceProps = {
  sheet: Sheet | null;
  mode: SheetMode;
  onModeChange: (mode: SheetMode) => void;
  onAnswerChange: (questionIndex: number, value: string) => void;
  onCheckAnswers: () => void;
  result: ResultSummary | null;
  errorMessage: string | null;
  canCheckAnswers: boolean;
  onResetReview: () => void;
};

export function SheetWorkspace({
  sheet,
  mode,
  onModeChange,
  onAnswerChange,
  onCheckAnswers,
  result,
  errorMessage,
  canCheckAnswers,
  onResetReview,
}: SheetWorkspaceProps) {
  const defaultMultipliers = { correct: 1, incorrect: 0, noAnswer: 0 }
  const [multipliers, setMultipliers] = useState({
    correct: String(defaultMultipliers.correct),
    incorrect: String(defaultMultipliers.incorrect),
    noAnswer: String(defaultMultipliers.noAnswer),
  })

  const stats = useMemo(() => {
    if (!result) return [];
    return [
      { label: 'Correct', key: 'correct' as const, value: result.correct },
      { label: 'Incorrect', key: 'incorrect' as const, value: result.incorrect },
      { label: 'No answer', key: 'noAnswer' as const, value: result.noAnswer },
    ];
  }, [result]);

  const getMultiplierValue = (key: keyof typeof multipliers) => {
    const trimmed = multipliers[key].trim()
    if (trimmed === '') return defaultMultipliers[key]
    const parsed = Number(trimmed)
    return Number.isNaN(parsed) ? defaultMultipliers[key] : parsed
  }

  const resolvedMultipliers = {
    correct: getMultiplierValue('correct'),
    incorrect: getMultiplierValue('incorrect'),
    noAnswer: getMultiplierValue('noAnswer'),
  }

  const totalScore = result
    ? result.correct * resolvedMultipliers.correct +
      result.incorrect * resolvedMultipliers.incorrect +
      result.noAnswer * resolvedMultipliers.noAnswer
    : 0

  const handleMultiplierChange = (key: keyof typeof multipliers, nextValue: string) => {
    setMultipliers((prev) => ({ ...prev, [key]: nextValue }))
  }

  if (!sheet) {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        gap="2"
        className="empty-state"
      >
        <Heading size="4">No answersheet selected</Heading>
        <Text color="gray" align="center">
          Create a sheet or pick one from the list to start filling answers.
        </Text>
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="4" className="sheet-content">
      <Box className="sheet-header">
        <Flex justify="between" align="center" wrap="wrap" gap="2">
          <Box>
            <Heading as="h2" size="3">
              {sheet.name}
            </Heading>
            <Text size="1" color="gray">
              {sheet.questionCount} questions • {sheet.choiceCount} choices each
            </Text>
          </Box>
          <Flex align="center" gap="2" wrap="wrap">
            <Card variant="surface" className="mode-toggle-card">
              <Flex gap="2" align="center">
                <Text size="2" color="gray">
                  Switch to
                </Text>
                <Text size="2" weight="medium">
                  {mode === "answer" ? "Answer key" : "Answer mode"}
                </Text>
                <Flex className="toggle-wrapper">
                  <Switch
                    size="3"
                    checked={mode === "key"}
                    onCheckedChange={(checked) =>
                      onModeChange(checked ? "key" : "answer")
                    }
                  />
                </Flex>
              </Flex>
            </Card>
            {mode === 'review' ? (
              <Button size="3" color="gray" onClick={onResetReview}>
                Back to sheet
              </Button>
            ) : (
              <Button size="3" onClick={onCheckAnswers} disabled={!canCheckAnswers}>
                Check answers
              </Button>
            )}
          </Flex>
        </Flex>
      </Box>

      <div className="question-grid">
        {sheet.answers.map((entry, index) => {
          const isReviewMode = !!result && mode === 'review'
          const activeValue = mode === 'key' ? entry.aa : entry.ua
          const userValue = entry.ua
          const correctValue = entry.aa
          return (
            <div key={`${sheet.id}-${index}`} className="question-row">
              <Text weight="medium" size="3">
                #{(sheet.startAt ?? 1) + index}
              </Text>
              <div className="choice-grid">
                {Array.from({ length: sheet.choiceCount }, (_, choiceIndex) => {
                  const choiceValue = choiceIndex + 1
                  const isActive = activeValue === choiceValue
                  const isUserChoice = userValue === choiceValue
                  const isCorrectChoice = isReviewMode && correctValue === choiceValue
                  const isWrongUser = isReviewMode && isUserChoice && userValue !== correctValue

                  let state: ChoiceTone = 'default'
                  if (isReviewMode) {
                    if (isWrongUser) state = 'wrong'
                    else if (isCorrectChoice) state = 'correct'
                    else if (isUserChoice) state = 'user'
                  } else if (mode === 'key' && isActive) {
                    state = 'key'
                  } else if (isActive) {
                    state = 'active'
                  }

                  const handleClick = () => {
                    if (isReviewMode) return
                    onAnswerChange(index, isActive ? 'none' : String(choiceValue))
                  }

                  return (
                    <ChoiceButton key={choiceValue} state={state} onClick={handleClick} disabled={isReviewMode}>
                      {choiceValue}
                    </ChoiceButton>
                  )
                })}
              </div>
            </div>
          );
        })}
      </div>

      <Separator size="4" />

      <Summary
        result={result}
        stats={stats}
        multipliers={multipliers}
        resolvedMultipliers={resolvedMultipliers}
        onMultiplierChange={handleMultiplierChange}
        totalScore={totalScore}
        errorMessage={errorMessage}
      />
    </Flex>
  );
}

type ChoiceTone = 'default' | 'active' | 'user' | 'correct' | 'wrong' | 'key'

const choiceColors: Record<ChoiceTone, { bg: string; color: string; border: string }> = {
  default: { bg: '#fff', color: '#1f2937', border: 'var(--gray-a5, rgba(15, 23, 42, 0.12))' },
  active: {
    bg: 'var(--accent-9, #5845df)',
    color: 'var(--accent-contrast, #fff)',
    border: 'var(--accent-9, #5845df)',
  },
  user: { bg: 'var(--indigo-8)', color: '#fff', border: 'var(--indigo-8)' },
  correct: { bg: 'var(--green-9)', color: '#fff', border: 'var(--green-9)' },
  wrong: { bg: 'var(--red-9)', color: '#fff', border: 'var(--red-9)' },
  key: { bg: 'var(--indigo-9)', color: '#fff', border: 'var(--indigo-9)' },
}

const ChoiceButton = styled.button<{ state: ChoiceTone }>`
  min-width: 30px;
  min-height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border-radius: 8px;
  border: 1px solid ${({ state }) => choiceColors[state].border};
  background: ${({ state }) => choiceColors[state].bg};
  color: ${({ state }) => choiceColors[state].color};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: background-color 120ms ease, border-color 120ms ease, color 120ms ease,
    transform 160ms ease;
  padding: 0.35rem 0.75rem;
  font-size: 1rem;

  &:hover {
    transform: ${({ disabled }) => (disabled ? 'none' : 'translateY(-1px)')};
  }
`
