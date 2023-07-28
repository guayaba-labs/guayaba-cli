import { camelCase, pascalCase } from "change-case"
import { ModelColumn } from "../database/models/entity.model"
import { columnTypeScript } from "./column-type-ts.util"


export class ColumnTypeDtoUtil {

  static makeColumns(columns: ModelColumn[], isGrapHQL: boolean = false): string[] {

    let columnsStr: string[] = []

    for (const column of columns) {

      if (column.constraintType === "PRIMARY KEY")
        continue

      if (column.column === "created_at" || column.column === "updated_at" || column.column === "deleted_at")
        continue

      //

      const colName = camelCase(column.column)

      const columnStr = `
      @ApiProperty({
        type: ${column.dataType === "USER-DEFINED" ? "String" : pascalCase(columnTypeScript(column)) },
        required: ${!column.isNulleable ? true : false }
      })
      ${column.isNulleable  ? `@IsOptional()`: `@IsNotEmpty()` }
      ${colName}: ${column.dataType === "USER-DEFINED" ? "string" : columnTypeScript(column)}
      `

      columnsStr = [...columnsStr, columnStr]
    }

    return columnsStr
  }
}