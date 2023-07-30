
export interface IInfrastructure {
  getPath(): string

  getEntityName(): { entity: string, fileName: string, tableName: string }

  checkPresentationPathFolder(): Promise<void>

  createPresentation(): Promise<void>

  createPersistence(): Promise<void>

  createEntityModule(): Promise<void>

  invoke(): Promise<void>
}