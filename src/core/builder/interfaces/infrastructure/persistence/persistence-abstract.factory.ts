import { IPersistenceModelInfra } from "./persistence-model.interface"

export interface AbstractPersistenceInfraFactory {

  createPersistenceInfraEntity(): IPersistenceModelInfra
}