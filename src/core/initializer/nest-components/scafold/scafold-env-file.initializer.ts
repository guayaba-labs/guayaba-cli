import * as path from "path"
import {
  writePlainFile
} from "../../../../core"

export class ScafoldEnvFileInitializer {

  static async loadEnvFile() {

    const envFile = `
    DB_HOST=localhost
    DB_USER=
    DB_PASS=
    DB_DATABASE=
    DB_PORT=
    DB_LOGGING=true
    `

    await writePlainFile(envFile.split(" ").join(""), path.resolve(process.cwd(), `./.env`))
    await writePlainFile(envFile.split(" ").join(""), path.resolve(process.cwd(), `./.env.example`))
  }
}