import classNames from 'classnames';
import state from '../state';
import Item from '../components/item';
import Tech from '../components/tech';
import { AssemblerProductionSpeed } from '../lib/data';



function isLockedItem(...ids) {
	return !state.showHiddenUpgrades.value && ids.some(id => !state.itemsUnlockedSet.value.has(id));
}

function onHideSpoilers(event) {
	state.showHiddenUpgrades.value = !event.target.checked;
}


export default function Tips(props) {
	return (
		<main class="page tips">
			<div class="page-content">
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
						Keep in mind that the <Item id={2303} named/> production speed is <span class="quantity">{AssemblerProductionSpeed.get(2303)}x</span>
					</li>
					<li>
						It is essential to automate all your buildings as soon as they are unlocked. Get away from handcrafting, DSP is more focused on automation.
						An area that automates your buildings is what we call a Mall.
					</li>
					<li>
						Aim to produce at least <span class="per">1 per second</span> of each research matrix.
					</li>
					<li>
						<Item id={1011} named/> is an important rare resource. Most commonly you will find gas giants that produce <Item id={1011} name/>, or you can find <Item id={1011} name/> veins on some planets.
					</li>
					<li>
						Second most important is <Item id={1116} named/>. You can find some planets that have <Item id={1116} name/> oceans, which you can use a Water Pump on to gather the <Item id={1116} name/>.
					</li>
					<li class={classNames({ 'is-locked': isLockedItem(2030, 1131) })}>
						<span>
							Getting lost? <span class={classNames({ 'is-locked': isLockedItem(2030) })}>You can misuse <Item id={2030} named plural/> as beacons (see below).</span>
							<span class={classNames({ 'is-locked': isLockedItem(1131) })}>Use <Item id={1131} named plural/> to paint lines or zones that can be seen from afar or when quickly popping into orbit.</span>
						</span>
					</li>
					<li>
						How you play the game is up to you! But for a general outline of what game progression can be like:
						<ul>
							<li>
								Beginning — Belt Spaghetti, Early Mall<br/>
								Your belts are a mess, factories spot the landscape as you avoid the terrain. It's a good idea to start an early mall — a factory complex that slowly produces the essentials and all the buildings for you
							</li>
							<li>
								Mid Game — <abbr title="Planetary Logistics Station">PLS</abbr>, Big Mall, Modularising Factory<br/>
								Everything changes when you unlock <Tech id={1604} named/>. You want to unlock this as soon as possible. This stage is when you can remove the older factory and start rebuilding everything as modules or blocks around your logistic stations for input and output. You can then turn these modules into blueprints.
							</li>
							<li>
								Late Game — PLS, <abbr title="Interstellar Logistics Station">ILS</abbr>, Orbital Collectors, Heavy blueprint usage<br/>
								As you expand across planets and building an interstellar empire, you will find yourself designing your own blueprints.
							</li>
							<li>
								End Game — <Tech id={1508} named/><br/>
								Research deep into <Tech id={3606} named/> to extend your resources and conquer all the stars.
							</li>
						</ul>
					</li>
					<li>
						The belt bus layout does not work well in Dyson Sphere Program, compared to Factorio. You will want to use PLS/ILS.
					</li>
					<li class={classNames({ 'is-locked': isLockedItem(2103) })}>
						<span>
							Instead of using several <Item id={2020} named plural/>, you can use a single <Item id={2103} named/>{isLockedItem(2104)? null : <> or <Item id={2104} named/></>} set to storage to act as big <Item id={2020} named/> with multiple outputs. This can save a lot of space compared to complex belt layouts and cut down on buildings.
						</span>
					</li>
				</ul>
				<h3>
					Performance
				</h3>
				<p>
					Performance in early to mid or late game shouldn't be a problem.
					These tips generally apply once you reach a scale where you start making dyson spheres towards the end game and beyond.
					Bottlenecks are either your <abbr title="Frames Per Second — How many times your graphics card renders the screen">FPS</abbr> or <abbr title="Units Per Second — How often the game does all the calculations to simulate the world">UPS</abbr>.
				</p>
				<ul>
					<li>
						Got FPS problems? Try the <a class="link external-link" target="_blank" rel="noreferrer" href="https://dsp.thunderstore.io/package/Selsion/DSPOptimizations/">DSPOptmizations</a> and <a class="link external-link" target="_blank" rel="noreferrer" href="https://dsp.thunderstore.io/package/starfi5h/AlterTickrate/">AlterTickRate</a> mods
					</li>
					<li>
						Generally you want to aim at having fewer buildings and also avoid using those that affect your UPS the most.
						<ul>
							<li class={classNames({ 'is-locked': isLockedItem(2020) })}>
								<span>
									Don't use <Item id={2040} named plural/>, <Item id={2020} named plural/> — they do roughly <span class="per">20&times;</span> the computation of <Item id={2011} named plural/>.
									Instead merge belts directly and use sorters to split.
								</span>
							</li>
							<li class={classNames({ 'is-locked': isLockedItem(2212) })}>
								<span>
									Avoid <Item id={2205} named plural/> and <Item id={2201} named plural/> if you can help it.
									Use <Item id={2212} named plural/> over <Item id={2201} named plural/>.
									The game performs connection checks between power facilities every update.
									Fewer facilities lead to fewer checks and thus better UPS.
								</span>
							</li>
						</ul>
					</li>
					<li class={classNames({ 'is-locked': isLockedItem(2312) })}>
						<span>
							Unfinished Dyson Shells can contribute to lag. Recommend building it one shell at a time.
						</span>
					</li>
					<li class={classNames({ 'is-locked': isLockedItem(1141) })}>
						<span>
							If you use proliferators set to speedup production you can use fewer buildings in your production chain.
						</span>
					</li>
					<li>
						Avoid having idle facilities and sorters, as they can go into a polling state that is more computationally expensive than when they are actively in operation. For example using lower level sorters on production chains so they are less idle where it makes sense.
					</li>
					<li>
						[Low Impact] Shorter belt paths — every additional segment causes more segments.
					</li>
					<li class={classNames({ 'is-locked': isLockedItem(2013) })}>
						<span>
							[Low Impact] <Item id={2012} named plural/> perform a tiny bit better than <Item id={2013} named plural/>.
						</span>
					</li>
				</ul>
				<h3 class={classNames({ 'is-locked': isLockedItem(2030) })}>
					<span><Item id={2030} named plural/></span>
				</h3>
				<ul>
					<li class={classNames({ 'is-locked': isLockedItem(2030) })}>
						<span>Alarm Monitors</span>
						<ul>
							<li>
								<span>Setup monitors as alarms to indicate bottlenecks between production chains. If input isn't 100% full, and/or if output isn't enough</span>
							</li>
							<li>
								<span>Check if you are not researching or if research speed is too slow</span>
							</li>
						</ul>
					</li>
					<li class={classNames({ 'is-locked': isLockedItem(2030) })}>
						<span>Beacon monitor — You can use monitors as beacons</span>
						<ul>
							<li>
								<span>Setup a monitor as a beacon to your mall</span>
							</li>
							<li>
								<span>Mark active construction zones</span>
							</li>
						</ul>
					</li>
					<li class={classNames({ 'is-locked': isLockedItem(2030) })}>
						<span>Sandbox mode — Your monitor can be used to 'generate items' or 'consume items' at a set rate</span>
					</li>
				</ul>
			</div>
		</main>
	);
}