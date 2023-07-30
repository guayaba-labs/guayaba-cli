import _ from "lodash"
import * as path from "path"
import * as fs from "fs"
import * as changeCase from "change-case"
import { singular } from "pluralize"

import { config } from "../../../core/config/load-config"
import { ModeAPIEnum } from "../../../core/enums/mode-api.enum"
import { ModelEntity } from "../../../core/database/models/entity.model"
import { writeFile } from "../../../core/utils/file.util"
import { singularFileNameByTable } from "../../../core/utils/pluralize.util"

export class PrefixModuleGenerator {

  static async generate(mode: string, models: ModelEntity[]) {

    const pathModule = {
      [ModeAPIEnum.REST_API]: config.restApiPath,
      [ModeAPIEnum.GRAPHQL]: config.graphqlPath,
    }

    const url = pathModule[mode]

    const schemas = _(models)
    .groupBy("schema")
    .map((items, schema) => {

      return {
        schema: schema,
        tables: _.map(items, "tableName")
      }
    })
    .value()

    // check if exists module file.
    const moduleFiles = path.resolve(url, `./main.module.ts`)

    // remove file
    if (fs.existsSync(moduleFiles)) fs.rmSync(moduleFiles, { recursive: true })

    for (const item of schemas) {

      const pathPrefix = path.resolve(url, `./${item.schema}`)

      const prefixName = changeCase.pascalCase(item.schema)

      const entitiesStr = item.tables.map((r) => {
        const refEntity = changeCase.pascalCase(r)

        return `import { ${singular(refEntity)}Module } from "./${singularFileNameByTable(r)}/${singularFileNameByTable(r)}.module"`
      })

      const entitiesNamesStr = item.tables.map((r) => {
        const refEntity = changeCase.pascalCase(r)

        return `${singular(refEntity)}Module`
      })

      const plainPrefixModule = `
      import { Module } from "@nestjs/common"

      ${entitiesStr.join(" \n")}

      @Module({
        imports: [
          ${entitiesNamesStr}
        ]
      })
      export class ${prefixName}Module {}
      `

      await writeFile(plainPrefixModule, path.resolve(pathPrefix, `./${item.schema}.module.ts`))
    }

    // create module files.

    const schemaImports = schemas.map((item) => {

      const prefixName = changeCase.pascalCase(item.schema)

      return `import { ${prefixName}Module } from "./${item.schema}/${item.schema}.module"`
    })

    const schemaNames = schemas.map((item) => {

      const prefixName = changeCase.pascalCase(item.schema)

      return `${prefixName}Module`
    })

    const plainMainModule = `
    import { Module } from "@nestjs/common"

    ${schemaImports.join(" \n")}

    @Module({
      imports: [
        ${schemaNames}
      ]
    })
    export class MainModule {}
    `

    await writeFile(plainMainModule, path.resolve(url, `./main.module.ts`))
  }
}