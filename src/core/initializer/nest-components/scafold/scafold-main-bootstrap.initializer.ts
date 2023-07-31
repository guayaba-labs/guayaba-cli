import * as path from "path"
import {
  ModeAPIEnum,
  config as configCore,
  writeFile
} from "../../../../core"

export class ScafoldFMainBootstrapInitializer {

  static async loadMainBoostrapFile(mode: string) {

    const baseUrl = path.resolve(configCore.path, `./${mode}/src`)

    const mainRestMainApi = `
    import { NestFactory } from "@nestjs/core"
    import { ValidationPipe } from "@nestjs/common"
    import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
    import { RestModule } from "./rest.module"

    async function bootstrap() {
      const app = await NestFactory.create(RestModule)

      app.enableCors({ origin: "*" })
      app.setGlobalPrefix('api')
      app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))

      const config = new DocumentBuilder()
        .setTitle("API Doc")
        .setVersion("1.0")
        .addBearerAuth(
          {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            name: "Access Token",
            description: "Enter Access Token",
            in: "header",
          },
          "access-token",
        )
        .build()

      const document = SwaggerModule.createDocument(app, config)

      SwaggerModule.setup("api", app, document)

      await app.listen(5000)
    }
    bootstrap()
    `

    const mainRestMainGrapHQL = `
    import { NestFactory } from "@nestjs/core"
    import { ValidationPipe } from "@nestjs/common"
    import { json, text, urlencoded } from "express"
    import { GrapHQLMainModule } from "./app.module"

    async function bootstrap() {
      const app = await NestFactory.create(GrapHQLMainModule)

      app.use(json({ limit: "550mb" }))
      app.use(text({ limit: "550mb" }))
      app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
      app.enableCors({ origin: "*" })
      app.use(urlencoded({ extended: true, limit: "550mb" }))

      await app.listen(5000)
    }
    bootstrap()
    `

    const contentMainFile = {
      [ModeAPIEnum.REST_API]: mainRestMainApi,
      [ModeAPIEnum.GRAPHQL]: mainRestMainGrapHQL
    }


    await writeFile(contentMainFile[mode], path.resolve(baseUrl, `./main.ts`))
  }
}