export interface IUseCase {
  getPath(): string

  getEntityName(): { entity: string, fileName: string, tableName: string }

  invoke(): Promise<void>
}