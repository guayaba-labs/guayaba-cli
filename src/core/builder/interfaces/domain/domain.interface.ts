export interface IDomain {

  getPath(): string

  getEntityName(): { entity: string, fileName: string }

  checkDomainPathFolder(): Promise<void>

  createDto(): Promise<void>

  createModel(): Promise<void>

  createRepository(): Promise<void>

  invoke(): Promise<void>
}