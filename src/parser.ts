/* eslint-disable @typescript-eslint/ban-ts-comment */
import YAML from 'js-yaml'
import fs from 'fs'
import {Format, ContentNode, FormatParser} from './types'

export const formatGuesser = (filename: string): Format => {
  if (filename.endsWith(Format.JSON)) {
    return Format.JSON
  }
  if (filename.endsWith(Format.YAML) || filename.endsWith('yml')) {
    return Format.YAML
  }

  return Format.UNKNOWN
}

const readFile = (filePath: string): string => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`could not parse file with path: ${filePath}`)
  }

  return fs.readFileSync(filePath, 'utf8')
}

const validateContent = <T>(content: T | undefined, format: Format): T => {
  if (typeof content !== 'object') {
    throw new Error(`could not parse content as ${format.toUpperCase()}`)
  }

  return content
}

const YAMLParser = {
  convert<T extends ContentNode>(filePath: string): T {
    // const contents = YAML.loadAll(readFile(filePath)).map(content => {
    //   return content
    // })
    // @ts-ignore
    return validateContent<T>(YAML.loadAll(readFile(filePath)) as T, Format.YAML)
  },
  dump<T extends ContentNode>(content: T, options?: {noCompatMode: boolean}): string {
    return YAML.dump(content, {lineWidth: -1, noCompatMode: options?.noCompatMode})
  }
}

const JSONParser = {
  convert<T extends ContentNode>(filePath: string): T {
    try {
      return validateContent<T>(JSON.parse(readFile(filePath)) as T, Format.JSON)
    } catch {
      return validateContent<T>(undefined, Format.JSON)
    }
  },
  dump<T extends ContentNode>(content: T): string {
    return JSON.stringify(content, null, 2)
  }
}

export const formatParser: {[key in Exclude<Format, Format.UNKNOWN>]: FormatParser} = {
  [Format.JSON]: JSONParser,
  [Format.YAML]: YAMLParser
}
