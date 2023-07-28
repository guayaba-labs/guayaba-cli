import * as fs from "fs"
import * as path from "path"
import { readFile } from "jsonfile"

import { IGuayabaConfig } from "@guayaba/core"
import { config } from "../config/load-config"

export class LoadGuayabaConfigFile {
  static async load(): Promise<IGuayabaConfig> {
    const configFile = path.resolve(config.path, `guayaba-cli.json`)

    if (!fs.existsSync(configFile))
      throw new Error("file guayaba-cli.json don't exists")

    const json = await readFile(configFile)

    return json as IGuayabaConfig
  }

  static async checkIsExists(): Promise<boolean> {

    const configFile = path.resolve(config.path, `guayaba-cli.json`)

    if (fs.existsSync(configFile))
      return true

    return false
  }
}
