import classNames from 'classnames';
import state from '../state';
import Item from '../components/item';



function isLockedItem(id) {
	return !state.showHiddenUpgrades.value && !state.itemsUnlockedSet.value.has(id);
}

function onHideSpoilers(event) {
	state.showHiddenUpgrades.value = !event.target.checked;
}


export default function Tips(props) {
	return (
		<main class="page tips">
			<h2>
			Tips & Tricks
			</h2>
			<p>
				{state.research.value && (
					<label class="spoilers">
						Hide items/buildings not researched: <input type="checkbox" checked={!state.showHiddenUpgrades.value} onInput={onHideSpoilers}/>
					</label>
				)}
			</p>
			<h3>
				Gameplay
			</h3>
			<ul>
				<li>
					It is essential to automate all your buildings as soon as they are unlocked. Get away from handcrafting, DSP is more focused on automation.
				</li>
				<li>
					Aim to produce at least 1 per second of each research matrix.
				</li>
				<li>
					Fire Ice is the most important resource. Most commonly you will find gas giants that produce Fire Ice, or you can find Fire Ice Veins on some planets.
				</li>
				<li>
					Second most important is Sulfuric Acid. You can find some planets that have Sulfuric Acid Oceans, which you can use a Water Pump on to gather the Sulfuric Acid.
				</li>
				<li>
					Getting lost? You can misuse <Item id={2030} named plural/> as beacons (see below).
					Use <Item id={1131} named plural/> to paint lines or zones that can be seen from afar or when quickly popping into orbit.
				</li>
				<li>
					How you play the game is up to you! But for a general outline of what game progression can be like:
					<ul>
						<li>
							Beginning — Belt Spaghetti, Early Mall<br/>
							Your belts are a mess, factories spot the landscape as you deal with the terrain. It's a good idea to start an early mall — a factory complex that slowly produces the essential or all the buildings for you
						</li>
						<li>
							Mid Game — Planetary Logistics Station, Big Mall, Modularising Factory<br/>
							Everything changes when you unlock the Planetary Logistics Station. You want to unlock this as soon as possible. This is now when you can remove the old factory and start building everything with modules, with a PLS's for input and output.
						</li>
						<li>
							Late Game — PLS, Interstellar Logistics Station, Orbital Collectors, Heavy blueprint usage<br/>
							As you expand across planets and building an interstellar empire, you will find yourself designing your own blueprints.
						</li>
						<li>
							End Game — 'Mission Complete'
						</li>
					</ul>
					Ideally you want to push straight into unlocking and building Planetary Logistics Station as early as possible, as it will significantly ease factory design &amp; logistics.
				</li>
				<li>
					The belt bus layout does not work well in Dyson Sphere Program, compared to Factorio. You will want to use PLS/ILS.
				</li>
				<li class={classNames({ 'is-locked': isLockedItem(2103) })}>
					Instead of using several <Item id={2020} named plural/>, you can use a single <Item id={2103} named/>{isLockedItem(2104)? null : <> or <Item id={2104} named/></>} set to storage to act as big <Item id={2020} named/> with multiple outputs. This can save a lot of space compared to complex belt layouts and cut down on buildings.
				</li>
			</ul>
			<h3>
				Performance
			</h3>
			<ul>
				<li>
					Got FPS problems? Try the <a target="_blank" rel="noreferrer" href="https://dsp.thunderstore.io/package/Selsion/DSPOptimizations/">DSPOptmizations</a> and <a target="_blank" rel="noreferrer" href="https://dsp.thunderstore.io/package/starfi5h/AlterTickrate/">AlterTickRate</a> mods
				</li>
				<li>
					Generally you want to aim at having fewer buildings and also avoid using those that affect your UPS the most.
				</li>
				<li class={classNames({ 'is-locked': isLockedItem(2020) })}>
					Don't use <Item id={2040} named plural/>, <Item id={2020} named plural/> — they do roughly 20&times; the computation of <Item id={2011} named plural/>.
					Merge belts directly and use sorters to split.
				</li>
				<li class={classNames({ 'is-locked': isLockedItem(2212) })}>
					Avoid <Item id={2205} named plural/> and <Item id={2201} named plural/> if you can help it.
					Use <Item id={2212} named plural/> over <Item id={2201} named plural/>.
					The game performs connection checks between power facilities every update.
					Fewer facilities lead to fewer checks and thus better UPS.
				</li>
				<li class={classNames({ 'is-locked': isLockedItem(2312) })}>
					[High Impact] Unfinished Dyson Shells can contribute to lag. Recommend building it one shell at a time.
				</li>
				<li class={classNames({ 'is-locked': isLockedItem(1141) })}>
					If you use <Item id={1141} named plural/> with speedup production you can use fewer buildings in your production chain.
				</li>
				<li>
					Avoid having idle facilities and sorters, as they can go into a polling state that is more computationally expensive than when they are actively in operation. For example using lower level sorters on production chains so they are less idle where it makes sense.
				</li>
				<li>
					[Low Impact] Shorter belt paths — every additional segment causes more segments.
				</li>
				<li class={classNames({ 'is-locked': isLockedItem(2013) })}>
					[Low Impact] <Item id={2012} named plural/> perform a tiny bit better than <Item id={2013} named plural/>.
				</li>
			</ul>
			<h3 class={classNames({ 'is-locked': isLockedItem(2030) })}>
				<Item id={2030} named plural/>
			</h3>
			<ul>
				<li class={classNames({ 'is-locked': isLockedItem(2030) })}>
					Alarm Monitors
					<ul>
						<li>
							Setup monitors as alarms to indicate bottlenecks between production chains. If input isn't 100% full, and/or if output isn't enough
						</li>
						<li>
							Check if you are not researching or if research speed is too slow
						</li>
					</ul>
				</li>
				<li class={classNames({ 'is-locked': isLockedItem(2030) })}>
					Beacon monitor — You can use monitors as beacons
					<ul>
						<li>
							Setup a monitor as a beacon to your mall
						</li>
						<li>
							Mark active construction zones
						</li>
					</ul>
				</li>
				<li class={classNames({ 'is-locked': isLockedItem(2030) })}>
					Sandbox mode — Your monitor can be used to 'generate items' or 'consume items' at a set rate
				</li>
			</ul>
		</main>
	);
}