import { Command, ux } from "@oclif/core"
import * as fs from "fs"
import * as path from "path"
import { GuayabaMode } from "@guayaba/core"

import {
  LoadGuayabaConfigFile,
  config as configCore,
  BuilderFacade,
  DatabaseFactory,
  singularFileNameByTable
} from "../core"


import { BuilderConfig } from "../core/builder/types/config-builder.type"
import { PrefixModuleGenerator } from "../core/builder/other-modules/prefix.module"

export class Sync extends Command {

  static override summary = `Sync`
  static override description = `Sync application Rest API / GrapHQL`

  async run() {
    try {
      const config = await LoadGuayabaConfigFile.load()

      const tables = await DatabaseFactory.load(config)

      if (tables.length === 0) throw new Error("No table(s) in your database!")


      for (const table of tables) {
        const tableName = `Sync ${table.tableName} 💣`

        ux.action.start(`Start ${tableName}`)

        const urlToMode = config.mode === GuayabaMode.REST_API
          ? configCore.restApiPath
          : configCore.graphqlPath

        const pathPrefix = path.resolve(urlToMode, `${table.schema}`)

        if (!fs.existsSync(pathPrefix)) fs.mkdirSync(pathPrefix)

        const fileName = singularFileNameByTable(table.tableName)

        const pathEntity = path.resolve(pathPrefix, `./${fileName}`)

        if (!fs.existsSync(pathEntity)) fs.mkdirSync(pathEntity)

        const configBuilder: BuilderConfig = {
          ...config,
          path: pathEntity
        }

        const builderFacade = new BuilderFacade(table, configBuilder)

        await builderFacade
          .invoke()

        ux.action.stop(`💥`)
      }

      ux.action.start("🚀 Check Modules")

      await PrefixModuleGenerator.generate(config.mode, tables)

      ux.action.stop("💥")

      this.exit(0)
    } catch (error) {
      this.error(error)
    }
  }
}
