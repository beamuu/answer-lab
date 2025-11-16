import {
  Table,
  Heading,
  Text,
  TextField,
  Flex,
  Callout,
} from "@radix-ui/themes";
import type { ResultSummary } from "../types/sheets";

type Stat = {
  label: string;
  key: "correct" | "incorrect" | "noAnswer";
  value: number;
};

type ResultSummaryProps = {
  result: ResultSummary | null;
  stats: Stat[];
  multipliers: Record<"correct" | "incorrect" | "noAnswer", string>;
  resolvedMultipliers: Record<"correct" | "incorrect" | "noAnswer", number>;
  onMultiplierChange: (key: Stat["key"], value: string) => void;
  totalScore: number;
  errorMessage: string | null;
};

export function ResultSummary({
  result,
  stats,
  multipliers,
  resolvedMultipliers,
  onMultiplierChange,
  totalScore,
  errorMessage,
}: ResultSummaryProps) {
  return (
    <Flex direction="column" gap="3">
      <Heading size="4">Result summary</Heading>
      <Text size="1" color="gray">
        This is your test result and you can calculate scoring conditions here.
      </Text>

      {errorMessage && (
        <Callout.Root color="ruby">
          <Callout.Text>{errorMessage}</Callout.Text>
        </Callout.Root>
      )}

      {result ? (
        <>
          <Table.Root className="stats-table" variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Result</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Count</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>
                  Multiplier (+/-)
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Score</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {stats.map((stat) => {
                const rowScore = stat.value * resolvedMultipliers[stat.key];
                return (
                  <Table.Row key={stat.label}>
                    <Table.RowHeaderCell>{stat.label}</Table.RowHeaderCell>
                    <Table.Cell>
                      <Text>{stat.value}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <TextField.Root
                        size="2"
                        variant="soft"
                        color="gray"
                        type="number"
                        placeholder="Multiplier"
                        value={multipliers[stat.key]}
                        onChange={(event) =>
                          onMultiplierChange(stat.key, event.target.value)
                        }
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <Text>{rowScore}</Text>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
              <Table.Row>
                <Table.RowHeaderCell>Total questions</Table.RowHeaderCell>
                <Table.Cell>
                  <Text>{result.total}</Text>
                </Table.Cell>
                <Table.Cell>-</Table.Cell>
                <Table.Cell>-</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.RowHeaderCell>Total score</Table.RowHeaderCell>
                <Table.Cell>-</Table.Cell>
                <Table.Cell>-</Table.Cell>
                <Table.Cell>
                  <Text>
                    {totalScore}/{result.total * resolvedMultipliers.correct}
                  </Text>
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Root>
          <div style={{ marginTop: "40px" }}>
            <Text size="2" color="gray">
              How is your experience on our app? Please tell your friends about
              it!
            </Text>
          </div>
          {/* <Flex direction="column" gap="2" className="score-highlight">
            <Text size="4">You score is</Text>
            <Heading size="9">
              {totalScore} out of {result.total * resolvedMultipliers.correct}
            </Heading>
            
          </Flex> */}
        </>
      ) : (
        <Text size="1" color="gray">
          Run a check to see how many answers are correct, incorrect, or blank.
        </Text>
      )}
    </Flex>
  );
}
