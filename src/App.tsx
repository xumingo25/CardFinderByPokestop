import { useEffect, useState } from "react";
import "./App.css";

interface Pokemon {
  name: string;
  id: number;
  image: string;
}

function App() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);

  useEffect(() => {
    fetch("https://pokeapi.co/api/v2/pokemon?limit=1100")
      .then((res) => res.json())
      .then((data) => {
        const list: Pokemon[] = data.results.map((p: any) => {
          const id = p.url.split("/").filter(Boolean).pop();
          return {
            name: p.name,
            id: Number(id),
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
          };
        });

        setPokemons(list);
      });
  }, []);

  return (
    <div className="pokedex">
      <div className="pokedex-header">
        <div className="light red"></div>
        <div className="light yellow"></div>
        <div className="light green"></div>
    </div>

      <div className="pokedex-screen">
        <div className="pokemon-grid">
          {pokemons.map((pokemon) => (
            <a
              key={pokemon.id}
              href={`https://pokestop.cl/search/?q=${pokemon.name}`}
              className="pokemon-tile"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={"https://img.pokemondb.net/sprites/home/normal/" + pokemon.name + ".png"} alt={pokemon.name} />
             
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
