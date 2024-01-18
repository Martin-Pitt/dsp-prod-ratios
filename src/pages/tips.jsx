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
				{state.research.value.length? (<p>
					<label class="spoilers">
						Hide items/buildings not researched: <input type="checkbox" checked={!state.showHiddenUpgrades.value} onInput={onHideSpoilers}/>
					</label>
				</p>) : null}
				
				<p>
					Remember to <a class="link external-link" target="_blank" rel="noreferrer" href="https://docs.google.com/document/d/16dKGU5dfRpUtI2dtEJnBiUps4ccdzQnFscYnl93Q7v8/edit#heading=h.vj0x2ei0tuq6">check out <b>DSP for Dummies</b> as well, which has it's own tips section</a>.
				</p>
				
				{/*
					Beginner tips section?
					https://www.reddit.com/r/Dyson_Sphere_Program/comments/18xyqe1/new_player_looking_for_advice_that_doesnt_ruin/
				*/}
				
				<h3>
					Gameplay
				</h3>
				<ul>
					<li>
						<Item id={2303} named/> production speed is <span class="quantity">{AssemblerProductionSpeed.get(2303)}x</span> rather than <span class="quantity">1x</span>
					</li>
					<li>
						It is essential to automate the crafting of buildings as they are unlocked. An area that automates items for you is what we call a Mall.
					</li>
					<li>
						Aim to produce at least <span class="per">1 per second</span> of each research matrix.
					</li>
					{/* <li>
						<Item id={1011} named/> is an important rare resource. Most commonly you will find gas giants that produce <Item id={1011} name/>, or you can find <Item id={1011} name/> veins on some planets.
					</li>
					<li>
						Second most important is <Item id={1116} named/>. You can find some planets that have <Item id={1116} name/> oceans, which you can use a Water Pump on to gather the <Item id={1116} name/>.
					</li> */}
					<li class={classNames({ 'is-locked': isLockedItem(2030, 1131) })}>
						<span>
							Getting lost? <span class={classNames({ 'is-locked': isLockedItem(2030) })}>You can misuse <Item id={2030} named plural/> as beacons (see below).</span>
							<span class={classNames({ 'is-locked': isLockedItem(1131) })}> Use <Item id={1131} named plural/> to paint lines or zones that can be seen from afar or from orbit.</span>
						</span>
					</li>
					<li>
						How you play the game is up to you! Here are the general stages of a game:
						<ul>
							<li>
								Beginning — Belt Spaghetti, Early Mall<br/>
								Your belts and your factory will be a mess and that is ok. You will rebuild your factory later.
								It's a good idea to start your mall — this is a factory complex that slowly produces all the buildings &amp; items you need. <span class={classNames({ 'is-locked': isLockedItem(2313) })}>Start spraying <Item id={1141} named/> to help with complex products.</span>
							</li>
							<li>
								Mid Game — <abbr title="Planetary Logistics Station">PLS</abbr>, Bigger Mall, Factory can be built in modules<br/>
								Everything changes when you unlock <Tech id={1604} named/>. You want to unlock this as soon as possible. This stage is when you can remove the older factory and start rebuilding everything as modules or blocks around your logistic stations for input and output. You can then turn these modules into blueprints. <span class={classNames({ 'is-locked': isLockedItem(2313) })}>Use proliferator on intermediate products.</span>
							</li>
							<li>
								Late Game — PLS, <abbr title="Interstellar Logistics Station">ILS</abbr>, Orbital Collectors, Heavy blueprint usage<br/>
								As you expand across planets and building an interstellar empire, you will find yourself designing your own blueprints. <span class={classNames({ 'is-locked': isLockedItem(2313) })}>If you have proliferator to spare you can use it on raw materials as well.</span> You can start building Dyson Swarms and then Dyson Spheres.
							</li>
							<li>
								End Game — <Tech id={1508} named/><br/>
								Research deep into <Tech id={3606} named/> (&ge;Lv70), to extend your rarest resources like <Item id={1016} named plural/>, and conquer the stars.
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
					<li>
						Watch out for grid crush! Since the building grid is overlaid on a sphere, the square grid compresses towards the poles. Buildings can collide in these compressed areas which can prevent you from pasting a blueprint.
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
							Unfinished Dyson Shells can contribute to a lot of lag. Recommend building it one shell at a time.
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
					<li>
						There have been issues reported with the drivers of nvidia graphics cards
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