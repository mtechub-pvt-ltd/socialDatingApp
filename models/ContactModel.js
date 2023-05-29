const mongoose = require("mongoose")

const contactSchema = new mongoose.Schema ({
    _id:mongoose.Schema.Types.ObjectId,
    name:String,
    email:String,
    message: String
    
})

module.exports = mongoose.model("contactUs" , contactSchema)