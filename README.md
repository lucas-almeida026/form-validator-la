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
Função onSUbmitForm:
```
const onSubmitForm = e => {
  e.preventDefault()
  const fd = new FormData(e.target)
  const body = validator.getBodyObject(fd) //Retorna um objeto com chave igual a propriedade name no input e valor igual ao valor digitado no input
}
```

## License
[MIT](https://choosealicense.com/licenses/mit/)
