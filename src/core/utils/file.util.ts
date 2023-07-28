import * as fs from "fs"
import * as Prettier from "prettier"

export const writeFile = async (
  rendered: any,
  filePath: string
) => {

  const prettierOptions: Prettier.Options = {
    parser: "typescript",
    endOfLine: "crlf",
    tabWidth: 2,
    printWidth: 200,
    semi: false
  }

  const formattedFile = Prettier.format(rendered, prettierOptions)

  fs.writeFileSync(filePath, formattedFile, {
    encoding: "utf-8",
    flag: "w",
  })
}

export const writeFileJson = async (
  rendered: any,
  filePath: string
) => {

  const prettierOptions: Prettier.Options = {
    parser: "json",
    tabWidth: 4,
    semi: false
  }

  const formattedFile = Prettier.format(rendered, prettierOptions)

  fs.writeFileSync(filePath, formattedFile, {
    encoding: "utf-8",
    flag: "w",
  })
}

export const writePlainFile = async (
  rendered: any,
  filePath: string
) => {

  const prettierOptions: Prettier.Options = {
    parser: "markdown",
    tabWidth: 0,
    semi: false
  }

  const formattedFile = Prettier.format(rendered, prettierOptions)

  fs.writeFileSync(filePath, formattedFile, {
    encoding: "utf-8",
    flag: "w",
  })

}
