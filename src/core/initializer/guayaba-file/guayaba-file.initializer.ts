import * as inquirer from "inquirer"
import * as path from "path"
import {
  config as configCore,
  writeFileJson,
} from "../.."
import { GuayabaMode, IAuthOptions, IGuayabaConfig, IOrmOptions } from "@guayaba/core"

export class GuayabaFileInitializer {

  static async writeGuayabaFile(): Promise<{ orm: string, driver: string, mode: string, strategy: string }> {

    const selectMode: any = await inquirer.prompt([{
      name: "mode",
      message: "Select a Mode",
      type: "checkbox",
      choices: [{ name: GuayabaMode.REST_API }, { name: GuayabaMode.GRAPHQL }],
    }])

    if (selectMode.mode.length == 0)
      throw new Error("Field Mode is required")


    const selectDriver: any = await inquirer.prompt([{
      name: "database",
      message: "Select a DataBase (BD)",
      type: "checkbox",
      choices: [{ name: "postgres" }, { name: "mysql" }, { name: "mongodb" }],
    }])

    if (selectDriver.database.length == 0)
      throw new Error("Field Database is required")

    const ormListOptions = {
      "sql": [
        {
          name: "typeorm"
        },
        {
          name: "sequalize"
        },
        {
          name: "mikro-orm"
        },
      ],
      "nosql": [
        {
          name: "mongoose"
        }
      ]
    }

    const databaseLanguageOpt = selectDriver.database[0] === "postgres" || "mysql" ? "sql" : "nosql"

    const selectOrm: any = await inquirer.prompt([{
      name: "orm",
      message: "Select a ORM",
      type: "checkbox",
      choices: ormListOptions[databaseLanguageOpt],
    }])

    if (selectOrm.orm.length == 0)
      throw new Error("Field ORM is required")

    const authStrategy: any = await inquirer.prompt([{
      name: "strategy",
      message: "Select a Strategy Provider",
      type: "checkbox",
      choices: [{ name: "local" }, { name: "firebase" }, { name: "keycloak" }],
    }])

    if (authStrategy.strategy.length == 0)
      throw new Error("Field Database is required")

    const mode = selectMode.mode[0] as GuayabaMode
    const database: string = selectDriver.database[0]
    const orm: string = selectOrm.orm[0]
    const strategy: string = authStrategy.strategy[0]

    const file: IGuayabaConfig = {
      mode: mode,
      ormOptions: <IOrmOptions>{
        database: database,
        orm: orm
      },
      authOptions: <IAuthOptions>{
        strategy: strategy
      }
    }

    await writeFileJson(JSON.stringify(file), path.resolve(configCore.path, `./guayaba-cli.json`))

    return {
      orm: orm,
      driver: database,
      mode: mode,
      strategy: strategy
    }
  }
}
