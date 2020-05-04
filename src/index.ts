import * as r from 'segment-typescript-api/cjs/config_request'
import { compile } from './json_to_ts'
import { JSONSchema7 } from 'json-schema'

interface Options {
  // Words that are reserved by a given language, and which should not be allowed
  // for identifier names.
  reservedWords: string[]
  // String to use for quoted strings. Usually a single or double quote.
  quoteChar: string
  // A character set matching all characters that are allowed as the first character in an identifier.
  allowedIdentifierStartingChars: string
  // A character set matching all characters that are allowed within identifiers.
  allowedIdentifierChars: string
}
const JS_OPTIONS: Options = {
  // See: https://mathiasbynens.be/notes/reserved-keywords#ecmascript-6
  // prettier-ignore
  reservedWords: [
    'do', 'if', 'in', 'for', 'let', 'new', 'try', 'var', 'case', 'else', 'enum', 'eval', 'null', 'this',
    'true', 'void', 'with', 'await', 'break', 'catch', 'class', 'const', 'false', 'super', 'throw',
    'while', 'yield', 'delete', 'export', 'import', 'public', 'return', 'static', 'switch', 'typeof',
    'default', 'extends', 'finally', 'package', 'private', 'continue', 'debugger', 'function', 'arguments',
    'interface', 'protected', 'implements', 'instanceof',
  ],
  quoteChar: "'",
  // Note: we don't support the full range of allowed JS chars, instead focusing on a subset.
  // The full regex 11k+ chars: https://mathiasbynens.be/demo/javascript-identifier-regex
  // See: https://mathiasbynens.be/notes/javascript-identifiers-es6
  allowedIdentifierStartingChars: 'A-Za-z_$',
  allowedIdentifierChars: 'A-Za-z0-9_$',
}

function escapeString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(new RegExp(JS_OPTIONS.quoteChar, 'g'), `\\` + JS_OPTIONS.quoteChar)
}

async function to_ts(schema: JSONSchema7, name: string) {
  let s = await compile(schema as any, name)
  return s.replace("export interface", "declare interface").replace(/\[k\:\ string\]\:\ any/g, "")
}

export default async function (tracking_plan: r.TrackingPlan) {
  let s = ''

  if (tracking_plan.rules.global && tracking_plan.rules.global.properties && tracking_plan.rules.global.properties.properties && tracking_plan.rules.global.properties.properties !== true && tracking_plan.rules.global.properties.properties.properties) {
    // TODO...
  }
  if (tracking_plan.rules.identify && tracking_plan.rules.identify.properties && tracking_plan.rules.identify.properties.traits && tracking_plan.rules.identify.properties.traits !== true && tracking_plan.rules.identify.properties.traits.properties) {
    s += await to_ts(tracking_plan.rules.identify.properties.traits, 'SegmentIdentityProtocol')
  }
  if (tracking_plan.rules.group && tracking_plan.rules.group.properties && tracking_plan.rules.group.properties.traits && tracking_plan.rules.group.properties.traits !== true && tracking_plan.rules.group.properties.traits.properties) {
    s += await to_ts(tracking_plan.rules.group.properties.traits, 'SegmentGroupProtocol')
  }

  if (tracking_plan.rules.events && tracking_plan.rules.events.length > 0) {
    s += `declare type SegmentEvents = ${tracking_plan.rules.events.reduce((s, e) => `${s}'${escapeString(e.name)}' | `, '')}`
    s = s.substring(0, s.length - 3)
    s += `
`

    s += `declare type SegmentTrackProtocol<E extends SegmentEvents> = ${tracking_plan.rules.events.reduce((s, e) =>
      `${s}E extends '${escapeString(e.name)}' ? ${escapeString(e.name).replace(/[ ]/g, '')} : `, '')}`

    s += `never;
declare type SegmentTrackProtocolUnion = ${tracking_plan.rules.events.reduce((s, e) => `${s} | {event: '${escapeString(e.name)}', properties: ${escapeString(e.name).replace(/[ ]/g, '')} }`, '').substring(3)}`;

    let interfaces = await Promise.all(tracking_plan.rules.events.map(async e => {
      if (e.rules.properties && e.rules.properties.properties && e.rules.properties.properties && e.rules.properties.properties !== true && e.rules.properties.properties.properties) {
        return await to_ts(e.rules.properties.properties, escapeString(e.name))
      } else {
        return `
declare interface ${escapeString(e.name)}{}
`
      }
    }))

    s += interfaces.reduce((s, i) => `${s}${i}`, '')

  }

  return s
}