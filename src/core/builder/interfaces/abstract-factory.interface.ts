import { IDomain } from "./domain/domain.interface"
import { IInfrastructure } from "./infrastructure/infrastructure.interface"
import { IUseCase } from "./application/use-case.interface"

export interface AbstractNestAppFactory {

  createUseCase(): IUseCase

  createDomain(): IDomain

  createInfrastructure(): IInfrastructure
}