export class ModelEntity {
  tableName: string
  schema: string
  columns: ModelColumn[]
}

export class ConstraintDetail {
  foreignColumn: string
  tableRef: string
  schemaRef: string
  tableColumnRef: string
}

export class ModelColumn {
  column: string
  dataType: string
  dataTypeUdt: string
  isNulleable: boolean
  isConstraint: boolean
  constraintType: string
  columnLength: number
  defaultValue: any
  constraintDetail?: ConstraintDetail
  isIndex: boolean
  enumValues: string[]
}
