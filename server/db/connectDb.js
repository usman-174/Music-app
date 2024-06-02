const { default: mongoose } = require("mongoose")

const connectDB = async (url)=>{
    if(!url){
        throw Error("MongoDB Url not provided")
    }
    mongoose.connect(url)
    console.log("Connected to Database");
}

module.exports = {connectDB}