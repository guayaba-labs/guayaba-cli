import { DriverEnum } from "../enums/driver.enum"
import { IQuery } from "../interfaces/query.intrface"
import { MySQLSQLDriver } from "./drivers/mysql.query"
import { PostgreSQLDriver } from "./drivers/postgres.query"

export class QueryFactory {

  static instance(database: string): IQuery {

    switch (database) {
      case DriverEnum.POSTGRES:
        return new PostgreSQLDriver()
      case DriverEnum.MYSQL:
        return new MySQLSQLDriver()
    }
  }
}