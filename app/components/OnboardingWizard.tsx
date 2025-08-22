'use client';

import React, { useMemo, useState, useEffect } from "react";
import { useGameStore, type Scenario, type Player } from "@/lib/state/gameStore";
import { audioManager } from "@/lib/audio/audioManager";
import CharacterCreator from './CharacterCreator';

const genres = ["Fantasy", "Sci-Fi", "Steampunk", "Cyberpunk", "Mystic"];
const frames = ["Heroisch", "Grimdark", "Entdeckung", "Intrige", "Überleben"];
const magicLevels = ["Niedrig", "Mittel", "Hoch", "Wild"];
const climates = ["Gemäßigt", "Kalt", "Heiß", "Tropisch", "Wüste", "Nebelhaft"];

export default function OnboardingWizard() {
  const { selections, setSelections, startGame, setMainMenuStep } = useGameStore();

  const [step, setStep] = useState<number>(1);
  const [localGenre, setLocalGenre] = useState<string>(selections.genre || genres[0]);
  const [localFrame, setLocalFrame] = useState<string>(selections.frame || frames[0]);
  const [world, setWorld] = useState(selections.world || { magic: magicLevels[1], climate: climates[0] });
  const [conflict, setConflict] = useState<string>(selections.conflict || "");
  const [players, setPlayers] = useState<number>(selections.players || 1);
  const [scenarios, setScenarios] = useState<Scenario[] | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | undefined>(selections.scenario || undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [party, setParty] = useState<Player[]>([]);

  useEffect(() => {
    audioManager.changeScene('character_creation');
    return () => {
      const currentStep = useGameStore.getState().step;
      if (currentStep === 'mainMenu') {
        audioManager.changeScene('main_menu');
      }
    };
  }, []);

  const canContinue = useMemo(() => {
    if (step === 1) return Boolean(localGenre && localFrame);
    if (step === 2) return Boolean(world.magic && world.climate);
    if (step === 3) return conflict.trim().length > 5;
    if (step === 4) return players >= 1;
    if (step === 5) return Boolean(selectedScenario);
    return true;
  }, [step, localGenre, localFrame, world, conflict, players, selectedScenario]);

  const advance = () => {
    if (!canContinue) return;
    audioManager.playUISound('button');
    setStep((s) => Math.min(6, s + 1));
  };

  const back = () => {
    audioManager.playUISound('button');
    setStep((s) => Math.max(1, s - 1));
  };

  const saveSelections = () => {
    setSelections({
      genre: localGenre,
      frame: localFrame,
      world,
      conflict,
      players,
      scenario: selectedScenario,
    });
  };

  async function generateScenarios() {
    try {
      setLoading(true);
      saveSelections();

      const res = await fetch("/api/ai/generate-scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ genre: localGenre, frame: localFrame, world, conflict, players }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Fehler beim Generieren der Szenarien: ${txt}`);
      }
      const data = await res.json();
      const list: Scenario[] = Array.isArray(data.scenarios) ? data.scenarios : [];
      if (!list.length) throw new Error("Keine Szenarien erhalten.");
      setScenarios(list);
      setSelectedScenario(list[0]);
      setStep(5);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unbekannter Fehler bei der Szenario-Erzeugung";
      console.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const handleCharacterCreated = (character: Player) => {
    const newParty = [...party, character];
    setParty(newParty);
    if (newParty.length < players) {
      // More characters to create
      // Reset CharacterCreator state if needed, or just let it be for the next one
    } else {
      // All characters created, start the game
      startGame(selectedScenario!, newParty);
    }
  };

  if (step === 6) {
    return (
      <CharacterCreator
        onCharacterCreated={handleCharacterCreated}
        onClose={() => setStep(5)}
      />
    );
  }

  return (
    <div className="mx-auto p-6 md:p-10 w-full max-w-[min(96vw,1400px)]">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Aethel&apos;s Forge – Abenteuer-Assistent</h1>
        <button
          className="text-sm px-3 py-1 rounded-md border border-transparent hover:border-indigo-400"
          onClick={() => setMainMenuStep()}
        >
          Home
        </button>
      </header>

      <div className="rounded-2xl border bg-white/70 p-6 md:p-8">
        {/* Render steps 1-5 */}
        {step === 1 && (
          <section>
            <h2 className="text-xl font-semibold mb-3">Genre & Tonalität</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">Genre</label>
                <select value={localGenre} onChange={(e) => setLocalGenre(e.target.value)} className="w-full rounded-lg border px-3 py-2">
                  {genres.map((g) => (<option key={g} value={g}>{g}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2">Erzählrahmen</label>
                <select value={localFrame} onChange={(e) => setLocalFrame(e.target.value)} className="w-full rounded-lg border px-3 py-2">
                  {frames.map((f) => (<option key={f} value={f}>{f}</option>))}
                </select>
              </div>
            </div>
          </section>
        )}
        {step === 2 && (
            <section>
                <h2 className="text-xl font-semibold mb-3">Weltpräferenzen</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm mb-2">Magie</label>
                        <select value={world.magic} onChange={(e) => setWorld(w => ({...w, magic: e.target.value}))} className="w-full rounded-lg border px-3 py-2">
                            {magicLevels.map((m) => (<option key={m} value={m}>{m}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm mb-2">Klima</label>
                        <select value={world.climate} onChange={(e) => setWorld(w => ({...w, climate: e.target.value}))} className="w-full rounded-lg border px-3 py-2">
                            {climates.map((c) => (<option key={c} value={c}>{c}</option>))}
                        </select>
                    </div>
                </div>
            </section>
        )}
        {step === 3 && (
            <section>
                <h2 className="text-xl font-semibold mb-3">Hauptkonflikt</h2>
                <textarea rows={4} value={conflict} onChange={(e) => setConflict(e.target.value)} placeholder="Beschreibe den zentralen Konflikt..." className="w-full rounded-lg border px-3 py-2" />
            </section>
        )}
        {step === 4 && (
            <section>
                <h2 className="text-xl font-semibold">Spieleranzahl</h2>
                <input type="number" min={1} max={6} value={players} onChange={(e) => setPlayers(Number(e.target.value))} className="w-full rounded-lg border px-3 py-2" />
            </section>
        )}
        {step === 5 && (
            <section>
                <h2 className="text-xl font-semibold">Szenario auswählen</h2>
                {!scenarios ? (
                    <div className="text-sm opacity-80">Noch keine Szenarien geladen.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {scenarios.map((s) => (
                            <article key={s.id} className={`rounded-xl p-4 border transition ${selectedScenario?.id === s.id ? "border-indigo-500" : "hover:border-indigo-400"}`} onClick={() => setSelectedScenario(s)}>
                                <h3 className="font-semibold mb-1">{s.title}</h3>
                                <p className="text-sm opacity-80 line-clamp-4">{s.summary}</p>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        )}

        <div className="mt-8 flex justify-between">
          <button onClick={back} disabled={loading || step === 1} className="px-4 py-2 rounded-lg border disabled:opacity-50">Zurück</button>
          {step < 4 && <button onClick={advance} disabled={!canContinue || loading} className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50">Weiter</button>}
          {step === 4 && <button onClick={generateScenarios} disabled={!canContinue || loading} className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50">{loading ? "Generiere..." : "Szenarien generieren"}</button>}
          {step === 5 && <button onClick={advance} disabled={!canContinue || loading} className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50">Charaktere erstellen</button>}
        </div>
      </div>
    </div>
  );
}