import * as fs from "fs"
import * as path from "path"
import * as changeCase from "change-case"
import { singular } from "pluralize"
import { singularFileNameByTable } from "../../../../core/utils/pluralize.util"
import { writeFile } from "../../../../core/utils/file.util"

import { IUseCase } from "../../interfaces/application/use-case.interface"
import { ModelEntity } from "../../../database/models/entity.model"
import { BuilderConfig } from "../../types/config-builder.type"

export class RestApiUseCase implements IUseCase {

  constructor(
    private entity: ModelEntity,
    private config: BuilderConfig
  ) {

  }

  getPath(): string {
    return path.resolve(this.config.path, `./application`)
  }

  getEntityName(): { entity: string; fileName: string, tableName: string } {
    return {
      entity: changeCase.pascalCase(this.entity.tableName),
      fileName: singularFileNameByTable(this.entity.tableName),
      tableName: this.entity.tableName
    }
  }

  async invoke(): Promise<void> {
    const pathApp = this.getPath()

    if (!fs.existsSync(pathApp)) fs.mkdirSync(pathApp)

    const filePathName = path.resolve(pathApp, `./${this.getEntityName().fileName}.use-case.ts`)

    if (fs.existsSync(filePathName)) return

    const provide = singular(this.getEntityName().tableName.toLocaleUpperCase())

    const plainUseCase = `
    import { UseCase } from "@guayaba/core"
    import { Inject, Injectable } from "@nestjs/common"

    import { ${singular(this.getEntityName().entity)}Model } from "../domain/model/${this.getEntityName().fileName}.model"

    import { I${singular(this.getEntityName().entity)}Repository } from "../domain/repository/${this.getEntityName().fileName}.interface"
    import { ${provide}_REPOSITORY } from "../infrastructure/outbound/provider/${this.getEntityName().fileName}.provider"

    @Injectable()
    export class ${singular(this.getEntityName().entity)}UseCase extends UseCase<${singular(this.getEntityName().entity)}Model> {

      constructor(
        @Inject(${provide}_REPOSITORY)
        private readonly ${changeCase.camelCase(`${singular(this.getEntityName().entity)}`)}Repository: I${singular(this.getEntityName().entity)}Repository
      ) {
        super(${changeCase.camelCase(`${singular(this.getEntityName().entity)}`)}Repository)
      }
    }
    `

    await writeFile(plainUseCase, filePathName)
  }
}