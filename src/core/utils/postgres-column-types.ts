import _ from "lodash"
import { camelCase, pascalCase, snakeCase } from "change-case"
import { singular } from "pluralize"

import { singularFileNameByTable } from "../../core/utils/pluralize.util"
import { columnTypeScript } from "../../core/utils/column-type-ts.util"

import { ModelColumn } from "../database/models/entity.model"

export function PostgreSQLColumnTypes(columns: ModelColumn[]) {
  return columns.map((col) => {

    const isPrimaryConstraint = col.constraintType === "PRIMARY KEY"

    const colName = camelCase(col.column)

    const columnTimestampz = (columnName): string => {

      if (columnName === "created_at")
        return `
          @CreateDateColumn({ type: "timestamp without time zone" })
          `

      if (columnName === "updated_at")
        return `
          @UpdateDateColumn({ type: "timestamp without time zone", default: null })
          `

      if (columnName === "deleted_at")
        return `
          @DeleteDateColumn({ type: "timestamp without time zone", default: null })
          `

      return col.isNulleable
        ? `@Column("timestamp without time zone", { default: null })`
        : `@Column("timestamp without time zone")`
    }

    const columnDecorator = {
      ["integer"]: col.isNulleable ? `@Column("int", { default: ${col.defaultValue ? +col.defaultValue : null} })` : `@Column("int")`,
      ["bigint"]: col.isNulleable ? `@Column("bigint", { default: ${col.defaultValue ? +col.defaultValue : null} })` : `@Column("bigint")`,
      ["double precision"]: col.isNulleable ? `@Column("double precision", { default: ${col.defaultValue ? +col.defaultValue : null} })` : `@Column("double precision")`,
      ["boolean"]: col.isNulleable ? `@Column("boolean", { default: ${col.defaultValue ? col.defaultValue : null} })` : `@Column("boolean")`,
      ["date"]: col.isNulleable ? `@Column("date", { default: null })` : `@Column("date")`,
      ["time without time zone"]: col.isNulleable ? `@Column("time", { default: null })` : `@Column("time")`,
      ["timestamp without time zone"]: columnTimestampz(col.column),
      ["character varying"]: col.isNulleable ? col.columnLength && col.columnLength > 0 ? `@Column("varchar", { default: null, length: ${col.columnLength} })` : `@Column("varchar", { default: null })` : col.columnLength && col.columnLength > 0 ? `@Column("varchar", { length: ${col.columnLength} })` : `@Column("varchar")`,
      ["text"]: col.isNulleable ? `@Column("text", { default: null })` : `@Column("text")`,
      ["USER-DEFINED"]: `
        @Column({
          type: "enum",
          enum: [${col.enumValues ? col.enumValues.map((r) => `"${r}"`).join(",") : ""}]
      })
      `
    }

    return `
    @ApiProperty({
      type: ${col.dataType === "USER-DEFINED" ? "String" : pascalCase(columnTypeScript(col)) },
      required: ${!col.isNulleable ? true : false }
    })
    ${col.isIndex && !isPrimaryConstraint ? `${col.constraintType === "UNIQUE" ? `@Index() @Index({ unique: true})` : `@Index()`}` : ``}
    ${isPrimaryConstraint ? `@ModelIdentity() @PrimaryGeneratedColumn()` : columnDecorator[col.dataType]}
    ${colName}: ${columnTypeScript(col)}
    `
  })
}

export function PostgreSQLImportsForeignTables(columns: ModelColumn[], entityName: string) {

  const mapperColumns = columns.map((r) => ({
    columnForeign: r.constraintDetail.foreignColumn,
    tableRef: r.constraintDetail.tableRef,
    schemaRef: r.constraintDetail.schemaRef
  }))

  const groups = _(mapperColumns)
    .groupBy("tableRef")
    .map((items, tableRef) => {

      return {
        tableRef: tableRef,
        columns: _.map(items, "columnForeign"),
        obj: _.first(items),
      }

    })
    .value()


  return groups.map((r) => {
    const refEntity = pascalCase(r.tableRef)

    return refEntity !== entityName ? `import { ${singular(refEntity)} } from "apps/rest/src/modules/${r.obj.schemaRef}/${singularFileNameByTable(r.tableRef)}/infrastructure/outbound/entity/${singularFileNameByTable(r.tableRef)}.entity"` : ``
  })
}

export function PostgreSQLForeignObject(columns: ModelColumn[]) {

  return columns.map((r) => {
    const refEntity = singular(pascalCase(r.constraintDetail.tableRef))
    const foreignEntity = singular(camelCase(r.constraintDetail.foreignColumn)).replace("Id", "")

    const colRefName = singular(camelCase(r.constraintDetail.tableColumnRef))
    const colRefForeignName = singular(snakeCase(r.constraintDetail.foreignColumn))

    return `
    @ManyToOne(() => ${refEntity}, { lazy: true, nullable: true })
    @JoinColumn([{ name: "${colRefForeignName}", referencedColumnName: "${colRefName}" }])
    ${foreignEntity}?: Promise<${refEntity}>
    `
  })
}
