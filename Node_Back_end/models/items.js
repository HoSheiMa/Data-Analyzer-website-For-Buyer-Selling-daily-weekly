var sequelize = require('../connection');
const {DataTypes} = require("sequelize");

var users = sequelize.define('items', {
    'loc': {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    'vendor': {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    'sub_vendor': {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    'vendor_name': {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    'item_number': {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    "item_description": {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    "item_pack": {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    "last_sale_date": {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    "item_status": {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    "quantity_ordered": {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    'quantity_not_supplied': {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    'comment': {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    "dollars_lost": {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    "current_item_status": {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    "buyer": {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    "buyer_name": {
        type: DataTypes.STRING,
        defaultValue: '',
    }

});

module.exports = users;