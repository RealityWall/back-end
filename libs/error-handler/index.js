module.exports = {

    internalError(res) {
        return (error) => {
            res.status(500).json(error);
        };
    },

    internalErrorOrUniqueConstraint(res) {
        return (error) => {
            if (error.name == 'SequelizeUniqueConstraintError') return res.status(409).json(error);
            res.status(500).json(error);
        };
    }

};
