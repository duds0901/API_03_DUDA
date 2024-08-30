//consultar tarefa por id
//atualizar o status de uma tarefa

const express = require ('express');
const mysql = require ('mysql2');
const cors = require ('cors');

const mysql_config = require ('./inc/mysql_config');
const functions = require ('./inc/fumctions');

const api_availability = true;
const api_version = '1.0.0';

const app = express();
app.listen(3000, ()=>{
    console.log("API está executando")
})

app.use((req,res, next)=>{
    if (api_availability){
        next();
    }else{
        res.json(functions.response('atenção', 'API está em manutenção. Sinto muito',0,null))
    }
})

const connection = mysql.createConnection(mysql_config)

app.use(cors());

//tratamento dos posts params
app.use(json());
//instrução que pede que o express trate os dados como json

app.use(express.urlencoded({extended: true}));
//quando é enviado um pedido através do método post, os dados enviados
//através 

//7 rotas
//rota inicial que vai dizer que a API está disponível 
app.get('/', (req,res)=>{
    res.json(functions.response('sucesso', 'API está rodando',0,null))
})

//9 rota para pegar todas as tarefas
app.get('/tasks', (req,res)=>{
    connection.query('SELECT * FROM tasks',(err, rows))
})

//10 rotas para pegar a task pelo id
app.get('/tasks/:id', (req,res)=>{
    const id = req.params.id;
    connection.query('SELECT * FROM tasks WHERE id=?',[id],(err,rows)=>{
        if(!err){
            //devolver os dados da task
            if(rows.lenght>0){
                res.json(functions.response('Sucesso','Sucesso na pesquisa',rows,length,rows))
            }else{
                res.json(functions.response('Atenção','Não foi possível encontrar a task solicitada',0,null))
            }
        }
        else{
            res.json(functions.response('Erro',err.message,0,null))
        }
    })
})

//11 rota para atualizar o status de uma task - método put
app.put('/tasks/:id/status/:status',(req,res)=>{
    const id = req.params.id;
    const status = req.params.status;
    connection.query('UPDATE tasks SET status =? WHERE id=?',[status,id],(err,rows)=>{
        if(!err){
            if(rows.affectedRows>0){
                res.json(functions.response('Sucesso','Sucesso na alteração do status',rows.affectedRows,null))
            }
            else{
                res.json(functions.response('Atenção','Task não encontrada',0,null))
            }
        }
        else{
            res.json(functions.response('Erro',err.message,0,null))
        }
    })
})

//rota para deletar uma tarefa
app.delete('/tasks/:id/delete',(req,res)=>{
    const id = req.params.id;
    connection.query('DELETE FROM tasks WHERE id=?',[id],(err,rows)=>{
        if(!err){
            if(rows.affectedRows){
                res.json(functions.response('Sucesso','Task deletada',rows.affectedRows,null))
            }
            else{
                res.json(functions.response('Atenção','Task não encontrada',0,null))
            }
        }
        else{
            res.json(functions.response('Erro',err.message,0,null))
        }
    })
})

//rota para inserir uma nova task
app.put('/tasks/create',(req,res)=>{
    //midleware para a recepção dos dados da tarefa(task)

    //pegando os dados da request
    const post_data = req.body;

    //checar para ver se não estamos recebendo json vazia
    if(post_data == undefined){
        res.json(functions.response('Atenção','Sem dados de uma nova task',0,null))
        return;
    }
    const task = post_data.task;
    const status = post_data.status;

    //inserindo a nova task
    connection.query('INSERT INTO tasks(task,status,created_at,update_at) VALUES(?,?,NOW(),NOW()',[task,status],(err,rows)=>{
        if(!err){
            res.json('Sucesso','Task cadastrada no banco',rows.affectedRows,null)
        }
        else{
            res.json(functions.response('Erro',err.message,0,null))
        }
    })
})

//8 midleware para caso alguma rota não seja encontrada
app.use((req,res)=>{
    res.json(functions.response('atenção', 'Rota não encontrada',0,null))
})