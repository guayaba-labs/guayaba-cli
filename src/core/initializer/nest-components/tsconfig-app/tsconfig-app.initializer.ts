import * as path from "path"
import {
  config as configCore,
  writeFileJson,
} from "../../../../core"

export class TsConfigAppInitializer {

  static async loadTsConfigApp(mode: string) {

    const endPointAppUrl = path.resolve(configCore.path, `./${mode}`)

    const tsConfigRestApp = {
      "extends": "../../tsconfig.json",
      "compilerOptions": {
        "declaration": false,
        "outDir": `../../dist/apps/${mode}`
      },
      "include": ["src/**/*"],
      "exclude": ["node_modules", "dist", "test", "**/*spec.ts"]
    }

    await writeFileJson(JSON.stringify(tsConfigRestApp), path.resolve(endPointAppUrl, `./tsconfig.app.json`))
  }
}