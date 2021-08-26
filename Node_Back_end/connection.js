const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('node_project', 'root', '', {
  host: 'localhost',
  dialect: "mysql",
});


module.exports = sequelize;