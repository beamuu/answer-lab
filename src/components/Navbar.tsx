import { Flex, Heading, Button } from '@radix-ui/themes'
import { Link } from 'react-router-dom'
import { useSheets } from '../hooks/useSheets'
import { Container } from './Container'

export function Navbar() {
  const { sheets } = useSheets()
  return (
    <header className="app-nav">
      <Container style={{ paddingTop: 8, paddingBottom: 8 }}>
        <Flex align="center" justify="between" gap="3">
          <Heading size="5" weight="bold">AnswerLab</Heading>
          <Flex gap="2">
            {sheets.length > 0 && (
              <Button size="3" variant="surface" color="gray" asChild>
                <Link to="/sheet">View sheets</Link>
              </Button>
            )}
            <Button size="3" asChild>
              <Link to="/create">Create sheet</Link>
            </Button>
         </Flex>
        </Flex>
      </Container>
    </header>
  )
}
