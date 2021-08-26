var sequelize = require('../connection');
const {DataTypes} = require("sequelize");

var service = sequelize.define('service', {
    'Buyer': {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    'service_level': {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    'WTD': {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    'TARGET': {
        type: DataTypes.STRING,
        defaultValue: '',
    },
});

module.exports = service;
