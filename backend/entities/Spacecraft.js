import db from '../dbConfig.js';
import Sequelize from 'sequelize';

const Spacecraft=db.define('Spacecraft',{
    idSpacecraft:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    numeS:{
        type: Sequelize.STRING,
        allowNull: false
    },
    vitezaMax:{
        type: Sequelize.DOUBLE,
        allownull: false
    },
    masa:{
        type: Sequelize.DOUBLE,
        allownull: false
    }
})

export default Spacecraft;