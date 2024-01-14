import {
  Button,
  Card,
  Fieldset,
  Flex,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core"
import { IconCircleCheck, IconCirclePlus } from "@tabler/icons-react"
import classes from "./index.module.css"
import { FILTERS, Filter } from "shared"
import FILTERS_UI_DATA from "./UIData"
import { useMemo, useState } from "react"

function FilterCard({
  onItemClick,
  filter,
  isSelected,
}: {
  onItemClick: (id: string) => void
  filter: Filter
  isSelected: boolean
}) {
  const theme = useMantineTheme()

  const uiData = FILTERS_UI_DATA[filter.id] || FILTERS_UI_DATA["other"]

  if (!uiData) {
    return null
  }

  return (
    <Card
      key={filter.id}
      onClick={() => !filter.soon && onItemClick(filter.id)}
      withBorder
      opacity={filter.soon ? 0.5 : 1}
    >
      <Tooltip
        label={filter.description}
        withArrow
        hidden={!filter.description}
      >
        <UnstyledButton disabled={filter.soon}>
          <Flex
            justify="right"
            pos="absolute"
            top="6px"
            right="6px"
            h="30"
            w="30"
          >
            {isSelected ? (
              <IconCircleCheck size="20" color="#4589df" />
            ) : (
              <IconCirclePlus size="20" color="#bfc4cd" />
            )}
          </Flex>

          <Stack align="center" gap="0" pt="10" maw="100%">
            <uiData.icon color={theme.colors[uiData.color][7]} size="22px" />
            <Text size="xs" mt={7} fw="500" ta="center">
              {filter.name}
            </Text>
            {filter.soon && (
              <Text size="xs" mt={7} fw="500" c="dimmed">
                coming soon
              </Text>
            )}
          </Stack>
        </UnstyledButton>
      </Tooltip>
    </Card>
  )
}

export default function FiltersModal({
  filters = FILTERS,
  opened,
  setOpened,
  onFinish,
}: {
  filters: Filter[]
  opened: boolean
  setOpened: (opened: boolean) => void
  onFinish: (ids: string[]) => void
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const types = ["Basic", "Smart", "AI"]
  const [selected, setSelected] = useState<Filter[]>([])

  const filteredFilters = useMemo(() => {
    return filters.filter((filter) =>
      filter.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [filters, searchTerm])

  return (
    <Modal
      title={
        <Group>
          Checks Library
          <TextInput
            w={400}
            placeholder="Type to filter..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.currentTarget.value)}
          />
        </Group>
      }
      opened={opened}
      onClose={() => {
        setOpened(false)
      }}
      size="xl"
    >
      <Stack gap="xl">
        {types
          .filter((type) =>
            filteredFilters.some(
              (filter) => filter.uiType === type.toLowerCase(),
            ),
          )
          .map((type) => (
            <Stack key={type} gap="md">
              <Fieldset
                variant="filled"
                legend={
                  <Title mt={-3} order={3}>
                    {type}
                  </Title>
                }
              >
                <SimpleGrid cols={5} spacing="md">
                  {filteredFilters
                    .filter((filter) => filter.uiType === type.toLowerCase())
                    .map((filter) => (
                      <FilterCard
                        key={filter.id}
                        filter={filter}
                        isSelected={selected.some((s) => s.id === filter.id)}
                        onItemClick={(id) => {
                          const filter = filters.find((f) => f.id === id)

                          if (filter) {
                            setSelected((selected) => [...selected, filter])
                          }
                        }}
                      />
                    ))}
                </SimpleGrid>
              </Fieldset>
            </Stack>
          ))}
      </Stack>

      <Flex
        className={classes["footer-container"]}
        align="center"
        justify="end"
      >
        <Button
          size="xs"
          onClick={() => {
            setOpened(false)
            onFinish(selected.map((s) => s.id))
            setSelected([])
          }}
        >
          Add
        </Button>
      </Flex>
    </Modal>
  )
}
