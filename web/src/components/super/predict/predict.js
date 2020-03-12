import React, { Component } from 'react';
import { type ElementConfig } from 'react';
//import EmojiIcon from '@atlaskit/icon/glyph/emoji';
import $ from 'jquery';
import style from './predict.module.css';
import File from '../../children/file/file.js';
import FileSuccess from '../../children/fileSuccess/fileSuccess.js';
import Jobsubmitted from '../../children/jobsubmitted/jobsubmitted.js';
import Textarea from '../../children/textarea/textarea.js';
import Down from '../../children/down/down.js'
//import Select, { components } from 'react-select';
import MySelect from "./MySelect.js";


const modeloptions = [
{ label: 'Phosphorylation (S,T)', value:"Phosphoserine_Phosphothreonine"},
{ label:'Phosphorylation (Y)', value:"Phosphotyrosine"},
{ label:'N-linked glycosylation (N)', value:"N-linked_glycosylation"},
{ label:'O-linked glycosylation (S,T)', value:"O-linked_glycosylation"},
{ label:'Ubiquitination (K)', value:"Ubiquitination"},
{ label:'SUMOylation (K)', value:"SUMOylation"},
{ label:'N6-acetyllysine (K)', value:"N6-acetyllysine"},
{ label:'Methylarginine (R)', value:"Methylarginine"},
{ label:'Methyllysine (K)', value:"Methyllysine"},
{ label:'Pyrrolidone carboxylic acid (Q)', value:"Pyrrolidone_carboxylic_acid"},
{ label:'S-Palmitoylation (C)', value:"S-palmitoyl_cysteine"},
{ label:'Hydroxyproline (P)',value:"Hydroxyproline"},
{ label:'Hydroxylysine (K)',value:"Hydroxylysine"},
];


class Predict extends React.Component{

	constructor(props){
		super(props);
    console.log(this.props.Rcolor)
		this.state = {
            pasted:true,//默认先展示paste 的输入数据模式
			reversed: false,//默认不展示upload页面
            reversedsubmitted: false,//默认upload的submit是空。
            //modelOptions: null
		}
	}
  

  

	render(){
        console.log(this.props.Rcolor)
		return (

                    <div className={style.content}>
		  				<h2 style={{'textAlign':'center','marginTop':'10px','font-size': '18px','font-weight': '400'}}>Submit your sequence(s)</h2>
                        <div className = {style.options}>
                            
 		  				    <div className = {this.props.reversed ? style.predict1 : style.predict2}>									
 		  					    <Textarea pasted = {this.props.pasted}
                                           /*只有下面的data传过来就会被显示了*/
                                           data = {this.props.data} 
                                           handleExample = {this.props.handleExample} 
                                           changeInput = {this.props.changeInput} 
                                           handleClick = {this.props.handlePredictSeq}
                                           Rchangekey  = {this.props.RchangekeyPre}
                                           Dchangekey  = {this.props.DchangekeyPre}
                                           Rcolor = {this.props.Rcolor}
                                           Dcolor = {this.props.Dcolor}
                                           turnToUpload = {this.props.turnToUpload}/>
 		  					    <File  reversed = {this.props.reversed} onDrop = {this.props.onDrop} turnToInput = {this.props.turnToInput}/>
                                <FileSuccess reversed = {this.props.reversed} recievedfile= {this.props.recievedfile} reversedsubmitted = {this.props.reversedsubmitted} uploadpredict = {this.props.uploadpredict} turnToInput = {this.props.turnToInput} turnToUpload = {this.props.turnToUpload}/>
 		  				        <Jobsubmitted jobsubmit = {this.props.jobsubmit} 
                                               turnToInput = {this.props.turnToInput} 
                                               turnToUpload = {this.props.turnToUpload} 
                                               jobId = {this.props.jobId} 
                                               userId = {this.props.userId} 
                                               modelOptions = {this.props.modelOptions}/>
                              </div>
                            
		                </div>
                    </div>


		)
	}	
}


export default Predict


//  <div className = {style.options}>
//      <div className={style.button}>Please select a prediction model:
//      </div>
//      <div className= {style.select}>
//          <MySelect isMulti  
//              options={modeloptions} 
//              closeMenuOnSelect={true}  
//              value = {this.props.modelOptions} 
//              defaultValue={[modeloptions[0]]}  
//              onChange = {this.props.changeModel}
//              allowSelectAll={true}
//              />
//      </div>
//  </div>

