module.exports = {
	mailValidator: function(mail){
		var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    	return re.test(mail);
	},

	userContentValidator: function(req, res){
		if(!req.body.email){
            res.status(400).json(new Error("mail input empty"));
        } else if(!req.body.firstname){
            res.status(400).json(new Error("firtname input empty"));
        } else if(!req.body.lastname){
            res.status(400).json(new Error("lastname input empty"));
        } else if(!this.mailValidator(req.body.email)){
            res.status(400).json(new Error("bad mail format"));
        } else if(req.body.firstname.length < 1 || req.body.firstname.length > 100){
            res.status(400).json(new Error("firstname size must be between 1 and 100"));
        } else if(req.body.lastname.length < 1 || req.body.lastname.length > 100){
            res.status(400).json(new Error("lastname size must be between 1 and 100"));
        } else if(req.body.password.length < 7 || req.body.password.length > 30){
            res.status(400).json(new Error("password size must be between 7 and 30"));
        } else {
        	return true;
        }
	}
}