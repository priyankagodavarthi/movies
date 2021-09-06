const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

app.use(express.json());
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertDbObjToResponseObj = (dbObj) => {
  return {
    movieId: dbObj.movie_id,
    directorId: dbObj.director_id,
    movieName: dbObj.movie_name,
    leadActor: dbObj.lead_actor,
  };
};
const convertDbObjectToResponseObject = (dbObj) => {
  return {
    directorId: dbObj.director_id,
    directorName: dbObj.director_name,
  };
};

//get method
app.get("/movies/", async (request, response) => {
  const getAllMovies = `SELECT movie_name FROM movie;`;
  const movieArray = await db.all(getAllMovies);
  response.send(
    movieArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

//post method
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const movieQuery = `INSERT INTO movie(director_id,movie_name,lead_actor)
    VALUES(${directorId},'${movieName}','${leadActor}');`;
  await db.run(movieQuery);
  response.send("Movie Successfully Added");
});

//get method
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovie = `SELECT * FROM movie
    WHERE 
    movie_id=${movieId};`;
  const movieResponse = await db.get(getMovie);
  response.send(convertDbObjToResponseObj(movieResponse));
});

//put method
app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const insertMovie = `UPDATE movie
    SET 
     director_id=${directorId},
     movie_name='${movieName}',
     lead_actor='${leadActor}'
     WHERE movie_id=${movieId};`;

  await db.run(insertMovie);
  response.send("Movie Details Updated");
});

//delete method
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `DELETE FROM movie WHERE movie_id=${movieId};`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

//get method
app.get("/directors/", async (request, response) => {
  const getDirectors = `SELECT * FROM director;`;
  const directorArray = await db.all(getDirectors);
  response.send(
    directorArray.map((eachDirector) =>
      convertDbObjectToResponseObject(eachDirector)
    )
  );
});

//get method
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const directorQuery = `SELECT movie_name FROM movie 
    WHERE director_id=${directorId};`;
  const array = await db.all(directorQuery);
  response.send(
    array.map((eachArray) => ({
      movieName: eachArray.movie_name,
    }))
  );
});
module.exports = app;
