import { AbstractPersistenceInfraFactory } from "./persistence/persistence-abstract.factory"

export interface IInfrastructure {
  getPath(): string

  getEntityName(): { entity: string, fileName: string, tableName: string }

  checkPresentationPathFolder(): Promise<void>

  createPresentation(): Promise<void>

  createPersistence(): AbstractPersistenceInfraFactory

  createEntityModule(): Promise<void>

  invoke(): Promise<void>
}