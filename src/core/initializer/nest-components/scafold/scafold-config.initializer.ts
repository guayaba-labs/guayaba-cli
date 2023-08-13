import * as path from "path"
import * as fs from "fs"
import {
  ModeAPIEnum,
  config as configCore,
  writeFile
} from "../../../../core"

export class ScafoldConfigInitializer {

  static async loadConfigModule(mode: string) {

    const baseUrl = path.resolve(configCore.path, `./${mode}/src`)

    const configPath = path.resolve(baseUrl, `./config`)

    fs.mkdirSync(configPath)

    const mainPayloadUserJwt = `
    import { JWTUserPayload } from "@guayaba/core"
    import { Exclude, Expose } from "class-transformer"

    export class UserPayload implements JWTUserPayload {

      @Expose()
      userId: string

      @Expose()
      username: string

      @Exclude()
      password: string

      @Expose()
      createdAt: Date

      @Expose()
      updatedAt: Date

      @Exclude()
      deletedAt: Date
    }
    `

    await writeFile(mainPayloadUserJwt, path.resolve(configPath, `./jwt-auth.config.ts`))
  }
}
