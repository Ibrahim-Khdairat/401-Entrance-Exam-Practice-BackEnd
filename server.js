const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose')
require('dotenv').config();
const axios = require('axios');
const server = express();
server.use(cors());
server.use(express.json());
const PORT = process.env.PORT;
let inMemoryResponse = [];

const Drink = require('./Drinks.json');

mongoose.connect(`${process.env.MONGO_DB_ATLAS}`, { useNewUrlParser: true, useUnifiedTopology: true });



const DrinkSchema = new mongoose.Schema({
    drinkName: String,
    drinkImg: String,
    drinkId: String
});


const UserSchema = new mongoose.Schema({
    email: String,
    drink: [DrinkSchema]
});

const UserModel = mongoose.model('User', UserSchema);

function seedUsersColction() {

    let ibrahim = new UserModel(
        {
            email: 'ibrahimkuderat@gmail.com',
            drink:
                [
                    {
                        drinkName: 'Afterglow',
                        drinkImg: 'https://www.thecocktaildb.com/images/media/drink/vuquyv1468876052.jpg',
                        drinkId: '12560'

                    }
                ]

        }
    )
    let razan = new UserModel(
        {
            email: 'r.alquran@ltuc.com',
            drink:
                [
                    {
                        drinkName: 'Alice Cocktail',
                        drinkImg: 'https://www.thecocktaildb.com/images/media/drink/qyqtpv1468876144.jpg',
                        drinkId: '12562'
                    }
                ]
        }
    )
    ibrahim.save();
    razan.save();
}

// seedUsersColction();


//------------------Getting informations --------------------

// Getting all drinks

// class Drinks {
//     constructor(strDrink, strDrinkThumb, idDrink) {
//         this.strDrink = strDrink,
//         this.strDrinkThumb = strDrinkThumb,
//         this.idDrink = idDrink
//     }
// }

server.get('/drinks', async (req, res) => {

    // res.send(Drink.drinks);

    let url = 'https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=Non_Alcoholic'

    if (inMemoryResponse.length !== 0) {
        console.log('We already have data ...');

        res.status(200).send(inMemoryResponse)
    }
    else {
        console.log('New Request ...');

        let result = await axios.get(url);

        // let response  = result.data.drinks.map (drink =>{
        //     return new Drinks ( drink.strDrink , drink.strDrinkThumb , drink.idDrink )
        // })

        inMemoryResponse = result.data.drinks;
        res.send(result.data.drinks);

    }
})







//Getting User Fav. Drinks
server.get('/userDrinks/:email', getUserDrinks);
server.post('/addToFav', addToFav);
server.delete('/deleteDrink/:email', deleteDrink)
server.put('/updateDrink/:email', updateDrink)




function getUserDrinks(req, res) {
    let userEmail = req.params.email;
    UserModel.find({ email: userEmail }, (error, UserData) => {
        if (error) {
            res.send(error)
        }
        else {
            res.send(UserData[0].drink)
        }
    })
}

function addToFav(req, res) {
    let userEmail = req.query.userEmail;
    const { drinkName, drinkImg, drinkId } = req.body;
    UserModel.find({ email: userEmail }, (error, Data) => {
        if (error) {
            res.send(error)
        }
        else {
            Data[0].drink.push(
                {
                    drinkName: drinkName,
                    drinkImg: drinkImg,
                    drinkId: drinkId
                }
            )
            Data[0].save()
        }
    })
}

function deleteDrink(req, res) {
    let userEmail = req.params.email;
    let drinkIndex = Number(req.query.index);

    UserModel.find({ email: userEmail }, (error, Data) => {
        if (error) {
            res.send(error)
        }
        else {
            let filtered = Data[0].drink.filter((drink, index) => {
                if (index !== drinkIndex) { return drink }
            })
            Data[0].drink = filtered;
            Data[0].save();
            res.send(Data[0].drink)
        }
    })
}

function updateDrink(req, res) {
    let drinkIndex = Number(req.query.index);
    let userEmail = req.params.email;
    const { drinkName, drinkImg, drinkId } = req.body;

    UserModel.find({ email: userEmail }, (error, Data) => {
        if (error) {
            res.send(error)
        }
        else {
            Data[0].drink.splice(drinkIndex, 1, {
                drinkName: drinkName,
                drinkImg: drinkImg,
                drinkId: drinkId
            }
            )
            Data[0].save();
            res.send(Data[0].drink)
        }
    })
}
//-------------------Testing & Listening -----------------------
server.get('/', (req, res) => {
    res.send('All Good ...')
})

server.listen(PORT, () => {
    console.log(`Listenng on Port : ${PORT}`);
})