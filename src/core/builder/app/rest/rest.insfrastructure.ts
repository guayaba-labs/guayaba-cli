import * as fs from "fs"
import * as path from "path"
import * as changeCase from "change-case"
import { singular } from "pluralize"

import { pluralParamCase, singularFileNameByTable } from "../../../../core/utils/pluralize.util"
import { writeFile } from "../../../../core/utils/file.util"

import { ModelEntity } from "../../../database/models/entity.model"
import { BuilderConfig } from "../../types/config-builder.type"
import { IInfrastructure } from "../../interfaces/infrastructure/infrastructure.interface"
import { AbstractPersistenceInfraFactory } from "../../interfaces/infrastructure/persistence/persistence-abstract.factory"
import { TypeORMPersistenceInfraFactory } from "../../interfaces/infrastructure/persistence/typeorm/typeorm.factory"

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
    const modelPresentationPath = path.resolve(this.getPath(), `./inbound`)

    if (!fs.existsSync(modelPresentationPath)) fs.mkdirSync(modelPresentationPath)

    const filePathName = path.resolve(modelPresentationPath, `./${this.getEntityName().fileName}.controller.ts`)

    if (fs.existsSync(filePathName)) return

    const auhtMode = {
      local: "JwtAuthGuard",
      firebase: "FirebaseAuthGuard"
    }

    const jwtGuardOption = auhtMode[this.config.authOptions.strategy]

    const plainCreatePresentationFile = `
    import { Response } from "express"

    import { PaginationQuery, ${jwtGuardOption} } from '@guayaba/core';
    import { ApiBearerAuth, ApiBody, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger"
    import { Body, Controller, Get, Param, Res, ValidationPipe, HttpStatus, Post, Put, Delete, Query, UseGuards } from "@nestjs/common"

    import { ${singular(this.getEntityName().entity)}Dto } from "../../domain/dto/${this.getEntityName().fileName}.dto"
    import { ${singular(this.getEntityName().entity)}UseCase } from "../../application/${this.getEntityName().fileName}.use-case"

    @Controller("${pluralParamCase(this.getEntityName().tableName)}")
    @ApiTags("${pluralParamCase(this.getEntityName().tableName)}")
    export class ${singular(this.getEntityName().entity)}Controller {

      constructor(private readonly ${changeCase.camelCase(`${singular(this.getEntityName().entity)}`)}UseCase: ${singular(this.getEntityName().entity)}UseCase) {}

      @Get("/listPage")
      @UseGuards(${jwtGuardOption})
      @ApiBearerAuth("access-token")
      async listPage(@Query() pagination: PaginationQuery) {
        return await this.${changeCase.camelCase(`${singular(this.getEntityName().entity)}`)}UseCase.listPage(pagination)
      }

      @Get("/")
      @UseGuards(${jwtGuardOption})
      @ApiBearerAuth("access-token")
      async findAll() {
        return await this.${changeCase.camelCase(`${singular(this.getEntityName().entity)}`)}UseCase.findAll()
      }

      @Get("/:id")
      @UseGuards(${jwtGuardOption})
      @ApiBearerAuth("access-token")
      async findById(@Param("id") id: number) {
        return await this.${changeCase.camelCase(`${singular(this.getEntityName().entity)}`)}UseCase.findById(id)
      }

      @Post("/create")
      @UseGuards(${jwtGuardOption})
      @ApiBearerAuth("access-token")
      async create(@Body(new ValidationPipe) body: ${singular(this.getEntityName().entity)}Dto, @Res() res: Response) {

        const result = await this.${changeCase.camelCase(`${singular(this.getEntityName().entity)}`)}UseCase.create(body)

        return res.status(HttpStatus.OK).json(result)
      }

      @Put("/update/:id")
      @UseGuards(${jwtGuardOption})
      @ApiBearerAuth("access-token")
      async update(@Param("id") id: number, @Body(new ValidationPipe) body: ${singular(this.getEntityName().entity)}Dto, @Res() res: Response) {

        const result = await this.${changeCase.camelCase(`${singular(this.getEntityName().entity)}`)}UseCase.update(id, body)

        return res.status(HttpStatus.OK).json(result)
      }

      @Delete("/remove/:id")
      @UseGuards(${jwtGuardOption})
      @ApiBearerAuth("access-token")
      async remove(@Param("id") id: number, @Res() res: Response) {

        const result = await this.${changeCase.camelCase(`${singular(this.getEntityName().entity)}`)}UseCase.remove(id)

        return res.status(HttpStatus.OK).json(result)
      }
    }
    `

    await writeFile(plainCreatePresentationFile, filePathName)
  }

  createPersistence(): AbstractPersistenceInfraFactory {

    const persistenceOptions = {
      typeorm: new TypeORMPersistenceInfraFactory(this.entity, this.config)
    }

    return persistenceOptions[this.config.ormOptions.orm] as AbstractPersistenceInfraFactory
  }

  async createEntityModule(): Promise<void> {
    const pathEntityModule = path.resolve(this.config.path, `./${this.getEntityName().fileName}.module.ts`)

    if (fs.existsSync(pathEntityModule))return

    const provide = singular(this.getEntityName().tableName.toLocaleUpperCase())

    const plainCreatePresentationFile = `
    import { Module } from "@nestjs/common"
    import { DatabaseModule } from "apps/database/database.module"
    import { ${provide}_REPOSITORY, ${singular(this.getEntityName().entity)}Provider } from "./infrastructure/outbound/provider/${this.getEntityName().fileName}.provider"
    import { ${singular(this.getEntityName().entity)}Controller } from "./infrastructure/inbound/${this.getEntityName().fileName}.controller"
    import { ${singular(this.getEntityName().entity)}UseCase } from "./application/${this.getEntityName().fileName}.use-case"
    import { ${singular(this.getEntityName().entity)}ServiceImpl } from "./infrastructure/outbound/service/${this.getEntityName().fileName}.service"

    @Module({
      imports: [
        DatabaseModule
      ],
      controllers: [
        ${singular(this.getEntityName().entity)}Controller
      ],
      providers: [
        ...${singular(this.getEntityName().entity)}Provider,
        {
          provide: ${provide}_REPOSITORY,
          useClass: ${singular(this.getEntityName().entity)}ServiceImpl
        },
        ${singular(this.getEntityName().entity)}ServiceImpl,
        ${singular(this.getEntityName().entity)}UseCase
      ],
      exports: [
        ${singular(this.getEntityName().entity)}ServiceImpl,
        ...${singular(this.getEntityName().entity)}Provider,
      ]
    })
    export class ${singular(this.getEntityName().entity)}Module {}
    `

    await writeFile(plainCreatePresentationFile, pathEntityModule)
  }

  async invoke(): Promise<void> {

    await this.checkPresentationPathFolder()

    await this.createPresentation()

    const persistenceFactory = this.createPersistence()

    const infraPersistenceModel = persistenceFactory.createPersistenceInfraEntity()

    await infraPersistenceModel
      .invoke()

    await this.createEntityModule()
  }

}