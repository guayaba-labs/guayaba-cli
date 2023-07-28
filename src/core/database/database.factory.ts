import { IGuayabaConfig } from "@guayaba/core"
import * as _ from "lodash"

import { ConstraintDetail, ModelColumn, ModelEntity } from "./models/entity.model"
import { ORMFactory } from "./orm/orm.factory"
import { QueryFactory } from "./query/query.factory"

export class DatabaseFactory {

  static async load(guayabaConfig: IGuayabaConfig): Promise<ModelEntity[]> {

    const driver = guayabaConfig.ormOptions.database

    // me trae la SQL segun mi motor de base de datos.

    const queryFactory = QueryFactory.instance(driver)

    // elijo el orm donde voy a ejecutar mi consulta.
    const ormFactory = ORMFactory.instance(guayabaConfig.ormOptions.orm)

    const result = await ormFactory.executeQuery(queryFactory.plainQuery(), driver)

    // Construyo mi arreglo de ModelEntity en base al resultado de la consulta ejecutada por el orm de seleccion

    return result.map((item: any) => {

      // columns
      const orderColumns = _.sortBy(item.table_columns, "ordinalPosition")

      return <ModelEntity>{
        tableName: item.table_name,
        schema: item.table_schema,
        columns: orderColumns.map((col) => {
          return <ModelColumn>{
            column: col.column,
            dataType: col.dataType,
            dataTypeUdt: col.dataTypeUdt,
            isNulleable: col.isNulleable,
            isConstraint: col.isConstraint,
            constraintType: col.constraintType,
            columnLength: col.columnLength,
            defaultValue: col.defaultValue,
            constraintDetail: col.constraintDetail
              ? <ConstraintDetail>{
                foreignColumn: col.column,
                tableRef: col.constraintDetail.refTable,
                tableColumnRef: col.constraintDetail.refId,
                schemaRef: col.constraintDetail.schemaRef
              }
              : null,
            isIndex: col.isIndex,
            enumValues: col.enumValues
          }
        })
      }
    })
  }
}
