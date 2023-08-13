import { ux } from "@oclif/core"
import * as fs from "fs"
import { execSync } from "child_process"

import {
  DatabaseConfigurationInitializer,
  ScafoldEslintFileInitializer,
  config as configCore
} from "../../core"

import { NestCLIFIleInitializer } from "./nest-components/nest-cli/nest-cli-file.initializer"
import { DirectoryAppInitializer } from "./nest-components/directory-apps/directory-app.initializer"
import { TsConfigAppInitializer } from "./nest-components/tsconfig-app/tsconfig-app.initializer"
import { ScafoldFolderInitializer } from "./nest-components/scafold/scafold-folder.initializer"
import { ScafoldFMainModuleInitializer } from "./nest-components/scafold/scafold-main-module.initializer"
import { ScafoldFMainBootstrapInitializer } from "./nest-components/scafold/scafold-main-bootstrap.initializer"
import { ScafoldFMainAppModuleInitializer } from "./nest-components/scafold/scafold-main-app.initializer"
import { ScafoldEnvFileInitializer } from "./nest-components/scafold/scafold-env-file.initializer"
import { ScafoldGitIgnoreInitializer } from "./nest-components/scafold/scafold-gitignore.initializer"
import { DatabaseModuleInitializer } from './database/database-module.initializer'
import { ScafoldConfigInitializer } from "./nest-components/scafold/scafold-config.initializer"

export class InitializerFactory {

  static async load(mode: string, strategy: string) {

    // create or update nest-cli.json

    ux.action.start("Update nest-cli.json")

    await NestCLIFIleInitializer.loadNestCLIFile(mode)

    ux.action.stop("OK!")

    // create subapp folders

    ux.action.start(`Create Folder SubApps mode ${mode}`)

    await DirectoryAppInitializer.loadAppDirectory(mode)

    ux.action.stop("OK!")

    // create tsconfig.app.json

    ux.action.start(`Generate tsconfig.app.json Main Module ${mode}`)

    await TsConfigAppInitializer.loadTsConfigApp(mode)

    ux.action.stop("OK!")

    // create folder scafold folder and files

    ux.action.start(`Generate scafold folder Main Modules ${mode}`)

    await ScafoldFolderInitializer.loadAppDirectory(mode)

    ux.action.stop("OK!")

    ux.action.start(`Generate Main Module file in ${mode}`)

    await ScafoldFMainModuleInitializer.loadMainModule(mode)

    ux.action.stop("OK!")

    // create main.ts file

    ux.action.start(`Generate main.ts file in ${mode}`)

    await ScafoldFMainBootstrapInitializer.loadMainBoostrapFile(mode)

    ux.action.stop("OK!")

    // create app.module.ts

    ux.action.start(`Generate Config payload JWT User jwt-auth.config.ts in ${mode}`)

    await ScafoldConfigInitializer.loadConfigModule(mode)

    ux.action.stop("OK!")

    ux.action.start(`Generate app.module.ts file in ${mode}`)

    await ScafoldFMainAppModuleInitializer.loadMainAppModule(mode, strategy)

    ux.action.stop("OK!")

    // installing dependencies

    ux.action.start(`Installing Required Dependencies ${mode}`)

    await execSync('npm i --save class-validator class-transformer @nestjs/config dotenv --legacy-peer-deps')
    await execSync('npm i --save @guayaba/core webpack webpack-cli --legacy-peer-deps')

    ux.action.stop(`Ok`)

    ux.action.start(`Installing ORM Dependencies ${mode}`)

    await execSync('npm i --save typeorm @nestjs/typeorm @nestjs/swagger pg mysql2 @nestjs/mongoose mongoose --legacy-peer-deps')

    ux.action.stop(`Ok`)

    ux.action.start(`Installing Security Dependencies ${mode}`)

    await execSync('npm i --save @nestjs/jwt @nestjs/passport @types/passport-jwt @types/passport-local passport passport-jwt jwks-rsa passport-local bcrypt --legacy-peer-deps')
    await execSync('npm i --save-dev @types/bcrypt --legacy-peer-deps')

    ux.action.stop(`Ok`)

    // add .env file

    ux.action.start(`create .env file in ${mode}`)

    await ScafoldEnvFileInitializer.loadEnvFile()

    ux.action.stop(`Ok`)

    // create .gitigore file

    ux.action.start(`create .gitignore file in ${mode}`)

    await ScafoldGitIgnoreInitializer.loadGitIgnore()

    ux.action.stop(`Ok`)

    // create .eslintignore file

    ux.action.start(`create .eslintignore file in ${mode}`)

    await ScafoldEslintFileInitializer.loadEslintFile()

    ux.action.stop(`Ok`)

    // create folder database

    ux.action.start(`Creating folder database in ${mode}`)

    const databaseUrl = configCore.database

    if (fs.existsSync(databaseUrl)) fs.rmSync(databaseUrl, { recursive: true })

    fs.mkdirSync(databaseUrl)

    ux.action.stop(`OK`)

    // create database module

    ux.action.start(`Creating database module in ${mode}`)

    await DatabaseModuleInitializer.loadDatabaseModule()

    ux.action.stop(`OK`)

    // create configuration database

    ux.action.start(`Creating config database in ${mode}`)

    await DatabaseConfigurationInitializer.loadDatabaseConfiguration()

    ux.action.stop(`OK`)
  }
}
