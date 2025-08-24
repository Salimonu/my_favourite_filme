import { useEffect, useRef } from 'react';
import { useKey } from '../useKey';

export default function Search({ query, setQuery }) {
  // useEffect(function () {
  //   const el = document.querySelector('.search');
  //   el.focus();
  // }, []);

  const inputEl = useRef(null);

  useKey('Enter', () => {
    if (document.activeElement === inputEl.current) return;
    setQuery('');
    inputEl.current.focus();
  });

  useEffect(
    function () {
      function callback(e) {
        if (e.code === 'Enter') {
          if (document.activeElement === inputEl.current) return;
          setQuery('');
          inputEl.current.focus();
        }
      }

      document.addEventListener('keydown', callback);

      return () => document.addEventListener('keydown', callback);
    },
    [setQuery]
  );

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={e => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}
