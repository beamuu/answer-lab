import { TrashIcon } from '@radix-ui/react-icons'
import { Box, Flex, Heading, IconButton, Text } from '@radix-ui/themes'
import styled from 'styled-components'
import type { Sheet } from '../types/sheets'

type SheetListProps = {
  sheets: Sheet[];
  selectedSheetId: string | null;
  onSelect: (id: string) => void;
  onDeleteRequest: (sheet: Sheet) => void;
};

export function SheetList({
  sheets,
  selectedSheetId,
  onSelect,
  onDeleteRequest,
}: SheetListProps) {
  return (
    <ListWrapper>
      <Heading as="h2" size="4">
        Your sheets
      </Heading>
      <Flex direction="column" gap="2" mt="2">
        {sheets.length === 0 && (
          <Text size="2" color="gray">
            No sheets yet. Create one to get started.
          </Text>
        )}

        {sheets.map((sheet) => {
          const isActive = sheet.id === selectedSheetId;
          return (
            <div
              key={sheet.id}
              className={`sheet-card-button ${isActive ? "is-active" : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(sheet.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onSelect(sheet.id)
                }
              }}
            >
              <Flex justify="between" align="start" gap="3">
                <Box>
                  <div>
                  <Text weight="medium" size="3">
                    {sheet.name}
                  </Text>
                  </div>
                  <div>
                    <Text size="2" color="gray">
                      {sheet.questionCount} questions • {sheet.choiceCount}{" "}
                      choices
                    </Text>
                  </div>
                </Box>
                <Flex gap="1" align="center">
                  <IconButton
                    size="1"
                    variant="soft"
                    color="gray"
                    radius="full"
                    aria-label={`Delete ${sheet.name}`}
                    onClick={(event) => {
                      event.stopPropagation()
                      onDeleteRequest(sheet)
                    }}
                  >
                    <TrashIcon />
                  </IconButton>
                </Flex>
              </Flex>
              <Text size="1" color="gray">
                Updated {new Date(sheet.updatedAt).toLocaleString()}
              </Text>
            </div>
          );
        })}
      </Flex>
    </ListWrapper>
  );
}

const ListWrapper = styled(Box)`
`
