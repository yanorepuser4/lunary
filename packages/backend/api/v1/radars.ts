import sql from "@/utils/db"
import Router from "koa-router"

const radars = new Router({
  prefix: "/radars",
})

radars.get("/", async (ctx) => {
  const { projectId } = ctx.state
  const rows = await sql`
    SELECT * FROM radars WHERE projectId = ${projectId}
  `
  ctx.body = rows
})

radars.post("/", async (ctx) => {
  const { projectId, orgId, userId } = ctx.state
  const { description, view, assertions, alerts } = ctx.request.body as {
    description: string
    view: any[]
    assertions: any[]
    alerts: any[]
  }

  const [row] = await sql`
    INSERT INTO radars ${sql({
      description,
      view: sql.json(view),
      assertions: sql.json(assertions),
      projectId,
      orgId,
      createdBy: userId,
    })}
    RETURNING *
  `
  ctx.body = row
})

radars.delete("/:radarId", async (ctx) => {
  const { projectId } = ctx.state
  const { radarId } = ctx.params

  const [row] = await sql`
    DELETE FROM radars
    WHERE id = ${radarId}
    AND projectId = ${projectId}
    RETURNING *
  `
  ctx.body = row
})

export default radars
