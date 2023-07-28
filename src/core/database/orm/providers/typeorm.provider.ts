import { DataSource } from "typeorm"
import { ORM } from "../../interfaces/orm.interface"
import { DataBaseSource } from "../../types/database.types"
import { config } from "dotenv"

config()

export class TypeORMProvider implements ORM {

  async connection(type: "postgres" | "mysql"): Promise<DataBaseSource> {

    const database = new DataSource({
      type: type,
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      port: +process.env.DB_PORT,
    })

    if (!database.isInitialized)
      await database.initialize()

    return database
  }

  async executeQuery(sql: string, driver: "postgres" | "mysql"): Promise<any[]> {
    const connection = await this.connection(driver) as DataSource

    return await connection.query(sql)
  }

}