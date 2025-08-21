"use client";

import React, { useMemo, useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import Image from "next/image";
import { useGameStore, type Scenario, type Player, type Effects, type QuestCategory, type QuestPriority, type QuestStatus } from "@/lib/state/gameStore";
import { getAllRaces, getAllGenders, getRaceDisplayName, getGenderDisplayName, getPortraitUrl, getAllCharacterClasses, getClassDisplayName } from "@/lib/character/portraitSystem";
import { getRaceInfo, getRacialTraits } from "@/lib/character/raceSystem";
import { audioManager } from "@/lib/audio/audioManager";
import type { Race, Gender, CharacterClass } from "@/schemas/character";
const ClassInfoModal = dynamic(() => import("./modals/ClassInfoModal"));
const RaceInfoModal = dynamic(() => import("./modals/RaceInfoModal"));

type WorldPrefs = { magic: string; tech: string; climate: string };

const genres = ["Fantasy", "Sci-Fi", "Steampunk", "Cyberpunk", "Mystic"];
const frames = ["Heroisch", "Grimdark", "Entdeckung", "Intrige", "Überleben"];
const magicLevels = ["Niedrig", "Mittel", "Hoch", "Wild"];
const climates = ["Gemäßigt", "Kalt", "Heiß", "Tropisch", "Wüste", "Nebelhaft"];
// Removed classOptions - classes are now selected per character in Step 6

type NewQuestLike = {
	title: string;
	note?: string;
	description?: string;
	category?: QuestCategory;
	priority?: QuestPriority;
	status?: QuestStatus;
	progress?: { current?: number; total?: number; description?: string };
}

export default function OnboardingWizard() {
	const { selections, setSelections, startGame, pushHistory, setCampaignSelectionStep, setMainMenuStep, applyEffects } = useGameStore();

	const [step, setStep] = useState<number>(1);
	const [localGenre, setLocalGenre] = useState<string>(selections.genre || genres[0]);
	const [localFrame, setLocalFrame] = useState<string>(selections.frame || frames[0]);
	const [world, setWorld] = useState<WorldPrefs>(() => {
		const defaultWorld = { magic: magicLevels[1], tech: "Mittelalter", climate: climates[0] };
		if (selections.world) {
			const savedWorld = selections.world as Partial<WorldPrefs>;
			return {
				magic: savedWorld.magic || defaultWorld.magic,
				tech: "Mittelalter", // Always Medieval
				climate: savedWorld.climate || defaultWorld.climate
			};
		}
		return defaultWorld;
	});
	const [conflict, setConflict] = useState<string>(selections.conflict || "");
	const [players, setPlayers] = useState<number>(selections.players || 3);
	// Removed: const [classes, setClasses] - no longer needed, classes are selected individually per character

	// Character Creation State
	const [selectedRace, setSelectedRace] = useState<Race | null>(null);
	const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
	const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);
	const [characterName, setCharacterName] = useState<string>('');
	const [generatedName, setGeneratedName] = useState<string>('');
		// Multi-character selection state
		const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
		const [playerChoices, setPlayerChoices] = useState<Array<{class: CharacterClass; race: Race; gender: Gender; name: string}>>([]);

	// Modal State
	const [showClassModal, setShowClassModal] = useState<boolean>(false);
	const [modalClass, setModalClass] = useState<CharacterClass | null>(null);
	const [showRaceModal, setShowRaceModal] = useState<boolean>(false);
	const [modalRace, setModalRace] = useState<Race | null>(null);

	const [scenarios, setScenarios] = useState<Scenario[] | null>(null);
	const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(selections.scenario || null);
	const [loading, setLoading] = useState<boolean>(false);
	const [charLoading, setCharLoading] = useState<boolean>(false);
	const [progress, setProgress] = useState<number>(0);

		// Initialize character creation music and restore on unmount if needed
		useEffect(() => {
			const initCharacterCreationAudio = async () => {
				await audioManager.changeScene('character_creation');
			};
			initCharacterCreationAudio();
			return () => {
				const step = useGameStore.getState().step;
				if (step === 'mainMenu') {
					audioManager.changeScene('main_menu');
				}
			};
		}, []);
	const [error, setError] = useState<string | null>(null);

	const canContinue = useMemo(() => {
		if (step === 1) return Boolean(localGenre && localFrame);
		if (step === 2) return Boolean(world.magic && world.climate);
		if (step === 3) return conflict.trim().length > 5; // etwas sinnvolles
		if (step === 4) return players >= 1; // Only player count validation
		if (step === 5) return Boolean(selectedScenario);
		if (step === 6) return Boolean(selectedClass);
		if (step === 7) return Boolean(selectedRace);
		if (step === 8) return Boolean(selectedGender);
		if (step === 9) return characterName.trim().length > 2;
		return true;
	}, [step, localGenre, localFrame, world, conflict, players, selectedScenario, selectedClass, selectedRace, selectedGender, characterName]);

	const advance = () => {
		if (!canContinue) return;
		audioManager.playUISound('button');
		setError(null);
		setStep((s) => Math.min(9, s + 1));
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
			classes: [], // Empty array since classes are now selected per character
		});
	};

	async function generateScenarios() {
		try {
			setLoading(true);
			setProgress(10);
			setError(null);
			saveSelections();

			const res = await fetch("/api/ai/generate-scenarios", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					genre: localGenre,
					frame: localFrame,
					world,
					conflict,
					players,
					classes: [], // Empty since classes are per-character now
				}),
			});
			setProgress(55);
			if (!res.ok) {
				const txt = await res.text();
				throw new Error(`Fehler beim Generieren der Szenarien: ${txt}`);
			}
			const data = await res.json();
			setProgress(85);
			const list: Scenario[] = Array.isArray(data.scenarios) ? data.scenarios : [];
			if (!list.length) throw new Error("Keine Szenarien erhalten.");
			setScenarios(list);
			setSelectedScenario(list[0]);
			setProgress(100);
			setStep(5);
			} catch (e: unknown) {
				const msg = e instanceof Error ? e.message : "Unbekannter Fehler bei der Szenario-Erzeugung";
				setError(msg);
		} finally {
			setLoading(false);
			setTimeout(() => setProgress(0), 800);
		}
	}

	async function confirmScenarioAndGenerateCharacters() {
		if (!selectedScenario) return;
		try {
			setCharLoading(true);
			setProgress(20);
			setError(null);
			saveSelections();

		const res = await fetch("/api/ai/generate-characters", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ 
		    players, 
		    classes: playerChoices.length ? playerChoices.map(c => c.class) : [],
		playerSelections: playerChoices,
		scenario: { id: selectedScenario.id, title: selectedScenario.title }
				}),
			});
			setProgress(65);
			if (!res.ok) {
				const txt = await res.text();
				throw new Error(`Fehler bei der Charakter-Generierung: ${txt}`);
			}
			const data = await res.json();
			const party: Player[] = Array.isArray(data.party) ? data.party : [];
			if (!party.length) throw new Error("Keine Charaktere erhalten.");

			// Generate AI quests (with fallback server-side) and apply to store via Effects
			let quests: NewQuestLike[] = [];
			try {
				const qRes = await fetch('/api/ai/generate-quests', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						scenario: { id: selectedScenario.id, title: selectedScenario.title, summary: selectedScenario.summary },
						selections: { genre: localGenre, frame: localFrame, world, conflict },
						party: party.map(p => ({ id: p.id, name: p.name, cls: p.cls, race: p.race, gender: p.gender }))
					})
				})
				const qJson = await qRes.json()
				quests = Array.isArray(qJson.quests) ? qJson.quests : []
			} catch {
				// fallback: no quests
			}
			// Start the game and clear any previous quests
			startGame(selectedScenario, party)
			if (quests.length) {
				const effects: Effects = {
					quests: quests.map((q: NewQuestLike) => ({
						op: 'add',
						title: String(q.title),
						note: q.note || q.description,
						category: q.category,
						priority: q.priority,
						status: q.status,
						progress: q.progress
					}))
				}
				// Apply after a microtask to ensure state is initialized
				setTimeout(() => applyEffects(effects), 0)
				setTimeout(() => pushHistory({ role: 'dm', content: `Quests vorbereitet: ${quests.length}` }), 10)
			}
			setTimeout(() => pushHistory({ role: "dm", content: `Willkommen zum Abenteuer: ${selectedScenario.title}. ${selectedScenario.summary}` }), 20);
			} catch (e: unknown) {
				const msg = e instanceof Error ? e.message : "Unbekannter Fehler bei der Charakter-Erzeugung";
				setError(msg);
		} finally {
			setCharLoading(false);
			setTimeout(() => setProgress(0), 800);
		}
	}

	const ProgressBar = (
		<div className="h-2 w-full bg-black/10 dark:bg-white/10 rounded overflow-hidden mb-4">
			<div
				className="h-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 transition-all duration-500"
				style={{ width: `${progress}%` }}
			/>
		</div>
	);

	return (
		<div className="mx-auto p-6 md:p-10 w-full max-w-[min(96vw,1400px)]">
			{progress > 0 ? ProgressBar : null}

			<header className="flex items-center justify-between mb-6">
				<h1 className="text-2xl md:text-3xl font-bold tracking-tight">Aethel&apos;s Forge – Abenteuer-Assistent</h1>
				<div className="flex items-center gap-2">
					<button
						className="text-sm px-3 py-1 rounded-md border border-transparent hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 flex items-center gap-2"
						onClick={() => {
							audioManager.playUISound('button');
							setMainMenuStep();
						}}
						title="Startseite"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m0 0V11a1 1 0 011-1h2a1 1 0 011 1v10m0 0h3a1 1 0 001-1V10M9 21h6" />
						</svg>
						Home
					</button>
					<button
						className="text-sm px-3 py-1 rounded-md border border-transparent hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30"
						onClick={() => setCampaignSelectionStep()}
					>
						Kampagnen ansehen
					</button>
				</div>
			</header>

			<div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur shadow-xl p-6 md:p-8">
				<StepIndicator step={step} />

				{error ? (
					<div className="mb-4 rounded-lg border border-rose-400/50 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-200 px-4 py-3">
						{error}
					</div>
				) : null}

				{step === 1 && (
					<section>
						<h2 className="text-xl font-semibold mb-3">Genre & Tonalität</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm mb-2">Genre</label>
								<select
									value={localGenre}
									onChange={(e) => setLocalGenre(e.target.value)}
									className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-white/90 dark:bg-black/40 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
								>
									{genres.map((g) => (
										<option key={g} value={g}>
											{g}
										</option>
									))}
								</select>
							</div>
							<div>
								<label className="block text-sm mb-2">Erzählrahmen</label>
								<select
									value={localFrame}
									onChange={(e) => setLocalFrame(e.target.value)}
									className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-white/90 dark:bg-black/40 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
								>
									{frames.map((f) => (
										<option key={f} value={f}>
											{f}
										</option>
									))}
								</select>
							</div>
						</div>
					</section>
				)}

				{step === 2 && (
					<section>
						<h2 className="text-xl font-semibold mb-3">Weltpräferenzen</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Picker label="Magie" value={world.magic} options={magicLevels} onChange={(v) => setWorld((w) => ({ ...w, magic: v }))} />
							<Picker label="Klima" value={world.climate} options={climates} onChange={(v) => setWorld((w) => ({ ...w, climate: v }))} />
						</div>
						<p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
							Technologie-Level: Mittelalter (Fantasy-Setting)
						</p>
					</section>
				)}

				{step === 3 && (
					<section>
						<h2 className="text-xl font-semibold mb-3">Hauptkonflikt</h2>
						<textarea
							rows={4}
							value={conflict}
							onChange={(e) => setConflict(e.target.value)}
							placeholder="Beschreibe den zentralen Konflikt, z.B. 'Ein uralter Drache erwacht und bedroht die Königreiche...'"
							className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-white/90 dark:bg-black/40 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-black/40 dark:placeholder:text-white/50"
						/>
					</section>
				)}

				{step === 4 && (
					<section className="space-y-4">
						<h2 className="text-xl font-semibold">Spieleranzahl</h2>
						<div className="max-w-md">
							<div>
								<label className="block text-sm mb-2 font-medium">Wie viele Charaktere möchtest du spielen?</label>
								<input
									type="number"
									min={1}
									max={6}
									value={players}
									onChange={(e) => setPlayers(Number(e.target.value))}
									className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-white/90 dark:bg-black/40 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
								/>
								<p className="text-xs mt-1 opacity-70">Du kannst 1-6 Charaktere gleichzeitig steuern.</p>
							</div>
						</div>
					</section>
				)}

				{step === 5 && (
					<section className="space-y-4">
						<h2 className="text-xl font-semibold">Szenario auswählen</h2>
									{!scenarios ? (
										<div className="text-sm opacity-80">Noch keine Szenarien geladen. Klicke unten auf &quot;Szenarien generieren&quot;.</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								{scenarios.map((s) => (
									<article
										key={s.id}
										className={
											"rounded-xl p-4 border transition " +
											(selectedScenario?.id === s.id
												? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-900/20"
												: "border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/30 hover:border-indigo-400")
										}
										onClick={() => setSelectedScenario(s)}
									>
										<h3 className="font-semibold mb-1">{s.title}</h3>
										<p className="text-sm opacity-80 line-clamp-4">{s.summary}</p>
										<p className="mt-2 text-xs opacity-70"><span className="font-medium">Karte:</span> {s.mapIdea}</p>
									</article>
								))}
							</div>
						)}
					</section>
				)}

				{step === 6 && (
					<section className="space-y-4">
				<h2 className="text-xl font-semibold">Klasse wählen</h2>
					<p className="text-sm opacity-80">Wähle eine Klasse – Spieler {currentPlayerIndex + 1} von {players}:</p>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{getAllCharacterClasses().map((cls) => (
								<div key={cls} className="relative">
									<button
										onClick={() => setSelectedClass(cls)}
										className={
											"w-full rounded-xl p-4 border text-left transition " +
											(selectedClass === cls
												? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-900/20"
												: "border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/30 hover:border-indigo-400")
										}
									>
										<h3 className="font-semibold mb-1 pr-8">{getClassDisplayName(cls)}</h3>
										<p className="text-sm opacity-80">Spezialist für {cls === 'warrior' ? 'Nahkampf und Verteidigung' : cls === 'mage' ? 'arkane Magie und Sprüche' : cls === 'rogue' ? 'Heimlichkeit und Finesse' : cls === 'bard' ? 'Inspiration und Vielseitigkeit' : cls === 'paladin' ? 'göttliche Kraft und Schutz' : cls === 'ranger' ? 'Wildnis und Fernkampf' : cls === 'druid' ? 'Naturmagie und Verwandlung' : cls === 'monk' ? 'innere Kraft und Beweglichkeit' : 'okkulte Macht und Pakte'}</p>
									</button>
									<button
										onClick={(e) => {
											e.stopPropagation();
											setModalClass(cls);
											setShowClassModal(true);
										}}
										className="absolute top-2 right-2 p-2 text-gray-500 hover:text-indigo-600 hover:bg-white/50 dark:hover:bg-black/50 rounded-lg transition-colors"
										title="Detaillierte Klassen-Info"
									>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
									</button>
								</div>
							))}
						</div>
					</section>
				)}

				{step === 7 && (
					<section className="space-y-4">
				<h2 className="text-xl font-semibold">Rasse wählen</h2>
					<p className="text-sm opacity-80">Wähle eine Rasse – Spieler {currentPlayerIndex + 1} von {players}:</p>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{getAllRaces().map((race) => {
								const raceInfo = getRaceInfo(race);
								const traits = getRacialTraits(race);
								return (
									<div key={race} className="relative">
										<button
											onClick={() => setSelectedRace(race)}
											className={
												"w-full rounded-xl p-4 border text-left transition " +
												(selectedRace === race
													? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-900/20"
													: "border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/30 hover:border-indigo-400")
											}
										>
											<h3 className="font-semibold mb-1 pr-8">{getRaceDisplayName(race)}</h3>
											<p className="text-sm opacity-80 mb-2">{raceInfo.description}</p>
											<div className="text-xs opacity-70">
												<span className="font-medium">Fähigkeiten:</span> {traits.slice(0, 2).map(t => t.name).join(', ')}
												{traits.length > 2 && ` +${traits.length - 2} weitere`}
											</div>
										</button>
										<button
											onClick={(e) => {
												e.stopPropagation();
												setModalRace(race);
												setShowRaceModal(true);
											}}
											className="absolute top-2 right-2 p-2 text-gray-500 hover:text-indigo-600 hover:bg-white/50 dark:hover:bg-black/50 rounded-lg transition-colors"
											title="Detaillierte Rassen-Info"
										>
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
										</button>
									</div>
								);
							})}
						</div>
					</section>
				)}

				{step === 8 && (
					<section className="space-y-4">
				<h2 className="text-xl font-semibold">Geschlecht & Portrait</h2>
					<p className="text-sm opacity-80">Geschlecht & Portrait – Spieler {currentPlayerIndex + 1} von {players}:</p>
						
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
							{getAllGenders().map((gender) => (
								<button
									key={gender}
									onClick={() => setSelectedGender(gender)}
									className={
										"rounded-xl p-4 border text-center transition " +
										(selectedGender === gender
											? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-900/20"
											: "border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/30 hover:border-indigo-400")
									}
								>
									<h3 className="font-semibold">{getGenderDisplayName(gender)}</h3>
								</button>
							))}
						</div>

						{selectedClass && selectedRace && selectedGender && (
							<div className="mt-6 text-center">
								<h3 className="font-semibold mb-4">Ihr Charakter-Portrait</h3>
								<div className="inline-block">
									<Image 
										src={getPortraitUrl(selectedClass, selectedRace, selectedGender)}
										alt={`${getRaceDisplayName(selectedRace)} ${getClassDisplayName(selectedClass)} (${getGenderDisplayName(selectedGender)})`}
										width={128}
										height={128}
										className="w-32 h-32 rounded-xl border-4 border-indigo-500"
										onError={(e) => {
											// Fallback if portrait doesn't exist (should rarely happen now)
											e.currentTarget.src = '/portraits/warrior/warrior_human_male.png';
										}}
									/>
									<p className="text-sm opacity-80 mt-2">
										{getGenderDisplayName(selectedGender)}er {getRaceDisplayName(selectedRace)} {getClassDisplayName(selectedClass)}
									</p>
								</div>
							</div>
						)}
					</section>
				)}

				{step === 9 && (
					<section className="space-y-4">
						<h2 className="text-xl font-semibold">Name des Charakters</h2>
						<p className="text-sm opacity-80">Gib deinem Charakter einen Namen – Spieler {currentPlayerIndex + 1} von {players}:</p>
						<input
							type="text"
							value={characterName}
							onChange={(e) => setCharacterName(e.target.value)}
							placeholder="Charaktername"
							className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-white/90 dark:bg-black/40 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
						/>
            <button onClick={async () => {
              const res = await fetch('/api/ai/generate-name', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  race: selectedRace,
                  gender: selectedGender,
                  scenarioTitle: selectedScenario?.title,
                }),
              });
              const data = await res.json();
              setCharacterName(data.name);
            }}>Generate Name</button>
					</section>
				)}

								<FooterNav
					step={step}
					canContinue={canContinue}
					loading={loading}
					charLoading={charLoading}
					onBack={back}
									onContinue={() => {
												if (step < 4) return advance();
												if (step === 4) return generateScenarios();
												if (step === 5) return advance(); // Move to character creation
												if (step === 6) return advance(); // Move to race selection
												if (step === 7) return advance(); // Move to gender selection
												if (step === 8) return advance(); // Move to name selection
												if (step === 9) {
													// Save current player's selections
													if (selectedClass && selectedRace && selectedGender && characterName) {
														const next: Array<{class: CharacterClass; race: Race; gender: Gender; name: string}> = [...playerChoices];
														next[currentPlayerIndex] = { class: selectedClass, race: selectedRace, gender: selectedGender, name: characterName };
														setPlayerChoices(next);
													}
													// Next player or finish
													if (currentPlayerIndex + 1 < players) {
														setCurrentPlayerIndex((i) => i + 1);
														setSelectedClass(null);
														setSelectedRace(null);
														setSelectedGender(null);
														setCharacterName('');
														setStep(6);
														return;
													}
																	return confirmScenarioAndGenerateCharacters();
												}
															}}
					onGenerateScenarios={generateScenarios}
				/>
			</div>

			{/* Class Info Modal */}
			{modalClass && (
				<ClassInfoModal
					isOpen={showClassModal}
					onClose={() => {
						setShowClassModal(false);
						setModalClass(null);
					}}
					characterClass={modalClass}
				/>
			)}

			{/* Race Info Modal */}
			{modalRace && (
				<RaceInfoModal
					isOpen={showRaceModal}
					onClose={() => {
						setShowRaceModal(false);
						setModalRace(null);
					}}
					race={modalRace}
				/>
			)}
		</div>
	);
}

function StepIndicator({ step }: { step: number }) {
	const items = [
		{ n: 1, t: "Genre" },
		{ n: 2, t: "Welt" },
		{ n: 3, t: "Konflikt" },
		{ n: 4, t: "Spieler" },
		{ n: 5, t: "Szenario" },
		{ n: 6, t: "Klasse" },
		{ n: 7, t: "Rasse" },
		{ n: 8, t: "Charakter" },
		{ n: 9, t: "Name" },
	];
	return (
		<div className="mb-6 w-full">
			{/* Mobile: Horizontal scrollable indicator */}
			<div className="flex sm:hidden overflow-x-auto pb-2 gap-1">
				{items.map((it) => (
					<div key={it.n} className="flex items-center gap-1 min-w-max">
						<span
							className={
								"size-8 rounded-full text-xs flex-shrink-0 grid place-items-center font-medium " +
								(step >= it.n
									? "bg-indigo-600 text-white"
									: "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400")
							}
						>
							{it.n}
						</span>
						<span className={
							"text-xs font-medium min-w-max " +
							(step >= it.n ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400")
						}>
							{it.t}
						</span>
						{it.n < items.length && (
							<div className="w-6 h-px bg-gray-300 dark:bg-gray-600 mx-2 flex-shrink-0" />
						)}
					</div>
				))}
			</div>
			
			{/* Desktop: Full indicator with proper spacing */}
			<ol className="hidden sm:flex items-center justify-center gap-2 lg:gap-3">
				{items.map((it, i) => (
					<li key={i} className="flex items-center gap-2 lg:gap-3">
						<span
							className={
								"size-8 lg:size-9 rounded-full text-xs lg:text-sm font-medium grid place-items-center transition-colors " +
								(step >= it.n
									? "bg-indigo-600 text-white shadow-lg"
									: "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400")
							}
						>
							{it.n}
						</span>
						<span className={
							"text-sm lg:text-base font-medium transition-colors " +
							(step >= it.n ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400")
						}>
							{it.t}
						</span>
						{it.n < items.length && (
							<div className="w-6 lg:w-10 h-px bg-gray-300 dark:bg-gray-600 transition-colors" />
						)}
					</li>
				))}
			</ol>
			
			{/* Progress indicator for mobile */}
			<div className="flex sm:hidden items-center justify-center mt-3">
				<span className="text-xs text-gray-500 dark:text-gray-400">
					Step {step} of {items.length}
				</span>
			</div>
		</div>
	);
}

function Picker({
	label,
	value,
	options,
	onChange,
}: {
	label: string;
	value: string;
	options: string[];
	onChange: (v: string) => void;
}) {
	return (
		<div>
			<label className="block text-sm mb-2">{label}</label>
			<select
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-white/90 dark:bg-black/40 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
			>
				{options.map((o) => (
					<option key={o} value={o}>
						{o}
					</option>
				))}
			</select>
		</div>
	);
}

function FooterNav({
	step,
	canContinue,
	loading,
	charLoading,
	onBack,
	onContinue,
	onGenerateScenarios,
}: {
	step: number;
	canContinue: boolean;
	loading: boolean;
	charLoading: boolean;
	onBack: () => void;
	onContinue: () => void;
	onGenerateScenarios: () => void;
}) {
	const isBusy = loading || charLoading;
	return (
		<div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
			<div className="text-sm opacity-70">
			{loading && (<span>Generiere Szenarien mit KI…</span>)}
				{charLoading && (
					<span>Erstelle Charaktere… Bitte warten.</span>
				)}
			</div>

			<div className="flex gap-2 justify-end">
				<button
					type="button"
					onClick={onBack}
					disabled={isBusy || step === 1}
					className="px-4 py-2 rounded-lg border border-black/10 dark:border-white/10 hover:border-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Zurück
				</button>

				{step < 4 && (
					<button
						type="button"
						onClick={onContinue}
						disabled={!canContinue || isBusy}
						className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Weiter
					</button>
				)}

				{step === 4 && (
					<button
						type="button"
						onClick={onGenerateScenarios}
						disabled={!canContinue || isBusy}
						className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isBusy ? "Bitte warten…" : "Szenarien generieren"}
					</button>
				)}

				{(step >= 5 && step <= 9) && (
					<button
						type="button"
						onClick={onContinue}
						disabled={!canContinue || isBusy}
						className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{step === 5 ? "Charakter erstellen" : step === 9 ? (isBusy ? "Erstelle…" : "Fertig") : "Weiter"}
					</button>
				)}
			</div>
		</div>
	);
}

