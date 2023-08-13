import * as fs from "fs"
import * as path from "path"
import * as changeCase from "change-case"
import { singular } from "pluralize"
import { IDomain } from "../../interfaces/domain/domain.interface"
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


  async checkDomainPathFolder(): Promise<void> {

    const pathEntityDomain = this.getPath()

    if (!fs.existsSync(pathEntityDomain)) fs.mkdirSync(pathEntityDomain)
  }

  async createDto(): Promise<void> {
    const modelDtoPath = path.resolve(this.getPath(), `./dto`)

    if (!fs.existsSync(modelDtoPath)) fs.mkdirSync(modelDtoPath)

    const filePathName = path.resolve(modelDtoPath, `./${this.getEntityName().fileName}.dto.ts`)

    if (fs.existsSync(filePathName)) return

    const plainCreateDtoFile = `
    import { OmitType, PartialType } from "@nestjs/swagger"

    import { ${singular(this.getEntityName().entity)}Model } from "../model/${this.getEntityName().fileName}.model"

    export class ${singular(this.getEntityName().entity)}Dto extends PartialType(
      OmitType(${singular(this.getEntityName().entity)}Model, ['createdAt', 'updatedAt', 'deletedAt'] as const)
    ){

      // Additionals
    }
    `

    await writeFile(plainCreateDtoFile, filePathName)
  }

  async createModel(): Promise<void> {

    const modelPath = path.resolve(this.getPath(), `./model`)

    if (fs.existsSync(modelPath)) fs.rmSync(modelPath, { recursive: true })

    fs.mkdirSync(modelPath) // create model folder..

    const plainCreateModelFile = `
    import { IsNotEmpty, IsOptional } from "class-validator"
    import { ApiProperty, PartialType } from "@nestjs/swagger"
    import { BaseInputDto } from "@guayaba/core"
    import { Exclude, Expose } from "class-transformer"

    export class  ${singular(this.getEntityName().entity)}Model extends PartialType(BaseInputDto) {

      ${ColumnTypeDtoUtil.makeColumns(this.entity.columns).join(" \n")}
    }`

    await writeFile(plainCreateModelFile, path.resolve(modelPath, `./${this.getEntityName().fileName}.model.ts`))
  }

  async createRepository(): Promise<void> {
    const modelRepoPath = path.resolve(this.getPath(), `./repository`)

    if (!fs.existsSync(modelRepoPath)) fs.mkdirSync(modelRepoPath)

    const filePathName = path.resolve(modelRepoPath, `./${this.getEntityName().fileName}.interface.ts`)

    if (fs.existsSync(filePathName)) return

    const plainCreateRepoInterfaceFile = `
    import { IBaseRepository } from "@guayaba/core"

    import { ${singular(this.getEntityName().entity)}Model } from "../model/${this.getEntityName().fileName}.model"

    export interface I${singular(this.getEntityName().entity)}Repository extends IBaseRepository<${singular(this.getEntityName().entity)}Model> {
      //
    }`

    await writeFile(plainCreateRepoInterfaceFile, filePathName)
  }

  async invoke(): Promise<void> {

    await this.checkDomainPathFolder()

    await this.createModel()

    await this.createRepository()

    await this.createDto()
  }
}