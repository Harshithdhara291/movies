const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "moviesData.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObjectMovie = (dbObjectMovie) => {
  return {
    movieId: dbObjectMovie.movie_id,
    directorId: dbObjectMovie.director_id,
    movieName: dbObjectMovie.movie_name,
    leadActor: dbObjectMovie.lead_actor,
  };
};

const convertDbObjectToResponseObjectDirector = (dbObjectDirector) => {
  return {
    directorId: dbObjectDirector.director_id,
    directorName: dbObjectDirector.director_name,
  };
};

///API 1
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie;`;
  const moviesArray = await database.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) =>
      convertDbObjectToResponseObjectMovie(eachMovie)
    )
  );
});

///API 2
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `
  INSERT INTO
    movie (director_id, movie_name, lead_actor)
  VALUES
    ('${directorId}', ${movieName}, '${leadActor}');`;
  const moviesArray = await database.run(postMovieQuery);
  const movieId = moviesArray.lastID;
  //response.send({ movieId: movieId });
  response.send("Movie Successfully Added");
});

///API 3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT 
      * 
    FROM 
      movie 
    WHERE 
      movie_id = '${movieId}';`;
  const movie = await database.get(getMovieQuery);
  response.send(convertDbObjectToResponseObjectMovie(movie));
});

///API 4
app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieQuery = `
  UPDATE
    movie
  SET
    director_id = '${directorId}',
    movie_name = ${movieName},
    lead_actor = '${leadActor}'
  WHERE
    movie_id = '${movieId}';`;

  await database.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

///API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
  DELETE FROM
    movie
  WHERE
    movie_id = ${movieId};`;
  await database.run(deleteMovieQuery);
  response.send("Movie Removed");
});

///API 6
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT
      *
    FROM
      director;`;
  const directorsArray = await database.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachDirector) =>
      convertDbObjectToResponseObjectDirector(eachDirector)
    )
  );
});

///API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDMQuery = `
    SELECT 
      movie_name 
    FROM 
      movie 
    WHERE 
      director_id = ${directorId};`;
  const direc = await database.all(getDMQuery);
  response.send(
    direc.map((eachMovie) => convertDbObjectToResponseObjectMovie(eachMovie))
  );
});

module.exports = app;
