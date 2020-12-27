# la-form-validator

la-form-validator é um validador de formulário HTML feito em javascript para front-end. 
Os exemplos serão feitos em React.


## Instalação
`npm i la-form-validator`

## Importando o pacote

<!-- Para fazer validações em Node use o [pacote para Nodejs] -->

```javascript
import validator from 'la-form-validator'
```

## Como usar
Veja o exemplo completo [aqui](#Exemplo-completo) (último tópico)

A validações do formulário serão feitas após o evento de _submit_ para validar o formulário primeiro capture o evento
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
  const fd = new FormData(e.target)
  const body = validator.getBodyObject(fd) //Retorna um objeto com chave igual a propriedade name no input e valor igual ao valor digitado no input
  
  //Defina as regras de validação
  const rules = {
    teste: [validator.required()]
  }
  
  //Defina o dicionário dos nomes dos campo (OPCIONAL)
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
## Respostas
### Nehum erro de validação:
Retorna um objeto vazio: `{}`

Para obter o valor booleano utilize `!!Object.keys(result).length`

### Algum erro de validação:
Retorna o primeiro erro da lista no seguinte formato: 
```
//Exemplo de erro
{
  error: true,
  message: "O campo "Teste" é obrigatório",
  raw: ["teste", "required"]
}
```

## Definindo as regras de validação
### Regras disponíveis:
 * required => campo obrigatório
 * minLength => obrigatório conter um número mínimo de caracteres
 * maxLength => obrigatório conter um número de caracteres menor que o limite
 * isEmail => obrigatório ser um email
 * isJSON (Beta) => obrigatório ser uma _string_ JSON

* As funções minLength e maxLength devem ser chamadas passando o valor de comparação `minLength(min: number)`, `maxLength(max: number)`

### Como selecionar uma regra:
No objeto de regras crie uma chave com o nome do campo (mesmo nome do parêmatro _name_ do _input_) e passe um array como valor contendo as regras do campo em questão.
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
Utilizando o seguinte dicionário 
```javascript
const dictionary = {
  userName: "Nome de usuário"
}
```
Utilizando o dicionário a menssagem de erro vira: `O campo "Nome de usuário" é obrigatório`

## Raw error
Caso a menssagem de erro padrão não seja a que você deseja basta utilizar os valores _raw_ para formar sua própria mensagem
```javascript
//Exemplo
const res = {
  error: true,
  message: 'O campo "Email" não é um email',
  raw: ['email', 'isEmail']
}
const myMessage = `O campo marcado com "*" tem que ser um email`
alert(myMessage)
```
<br/>

### Funções de validação:

* required => não recebe valor, retorna error object
* minLength => recebe o valor mínimo, retorna error object
* maxLength => recebe o valor máximo, retorna error object
* isEmail => não recebe valor, retorna error object
* isJSON => não recebe valor, retorna error object

### Funções complementares:

* getBodyObject => recebe instância de FormData, retorna body object
* doValidations => recebe [validationConfigs, body], retorna error object

<br/>

## Exemplo completo
```javascript
const onSubmitForm = e => {
  e.preventDefault()
  console.log(e.target)
  const fd = new FormData(e.target)
  const body = validator.getBodyObject(fd)
  const rules = {
    name: [validator.required(), validator.minLength(3), validator.maxLength(50)],
    email: [validator.required(), validator.isEmail(), validator.minLength(4), validator.maxLength(50)],
    password: [validator.required(), validator.minLength(8), validator.maxLength(32)]
  }
  const dictionary = {
    name: 'Nome',
    email: 'Email',
    password: 'Senha'
  }
  const res = validator.doValidations({rules, dictionary}, body)
}
```

## License
[MIT](https://choosealicense.com/licenses/mit/)
