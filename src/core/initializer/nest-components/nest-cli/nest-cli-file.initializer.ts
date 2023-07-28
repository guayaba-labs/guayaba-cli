import * as fs from "fs"
import * as path from "path"
import {
  writeFileJson,
} from "../../../../core"

export class NestCLIFIleInitializer {

  static async loadNestCLIFile(mode: string) {

    const jsonNestCli = {
      "$schema": "https://json.schemastore.org/nest-cli",
      "collection": "@nestjs/schematics",
      "sourceRoot": `apps/${mode}/src`,
      "compilerOptions": {
        "deleteOutDir": true,
        "webpack": true,
        "tsConfigPath": `apps/${mode}/tsconfig.app.json`
      },
      "monorepo": true,
      "root": `apps/${mode}`,
      "projects": {
        [`${mode}`]: {
          "type": "application",
          "root": `apps/${mode}`,
          "entryFile": "main",
          "sourceRoot": `apps/${mode}/src`,
          "compilerOptions": {
            "tsConfigPath": `apps/${mode}/tsconfig.app.json`
          }
        }
      }
    }

    const nestCliFile = path.resolve(process.cwd(), `./nest-cli.json`)

    if (fs.existsSync(nestCliFile)) fs.rmSync(nestCliFile, { recursive: true })

    await writeFileJson(JSON.stringify(jsonNestCli), path.resolve(process.cwd(), `./nest-cli.json`))
  }
}