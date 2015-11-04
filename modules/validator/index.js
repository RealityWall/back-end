module.exports = {
	mailValidator: function(mail){
		var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    	return re.test(mail);
	},

	userContentValidator: function(required, optional, req, res){

        if (required.indexOf('email') >= 0) {
            if (!req.body.email) {
                res.status(400).json(new Error("mail input empty"));
                return false;
            } else if (!this.mailValidator(req.body.email)) {
                res.status(400).json(new Error("bad mail format"));
                return false;
            }
        } else if (optional.indexOf('email') >= 0) {
            if (req.body.mail && !this.mailValidator(req.body.email)) {
                res.status(400).json(new Error("bad mail format"));
                return false;
            }
        }

        if (required.indexOf('password') >= 0) {
            if (!req.body.password || req.body.password.length < 7 || req.body.password.length > 30) {
                res.status(400).json(new Error("password size must be between 7 and 30"));
                return false;
            }
        } else if (optional.indexOf('password') >= 0) {
            if (req.body.password && (req.body.password.length < 7 || req.body.password.length > 30)) {
                res.status(400).json(new Error("password size must be between 7 and 30"));
                return false;
            }
        }

        if (required.indexOf('firstname') >= 0) {
            if(!req.body.firstname){
                res.status(400).json(new Error("firtname input empty"));
                return false;
            } else if(req.body.firstname.length < 1 || req.body.firstname.length > 100){
                res.status(400).json(new Error("firstname size must be between 1 and 100"));
                return false;
            }
        } else if (optional.indexOf('firstname') >= 0) {
            if (req.body.firstname && (req.body.firstname.length < 1 || req.body.firstname.length > 100) ) {
                res.status(400).json(new Error("firstname size must be between 1 and 100"));
                return false;
            }
        }

        if (required.indexOf('lastname') >= 0) {
            if(!req.body.lastname){
                res.status(400).json(new Error("lastname input empty"));
                return false;
            } else if(req.body.lastname.length < 1 || req.body.lastname.length > 100){
                res.status(400).json(new Error("lastname size must be between 1 and 100"));
                return false;
            }
        } else if (optional.indexOf('lastname') >= 0) {
            if (req.body.lastname && (req.body.lastname.length < 1 || req.body.lastname.length > 100) ) {
                res.status(400).json(new Error("lastname size must be between 1 and 100"));
                return false;
            }
        }

        if (required.indexOf('content') >= 0 && !req.body.content) {
            res.status(400).json(new Error("content input empty"));
            return false;
        }

        if (required.indexOf('wall_id') >= 0) {
            if (!req.body.wall_id) {
                res.status(400).json(new Error("wall_id input empty"));
                return false;
            } else if (!/^[0-9]+$/.test(req.body.wall_id)) {
                res.status(400).json(new Error("wall_id must be integer"));
                return false;
            }
        } else if (optional.indexOf('wall_id') >= 0) {
            if (req.body.wall_id && !(/^[0-9]+$/.test(req.body.wall_id))) {
                res.status(400).json(new Error("wall_id must be integer"));
                return false;
            }
        }

        if (required.indexOf('title') >= 0) {
            if (!req.body.title) {
                res.status(400).json(new Error("title input empty"));
                return false;
            } else if (req.body.title.length > 50) {
                res.status(400).json(new Error("title too long"));
                return false;
            }
        } else if (optional.indexOf('title') >= 0) {
            if (req.body.title && req.body.title.length > 50) {
                res.status(400).json(new Error("title too long"));
                return false;
            }
        }

        if (required.indexOf('post_id') >= 0) {
            if (!req.body.post_id) {
                res.status(400).json(new Error("post_id input empty"));
                return false;
            } else if (!/^[0-9]+$/.test(req.body.post_id)) {
                res.status(400).json(new Error("post_id must be integer"));
                return false;
            }
        } else if (optional.indexOf('post_id') >= 0) {
            if (req.body.post_id && !(/^[0-9]+$/.test(req.body.post_id))) {
                res.status(400).json(new Error("post_id must be integer"));
                return false;
            }
        }

        return true;
	}
};