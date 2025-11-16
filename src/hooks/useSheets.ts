import { useEffect, useState } from 'react'
import type { Sheet } from '../types/sheets'
import { loadSheets, persistSheets } from '../lib/sheets'

export const useSheets = () => {
  const [sheets, setSheets] = useState<Sheet[]>(() => loadSheets())

  useEffect(() => {
    persistSheets(sheets)
  }, [sheets])

  return { sheets, setSheets }
}
