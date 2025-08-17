# Portrait & Rassen-Klassen-System Design

## Übersicht
Dieses Dokument beschreibt das Design für ein erweitertes Charakter-System mit vordefinierten Portraits, Rassen, Klassen, klassenspezifischen Waffen und Fähigkeiten.

## 1. Portrait System

### Benötigte Bilder (108 total)
**Format**: 512x512px, PNG, Fantasy-Stil
**Naming Convention**: `{klasse}_{rasse}_{geschlecht}.png`

#### 1.1 Klassen (9)
- Krieger (warrior)
- Magier (mage) 
- Schurke (rogue)
- Barde (bard)
- Paladin (paladin)
- Waldläufer (ranger)
- Druide (druid)
- Mönch (monk)
- Hexenmeister (warlock)

#### 1.2 Rassen (6)
- Mensch (human)
- Orc (orc)
- Dunkelelf (dark_elf)
- Hochelf (high_elf)
- Waldelf (wood_elf)
- Zwerg (dwarf)

#### 1.3 Geschlechter (2)
- Männlich (male)
- Weiblich (female)

### 1.4 Geschlechter-Auswahl
**UI-Element**: Radio Buttons oder Toggle Switch
```typescript
interface GenderSelection {
  male: "Männlich";
  female: "Weiblich";
}
```
**Integration**: Nach Klassen- und Rassenauswahl wird das Geschlecht gewählt, um das finale Portrait zu bestimmen.

### 1.4 Portrait Prompts

#### Krieger (Warrior)
```
Dateiname: warrior_human_male.png
Prompt: "A strong human male warrior in medieval fantasy armor, holding a longsword and shield, determined expression, brown hair, battle-worn leather and steel armor, fantasy art style, detailed portrait, 512x512"

Dateiname: warrior_human_female.png  
Prompt: "A fierce human female warrior in medieval fantasy armor, holding a longsword and shield, confident expression, auburn hair in a braid, battle-worn leather and steel armor, fantasy art style, detailed portrait, 512x512"

Dateiname: warrior_orc_male.png
Prompt: "A powerful orc male warrior with green skin, tusks, holding a large two-handed axe, intimidating expression, dark hair, heavy plate armor, fantasy art style, detailed portrait, 512x512"

Dateiname: warrior_orc_female.png
Prompt: "A strong orc female warrior with green skin, small tusks, holding a war hammer and shield, fierce expression, black braided hair, chainmail and leather armor, fantasy art style, detailed portrait, 512x512"

Dateiname: warrior_dark_elf_male.png
Prompt: "An elegant dark elf male warrior with dark purple-gray skin, white hair, holding a curved blade, stoic expression, pointed ears, dark leather armor with silver details, fantasy art style, detailed portrait, 512x512"

Dateiname: warrior_dark_elf_female.png
Prompt: "A graceful dark elf female warrior with dark purple-gray skin, silver hair, holding dual scimitars, confident expression, pointed ears, dark leather armor with silver details, fantasy art style, detailed portrait, 512x512"

Dateiname: warrior_high_elf_male.png
Prompt: "A noble high elf male warrior with pale skin, golden hair, holding an ornate longsword, regal expression, pointed ears, shining silver and gold armor, fantasy art style, detailed portrait, 512x512"

Dateiname: warrior_high_elf_female.png
Prompt: "An elegant high elf female warrior with pale skin, platinum blonde hair, holding a rapier and shield, serene expression, pointed ears, ornate silver and blue armor, fantasy art style, detailed portrait, 512x512"

Dateiname: warrior_wood_elf_male.png
Prompt: "A sturdy wood elf male warrior with tan skin, brown hair, holding a wooden shield and spear, alert expression, pointed ears, natural leather and wood armor, fantasy art style, detailed portrait, 512x512"

Dateiname: warrior_wood_elf_female.png
Prompt: "A agile wood elf female warrior with tan skin, green hair, holding a longbow and quiver, focused expression, pointed ears, natural leather and bark armor, fantasy art style, detailed portrait, 512x512"

Dateiname: warrior_dwarf_male.png
Prompt: "A stocky dwarf male warrior with a thick red beard, holding a war hammer, determined expression, braided hair, heavy plate armor with clan symbols, fantasy art style, detailed portrait, 512x512"

Dateiname: warrior_dwarf_female.png
Prompt: "A robust dwarf female warrior with braided brown hair, holding an axe and shield, fierce expression, beard braids, chainmail and leather armor with clan symbols, fantasy art style, detailed portrait, 512x512"
```

#### Magier (Mage)
```
Dateiname: mage_human_male.png
Prompt: "A wise human male mage in flowing robes, holding a staff with crystal orb, intelligent expression, gray beard, blue and gold robes, magical aura, fantasy art style, detailed portrait, 512x512"

Dateiname: mage_human_female.png
Prompt: "A elegant human female mage in flowing robes, holding a wand, serene expression, long black hair, purple and silver robes, magical sparkles around, fantasy art style, detailed portrait, 512x512"

Dateiname: mage_orc_male.png
Prompt: "A imposing orc male shaman with green skin, tusks, holding a bone staff, wise expression, ritual scarring, earth-toned robes and tribal accessories, fantasy art style, detailed portrait, 512x512"

Dateiname: mage_orc_female.png
Prompt: "A mystical orc female shaman with green skin, small tusks, holding a crystal staff, thoughtful expression, braided hair with beads, earth-toned robes and tribal jewelry, fantasy art style, detailed portrait, 512x512"

Dateiname: mage_dark_elf_male.png
Prompt: "A mysterious dark elf male wizard with dark purple-gray skin, white hair, holding a dark magic staff, calculating expression, pointed ears, black and red robes, fantasy art style, detailed portrait, 512x512"

Dateiname: mage_dark_elf_female.png
Prompt: "An alluring dark elf female sorceress with dark purple-gray skin, silver hair, holding a shadow orb, enchanting expression, pointed ears, black and purple robes, fantasy art style, detailed portrait, 512x512"

Dateiname: mage_high_elf_male.png
Prompt: "A noble high elf male archmage with pale skin, golden hair, holding an ornate staff, wise expression, pointed ears, white and gold robes with magical runes, fantasy art style, detailed portrait, 512x512"

Dateiname: mage_high_elf_female.png
Prompt: "An elegant high elf female enchanter with pale skin, platinum hair, holding a crystal wand, serene expression, pointed ears, white and blue robes with silver details, fantasy art style, detailed portrait, 512x512"

Dateiname: mage_wood_elf_male.png
Prompt: "A natural wood elf male druid-mage with tan skin, green hair, holding a nature staff, calm expression, pointed ears, brown and green robes with natural elements, fantasy art style, detailed portrait, 512x512"

Dateiname: mage_wood_elf_female.png
Prompt: "A harmonious wood elf female nature-mage with tan skin, brown hair with flowers, holding a vine staff, peaceful expression, pointed ears, green robes with leaf patterns, fantasy art style, detailed portrait, 512x512"

Dateiname: mage_dwarf_male.png
Prompt: "A scholarly dwarf male runemaster with a gray beard, holding a rune-carved staff, contemplative expression, spectacles, dark robes with runic symbols, fantasy art style, detailed portrait, 512x512"

Dateiname: mage_dwarf_female.png
Prompt: "A wise dwarf female artificer with braided hair, holding a mechanical staff, inventive expression, goggles on forehead, leather apron over robes with gears, fantasy art style, detailed portrait, 512x512"
```

#### Schurke (Rogue)
```
Dateiname: rogue_human_male.png
Prompt: "A stealthy human male rogue in dark leather armor, holding twin daggers, sly expression, dark hair, hooded cloak, lockpicks on belt, fantasy art style, detailed portrait, 512x512"

Dateiname: rogue_human_female.png
Prompt: "A nimble human female rogue in form-fitting leather, holding a curved dagger, mischievous expression, red hair, dark hooded outfit, thieves' tools visible, fantasy art style, detailed portrait, 512x512"

Dateiname: rogue_orc_male.png
Prompt: "A cunning orc male assassin with green skin, small tusks, holding poisoned daggers, calculating expression, dark hair, shadow-black leather armor, fantasy art style, detailed portrait, 512x512"

Dateiname: rogue_orc_female.png
Prompt: "A deadly orc female rogue with green skin, sharp tusks, holding throwing knives, fierce expression, braided black hair, dark leather with tribal markings, fantasy art style, detailed portrait, 512x512"

Dateiname: rogue_dark_elf_male.png
Prompt: "A shadow dark elf male rogue with dark purple-gray skin, white hair, holding curved daggers, mysterious expression, pointed ears, midnight black leather with silver buckles, fantasy art style, detailed portrait, 512x512"

Dateiname: rogue_dark_elf_female.png
Prompt: "An elegant dark elf female assassin with dark purple-gray skin, silver hair, holding twin blades, seductive expression, pointed ears, form-fitting dark leather, fantasy art style, detailed portrait, 512x512"

Dateiname: rogue_high_elf_male.png
Prompt: "A refined high elf male rogue with pale skin, golden hair, holding an ornate dagger, noble expression, pointed ears, elegant dark leather with gold details, fantasy art style, detailed portrait, 512x512"

Dateiname: rogue_high_elf_female.png
Prompt: "A graceful high elf female rogue with pale skin, platinum hair, holding a jeweled dagger, sophisticated expression, pointed ears, stylish leather with silver trim, fantasy art style, detailed portrait, 512x512"

Dateiname: rogue_wood_elf_male.png
Prompt: "A natural wood elf male scout with tan skin, brown hair, holding a hunting knife, alert expression, pointed ears, forest-green leather with natural camouflage, fantasy art style, detailed portrait, 512x512"

Dateiname: rogue_wood_elf_female.png
Prompt: "A swift wood elf female ranger-rogue with tan skin, green hair, holding dual short blades, focused expression, pointed ears, bark-colored leather armor, fantasy art style, detailed portrait, 512x512"

Dateiname: rogue_dwarf_male.png
Prompt: "A stocky dwarf male burglar with a braided beard, holding lockpicks, mischievous expression, dark hair, reinforced leather armor with tool belts, fantasy art style, detailed portrait, 512x512"

Dateiname: rogue_dwarf_female.png
Prompt: "A nimble dwarf female thief with braided hair, holding a small hammer and dagger, clever expression, leather armor with many pockets and tools, fantasy art style, detailed portrait, 512x512"
```

#### Barde (Bard)
```
Dateiname: bard_human_male.png
Prompt: "A charismatic human male bard with a lute, charming expression, shoulder-length brown hair, colorful traveling clothes with musical notes embroidery, fantasy art style, detailed portrait, 512x512"

Dateiname: bard_human_female.png
Prompt: "An enchanting human female bard holding a flute, captivating expression, flowing auburn hair, elegant performer's dress with golden trim, fantasy art style, detailed portrait, 512x512"

Dateiname: bard_orc_male.png
Prompt: "A powerful orc male war-drummer with green skin, tusks, holding tribal drums, passionate expression, war paint, leather vest with bone decorations, fantasy art style, detailed portrait, 512x512"

Dateiname: bard_orc_female.png
Prompt: "A fierce orc female storyteller with green skin, small tusks, holding a bone flute, intense expression, braided hair with feathers, tribal performer's outfit, fantasy art style, detailed portrait, 512x512"

Dateiname: bard_dark_elf_male.png
Prompt: "An alluring dark elf male musician with dark purple-gray skin, white hair, holding a dark violin, mesmerizing expression, pointed ears, elegant black and silver performer's attire, fantasy art style, detailed portrait, 512x512"

Dateiname: bard_dark_elf_female.png
Prompt: "A seductive dark elf female singer with dark purple-gray skin, silver hair, holding a crystal microphone, enchanting expression, pointed ears, flowing dark gown with gems, fantasy art style, detailed portrait, 512x512"

Dateiname: bard_high_elf_male.png
Prompt: "A noble high elf male composer with pale skin, golden hair, holding an ornate harp, refined expression, pointed ears, courtly blue and gold robes, fantasy art style, detailed portrait, 512x512"

Dateiname: bard_high_elf_female.png
Prompt: "An elegant high elf female minstrel with pale skin, platinum hair, holding a silver lyre, graceful expression, pointed ears, flowing white and blue performer's dress, fantasy art style, detailed portrait, 512x512"

Dateiname: bard_wood_elf_male.png
Prompt: "A natural wood elf male folk musician with tan skin, brown hair, holding wooden pipes, peaceful expression, pointed ears, earth-toned traveling clothes with leaf patterns, fantasy art style, detailed portrait, 512x512"

Dateiname: bard_wood_elf_female.png
Prompt: "A harmonious wood elf female nature singer with tan skin, green hair with flowers, holding a wooden flute, serene expression, pointed ears, natural fiber dress with vine decorations, fantasy art style, detailed portrait, 512x512"

Dateiname: bard_dwarf_male.png
Prompt: "A jovial dwarf male tavern singer with a thick beard, holding a tankard and lute, cheerful expression, clan colors, leather vest with drinking horn, fantasy art style, detailed portrait, 512x512"

Dateiname: bard_dwarf_female.png
Prompt: "A spirited dwarf female battle-singer with braided hair, holding a war horn, inspiring expression, clan symbols, reinforced leather with musical instrument accessories, fantasy art style, detailed portrait, 512x512"
```

#### Paladin (Paladin)
```
Dateiname: paladin_human_male.png
Prompt: "A righteous human male paladin in shining plate armor, holding a blessed sword and holy symbol, noble expression, short brown hair, white and gold armor with divine symbols, fantasy art style, detailed portrait, 512x512"

Dateiname: paladin_human_female.png
Prompt: "A divine human female paladin in radiant armor, holding a blessed mace, determined expression, blonde hair in a ponytail, silver and white armor with holy engravings, fantasy art style, detailed portrait, 512x512"

Dateiname: paladin_orc_male.png
Prompt: "A redeemed orc male crusader with green skin, tusks, holding a consecrated war hammer, solemn expression, ritual scarring, heavy plate armor with religious symbols, fantasy art style, detailed portrait, 512x512"

Dateiname: paladin_orc_female.png
Prompt: "A faithful orc female templar with green skin, small tusks, holding a blessed shield, devoted expression, braided hair with holy beads, sanctified armor with divine protection, fantasy art style, detailed portrait, 512x512"

Dateiname: paladin_dark_elf_male.png
Prompt: "A converted dark elf male cleric-warrior with dark purple-gray skin, white hair, holding a redemption sword, conflicted expression, pointed ears, dark armor with silver holy symbols, fantasy art style, detailed portrait, 512x512"

Dateiname: paladin_dark_elf_female.png
Prompt: "A redeemed dark elf female knight with dark purple-gray skin, silver hair, holding a purifying blade, serene expression, pointed ears, transformed dark armor with light divine engravings, fantasy art style, detailed portrait, 512x512"

Dateiname: paladin_high_elf_male.png
Prompt: "A celestial high elf male paladin with pale skin, golden hair, holding a radiant longsword, wise expression, pointed ears, pristine white and gold plate armor with angelic motifs, fantasy art style, detailed portrait, 512x512"

Dateiname: paladin_high_elf_female.png
Prompt: "A divine high elf female champion with pale skin, platinum hair, holding a blessed lance, righteous expression, pointed ears, gleaming silver armor with celestial decorations, fantasy art style, detailed portrait, 512x512"

Dateiname: paladin_wood_elf_male.png
Prompt: "A nature-devoted wood elf male guardian with tan skin, brown hair, holding a living wood shield, protective expression, pointed ears, green and brown armor with natural holy symbols, fantasy art style, detailed portrait, 512x512"

Dateiname: paladin_wood_elf_female.png
Prompt: "A grove-blessed wood elf female protector with tan skin, green hair, holding a nature-blessed sword, calm expression, pointed ears, bark and leaf armor with druidic holy symbols, fantasy art style, detailed portrait, 512x512"

Dateiname: paladin_dwarf_male.png
Prompt: "A devout dwarf male cleric-warrior with a blessed beard, holding a consecrated war hammer, steadfast expression, clan and religious symbols, blessed plate armor with runes, fantasy art style, detailed portrait, 512x512"

Dateiname: paladin_dwarf_female.png
Prompt: "A faithful dwarf female temple knight with braided hair, holding a blessed axe, resolute expression, religious braids, sanctified armor with dwarven and divine engravings, fantasy art style, detailed portrait, 512x512"
```

#### Waldläufer (Ranger)
```
Dateiname: ranger_human_male.png
Prompt: "A skilled human male ranger in woodland gear, holding a longbow, alert expression, brown hair, forest-green leather armor with camouflage patterns, fantasy art style, detailed portrait, 512x512"

Dateiname: ranger_human_female.png
Prompt: "A capable human female ranger with survival gear, holding a composite bow, focused expression, tied-back brown hair, practical leather armor with nature accessories, fantasy art style, detailed portrait, 512x512"

Dateiname: ranger_orc_male.png
Prompt: "A tribal orc male hunter with green skin, tusks, holding a bone bow, fierce expression, war paint, hide armor with tribal hunting totems, fantasy art style, detailed portrait, 512x512"

Dateiname: ranger_orc_female.png
Prompt: "A wild orc female tracker with green skin, small tusks, holding hunting spears, predatory expression, braided hair with feathers, hide and leather armor with bone decorations, fantasy art style, detailed portrait, 512x512"

Dateiname: ranger_dark_elf_male.png
Prompt: "A shadow dark elf male scout with dark purple-gray skin, white hair, holding a darkwood bow, vigilant expression, pointed ears, midnight leather with silver buckles, fantasy art style, detailed portrait, 512x512"

Dateiname: ranger_dark_elf_female.png
Prompt: "A deadly dark elf female huntress with dark purple-gray skin, silver hair, holding twin hunting knives, cold expression, pointed ears, dark leather with shadowy camouflage, fantasy art style, detailed portrait, 512x512"

Dateiname: ranger_high_elf_male.png
Prompt: "An elegant high elf male archer with pale skin, golden hair, holding an elven longbow, noble expression, pointed ears, refined leather armor with gold and silver details, fantasy art style, detailed portrait, 512x512"

Dateiname: ranger_high_elf_female.png
Prompt: "A graceful high elf female marksman with pale skin, platinum hair, holding a crystal-tipped bow, serene expression, pointed ears, pristine leather armor with elven engravings, fantasy art style, detailed portrait, 512x512"

Dateiname: ranger_wood_elf_male.png
Prompt: "A natural wood elf male forest guardian with tan skin, brown hair, holding a living wood bow, protective expression, pointed ears, bark and leaf camouflage armor, fantasy art style, detailed portrait, 512x512"

Dateiname: ranger_wood_elf_female.png
Prompt: "A swift wood elf female pathfinder with tan skin, green hair, holding nature arrows, alert expression, pointed ears, seamless forest camouflage gear, fantasy art style, detailed portrait, 512x512"

Dateiname: ranger_dwarf_male.png
Prompt: "A sturdy dwarf male mountain ranger with a braided beard, holding a crossbow, determined expression, mountain gear, reinforced leather armor with climbing equipment, fantasy art style, detailed portrait, 512x512"

Dateiname: ranger_dwarf_female.png
Prompt: "A tough dwarf female wilderness guide with braided hair, holding throwing axes, confident expression, survival gear, practical leather armor with mountain clan symbols, fantasy art style, detailed portrait, 512x512"
```

#### Druide (Druid)
```
Dateiname: druid_human_male.png
Prompt: "A wise human male druid in natural robes, holding a gnarled staff, serene expression, long hair with leaves, earth-toned robes with nature symbols, fantasy art style, detailed portrait, 512x512"

Dateiname: druid_human_female.png
Prompt: "A nature-connected human female druid with flower crown, holding a crystal, peaceful expression, flowing hair with vines, green robes with animal patterns, fantasy art style, detailed portrait, 512x512"

Dateiname: druid_orc_male.png
Prompt: "A primal orc male earth-shaman with green skin, tusks, holding a bone totem, wild expression, ritual markings, hide robes with earth and stone decorations, fantasy art style, detailed portrait, 512x512"

Dateiname: druid_orc_female.png
Prompt: "A fierce orc female nature-priest with green skin, small tusks, holding animal bones, intense expression, braided hair with claws, primitive robes with tribal nature symbols, fantasy art style, detailed portrait, 512x512"

Dateiname: druid_dark_elf_male.png
Prompt: "A shadow dark elf male nature-witch with dark purple-gray skin, white hair, holding dark crystals, mysterious expression, pointed ears, black robes with silver moon and star patterns, fantasy art style, detailed portrait, 512x512"

Dateiname: druid_dark_elf_female.png
Prompt: "A twilight dark elf female moon-druid with dark purple-gray skin, silver hair, holding a lunar staff, ethereal expression, pointed ears, dark flowing robes with night-blooming flower decorations, fantasy art style, detailed portrait, 512x512"

Dateiname: druid_high_elf_male.png
Prompt: "A refined high elf male arch-druid with pale skin, golden hair, holding a sun-crystal staff, wise expression, pointed ears, white and gold robes with celestial nature patterns, fantasy art style, detailed portrait, 512x512"

Dateiname: druid_high_elf_female.png
Prompt: "An elegant high elf female star-druid with pale skin, platinum hair, holding constellation crystals, mystical expression, pointed ears, shimmering robes with starlight and leaf motifs, fantasy art style, detailed portrait, 512x512"

Dateiname: druid_wood_elf_male.png
Prompt: "A natural wood elf male forest-keeper with tan skin, brown hair, holding a living branch staff, protective expression, pointed ears, seamless bark and leaf robes with moss decorations, fantasy art style, detailed portrait, 512x512"

Dateiname: druid_wood_elf_female.png
Prompt: "A harmonious wood elf female grove-tender with tan skin, green hair with flowers, holding sprouting seeds, nurturing expression, pointed ears, living plant robes that seem to grow, fantasy art style, detailed portrait, 512x512"

Dateiname: druid_dwarf_male.png
Prompt: "A earth-bound dwarf male stone-druid with a moss-covered beard, holding crystal geodes, contemplative expression, stone and earth-toned robes with mineral decorations, fantasy art style, detailed portrait, 512x512"

Dateiname: druid_dwarf_female.png
Prompt: "A mountain dwarf female crystal-keeper with braided hair and gems, holding healing stones, nurturing expression, earth-colored robes with precious stone and metal accents, fantasy art style, detailed portrait, 512x512"
```

#### Mönch (Monk)
```
Dateiname: monk_human_male.png
Prompt: "A disciplined human male monk in simple robes, martial arts stance, calm expression, shaved head, brown and orange robes with rope belt, fantasy art style, detailed portrait, 512x512"

Dateiname: monk_human_female.png
Prompt: "A focused human female monk in flowing garments, meditation pose, serene expression, short black hair, white and gray robes with simple cord, fantasy art style, detailed portrait, 512x512"

Dateiname: monk_orc_male.png
Prompt: "A disciplined orc male warrior-monk with green skin, controlled tusks, holding prayer beads, centered expression, ritual scars, simple brown robes with tribal cord, fantasy art style, detailed portrait, 512x512"

Dateiname: monk_orc_female.png
Prompt: "A balanced orc female spirit-monk with green skin, small tusks, meditation gesture, peaceful expression, braided hair, earth-toned robes with natural fiber belt, fantasy art style, detailed portrait, 512x512"

Dateiname: monk_dark_elf_male.png
Prompt: "A shadow dark elf male shadow-monk with dark purple-gray skin, white hair, martial stance, focused expression, pointed ears, dark gray robes with silver rope, fantasy art style, detailed portrait, 512x512"

Dateiname: monk_dark_elf_female.png
Prompt: "A graceful dark elf female moon-monk with dark purple-gray skin, silver hair, flowing movement, tranquil expression, pointed ears, midnight blue robes with star patterns, fantasy art style, detailed portrait, 512x512"

Dateiname: monk_high_elf_male.png
Prompt: "A refined high elf male sun-monk with pale skin, golden hair, perfect stance, enlightened expression, pointed ears, white robes with gold trim and celestial symbols, fantasy art style, detailed portrait, 512x512"

Dateiname: monk_high_elf_female.png
Prompt: "An elegant high elf female light-monk with pale skin, platinum hair, balanced pose, serene expression, pointed ears, flowing white and silver robes with intricate patterns, fantasy art style, detailed portrait, 512x512"

Dateiname: monk_wood_elf_male.png
Prompt: "A natural wood elf male forest-monk with tan skin, brown hair, tree-like stance, harmonious expression, pointed ears, green and brown robes with natural fiber and leaf decorations, fantasy art style, detailed portrait, 512x512"

Dateiname: monk_wood_elf_female.png
Prompt: "A flowing wood elf female wind-monk with tan skin, green hair, graceful movement, peaceful expression, pointed ears, nature-colored robes that seem to move like leaves, fantasy art style, detailed portrait, 512x512"

Dateiname: monk_dwarf_male.png
Prompt: "A solid dwarf male stone-monk with a disciplined beard, grounded stance, determined expression, earth-toned robes with stone and metal accessories, fantasy art style, detailed portrait, 512x512"

Dateiname: monk_dwarf_female.png
Prompt: "A centered dwarf female mountain-monk with braided hair, balanced pose, calm expression, gray and brown robes with simple stone and metal ornaments, fantasy art style, detailed portrait, 512x512"
```

#### Hexenmeister (Warlock)
```
Dateiname: warlock_human_male.png
Prompt: "A dark human male warlock in shadowy robes, holding an eldritch orb, intense expression, black hair, dark purple and black robes with otherworldly symbols, fantasy art style, detailed portrait, 512x512"

Dateiname: warlock_human_female.png
Prompt: "A mysterious human female warlock with arcane tattoos, holding a pact tome, alluring expression, dark hair with streaks, black and red robes with demonic sigils, fantasy art style, detailed portrait, 512x512"

Dateiname: warlock_orc_male.png
Prompt: "A pact-bound orc male demon-caller with green skin, tusks, holding infernal symbols, fierce expression, ritual scarring, dark robes with bone and metal decorations, fantasy art style, detailed portrait, 512x512"

Dateiname: warlock_orc_female.png
Prompt: "A corrupted orc female void-speaker with green skin, glowing tusks, holding dark crystals, menacing expression, braided hair with dark ornaments, shadow-black robes with infernal designs, fantasy art style, detailed portrait, 512x512"

Dateiname: warlock_dark_elf_male.png
Prompt: "A sinister dark elf male fiend-pact warlock with dark purple-gray skin, white hair, holding cursed artifacts, calculating expression, pointed ears, elaborate black robes with silver and red accents, fantasy art style, detailed portrait, 512x512"

Dateiname: warlock_dark_elf_female.png
Prompt: "A seductive dark elf female succubus-pact warlock with dark purple-gray skin, silver hair, holding temptation charms, enchanting expression, pointed ears, revealing black robes with golden chains, fantasy art style, detailed portrait, 512x512"

Dateiname: warlock_high_elf_male.png
Prompt: "A fallen high elf male celestial-pact warlock with pale skin, golden hair, holding conflicted magic, tormented expression, pointed ears, tattered white robes with dark corruption spreading, fantasy art style, detailed portrait, 512x512"

Dateiname: warlock_high_elf_female.png
Prompt: "A corrupted high elf female archfey-pact warlock with pale skin, platinum hair, holding fey magic, otherworldly expression, pointed ears, iridescent robes that shift between light and shadow, fantasy art style, detailed portrait, 512x512"

Dateiname: warlock_wood_elf_male.png
Prompt: "A twisted wood elf male old-one-pact warlock with tan skin, brown hair, holding eldritch knowledge, disturbed expression, pointed ears, nature robes corrupted with strange growths and symbols, fantasy art style, detailed portrait, 512x512"

Dateiname: warlock_wood_elf_female.png
Prompt: "A changed wood elf female great-old-one warlock with tan skin, green hair with tentacle-like strands, holding forbidden texts, unsettling expression, pointed ears, robes that seem alive and shifting, fantasy art style, detailed portrait, 512x512"

Dateiname: warlock_dwarf_male.png
Prompt: "A dark-pact dwarf male infernal warlock with a corrupted beard, holding hellish contracts, grim expression, dark robes with dwarven runes twisted into demonic symbols, fantasy art style, detailed portrait, 512x512"

Dateiname: warlock_dwarf_female.png
Prompt: "A deal-bound dwarf female fiend warlock with braided dark hair, holding burning contracts, determined expression, soot-black robes with glowing red runes and chain decorations, fantasy art style, detailed portrait, 512x512"
```

## 2. Rassen-System

### 2.1 Rassen-Eigenschaften

#### Mensch (Human)
- **Grundwerte**: Ausgewogen, +1 auf alle Attribute
- **Spezialfähigkeiten**:
  - Vielseitigkeit: Extra Skill Point pro Level
  - Anpassungsfähig: Kann alle Waffentypen verwenden
  - Determination: +2 auf Rettungswürfe gegen Furcht

#### Orc
- **Grundwerte**: STR +2, CON +1, INT -1
- **Spezialfähigkeiten**:
  - Rohe Kraft: +25% Nahkampfschaden
  - Zähigkeit: +2 HP pro Level
  - Berserker-Wut: Kann einmal pro Tag Wut aktivieren (+3 STR, -1 AC für 10 Runden)

#### Dunkelelf (Dark Elf)
- **Grundwerte**: DEX +2, INT +1, CON -1
- **Spezialfähigkeiten**:
  - Dunkelsicht: Kann in völliger Dunkelheit sehen
  - Schattenmagie: Bonus auf dunkle Zauber
  - Giftresistenz: +4 gegen Gifte

#### Hochelf (High Elf)
- **Grundwerte**: INT +2, DEX +1, CON -1
- **Spezialfähigkeiten**:
  - Magische Begabung: +1 Zauberslot pro Level
  - Elfen-Präzision: Kritische Treffer bei 19-20
  - Meditation: Braucht nur 4 Stunden Ruhe statt 8

#### Waldelf (Wood Elf)
- **Grundwerte**: DEX +2, WIS +1, STR -1
- **Spezialfähigkeiten**:
  - Naturverbundenheit: +2 auf Überlebens-Würfe
  - Bogenschütze: +1 Angriff und Schaden mit Bögen
  - Tiersprache: Kann mit Waldtieren kommunizieren

#### Zwerg (Dwarf)
- **Grundwerte**: CON +2, STR +1, DEX -1
- **Spezialfähigkeiten**:
  - Steinhaut: +1 natürliche Rüstungsklasse
  - Giftresistenz: +4 gegen Gifte und Krankheiten
  - Handwerkskunst: +2 auf alle Handwerks-Würfe

## 3. Klassen-System

### 3.1 Klassenspezifische Waffen

#### Krieger (Warrior)
- **Primärwaffen**: Langschwerter, Streitäxte, Kriegshämmer, Zweihandschwerter
- **Sekundär**: Schilde, Armbrüste, Wurfspeere
- **Verboten**: Zauberstäbe, Zauberkomponenten, leichte Bögen

#### Magier (Mage)
- **Primärwaffen**: Zauberstäbe, Stäbe, Dolche, Orbs
- **Sekundär**: Zauberkomponenten, Zauberbücher, Kristalle
- **Verboten**: Schwere Rüstungen, Zweihandwaffen, schwere Schilde

#### Schurke (Rogue)
- **Primärwaffen**: Dolche, Kurzschwerter, Bögen, Armbrüste
- **Sekundär**: Dietriche, Gifte, Wurfmesser, leichte Armbrüste
- **Verboten**: Schwere Rüstungen, Zweihandwaffen, große Schilde

#### Barde (Bard)
- **Primärwaffen**: Rapiere, leichte Bögen, Dolche, Musikinstrumente
- **Sekundär**: Zauberkomponenten, Wurfwaffen, leichte Armbrüste
- **Verboten**: Schwere Rüstungen, Zweihandwaffen, Kriegshämmer

#### Paladin (Paladin)
- **Primärwaffen**: Langschwerter, Streitkolben, Kriegshämmer, heilige Symbole
- **Sekundär**: Große Schilde, Lanzen, gesegnete Waffen
- **Verboten**: Unheilige Waffen, Gifte, dunkle Magie-Items

#### Waldläufer (Ranger)
- **Primärwaffen**: Bögen, Langbögen, Speere, Kurzschwerter
- **Sekundär**: Überlebensausrüstung, Fallen, Wurfäxte, leichte Armbrüste
- **Verboten**: Schwere Rüstungen, große Zweihandwaffen

#### Druide (Druid)
- **Primärwaffen**: Stäbe, Keulen, Speere, Sicheln, Naturkristalle
- **Sekundär**: Naturkomponenten, Heilkräuter, Tierknochen-Fokus
- **Verboten**: Metallrüstungen, Metallwaffen, künstliche Magie-Items

#### Mönch (Monk)
- **Primärwaffen**: Kampfstäbe, Nunchaku, Klauen, unbewaffnet
- **Sekundär**: Shuriken, Mönchswaffen, Meditationsperlen
- **Verboten**: Rüstungen, schwere Waffen, Fernkampfwaffen (außer Mönchswaffen)

#### Hexenmeister (Warlock)
- **Primärwaffen**: Eldritch Blast (magisch), Dolche, leichte Armbrüste, Pakt-Waffen
- **Sekundär**: Pakt-Fokus, okkulte Symbole, verfluchte Gegenstände
- **Verboten**: Schwere Rüstungen, heilige Waffen, gesegnete Gegenstände

### 3.2 Klassenspezifische Skills

#### Universelle Skills (alle Klassen)
- Athletik
- Wahrnehmung
- Überreden
- Einschüchtern
- Geschichte

#### Krieger-Skills (Warrior)
- Kampf (Nahkampf)
- Verteidigung
- Taktik
- Führung
- Waffenpflege

#### Magier-Skills (Mage)
- Zauberei
- Arkane Kunde
- Alchemie
- Ritualmagie
- Magietheorie

#### Schurken-Skills (Rogue)
- Schleichen
- Schlösser knacken
- Fallen entschärfen
- Taschendiebstahl
- Straßenwissen

#### Barden-Skills (Bard)
- Performance
- Diplomatie
- Täuschung
- Zauberei (begrenzt)
- Geschichten erzählen

#### Paladin-Skills (Paladin)
- Göttliche Magie
- Heilung
- Untote bannen
- Führung
- Rechtschaffenheit

#### Waldläufer-Skills (Ranger)
- Spurenlesen
- Überleben
- Tierführung
- Bogenschießen
- Naturkunde

#### Druiden-Skills (Druid)
- Naturmagie
- Tiersprache
- Gestaltwandlung
- Kräuterkunde
- Wetterkontrolle

#### Mönch-Skills (Monk)
- Kampfkunst
- Meditation
- Akrobatik
- Selbstkontrolle
- Innere Ruhe

#### Hexenmeister-Skills (Warlock)
- Eldritch Magic
- Pakt-Magie
- Okkulte Kunde
- Flüche
- Dämonologie

## 4. Portrait-Auswahl System

### 4.1 Charaktererstellung Flow
1. Spieler wählt **Klasse** → verfügbare Rassen werden angezeigt
2. Spieler wählt **Rasse** → Geschlechterauswahl wird aktiviert  
3. Spieler wählt **Geschlecht** → entsprechendes Portrait wird automatisch zugewiesen
4. Portrait wird in `public/portraits/` referenziert und angezeigt
5. **Optional**: Spieler kann zwischen verschiedenen Portrait-Varianten der gewählten Kombination wählen

### 4.2 Dateistruktur
```
public/
  portraits/
    warrior/
      warrior_human_male.png
      warrior_human_female.png
      warrior_orc_male.png
      warrior_orc_female.png
      warrior_dark_elf_male.png
      warrior_dark_elf_female.png
      warrior_high_elf_male.png
      warrior_high_elf_female.png
      warrior_wood_elf_male.png
      warrior_wood_elf_female.png
      warrior_dwarf_male.png
      warrior_dwarf_female.png
    mage/
      mage_human_male.png
      mage_human_female.png
      ... (alle Rassen × Geschlechter)
    rogue/
      ... (alle Kombinationen)
    bard/
      ... (alle Kombinationen)
    paladin/
      ... (alle Kombinationen)
    ranger/
      ... (alle Kombinationen)
    druid/
      ... (alle Kombinationen)
    monk/
      ... (alle Kombinationen)
    warlock/
      ... (alle Kombinationen)
```

### 4.3 Portrait-Verwaltung Komponente
```typescript
interface PortraitSelectorProps {
  selectedClass: string;
  selectedRace: string; 
  selectedGender: 'male' | 'female';
  onPortraitSelect: (portraitUrl: string) => void;
}

interface CharacterCreationFlow {
  step: 'class' | 'race' | 'gender' | 'portrait' | 'stats' | 'complete';
  selectedClass?: string;
  selectedRace?: string;
  selectedGender?: 'male' | 'female';
  portraitUrl?: string;
}
```

## 5. Technische Implementierung

### 5.1 Entfernungen aus dem bestehenden System
- **Zeitalter-Auswahl entfernen**: Das System fokussiert sich auf ein konsistentes Fantasy-Mittelalter-Setting
- **Keine Industrial/Modern-Elemente**: Alle Zeitalter-Buttons und entsprechende Logik werden entfernt
- **Setting-Vereinfachung**: Einheitliches Fantasy-Setting für alle Klassen und Rassen

### 5.2 Zu erstellende/modifizierende Dateien
- `schemas/character.ts` - Race enum hinzufügen, Gender enum erweitern
- `lib/character/characterGenerator.ts` - Rassen-Klassen-System, Zeitalter-Logik entfernen
- `lib/character/raceSystem.ts` - Neue Datei für Rassen-Logik
- `lib/character/classSystem.ts` - Neue Datei für erweiterte Klassen-Logik
- `app/components/RaceSelector.tsx` - Rassenauswahl UI
- `app/components/GenderSelector.tsx` - Geschlechterauswahl UI
- `app/components/PortraitSelector.tsx` - Portrait-Auswahl UI
- `app/components/CharacterCreator.tsx` - Integration, Zeitalter-Buttons entfernen
- `app/components/OnboardingWizard.tsx` - Zeitalter-Schritt entfernen

### 5.3 Datenstrukturen
```typescript
// Erweiterte Character Schemas
enum Race {
  HUMAN = 'human',
  ORC = 'orc', 
  DARK_ELF = 'dark_elf',
  HIGH_ELF = 'high_elf',
  WOOD_ELF = 'wood_elf',
  DWARF = 'dwarf'
}

enum Gender {
  MALE = 'male',
  FEMALE = 'female'
}

enum CharacterClass {
  WARRIOR = 'warrior',
  MAGE = 'mage',
  ROGUE = 'rogue', 
  BARD = 'bard',
  PALADIN = 'paladin',
  RANGER = 'ranger',
  DRUID = 'druid',
  MONK = 'monk',
  WARLOCK = 'warlock'
}

interface RaceData {
  name: string;
  displayName: string;
  bonuses: StatModifiers;
  abilities: RacialAbility[];
  allowedClasses: CharacterClass[];
  description: string;
}

interface CharacterClassData {
  name: string;
  displayName: string;
  primaryWeapons: WeaponType[];
  forbiddenWeapons: WeaponType[];
  classSkills: string[];
  startingEquipment: InventoryItem[];
  description: string;
}

interface StatModifiers {
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
}

interface RacialAbility {
  name: string;
  description: string;
  type: 'passive' | 'active' | 'bonus';
  effect: string;
}

// Portrait System
interface PortraitPath {
  class: CharacterClass;
  race: Race;
  gender: Gender;
  filename: string;
  path: string;
}
```

## 6. Implementierungsplan

### Phase 1: System-Bereinigung
1. **Zeitalter-Auswahl komplett entfernen**
   - OnboardingWizard.tsx: Zeitalter-Schritt entfernen
   - CharacterCreator.tsx: Industrial/Modern/etc. Buttons entfernen
   - Alle Zeitalter-bezogenen States und Logik entfernen
2. **Setting auf Fantasy-Mittelalter vereinheitlichen**
   - Alle Prompts und Beschreibungen anpassen
   - Konsistente Fantasy-Terminologie

### Phase 2: Portrait-System
3. Portrait-Verzeichnisstruktur erstellen (108 Ordner/Dateien)
4. PortraitSelector Komponente entwickeln
5. Automatische Portrait-Zuweisung basierend auf Klasse+Rasse+Geschlecht

### Phase 3: Rassen-System  
6. Race Schema und Enum definieren
7. Rassen-Daten mit Stat-Boni und Fähigkeiten implementieren
8. RaceSelector Komponente mit Rassen-Vorschau

### Phase 4: Erweiterte Klassen
9. Alle 9 Klassen vollständig definieren (derzeit nur 5)
10. Klassenspezifische Waffen-Validierung
11. Startausrüstung pro Klasse anpassen

### Phase 5: Skill-System Erweiterung
12. Klassenspezifische Skills definieren (derzeit fehlen Bard, Paladin, Ranger, Druid, Monk, Warlock)
13. Universelle vs. Klassen-Skills Unterscheidung
14. Skill-Validierung und Level-System

### Phase 6: Integration & UI
15. CharacterCreator komplett überarbeiten: Klasse → Rasse → Geschlecht → Portrait Flow
16. Geschlechterauswahl UI hinzufügen
17. Portrait-Anzeige in allen Character-bezogenen Komponenten
18. Testing aller 108 Portrait-Kombinationen

### Phase 7: Game-Integration
19. Bestehende Character-Erstellung mit neuem System ersetzen
20. Rassen-Boni in Kampf-System integrieren
21. Klassenspezifische Waffen-Beschränkungen in Equipment-System
22. Migration bestehender Charaktere (falls vorhanden)

---

**Entwicklungszeit geschätzt**: 
- Phase 1 (Bereinigung): 2-4 Stunden
- Phase 2-3 (Portrait + Rassen): 1 Tag  
- Phase 4-5 (Klassen + Skills): 1 Tag
- Phase 6-7 (Integration + Testing): 1 Tag
- **Total**: 2-3 Entwicklungstage

**Voraussetzungen für Start**:
- ✅ Alle 108 Portrait-Prompts definiert
- ✅ Alle 9 Klassen-Waffen definiert  
- ✅ Alle 9 Klassen-Skills definiert
- ✅ 6 Rassen mit Fähigkeiten spezifiziert
- ✅ Zeitalter-Entfernung geplant
- 🔄 **Warte auf Go-Signal für Implementation**

**Nach Go-Signal wird das neue System schaffen**:
- Authentische D&D-Erfahrung mit 54 einzigartigen Rassen-Klassen-Kombinationen
- Jeder Charakter hat passende Waffen, Skills und Portrait
- Vereinfachtes, konsistentes Fantasy-Setting ohne moderne Elemente
- Vollständig typisiertes und validiertes Charakter-System

**Bereit für Implementation - warte auf Ihr Go!** 🚀
