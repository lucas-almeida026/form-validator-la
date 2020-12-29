const required = () => value => {
  if(typeof value !== 'string') throw new Error('validator.required() expects a string to validate')
  return value === '__myRawValue__' ?
  'required':
  !!value.length ? {error: false} : {error: true, message: 'O campo # é obrigatório'}
}
  
const minLength = min => value => {
  if(typeof min !== 'number') throw new Error('validator.minLength(min) <min> must be a number')
  if(typeof value !== 'string') throw new Error('validator.minLength() expects a string to validate')
  return value === '__myRawValue__' ?
  'minLength':
  value.length >= min ? {error: false} : {error: true, message: `O campo # deve ter no mínimo ${min} caracteres`}
}
  
const maxLength = max => value => {
  if(typeof min !== 'number') throw new Error('validator.maxLength(max) <max> must be a number')
  if(typeof value !== 'string') throw new Error('validator.maxLength() expects a string to validate')
  return value === '__myRawValue__' ? 
  'maxLength':
  value.length <= max ? {error: false} : {error: true, message: `O campo # deve ter no máximo ${max} caracteres`}
}
  
const isEmail = () => value => {
  if(typeof value !== 'string') throw new Error('validator.isEmail() expects a string to validate')
  return value === '__myRawValue__' ? 
  'isEmail':
  value.includes('@') && value.length >= 3 ? {error: false} : {error: true, message: `O campo # deve ser um email`}
}  

const isJSON = () => value => {
  if(typeof value !== 'string') throw new Error('validator.isJSON() expects a string to validate')
  if(value === '__myRawValue__'){
    return 'isJSON'
  }else{
    try{
      JSON.parse(value)
    }
    catch(err){
      return {error: true, message: `O campo # deve ser um JSON`}
    }
    return {error: false}
  }
}

const getBodyObject = formData => Object.fromEntries(Array.from(formData))

const doValidations = (validationConfigs, body) => {
  if(!validationConfigs) throw new Error('validator.doValidations() expect a object "validationConfigs"')
  if(!body) throw new Error('validator.doValidations() expect a object "body"')
  if(!validationConfigs.rules) throw new Error('validator.doValidations() expect a object "validationConfigs" with a object "rules"')
  const rules = Object.entries(validationConfigs.rules)
  const dictionary = !!validationConfigs.dictionary ? validationConfigs.dictionary : false
  return rules.reduce((acm, curr) => {
    const value = body[curr[0]]
    if(!acm.error) return curr[1].reduce((acm2, curr2) => {
      const result = curr2(value)
      if(result)
        if(result.error && !acm2.error){
          const message = dictionary 
            ? result.message.replace('#', `"${dictionary[curr[0]]}"`) 
            : result.message.replace('#', `"${curr[0]}"`)
          return {
            error: true, 
            raw: [curr[0], curr2('__myRawValue__')],
            message
          }
        }                   
      return acm2
    }, {})
    return acm
  }, {})
}

const passwordComplexity = (template, configs = {allowSpaces: true}) => value => {
  if(value === '__myRawValue__') return 'passwordComplexity'
  //-----
  if(typeof template !== 'string') throw new Error('validator.passwordComplexity(template) <template> must be a string')
  if(typeof value !== 'string') throw new Error('validator.passwordComplexity() expects a string to validate')
  if(template.length !== 4) throw new Error('validator.passwordComplexity(template) <template> invalid format, please review the documentation')
  if(!!template.replace(/[_aA1*]/g, '').length) throw new Error('validator.passwordComplexity(template) <template> does not match any default options, please review the documentation')

  if(!configs.allowSpaces) return {error: true, message: 'O campo # não permite espaços " " '}

  const patterns = {
    'a': value => !!value.replace(/[^a-z]/g, '').length,
    'A': value => !!value.replace(/[^A-Z]/g, '').length,
    '1': value => !!value.replace(/\D/g, '').length,
    '*': value => !!value.replace(/[\w \0 \t \r \n \v \f]/g, '').length,
  }

  const patternsDictionary = {'a': 'letras minúsculas', 'A': 'letras maiúsculas', '1': 'números', '*': 'caracteres especiais'}

  const rules = Array.from(template)
    .filter(e => e !== '_')
    .reduce((acm, curr) => [...acm, patterns[curr]], [])

  const stringTypes = Array.from(template)
    .filter(e => e !== '_')
    .reduce((acm, curr) => [...acm, patternsDictionary[curr]], [])
  
  const joinMessage = strTypes => {
    if(strTypes.length === 1) return strTypes[0]
    if(strTypes.length === 2) return strTypes.join(' e ')
    if(strTypes.length > 2) return `${strTypes.slice(0, strTypes.length - 1).join(', ')} e ${strTypes[strTypes.length - 1]}`
  }

  return rules.every(fn => fn(value)) ? {error: false} : {error: true, message: `O campo # exige a existência de ${joinMessage(stringTypes)}`}
}

module.exports = {
  doValidations,
  required,
  minLength,
  maxLength,
  isEmail,
  isJSON,
  passwordComplexity,
  getBodyObject
}

