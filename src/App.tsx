import { useEffect, useState } from "react";
import "./App.css";

interface Pokemon {
  name: string;
  id: number;
  image: string;
  types: string[];
}

const TYPE_ICONS: Record<string, string> = {
  normal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/1.png",
  fighting: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/2.png",
  flying: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/3.png",
  poison: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/4.png",
  ground: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/5.png",
  rock: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/6.png",
  bug: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/7.png",
  ghost: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/8.png",
  steel: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/9.png",
  fire: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/10.png",
  water: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/11.png",
  grass: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/12.png",
  electric: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/13.png",
  psychic: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/14.png",
  ice: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/15.png",
  dragon: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/16.png",
  dark: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/17.png",
  fairy: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/18.png"
};

// Colores para Opción 3 (barra según tipo principal)
const TYPE_COLORS: Record<string, string> = {
  fire: "#ff5733",
  water: "#3399ff",
  grass: "#55cc55",
  electric: "#ffdd33",
  ice: "#99e6ff",
  fighting: "#cc3300",
  poison: "#aa33cc",
  ground: "#d2b48c",
  flying: "#8899ff",
  psychic: "#ff66cc",
  bug: "#aabb22",
  rock: "#bbaa66",
  ghost: "#6666cc",
  dragon: "#7766ff",
  dark: "#555555",
  steel: "#c0c0c0",
  fairy: "#ff99cc",
  normal: "#dddddd"
};

// Regiones oficiales
const REGIONS: Record<string, [number, number]> = {
  Kanto: [1, 151],
  Johto: [152, 251],
  Hoenn: [252, 386],
  Sinnoh: [387, 493],
  Teselia: [494, 649],
  Kalos: [650, 721],
  Alola: [722, 809],
  Galar: [810, 905],
  Paldea: [906, 1025],
};

function App() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // === Carga Pokémon ===
  useEffect(() => {
    fetch("https://pokeapi.co/api/v2/pokemon?limit=1100")
      .then((res) => res.json())
      .then(async (data) => {
        const results = await Promise.all(
          data.results.map(async (p: any) => {
            const id = Number(p.url.split("/").filter(Boolean).pop());

            const details = await fetch(p.url).then((r) => r.json());
            const types = details.types.map((t: any) => t.type.name);

            return {
              name: p.name,
              id,
              image: `https://img.pokemondb.net/sprites/home/normal/${p.name}.png`,
              types,
            };
          })
        );

        setPokemons(results);
      });
  }, []);

  // === Filtros ===
  const filtered = pokemons.filter((p) => {
    if (selectedRegion) {
      const [min, max] = REGIONS[selectedRegion];
      if (p.id < min || p.id > max) return false;
    }

    if (selectedType && !p.types.includes(selectedType)) return false;

    if (search && !p.name.toLowerCase().includes(search.toLowerCase()))
      return false;

    return true;
  });

  return (
    <div className="pokedex">
      <div className="pokedex-header">
        <div className="light red"></div>
        <div className="light yellow"></div>
        <div className="light green"></div>

        {/* FILTROS ARRIBA */}
        <div className="filter-area">
          {/* Filtro por nombre */}
          <input
            className="filter-input"
            placeholder="Buscar Pokémon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Filtro por región */}
          <select
            className="filter-select"
            onChange={(e) =>
              setSelectedRegion(e.target.value || null)
            }
          >
            <option value="">Todas las regiones</option>
            {Object.keys(REGIONS).map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>

          {/* Filtro por tipo */}
          <div className="type-icons">
            {Object.keys(TYPE_ICONS).map((type) => (
              <img
                key={type}
                src={TYPE_ICONS[type]}
                className={
                  "type-icon " + (selectedType === type ? "active" : "")
                }
                onClick={() =>
                  setSelectedType(selectedType === type ? null : type)
                }
                title={"Filtrar por " + type}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="pokedex-screen">
        <div className="pokemon-grid">
          {filtered.map((pokemon) => (
            <a
              key={pokemon.id}
              href={`https://pokestop.cl/search/?q=${pokemon.name}`}
              className="pokemon-tile"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={pokemon.image} alt={pokemon.name} />

              <div
                className="pokemon-name-bar"
                style={{
                  background: TYPE_COLORS[pokemon.types[0]] || "#ccc",
                }}
              >
                {pokemon.name}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
