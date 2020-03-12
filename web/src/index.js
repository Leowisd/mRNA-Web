import React from 'react';
import ReactDOM from 'react-dom';
import ReactRouter from './router/Router';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<ReactRouter />, document.getElementById('root'));
registerServiceWorker();


if (!window.location.host.startsWith("www")){
    window.location = window.location.protocol + "//" + "www." + window.location.host + window.location.pathname;
}