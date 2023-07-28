import * as fs from "fs"
import * as path from "path"
import * as changeCase from "change-case"
import { singular } from "pluralize"
import { IDomain } from "../../interfaces/domain.interface"
import { ModelEntity } from "../../../database/models/entity.model"
import { BuilderConfig } from "../../types/config-builder.type"
import { singularFileNameByTable } from "../../../../core/utils/pluralize.util"
import { ColumnTypeDtoUtil } from "../../../../core/utils/column-type-dto.util"
import { writeFile } from "../../../../core/utils/file.util"

export class RestApiDomain implements IDomain {

  constructor(
    private entity: ModelEntity,
    private config: BuilderConfig
  ) {

  }

  getPath(): string {
    return path.resolve(this.config.path, `./domain`)
  }

  getEntityName(): { entity: string; fileName: string } {
    return {
      entity: changeCase.pascalCase(this.entity.tableName),
      fileName: singularFileNameByTable(this.entity.tableName)
    }
  }


  checkDomainPathFolder(): void {

    const pathEntityDomain = this.getPath()

    if (!fs.existsSync(pathEntityDomain)) fs.mkdirSync(pathEntityDomain)
  }

  async createDto(): Promise<void> {
    //throw new Error("Method not implemented.")
  }

  async createModel(): Promise<void> {

    const modelPath = path.resolve(this.getPath(), `./model`)

    if (fs.existsSync(modelPath)) fs.rmSync(modelPath, { recursive: true })

    const plainCreateModelFile = `
    import { IsNotEmpty, IsOptional } from "class-validator"
    import { PartialType } from "@nestjs/swagger"
    import { BaseInputDto } from "@guayaba/core"
    import { Exclude, Expose } from "class-transformer"

    export class  ${singular(this.getEntityName().entity)}Model extends PartialType(BaseInputDto) {

      ${ColumnTypeDtoUtil.makeColumns(this.entity.columns).join(" \n")}
    }`

    await writeFile(plainCreateModelFile, path.resolve(plainCreateModelFile, `./${this.getEntityName().fileName}.model.ts`))
  }

  async createRepository(): Promise<void> {
    //throw new Error("Method not implemented.")
  }

  async invoke(): Promise<void> {

    await this.createModel()

    await this.createRepository()

    await this.createDto()
  }
}