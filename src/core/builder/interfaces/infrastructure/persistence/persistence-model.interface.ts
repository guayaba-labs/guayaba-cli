export interface IPersistenceModelInfra {

  getPath(): string

  getEntityName(): { entity: string, fileName: string, tableName: string }

  checkPersistencePathFolder(): Promise<void>

  createProvider(): Promise<void>

  createEntity(): Promise<void>

  createService(): Promise<void>

  invoke(): Promise<void>
}