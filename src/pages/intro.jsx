import { Link } from 'react-router-dom';
import Item from '../components/item';
import Recipe from '../components/recipe';





export default function Intro(props) {
	return (
		<main class="page intro">
			<p class="desc">
				<b>DSP Ratios</b> is a calculator for Dyson Sphere Program to help you figure out how many assemblers and other buildings you need for a recipe.
			</p>
			<p class="desc">
				DSP Ratios is meant to be mobile friendly, so you can use it on your phone while playing
			</p>
			<details>
				<summary>For Example</summary>
				<div>
					{/*
						TODO: Actually calculate the below dynamically in case internal values change.
						Would be pretty neat if the user could select a different recipe example from here like a mini calculator!
					*/}
					<p>
						You want to make an assembly line that produces <span class="per">360</span> <Item id={1203} named/> per minute (<span class="per">6</span> per second).<br/>
					</p>
					<p>
						This calculator helps you figure out how many assemblers & smelters you need for the <Item id={1203} named/> (<span class="quantity">16</span>&times;), <Item id={1101} named/> (<span class="quantity">12</span>&times;), <Item id={1201} named/> (<span class="quantity">8</span>&times;) and <Item id={1202} named/> (<span class="quantity">4</span>&times;).
					</p>
					<p>
						It will also help you realise that the amount of <Item id={1101} named/> (<span class="per">720</span> per minute) that will go into your assembly line will be more than one line of <Item id={2001} named/>'s can handle (<span class="per">360</span> per minute), meaning that you'll need to upgrade that belt or have a second supply line of iron ingots.
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
			<p class="desc">
				Data last generated at <time dateTime={Meta.generatedAt}>{new Date(Meta.generatedAt).toLocaleDateString()}</time> from Dyson Sphere Program version {Meta.version}
			</p>
		</main>
	);
}