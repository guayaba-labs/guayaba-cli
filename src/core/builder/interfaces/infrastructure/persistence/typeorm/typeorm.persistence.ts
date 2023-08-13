import * as fs from "fs"
import * as path from "path"
import * as changeCase from "change-case"
import { singular } from "pluralize"

import { ModelEntity } from "../../../../../../core/database/models/entity.model"
import { IPersistenceModelInfra } from "../persistence-model.interface"
import { BuilderConfig } from "../../../../../../core/builder/types/config-builder.type"
import { singularFileNameByTable } from "../../../../../../core/utils/pluralize.util"
import { writeFile } from "../../../../../../core/utils/file.util"
import { DriverEnum } from "../../../../../../core/database/enums/driver.enum"
import { PostgreSQLColumnTypes, PostgreSQLForeignObject, PostgreSQLImportsForeignTables } from "../../../../../../core/utils/postgres-column-types"


export class TypeORMPersistenceModel implements IPersistenceModelInfra {

  constructor(
    private entity: ModelEntity,
    private config: BuilderConfig
  ) {

  }

  async checkPersistencePathFolder(): Promise<void> {
    const pathEntityDomain = this.getPath()

      if (!fs.existsSync(pathEntityDomain)) fs.mkdirSync(pathEntityDomain)
  }

  getPath(): string {

    const infraPath = path.resolve(this.config.path, `./infrastructure`)

    return path.resolve(infraPath, `./outbound`)
  }

  getEntityName(): { entity: string; fileName: string, tableName: string } {
    return {
      entity: changeCase.pascalCase(this.entity.tableName),
      fileName: singularFileNameByTable(this.entity.tableName),
      tableName: this.entity.tableName
    }
  }

  async createProvider(): Promise<void> {
    const pathProvider = path.resolve(this.getPath(), `./provider`)

    if (fs.existsSync(pathProvider)) fs.rmSync(pathProvider, { recursive: true })

    fs.mkdirSync(pathProvider) // create model folder..

    const provide = singular(this.getEntityName().tableName.toLocaleUpperCase())

    const plainTypeORMCreateProvider = `
    import { DataSource } from "typeorm"
    import { ${singular(this.getEntityName().entity)} } from "../entity/${this.getEntityName().fileName}.entity"

    export const ${provide}_REPOSITORY_PROVIDERS = "${provide}_REPOSITORY_PROVIDERS"
    export const ${provide}_REPOSITORY = "${provide}_REPOSITORY"

    export const ${singular(this.getEntityName().entity)}Provider = [
      {
        provide: ${provide}_REPOSITORY_PROVIDERS,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(${singular(this.getEntityName().entity)}),
        inject: [DataSource],
      }
    ];
    `

    await writeFile(plainTypeORMCreateProvider, path.resolve(pathProvider, `./${this.getEntityName().fileName}.provider.ts`))
  }

  async createEntity(): Promise<void> {
    const pathEntity = path.resolve(this.getPath(), `./entity`)

    if (fs.existsSync(pathEntity)) fs.rmSync(pathEntity, { recursive: true })

    fs.mkdirSync(pathEntity) // create model folder..

    const decoratorEntityName = (this.entity.schema && this.entity.schema !== "public")
      ? `
      @Entity({
        name: "${this.entity.tableName}",
        schema: "${this.entity.schema}"
      })
      `
      : `
      @Entity({
        name: "${this.entity.tableName}",
      })
      `

    const columns = {
      [DriverEnum.POSTGRES]: PostgreSQLColumnTypes(this.entity.columns)
    }

    const foreignTables = this.entity.columns.filter((col) => col.constraintType === "FOREIGN KEY")

    const importContrainstForeignTables = PostgreSQLImportsForeignTables(foreignTables, this.getEntityName().entity)

    const columnDriverSelected = columns[this.config.ormOptions.database]

    const foreignColumnTableObjects = {
      [DriverEnum.POSTGRES]: PostgreSQLForeignObject(foreignTables)
    }

    const foreignColumnTableSelected = foreignColumnTableObjects[this.config.ormOptions.database]

    const isIndexes = this.entity.columns.find((col) => col.isIndex == true && col.constraintType !== "PRIMARY KEY")
    const isConstraint = this.entity.columns.find((col) => col.constraintType === "FOREIGN KEY")

    const plainTypeORMCreateEntity = `
    import { BaseEntity, ModelIdentity } from "@guayaba/core"
    import { ApiProperty } from "@nestjs/swagger"
    import { Entity, PrimaryGeneratedColumn, Column, ${isConstraint ? `ManyToOne, JoinColumn, ` : ``} CreateDateColumn, UpdateDateColumn, DeleteDateColumn ${isIndexes ? `, Index` : ``} } from "typeorm"

    ${importContrainstForeignTables.join(" \n")}

    ${decoratorEntityName}
    export class ${singular(this.getEntityName().entity)} extends BaseEntity {

      ${columnDriverSelected.join(" \n")}

      // Relations
      ${foreignColumnTableSelected.join(" ")}
    }
    `

    await writeFile(plainTypeORMCreateEntity, path.resolve(pathEntity, `./${this.getEntityName().fileName}.entity.ts`))
  }

  async createService(): Promise<void> {
    const modelServicePath = path.resolve(this.getPath(), `./service`)

    if (!fs.existsSync(modelServicePath)) fs.mkdirSync(modelServicePath)

    const provide = singular(this.getEntityName().tableName.toLocaleUpperCase())

    const plainCreateServiceFile = `
    import { DataSource, Repository } from "typeorm"
    import { Inject, Injectable } from "@nestjs/common"
    import { InjectDataSource } from "@nestjs/typeorm"
    import { BaseTypeOrmService } from "@guayaba/core"

    import { ${singular(this.getEntityName().entity)} } from "../entity/${this.getEntityName().fileName}.entity"
    import { ${singular(this.getEntityName().entity)}Model } from "../../../domain/model/${this.getEntityName().fileName}.model"

    import { I${singular(this.getEntityName().entity)}Repository } from "../../../domain/repository/${this.getEntityName().fileName}.interface"
    import { ${provide}_REPOSITORY_PROVIDERS } from "../provider/${this.getEntityName().fileName}.provider"

    @Injectable()
    export class ${singular(this.getEntityName().entity)}ServiceImpl extends BaseTypeOrmService(${singular(this.getEntityName().entity)}, ${singular(this.getEntityName().entity)}Model) implements I${singular(this.getEntityName().entity)}Repository {

      constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
        @Inject(${provide}_REPOSITORY_PROVIDERS)
        private readonly engineRepository: Repository<${singular(this.getEntityName().entity)}>
      ) {
        super(dataSource, engineRepository)
      }
    }
    `

    await writeFile(plainCreateServiceFile, path.resolve(modelServicePath, `./${this.getEntityName().fileName}.service.ts`))
  }

  async invoke(): Promise<void> {

    await this.checkPersistencePathFolder()

    await this.createProvider()

    await this.createEntity()

    await this.createService()
  }
}
