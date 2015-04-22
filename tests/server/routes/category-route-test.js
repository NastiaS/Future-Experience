// category-route-test.js

var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var should = chai.should();
chai.use(require('chai-things'));

var mongoose = require('mongoose');
var Promise = require('bluebird');
var http = require("http");
var app = require("../../../server/app");
var request = require("supertest");


require('../../../server/db/models/category');
require('../../../server/db/models/listitem');
require('../../../server/db/models/product');
require('../../../server/app/routes/category');

var Category = Promise.promisifyAll(mongoose.model('Category'));
var ListItem = Promise.promisifyAll(mongoose.model('ListItem'));
var Product = Promise.promisifyAll(mongoose.model('Product'));

describe('Category route', function () {
    var testCategory;
    var testProduct;
    var testListItem;
    var altTestCategory;
    var altTestProduct;
    var altTestListItem;

    beforeEach('Establish DB connection', function (done) {
        if (mongoose.connection.db) return done();
        mongoose.connect(dbURI, done);
    });

    beforeEach('Create a category, product and listitem', function(done) {

        var promises = [];
        promises.push(Category.createAsync({
            name : "space"
        }));
        promises.push( Product.createAsync({
            name : "Space Toilet Paper"
        }));

        Promise
            .all(promises)
            .then( function (array) {
                testCategory = array[0];
                testProduct = array[1];
                //console.log("category: ", testCategory, "product: ", testProduct);
                return ListItem.createAsync({
                    quantity : 5,
                    price: 800, //we are storing this in cents
                    product : testProduct._id,
                    category: testCategory._id
                });
            }).then(function (listitem) {
                testListItem = listitem;
                done();
            }).catch(function(err) {
                done(err);
            });
    });
    beforeEach('Create a category, product and listitem', function(done) {

        var altPromises = [];
        altPromises.push(Category.createAsync({
            name : "flood"
        }));
        altPromises.push( Product.createAsync({
            name : "WaterProof Toilet Paper"
        }));

        Promise
            .all(altPromises)
            .then( function (array) {
                altTestCategory = array[0];
                altTestProduct = array[1];
                //console.log("category: ", testCategory, "product: ", testProduct);
                return ListItem.createAsync({
                    quantity : 5,
                    price: 800, //we are storing this in cents
                    product : altTestProduct._id,
                    category: altTestCategory._id
                });
            }).then(function (listitem) {
                altTestListItem = listitem;
                done();
            }).catch(function(err) {
                done(err);
            });
    });

    after('Clear test database', function (done) {
        clearDB(done);
    });


    it('should return list of categories for plain get', function (done) {
        request(app)
            .get("/api/category")
            .end( function (err, data) {
                if (err) console.log('ERR:', err);
                //console.log("CALLBACK DATA res,", data.body);
                assert.equal(data.body[0].name, testCategory.name);
                done();
            });
    });


    it('should return list item array if given category name AND only that category', function () {
        request(app)
            .get("/api/category/" + testCategory._id)
            //receive array of itmes with category === category we submitted
            .end( function (err, data){
                //data.res.body[0].should.have.property('category', testCategory._id.toString());
                data.res.body.should.all.have.property('category', testCategory._id.toString());
                //assert.equal(data.body[0].category, testCategory._id);
            });
    });

});