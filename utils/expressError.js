class ExpressError extends Error{
   constructor(statuscode,message){
    super(message);
    this.statuscode=statuscode;
   
   }
}

module.exports=ExpressError;
