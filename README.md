# form-validator-la
### Este README contem _anchor links_ para uma melhor experiência leia este documento através do [git-hub](https://github.com/lucas-almeida026/form-validator-la/blob/main/README.md 'Open with GitHub')
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

## Como usar
Veja o exemplo completo [aqui](#Exemplo-completo) (último tópico)

As validações do formulário serão feitas após o evento de _submit_ para validar o formulário primeiro capture o evento
```javascript
function App() {
  return (
    <div>
      <form onSubmit={e => onSubmitForm(e)}>
        <input name="teste" type="text" />
        <input type="submit" />
      </form>
    </div>
  );
}
```
Função onSubmitForm:
```javascript
const onSubmitForm = e => {
  e.preventDefault()
  const fd = new FormData(e.target) //Use um FormData para guardar as informações do formulário
  const body = validator.getBodyObject(fd) //Retorna um objeto com chave igual a propriedade name no input e valor igual ao valor digitado no input
  
  //Defina as regras de validação
  const rules = {
    teste: [validator.required()]
  }
  
  //Defina o dicionário dos nomes dos campos (OPCIONAL)
  const dictionary = {
    teste: 'Teste'
  } 
  
  //Crie o objeto de configurações
  const validationConfigs = {
    rules,
    dictionary
  }
  
  //Execute a operação
  const result = validator.doValidations(validationConfigs, body)
```

## Definindo as regras de validação
### Regras disponíveis:
 * required => campo obrigatório
 * minLength => obrigatório conter um número de caracteres maior que o valor mínimo
 * maxLength => obrigatório conter um número de caracteres menor que o valor limite
 * isEmail => obrigatório ser um email
 * isJSON => obrigatório ser uma _string_ _JSON_
 * passwordComplexiy => define regras para a criação de uma senha

### Como selecionar uma regra:
No objeto de regras crie uma chave com o nome do campo (mesmo nome do parâmetro _name_ do _input_) e passe um array como valor contendo as regras do campo em questão.
As regras são executadas em ordem sequencial da esquerda para a direita, portanto prefira começar com _required_.
```javascript
//Exemplo
const rules = {
  fieldName: [validator.required(), validator.minLength(3)]
}
```

## Definindo o dicionário (opcional)
### Para que serve e como o usar o dicionário das opções de validação
O dicionário das opções de validação serve para personalizar a mensagem de erro.
Exemplo: Se o _name_ do _input_ é "userName" a mensagem de erro viria assim `O campo "userName" é obrigatório`
Utilizando o dicionário abaixo a menssagem de erro virá: `O campo "Nome de usuário" é obrigatório`
```javascript
//{
//  <nome no input>: <valor para personalizar a mensagem>
//}
const dictionary = {
  userName: "Nome de usuário"
}
```
## Respostas
### Nehum erro de validação:
Retorna um objeto vazio: `{}`

Para obter o valor booleano utilize `!!Object.keys(result).length`

### Um ou mais error de validação:
Retorna o primeiro erro da lista no seguinte formato: 
```
//Exemplo de erro
{
  error: true,
  message: "O campo "Teste" é obrigatório",
  raw: ["teste", "required"]
}
```

## Raw error
Caso a menssagem de erro padrão não seja a que você deseja basta utilizar os valores _raw_ para formar sua própria mensagem
```javascript
//Exemplo
const res = {
  error: true,
  message: 'O campo "Email" não é um email',
  raw: ['email', 'isEmail']
}
let myMessage = ''
switch (res.raw[1]){
  case 'isEmail':
    myMessage = 'O campo marcado com "*" deve ser um email'
  
  default:
    myMessage: 'Formuçário inválido'
}
alert(myMessage)
```
<br/>

## Funções de validação:

* #### required => não recebe valor, retorna um error object
* #### minLength => recebe o valor mínimo do tipo _number_, retorna um error object
* #### maxLength => recebe o valor máximo do tipo _number_, retorna um error object
* #### isEmail => não recebe valor, retorna um error object
* #### isJSON => não recebe valor, retorna um error object
* #### passwordComplexity => recebe dois valores template do tipo _string_ e configs do tipo _object_, retorna um error object


## Funções complementares:

* #### getBodyObject => recebe instância de _FormData_, retorna um objeto com chave e valor referente aos campos do formulário
* #### doValidations => recebe [validationConfigs: object, body: object], retorna error object
* #### doCombinedValidation => recebe _input_ _reference_, retorna um objeto com 3 funções [equalsTo, differentOf, includedIn], que recebem outra _input reference_ veja mais sobre [aqui](#Validações-Combinadas)
* #### createCustomValidation => recebe [funcName: string, expression: function], retorna uma função, veja mais sobre [aqui](#Validações-personalizadas)

### Implementando validação de complexidade de senha
#### Escreva o template (obrigatório) e passe um objeto de configurações (opcional)
#### Template:
É uma string que deve ter obrigatoriamente 4 caracteres de comprimento onde deve-se definir as regras para a criação da senha, segue exemplos:
```javascript
/*
caracteres reservados: ['a', 'A', '1', '*', '_']
a = letras minúsculas
A = letras maiúsculas
1 = números
* = caracteres especiais
_ = nada
*/
const template = '____' // nenhuma regra
const template = 'a___' // obrigatório letras minúsculas
const template = 'aA__' // obrigatório letras minúsculas e maiúsculas
const template = 'aA1_' // obrigatório letras minúsculas, maiúsculas e números
const template = 'aA1*' // obrigatório letras minúsculas, maiúsculas, números e caracteres especiais
const template = 'a1__' // obrigatório letras minúscuas e números
const template = '1*Aa' // obrigatório números, caracteres especiais, letras maiúsculas e letras minúsculas
// A ordem dos caracteres do template altera a ordem de verificação e a mensagem de erro, como no exemplo acima.
```
#### Configs:
É um objeto que define duas propriedades `allowSpaces` e `allowKeyboardSequences` que por padrão são setadas como true.
Veja como alterar as configurações padrão abaixo:
```javascript
const template = 'aA__'
const configs = {
    allowSpaces: false, // Não permite que o usuário crie uma senha com o caracter <space>
    allowKeyboardSequences: false // Não permite que o usuário crie uma senha com sequências de teclado como: "asd", "123", "!@#", "zxc", etc.
}
const rules = {
    password: [validator.passwordComplexity(template, configs)]
}
```

## Validações combinadas
A função de validações combinadas recebe uma _input reference_ (valor a ser comparado) e retorna um objeto com três funções [equalsTo, differentOf, includedIn];
equalsTo recebe outra _input reference_ (valor para comparar) e retorna true ou false;
differentOf recebe outra _input reference_ (valor para comparar) e retorna true ou false;
includedIn recebe outra _input reference_ (valor para comparar) <obrigatório> e o parâmetro _flag_ <opcional, default = validator.includedInFlags.literal> que pode ser obtido a partir de `validator.includedInFlags` e retorna true ou false;
validator.includedInFlags é um objeto que contém 3 valores [email, treated, literal]:
* email: indicado para comparações de 1 ou 2 campos do tipo email
* treated: compara os valores dos inputs aplicando as funções `String.trim()` e `String.toLowerCase()`
* literal: valor padrão, compara os valores dos inputs sem nenhum tipo de tratamento

### Aplicando validações combinadas
```javascript
const resultComb = validator.doCombinedValidation(document.getElementById('input1'))
    .includedIn(document.getElementById('input2', validator.includedInFlags.treated)
```

## Validações personalizadas
Se for necessário fazer uma verificação que não é diponibilizada de maneira padrão pelo pacote, use a função `createCustomValidation(<funcName>, <expression>)` para criar facilmente sua própria função de validação.
A `createCustomValidation` espera receber dois parâmetro (obrigatório), <funcName> e <expression>
<funcName> deve ser uma string que definirá o nome da função, será usado para formar o valor <raw> do objeto de erro, e o parâmetro <expression> deve ser uma função que receber um parâmetro <value> e retorna uma expressão lógina.
Obs.: validações personalizadas não possuem mensagem no objeto de erro
Veja a seguir como implementar:

### Criando validações personalizadas
```javascript
const myOwnValidation = validator.createCustomValidation('myOwnValidation', value => value === 'foo')
const rules = {
    input1: [validator.required(), myOwnValidation()]
}
// Neste exemplo a validação personalizada verifica se o valor do input é exatamente igual a "foo"
// Se o valor for examente igual a "foo" retorna um objeto vazio 
// Se o valor for diferente de "foo" retorna o seguinte object error
{
    error: true
    message: ''
    raw: ['input1', 'myOwnValidation']
}

// Criando minha mensagem apartir de res.raw
const message = `O campo ${raw[0]} deve ser igual a "foo"`
alert(message)
```
<br/>

## Exemplo completo
```javascript
import validator from 'form-validator-la'

const onSubmitForm = e => {
  e.preventDefault()
  const fd = new FormData(e.target)
  const body = validator.getBodyObject(fd)
  const myOwnValidation = validator.createCustomValidation('recaptcha', v => v === document.getElementById('recaptcha').value)
  const rules = {
    name: [validator.required(), validator.minLength(3), validator.maxLength(50)],
    email: [validator.required(), validator.isEmail(), validator.minLength(4), validator.maxLength(50)],
    password: [validator.required(), validator.minLength(8), validator.maxLength(32), validator.passwordComplexity('aA1*', {allowSpaces: false})],
    passwordRepeat: [validator.required(), validator.minLength(8), validator.maxLength(32), validator.passwordComplexity('aA1*', {allowSpaces: false})],
    recaptcha: [validator.required(), myOwnValidation()]
  }
  const dictionary = {
    name: 'Nome',
    email: 'Email',
    password: 'Senha',
    passwordRepeat: 'Repita a senha' 
  }
  const result = validator.doValidations({rules, dictionary}, body)

  if(result.message) alert(result.message)

  const combResult = validator2.doCombinedValidation(document.getElementById('password')).equalsTo(document.getElementById('passwordRepeat'))

  if(combResult.raw.length > 0) alert('Preencha o campo "reCAPTCHA" corretamente')
}

function App() {
  return (
    <div>
      <form onSubmit={e => onSubmitForm(e)}>
        <input name="teste" type="text" />
        <input type="submit" />
      </form>
    </div>
  );
}

export default App;
```

## License
[MIT](https://choosealicense.com/licenses/mit/)
