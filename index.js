
//modulos externos
const inquirer = require('inquirer')
const chalk = require('chalk')

//Core modules  
const fs = require('fs');
const { type } = require('os');

operation();

function operation(){
    inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'Qual operação você quer executar?',
        choices: ['Criar conta', 'Consultar Saldo', 'Depositar', 'Sacar', 'Sair'],
    },
]).then((answer)=>{
    const action = answer['action'];
    
    if(action === 'Criar conta'){
        createAccount();
    }else if(action === 'Consultar Saldo'){
        getBalance();

    }else if(action === 'Depositar'){
        deposit()
    }else if(action === 'Sacar'){
        sacar();

    }else if(action === 'Sair'){
        console.log(chalk.bgBlue.black("Obrigado por usar o Accounts!"));
        process.exit();
    }


})
.catch((err)=> console.log(err))
}


//create account
function createAccount(){
    console.log(chalk.black.bgGreen("Obrigado por escolher nosso Banco"))
    console.log(chalk.green("Esolha as opções para criar sua conta"))
    buildAccount();
}

function buildAccount(){
    inquirer.prompt([{
        name: 'accountName',
        message: 'Qual o nome da sua conta?',
    }]).then((answer=>{
        const accountName = answer['accountName']
        
        console.info(accountName);

        if(!fs.existsSync('accounts')){
            fs.mkdirSync('accounts', (err)=>{
                if(err){
                    console.log(err)
                }    
            })
        }

        if(fs.existsSync(`accounts/${accountName}.json`)){
            console.log(chalk.black.bgRed("Esta conta já existe, escolha outro nome!"))
            buildAccount();
            return
        }

        fs.writeFileSync(`accounts/${accountName}.json`, '{"balance": 0}', function(err){
            console.log(err);
        });
        console.log(chalk.bgGreen("Parabéns! Sua conta foi criada com sucesso!"))
        operation();

    }))
    .catch(err => console.log(err))
}


function deposit(){
    inquirer.prompt([{
        name: 'accountName',
        message: 'Em qual conta você seja fazer o depósito?'
    }]).then((answer)=>{
        const accountName = answer['accountName']

        if(!checkAccount(accountName)){
            return deposit();
        }

        inquirer.prompt([{
            name: 'amount',
            message: 'Quanto você deseja depositar?',
        }]).then((answer) => {
             
            const amount = answer['amount'];

            //adicionar valor
            addAmount(accountName, amount);



        }).catch(err => console.log(err))

    }).catch(err => {
        console.log(err)
    })
}

function checkAccount(accountName){
    if(!fs.existsSync(`accounts/${accountName}.json`)){
        console.log(chalk.black.bgRed("Essa conta não existe, escolha outro nome!"))
        return false
    }

    return true;
}


function addAmount(accountName,amount){
    
    const accountData = getAccount(accountName);
    

    if(!amount){
        console.log(chalk.black.bgRed("Ocorreu um erro! Tente novamente mais tarde!"));
        return deposit();
    }
    
    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);

    fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData), (err)=>{
        console.log(err);
    });
    console.log(chalk.green(`Foi depositado o valor de R$${amount}`))
    operation();
}

function getAccount(accountName){
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`,{
        encoding: 'utf-8',
        flag: 'r',
    })

    return JSON.parse(accountJSON)
}

function getBalance(){
    inquirer.prompt([{
        name: 'accountName',
        message: "Qual o nome da sua conta?"
    }]).then((answer) => {
        const accountName = answer['accountName'];

        //Verificar se a conta existe
        if(!checkAccount(accountName)){
            return getBalance();
        }

        const accountData = getAccount(accountName);
        console.log(chalk.bgBlue(`Olá! O saldo da sua conta é R$${accountData.balance}`))
        operation();

    }).catch((err) => console.log(err))
}


function sacar(){
    inquirer.prompt([{
        name: 'accountName',
        message: 'Qual a conta que você deseja sacar?'
    }]).then((answer) =>{
        const accountName = answer['accountName'];

        if(!checkAccount(accountName)){
            return sacar();
        }

        inquirer.prompt([{
            name: 'amount',
            message: 'Quanto você deseja sacar?',
        }]).then((answer)=>{
            const amount = answer['amount'];
            
            removeMoney(accountName,amount);


            


        }).catch(err => console.log(err))


    }).catch(err => console.log(err))
}


function removeMoney(accountName, amount){
    const accountData = getAccount(accountName);

    if(!amount){
        console.log(chalk.black.bgRed("Ocorreu um erro! Tente novamente mais tarde"))
        return sacar();
    }

    if(accountData.balance < amount){
        console.log(chalk.black.bgRed("Valor insuficiente! Tente novamente"))
        return sacar();
    }

    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);

    fs.writeFileSync(`accounts/${accountName}.json`,
        JSON.stringify(accountData),(err)=>{
            console.log(err);
        }
    )

    console.log(chalk.green(`Saque efetuado com sucesso! Valor: R$${amount}`))
    operation();
}
