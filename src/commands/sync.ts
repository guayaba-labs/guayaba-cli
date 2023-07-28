import { Command, ux } from "@oclif/core"
import {
  LoadGuayabaConfigFile,
  config as configCore,
  BuilderFacade,
  DatabaseFactory
} from "../core"
import * as fs from "fs"
import * as path from "path"

export class Sync extends Command {

  static override summary = `Sync`
  static override description = `Sync application Rest API / GrapHQL`

  async run() {
    try {
      const config = await LoadGuayabaConfigFile.load()

      const tables = await DatabaseFactory.load(config)

      if (tables.length === 0) throw new Error("No table(s) in your database!")

      const crudEntitiesPath = path.resolve(configCore.database, `entities`)

      for (const table of tables) {
        const tableName = `Sync ${table.tableName} 💣`

        ux.action.start(`Start ${tableName}`)

        const folderBySchema = path.resolve(
          crudEntitiesPath,
          `${table.schema}`
        )

        if (!fs.existsSync(folderBySchema)) fs.mkdirSync(folderBySchema)

        const builderFacade = new BuilderFacade(table, Object.assign(config, { path: folderBySchema }))

        await builderFacade
          .invoke()

        ux.action.stop(`💥`)
      }

      this.exit(0)
    } catch (error) {
      this.error(error)
    }
  }
}
