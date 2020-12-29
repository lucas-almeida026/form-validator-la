const required = () => value => {
  if(typeof value !== 'string') throw new Error('validator.required() expects a string to validate')
  return value === '__myRawValue__' ?
  'required':
  !!value.length ? {error: false} : {error: true, message: 'O campo # é obrigatório'}
}
  

const minLength = min => value => {
  if(typeof min !== 'number') throw new Error('validator.minLength(min) "min" must be a number')
  if(typeof value !== 'string') throw new Error('validator.minLength() expects a string to validate')
  return value === '__myRawValue__' ?
  'minLength':
  value.length >= min ? {error: false} : {error: true, message: `O campo # deve ter no mínimo ${min} caracteres`}
}
  

const maxLength = max => value => {
  if(typeof min !== 'number') throw new Error('validator.maxLength(max) "max" must be a number')
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


module.exports = {
  doValidations,
  required,
  minLength,
  maxLength,
  isEmail,
  isJSON,
  getBodyObject
}