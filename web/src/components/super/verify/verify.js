import React, { Component } from 'react';
import $ from 'jquery';
import style from './verify.module.css';
import Login from '../../children/login/login.js';
import Register from '../../children/register/register.js';
import Down from '../../children/down/down.js'

class Verify extends React.Component{

	constructor(props){
		super(props);
		this.state = {
			reversed: false,
		}
	}

	turnToLogin = e => {
		e.preventDefault();
		this.setState({
			reversed: false
		})
	}

	turnToRegister = e => {
		e.preventDefault();
		this.setState({
			reversed: true
		})
	}

	render(){
		return (

			<div ref = "verify" className = {this.props.showVerify ? style.verify : style.verifyHide}>
				<div className = { style.content }>
					<h2>Welcome to Musite !</h2>
					<div className = {style.holder}>
						<div className = {this.state.reversed ? style.verifyRegister : style.verifyLogin}>									
							<Register changeEmail = {this.props.changeEmail} changePassword = {this.props.changePassword} changeConfirm = {this.props.changeConfirm} handleRegister = {this.props.handleRegister} reversed = {this.state.reversed} turnToLogin = {this.turnToLogin} registerErrorMsg = {this.props.registerErrorMsg}/>
							<Login changeEmail = {this.props.changeEmail} changePassword = {this.props.changePassword} handleLogin = {this.props.handleLogin} reversed = {this.state.reversed} turnToRegister = {this.turnToRegister} loginErrorMsg = {this.props.loginErrorMsg}/>
						</div>
					</div>
				</div>
			</div>

		)
	}	
}

export default Verify
