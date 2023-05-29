const mongoose = require("mongoose")

const faqsSchema = new mongoose.Schema ({
    _id:mongoose.Schema.Types.ObjectId,
    question:String,
    answer:String,
})

module.exports = mongoose.model("faq" , faqsSchema)