import React, { Component } from 'react';
import $ from 'jquery';
import style from './register.module.css';

class Register extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      error: false,
      errorMsg: ""
    }
  }

  render(){
    return (

      <div className = {this.props.reversed ? style.registerOn : style.register} >
          <p className = {style.registerError}>{this.props.registerErrorMsg}</p>
          <form className = {style.form}>
              <div className = {style.field}>
                 <input type = "email" id = "registerUser" placeholder = "Email" className = {style.input} onChange = {this.props.changeEmail} />
                 <label htmlFor = "registerUser" className = {style.label}>Email</label>
              </div>
              <div className = {style.field}>
                 <input type = "password" id = "registerPassword" placeholder = "Password" className = {style.input} onChange = {this.props.changePassword} />
                 <label htmlFor = "registerPassword" className = {style.label}>Password</label>
              </div>
              <div className = {style.field}>
                 <input type = "password" id = "registerConfirm" placeholder = "Re-enter password" className = {style.input} onChange = {this.props.changeConfirm} />
                 <label htmlFor = "registerConfirm" className = {style.label}>Confirm</label>
              </div>     
              <div className = {style.form_footer}>
                 <button className = {style.btn} onClick={this.props.handleRegister}>Register</button>
                <button className = {style.login} onClick = {this.props.turnToLogin}>Already have an account?</button>                        
            </div>
          </form>
      </div>

  )
}

}


export default Register
