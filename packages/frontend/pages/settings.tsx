import { useState } from "react"

import LineChart from "@/components/Analytics/LineChart"
import CopyText from "@/components/Blocks/CopyText"

import {
  Alert,
  Button,
  Card,
  Container,
  FocusTrap,
  Group,
  Popover,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core"
import { IconPencil, IconUserPlus } from "@tabler/icons-react"
import { NextSeo } from "next-seo"
import Router from "next/router"

import { useOrg, useUser, useCurrentProject } from "@/utils/dataHooks"
import useSWR from "swr"
import { openUpgrade } from "../components/Layout/UpgradeModal"

function Invite() {
  const { org } = useOrg()
  const plan = org?.plan

  if (plan === "free" || (plan === "pro" && org?.users?.length === 4)) {
    return (
      <Button
        variant="light"
        onClick={() => openUpgrade("team")}
        style={{ float: "right" }}
        leftSection={<IconUserPlus size="16" />}
      >
        Invite
      </Button>
    )
  }

  return (
    <Text>
      Invite link:{" "}
      <CopyText value={`${window.location.origin}/join?orgId=${org?.id}`} />
    </Text>
  )
}

function RenamableField({ defaultValue, onRename }) {
  const [focused, setFocused] = useState(false)

  const projectlyRename = (e) => {
    setFocused(false)
    onRename(e.target.value)
  }

  return focused ? (
    <FocusTrap>
      <TextInput
        defaultValue={defaultValue}
        variant="unstyled"
        h={40}
        px={10}
        onKeyPress={(e) => {
          if (e.key === "Enter") projectlyRename(e)
        }}
        onBlur={(e) => projectlyRename(e)}
      />
    </FocusTrap>
  ) : (
    <Title
      order={3}
      onClick={() => setFocused(true)}
      style={{ cursor: "pointer" }}
    >
      {defaultValue} <IconPencil size="16" />
    </Title>
  )
}

export default function AppAnalytics() {
  const { user: currentUser } = useUser()
  const { org } = useOrg()
  const {
    update: updateCurrentProject,
    currentProject,
    setCurrentProjectId,
    drop: dropCurrentProject,
  } = useCurrentProject()

  const { data: projectUsage } = useSWR(
    `/orgs/${org?.id}/usage?project=${currentProject?.id}`,
  )

  const isAdmin =
    currentUser?.id === org?.users?.find((u) => u.role === "admin")?.id

  return (
    <Container className="unblockable">
      <NextSeo title="Settings" />
      <Stack gap="lg">
        <LineChart
          title={
            <RenamableField
              defaultValue={currentProject?.name}
              onRename={(name) => updateCurrentProject(name)}
            />
          }
          range={30}
          data={projectUsage}
          formatter={(val) => `${val} runs`}
          props={["count"]}
        />

        <Card withBorder p="lg">
          <Stack gap="lg">
            <Group justify="space-between" align="center">
              <Title order={3}>Keys</Title>
              {/* <Button onClick={() => alert("TODO")}>
                Refresh Api Key
              </Button> */}
            </Group>

            <Alert
              variant="light"
              title={
                <Text fw={500}>
                  Public Tracking Key:{" "}
                  <CopyText c="green.8" value={currentProject?.id} />
                </Text>
              }
              color="green"
            >
              <Text>
                Public API keys can be used from your server or frontend code to
                track events and send requests to the API.
              </Text>
            </Alert>

            <Alert
              variant="light"
              title={
                <Text fw={500}>
                  Private Key: <CopyText c="red.8" value={org?.apiKey} />
                </Text>
              }
              color="red"
            >
              <Text>
                Private API keys should be used only on your server – they give
                read/write/delete API access to your project's resources.
              </Text>
            </Alert>
          </Stack>
        </Card>

        {isAdmin && (
          <Card withBorder p="lg" style={{ overflow: "visible" }}>
            <Stack align="start">
              <Title order={4}>Danger Zone</Title>

              <Text>
                Deleting your project is irreversible and it will delete all
                associated data.
                <br />
                We <b>cannot</b> recover your data once it&apos;s deleted.
              </Text>

              <Popover width={200} position="bottom" withArrow shadow="md">
                <Popover.Target>
                  <Button color="red">Delete Project</Button>
                </Popover.Target>
                <Popover.Dropdown>
                  <Text mb="md">
                    Are you sure you want to delete this project? This action is
                    irreversible and it will delete all associated data.
                  </Text>
                  <Button
                    color="red"
                    onClick={() => {
                      dropCurrentProject()
                      setCurrentProjectId(null)
                      Router.push("/")
                    }}
                  >
                    Delete
                  </Button>
                </Popover.Dropdown>
              </Popover>
            </Stack>
          </Card>
        )}
      </Stack>
    </Container>
  )
}
