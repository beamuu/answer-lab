import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertDialog, Box, Button, Card, Flex, Heading, Separator, Text, Theme } from '@radix-ui/themes'
import { Link, Navigate, Route, Routes, useNavigate, useSearchParams } from 'react-router-dom'
import './App.css'
import { SheetCreator } from './components/SheetCreator'
import { SheetList } from './components/SheetList'
import { SheetWorkspace } from './components/SheetWorkspace'
import { createBlankAnswers, summarizeSheet } from './lib/sheets'
import { useSheets } from './hooks/useSheets'
import type { ResultSummary, SheetMode, SheetPayload, Sheet } from './types/sheets'
import { Navbar } from './components/Navbar'
import { Container } from './components/Container'

function App() {
  const { sheets, setSheets } = useSheets()
  const [selectedSheetId, setSelectedSheetId] = useState<string | null>(null)
  const [mode, setMode] = useState<SheetMode>('answer')
  const [result, setResult] = useState<ResultSummary | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [sheetPendingDelete, setSheetPendingDelete] = useState<Sheet | null>(null)
  const navigate = useNavigate()

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

const canCheckAnswers = selectedSheet ? selectedSheet.answers.every((answer) => answer.aa !== null) : false

  const handleCreateSheet = (payload: SheetPayload): Sheet => {
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
    return newSheet
  }

  const handleSelectSheet = useCallback((sheetId: string) => {
    setSelectedSheetId(sheetId)
    setResult(null)
    setErrorMessage(null)
  }, [])

  const handleCreateAndRedirect = (payload: SheetPayload) => {
    const sheet = handleCreateSheet(payload)
    navigate(`/sheet?id=${sheet.id}`)
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

  const handleExitReview = () => {
    setResult(null)
    setMode('answer')
    setErrorMessage(null)
  }

  const handleRequestDeleteSheet = (sheet: Sheet) => {
    setSheetPendingDelete(sheet)
  }

  const handleConfirmDeleteSheet = () => {
    if (!sheetPendingDelete) return
    setSheets((prevSheets) => prevSheets.filter((sheet) => sheet.id !== sheetPendingDelete.id))
    if (sheetPendingDelete.id === selectedSheetId) {
      setSelectedSheetId(null)
    }
    setResult(null)
    setErrorMessage(null)
    setSheetPendingDelete(null)
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
    setMode('review')
  }

  return (
    <Theme accentColor="grass" grayColor="sand" radius="large" scaling="100%">
      <div className="app-shell">
        <Navbar />
        <Container>
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route
              path="/create"
              element={
                <CreateView
                  sheets={sheets}
                  selectedSheetId={resolvedSheetId}
                  onSelectSheet={handleSelectSheet}
                  onDeleteSheet={handleRequestDeleteSheet}
                  onCreate={handleCreateAndRedirect}
                />
              }
            />
              <Route
                path="/sheet"
                element={
                  <SheetView
                    sheets={sheets}
                  selectedSheetId={resolvedSheetId}
                  selectedSheet={selectedSheet}
                  onSelectSheet={handleSelectSheet}
                  onDeleteSheet={handleRequestDeleteSheet}
                  mode={mode}
                    onModeChange={handleModeToggle}
                    onResetReview={handleExitReview}
                  onAnswerChange={handleAnswerChange}
                  onCheckAnswers={handleCheckAnswers}
                  result={result}
                  errorMessage={errorMessage}
                  canCheckAnswers={canCheckAnswers}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Container>

        <AlertDialog.Root open={sheetPendingDelete !== null} onOpenChange={(open) => !open && setSheetPendingDelete(null)}>
          <AlertDialog.Content style={{ maxWidth: 360 }}>
            <AlertDialog.Title>Delete sheet</AlertDialog.Title>
            <AlertDialog.Description>
              {sheetPendingDelete
                ? `Are you sure you want to delete “${sheetPendingDelete.name}”? This action cannot be undone.`
                : 'Are you sure you want to delete this sheet?'}
            </AlertDialog.Description>
            <Flex justify="end" gap="2" mt="4">
              <AlertDialog.Cancel {...({ asChild: true })}>
                <Button color="gray" variant="soft">
                  Cancel
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action {...({ asChild: true })} onClick={handleConfirmDeleteSheet}>
                <Button color="red">Delete</Button>
              </AlertDialog.Action>
            </Flex>
          </AlertDialog.Content>
        </AlertDialog.Root>
      </div>
    </Theme>
  )
}

export default App

const HomeView = () => (
  <Flex direction="column" gap="4" className="home-hero">
    <Heading size="8">Answerlab</Heading>
    <Text size="4" color="gray">
      Build answer keys, store attempts, and check tests faster than paper sheets.
    </Text>
    <Flex gap="3" wrap="wrap" className="home-hero-actions">
      <Button size="3" asChild>
        <Link to="/create">Create a sheet</Link>
      </Button>
      <Button size="3" variant="outline" asChild>
        <Link to="/sheet">View sheets</Link>
      </Button>
    </Flex>
  </Flex>
)

type CreateViewProps = {
  sheets: Sheet[]
  selectedSheetId: string | null
  onSelectSheet: (id: string) => void
  onDeleteSheet: (sheet: Sheet) => void
  onCreate: (payload: SheetPayload) => void
}

function CreateView({ sheets, selectedSheetId, onSelectSheet, onDeleteSheet, onCreate }: CreateViewProps) {
  return (
    <Flex direction="column" gap="5" className="create-page">
      <SheetCreator onCreate={onCreate} />
      <Separator size="4" />
      <SheetList
        sheets={sheets}
        selectedSheetId={selectedSheetId}
        onSelect={onSelectSheet}
        onDeleteRequest={onDeleteSheet}
      />
    </Flex>
  )
}

type SheetViewProps = {
  sheets: Sheet[]
  selectedSheetId: string | null
  selectedSheet: Sheet | null
  onSelectSheet: (id: string) => void
  onDeleteSheet: (sheet: Sheet) => void
  mode: SheetMode
  onModeChange: (mode: SheetMode) => void
  onResetReview: () => void
  onAnswerChange: (questionIndex: number, value: string) => void
  onCheckAnswers: () => void
  result: ResultSummary | null
  errorMessage: string | null
  canCheckAnswers: boolean
}

function SheetView({
  sheets,
  selectedSheetId,
  selectedSheet,
  onSelectSheet,
  onDeleteSheet,
  mode,
  onModeChange,
  onResetReview,
  onAnswerChange,
  onCheckAnswers,
  result,
  errorMessage,
  canCheckAnswers,
}: SheetViewProps) {
  const [searchParams] = useSearchParams()
  const queryId = searchParams.get('id')

  useEffect(() => {
    if (!queryId) return
    if (queryId === selectedSheetId) return
    const exists = sheets.some((sheet) => sheet.id === queryId)
    if (exists) {
      onSelectSheet(queryId)
    }
  }, [queryId, selectedSheetId, sheets, onSelectSheet])

  return (
    <Box className="sheet-grid">
      <Card className="list-panel">
        <SheetList
          sheets={sheets}
          selectedSheetId={selectedSheetId}
          onSelect={onSelectSheet}
          onDeleteRequest={onDeleteSheet}
        />
      </Card>
      <div>
                <SheetWorkspace
                  sheet={selectedSheet}
                  mode={mode}
                  onModeChange={onModeChange}
          onAnswerChange={onAnswerChange}
                  onCheckAnswers={onCheckAnswers}
                  result={result}
                  errorMessage={errorMessage}
                  canCheckAnswers={canCheckAnswers}
                  onResetReview={onResetReview}
                />
      </div>
    </Box>
  )
}
