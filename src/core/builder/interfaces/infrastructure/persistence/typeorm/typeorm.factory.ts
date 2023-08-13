import { AbstractPersistenceInfraFactory } from "../persistence-abstract.factory"
import { IPersistenceModelInfra } from "../persistence-model.interface"
import { TypeORMPersistenceModel } from "./typeorm.persistence"

import { ModelEntity } from "../../../../../../core/database/models/entity.model"
import { BuilderConfig } from "../../../../../../core/builder/types/config-builder.type"

export class TypeORMPersistenceInfraFactory implements AbstractPersistenceInfraFactory {

  constructor(
    private entity: ModelEntity,
    private config: BuilderConfig
  ) {
    //
  }

  createPersistenceInfraEntity(): IPersistenceModelInfra {
    return new TypeORMPersistenceModel(this.entity, this.config)
  }
}