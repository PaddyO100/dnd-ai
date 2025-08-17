"use client";

import React, { useMemo, useState } from "react";
import { useGameStore, type Scenario, type Player } from "@/lib/state/gameStore";

type WorldPrefs = { magic: string; tech: string; climate: string };

const genres = ["Fantasy", "Sci-Fi", "Steampunk", "Cyberpunk", "Mystic"];
const frames = ["Heroisch", "Grimdark", "Entdeckung", "Intrige", "Überleben"];
const magicLevels = ["Niedrig", "Mittel", "Hoch", "Wild"];
const techLevels = ["Mittelalterlich", "Industrie", "Modern", "Futuristisch"];
const climates = ["Gemäßigt", "Kalt", "Heiß", "Tropisch", "Wüste", "Nebelhaft"];
const classOptions = [
	"Krieger",
	"Magier",
	"Schurke",
	"Barde",
	"Paladin",
	"Waldläufer",
	"Druide",
	"Mönch",
	"Hexenmeister",
];

export default function OnboardingWizard() {
		const { selections, setSelections, startGame, pushHistory, setCampaignSelectionStep } = useGameStore();

	const [step, setStep] = useState<number>(1);
	const [localGenre, setLocalGenre] = useState<string>(selections.genre || genres[0]);
	const [localFrame, setLocalFrame] = useState<string>(selections.frame || frames[0]);
	const [world, setWorld] = useState<WorldPrefs>(
		selections.world || { magic: magicLevels[1], tech: techLevels[0], climate: climates[0] }
	);
	const [conflict, setConflict] = useState<string>(selections.conflict || "");
	const [players, setPlayers] = useState<number>(selections.players || 3);
	const [classes, setClasses] = useState<string[]>(selections.classes?.length ? selections.classes : [classOptions[0], classOptions[1]]);

	const [scenarios, setScenarios] = useState<Scenario[] | null>(null);
	const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(selections.scenario || null);
	const [loading, setLoading] = useState<boolean>(false);
	const [charLoading, setCharLoading] = useState<boolean>(false);
	const [progress, setProgress] = useState<number>(0);
	const [error, setError] = useState<string | null>(null);

	const canContinue = useMemo(() => {
		if (step === 1) return Boolean(localGenre && localFrame);
		if (step === 2) return Boolean(world.magic && world.tech && world.climate);
		if (step === 3) return conflict.trim().length > 5; // etwas sinnvolles
		if (step === 4) return players >= 1 && classes.length >= 1;
		if (step === 5) return Boolean(selectedScenario);
		return true;
	}, [step, localGenre, localFrame, world, conflict, players, classes, selectedScenario]);

	const advance = () => {
		if (!canContinue) return;
		setError(null);
		setStep((s) => Math.min(5, s + 1));
	};
	const back = () => setStep((s) => Math.max(1, s - 1));

	const handleToggleClass = (c: string) => {
		setClasses((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
	};

	const saveSelections = () => {
		setSelections({
			genre: localGenre,
			frame: localFrame,
			world,
			conflict,
			players,
			classes,
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
					classes,
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
			body: JSON.stringify({ players, classes }),
			});
			setProgress(65);
			if (!res.ok) {
				const txt = await res.text();
				throw new Error(`Fehler bei der Charakter-Generierung: ${txt}`);
			}
			const data = await res.json();
			const party: Player[] = Array.isArray(data.party) ? data.party : [];
			if (!party.length) throw new Error("Keine Charaktere erhalten.");

			startGame(selectedScenario, party);
			pushHistory({ role: "dm", content: `Willkommen zum Abenteuer: ${selectedScenario.title}. ${selectedScenario.summary}` });
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
		<div className="max-w-5xl mx-auto p-6 md:p-10">
			{progress > 0 ? ProgressBar : null}

			<header className="flex items-center justify-between mb-6">
			<h1 className="text-2xl md:text-3xl font-bold tracking-tight">Aethel&apos;s Forge – Abenteuer-Assistent</h1>
				<button
					className="text-sm px-3 py-1 rounded-md border border-transparent hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30"
					onClick={() => setCampaignSelectionStep()}
				>
					Kampagnen ansehen
				</button>
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
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<Picker label="Magie" value={world.magic} options={magicLevels} onChange={(v) => setWorld((w) => ({ ...w, magic: v }))} />
							<Picker label="Technologie" value={world.tech} options={techLevels} onChange={(v) => setWorld((w) => ({ ...w, tech: v }))} />
							<Picker label="Klima" value={world.climate} options={climates} onChange={(v) => setWorld((w) => ({ ...w, climate: v }))} />
						</div>
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
						<h2 className="text-xl font-semibold">Spieler & Klassen</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
							<div>
								<label className="block text-sm mb-2">Spieleranzahl</label>
								<input
									type="number"
									min={1}
									max={6}
									value={players}
									onChange={(e) => setPlayers(Number(e.target.value))}
									className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-white/90 dark:bg-black/40 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
								/>
							</div>
							<div className="md:col-span-2">
								<label className="block text-sm mb-2">Klassen</label>
								<div className="flex flex-wrap gap-2">
									{classOptions.map((c) => (
										<button
											type="button"
											key={c}
											onClick={() => handleToggleClass(c)}
											className={
												"px-3 py-1 rounded-full border text-sm transition-colors " +
												(classes.includes(c)
													? "bg-indigo-600 text-white border-indigo-600"
													: "bg-white/80 dark:bg-black/30 text-current border-black/10 dark:border-white/10 hover:border-indigo-400")
											}
										>
											{c}
										</button>
									))}
								</div>
								<p className="text-xs mt-1 opacity-70">Mindestens eine Klasse auswählen.</p>
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

				<FooterNav
					step={step}
					canContinue={canContinue}
					loading={loading}
					charLoading={charLoading}
					onBack={back}
					onContinue={() => {
						if (step < 4) return advance();
						if (step === 4) return generateScenarios();
						if (step === 5) return confirmScenarioAndGenerateCharacters();
					}}
					onGenerateScenarios={generateScenarios}
					onConfirmScenario={confirmScenarioAndGenerateCharacters}
				/>
			</div>
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
	];
	return (
		<ol className="flex items-center gap-2 mb-6">
			{items.map((it) => (
				<li key={it.n} className="flex items-center gap-2">
					<span
						className={
							"size-7 rounded-full text-xs grid place-items-center " +
							(step >= it.n
								? "bg-indigo-600 text-white"
								: "bg-black/10 dark:bg-white/10 text-black/60 dark:text-white/60")
						}
					>
						{it.n}
					</span>
					<span className="text-sm opacity-80 hidden sm:inline">{it.t}</span>
					{it.n < items.length && <span className="w-8 h-px bg-black/10 dark:bg-white/10" />}
				</li>
			))}
		</ol>
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
	onConfirmScenario,
}: {
	step: number;
	canContinue: boolean;
	loading: boolean;
	charLoading: boolean;
	onBack: () => void;
	onContinue: () => void;
	onGenerateScenarios: () => void;
	onConfirmScenario: () => void;
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

				{step === 5 && (
					<button
						type="button"
						onClick={onConfirmScenario}
						disabled={!canContinue || isBusy}
						className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isBusy ? "Erstelle…" : "Abenteuer starten"}
					</button>
				)}
			</div>
		</div>
	);
}

