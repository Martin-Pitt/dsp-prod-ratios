import { render } from 'preact'
import { App } from './app.jsx'


if(window.location.search.startsWith('?[') && window.location.search.endsWith(']'))
{
    let [pathname, search, hash] = JSON.parse(decodeURIComponent(window.location.search.slice(1)));
    history.replaceState('', '', pathname + '?' + search + '#' + hash);
}


render(<App/>, document.getElementById('app'));
