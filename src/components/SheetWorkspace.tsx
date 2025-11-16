import { Badge, Box, Button, Callout, Card, Flex, Heading, RadioCards, Separator, Text } from '@radix-ui/themes'
import type { ResultSummary, Sheet, SheetMode } from '../types/sheets'

type SheetWorkspaceProps = {
  sheet: Sheet | null
  mode: SheetMode
  onModeChange: (mode: SheetMode) => void
  onAnswerChange: (questionIndex: number, value: string) => void
  onCheckAnswers: () => void
  result: ResultSummary | null
  errorMessage: string | null
}

const modeLabels: Record<SheetMode, string> = {
  answer: 'Answer sheet',
  key: 'Answer key',
}

export function SheetWorkspace({
  sheet,
  mode,
  onModeChange,
  onAnswerChange,
  onCheckAnswers,
  result,
  errorMessage,
}: SheetWorkspaceProps) {
  if (!sheet) {
    return (
      <Flex direction="column" align="center" justify="center" gap="3" className="empty-state">
        <Heading size="5">No answersheet selected</Heading>
        <Text color="gray" align="center">
          Create a sheet or pick one from the list to start filling answers.
        </Text>
      </Flex>
    )
  }

  const stats = result
    ? [
        { label: 'Correct', value: result.correct, accent: 'var(--accent-10, #0f9d58)' },
        { label: 'Incorrect', value: result.incorrect, accent: 'var(--red-10, #d93025)' },
        { label: 'No answer', value: result.noAnswer, accent: 'var(--gray-11, #6b7280)' },
      ]
    : []

  return (
    <Flex direction="column" gap="5">
      <Flex justify="between" align="center" wrap="wrap" gap="3">
        <Box>
          <Heading as="h2" size="5">
            {sheet.name}
          </Heading>
          <Text size="2" color="gray">
            {sheet.questionCount} questions • {sheet.choiceCount} choices each
          </Text>
        </Box>
        <Flex gap="2" className="mode-toggle">
          {(Object.keys(modeLabels) as SheetMode[]).map((key) => (
            <Button key={key} variant={mode === key ? 'solid' : 'soft'} onClick={() => onModeChange(key)}>
              {modeLabels[key]}
            </Button>
          ))}
        </Flex>
      </Flex>

      <Flex direction="column" gap="3">
        {sheet.answers.map((entry, index) => {
          const activeValue = mode === 'answer' ? entry.ua : entry.aa
          const badgeColor = activeValue !== null ? (mode === 'answer' ? 'grass' : 'iris') : 'gray'
          const badgeLabel =
            mode === 'answer'
              ? activeValue !== null
                ? `Selected ${activeValue}`
                : 'No answer'
              : activeValue !== null
                ? `Answer ${activeValue}`
                : 'No key'

          return (
            <Card key={`${sheet.id}-${index}`} className="question-card">
              <Flex justify="between" align="center">
                <Text weight="medium">Question {index + 1}</Text>
                <Badge variant="soft" color={badgeColor}>
                  {badgeLabel}
                </Badge>
              </Flex>
              <RadioCards.Root
                columns={{ initial: '2', sm: '3', md: '4' }}
                value={activeValue !== null ? String(activeValue) : 'none'}
                onValueChange={(value) => onAnswerChange(index, value)}
              >
                <RadioCards.Item value="none">Skip</RadioCards.Item>
                {Array.from({ length: sheet.choiceCount }, (_, choiceIndex) => {
                  const choiceValue = choiceIndex + 1
                  return (
                    <RadioCards.Item key={choiceValue} value={String(choiceValue)}>
                      Choice {choiceValue}
                    </RadioCards.Item>
                  )
                })}
              </RadioCards.Root>
            </Card>
          )
        })}
      </Flex>

      <Separator size="4" />

      <Flex direction="column" gap="3">
        <Flex align="center" gap="3" wrap="wrap">
          <Button size="3" onClick={onCheckAnswers}>
            Check answers
          </Button>
          <Text size="2" color="gray">
            We compare the attempt sheet with the answer key to compute stats.
          </Text>
        </Flex>

        {errorMessage && (
          <Callout.Root color="ruby">
            <Callout.Text>{errorMessage}</Callout.Text>
          </Callout.Root>
        )}

        {result ? (
          <Flex gap="3" wrap="wrap">
            {stats.map((stat) => (
              <Card key={stat.label} className="stat-card" style={{ borderColor: stat.accent }}>
                <Text size="2" color="gray">
                  {stat.label}
                </Text>
                <Heading size="6">{stat.value}</Heading>
              </Card>
            ))}
            <Card className="stat-card">
              <Text size="2" color="gray">
                Total
              </Text>
              <Heading size="6">{result.total}</Heading>
            </Card>
          </Flex>
        ) : (
          <Text size="2" color="gray">
            Run a check to see how many answers are correct, incorrect, or blank.
          </Text>
        )}
      </Flex>
    </Flex>
  )
}
