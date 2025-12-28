import { useState, useEffect } from "react";
import { api } from "./lib/api";
import type { Word } from "./types/words";
import "./App.css";

function App() {
  const [word, setWord] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Word[]>("/words/")
      .then((response) => {
        setWord(response.data);
      })
      .catch((error) => {
        console.error("Error fetching words:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold underline">Words from BE</h1>
      <ul>
        {word.map((word) => (
          <li key={word.id}>{word.text}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
