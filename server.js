require("dotenv").config()
const fs = require('node:fs');
const express = require('express')
const path = require('path')
const app = express();
const { google } = require('googleapis')



const auth = new google.auth.GoogleAuth({
    keyFile: './google.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],

})




app.listen(process.env.PORT_BACK);

app.use(express.static(path.join(__dirname, 'public')))

app.get("/api/orders", async (req, res) => {

    const spreadSheetId = req.query.sheetId





    try {
        const response = await fetch(process.env.SQ_API_URL, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${process.env.SQ_API_KEY}`,
                "User-Agent": "Fiordiva ECom"

            }
        });
        if (!response.ok) {
            throw new Error("Fetch Error")
        }

        const data = await response.json();

        const organizedData = data.result.map((entry) => {
            return {
                orderId: entry.id,
                numeroOrdine: entry.orderNumber,
                data: entry.createdOn,
                prodottoSku: entry.lineItems[0].sku,
                nomeProdotto: entry.lineItems[0].productName,
                idProdotto: entry.lineItems[0].productId,
                quantita: entry.lineItems[0].quantity,
                prezzoProdotto: entry.subtotal.value,
                prezzoSpedizione: entry.shippingTotal.value,
                prezzoTotale: entry.grandTotal.value,
                stato: entry.fulfillmentStatus,
                testMode: entry.testmode

            }
        })

        try {
            if (spreadSheetId) {
                normalizeToCSV(organizedData, spreadSheetId);
            }
            res.json(organizedData);
        } catch (err) {
            console.error(err.message);
            res.send(`<div style="color:red">Failed to write to Google Sheet: ${sheetError.message}</div>`);
        }


    } catch (error) {
        res.status(500).json({ error: error.message });
    }


})

async function normalizeToCSV(data, spreadSheetId) {
    if (!data.length) return [];

    const keys = Object.keys(data[0]);
    const twoDimArray = [keys];

    data.forEach(row => {

        const values = keys.map(k => row[k]);
        twoDimArray.push(values);
    });
    console.log(twoDimArray)
    const res = await writeToSpreadSheet(twoDimArray, spreadSheetId)

}


async function writeToSpreadSheet(data, spreadSheetId) {


    const sheets = google.sheets({
        version: 'v4',
        auth
    })

    const spreadsheetId = spreadSheetId;
    const range = 'A1';
    const valueInputOption = 'USER_ENTERED'


    const resource = {
        values: data
    };


    try {
        await sheets.spreadsheets.values.update({
            spreadsheetId, range, valueInputOption: valueInputOption, resource
        })
    } catch (err) {
        console.error(`Errore nel trovare lo spreadsheet ${spreadSheetId}:`, err.message);

        return { error: err }
    }
}

