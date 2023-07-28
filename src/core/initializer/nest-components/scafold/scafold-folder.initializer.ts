import * as fs from "fs"
import * as path from "path"
import {
  config as configCore
} from "../../../../core"

export class ScafoldFolderInitializer {

  static async loadAppDirectory(mode: string) {

    const baseUrl = path.resolve(configCore.path, `./${mode}`)

    // create folder apps/mode{rest-api|graphql}/src
    fs.mkdirSync(path.resolve(baseUrl, `./src`))

    const endPointUrlSrc = path.resolve(baseUrl, `./src`)

    // create folder apps/mode{rest-api|graphql}/src/modules
    fs.mkdirSync(path.resolve(endPointUrlSrc, `./modules`))
  }
}