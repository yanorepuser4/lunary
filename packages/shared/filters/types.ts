export type FilterParam =
  | {
      type: "select" | "text" | "number" | "date"
      id: string
      unit?: string
      max?: number
      min?: number
      step?: number
      width?: number
      placeholder?: string
      defaultValue?: string | number | boolean
      multiple?: boolean
      options?:
        | Array<{ label: string; value: string }>
        | ((projectId: string, type: string) => string)
    }
  | {
      type: "label"
      label: string
    }

export type Filter = {
  id: string
  uiType: "basic" | "smart" | "ai"
  name: string
  description?: string
  soon?: boolean
  params: FilterParam[]
  disableInEvals?: boolean
  onlyInEvals?: boolean
  evaluator?: (run: any, params: any) => Promise<any>
  sql?: (params: any) => string // postgres sql
}
