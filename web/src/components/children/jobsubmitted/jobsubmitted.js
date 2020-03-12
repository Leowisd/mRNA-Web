import React from 'react';
import style from './jobsubmitted.module.css';

class Jobsubmitted extends React.Component {

  constructor(props){
    super(props);
    this.state = {
    
    }
  }


 handleurl = (event) => {
    let out = 'http://www.musite.net/job/'+this.props.userId+'/'+this.props.jobId //replace http://18.223.55.81:5000 with local host
    //let out = 'http://localhost:3333/job/'+this.props.userId+'/'+this.props.jobId //replace http://18.223.55.81:5000 with local host
    //console.log(this.props.model);
    window.open(out);
  }
  
  render(){
      return (
          <div className = {this.props.jobsubmit? style.fileOn : style.file}>
              <p className = {style.instruction}>Your job (ID: <b>{this.props.jobId}</b>) has been submitted, 
              which can be accessed by the following <b>URL</b> or refer to <b>USER JOB HISTORY</b>:<br /><br />
              <a id = "joburl" onClick={this.handleurl}>http://www.musite.net/job/{this.props.userId}/{this.props.jobId}</a>
              <br />
              <br />
              <span>((Your files and results will be saved on our server for 72 hours. One user is allotted to process up to 5 jobs at the same time.)</span>
              </p>
            
            <div className={style.gridcontainer}>
            <button className = {style.resubmit} onClick = {this.props.turnToUpload}>Upload another file</button>
            <button className = {style.reverse} onClick = {this.props.turnToInput}>Back to paste sequence(s)</button>
            </div>
          </div>
      );
  }
}


export default Jobsubmitted
