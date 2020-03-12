import React from 'react';
import style from './header.module.css';


class Header extends React.Component{

	constructor(props){
		super(props);
        //this.toggle = this.toggle.bind(this);
    	//this.onMouseEnter = this.onMouseEnter.bind(this);
		//this.onMouseLeave = this.onMouseLeave.bind(this); //写这个是可以 写onMouseLeave(){xxx} 不用写onMouseLeave=()=>{}
		this.toggleNavbar = this.toggleNavbar.bind(this);
		this.state = {
			showUserMenu: false,
			showDownloadMenu: false,
			showGlobalMenu: false,
            showHelpMenu:false,
			enterdownload:false,
			collapsed: true,
			prevScrollpos: window.pageYOffset,
			//新的临时变量，用于检测屏幕滑动
			visible: true,
			
		}
		
 
	}


   
	
	onMouseEnter=()=>{
		this.setState(prevState => ({
		  showDownloadMenu: !prevState.showDownloadMenu
		}));
	}
	
    onMouseClick=()=>{
		this.setState(prevState => ({
		  showDownloadMenu: !prevState.showDownloadMenu
		}));
	}
	onMouseClickContact=()=>{
		/*this.setState(prevState => ({
		  showContact: !prevState.showContact
		}));*/
        this.props.handleShowContact();
	}
    
    onMouseEnterdownload=()=>{
        this.setState({
	        enterdownload: true
	      })	  }
	
    
    onMouseLeave=()=>{
        this.setState({
	        showDownloadMenu: false,
            enterdownload: false,
            //showContact: false,
	      })		
	  }
    
    
	handleOpenTool = () => {
		window.open("https://github.com/duolinwang/MusiteDeep_web");
        this.setState({
	        showDownloadMenu: false,
            enterdownload:false,
	      })
	}
    
    handleMusite = () => {
       window.open("http://gene.rnet.missouri.edu/musite");
    }
    
    //handleHelp = ()=>
    //{
    //    window.open("http://localhost:5000/displayHelp");
    //}
    handleShowPtm = () => {
        this.props.handleShowPtm(); //main 程序里有这个。
        this.setState({
	        showDownloadMenu: false,
            enterdownload:false,
            //showContact:false,
	      })
	}
    
	handleOpenGlobal3D = () => {
		window.open("http://www.musite.net//revolvermaps.html")
        this.setState({
	        showGlobalMenu: false
	      })
	}

//handleShowDownloadMenu = () =>{
//    if(this.state.showDownloadMenu){
//      this.setState({
//        showDownloadMenu: false
//      })
//    }
//    else{
//      this.setState({
//        showDownloadMenu: true
//      })
//    }
//}

	handleShowHelp = () =>{
	    if(this.state.showHelpMenu){
	      this.setState({
	        showHelpMenu: false,
            showDownloadMenu:false,
            enterdownload: false,
	      })
	    }
	    else{
	      this.setState({
	        showHelpMenu: true,
            showDownloadMenu:false,
            enterdownload: false,
            //showContact:false,

	      })
	    }
        
        //用下面的在原来页面转到help页面。
        this.props.handleShowHelp();
        //如果要弹出新help页面，就调用下面的，但是如果storage不让存东西，就调用正常的main中的。handleshowhelp
        //try
        //{
        //localStorage.setItem("MusiteDeepShowPage","ShowHelp")
        ////window.open("http://www.musite.net/help.html"); // change to window.open("http://localhost:3000/help.html");
	    //window.open("http://www.musite.net/"); // change to window.open("http://localhost:3000/help.html");
        //}
        //catch(error){
        //    console.log(error);
        //    this.props.handleShowHelp();
        //    
        //}
    }
    
    /*handleShowContact = () =>{
    if(this.state.showContact){
	    this.setState({
	    showContact: false,
        showDownloadMenu:false,
        enterdownload: false
	   })
	   }
	    else{
	      this.setState({
	        showContact: true,
            enterdownload: false,
            showDownloadMenu:false,
	      })
	    }
         //window.open("http://localhost:5000/displayHelp");
         window.open("http://www.musite.net/contact.html");
  }*/
  
	handleShowGlobalMenu = () =>{
	    if(this.state.showGlobalMenu){
	      this.setState({
	        showGlobalMenu: false,
            showDownloadMenu:false,
            enterdownload: false
	      })
	    }
	    else{
	      this.setState({
	        showGlobalMenu: true,
            showDownloadMenu:false,
            enterdownload: false
	      })
	    }
	}

    handleShowUserMenu = () =>{
	    if(this.state.showUserMenu){
	      this.setState({
	        showUserMenu: false,
            enterdownload: false,
            showDownloadMenu:false,
                    showContact:false,
	      })
	    }
	    else{
	      this.setState({
	        showUserMenu: true,
            showDownloadMenu:false,
            enterdownload: false,
                    showContact:false,
	      })
	    }
	}
    
    handleHome=()=>
    {
        this.setState({
        showUserMenu: false,
		showDownloadMenu: false,
		showGlobalMenu: false,
        showHelpMenu:false,
        showContact:false,
        enterdownload:false,
        })
        {this.props.handleShowPredict()};
    }
    
	shouldComponentUpdate = (nextProps, nextState) => {
		if(this.props.user !== '' && nextProps.user === ''){
			this.setState({
				showUserMenu: false
			})
		}
		return true;
	}

	//关／打开navbar,作用于按钮单击
	toggleNavbar =()=> {
		this.setState({
		 collapsed: !this.state.collapsed,
		});
		
	}
//创建ｅｖｅｎｔ　ｌｉｓｔｅｎｅｒ用于检测屏幕滑动 
 componentDidMount() {
    window.addEventListener("scroll", this.handleScroll);
  }

  //销毁创建的eventlistener
  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }
  //每当屏幕滑动时，隐藏navbar 滑动时，收回navbar
  handleScroll = () => {
    const { prevScrollpos } = this.state;
    const currentScrollPos = window.pageYOffset;
    const visible = prevScrollpos > currentScrollPos;
    if (!visible){
    this.setState({
		collapsed: true,
    });}
  }
	
	render(){
		const collapsed = this.state.collapsed;
 const classOne = collapsed ? 'collapse navbar-collapse flex-row-reverse' : 'collapse navbar-collapse flex-row-reverse show';
 const classTwo = collapsed ? 'navbar-toggler  ' : 'navbar-toggler collapsed';
		return (
        		<div className = {style.nav}>
					<div className = {style.navList}>
						<nav className="navbar navbar-expand-md navbar-dark fixed-top bg-dark" id="header">
                              <a className="navbar-brand" onClick={this.handleHome} style={{color: "white"}} >HOME</a>
                              <button onClick={this.toggleNavbar} className={`${classTwo}`} type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
                                     aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                              <span className="navbar-toggler-icon"></span>
                              </button>
                            <div className={`${classOne}`} id="navbarSupportedContent">
                                <ul className="navbar-nav mr-auto">
                                    <li className="nav-item active"><span className="nav-link" onClick = {this.props.handleShowProfile}>Job History</span></li>
							    	<li className="nav-item active" onMouseLeave={this.onMouseLeave}>
                                        <span className="nav-link"  onClick={this.onMouseClick}>Download<b className = {style.caret}></b></span>
                                        <div className = {this.state.showDownloadMenu? style.menu : style.menuHide}>
							    			<div onClick = {this.handleShowPtm}><label>PTM Data</label></div>
							    			<div onClick = {this.handleOpenTool}><label>Stand-alone Tool</label></div>
							    		</div>
							    	</li>
                                    <li className="nav-item active" onMouseLeave={this.onMouseLeave}>
                                        <span className="nav-link"  onClick={this.props.handleShowAPI}>API</span>
                                    </li>
                                    
                                    <li className="nav-item active" onMouseLeave={this.onMouseLeave}>
                                        <span className="nav-link"  onClick={this.onMouseClickContact}>Contact</span>
                                    </li>
                                      <li className="nav-item active"><span className="nav-link" onClick = {this.handleShowHelp}>Help</span></li>
							         
                                </ul>
                            </div>
						</nav>
                        </div>
                        </div>
		)
	}
}


export default Header


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
contact:
   <li className="nav-item active" onMouseLeave={this.onMouseLeave}>
       <span className="nav-link"  onClick={this.onMouseClickContact}>Contact</span>
       <div className = {this.state.showContact? style.menucontact : style.menucontactHide}>
          <div><label>Duolin Wang, <a href="mailto:wangdu%40missouri.edu">wangdu@missouri.edu</a><br /></label>
            </div><div>
            <label>
              Dong Xu, <a href="mailto:xudong%40missouri.edu">xudong@missouri.edu</a> <br />
            </label></div><div>
            <label>
              <a href="http://digbio.missouri.edu/">DBL (Digital Biology Laboratory)</a>
            </label>
          </div>
       </div>
    </li>


                              <a className="navbar-brand" href="/">HOME</a>
*/


