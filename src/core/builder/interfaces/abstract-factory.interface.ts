import { IDomain } from "./domain.interface"
import { IUseCase } from "./use-case.interface"

export interface AbstractFactory {

  createUseCase(): IUseCase

  createDomain(): IDomain
}