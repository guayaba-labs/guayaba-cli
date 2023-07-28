import { IUseCase } from "../../interfaces/use-case.interface"
import { ModelEntity } from "../../../database/models/entity.model"
import { BuilderConfig } from "../../types/config-builder.type"

export class RestApiUseCase implements IUseCase {

  constructor(
    private entity: ModelEntity,
    private config: BuilderConfig
  ) {

  }

  async writeUseCase(): Promise<void> {
    // throw new Error("Method not implemented.")
  }
}