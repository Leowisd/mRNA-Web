import React from 'react';
import style from './file.module.css';
import Dropzone from 'react-dropzone';
import img from './img/upload.png'

class File extends React.Component {

  constructor(props){
    super(props);
    this.state = {

    }
  }

  render(){
      return (
          <div className = {this.props.reversed ? style.fileOn : style.file}>
            <Dropzone className = {style.dropzone} multiple = {false} onDrop={this.props.onDrop}>
              <img src = {img} />
              <p className = {style.instruction}>Drop the file here or click to upload (only support the FASTA format).
                <br />
              <span>(Your files and results will be saved on our server for 72 hours. One user is allotted to process up to 5 jobs at the same time.)</span>
              </p>
            </Dropzone>
            <button className = {style.reverse} onClick = {this.props.turnToInput}>Back to paste input sequence(s)</button>
          </div>
      );
  }
}


export default File


