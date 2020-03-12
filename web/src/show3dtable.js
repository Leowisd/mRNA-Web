import React, { Component } from 'react';
import swal from 'sweetalert';
import $ from 'jquery';
import Header from './components/super/header/header';
import Output from './components/super/output/output';
import Footer from './components/super/footer/footer';
import './show3dtable.module.css';
import style from './show3dtable.module.css';

const Record = (props)=>{
    let showindex = props.index //返回当前处理record的 index
    let e = props.item
    //console.log(e);
    return(
    <tr>
    <td>{e['pdbNo']}</td>
    <td>{e['pdbId']}</td>
    <td>{e['chain']}</td>
    <td>{Number.parseFloat(e['evalue']).toPrecision(4)}</td>
    <td>{e['bitscore']}</td>
    <td>{e['identity']} / {e['identityPositive']}</td>
    <td>{e['pdbFrom']}-{e['pdbTo']}</td>
    <td>{e['seqFrom']}-{e['seqTo']}</td>
    <td><button value={e} title={showindex} type="button" class="display" onClick={props.handleshow3D}>Show 3D</button></td>
    </tr>          
    )
}

class Table3D extends Component {

	constructor(props){
		super(props);
		this.state = {
		  seq: "",
          ptmresults:[],
          g2sresult:[],
          ptmtypes:{},
          position:"",
          g2sstate:"wait", //wait is running wait for the result not yet finished; finished_n: has finished with no match; finished_f: finished with at least one match.
	  }
  }
  
  goToHomePage = () => {
    window.open("http://www.musite.net");
  }
  
  handleshow3D = e =>
  {
    let index = e.target.title;
    //console.log(index);
    let g2sItem = this.state.g2sresult[index];//e.target.value;
    //console.log(g2sItem);
    //console.log(this.state.ptmtypes);
    let resi = "";
    let queryindex = "";
    let chain = g2sItem['chain'];
    function parsePosition(value, index, array){
            resi = resi + value['pdbPosition'] + ":"+chain+" ";
    }
    function parsequeryPosition(value, index,array){
        
            //console.log(value['queryPosition']);
            //console.log(ptmtypes);
            queryindex = queryindex + value['queryPosition']+":"+value['queryAminoAcid']+":"+value['pdbAminoAcid']+":"+ptmtypes[value['queryPosition']].join(",") + " ";
            //queryindex = queryindex + value['queryPosition']+":"+ptmtypes[value['queryPosition']].join(",") + " ";
    }
    let ptmtypes=this.state.ptmtypes;
    g2sItem['residueMapping'].forEach(parsePosition);
    g2sItem['residueMapping'].forEach(parsequeryPosition);
    resi = resi.replace(/\s*$/, "");
    //console.log(resi);
    queryindex = queryindex.replace(/\s*$/,"");
    //console.log(queryindex);
    //let selection = resi+":"+chain;
    let pdb = g2sItem['pdbId'];
    let disurl = "rcsb://"+pdb;
    
    //let out = "http://www.musite.net:5000/display3d?url="+disurl+"&sele="+resi+"&position="+queryindex; //for viwer/display.html
    let out = "http://www.musite.net/display3d.html?url="+disurl+"&sele="+resi+"&position="+queryindex; //for public/display.html
    //let out = "http://localhost:3000/display3d/"+pdb+"/"+resi+"/"+queryindex; //for display3d.js in web/src
    //let out = "/display3d?url="+disurl+"&sele="+resi+"&position="+queryindex; //for viwer/display.html
    //console.log(out);
    window.open(out);
    //$.ajax(
    //{   type: 'post',
    //    url: out
    //}
    //)
    
  }
  
  
  
    componentDidMount = () => {
    let show3dID = this.props.match.params.show3dID;
    //console.log("show3did is "+show3dID);
    let count = 0;
    let seq="";
    let ptmresults=[];
    let ptmtypes ={};
    let position = "";
    this.interval = setInterval(()=>{
        if(count > 5){
          swal({
          title: "G2S error!",
          text: "Something wrong with G2S,please try it later! ",
          icon: "info",
          button: "Got it!"//,
              //timer: 3000
         });
        clearInterval(this.interval);
        }
        count+=1;
        
        //$.getJSON('../static/'+show3dID+'_show3d.json', data => {
        $.getJSON('../users/upload-files/common/'+show3dID+'_show3d.json', data=> {
            //console.log(data);
            ptmresults = data['positions_select'].split("%2C");
            seq = data['seq'];
            ptmresults.forEach(ptm=>{
            let pos = ptm.split(":")[0]
            if(ptmtypes.hasOwnProperty(pos)){
               ptmtypes[pos].push(ptm.split(":")[1]);
            }else{
               ptmtypes[pos]=[];
               ptmtypes[pos].push(ptm.split(":")[1]);
            }
            })
            position = Object.keys(ptmtypes).join("%2C");
            //console.log("positions is "+position);
            //console.log(position);
            this.setState({
                seq: seq,
                ptmresults:ptmresults,
                ptmtypes:ptmtypes,
                position:position,
            })
    
    let url = "https://g2s.genomenexus.org/api/alignments/residueMapping?sequence="+seq+"&positionList="+position;
    //let url = "https://variant3d.genomenexus.org:8443/api/alignments/residueMapping?sequence="+seq+"&positionList="+position;
    //read and create options from url
    //console.log("url is" +url)
    if(seq!="")
    {   let g2sresult=[];
        $.ajax(
        {
            type:'get',
            url:url,
            success: data=>
            {
                //console.log(data)
                if(data.length>0){
                    this.setState({g2sstate:"finished_f",})
                }else{this.setState({g2sstate:"finished_n",})}
                
                for (let i = 0; i < 20; i++) {     
                    if (data[i]){
                      g2sresult.push(data[i])
                    }        
                  }
                   this.setState({
                       g2sresult:g2sresult,
                        })
            },
            error:(XMLHttpRequest, textStatus, errorThrown) => {
            clearInterval(this.interval);
            console.log(XMLHttpRequest.status);//500
            console.log(XMLHttpRequest.readyState);//4
            console.log(textStatus);//error
            console.log(errorThrown);//Internal server error
            swal({
              title: "G2S error!",
              text: "Something wrong with G2S,please try it later! ",
              icon: "info",
              button: "Got it!"//,
              //timer: 3000
            });
          }
        }
       )
    clearInterval(this.interval);
    }
   });
    //      count+=1;
    //      if(count >3 || this.setState.seq !="")
    //      {clearInterval(this.interval);}
    
    },3000)
  }
  
  componentWillUnmount () {
  // It's necessary to do this otherwise the interval
  // will be executed even if the component is not present anymore. 
  }
	render(){
        
        let showresults;
        if(this.state.g2sstate=='finished_f')
        {
            showresults = (
               <table><tr><th>pdbNo</th><th>pdbId</th><th>chain</th><th>evalue</th><th>bitscore</th><th>identity / identityPositive</th><th>pdb From-To</th><th>seq From-To</th><th>3D Display</th></tr>
              {this.state.g2sresult.map((e,index)=>{
               return(
                  <Record item ={e} index={index} handleshow3D= {this.handleshow3D}/>
               )
               })}</table>
            )
        }else if(this.state.g2sstate=='finished_n'){
           showresults = (
           <p>
			There is no matched protein 3D structures for the query sequence.
           </p>)
        }else{
          showresults=(
          <div className = {style.loading}>
          <div className = {style.loader}>
            <div className = {style.dot}></div>
            <div className = {style.dot}></div>
            <div className = {style.dot}></div>
            <div className = {style.dot}></div>
            <div className = {style.dot}></div>
          </div>
        </div>)
        }
		return (
			<div className = {style.show3dtable}>
			  <header>
                <div className = {style.home}>
                  <a href = "http://www.musite.net">MUSITEDEEP HOME</a>
                </div>
              </header>
              <div>
		      <p>
			      Matched protein 3D structures for the query sequence
              </p>
		     </div>
             {showresults}
	        </div>
		);
	}
}


export default Table3D

//        <main ref = "main" className = {style.small}>
//          <div>
//          <table><tr><th>pdbNo</th><th>pdbId</th><th>chain</th><th>evalue</th><th>bitscore</th><th>identity</th><th>identityPositive</th><th>3D Display</th></tr>
//          {g2sresult.map((e,index)=>{
//              return(
//              <tr><td>{e['pdbNo']}</td><td>{e['pdbId']}</td><td>{e['chain']}</td><td>{e['evalue']}</td><td>{e['bitscore']}</td>
//          <td>{e['identity']}</td><td>{e['identityPositive']}</td><td><button type="button" class="display" value={index}>Show 3D</button></td></tr>
//              )
//          })}</table>
//          </div>
//        </main>