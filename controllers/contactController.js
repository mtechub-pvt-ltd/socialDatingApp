

const mongoose = require("mongoose")
const contactModel = require("../models/ContactModel")


exports.contact = async (req,res)=>{

    try{
        const name = req.body.name;
        const email = req.body.email;
        const message = req.body.message;

        const newMessage = await contactModel({
            _id:mongoose.Types.ObjectId(),
            name: name,
            email:email,
            message:message
        })

        const result = await newMessage.save();

        if(result){
            res.json({
                message: "New contact message of user saved successfully",
                result: result,
                status: 'success',
            })
        }
        else{
            res.json({
                message: "Could not create contact message of user",
                status: "failed"
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



exports.getAllContactMessage = async(req,res)=>{
    try{
        const result= await contactModel.find({});
        if(result){
            res.json({
                message: "All Messages fetched",
                result: result,
                status: 'success',
            })
        }
        else{
            res.json({
                message: "Could not fetch contact messages",
                status: "failed"
            })
        }
        
        
    }
    catch(err){
        res.json({
            message: "Error fetching ",
            error:err.message
        })
    }
}

exports.getContactMessagesByUserEmail = async(req,res)=>{
    try{
        const email = req.query.email;
        const result= await contactModel.find({email:email});
        if(result){
            res.json({
                message: "Contact Messages for this email fetched",
                result: result,
                status: 'success',
            })
        }
        else{
            res.json({
                message: "Could not fetch Contact messages",
                status: "failed"
            })
        }
        
        
    }
    catch(err){
        res.json({
            message: "Error fetching ",
            error:err.message
        })
    }
}

exports.deleteContactMessage = async(req,res)=>{
    try{
        const contactMessageId = req.params.contactMessageId;
        const result= await contactModel.deleteOne({_id: contactMessageId})

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

exports.updateContactMessage = async (req,res)=>{

    try{
        const contactMessageId = req.body.contactMessageId;
        const name = req.body.name;
        const email = req.body.email;
        const message = req.body.message;
        

        const result = await contactModel.findOneAndUpdate({_id: contactMessageId} , 
            {name: name,
            email:email,
            message:message} , {new:true});


        if(result){
            res.json({
                message: "contactMessage updated successfully",
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