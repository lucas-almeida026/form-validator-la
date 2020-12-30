# form-validator-la
### Este README contem _anchor links_ para uma melhor experiência leia este documento através do [git-hub](https://github.com/lucas-almeida026/form-validator-la/blob/main/README.md, 'Open with GitHub')
form-validator-la é um validador de formulário HTML feito em javascript para front-end. 
Os exemplos serão feitos em React.

## Instalação
```bash
npm i form-validator-la
```

## Importando o pacote

<!-- Para fazer validações em Node use o [pacote para Nodejs] -->

```javascript
import validator from 'form-validator-la'
```

## Introdução
Ao importar o pacote `validator` escolha a forma como vai validar o formulário existem duas formas disponíveis `onSubmit` e `onLeaveInput`.

A função onSubmit valida o formulário a partir da captura do evento de submissão do mesmo, veja como implementar `validator.doValidations().onSubmit()` [aqui](#Implementando-onSubmit)

A função onLeaveInput valida o formulário a partir da captura do evento `onFocusOut` dos inputs do formulário, veja como implementar `validator.doValidations().onLeaveInput` [aqui](#Implementando-onLeaveInput)

As duas funções descritas acima retornam um _Observable_, basta se increver no observable retornado para ter acesso aos erros de validação do formulário.



## Definindo as configurações de validação

Para validar um formulário é necessário criar um objeto com as configurações de validação contendo um objeto de regras(OBRIGATÓRIO) e um dicionário(OPCIONAL) e depois chamar o método `doValidations` para receber o observable.

* rules: Define as regras de validação

* dictionary(OPCIONAL):  Define o dicionário para traduzir o nome do input, usado para personalizar a mensagem de erro



### Criando o objeto de configurações de validação
```javascript
const validationConfigs = {
  rules: {
    userName: [validator.required(), validator.minLength(3), validator.maxLength(50)],
    userEmail: [validator.required(), validator.isEmail(), validator.minLength(4), validator.maxLength(50)],
  },
  dictionary: {
    userName: 'Nome',
    userEmail: 'Email'
  }
}
```

### Sobre as regras de validação

Existem 6 regras de validações pré-definidas, mas há a possibilidade de se criar validações personalizadas, veja como [aqui](#Validações-personalizadas).

As validações pré-definidas são:
* **required**: torna o campo obrigatório
* **minLength**: estabelece um número mínimo de caracteres para o campo
* **maxLength**: estabelece um número máximo de caracteres para o campo
* **isEmail**: verifica se o valor preenchido é um email (não verifica se o email é válido, apenas se é um email)
* **isJSON**: verifica se o valor preenchido é um JSON,
* **passwordComplexity**: estabelece regras para a criação de senahs (veja como implementar esta validação [aqui](#Implementando-passwordComplexity))

#### IMPORTANTE:
As funções são executadas na ordem de declaração (da esquerda para a direita), portanto prefira começar pela validação **required**.

Para que as funções `minLength` e `maxLength` funcionem corretamente deve-se passar o valor mínimo e o valor máximo, respectivamente, na criação das regras, como no exemplo do [tópico anterior](#Criando-o-objeto-de-configurações-de-validação)


### Validações combinadas
Caso seja necessário realizar a comparação do valor de um campo com o valor de outro, como por exemplo verificar se a valor do campo <_senha_> é igual ao valor de <_repetirSenha_>, utilize a função `doCombinedValidation`.

doCombinedValidation recebe uma referência de um input HTML (obrigatório) e retorna um objeto com três opções:

* **equalsTo**: verifica se o valor do primeiro input é exatamente igual ao valor do segundo input
* **differentOf**: verifica se o valor do primeiro input é diferente do valor do segundo input
* **includedIn**: verifica se o valor do segundo input contem o valor do primeiro input, esta função recebe um segundo parâmetro chamado <_flag_>
   * Flag pode assumir 3 valores pré-definidos, por padrão caso não seja especificada a comparação será feita usando a flag "literal", Os valores são:
       * **literal**: compara os dois valores literalmente, sem nenhum tratamento
       * **email**: indicado para comparações envolvendo campos de email, compara os valores ignorando o _host_ do email
       * **treated**: compara os dois valores disconsiderando espaçamentos laterais e letras maiúsculas

Depois de selecionar umas das 3 opções ['equalsTo', 'differentOf', 'includedIn'] passe a referência do segundo input, o input que servirá como base para a comparação.


#### Exemplos de validação combinada
```javascript
const nameInvalid = validator
  .doCombinedValidation(document.getElementById('name'))
  .equalsTo(document.getElementById('lastName'))
// Verifica se o valor do input <name> é igual ao valor do input <lastName>

const passwordWithEmail = validator
  .doCombinedValidation(document.getElementById('email'))
  .includedIn(document.getElementById('password'), validator.includedInFlags.email)
// Verifica se o valor do input <password> contem o valor do input <email> ignorando espaços laterais e letter case e a terminação do email ["@gmail.com", "@hotmail.com", etc.]

const passwordWithName = validator
  .doCombinedValidation(document.getElementById('name'))
  .includedIn(document.getElementById('password'), validator.includedInFlags.treated)
// Verifica se o valor do input <password> contem o valor do input <name> ignorando espaços laterais e letter case

const equalPasswords = validator
  .doCombinedValidation(document.getElementById('password'))
  .differentOf(document.getElementById('repeatPassword'))
// Verifica se o valor do input <password> é diferente do valor do input <repeatPassword>

```


### Validações personalizadas
Caso as validações pré-definidas não sejam suficientes para o seu problema, use o método `createCustomValidation()` para criar facilmente sua própria regra de validação.
Obs.: Não é possível criar novas regras para validações combinadas.

createCustomValidation recebe dois parâmetros:

* funcName: O nome da função
* expression: Uma função que recebe um valor <value> e retorna um expressão lógica

Exemplo:
```javascript
const myValidation = validator.createCustomValidation('myValidation', (value) => value === 'foo')
// No exemplo acima <myValidation> verifica se o valor digitado no campo é exatamente igual a "foo"
```

### Objeto de erro
Todas as validações retornam um objeto, caso não haja nenhum erro, de acordo com as regras definidas, o objeto retornado será um objeto vazio: `{}`.
Se houver um ou mais erros será retornado um objeto com o seguinte formato:
```
{
  error: true,
  message: <Mensagem informando o campo que está errado e qual erro foi apontado>,
  raw: [<nomeDoCampo>, <erroApontado>]
}
```

Durante a validação do formuçário, caso a função encontre um erro de validação ela imediatamente retornará o erro, sendo assim os erros são apresentados seguindo a ordem de declaração.

#### Sobre o valor `raw` do objeto de erro
Caso a mensagem padrão não seja útil para o seu caso, utilize o valor raw do objeto de erro para compor sua própria mensagem.

Exemplo:
```javascript
let myMessage
switch (objError.raw[1]){
  case 'myValidation':
    myMessage = `O campo ${objError.raw[0]} deve ter valor exatamente igual a "foo"`
    return

  default:
    return
}
```


## Implementando passwordComplexity
Como dito anteriormente passwordComplexity pode ser utilizada para verificar a complexidade de uma senha, esta função recebe dois parâmetros na inicialização:

* template: Valor do tipo string, é o que define o mínimo de complexidade de senha aceita
* configs(OPCIONAL): Um objeto com duas propriedades que por padrão são setadas com _true_(permitido):
   * allowSpaces: permite ou bloqueia o uso do caracter <_space_> em uma senha
   * allowKeyboardSequences: permite ou bloqueia o uso de sequências de teclado como "asd", "123", "!@#", etc.

A propriedade template deve ser do tipo _string_ e deve conter 4 caracteres de comprimento. Para formar o template utilize uma combinação dos caracteres reservados ['a', 'A', '1', '*', '_'] cada um possui um significado:

* 'a': torna obrigatório o uso de letras minúsculas
* 'A': torna obrigatório o uso de letras maiúsculas
* '1': torna obrigatório o uso de números
* '*': torna obrigatório o uso de caracteres especiais
* '_': NÃO torna obrigatório

Exmplo de utilização:
```javascript
const template = 'aA1_' //Este template torna obrigatório o uso de letras minúsculas, letras maiúsculas e números
const configs = {
  allowSpaces: false
}
const rules = {
  input1: [validator.required(), validator.passwordComplexity(template, configs)]
}
```

Um pouco mais sobre templates:
```javascript
const template = '____' // Não torna nada obrigatório
const template = 'a___' // Tona obrigatório o uso de letras minúsculas
const template = 'aA__' // Tona obrigatório o uso de letras minúsculas e letras maiúsculas
const template = 'aA1_' // Tona obrigatório o uso de letras minúsculas, letras maiúsculas e números
const template = 'aA1*' // Tona obrigatório o uso de letras minúsculas, letras maiúsculas, números e caracteres especiais
const template = '1*Aa' // Tona obrigatório o uso de números, caracteres especiais, letras maiúsculas e letras minúsculas

// Como visto no exmplo acima alterar a ordem dos caracteres do template altera a ordem de verificação e a mensagem de erro

const template = 'a111' // Não gera erros porém a mensagem de erro será: Obrigatório o uso de letras minúsculas, números, números e números
```


## Implementando onSubmit
Ao utilizar a função onSubmit **É** necessário capturar o evento no elemento
### Implementação reduzida:
```javascript
// Função para validar o formulário
const onSubmitForm = event => {
  event.preventDefault()
  const rules = {
    name: [validator.required(), validator.minLength(3), validator.maxLength(20)],
    email: [validator.required(), validator.isEmail()]
  }

  validator
    .doValidations({rules})
    .onSubmit(document.getElementById('form'))
    .subscribe(res => {
      if(res.error) alert(res.error)
      goToOtherFunction()
    })
}

// Capturando o evento de submissão para alimentar a função acima
function App(){
  return (
    <>
      <form onSubmit={e => onSubmitForm(e)}>
        <input id="name" name="name" type="text" />
        <input id="email" name="email" type="text" />
        <input type="submit" />
      </form>
    </>
  )
}
```

### Implementação extendida:
```javascript
// Função para validar o formulário
const onSubmitForm = event => {
  event.preventDefault()
  const myValidation = validator.createCustomValidation('recaptcha', value => value === recaptcha.value)

  const rules = {
    name: [validator.required(), validator.minLength(3), validator.maxLength(20)],
    email: [validator.required(), validator.isEmail()],
    password: [validator.required(), validator.minLength(8), validator.maxLength(64), validator.passwordComplexity('aA1_', {allowSpaces: false})],
    repeatPassword: [validator.required(), validator.minLength(8), validator.maxLength(64), validator.passwordComplexity('aA1_', {allowSpaces: false})],
    recaptcha: [validator.required(), myValidation()]
  }

  const dictionary = {
    name: 'Nome',
    email: 'Email',
    password: 'Senha',
    repeatPassword: 'Repita a senha',
    recaptcha: 'reCAPTCHA'
  }

  validator
    .doValidations({rules, dictionary})
    .onSubmit(document.getElementById('form'))
    .subscribe(res => {
      if(res.error){
        alert(res.error)
      }else{
        const equalPasswords = validator
          .doCombinedValidation(document.getElementById('password'))
          .equalsTo(document.getElementById('repeatPassword'))

        const nameInPassword = validator
          .doCombinedValidation(document.getElementById('name'))
          .includedIn(document.getElementById('password'), validator.includedInFlags.treated)

        if(!equalPasswords){
          alert(msg)
            return
        }
        if(nameInPassword){
          alert(msg)
            return
        }
        goToOtherFunction()
      }
    })
}

// Capturando o evento de submissão para alimentar a função acima
function App(){
  return (
    <>
      <form onSubmit={e => onSubmitForm(e)}>
        <input id="name" name="name" type="text" />
        <input id="email" name="email" type="text" />
        <input id="password" name="password" type="password" />
        <input id="repeatPassword" name="repeatPassword" type="password" />
        <input id="recaptcha" name="recaptcha" type="text" />
        <input type="submit" />
      </form>
    </>
  )
}
```


## Implementando onLeaveInput
Ao utilizar a função onLeaveInput **NÃO** é necessário capturar o evento no elemento.

Em ambientes sigle-page-application como React utilize uma IIFE com um `setTimeout` para invocar a função. (Esta funcionalidade está sendo reconstruida para ser mais facil de implementa-la)

IMPORTNTE: Ao utilizar `onLeaveInput` certifique-se de que todos os inputs do formulário possuem as propriedades "name" e "id" e que as duas possuem o mesmo valor, caso contrário uma exceção será lançada.



### Implementação reduzida:
```javascript
// Função de validação do formulário
(() => setTimeout(() => {
  const rules = {
    email: [validator.required(), validator.isEmail()],
    password: [validator.required(), validator.minLength(8)]
  }

  validator
    .doValidations({rules})
    .onLeaveInput(document.getElementById('form'))  
    .subscribe(res => {
      if(res.error){
        alert(res.message)
        return
      }
      goToNextFunc()
    })  
}, 50))()

// Componente
function App(){
  return (
    <>
      <form id="form">
        <input id="email" name="email" type="text" />
        <input id="password" name="password" type="password" />
        <input type="submit" />
      </form>
    </>
  )
}
```


### Implementação extendida:
```javascript
// Função de validação do formulário
(() => setTimeout(() => {
  const myValidation = validator.createCustomValidation('recaptcha', value => value === recaptcha.value)

  const rules = {
    name: [validator.required(), validator.minLength(3), validator.maxLength(20)],
    email: [validator.required(), validator.isEmail()],
    password: [validator.required(), validator.minLength(8), validator.maxLength(64), validator.passwordComplexity('aA1_', {allowSpaces: false})],
    repeatPassword: [validator.required(), validator.minLength(8), validator.maxLength(64), validator.passwordComplexity('aA1_', {allowSpaces: false})],
    recaptcha: [validator.required(), myValidation()]
  }

  const dictionary = {
    name: 'Nome',
    email: 'Email',
    password: 'Senha',
    repeatPassword: 'Repita a senha',
    recaptcha: 'reCAPTCHA'
  }

  validator
    .doValidations({rules, dictionary})
    .onLeaveInput(document.getElementById('form'))
    .subscribe(res => {
      if(res.error){
        alert(res.error)
      }else{
        const equalPasswords = validator
          .doCombinedValidation(document.getElementById('password'))
          .equalsTo(document.getElementById('repeatPassword'))

        const nameInPassword = validator
          .doCombinedValidation(document.getElementById('name'))
          .includedIn(document.getElementById('password'), validator.includedInFlags.treated)

        if(!equalPasswords){
          alert(msg)
            return
        }
        if(nameInPassword){
          alert(msg)
            return
        }
        goToOtherFunction()
      }
    })  
}, 50))()

// Component
function App(){
  return (
    <>
      <form id="form">
        <input id="name" name="name" type="text" />
        <input id="email" name="email" type="text" />
        <input id="password" name="password" type="password" />
        <input id="repeatPassword" name="password" type="password" />
        <input id="recaptcha" name="recaptcha" type="text" />
        <input type="submit" />
      </form>
    </>
  )
}
```