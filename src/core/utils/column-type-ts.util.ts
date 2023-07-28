import { ModelColumn } from "../database/models/entity.model"

export const columnTypeScript = (col: ModelColumn) => {
  if (["integer", "double precision", "decimal", "bigint"].includes(col.dataType))
    return `number`
  if (["boolean"].includes(col.dataType))
    return `boolean`
  if (["USER-DEFINED"].includes(col.dataType))
    return col.enumValues.map((r) => `"${r}"`).join("|")
  if (["text", "character varying", "char"].includes(col.dataType))
    return `string`
  if (["date", "timestamp without time zone", "time without time zone", "date"].includes(col.dataType))
    return `Date`

  return `string`
}