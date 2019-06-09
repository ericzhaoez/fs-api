const express = require("express");
const cors = require('cors');
const mysql = require('mysql');

const config = {
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "fs_bnb"
};
const connection = mysql.createConnection(config);
connection.connect();

const app = express();

// 1. this will post a user's information to the api when they submit on the register page 

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post("/api/users", (req, res) => {
    // res.send("Yay!");
    const user = req.body;
    console.log(user);

    // const userInsert = {
    //     columnA: user.firstname,
    //     columnB: user.lastname,
    //     columnC: user.email,
    //     columnC: user.password
    // };

    connection.query("INSERT INTO user SET ?", user, (err, result) => {
        if (err) {
            console.log(err);

            if (err.code == 'ER_DUP_ENTRY') {
                return res.status(400).json({message: err.sqlMessage});
            } else {
                return res.status(500).json({message: "Failed to insert"});
            }
        }

        console.log(result);

        var responseUser = {
            id: result.insertId,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            password: user.password
        }

        console.log(responseUser);

        return res.status(200).json(responseUser);
    });

    // res.json({
    //     message: "Yay!"
    // });
});

// this is a first draft of my code to log in a user, refer to code 3. for final version

// app.post("/api/users/authentication", (req, res) => {
//     const user = req.body;
//     const bodyEmail = user.email;
//     const bodyPassword = user.password;

//     connection.query("SELECT * FROM user WHERE email = ? AND password = ?", [bodyEmail, bodyPassword], function (err, results) {
//         console.log(err);
//         console.log(results);
//         if (results.length > 0) {
//             return res.status(200).json(results[0])
//         } else {
//             return res.status(400).json({message: "Incorrect Email or Password"})
//         }

//     });

// });


// 2. this will post property details when they are submitted on tab 2 of the provider app

app.post("/api/properties", (req, res) => {
    // res.send("Yay!");
    const property = req.body;
    console.log(property);

    connection.query("INSERT INTO property SET ?", property, (err, result) => {
        if (err) {
            console.log(err);

            if (err.code == 'ER_DUP_ENTRY') {
                return res.status(400).json({message: err.sqlMessage});
            } else {
                return res.status(500).json({message: "Failed to insert"});
            }
        }

        console.log(result);

        var responseProperty = {
            id: result.insertId,
            name: property.name,
            location: property.location,
            imageUrl: property.imageUrl,
            price: property.price,
        }

        return res.status(200).json(responseProperty);
    });

});

// 3. this code will log in a user, can be tested at http://localhost:3000/api/auth

app.post("/api/auth", (req, res) => {
    const user = req.body;
    const userId = req.params.id;

    connection.query(
        "SELECT * FROM user WHERE email = ? AND password = ?",
        [
            user.email,
            user.password
        ],
        (err, result) => {
            if (err) {
                return res.status(500).json({message: "Failed to login"})
            }
            if (result.length === 0) {
                return res.status(401).json({message: "Invalid email or password"})
            }

            const responseUser = {
                id: result[0].id,
                firstname: result[0].firstname,
                lastname: result[0].lastname,
                email: result[0].email,
                // providerid: userId,
            };
            return res.status(200).json(responseUser);
        }
    );

    // res.json(authReq);
});


// 4. this code stores user data and passes it between pages so the right user appears on the profile tab

app.get("/api/users/:id", (req, res) => {
    const userId = req.params.id;
  
    connection.query(
      "SELECT * FROM user WHERE id = ?",
      [userId],
      (err, result) => {
        if (err) {
          return res.status(500).json({ message: "Failed to select" });
        }
  
        if (result.length === 0) {
          return res.status(404).json({ message: "No user found for ID" });
        }
  
        const responseUser = {
            id: result[0].id,
            firstname: result[0].firstname,
            lastname: result[0].lastname,
            email: result[0].email
        };
        return res.status(200).json(responseUser);
      }
    );
  });


// 5. this code will create a list of all properties in the api for consumers to select one to book

app.get("/api/properties", (req, res) => {
    const property = req.body;
    // console.log(property);

    connection.query(
        "SELECT * FROM property", function(err, result) {
        if (err) {
            console.log(err); 
            return res.status(500).json({message: "Failed to display"})
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "No properties found" });
        }

        // const responseProperty = {
        //     id: result[0].id,
        //     name: result[0].name,
        //     location: result[0].location,
        //     imageUrl: result[0].imageUrl,
        //     price: result[0].price
        // };
        // console.log(result);
        return res.status(200).json(result);
    }
    )
});

// 6. this code will get property details from the api to appear when a consumer wants to book


app.get("/api/properties/:id", (req, res) => {
    const propertyId = req.params.id;
  
    connection.query(
      "SELECT * FROM property WHERE id = ?",
      [propertyId],
      (err, result) => {
        if (err) {
          return res.status(500).json({ message: "Failed to select" });
        }
  
        if (result.length === 0) {
          return res.status(404).json({ message: "No home found for ID" });
        }
  
        const responseProperty = {
            id: result[0].id,
            name: result[0].name,
            location: result[0].location,
            imageUrl: result[0].imageUrl,
            price: result[0].price
        };
        return res.status(200).json(responseProperty);
      }
    );
  });

// 7. this code to post new bookings to the api when the button is pressed on the consumer app

  app.post("/api/properties/:id/bookings", (req, res) => {
    // res.send("Yay!");
    const booking = req.body;
    // console.log(booking);
    // const userId = req.params.id;
    // const propertyId = req.params.id;

    connection.query("INSERT INTO bookings SET ?", booking, (err, result) => {
        if (err) {
            console.log(err);

            if (err.code == 'ER_DUP_ENTRY') {
                return res.status(400).json({message: err.sqlMessage});
            } else {
                return res.status(500).json({message: "Failed to insert"});
            }
        }

        // console.log(result);

        var responseBooking = {
            id: result.insertId,
            dateFrom: booking.dateFrom,
            dateTo: booking.dateTo,
            // userId: result.userId,
            // propertyId: result.propertyId,
            // status: "NEW",
        }

        return res.status(200).json(responseBooking);
    });

});

app.listen(3000, () => console.log("Listening on 3000"));