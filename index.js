const express = require('express');
const exphbs = require('express-handlebars');
const pg = require("pg");
const Pool = pg.Pool;


const app = express();
const PORT = process.env.PORT || 3019;

// enable the req.body object - to allow us to use HTML forms
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// enable the static folder...
app.use(express.static('public'));

// add more middleware to allow for templating support

// should we use a SSL connection
let useSSL = false;
let local = process.env.LOCAL || false;
if (process.env.DATABASE_URL && !local) {
	useSSL = true;
}
// which db connection to use
const connectionString = process.env.DATABASE_URL || 'postgresql://vhonani:vhonani123@localhost:5432/avo_shopper';

const pool = new Pool({
	connectionString,
	ssl: {
		rejectUnauthorized: false
	}
});

app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');


const AvoShopper = require('./avo-shopper');
const avoshopper = AvoShopper(pool);
//const avoshopper = AvoShopper(pool);

let counter = 0;

app.get('/', function (req, res) {
	res.render('index', {
		counter
	});
});
app.get('/add', async function (req, res) {
	var shops = await avoshopper.listShops();
	console.log(shops);
	res.render('add', {
		shops,
		// deals
	});
});

app.post('/add', async function (req, res) {

	const { stores } = req.body;


	const { Price } = req.body;
	const { Qty } = req.body;


	console.log(stores);

	await avoshopper.createDeal(stores, Qty, Price);

	res.redirect('/add');


});
app.get('/viewShops', async function (req, res) {
	var shops = await avoshopper.listShops();
	res.render('viewShops', {
		shops: await avoshopper.listShops()
	});
});


app.get('/shopDeals/:id', async function (req, res) {
	const { id } = req.params;

	const deals = await avoshopper.dealsForShop(id);


	console.log(deals);
	//console.log(getDeals);


	res.render('shopDeals', {

		deals
		//deals: await avoshopper.dealsForShop();
		//deal: await avoshopper.dealsForShop(stores)


	});
});
app.post('/shopDeals', async function (req, res) {
	const { stores } = req.body;

	//console.log(stores);

	await avoshopper.dealsForShop(stores);
	res.redirect('/shopDeals');
});



app.get('/addShop', function (req, res) {
	res.render('addShop', {
		counter
	});
});
// start  the server and start listening for HTTP request on the PORT number specified...
app.listen(PORT, function () {
	console.log(`AvoApp started on port ${PORT}`)
});