
function Link({ name, href }) {
	let url = new URL(href);
	return (
		<li class="links__item">
			<a class="links__link" target="_blank" rel="noreferrer" href={href}>
				<div class="links__name">{name}</div>
				<div class="links__url">
					<span class="hostname">{url.hostname}</span><span class="pathname">{url.pathname.replace(/\/$/, '')}</span>
				</div>
			</a>
		</li>
	);
}

export default function Community(props) {
	return (
		<main class="page community">
			<div class="page-content">
				<h2>Communities</h2>
				<ul class="links">
					{[
						{
							name: 'Official DSP Discord',
							href: 'https://discord.com/servers/dyson-sphere-program-750553061369577492',
						},
						{
							name: 'Official DSP Subreddit',
							href: 'https://reddit.com/r/Dyson_Sphere_Program/',
						},
						{
							name: 'Japanese Discord',
							href: 'https://discord.com/invite/4WVRQnUcr6',
						},
					].map(link => <Link {...link}/>)}
					
					{/*
						Modding Discord
						
						Translation Discord
						
						Wiki Discord
						
						Nebula Multiplayer Mod Discord
						https://discord.gg/UHeB2QvgDa
						
						Genesis Book Discord
						
						Galactic Scale Mod Discord
						
						Steam Community
						https://steamcommunity.com/app/1366540/discussions
					</li> */}
				</ul>
				
				<h2>Wiki</h2>
				<ul class="links">
					{[
						{
							name: 'English DSP Wiki',
							href: 'https://dsp-wiki.com/',
						},
						{
							name: 'Chinese DSP Wiki',
							href: 'https://wiki.biligame.com/dsp/',
						},
						{
							name: 'Japanese DSP Wiki',
							href: 'https://wikiwiki.jp/dsp/',
						},
					].map(link => <Link {...link}/>)}
				</ul>
				
				<h2>Tools</h2>
				<ul class="links">
					{[
						{
							name: 'Dyson Sphere Blueprints',
							href: 'https://www.dysonsphereblueprints.com/',
						},
						{
							name: 'FactorioLab',
							href: 'https://factoriolab.github.io/list?s=dsp&v=9',
						},
						{
							name: 'DSP Quantization Tool',
							href: 'https://dsp-calc.pro/',
						},
						{
							name: 'DSP Seed Finder',
							href: 'https://doubleuth.github.io/DSP-Seed-Finder/',
						},
						{
							name: 'Eurydia\'s DSP Production Calculator',
							href: 'https://eurydia.github.io/project-dsp-calculator/',
						},
						{
							// name: 'tohalukmanhakim\'s Dyson Sphere Program Helper (Veins Utilisation &amp; Logistics Carrier Engine stats)',
							name: 'Dyson Sphere Program Helper (VU & Logi speed calc)',
							href: 'https://tohalukmanhakim.github.io/dyson-sphere-program-helper/',
						},
						{
							name: 'DSP Mall Analyzer (Beta)',
							href: 'https://dsp-mall-analyzer-beta.netlify.app/',
						},
					].map(link => <Link {...link}/>)}
				</ul>
				
				{/* 
					Out of date, doesn't work or taken out of curation
					<li>
						Dyson Sphere Planner — Printable recipes
						<a target="_blank" rel="noreferrer" href="https://dyson-sphere-planner.com/">https://dyson-sphere-planner.com/</a>
					</li>
					<li>
						Migiyubi's Dyson Sphere Program Ingredients Sheet
						<a target="_blank" rel="noreferrer" href="https://migiyubi.github.io/dsp-balance/">https://migiyubi.github.io/dsp-balance/</a>
					</li>
					<li>
						Luwa's Dyson Sphere Program production tool
						<a target="_blank" rel="noreferrer" href="https://github.com/luwake/dyson">https://github.com/luwake/dyson</a>
					</li>
					<li>
						Svlik's DSP Mass Production Calculator Tool
						<a target="_blank" rel="noreferrer" href="https://www.svlik.com/t/dsq/">https://www.svlik.com/t/dsq/</a>
					</li>
					<li>
						AnthorNet's DSP Calculator Production Planner
						<a target="_blank" rel="noreferrer" href="https://dyson-calculator.com/en/production-planner">https://dyson-calculator.com/en/production-planner</a>
					</li>
					<li>
						KirkMcDonald's DSP-Calculator with Sankey Flow diagram
						<a target="_blank" rel="noreferrer" href="https://yesterdaysun.gitee.io/dsp-calculator/#tab=about">https://yesterdaysun.gitee.io/dsp-calculator/#tab=about</a>
					</li>
					<li>
						Petra's Center Brain Archive — Recipe viewer for Dyson Sphere Program
						<a target="_blank" rel="noreferrer" href="https://gamma-delta.github.io/center-brain-archive/">https://gamma-delta.github.io/center-brain-archive/</a>
					</li>
					<li>
						Dyson Sphere Program Cheat Sheet
						<a target="_blank" rel="noreferrer" href="https://deniszholob.github.io/dyson-sphere-program-cheat-sheet/">https://deniszholob.github.io/dyson-sphere-program-cheat-sheet/</a>
					</li>
					<li>
						Dyson Sphere Program Dependency Graph
						<a target="_blank" rel="noreferrer" href="https://olivercardoza.com/dyson-sphere-graphviz/">https://olivercardoza.com/dyson-sphere-graphviz/</a>
					</li>
					<li>
						art0rz's Dyson Sphere Program Calculator
						<a target="_blank" rel="noreferrer" href="https://art0rz.github.io/dsp-calc/">https://art0rz.github.io/dsp-calc/</a>
					</li>
				*/}
			</div>
		</main>
	);
}