import * as path from "path"
import {
  ModeAPIEnum,
  config as configCore,
  writeFile
} from "../../../../core"

export class ScafoldFMainAppModuleInitializer {

  static async loadMainAppModule(mode: string) {

    const baseUrl = path.resolve(configCore.path, `./${mode}/src`)

    const mainRestMainApi = `
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
