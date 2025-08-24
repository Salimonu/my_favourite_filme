import { useEffect, useState, useRef } from 'react';

import StarRating from './StarRating';
import Logo from './components/Logo';

import Box from './components/Box';
import MovieList from './components/MovieList';
import Movie from './components/Movie';
import Numresults from './components/Numresults';
import Search from './components/Search';
import WatchedList from './components/WatchedList';
import WatchedSummary from './components/WatchedSummary';
import { useMovies } from './useMovies';
import { useKey } from './useKey';
import { useLocalStorageState } from './useLocalStorage';

export default function App() {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const { movies, isLoading, error } = useMovies(query, handleCloseMovie);
  const [watched, setWatched] = useLocalStorageState([], 'watched');

  // const [watched, setWatched] = useLocalStorageState([], 'watched');

  function handleMovieDetail(id) {
    setSelectedId(selectedId === id ? null : id);
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched(watched => [...watched, movie]);
  }

  function handleDeleteWatched(id) {
    setWatched(watched => watched.filter(movie => movie.imdbID !== id));
  }

  return (
    <>
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <Numresults movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
          {isLoading && <Loader />}
          {error && <ErrorMessage message={error} />}
          {!isLoading && !error && (
            <MovieList movies={movies} onMovieSelection={handleMovieDetail}>
              <Movie onMovieSelection={handleMovieDetail} />
            </MovieList>
          )}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetails
              watched={watched}
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              {
                <WatchedList
                  watched={watched}
                  onDeleteWatched={handleDeleteWatched}
                />
              }
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔</span> {message}
    </p>
  );
}

function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function MovieDetails({ watched, selectedId, onCloseMovie, onAddWatched }) {
  const KEY = 'a3d269c4';

  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState('');
  const [userRating, setUserRating] = useState('');

  const countRef = useRef(0);
  useEffect(
    function () {
      if (userRating) countRef.current++;
    },
    [userRating]
  );

  const isWatched = watched.map(movie => movie.imdbID).includes(selectedId);

  const watchedUserRating = watched.find(
    movie => movie.imdbID === selectedId
  )?.userRating;

  const {
    Title: title,
    Year: year = 'N/A',
    Poster: poster = 'N/A',
    Runtime: runtime = 'N/A',
    imdbRating,
    Plot: plot = 'N/A',
    Released: released = 'N/A',
    Actors: actors = 'N/A',
    Director: director = 'N/A',
    Genre: genre = 'N/A',
  } = movie;

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(' ').at(0)),
      userRating,
      countRatingDecision: countRef.current,
    };

    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  useKey('Escape', onCloseMovie);

  useEffect(
    function () {
      try {
        setIsLoading(true);
        // setError('');
        async function getMovieDetail() {
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
          );
          const data = await res.json();

          if (!res.ok)
            throw new Error('Movie detail coud not be found, try again soon.');

          setMovie(data);
          setIsLoading(false);
        }
        getMovieDetail();
      } catch (err) {
        console.error(err.message);
        // setError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedId]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `MOVIE | ${title}`;

      return function () {
        document.title = 'usePopcorn';
      };
    },
    [title]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of &{movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDB rating
              </p>
            </div>
          </header>

          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    className="star"
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You rated this movie {watchedUserRating} <span>⭐</span>
                </p>
              )}
            </div>

            <p>
              <em>{plot}</em>
            </p>
            <p>
              Starring {actors}
              <p>Directed by {director}</p>
            </p>
          </section>
        </>
      )}
    </div>
  );
}
