import * as path from "path"
import {
  ModeAPIEnum,
  config as configCore,
  writeFile
} from "../../../../core"

export class ScafoldFMainAppModuleInitializer {

  static async loadMainAppModule(mode: string, strategy) {

    const baseUrl = path.resolve(configCore.path, `./${mode}/src`)

    const authMode = {
      local: `

      `,
      firebase: `

      `
    }

    const authModeSelect = authMode[strategy]

    const mainRestMainApi = `
    import { Module } from "@nestjs/common"
    import { AuthModule, AuthModeProvider } from "@guayaba/core"
    import { ConfigModule } from "@nestjs/config"
    import { UserPayload } from "./config/jwt-auth.config"
    import { MainModule } from "./modules/main.module"
    import { DatabaseModule } from "apps/database/database.module"

    @Module({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        AuthModule.forRoot({
          provide: AuthModeProvider.LOCAL,
          authUserOption: {
            userFieldId: "userId",
            userFieldUsername: "username",
            userClass: null, // <-- User Object here
            userMapperClass: UserPayload
          },
          jwtOption: {
            expireIn: "7 day"
          }
        }, {
          imports: [
            DatabaseModule
          ]
        }),
        MainModule
      ],
      providers: [],
    })
    export class RestModule {}
    `

    const mainRestMainGrapHQL = `
    import { Module } from "@nestjs/common"
    import { ConfigModule } from "@nestjs/config"
    import { MainModule } from "./modules/main.module"

    @Module({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        MainModule
      ],
      providers: [],
    })
    export class GrapHQLMainModule {}
    `

    const contentMainFile = {
      [ModeAPIEnum.REST_API]: mainRestMainApi,
      [ModeAPIEnum.GRAPHQL]: mainRestMainGrapHQL
    }


    await writeFile(contentMainFile[mode], path.resolve(baseUrl, `./rest.module.ts`))
  }
}
