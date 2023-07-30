import { GuayabaMode } from "@guayaba/core"
import { ModelEntity } from "../database/models/entity.model"
import { AbstractNestAppFactory } from "./interfaces/abstract-factory.interface"
import { BuilderConfig } from "./types/config-builder.type"
import { RestApiFactory } from "./app/rest/rest-api.factory"

export class BuilderFacade {

  constructor(
    private readonly model: ModelEntity,
    private readonly config: BuilderConfig
  ) {
    //
  }

  createBuilderFactory(): AbstractNestAppFactory {
    const builderSelection = {
      [GuayabaMode.REST_API]: new RestApiFactory(this.model, this.config)
    }

    return builderSelection[this.config.mode] as AbstractNestAppFactory
  }

  async invoke() {
    try {

      const factory = this.createBuilderFactory()

      // Domain
      const domain = factory.createDomain()

      await domain
        .invoke()

      // Application
      const useCase = factory.createUseCase()

      await useCase
        .invoke()

      // Infrastructure
      const infrastructure = factory.createInfrastructure()

      await infrastructure
        .invoke()

    } catch (error) {
      console.log('BuilderFacade', error)
    }
  }
}
