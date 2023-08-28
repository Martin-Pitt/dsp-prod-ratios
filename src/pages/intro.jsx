import { useState, useEffect } from 'preact/hooks';
import { Link } from 'preact-router/match';
import Item from '../components/item';
import Recipe from '../components/recipe';
import { BeltTransportSpeed } from '../lib/data';
import classNames from 'classnames';



export default function Intro(props) {
	const news = state.news.value;
	
	return (
		<main class="page intro">
			<div class="page-content">
				<h2>
					About DSP Ratios
				</h2>
				<p class="desc">
					<b>DSP Ratios</b> is an unofficial calculator for <a class="link external-link" target="_blank" rel="noreferrer" href="https://store.steampowered.com/app/1366540/Dyson_Sphere_Program/">Dyson Sphere Program</a> (DSP) to help you plan and design production lines, to provide the best tools COSMO can afford to build massive-scale automated production lines.
				</p>
				
				{/* <h3>{news.title}</h3>
				<p class="news-description">{news.description}</p> */}
				
				<article
					class={classNames('news', { 'is-loading': !news, 'is-snippet': news?.item.snippet, 'is-new': news?.item.isNew })}
					style={{ '--image': news && `url("${news.item?.titleImage}")` }}
				>
					{news? (
						<>
							<header className="news-header">
								<h3 class="news-title" data-new={news.item.isNew? 'SINCE LAST VISIT' : null}>{news.item.title}</h3>
								<div class="news-header-edge"/>
							</header>
							<div class="news-article">
								<p class="news-content" dangerouslySetInnerHTML={{ __html: news.item.snippet || news.item.description }}/>
								<a class="read-more external-link" target="_blank" rel="noreferrer" href={news.item.link}>Read More</a>
								<p class="news-meta">
									NEWS POSTED <time class="news-pubdate" dateTime={news.item.pubDate.toJSON()}>{news.item.pubDate.toLocaleDateString(navigator.languages, { dateStyle: 'full' })}</time> by <address class="news-author">{news.item.author}</address>
								</p>
								{/* <address class="news-author">{news.item.author}</address>
								<time class="news-pubdate" dateTime={news.item.pubDate.toJSON()}>{news.item.pubDate.toLocaleDateString()}</time> */}
							</div>
						</>
					) : (
						<>
							<header className="news-header">
								<h3 class="news-title"/>
								<div class="news-header-edge"/>
							</header>
							<div class="news-article">
								<div class="tbp-loader"/>
							</div>
						</>
					)}
				</article>
				
				<h3>
					Quicklinks
				</h3>
				
				<ul class="tiles">
					<li class="tile tile--research">
						<p>
							<b>Started a new game?</b> Avoid spoilers by setting your current progress in&nbsp;<Link class="link" href="/research">Research</Link>
						</p>
					</li>
					<li class="tile tile--calculator">
						<p>
							Need the production ratios for a recipe? Let the <Link class="link" href="/calculator">Calculator</Link> help&nbsp;you
						</p>
					</li>
					<li class="tile tile--reference">
						<p>
							Just looking for a quick reference? See the <Link class="link" href="/reference">Quick&nbsp;Reference&nbsp;Sheets</Link>
						</p>
					</li>
					<li class="tile tile--github">
						<p>
							Spotted any issues? Check the <a class="link external-link" target="_blank" rel="noreferrer" href="https://github.com/Martin-Pitt/dsp-prod-ratios/issues">github&nbsp;project</a>
						</p>
					</li>
					<li class="tile tile--dummies">
						<p>
							Learn all the basics, tips & tricks and best practices — <a class="link external-link" target="_blank" rel="noreferrer" href="https://docs.google.com/document/d/16dKGU5dfRpUtI2dtEJnBiUps4ccdzQnFscYnl93Q7v8/edit">DSP for Dummies</a>
						</p>
					</li>
					
					{/* <li class="tile tile--translate">
						<p>
							Translate me to different languages! See <a class="link external-link" target="_blank" rel="noreferrer" href="…">translations</a>
						</p>
					</li> */}
					<li class="tile tile--discord">
						<p>
							Got any questions? Ask the <a class="link external-link" target="_blank" rel="noreferrer" href="https://discord.com/servers/dyson-sphere-program-750553061369577492">Discord</a>
						</p>
					</li>
					<li class="tile tile--reddit">
						<p>
							See what's new on <a class="link external-link" target="_blank" rel="noreferrer" href="https://reddit.com/r/Dyson_Sphere_Program/">r/Dyson_Sphere_Program</a>
						</p>
					</li>
				</ul>
				
				<h2>
					Calculator
				</h2>
				
				<p class="desc">
					The calculator for DSP Ratios lets you pick from recipes for items or buildings and the desired amount of facilities or the throughput (items produced per minute/second).
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
				
				<p class="desc">
					This app uses a <span class="quantity">blue</span>/<span class="per">green</span> colour syntax to help distinguish between <span class="quantity highlight">quantities/amounts</span> and <span class="per highlight">throughputs/time</span>.<br/>
					<br/>
					E.g.<br/>
					There are 4&times; <Item id={2201} name/>s: <Item id={2201} count={4}/><br/>
					The <Item id={2001} name/> can move <span class="per">{BeltTransportSpeed.get(2001)}</span> items per minute: <Item id={2001} per={BeltTransportSpeed.get(2001)}/>
				</p>
				
				<hr/>
				
				<p class="desc">
					Data last generated at <time class="per" dateTime={Meta.generatedAt}>{new Date(Meta.generatedAt).toLocaleDateString()}</time> from Dyson Sphere Program version <span class="quantity">{Meta.version}</span>
				</p>
				<p class="desc">
					DSP Ratios is meant to be mobile friendly, so you can use it on your phone while playing.
				</p>
				<p class="credits">
					Handmade with 💜 by Nexii  |  2023<br/>
					<br/>
					Data and assets from Dyson Sphere Program are the intellectual property of Youthcat Studio.<br/>
					Additional assets obtained through The Noun Project with a Royalty-Free License.
				</p>
			</div>
		</main>
	);
}