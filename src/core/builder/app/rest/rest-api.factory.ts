import { ModelEntity } from "../../../../core/database/models/entity.model"
import { AbstractFactory } from "../../interfaces/abstract-factory.interface"
import { IDomain } from "../../interfaces/domain.interface"
import { IUseCase } from "../../interfaces/use-case.interface"
import { BuilderConfig } from "../../types/config-builder.type"
import { RestApiDomain } from "./rest.domain"
import { RestApiUseCase } from "./rest.use-case"

export class RestApiFactory implements AbstractFactory {

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
}