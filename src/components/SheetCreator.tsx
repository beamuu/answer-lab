import { useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Box, Button, Flex, Heading, Text, TextField, Callout } from '@radix-ui/themes'
import type { SheetPayload } from '../types/sheets'

type SheetCreatorProps = {
  onCreate: (payload: SheetPayload) => void
}

const DEFAULT_FORM = { name: '', questions: '10', choices: '4' }

export function SheetCreator({ onCreate }: SheetCreatorProps) {
  const [formState, setFormState] = useState(DEFAULT_FORM)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isSubmitDisabled = useMemo(
    () => !formState.name.trim() || !formState.questions || !formState.choices,
    [formState],
  )

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = formState.name.trim()
    if (!trimmedName) {
      setErrorMessage('Please give the sheet a name.')
      return
    }

    const questionCount = Math.max(1, Number(formState.questions))
    const choiceCount = Math.max(1, Number(formState.choices))

    if (!Number.isFinite(questionCount) || !Number.isFinite(choiceCount)) {
      setErrorMessage('Numbers only for questions and choices.')
      return
    }

    onCreate({ name: trimmedName, questionCount, choiceCount })
    setFormState((prev) => ({ ...prev, name: '' }))
    setErrorMessage(null)
  }

  const handleFieldChange =
    (field: keyof typeof formState) => (event: ChangeEvent<HTMLInputElement>) => {
      setFormState((prev) => ({ ...prev, [field]: event.target.value }))
    }

  return (
    <Box asChild>
      <form onSubmit={handleSubmit} className="sheet-form">
        <Box>
          <Heading as="h2" size="8">
            Create sheet
          </Heading>
          <Text size="2" color="gray" style={{ marginTop: 4 }}>
            Name it, pick the number of questions, set how many choices each question has, and you are
            ready to go.
          </Text>
        </Box>

        <label>
          <Text size="3" weight="medium">
            Sheet name
          </Text>
          <TextField.Root
            value={formState.name}
            placeholder="Biology mock #1"
            onChange={handleFieldChange('name')}
          />
        </label>

        <Flex gap="2" wrap="wrap">
          <label className="input-stack">
            <Text size="3" weight="medium">
              Questions
            </Text>
            <TextField.Root
              type="number"
              min="1"
              value={formState.questions}
              onChange={handleFieldChange('questions')}
            />
          </label>
          <label className="input-stack">
            <Text size="3" weight="medium">
              Choices
            </Text>
            <TextField.Root
              type="number"
              min="1"
              value={formState.choices}
              onChange={handleFieldChange('choices')}
            />
          </label>
        </Flex>

        {errorMessage && (
          <Callout.Root color="ruby">
            <Callout.Text>{errorMessage}</Callout.Text>
          </Callout.Root>
        )}

        <Button type="submit" size="3" disabled={isSubmitDisabled}>
          Add answersheet
        </Button>
      </form>
    </Box>
  )
}
