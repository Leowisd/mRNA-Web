import React, { Component } from 'react';
import { 
  Route, 
  BrowserRouter,
  HashRouter, 
  Switch, 
  Redirect 
} from 'react-router-dom'; 
import { lifecycle } from 'react-router';
import Main from '../main';
import Job from '../job';
import Table3D from '../show3dtable';

//React的路由，不同规则的path对应不同的组件
const ReactRouter = () => (
  <BrowserRouter>
  	<div>
      <Route exact path = "/" component = { Main }/>
      <Route path = "/job/:UserID/:JobID" component = { Job }/>
      <Route path = "/show3dtable/:show3dID" component = { Table3D }/>
    </div>
  </BrowserRouter>
);




export default ReactRouter;
