import { Link } from "react-router-dom";


export default function Intro(props) {
	return (
		<main class="page intro">
			<p class="desc">
				<b>DSP Ratios</b> is a tool to help you figure out how many buildings you need.
			</p>
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