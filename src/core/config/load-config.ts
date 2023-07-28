import * as path from "path"

export const config = {
  path: path.resolve(process.cwd(), "./apps"),
  database: path.resolve(process.cwd(), `./apps/database`),
  restApiPath: path.resolve(process.cwd(), `./apps/rest/src/modules`),
  graphqlPath: path.resolve(process.cwd(), `./apps/graphql/src/modules`),
}