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
				Performance
			</h3>
			<ul>
				<li>
					Got FPS problems? Try the <a target="_blank" href="https://dsp.thunderstore.io/package/Selsion/DSPOptimizations/">DSPOptmizations mod</a>
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
					Unfinished Dyson Shells can contribute to lag. Recommend building it one shell at a time.
				</li>
				<li class={classNames({ 'is-locked': isLockedItem(1141) })}>
					If you use <Item id={1141} named plural/> with speedup production you can use fewer buildings in your production chain.
				</li>
				<li>
					Avoid having idle facilities and sorters, as they can go into a polling state that is more computationally expensive than when they are actively in operation. For example using lower level sorters on production chains so they are less idle where it makes sense.
				</li>
				<li>
					Shorter belt paths — every additional segment causes more segments.
				</li>
				<li class={classNames({ 'is-locked': isLockedItem(2013) })}>
					<Item id={2012} named plural/> Sorters perform a tiny bit better than <Item id={2013} named plural/>.
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