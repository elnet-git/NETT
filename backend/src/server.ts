import "dotenv/config";

import express from "express";
import http from "http";

import authRoutes from "./modules/auth/routes/auth.routes";
import locationRoutes from "./modules/locations/location.routes";
import tripRoutes from "./modules/trips.routes";

import { initSocket } from "./realtime/socket";


const app = express();

app.use((req, res, next) => {

  console.log(
    `${req.method} ${req.originalUrl}`
  );

  next();

});

// =====================================
// MIDDLEWARES
// =====================================

app.use(
  express.json({
    limit:"10mb"
  })
);


app.use(
  express.urlencoded({
    extended:true
  })
);



// =====================================
// DEBUG HEADERS
// =====================================

app.get(
  "/headers",
  (req,res)=>{

    console.log(
      req.headers
    );

    res.json(req.headers);

  }
);



// =====================================
// ROUTES
// =====================================


app.use(
  "/auth",
  authRoutes
);


app.use(
  "/location",
  locationRoutes
);


app.use(
  "/trips",
  tripRoutes
);



// =====================================
// SERVER + SOCKET
// =====================================


const server =
http.createServer(app);



initSocket(server);



server.listen(
  3000,
  ()=>{

    console.log(
      "🚀 NETT ULTRA running on port 3000"
    );

  }
);