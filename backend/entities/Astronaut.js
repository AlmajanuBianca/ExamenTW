import db from '../dbConfig.js';
import Sequelize from 'sequelize';

const Astronaut=db.define('Astronaut',{
    idAstronaut:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    // FK
    idSpacecraft:{
        type:Sequelize.INTEGER,
        allowNull:false
    },
    numeA:{
        type: Sequelize.STRING,
        allowNull:false
    },
    rol:{
        type: Sequelize.STRING,
        allowNull:false
    }
})

export default Astronaut;