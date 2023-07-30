import * as fs from "fs"
import * as path from "path"
import * as changeCase from "change-case"
import { singular } from "pluralize"
import { pluralParamCase, singularFileNameByTable } from "../../../../core/utils/pluralize.util"
import { writeFile } from "../../../../core/utils/file.util"

import { ModelEntity } from "../../../database/models/entity.model"
import { BuilderConfig } from "../../types/config-builder.type"
import { IInfrastructure } from "../../interfaces/infrastructure/infrastructure.interface"

export class RestApiInfrastructure implements IInfrastructure {

  constructor(
    private entity: ModelEntity,
    private config: BuilderConfig
  ) {

  }


  getPath(): string {
    return path.resolve(this.config.path, `./infrastructure`)
  }

  getEntityName(): { entity: string; fileName: string, tableName: string } {
    return {
      entity: changeCase.pascalCase(this.entity.tableName),
      fileName: singularFileNameByTable(this.entity.tableName),
      tableName: this.entity.tableName
    }
  }

  async checkPresentationPathFolder(): Promise<void> {
    const pathEntityInfra = this.getPath()

    if (!fs.existsSync(pathEntityInfra)) fs.mkdirSync(pathEntityInfra)
  }

  async createPresentation(): Promise<void> {
    const modelPresentationPath = path.resolve(this.getPath(), `./presentation`)

    if (!fs.existsSync(modelPresentationPath)) fs.mkdirSync(modelPresentationPath)

    const plainCreatePresentationFile = `
    import { Body, Controller, Get, Param, Res, ValidationPipe, HttpStatus, Post, Put, Delete, Query } from "@nestjs/common"
    import { Response } from "express"
    import { PaginationQuery } from "@guayaba/core"

    import { ${singular(this.getEntityName().entity)}Dto } from "../../domain/dto/${this.getEntityName().fileName}.dto"
    import { ${singular(this.getEntityName().entity)}UseCase } from "../../application/${this.getEntityName().fileName}.use-case"

    @Controller("${pluralParamCase(this.getEntityName().tableName)}")
    export class ${singular(this.getEntityName().entity)}Controller {

      constructor(private readonly ${changeCase.camelCase(`${singular(this.getEntityName().entity)}`)}UseCase: ${singular(this.getEntityName().entity)}UseCase) {}

      @Get("/listPage")
      async listPage(@Query() pagination: PaginationQuery) {
        return await this.${changeCase.camelCase(`${singular(this.getEntityName().entity)}`)}UseCase.listPage(pagination)
      }

      @Get("/")
      async findAll() {
        return await this.${changeCase.camelCase(`${singular(this.getEntityName().entity)}`)}UseCase.findAll()
      }

      @Get("/:id")
      async findById(@Param("id") id: number) {
        return await this.${changeCase.camelCase(`${singular(this.getEntityName().entity)}`)}UseCase.findById(id)
      }

      @Post("/create")
      async create(@Body(new ValidationPipe) body: ${singular(this.getEntityName().entity)}Dto, @Res() res: Response) {

        const result = await this.${changeCase.camelCase(`${singular(this.getEntityName().entity)}`)}UseCase.create(body)

        return res.status(HttpStatus.OK).json(result)
      }

      @Put("/update/:id")
      async update(@Param("id") id: number, @Body(new ValidationPipe) body: ${singular(this.getEntityName().entity)}Dto, @Res() res: Response) {

        const result = await this.${changeCase.camelCase(`${singular(this.getEntityName().entity)}`)}UseCase.update(id, body)

        return res.status(HttpStatus.OK).json(result)
      }

      @Delete("/remove/:id")
      async remove(@Param("id") id: number, @Res() res: Response) {

        const result = await this.${changeCase.camelCase(`${singular(this.getEntityName().entity)}`)}UseCase.remove(id)

        return res.status(HttpStatus.OK).json(result)
      }
    }
    `

    await writeFile(plainCreatePresentationFile, path.resolve(modelPresentationPath, `./${this.getEntityName().fileName}.controller.ts`))
  }

  async createPersistence(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async createEntityModule(): Promise<void> {
    throw new Error("Method not implemented.")
  }

  async invoke(): Promise<void> {

    await this.checkPresentationPathFolder()

    await this.createPresentation()
  }

}