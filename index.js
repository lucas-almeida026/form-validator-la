function Observable() {this.observers = []}
Observable.prototype = {
  subscribe: function (fn) {this.observers.push(fn)},
  unsubscribe: function (fn) {this.observers = this.observers.filter(e => e !== fn)},
  notify: function (e) {this.observers.forEach(fn => fn(e))},
}

const includedInFlags = {
  email: 'email',
  treated: 'treated',
  literal: 'literal'
}

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

const passwordComplexity = (template, configs) => value => {
  const _configs = {...{allowSpaces: true, allowKeyboardSequences: true}, ...configs}
  const blackList = ['asd', 'qwe', '123', '!@#', 'zxc', '1qa', '2ws', '3ed', 'dfg', '098', '345', 'poi', '[];', 'pl,', 'wer', 'sdf', 'xcv']
  if(value === '__myRawValue__') return 'passwordComplexity'
  //-----
  if(typeof template !== 'string') throw new Error('validator.passwordComplexity(template) <template> must be a string')
  if(typeof value !== 'string') throw new Error('validator.passwordComplexity() expects a string to validate')
  if(template.length !== 4) throw new Error('validator.passwordComplexity(template) <template> invalid format, please review the documentation')
  if(!!template.replace(/[_aA1*]/g, '').length) throw new Error('validator.passwordComplexity(template) <template> does not match any default options, please review the documentation')

  const splitValue = value => value.length < 3 
    ? value
    : Array.from(value).reduce((acm, _, i, arr) => {
      const group = arr[i+3] ? arr.slice(i, i+3) : []
      return [...acm, group.join('')].filter(e => e !== '')
    }, [])

  const verfKeyboardSeq = valueSplited => {
    return blackList.reduce(
      (acm, curr) => acm ? acm : valueSplited.reduce((acm2, curr2) => acm2 ? acm2 : curr === curr2, false), false)
  }

  if(!_configs.allowSpaces) return {error: true, message: 'O campo # não permite espaços " " '}
  if(!_configs.allowKeyboardSequences){
    if(verfKeyboardSeq(splitValue(value))){
      return {error: true, message: 'O campo # não permite sequências de teclado como: "asd", "qwe", etc.'}
    }
  }

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

const getBodyObject = form => {
  if(!form) throw new Error('validator.doValidations() expect a form instance <form>')
  if(!form.tagName) throw new Error('validator.doValidations() expect a form instance <form>')
  if(form.tagName !== 'FORM') throw new Error('validator.doValidations() expect a form instance <form>')
  const formData = new FormData(form)
  return Object.fromEntries(Array.from(formData))
}


const doValidations = validationConfigs => {
  if(!validationConfigs) throw new Error('validator.doValidations() expect an object <validationConfigs>')
  if(typeof validationConfigs !== 'object') throw new Error('validator.doValidations() expect an object <validationConfigs>')
  if(!validationConfigs.rules) throw new Error('validator.doValidations() expect an object <validationConfigs> with a key <rules>')
  if(typeof validationConfigs.rules !== 'object') throw new Error('validator.doValidations() <validationConfigs.rules> must be an object')

  const onSubmit = form => {
    const onSubmitObservable = new Observable()
    const body = getBodyObject(form)
    const rules = Object.entries(validationConfigs.rules)
    const dictionary = !!validationConfigs.dictionary ? validationConfigs.dictionary : false
    const result = rules.reduce((acm, curr) => {
      if(body[curr[0]] === undefined) throw new Error('validator.doValidations() <rules> must contain the exact values of input name')
      const value = body[curr[0]]
      if(!acm.error) return curr[1].reduce((acm2, fn) => {
        const result = fn(value)
        if(!result) throw new Error(`Impossible to resolve, report the problem: validator.${fn('__myRawValue__')}`)
        if(result.error && !acm2.error){
          const message = dictionary[curr[0]]
            ? result.message.replace('#', `"${dictionary[curr[0]]}"`) 
            : result.message.replace('#', `"${curr[0]}"`)
          return {
            error: true, 
            raw: [curr[0], fn('__myRawValue__')],
            message
          }
        }                   
        return acm2
      }, {})
      return acm
    }, {})
    setTimeout(() => onSubmitObservable.notify(result), 10)
    return onSubmitObservable
  }

  const onLeaveInput = form => {
    const onLeaveObservable = new Observable()
    const body = getBodyObject(form)
    const ids = Object.entries(body).map(e => e[0])
    const inputs = ids.map(id => {
      const input = document.getElementById(id)
      if(input === undefined) throw new Error(`<...>.onLeaveInput() expect a HTML element reference with id: ${id}`)
      if(!input.tagName)  throw new Error(`<...>.onLeaveInput() expect a HTML element reference with id: ${id}`)
      if(input.tagName !== 'INPUT')  throw new Error(`<...>.onLeaveInput() expect a input HTML element reference with id: ${id}`)
      return input
    })
    inputs.map(input => {
      input.addEventListener('focusout', e => {
        const rules = validationConfigs.rules
        const dictionary = !!validationConfigs.dictionary ? validationConfigs.dictionary : false
        const target = e.target.name
        const value = e.target.value
        if(rules[target] !== undefined){
          const result = rules[target].reduce((acm, fn) => {
            const result = fn(value)
            if(!result) throw new Error(`Impossible to resolve, report the problem: validator.${fn('__myRawValue__')}`)
            if(result.error && !acm.error){
              const message = dictionary[target]
                ? result.message.replace('#', `"${dictionary[target]}"`)
                : result.message.replace('#', `"${target}"`)
              return {
                error: true,
                raw: [target, fn('__myRawValue__')],
                message
              }
            }
            return {...acm}
          }, {})
          onLeaveObservable.notify(result)
        }        
      })
    })
    return onLeaveObservable
  }

  return {
    onSubmit,
    onLeaveInput
  }
}

const doCombinedValidation = (inputToCompare) => {
  const throwErros = (input) => {
    if(input === null) throw new Error('validator.doCombinedValidations(inputToCompare) <input> can not binputToCompare a <null> value')
    if(typeof input !== 'object') throw new Error('validator.doCombinedValidations(inputToCompare) <input> must be a object')
    if(!input.tagName) throw new Error('validator.doCombinedValidations(inputToCompare) <input> must be a HTML element reference')
    if(input.tagName !== 'INPUT') throw new Error('validator.doCombinedValidations(inputToCompare) <input> must be a HTML input reference')
  }
  throwErros(inputToCompare)
  const equalsTo = (comparisonInput) => {
    throwErros(comparisonInput)
    return comparisonInput.value === inputToCompare.value
  }
  const differentOf = (comparisonInput) => {
    throwErros(comparisonInput)
    return comparisonInput.value !== inputToCompare.value
  }
  const includedIn = (comparisonInput, flag = includedInFlags.literal) => {
    throwErros(comparisonInput)
    switch (flag){
      case includedInFlags.literal:
        return comparisonInput.value.includes(inputToCompare.value)
      
      case includedInFlags.email:
        return comparisonInput.value
          .trim()
          .toLowerCase()
          .includes(inputToCompare.value
            .trim()
            .toLowerCase()
            .substring(0, inputToCompare.value.indexOf('@')))

      case includedInFlags.treated:
        return comparisonInput.value 
          .trim()
          .toLowerCase()
          .includes(inputToCompare.value.trim().toLowerCase())
      
      default:
        throw new Error('validator.doCombinedValidation(<input1>).includedIn(<input2>) Invalid flag')
    }
  }
  return {
    equalsTo,
    differentOf,
    includedIn,
  }
}

const createCustomValidation = (funcName, expression) => {
  if(typeof funcName !== 'string') throw new Error(`validator.createCustomValidator(<funcName>, <expressoin>) <funcName> must be a string`)
  if(typeof expression !== 'function') throw new Error(`validator.createCustomValidator(<funcName>, <expressoin>) <expression> must be a function`)
  return () => value => {
    if(typeof value !== 'string') throw new Error(`validator.${funcName}() expects a string to validate`)
    if(value === '__myRawValue__') return funcName
    return expression(value) ? {error: false} : {error: true, message: ''}
  }
}

module.exports = {
  doValidations,
  doCombinedValidation,
  createCustomValidation,
  includedInFlags,
  required,
  minLength,
  maxLength,
  isEmail,
  isJSON,
  passwordComplexity
}