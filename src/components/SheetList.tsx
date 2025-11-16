import { Badge, Box, Flex, Heading, Text } from '@radix-ui/themes'
import type { Sheet } from '../types/sheets'

type SheetListProps = {
  sheets: Sheet[]
  selectedSheetId: string | null
  onSelect: (id: string) => void
}

export function SheetList({ sheets, selectedSheetId, onSelect }: SheetListProps) {
  return (
    <Box>
      <Heading as="h2" size="4">
        Your sheets
      </Heading>
      <Flex direction="column" gap="3" mt="3">
        {sheets.length === 0 && (
          <Text size="2" color="gray">
            No sheets yet. Create one to get started.
          </Text>
        )}

        {sheets.map((sheet) => {
          const isActive = sheet.id === selectedSheetId
          return (
            <button
              key={sheet.id}
              type="button"
              className={`sheet-card-button ${isActive ? 'is-active' : ''}`}
              onClick={() => onSelect(sheet.id)}
            >
              <Flex justify="between" align="start" gap="3">
                <Box>
                  <Text weight="medium">{sheet.name}</Text>
                  <Text size="2" color="gray">
                    {sheet.questionCount} questions • {sheet.choiceCount} choices
                  </Text>
                </Box>
                <Badge variant={isActive ? 'solid' : 'soft'}>{isActive ? 'Active' : 'Stored'}</Badge>
              </Flex>
              <Text size="1" color="gray">
                Updated {new Date(sheet.updatedAt).toLocaleString()}
              </Text>
            </button>
          )
        })}
      </Flex>
    </Box>
  )
}
