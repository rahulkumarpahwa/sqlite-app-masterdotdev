import sqlite3 from "sqlite3";

// connect to the database here
// data.db is the name of the database file
const db = new sqlite3.Database("./data.db");

export default function registerInvoice(fastify, opts, done) {
  fastify.all("/", (request, reply) => {
    const id = request.query.id;

    db.all(
      `SELECT 
        InvoiceId as id,
        InvoiceDate as date, 
        BillingAddress as address, 
        BillingCity as city, 
        BillingState as state, 
        BillingCountry as country, 
        BillingPostalCode AS postalCode, 
        Total as total 
      FROM 
        Invoice
      WHERE 
        InvoiceId = ?`,
      [id],
      (err, invoice) => {
        if (err) {
          reply.code(500);
          reply.send({ error: err, errorLocation: "Invoice" });
          return;
        }

        if (invoice.length === 0) {
          reply.code(404);
          reply.send({ error: "Not found" });
          return;
        }

        console.log(invoice);
        db.all(
          `SELECT 
            i.UnitPrice AS unitPrice, 
            i.Quantity AS quantity, 
            t.Name AS trackName, 
            a.Title AS albumTitle,
            ar.Name AS artistName
          FROM 
            InvoiceLine i
          JOIN
            Track t ON t.TrackId = i.TrackId
          JOIN
            Album a ON a.AlbumId = t.AlbumId
          JOIN
            Artist ar ON ar.ArtistId = a.ArtistId
          WHERE 
            InvoiceId = ?`,
          [id],
          (err, lines) => {
            if (err) {
              reply.code(500);
              reply.send({ error: err, errorLocation: "Track" });
              return;
            }
            console.log(lines);
            reply.send({ invoice, lines });
          },
        );
      },
    );
  });

  done();
}

/*
this is how the response should look (to work in the UI)
{
  "invoice":
    {
      "id":10,
      "date":"2021-02-03 00:00:00",
      "address":"3 Chatham Street",
      "city":"Dublin",
      "state":On which port does the local development server run?"Dublin",
      "country":"Ireland",
      "postalCode":null,
      "total":5.94
    },
  "lines":
    [
      {
        "unitPrice":0.99,
        "quantity":1,
        "trackName":"Etnia",
        "albumTitle":"Afrociberdelia",
        "artistName":"Chico Science & Nação Zumbi"
      },
      […]
    ]
}


*/
