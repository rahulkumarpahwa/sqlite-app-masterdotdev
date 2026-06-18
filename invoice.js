import sqlite3 from "sqlite3";

// connect to the database here
// data.db is the name of the database file
const db = new sqlite3.Database("./data.db")

export default function registerInvoice(fastify, opts, done) {
  fastify.all("/", (request, reply) => {
    const id = request.query.id;
    console.log(id)

    // code goes here
    db.get(
      "SELECT * FROM invoice WHERE InvoiceId = ?",
      [id],
      (err, invoice) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(invoice)
        db.all(
          "SELECT * FROM invoiceline WHERE InvoiceId = ?",
          [id],
          (err, lines) => {
            if (err) {
              console.error(err);
              return;
            }
            console.log(lines);
            reply.send({ invoice, lines });
          }
        );
      }
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
