import { RestApiDomain } from "./rest.domain"
import { RestApiUseCase } from "./rest.use-case"
import { ModelEntity } from "../../../../core/database/models/entity.model"
import { AbstractNestAppFactory } from "../../interfaces/abstract-factory.interface"
import { IDomain } from "../../interfaces/domain/domain.interface"
import { IInfrastructure } from "../../interfaces/infrastructure/infrastructure.interface"
import { IUseCase } from "../../interfaces/application/use-case.interface"
import { BuilderConfig } from "../../types/config-builder.type"
import { RestApiInfrastructure } from "./rest.insfrastructure"

export class RestApiFactory implements AbstractNestAppFactory {

  constructor(
    private entity: ModelEntity,
    private config: BuilderConfig
  ) {

  }

  createDomain(): IDomain {
    return new RestApiDomain(this.entity, this.config)
  }

  createUseCase(): IUseCase {
    return new RestApiUseCase(this.entity, this.config)
  }

  createInfrastructure(): IInfrastructure {
    return new RestApiInfrastructure(this.entity, this.config)
  }
}