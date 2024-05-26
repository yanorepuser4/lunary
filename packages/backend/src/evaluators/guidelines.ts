import { Run } from "shared"
import { isOpenAIMessage, lastMsg } from "../checks"
import openai from "@/src/utils/openai"
import lunary from "lunary"

export default async function evaluate(run: Run) {
  let systemGuidelines = null

  console.log(`Evaluating guidelines`)

  if (!Array.isArray(run.input) || !run.input.every(isOpenAIMessage)) {
    throw new Error("Input must be a list of valid chat messages")
  }

  if (run.input[0].role !== "system") {
    throw new Error("No system message found to evaluate against")
  }

  systemGuidelines = run.input[0].content

  const answer = lastMsg(run.output)

  const template = await lunary.renderTemplate("guidelines", {
    guidelines: systemGuidelines,
    answer,
  })

  const res = await openai.chat.completions.create(template)

  const output = res.choices[0]?.message?.content

  if (!output) throw new Error("No output from AI")

  const result = output.split("\n")[0].toLowerCase().replace(".", "").trim()
  const reason = output.split("\n").slice(1).join("\n")

  return {
    result: result === "yes",
    reason,
  }
}