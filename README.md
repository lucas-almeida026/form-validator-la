# la-form-validator

la-form-validator é um validador de formulário HTML feito em javascript para front-end. 
Os exemplos serão feitos em React.

versão atual: 1.0.0

## Instalação
`npm i la-form-validator`

## Importando o pacote

[//]: <> (Para fazer validações em Node use o [pacote para Nodejs])

```javascript
import validator from 'la-form-validator'
```

## Como usar
A validações do formulário serão feitas após o evento de _submit_ para validar o formulário primeiro capture o evento
```
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
 * maxLength => obrigatório conter um número de acracteres menor que o limite
 * isEmail => obrigatório ser um email
 * isJSON (Beta) => obrigatório ser uma _string_ JSON

* As funções minLength e maxLength devem ser chamadas passando o valor de comparação `minLength(min: number)`, `maxLength(max: number)`

### Como selecionar uma regra:
No objeto de regras crie uma chave com o nome do campo (mesmo nome do parêmatro _name_ do _input_) e passe um array como valor contendo as regras do campo em questão.
```javascript
//Exemplo
const rules = {
  fieldName: [validator.required(), validator.minLength(3)]
}
```

## License
[MIT](https://choosealicense.com/licenses/mit/)
