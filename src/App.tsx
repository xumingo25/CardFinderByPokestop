import React, { JSX, useEffect, useState } from "react";
import "./App.css";

/* -------------------------
   Tipos / Constantes
   ------------------------- */
type Pokemon = {
  id: number;
  name: string;
  image: string;
  types: string[];
};

const TYPE_ICON_URL = (type: string) => {
  // URLs directas de Wikidex - iconos cuadrados SVG (EP - Escarlata/Púrpura)
  const typeIcons: Record<string, string> = {
    steel: "https://images.wikidexcdn.net/mwuploads/wikidex/6/6c/latest/20230128124521/Tipo_acero_icono_EP.svg",
    water: "https://images.wikidexcdn.net/mwuploads/wikidex/d/d6/latest/20230128124702/Tipo_agua_icono_EP.svg",
    bug: "https://images.wikidexcdn.net/mwuploads/wikidex/1/1a/latest/20230128124809/Tipo_bicho_icono_EP.svg",
    dragon: "https://images.wikidexcdn.net/mwuploads/wikidex/1/15/latest/20230128124905/Tipo_dragón_icono_EP.svg",
    electric: "https://images.wikidexcdn.net/mwuploads/wikidex/8/84/latest/20230128125008/Tipo_eléctrico_icono_EP.svg",
    ghost: "https://images.wikidexcdn.net/mwuploads/wikidex/3/3d/latest/20230128125103/Tipo_fantasma_icono_EP.svg",
    fire: "https://images.wikidexcdn.net/mwuploads/wikidex/5/55/latest/20230128125153/Tipo_fuego_icono_EP.svg",
    fairy: "https://images.wikidexcdn.net/mwuploads/wikidex/b/b7/latest/20230128125233/Tipo_hada_icono_EP.svg",
    ice: "https://images.wikidexcdn.net/mwuploads/wikidex/a/a6/latest/20230128125423/Tipo_hielo_icono_EP.svg",
    fighting: "https://images.wikidexcdn.net/mwuploads/wikidex/f/f2/latest/20230128125518/Tipo_lucha_icono_EP.svg",
    normal: "https://images.wikidexcdn.net/mwuploads/wikidex/c/c3/latest/20230128125621/Tipo_normal_icono_EP.svg",
    grass: "https://images.wikidexcdn.net/mwuploads/wikidex/e/ed/latest/20230128125654/Tipo_planta_icono_EP.svg",
    psychic: "https://images.wikidexcdn.net/mwuploads/wikidex/2/22/latest/20230128125735/Tipo_psíquico_icono_EP.svg",
    rock: "https://images.wikidexcdn.net/mwuploads/wikidex/1/14/latest/20230128125805/Tipo_roca_icono_EP.svg",
    dark: "https://images.wikidexcdn.net/mwuploads/wikidex/e/e0/latest/20230128132504/Tipo_siniestro_icono_EP.svg",
    ground: "https://images.wikidexcdn.net/mwuploads/wikidex/c/c8/latest/20230128132625/Tipo_tierra_icono_EP.svg",
    poison: "https://images.wikidexcdn.net/mwuploads/wikidex/f/fa/latest/20230128132735/Tipo_veneno_icono_EP.svg",
    flying: "https://images.wikidexcdn.net/mwuploads/wikidex/6/6b/latest/20230128132815/Tipo_volador_icono_EP.svg",
  };
  
  return typeIcons[type] || "";
};

/* Regiones definidas como const para tipado seguro */
const REGIONS = {
  Nacional: { start: 1, end: 1025 },
  Kanto: { start: 1, end: 151 },
  Johto: { start: 152, end: 251 },
  Hoenn: { start: 252, end: 386 },
  Sinnoh: { start: 387, end: 493 },
  Teselia: { start: 494, end: 649 },
  Kalos: { start: 650, end: 721 },
  Alola: { start: 722, end: 809 },
  Galar: { start: 810, end: 898 },
  Paldea: { start: 899, end: 1025 },
} as const;
type RegionName = keyof typeof REGIONS;

/* Colores para la barra de nombre y chips (tipo principal) */
const TYPE_COLORS: Record<string, string> = {
  fire: "#ffb07b",
  water: "#9cc7ff",
  grass: "#bff2a6",
  electric: "#ffe08a",
  ice: "#cff6ff",
  fighting: "#f0b6a6",
  poison: "#d6a5f5",
  ground: "#e8d5b0",
  flying: "#d8d8ff",
  psychic: "#ffb2db",
  bug: "#d7ef9a",
  rock: "#d9c89d",
  ghost: "#c8baf1",
  dragon: "#c6b8ff",
  dark: "#cfcfcf",
  steel: "#dce3ea",
  fairy: "#ffd7ea",
  normal: "#ececec",
};

/* Helper para generar background dual (mitad y mitad) */
const getTypeBackground = (types: string[]) => {
  if (types.length === 1) {
    return TYPE_COLORS[types[0]] || "#ddd";
  }
  // Si tiene 2 tipos, crear gradiente 50/50
  const color1 = TYPE_COLORS[types[0]] || "#ddd";
  const color2 = TYPE_COLORS[types[1]] || "#ddd";
  return `linear-gradient(90deg, ${color1} 0%, ${color1} 50%, ${color2} 50%, ${color2} 100%)`;
};

/* -------------------------
   Helpers: batching fetch
   ------------------------- */
async function fetchPokemonById(id: number) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch pokemon ${id}`);
  const json = await res.json();
  return {
    id,
    name: json.name,
    image: `https://img.pokemondb.net/sprites/home/normal/${json.name}.png`,
    types: json.types.map((t: any) => t.type.name as string),
  } as Pokemon;
}

/** fetchInBatches: limit concurrent requests + carga progresiva */
async function fetchInBatches(
  ids: number[], 
  batchSize = 20,
  onProgress?: (loaded: Pokemon[]) => void
) {
  const out: Pokemon[] = [];
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const promises = batch.map((id) =>
      fetchPokemonById(id).catch((err) => {
        console.warn("fetch failed for id", id, err);
        return {
          id,
          name: `#${id}`,
          image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
          types: ["normal"],
        } as Pokemon;
      })
    );
    const results = await Promise.all(promises);
    out.push(...results);
    
    // Actualizar UI progresivamente
    if (onProgress) {
      onProgress([...out]);
    }
  }
  return out;
}

/* -------------------------
   Componente App
   ------------------------- */
export default function App(): JSX.Element {
  const [region, setRegion] = useState<RegionName>("Nacional");
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(false);

  const [allTypes, setAllTypes] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  /* Cargar lista de tipos (para mostrar chips) */
  useEffect(() => {
    fetch("https://pokeapi.co/api/v2/type/")
      .then((r) => r.json())
      .then((data) => {
        const types = data.results
          .map((t: any) => t.name)
          .filter((t: string) => t !== "shadow" && t !== "unknown" && t !== "stellar");
        setAllTypes(types);
      })
      .catch((e) => {
        console.error("Failed to load types", e);
      });
  }, []);

  /* Cargar pokémon por región (batched + progresivo) */
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setPokemons([]);

    const { start, end } = REGIONS[region];
    const ids: number[] = [];
    for (let id = start; id <= end; id++) ids.push(id);

    (async () => {
      try {
        await fetchInBatches(ids, 20, (loaded) => {
          if (!mounted) return;
          // Actualizar UI mientras carga
          const sorted = [...loaded].sort((a, b) => a.id - b.id);
          setPokemons(sorted);
        });
      } catch (err) {
        console.error("Error loading pokemons", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [region]);

  /* Toggle type selection (multi-select) */
  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  /* Filtered list */
  const filtered = pokemons.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (selectedTypes.length === 0) return true;
    return selectedTypes.every((t) => p.types.includes(t));
  });

  return (
    <div className="pokedex">
      {/* header: lights + title + controls + type chips (todo en una línea en desktop) */}
      <div className="pokedex-header">
        <div className="lights">
          <div className="light red" />
          <div className="light yellow" />
          <div className="light green" />
        </div>

        <h1 className="cardhunters-title">Card Finder v0.1</h1>

        <div className="header-controls">
          <input
            className="search-input"
            placeholder="Buscar Pokémon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar Pokémon"
          />

          <select
            className="region-select"
            value={region}
            onChange={(e) => setRegion(e.target.value as RegionName)}
            aria-label="Seleccionar región"
          >
            {Object.keys(REGIONS).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* chips: type filters */}
        <div className="type-chips" role="toolbar" aria-label="Filtros por tipo">
          <div className="chips-row">
            {allTypes.map((t) => (
              <button
                key={t}
                className={`chip ${selectedTypes.includes(t) ? "chip-active" : ""}`}
                onClick={() => toggleType(t)}
                title={`Filtrar por ${t}`}
                aria-label={`Filtrar por tipo ${t}`}
              >
                <img
                  src={TYPE_ICON_URL(t)}
                  alt={t}
                  onError={(ev) => {
                    (ev.target as HTMLImageElement).style.display = "none";
                  }}
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* screen / grid */}
      <div className="pokedex-screen">
        <div className="pokemon-grid" role="list">
          {loading && pokemons.length === 0 ? (
            <div className="loading-container">
              <div className="pokeball-loader"></div>
              <div className="loading-text">Cargando Pokémons...</div>
            </div>
          ) : (
            <>
              {filtered.map((p) => (
                <a
                  key={p.id}
                  className="pokemon-tile"
                  href={`https://pokestop.cl/search/?q=${encodeURIComponent(p.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  role="listitem"
                >
                  <div className="pokemon-number">#{String(p.id).padStart(3, '0')}</div>
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`;
                    }}
                  />
                  <div
                    className="pokemon-name"
                    style={{
                      background: getTypeBackground(p.types),
                    }}
                  >
                    {p.name}
                  </div>
                </a>
              ))}
              {loading && pokemons.length > 0 && (
                <div className="loading-more">
                  <div className="spinner"></div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}