import { paramCase } from "change-case"
import { singular } from "pluralize"

export const singularFileNameByTable = (word: string) => {
  const replace = paramCase(word)
  return singular(replace)
}

export const pluralParamCase = (word: string) => {
  const replace = paramCase(word)
  return replace
}
