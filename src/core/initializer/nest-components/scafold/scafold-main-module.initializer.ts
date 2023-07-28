import * as path from "path"
import {
  ModeAPIEnum,
  config as configCore,
  writeFile
} from "../../../../core"

export class ScafoldFMainModuleInitializer {

  static async loadMainModule(mode: string) {

    const baseUrlByMode = {
      [ModeAPIEnum.REST_API]: configCore.restApiPath,
      [ModeAPIEnum.GRAPHQL]: configCore.graphqlPath,
    }

    const createMainSubModule = `
    import { Module } from "@nestjs/common"

    @Module({
      imports: [
        //
      ],
    })
    export class MainModule {}
    `

    await writeFile(createMainSubModule, path.resolve(baseUrlByMode[mode], `./main.module.ts`))
  }
}