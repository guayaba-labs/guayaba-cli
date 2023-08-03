import { Command, ux } from "@oclif/core"

import {
  InitializerFactory,
  config as configCore,
  GuayabaFileInitializer
} from "../core"
import * as fs from "fs"
import * as path from "path"

export class Init extends Command {

  static override summary = `Guayaba Init`
  static override description = `Create a new application Rest API / GrapHQL`

  async run() {
    try {

      // remove src folder
      const pathSrc = path.resolve(process.cwd(), `./src`)

      if (fs.existsSync(pathSrc)) fs.rmSync(pathSrc, { recursive: true })

      // remove is exists apps
      if (fs.existsSync(configCore.path)) fs.rmSync(configCore.path, { recursive: true })

      const pathTest = path.resolve(process.cwd(), `./test`)

      if (fs.existsSync(pathTest)) fs.rmSync(pathTest, { recursive: true })

      ux.action.start("Create apps folder")

      fs.mkdirSync(configCore.path)

      ux.action.stop("OK!")

      const { mode, strategy } = await GuayabaFileInitializer.writeGuayabaFile()

      await InitializerFactory.load(mode, strategy)

      this.exit(0)
    } catch (error: any | string) {
      this.error(error)
    }
  }
}
