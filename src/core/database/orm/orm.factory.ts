import { ORMOptionsEnum } from "../../../core/enums/orm-options.enum"
import { ORM } from "../interfaces/orm.interface"
import { TypeORMProvider } from "./providers/typeorm.provider"

export class ORMFactory {

  static instance(orm: string): ORM {

    switch (orm) {
      case ORMOptionsEnum.TYPEORM:
        return new TypeORMProvider()
    }
  }
}