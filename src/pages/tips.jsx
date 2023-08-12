

export default function Tips(props) {
	return (
		<main class="page tips">
			<ul>
				<li>
					Got FPS problems? Try the <a target="_blank" href="https://dsp.thunderstore.io/package/Selsion/DSPOptimizations/">DSPOptmizations mod</a>
				</li>
				<li>
					Generally you want to aim at having fewer buildings and also avoid using those that affect your UPS the most.
				</li>
				<li>
					Don't use pilers, splitters — they do roughly 20&times; computation of sorters.
					Merge belts directly and use sorters to split.
				</li>
				<li>
					Avoid Solar and Tesla Towers if you can help it. Use Satellite Substations over Tesla Towers. The game performs connection checks between power facilities every update. Fewer facilities lead to fewer checks and thus better UPS.
				</li>
				<li>
					Unfinished Dyson Shells can contribute to lag. Recommend building it one at a time.
				</li>
				<li>
					If you use proliferators set to speedup production, this can allow you to use fewer buildings in your production chain.
					On high end materials it is better to use extra products instead.
				</li>
				<li>
					Avoid having idle facilities and sorters, as they can go into a polling state that is more computationally expensive than when they are actively in operation. For example using lower level sorters on production chains so they are less idle where it makes sense.
				</li>
				<li>
					Minor optimisations:
					Shorter belt paths — every additional segment causes more segments.
					MK.II Sorters perform a tiny bit better than MK.III Sorters.
				</li>
			</ul>
		</main>
	);
}