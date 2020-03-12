import React, { Component } from 'react';
import swal from 'sweetalert';
import $ from 'jquery';
import Header from './components/super/header/header';
import Footer from './components/super/footer/footer';
import style from './show3dtable.module.css';
//import Helmet from "react-helmet";
import {Stage}  from "ngl";
import {Selection}  from "ngl";


class Display3D extends Component {

	constructor(props){
		super(props);
		this.state = {
            NGL: null
	  }
  }
  
  goToHomePage = () => {
    window.open("http://www.musite.net:3333");
  }
  
  
  showngl = () =>{
        let url = "rcsb://"+this.props.match.params.pdb;
        console.log("in display3d url "+url);
        let selection = this.props.match.params.sele.replace(/%20/g,' ');
        console.log("in display3d selection "+selection);
        let position = this.props.match.params.position.replace(/%20/g,' ');
        let queryPlist=position.split(" ");
        let labelText = {};
        //const NGL = window.NGL;
        let selectionObject = new Selection(selection);
        var stage = new Stage("viewport");
        let index=0;
        stage.loadFile(url).then( function( o ){
            //o.structure.eachAtom(function(atomProxy) {
            //    // if you don't want a label and can't be more specific with the selection
            //    // set `labelText[atomProxy.index] = ""`
            //    labelText[atomProxy.index] = queryPlist[index]  //"Hello " + atomProxy.qualifiedName();
            //    console.log(atomProxy.index);
            //    index+=1;
            //}, 
            //selectionObject);
            
            if(position.length>0)
            {
            var ap = o.structure.getAtomProxy()
               o.structure.eachResidue(function (rp) {
               ap.index = rp.atomOffset + Math.floor(rp.atomCount / 2)
               var elm = document.createElement("div")
               elm.innerText = queryPlist[index];
               elm.style.color = "red"
               elm.style.backgroundColor = "white"
               elm.style.padding = "1px"
               o.addAnnotation(ap.positionToVector3(), elm)
               index+=1;
             }, selectionObject)
             }
            
            o.addRepresentation( "cartoon",  {colorScheme: "residueindex", opacity: 0.7});
            if(position.length>0)
            {
            o.addRepresentation("licorice", {sele: selection, scale: 2.0})
            //o.addRepresentation( "ball+stick", {sele: selection, radius: 0.5 } );
            //o.addRepresentation( "ball", { color: "red", sele: selection, radius: 0.2 } );
            o.addRepresentation( "label",  { sele: selection, labelType: "text", labelText:labelText, color: "green"});
        	}
            o.autoView();
        	});
    }
  
  componentDidMount = () => {
    }
  componentWillUnmount () {
  // It's necessary to do this otherwise the interval
  // will be executed even if the component is not present anymore. 
  }
	render(){
        
		return (
			<div className = {style.job}>
			<header>
                <div className = {style.home}>
                  <a href = "http://128.206.116.170:3333">MUSITEDEEP HOME</a>
                </div>
            </header>
        <body id="viewport" style="margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden;">
        <div className = {style.text}>
		   <p>
			Matched protein 3D structures for: <b>{this.props.match.params.url}</b>
           </p>
         </div>
    <div  style="width: 100%; height: 100%;">{this.showngl}</div>
        </body>
        </div>
		);
	}
}


export default Display3D
