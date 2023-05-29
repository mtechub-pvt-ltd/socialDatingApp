

const mongoose = require("mongoose")
const faqModel = require("../models/FaqsModel")


exports.createFaq = async (req,res)=>{

    try{
        const question = req.body.question;
        const answer = req.body.answer;

        const newFaq = await faqModel({
            _id:mongoose.Types.ObjectId(),
            question: question,
            answer:answer,
        })

        const result = await newFaq.save();

        if(result){
            res.json({
                message: "New faq has been created successfully",
                result: result,
                status: 'success',
            })
        }
        else{
            res.json({
                message: "Could not create new faq",
                status: "failed"
            })
        }
    }
    catch(err){
        res.json({
            message: "Error creating faq",
            error:err.message
        })
    }
}



exports.getAllFaqs = async(req,res)=>{
    try{
        const result= await faqModel.find({});
        if(result){
            res.json({
                message: "faqs fetched",
                result: result,
                status: 'success',
            })
        }
        else{
            res.json({
                message: "Could not fetch faqs",
                status: "failed"
            })
        }
        
        
    }
    catch(err){
        res.json({
            message: "Error fetching faqs",
            error:err.message
        })
    }
}

exports.getFaqById = async(req,res)=>{
    try{
        const faqId = req.query.faqId;
        const result= await faqModel.findOne({_id:faqId});
        if(result){
            res.json({
                message: "faq fetched",
                result: result,
                status: 'success',
            })
        }
        else{
            res.json({
                message: "Could not fetch faq",
                status: "failed"
            })
        }
        
        
    }
    catch(err){
        res.json({
            message: "Error fetching faq",
            error:err.message
        })
    }
}

exports.deleteFaq = async(req,res)=>{
    try{
        const faqId = req.params.faqId;
        const result= await faqModel.deleteOne({_id: faqId})

        if(result.deletedCount>0){
            res.json({
                message: "Deleted",
                result:result
            })
        }
        else{
            res.json({
                message: "could not deleted",
                status:"failed"
            })
        }
    }
    catch(err){
        res.json({
            message: "Error",
            error:err.message
        })
    }
}

exports.updateFaq = async (req,res)=>{

    try{
        const faqId = req.body.faqId;
        const question = req.body.question;
        const answer = req.body.answer;

        const result = await faqModel.findOneAndUpdate({_id: faqId} , {question:question , answer:answer} , {new:true});
        if(result){
            res.json({
                message: "faq updated successfully",
                result:result,
                status: 'success'
            })
        }
        else{
            res.json({
                message: "could not updated",
                result:null,
                status:"false"
            })
        }
    }
    catch(err){
        res.json({
            message: "error",
            error:err.message
        })
    }
}