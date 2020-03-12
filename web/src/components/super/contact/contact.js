import React, { Component } from 'react';
import style from './contact.module.css';


class Contact extends React.Component{

	constructor(props){
		super(props);
		this.state = {
		}
	}
	render(){
		return (
                 <div className={style.contact}>
                    <h3>Contact Us</h3>
                    <hr />
                    <p>We try our best to provide user-friendly web services to all users. Please feel free to contact us via:</p>
                    <div>
                    <ul>
                    <li>Duolin Wang, Bond Life Sciences Center, University of Missouri, Columbia, USA
                        <br />
                        <a href="mailto:wangdu%40missouri.edu">wangdu@missouri.edu</a>
                    </li>
                    
                    <li>Dong Xu, Bond Life Sciences Center & Department of Electrical Engineer and Computer Science, University of Missouri, Columbia, USA
                    <br />
                        <a href="mailto:xudong%40missouri.edu">xudong@missouri.edu</a>
                    
                    </li>
                    <li>Digital Biology Laboratory
                    <br />
                    <a href="http://digbio.missouri.edu/">DBL</a>
                    </li>
                    </ul>
                   </div> 
                </div>
		)
	}
}


export default Contact


/*

	render(){
		return (
				<div className = {style.nav}>
					<div className = {style.logo}>
						<a href = "#">MUSITEDEEP</a>
					</div>
					<div className = {style.navList}>
						<nav>
							<ul>
								<li onClick = {this.props.handleShowPredict}><span>Home</span></li>
                                <li><span onClick = {this.handleShowHelp}>Help and Tutorial</span></li>
								<li><span onClick = {this.handleShowDownloadMenu}>Download<b className = {style.caret}></b></span>
									<div className = {this.state.showDownloadMenu? style.menu : style.menuHide}>
										<div onClick = {this.handleShowPtm}><label>Uptodate PTM data</label></div>
										<div onClick = {this.handleOpenTool}><label>Methods and Datasets</label></div>
									</div>
								</li>
								<li><span onClick = {this.handleShowGlobalMenu}>User map<b className = {style.caret}></b></span>
									<div className = {this.state.showGlobalMenu ? style.menu : style.menuHide}>
										<div onClick = {this.handleOpenGlobal3D}><label>Global 3D</label></div>
										<div onClick = {this.handleOpenTool}><label>Global 2D</label></div>
									</div>
								</li>
								<li><span>Contact</span></li>
                                <li><span onClick = {this.props.handleShowProfile}>User job history</span>
                                </li>
							</ul>
						</nav>
					</div>
				</div>
		)
	}
    
<span className="nav-link"  onClick={this.onMouseClick} onMouseOver={this.onMouseEnter}>Download<b className = {style.caret}></b></span>

*/


