import * as path from "path"

import {
  config as configCore,
  writeFile,
} from "../../../core"

export class DatabaseModuleInitializer {

  static async loadDatabaseModule() {

    const databaseModule = `
      import { Module } from "@nestjs/common"
      import { DatabaseProvider } from "./configuration/providers/database.provider"

      @Module({
        providers: [...DatabaseProvider],
        exports: [...DatabaseProvider],
      })
      export class DatabaseModule {}
      `

      await writeFile(databaseModule, path.resolve(configCore.database, `./database.module.ts`))
  }
}