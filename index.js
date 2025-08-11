require("dotenv").config()

const { connectDatabase } = require("./src/database/db")
const {app}=require('./app')
const chalk = require('chalk');


connectDatabase().then(()=>{
app.listen(process.env.PORT || 3000,()=>{
    console.log(chalk.bgGreen("server is runnig port http//:localhost:", process.env.PORT))
})
}).catch((error)=>{
    console.log(chalk.bgRed("database connection faild",error))
})