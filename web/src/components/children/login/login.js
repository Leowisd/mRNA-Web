import React, { Component } from 'react';
import $ from 'jquery';
import style from './login.module.css';

class Login extends React.Component {

  constructor(props){
    super(props);
    this.state = {
    }
  }


	render(){
    return (

      <div className = {this.props.reversed ? style.login : style.loginOn} >
          <p className = {style.loginError}>{this.props.loginErrorMsg}</p>
          <form className = {style.form}>
              <div className = {style.field}>
                 <input type = "email" id = "loginUser" placeholder = "Email" className = {style.input} onChange = {this.props.changeEmail} />
                 <label htmlFor = "loginUser" className = {style.label}>Email</label>
              </div>
              <div className = {style.field}>
                 <input type = "password" id = "loginPassword" placeholder = "Password" className = {style.input} onChange = {this.props.changePassword} />
                 <label htmlFor = "loginPassword" className = {style.label}>Password</label>
              </div>
              <div className = {style.form_footer}>
                 <button className = {style.btn} onClick = {this.props.handleLogin}>Log in</button>
                <span className = {style.register} onClick = {this.props.turnToRegister}>Don't have an account?</span>             
            </div>
          </form>
      </div>

  )
}
}


export default Login
