import { Link } from "react-router-dom";


function Icon(props) {
	let item = Items.find(item => item.id === props.id);
	return <span class="item icon" data-icon={`item.${item.id}`} title={item.name}/>
}


export default function Intro(props) {
	return (
		<main class="page intro">
			<p class="desc">
				<b>DSP Ratios</b> is a calculator for Dyson Sphere Program to help you figure out how many assemblers and other buildings you need for a recipe.
			</p>
			<details>
				<summary>For Example</summary>
				<div>
					<p>
						You want to make an assembly line that produces <span class="per">180</span> <Icon id={1203}/> Electric Motors per minute (<span class="per">3</span> per second).<br/>
					</p>
					<p>
						This calculator helps you figure out how many assemblers & smelters you need for the <Icon id={1203}/> Electric Motors (<span class="quantity">8</span>&times;), <Icon id={1101}/> Iron Ingots (<span class="quantity">6</span>&times;), <Icon id={1201}/> Gears (<span class="quantity">4</span>&times;) and <Icon id={1202}/> Magnetic Coils (<span class="quantity">2</span>&times;).
					</p>
					<p>
						It will also help you realise that the amount of <Icon id={1101}/> Iron Ingots (<span class="per">360</span> per minute) that will go into your assembly line will be more than one line of <Icon id={2001}/> Conveyor Belt MK.I's can handle (<span class="per">300</span> per minute), meaning that you'll need to upgrade that belt or have a second supply line of iron ingots.
					</p>
				</div>
			</details>
			<ul class="tiles">
				<li class="tile">
					<p>
						<b>Started a new game?</b> Avoid spoilers by setting your current progress in&nbsp;<Link className="link" to="/research">Research</Link>
					</p>
				</li>
				<li class="tile">
					<p>
						Need the production ratios for a recipe? Let the <Link className="link" to="/calculator">Calculator</Link> help&nbsp;you
					</p>
				</li>
				<li class="tile">
					<p>
						Just looking for a quick reference? See the <Link className="link" to="/reference">Quick&nbsp;Reference&nbsp;Sheets</Link>
					</p>
				</li>
				<li class="tile">
					<p>
						Spotted any issues? Check the <a class="link external-link" target="_blank" href="https://github.com/Martin-Pitt/dsp-prod-ratios/issues">github&nbsp;project</a>
					</p>
				</li>
			</ul>
			<p>
				DSP Ratios is meant to be mobile friendly, so you can use it on your phone while playing
			</p>
		</main>
	);
}