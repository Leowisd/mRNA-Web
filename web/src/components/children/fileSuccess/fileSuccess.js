import React, { Component } from 'react';
import $ from 'jquery';
import style from './fileSuccess.module.css';

class FileSuccess extends React.Component {

  constructor(props){
    super(props);
    this.state = {
    
    }
  }

  render(){
      return (
          <div className = {this.props.reversedsubmitted? style.fileOn : style.file}>
              <p className = {style.instruction}>{this.props.recievedfile} has been uploaded. <br />
                 Click the <b>Start prediction</b> button to submit the job.
                <br />
              <span>((Your files and results will be saved on our server for 72 hours. One user is allotted to process up to 5 jobs at the same time.)</span>
              </p>
            
            <button className = {style.resubmit} onClick = {this.props.turnToUpload}>Upload another file</button>
            <button className = {style.reverse} onClick = {this.props.turnToInput}>Back to paste sequence(s)</button>
            <button className = {style.submit} onClick = {this.props.uploadpredict}>Start prediction</button>
          </div>
      );
  }
}


export default FileSuccess
