import * as path from "path"
import * as fs from "fs"

import {
  config as configCore,
  writeFile,
} from "../../../core"

export class DatabaseConfigurationInitializer {

  static async loadDatabaseConfiguration() {

    const configurationDatabaseUrl = path.resolve(configCore.database, './configuration')

    fs.mkdirSync(configurationDatabaseUrl)

    // creamos la carpeta de constants dentro de configuration

    const constantsConfigDatabaseUrl = path.resolve(configurationDatabaseUrl, `./constants`)

    fs.mkdirSync(constantsConfigDatabaseUrl)

    // creamos el archivo database.constant.ts
    const databaseConstantFile = `
      export const DATA_SOURCE = "DATA_SOURCE"
      `

    await writeFile(databaseConstantFile, path.resolve(constantsConfigDatabaseUrl, `./database.constant.ts`))

    // creamos la carpeta connection database providers
    const providerConfigDatabaseUrl = path.resolve(configurationDatabaseUrl, `./providers`)

    fs.mkdirSync(providerConfigDatabaseUrl)

    const databaseInfoProvider = `
      import { DataSource, getMetadataArgsStorage } from "typeorm"
      import { ConfigService } from "@nestjs/config"
      import { SnakeNamingStrategy } from "../strategies/snake-naming-strategy"

      export const DatabaseProvider = [
        {
          provide: DataSource,
          useFactory: async (configService: ConfigService) => {
            const dataSource = new DataSource({
              type: "postgres",
              applicationName: "Guayaba-API",
              host: configService.get("DB_HOST"),
              port: +configService.get("DB_PORT"),
              username: configService.get("DB_USER"),
              password: configService.get("DB_PASS"),
              database: configService.get("DB_DATABASE"),
              entities: getMetadataArgsStorage().tables.map(tbl => tbl.target),
              synchronize: false,
              logging: Boolean(configService.get("DB_LOGGING")),
              namingStrategy: new SnakeNamingStrategy(),
              useUTC: true,
              poolSize: 10
            })

            if (!dataSource.isInitialized)
              await dataSource.initialize()

            return dataSource
          },
          inject: [ConfigService]
        },
      ]
      `

    await writeFile(databaseInfoProvider, path.resolve(providerConfigDatabaseUrl, `./database.provider.ts`))

    // creamos la carpeta strategies

    const strategyConfigDatabaseUrl = path.resolve(configurationDatabaseUrl, `./strategies`)

    fs.mkdirSync(strategyConfigDatabaseUrl)

    const strategyInfoProvider = `
      import { NamingStrategyInterface, DefaultNamingStrategy } from "typeorm"
      import { snakeCase } from "typeorm/util/StringUtils"

      export class SnakeNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
        tableName(className: string, customName: string): string {
          return customName ? customName : snakeCase(className)
        }

        columnName(propertyName: string, customName: string, embeddedPrefixes: string[]): string {
          return snakeCase(embeddedPrefixes.join("_")) + (customName ? customName : snakeCase(propertyName))
        }

        relationName(propertyName: string): string {
          return snakeCase(propertyName)
        }

        joinColumnName(relationName: string, referencedColumnName: string): string {
          return snakeCase(relationName + "_" + referencedColumnName)
        }

        joinTableName(firstTableName: string, secondTableName: string, firstPropertyName: string): string {
          return snakeCase(firstTableName + "_" + firstPropertyName.replace(/\./gi, "_") + "_" + secondTableName)
        }

        joinTableColumnName(tableName: string, propertyName: string, columnName?: string): string {
          return snakeCase(tableName + "_" + (columnName ? columnName : propertyName))
        }

        classTableInheritanceParentColumnName(parentTableName: any, parentTableIdPropertyName: any): string {
          return snakeCase(parentTableName + "_" + parentTableIdPropertyName)
        }
      }
      `

    await writeFile(strategyInfoProvider, path.resolve(strategyConfigDatabaseUrl, `./snake-naming-strategy.ts`))
  }
}