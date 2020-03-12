import React, { Component } from 'react';
import $ from 'jquery';
import style from './textarea.module.css';

class Textarea extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      datakind:'',
    }
    this.handleChange=this.handleChange.bind(this);
  }

  handleChange(event){
    this.setState({
      datakind:event.target.value,
      })
  }

	render(){
    console.log(this.props.Rcolor)
      return (
          <div className = {this.props.pasted ?  style.textareaOn : style.textarea}>
	          <div className = {style.holder}>
	          	<div className = {style.instruction}>
	          	Paste input FASTA sequence(s) (up to 10 sequences or 5000 residues in total) in the area below:<button className = {style.example} onClick = {this.props.handleExample}>Load example FASTA</button>
	          	</div>
              <div>
                <label className={style.container}>
                  <input type="radio" name="datakind" value="0"   onChange={this.handleChange}/>TestRNA
                  <span className={style.checkmark}></span>
                </label>
                <br/>
                <label className={style.container}>
                  <input type="radio" name="datakind" value="1"   onChange={this.handleChange}/>TestDNA
                  <span className={style.checkmark}></span>
                </label>
                <div>TestDataKind:{this.state.datakind}</div>
              </div>
	          	<textarea autoFocus spellCheck="false" value = {this.props.data} placeholder = ">sp..."  onChange = {this.props.changeInput}></textarea>
                <div className = {style.instructionupload}>
                   For larger job,<button className = {style.example} onClick = {this.props.turnToUpload}>upload a FASTA file</button>
                </div>
                <div>
                <div className={style.buttonin}>
                   <button className = {style.submit} onClick = {this.props.handleClick}>Start prediction</button>
	            </div>
                </div>
              </div>
          </div>
      );
	}
}


export default Textarea