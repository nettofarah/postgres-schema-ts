const UPPERCASE = /[\p{Lu}]/u
const LOWERCASE = /[\p{Ll}]/u
const LEADING_CAPITAL = /^[\p{Lu}](?![\p{Lu}])/gu
const IDENTIFIER = /([\p{Alpha}\p{N}_]|$)/u
const SEPARATORS = /[_.\- ]+/

const LEADING_SEPARATORS = new RegExp('^' + SEPARATORS.source)
const SEPARATORS_AND_IDENTIFIER = new RegExp(SEPARATORS.source + IDENTIFIER.source, 'gu')
const NUMBERS_AND_IDENTIFIER = new RegExp('\\d+' + IDENTIFIER.source, 'gu')

const preserveCamelCase = (
  string: string,
  toLowerCase: (val: string) => string,
  toUpperCase: (val: string) => string
): string => {
  let isLastCharLower = false
  let isLastCharUpper = false
  let isLastLastCharUpper = false

  for (let i = 0; i < string.length; i++) {
    const character = string[i]

    if (isLastCharLower && UPPERCASE.test(character)) {
      string = string.slice(0, i) + '-' + string.slice(i)
      isLastCharLower = false
      isLastLastCharUpper = isLastCharUpper
      isLastCharUpper = true
      i++
    } else if (isLastCharUpper && isLastLastCharUpper && LOWERCASE.test(character)) {
      string = string.slice(0, i - 1) + '-' + string.slice(i - 1)
      isLastLastCharUpper = isLastCharUpper
      isLastCharUpper = false
      isLastCharLower = true
    } else {
      isLastCharLower = toLowerCase(character) === character && toUpperCase(character) !== character
      isLastLastCharUpper = isLastCharUpper
      isLastCharUpper = toUpperCase(character) === character && toLowerCase(character) !== character
    }
  }

  return string
}

const preserveConsecutiveUppercase = (input: string, toLowerCase: (val: string) => string): string => {
  LEADING_CAPITAL.lastIndex = 0

  return input.replace(LEADING_CAPITAL, m1 => toLowerCase(m1))
}

const postProcess = (input: string, toUpperCase: (val: string) => string): string => {
  SEPARATORS_AND_IDENTIFIER.lastIndex = 0
  NUMBERS_AND_IDENTIFIER.lastIndex = 0

  return input
    .replace(SEPARATORS_AND_IDENTIFIER, (_, identifier) => toUpperCase(identifier))
    .replace(NUMBERS_AND_IDENTIFIER, m => toUpperCase(m))
}

interface Options {
  /**
   Uppercase the first character: `foo-bar` → `FooBar`.
   @default false
   */
  readonly pascalCase?: boolean

  /**
   Preserve the consecutive uppercase characters: `foo-BAR` → `FooBAR`.
   @default false
   */
  readonly preserveConsecutiveUppercase?: boolean

  /**
   The locale parameter indicates the locale to be used to convert to upper/lower case according to any locale-specific case mappings. If multiple locales are given in an array, the best available locale is used.
   Setting `locale: false` ignores the platform locale and uses the [Unicode Default Case Conversion](https://unicode-org.github.io/icu/userguide/transforms/casemappings.html#simple-single-character-case-mapping) algorithm.
   Default: The host environment’s current locale.
   @example
   ```
   import camelCase = require('camelcase');
   camelCase('lorem-ipsum', {locale: 'en-US'});
   //=> 'loremIpsum'
   camelCase('lorem-ipsum', {locale: 'tr-TR'});
   //=> 'loremİpsum'
   camelCase('lorem-ipsum', {locale: ['en-US', 'en-GB']});
   //=> 'loremIpsum'
   camelCase('lorem-ipsum', {locale: ['tr', 'TR', 'tr-TR']});
   //=> 'loremİpsum'
   ```
   */
  readonly locale?: false | string | string[]
}

export const camelCase = (input: string | string[], options?: Options): string => {
  if (!(typeof input === 'string' || Array.isArray(input))) {
    throw new TypeError('Expected the input to be `string | string[]`')
  }

  options = {
    pascalCase: false,
    preserveConsecutiveUppercase: false,
    ...options
  }

  const { locale } = options

  let val: string

  if (Array.isArray(input)) {
    val = input
      .map(x => x.trim())
      .filter(x => x.length)
      .join('-')
  } else {
    val = input.trim()
  }

  if (val.length === 0) {
    return ''
  }

  let toLowerCase: (val: string) => string
  let toUpperCase: (val: string) => string

  if (locale) {
    toLowerCase = (val: string): string => val.toLocaleLowerCase(locale)
    toUpperCase = (val: string): string => val.toLocaleUpperCase(locale)
  } else {
    toLowerCase = (val: string): string => val.toLowerCase()
    toUpperCase = (val: string): string => val.toUpperCase()
  }

  if (val.length === 1) {
    return options.pascalCase ? toUpperCase(val) : toLowerCase(val)
  }

  const hasUpperCase = val !== toLowerCase(val)

  if (hasUpperCase) {
    val = preserveCamelCase(val, toLowerCase, toUpperCase)
  }

  val = val.replace(LEADING_SEPARATORS, '')

  if (options.preserveConsecutiveUppercase) {
    val = preserveConsecutiveUppercase(val, toLowerCase)
  } else {
    val = toLowerCase(val)
  }

  if (options.pascalCase) {
    val = toUpperCase(val.charAt(0)) + val.slice(1)
  }

  return postProcess(val, toUpperCase)
}
