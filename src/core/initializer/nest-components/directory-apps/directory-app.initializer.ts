import * as fs from "fs"
import * as path from "path"
import { ux } from "@oclif/core"
import {
  config as configCore,
  writeFileJson,
} from "../../../../core"

export class DirectoryAppInitializer {

  static async loadAppDirectory(mode: string) {
    fs.mkdirSync(path.resolve(configCore.path, `./${mode}`))
  }
}