import { useMemo, useState } from 'react'
import { Box, Card, Container, Flex, Heading, Separator, Text, Theme } from '@radix-ui/themes'
import './App.css'
import { SheetCreator } from './components/SheetCreator'
import { SheetList } from './components/SheetList'
import { SheetWorkspace } from './components/SheetWorkspace'
import { createBlankAnswers, summarizeSheet } from './lib/sheets'
import { useSheets } from './hooks/useSheets'
import type { ResultSummary, SheetMode, SheetPayload, Sheet } from './types/sheets'

function App() {
  const { sheets, setSheets } = useSheets()
  const [selectedSheetId, setSelectedSheetId] = useState<string | null>(null)
  const [mode, setMode] = useState<SheetMode>('answer')
  const [result, setResult] = useState<ResultSummary | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const resolvedSheetId = useMemo(() => {
    if (!sheets.length) return null
    if (selectedSheetId && sheets.some((sheet) => sheet.id === selectedSheetId)) {
      return selectedSheetId
    }
    return sheets[0].id
  }, [sheets, selectedSheetId])

  const selectedSheet = useMemo(
    () => sheets.find((sheet) => sheet.id === resolvedSheetId) ?? null,
    [sheets, resolvedSheetId],
  )

  const handleCreateSheet = (payload: SheetPayload) => {
    const newSheet: Sheet = {
      id: crypto.randomUUID(),
      name: payload.name,
      questionCount: payload.questionCount,
      choiceCount: payload.choiceCount,
      answers: createBlankAnswers(payload.questionCount),
      updatedAt: Date.now(),
    }

    setSheets((prev) => [newSheet, ...prev])
    setSelectedSheetId(newSheet.id)
    setResult(null)
    setErrorMessage(null)
  }

  const handleSelectSheet = (sheetId: string) => {
    setSelectedSheetId(sheetId)
    setResult(null)
    setErrorMessage(null)
  }

  const handleAnswerChange = (questionIndex: number, value: string) => {
    if (!selectedSheet) return
    const numericValue = value === 'none' ? null : Number(value)
    const targetField = mode === 'answer' ? 'ua' : 'aa'

    setSheets((prevSheets) =>
      prevSheets.map((sheet) => {
        if (sheet.id !== selectedSheet.id) return sheet
        const updatedAnswers = sheet.answers.map((entry, index) => {
          if (index !== questionIndex) return entry
          return { ...entry, [targetField]: numericValue }
        })
        return { ...sheet, answers: updatedAnswers, updatedAt: Date.now() }
      }),
    )

    setResult(null)
    setErrorMessage(null)
  }

  const handleModeToggle = (nextMode: SheetMode) => {
    setMode(nextMode)
  }

  const handleCheckAnswers = () => {
    if (!selectedSheet) {
      setErrorMessage('Create a sheet first.')
      return
    }

    const hasMissingKey = selectedSheet.answers.some((answer) => answer.aa === null)
    if (hasMissingKey) {
      setErrorMessage('Complete the answer key before checking the sheet.')
      setResult(null)
      return
    }

    setErrorMessage(null)
    setResult(summarizeSheet(selectedSheet))
  }

  return (
    <Theme accentColor="iris" grayColor="sand" radius="large" scaling="105%">
      <div className="app-shell">
        <Container size="4">
          <Flex direction="column" gap="5">
            <Box className="page-header">
              <Heading size="8">Answersheet lab</Heading>
              <Text size="3" color="gray">
                Create a sheet, track attempts, switch into answer-key mode, and check the results in one place.
              </Text>
            </Box>

            <Box className="sheet-grid">
              <Card className="panel">
                <Flex direction="column" gap="4">
                  <SheetCreator onCreate={handleCreateSheet} />
                  <Separator size="4" />
                  <SheetList sheets={sheets} selectedSheetId={resolvedSheetId} onSelect={handleSelectSheet} />
                </Flex>
              </Card>

              <Card className="panel">
                <SheetWorkspace
                  sheet={selectedSheet}
                  mode={mode}
                  onModeChange={handleModeToggle}
                  onAnswerChange={handleAnswerChange}
                  onCheckAnswers={handleCheckAnswers}
                  result={result}
                  errorMessage={errorMessage}
                />
              </Card>
            </Box>
          </Flex>
        </Container>
      </div>
    </Theme>
  )
}

export default App
