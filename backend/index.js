import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql from 'mysql2/promise';
import db from './dbConfig.js';
import {DB_USERNAME, DB_PASSWORD} from './Consts.js';
import Spacecraft from './entities/Spacecraft.js';
import Astronaut from './entities/Astronaut.js';
import Sequelize from 'sequelize';
const LikeOp = Sequelize.Op.like;


// configurarile pentru api respectiv pentru router
let app = express();
let router = express.Router();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());
app.use('/api', router);

// conexiunea pentru baza de date + crearea ei
let conn;
mysql.createConnection({
    user: DB_USERNAME,
    password: DB_PASSWORD
})
.then(connection => {
    conn = connection;
    return connection.query("CREATE DATABASE IF NOT EXISTS EXAMEN_DATABASE");
})
.then(() => {
    return conn.end();
})
.catch((err) => {
    console.warn(err.stack);
})

// legaturile intre tabele
// ONE TO MANY
Spacecraft.hasMany(Astronaut, {as : "Astronauti", foreignKey: "idSpacecraft"});
Astronaut.belongsTo(Spacecraft, {foreignKey: "idSpacecraft"});

// crearea tabelelor
db.sync();


//////////////////////////////////////////////////////////////////////////////// Spacecraft
// 1. Get lista de Spacecrafts cu tot cu lista de astronauti a fiecarei navete
async function getSpacecraft(){
    return await Spacecraft.findAll({include: ["Astronauti"]});
}
router.route('/spacecraft').get(async(req,res)=>{
    return res.json(await getSpacecraft());
})

// 2. Creare Spacecraft FARA astronauti
async function createSpacecraft(spacecraft){
    return await Spacecraft.create(spacecraft);
}
router.route('/spacecraft').post(async(req,res)=>{
    let ok = 0;
    let mesaj = "";
    if(!req.body.numeS) {
        ok = 1;
        mesaj = "Numele navetei lipseste!";
    }
    if(!req.body.vitezaMax) {
        ok = 1;
        mesaj = "Viteza maxima lipseste!";
    }
    if(!req.body.masa) {
        ok = 1;
        mesaj = "Masa navetei lipseste!";
    }
    if(req.body.numeS.length < 3) {
        ok = 1;
        mesaj = "Numele navetei trebuie sa contina cel putin 3 caractere!";
    }
    if(parseFloat(req.body.vitezaMax) < 1000) {
        ok = 1;
        mesaj = "Viteza maxima a navetei trebuie sa fie mai mare decat 1000!";
    }
    if(parseFloat(req.body.masa) < 200) {
        ok = 1;
        mesaj = "Masa navetei trebuie sa fie mai mare decat 200!";
    }
    if(ok === 0) {
        return res.status(201).json(await createSpacecraft(req.body)); 
    }
    else {
        console.log(mesaj);
        return res.status(404).json({ error: mesaj });
    }
})

// 3. Get Spacecraft dupa id si CU tot cu astronauti
async function getSpacecraftById(id){
    return await Spacecraft.findByPk(id, {include: ["Astronauti"]});
}
router.route('/spacecraft/:id').get(async (req, res) => {
    const SpacecraftCautat = await getSpacecraftById(req.params.id);
    if(SpacecraftCautat) {
        return res.status(200).json(SpacecraftCautat); 
    }
    else {
        console.log("Nu exista naveta cautata, reincercati dupa un alt ID!");
        return res.status(404).json({ error: "Nu exista naveta cautata, reincercati dupa un alt ID!"}); 
    }
})

// 4. Stergere Spacecraft
async function deleteSpacecraft(id){
    let deleteEntity=await getSpacecraftById(id);
    return await deleteEntity.destroy();
}
router.route('/spacecraft/:id').delete(async(req, res) => {
    const SpacecraftCautat = await getSpacecraftById(req.params.id);
    if(SpacecraftCautat) {
        return res.status(200).json(await deleteSpacecraft(req.params.id)); 
    }
    else {
        console.log("Nu exista naveta, reincercati dupa un alt ID!");
        return res.status(404).json({ error: "Nu exista naveta, reincercati dupa un alt ID!"}); 
    }
})

// 5. Update Spacecraft dupa ID-ul sau
async function updateSpacecraft(id, spacecraft){
    let updateEntity = await getSpacecraftById(id);
    return await updateEntity.update(spacecraft);
}
router.route('/spacecraft/:id').put(async(req, res) => {
    let ok = 0;
    let mesaj = "";
    if(!req.body.idSpacecraft) {
        ok = 1;
        mesaj = "ID-ul navetei lipseste!";
    }
    if(req.body.idSpacecraft!=req.params.id) {
        ok = 1;
        mesaj = "Id-ul introdus in ruta nu corespunde cu id-ul navetei, va rugam reincercati";
    }
    let updateEntity = await getSpacecraftById(req.params.id);
    if (!updateEntity){
        ok = 1;
        mesaj = "Nu exista un Spacecraft cu id-ul introdus in baza de date";
    }
    if(!req.body.numeS) {
        ok = 1;
        mesaj = "Numele navetei lipseste!";
    }
    if(!req.body.vitezaMax) {
        ok = 1;
        mesaj = "Viteza maxima lipseste!";
    }
    if(!req.body.masa) {
        ok = 1;
        mesaj = "Masa navetei lipseste!";
    }
    if(req.body.numeS.length < 3) {
        ok = 1;
        mesaj = "Numele navetei trebuie sa contina cel putin 3 caractere!";
    }
    if(parseFloat(req.body.vitezaMax) < 1000) {
        ok = 1;
        mesaj = "Viteza maxima a navetei trebuie sa fie mai mare decat 1000!";
    }
    if(parseFloat(req.body.masa) < 200) {
        ok = 1;
        mesaj = "Masa navetei trebuie sa fie mai mare decat 200!";
    }
    if(ok === 0) {
        return res.status(201).json(await updateSpacecraft(req.params.id, req.body)); 
    }
    else {
        console.log(mesaj);
        return res.status(404).json({ error: mesaj });
    }
})

// 6. Filtru
// Get Spacecraft dupa 
async function getSpacecraftByFilter(filter){
    let whereClause = {};
    if (filter.numeS)
        whereClause.numeS = {[LikeOp]: `%${filter.numeS}%`}; 
    if (filter.masa)
        whereClause.masa = {[LikeOp]: filter.masa}; 
    return await Spacecraft.findAll({ include: ["Astronauti"], where: whereClause});   
}
// http://localhost:8000/api/spacecraftFiltru/?numeS=abc&masa=500
router.route('/spacecraftFiltru').get(async (req, res) => {
    return res.json(await getSpacecraftByFilter(req.query));
})

//////////////////////////////////////////////////////////////////////////////// Astronaut
// 1. Get lista Astronauti de la toate navetele (pentru verificare in postman)
async function getAstronaut(){
    return await Astronaut.findAll();
}
router.route('/astronaut').get(async(req,res)=>{
    return res.json(await getAstronaut());
})

// 2. Creare Astronaut pentru Spacecraft al carui ID e primit ca parametru
async function createAstronaut(id, astronaut){
    let spacecraft = await getSpacecraftById(id);
    if (!spacecraft){
        console.log("Nu exista un spacecraft cu id-ul introdus in baza de date");
        return;
    }
    return await Astronaut.create(astronaut);
}
router.route('/astronaut/:id').post(async(req, res) => {
    let ok = 0;
    let mesaj = "";
    if(!req.body.idSpacecraft) {
        ok = 1;
        mesaj = "Introduceti ID-ul navetei la care se va adauga astronautul!";
    }
    if(req.body.idSpacecraft!=req.params.id) {
        ok = 1;
        mesaj = "Id-ul introdus in ruta nu corespunde cu id-ul navetei la care se va adauga astronautul";
    }
    let spacecraft = await getSpacecraftById(req.params.id);
    if (!spacecraft){
        ok = 1;
        mesaj = "Nu exista un spacecraft cu id-ul introdus in baza de date";
    }
    if(!req.body.numeA) {
        ok = 1;
        mesaj = "Numele astronautului lipseste!";
    }
    if(!req.body.rol) {
        ok = 1;
        mesaj = "Rolul astronautului lipseste!";
    }
    if(req.body.numeA.length < 5) {
        ok = 1;
        mesaj = "Numele astronautului trebuie sa contina cel putin 5 caractere!";
    }
    if(req.body.rol !== "COMMANDER" && req.body.rol !== "PILOT" && req.body.rol !== "MEDIC") {
        ok = 1;
        mesaj = "Rolul unui astronaut este COMMANDER sau PILOT sau MEDIC cu litere mari!";
    }
    if(ok === 0) {
        return res.status(201).json(await createAstronaut(req.params.id, req.body)); 
    }
    else {
        console.log(mesaj);
        return res.status(404).json({ error: mesaj });
    }
})

// 3. Get Astronaut dupa ID-ul sau
async function getAstronautById(id){
    return await Astronaut.findByPk(id);
}
router.route('/astronaut/:id').get(async (req, res) => {
    const AstronautCautat = await getAstronautById(req.params.id);
    if(AstronautCautat) {
        return res.status(200).json(AstronautCautat); 
    }
    else {
        console.log("Nu exista!");
        return res.status(404).json({ error: "Nu exista!"}); 
    }
})

// 4. Stergere Astronaut dupa id
async function deleteAstronaut(id){
    let deleteEntity=await getAstronautById(id);
    return await deleteEntity.destroy();
}
router.route('/astronaut/:id').delete(async(req, res) => {
    const AstronautCautat = await getAstronautById(req.params.id);
    if(AstronautCautat) {
        return res.status(200).json(await deleteAstronaut(req.params.id)); 
    }
    else {
        console.log("Nu exista!");
        return res.status(404).json({ error: "Nu exista!"}); 
    }
})

// 5. Update Astronaut dupa ID-ul sau
async function updateAstronaut(id, astronaut){
    let updateEntity = await getAstronautById(id);
    if (!updateEntity){
        console.log("Nu exista un Astronaut cu id-ul introdus in baza de date");
        return;
    }
    return await updateEntity.update(astronaut);
}
router.route('/astronaut/:id').put(async(req, res) => {
    let ok = 0;
    let mesaj = "";
    if(!req.body.idSpacecraft) {
        ok = 1;
        mesaj = "ID-ul navei lipseste!";
    }
    if(!req.body.idAstronaut) {
        ok = 1;
        mesaj = "ID-ul astronautului lipseste!";
    }
    if(req.body.idAstronaut!=req.params.id) {
        ok = 1;
        mesaj = "Id-ul introdus in ruta nu corespunde cu id-ul astronautului, va rugam reincercati";
    }
    let updateEntity = await getAstronautById(req.params.id);
    if (!updateEntity){
        ok = 1;
        mesaj = "Nu exista un Astronaut cu id-ul introdus in baza de date";
    }
    if(!req.body.numeA) {
        ok = 1;
        mesaj = "Numele astronautului lipseste!";
    }
    if(!req.body.rol) {
        ok = 1;
        mesaj = "Rolul astronautului lipseste!";
    }
    if(req.body.numeA.length < 5) {
        ok = 1;
        mesaj = "Numele astronautului trebuie sa contina cel putin 5 caractere!";
    }
    if(req.body.rol !== "COMMANDER" && req.body.rol !== "PILOT" && req.body.rol !== "MEDIC") {
        ok = 1;
        mesaj = "Rolul unui astronaut este COMMANDER sau PILOT sau MEDIC cu litere mari!";
    }
    if(ok === 0) {
        return res.status(201).json(await updateAstronaut(req.params.id, req.body)); 
    }
    else {
        console.log(mesaj);
        return res.status(404).json({ error: mesaj });
    }
})

//6. Get astronautii unui spacecraft dupa id-ul navei
async function getAstronautByIdSpacecraft(idSpacecraft){
    return await Astronaut.findAll({where: idSpacecraft ? {idSpacecraft: idSpacecraft} : undefined})
}
// http://localhost:8000/api/astronautFiltru/?idSpacecraft=1
router.route('/astronautFiltru').get(async (req, res) => {
    let ok = 0;
    let mesaj = "";
    let spacecraftCautat = await getSpacecraftById(req.query.idSpacecraft);
    if(!spacecraftCautat) {
        ok = 1;
        mesaj = "Nava nu exista in baza de date";
    }
    if(ok == 0) {
        return res.json(await getAstronautByIdSpacecraft(req.query.idSpacecraft));
    }
    else {
        console.log(mesaj);
        return res.status(404).json({ error: mesaj });
    }
})

//7. Sortarea astronautilor unei anumite nave spatiale (dupa id-ul navei) in ordine alfabetica dupa numele acestora
// http://localhost:8000/api/sortat/1
router.route('/sortat/:id').get(async (req, res) => {
    let ok = 0;
    let mesaj = "";
    let spacecraftCautat = await getSpacecraftById(req.params.id);
    if(!spacecraftCautat) {
        ok = 1;
        mesaj = "Nava nu exista";
    }
    if(ok == 0) {
        let lista = await getAstronautByIdSpacecraft(req.params.id);
        const listaSortata = lista.sort((a,b)=> {
            if(a.numeA.toUpperCase() < b.numeA.toUpperCase()) {
                return -1;
            }
            if(a.numeA.toUpperCase() > b.numeA.toUpperCase()) {
                return 1;
            }
            return 0;
        });
        return res.json(listaSortata);
    }
    else {
        console.log(mesaj);
        return res.status(404).json({ error: mesaj });
    }
})

let port = process.env.PORT || 8000;
app.listen(port);
console.log(`API is running at ${port}`);