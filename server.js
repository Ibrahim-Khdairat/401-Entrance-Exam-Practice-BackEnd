const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose')
require('dotenv').config();
const axios = require('axios');
const server = express();
server.use(cors());
server.use(express.json());

let inMemoryResponse = [];

const Drink = require('./Drinks.json');

mongoose.connect(`mongodb://ibrahim:0010097790@cluster0-shard-00-00.ekaaj.mongodb.net:27017,cluster0-shard-00-01.ekaaj.mongodb.net:27017,cluster0-shard-00-02.ekaaj.mongodb.net:27017/test?ssl=true&replicaSet=atlas-53s6ul-shard-0&authSource=admin&retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true });



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


// const getting = async function (req,res){
//     let data = await axios.get('www.thecocktaildb.com/api/json/v1/1/filter.php?a=Non_Alcoholic')
//     res.send(data.data)
//     }
server.get('/drinks', gettingFromAPI)




function gettingFromAPI(req, res) {

    res.send(Drink.drinks);


 




    // let url = 'www.thecocktaildb.com/api/json/v1/1/filter.php?a=Non_Alcoholic'

    // if (inMemoryResponse.length !== 0 ){
    //     console.log('We already have data ...');

    //     res.status(200).send(inMemoryResponse)
    // }
    // else {
    //     console.log('New Request ...');

    //     axios.get('www.thecocktaildb.com/api/json/v1/1/filter.php?a=Non_Alcoholic').then(DrinkResponse => {
    //         inMemoryResponse = DrinkResponse.data;
    //         console.log(inMemoryResponse);
    //         res.status(200).send(inMemoryResponse)
    //     }).catch(error => {
    //         res.status(404).send(error)
    //     })

    // }


}




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

server.listen(3002, () => {
    console.log(`Listenng on Port : ${3002}`);
})