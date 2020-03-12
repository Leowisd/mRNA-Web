import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import style from './warning.module.css';

class Warning extends Component {

  constructor(props){
    super(props);
    this.state = {

    }
  }
  render(){
    let item = (
          <div ref = "warning" className = {this.props.showWarning ? style.warning : style.warningHide}>
            <div className = {style.icon} style = {this.props.warningRed ? {display: ''} : {display: 'none'}}>
              <FontAwesomeIcon icon={faTimesCircle} size = "2x" color = "Tomato"/>
            </div>
            <div className = {style.icon} style = {this.props.warningRed ? {display: 'none'} : {display: ''}}>
              <FontAwesomeIcon icon={faTimesCircle} size = "2x" color = "Green"/>
            </div>
            <div className = {style.note}>
              <p>
                {this.props.warning}
              </p>
            </div>
          </div>      
    )
    return(
        <div>
          {item}
        </div>
    )
  }

}
export default Warning
