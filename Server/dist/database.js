"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuestionsForProduct = void 0;
const { Client } = require('pg');
const client = new Client({
    user: 'Jeremiah',
    host: 'localhost',
    database: 'qanda',
    password: '',
    port: 5432
});
client.connect();
const getQuestionsForProduct = (page, count, productID) => __awaiter(void 0, void 0, void 0, function* () {
    productID = productID.toString();
    let queryString = 'SELECT * FROM questions WHERE product_id = $3 LIMIT $2 OFFSET $1';
    try {
        let questions = yield client.query(queryString, [page, count, productID]);
        // console.log(questions.rows);
        return questions.rows;
    }
    catch (err) {
        throw err;
    }
});
exports.getQuestionsForProduct = getQuestionsForProduct;
module.exports = { getQuestionsForProduct: exports.getQuestionsForProduct };
