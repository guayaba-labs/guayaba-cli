import * as path from "path"
import {
  writePlainFile
} from "../../../../core"

export class ScafoldEslintFileInitializer {

  static async loadEslintFile() {

    const envFile = `
    apps/
    database/
    `

    await writePlainFile(envFile.split(" ").join(""), path.resolve(process.cwd(), `./.eslintignore`))
  }
}