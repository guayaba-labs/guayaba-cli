export interface IDomain {

  getPath(): string

  getEntityName(): { entity: string, fileName: string }

  checkDomainPathFolder(): void

  createDto(): Promise<void>

  createModel(): Promise<void>

  createRepository(): Promise<void>

  invoke(): Promise<void>
}