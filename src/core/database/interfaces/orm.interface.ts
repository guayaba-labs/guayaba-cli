import { DataBaseSource } from "../types/database.types"

export interface ORM {

  /**
   * Get Connection By Datasource ORM
   */
  connection(driver: string): Promise<DataBaseSource>

  /**
   * Execute Query in ORM
   * @param sql
   */
  executeQuery(sql: string, driver: string): Promise<any[]>
}