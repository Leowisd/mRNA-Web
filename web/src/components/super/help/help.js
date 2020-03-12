import React, { Component } from 'react';
import style from './help.module.css';
import Ptm from '../ptm/ptm';
import Output from '../output/output';
import Profile from '../profile/profile';
import $ from 'jquery';
import swal from 'sweetalert';
class Help extends React.Component{

	constructor(props){
		super(props);
		this.state = {
         results:[{}],
         exampleInput: "MERSPAVCCQDPRAELVERVAAISVAHLEEAEEGPEPASNGVDPPPRARAASVIPGSASR\nPTPVRPSLSARKFSLQERPAGSCLEAQVGPYSTGPASHMSPRAWRRPTIESHHVAISDTE\nDCVQLNQYKLQSEIGKGAYGVVRLAYNEREDRHYAMKVLSKKKLLKQYGFPRRPPPRGSQ\nAPQGGPAKQLLPLERVYQEIAILKKLDHVNVVKLIEVLDDPAEDNLYLVFDLLRKGPVME\nVPCDKPFPEEQARLYLRDIILGLEYLHCQKIVHRDIKPSNLLLGDDGHVKIADFGVSNQF\nEGNDAQLSSTAGTPAFMAPEAISDTGQSFSGKALDVWATGVTLYCFVYGKCPFIDEYILA\nLHRKIKNEAVVFPEEPEVSEELKDLILKMLDKNPETRIGVSDIKLHPWVTKHGEEPLPSE\nEEHCSVVEVTEEEVKNSVKLIPSWTTVILVKSMLRKRSFGNPFEPQARREERSMSAPGNL\nLLKEGCGEGGKSPELPGVQEDEAAS",
		 input:[[]],
         title:[],
         modelOptions: [{label: "Phosphorylation (S,T)", value:"Phosphoserine_Phosphothreonine"}],
         space: 0,
         currentjob:"", //一个用户可以有list of jobs，但是一次show只能显示最后一个，否则就乱了！用currentjob记录用户的最后要show的目录，就是time
         profilemodelOptions:null, //只当想show profile时用这个option。
         showProOutput: false,//profile 的output 
         outputjobId:"", //output显示的job上面显示一个id。一次output只能有一次有效的id
        }
	}
   
   changeSpace = value => {
    this.setState({
      space: value
    })
  }
    
     //对返回的输入输出进行格式处理，然后将新的输入输出存到state中。
 //对结果的输入输出处理，多结果的处理也是在这里地方！
  processData = (input, output) =>{
    let title = this.state.title;
    let results = [{}];
    input = input.split(/[\r\n]+\>/);//devide sequences
    //inputs.shift(0);//delete the blank element no blank for \n>
    let tmp = [];
    //console.log(input);
    //console.log(output);
    let j=0;
    for(let e of input){
      e = e.split(/[\r\n]+/);
      if(j==0)
      {
      title[j]=e[0]; //the first title contains > 
      }else{
      title[j]=">"+e[0];
      }
      e.shift(0);//这个是id要去掉
      if(e[e.length - 1] === ''){
        e.pop();//如果最后一个是空也要去掉
      }
      
        e = e.join('').split('');
        e = e.filter(ele => {
         return ele.charCodeAt() !== 13 //delete spaces
       })
      tmp.push(e); //here e should be list not str
      //console.log("current e is"+e)
      j++;
    }
    output = output.split(/[\r\n]+/);
    if(output[output.length - 1] === ''){
        output.pop();//如果最后一个是空也要去掉
    }
    let outputhash = {};//一个hash table，key 是seqid，之后是list，按顺序，里面存pos \t ptm：score1|ptm2：score2|ptm3:score3
    let scores;
    let score;
    let pos;
    let id;
    let ptmtypes;
    let lastshow="";
    for(j=1;j<output.length;j++) //output加了header j 从1开始
    {
        if(output[j].charAt(0)=='>')
        {
           id = output[j];
           j+=1; //read next line
        }
        pos = output[j].split("\t")[0];
        //id = output[j].split("\t")[0];
        lastshow=output[j].split("\t")[2];
        if(outputhash.hasOwnProperty(id)){
           outputhash[id].push(pos+"\t"+lastshow);
        }else{
            outputhash[id]=[];
            outputhash[id][0] = pos+"\t"+lastshow;
        }
        
        
        
    }
    let key;
    for(let i = 0; i < title.length; i +=1){
      results[i] = {}; //result按顺序存，对一个seq存一个字典，key是pos,内容是ptm：score1|ptm2：score2|ptm3:score3 当前results[i]可以是{} 同样要展示。
      id = title[i];
      //key = "\""+id+"\""
      key = id
      if(outputhash.hasOwnProperty(key))//output has this id
      {
          for(j=0;j<outputhash[key].length;j++)
          {
             pos = outputhash[key][j].split("\t")[0]; // pos must be numbers 
             score = outputhash[key][j].split("\t")[1];
             //console.log("score is !!!!!!!!\n!!!!!!!\n!!!!!!!\n!!!!!!!\n"+score)
             results[i][pos] = score;
          }
      }
    }
    
    //console.log(results);
    this.setState({
      title: title,
      input: tmp,
      results: results,
    })
  }
    
  //获得提交时的options。
  handleGetmodeloptions = (userID,JobID)=>
  {
    $.ajax(
    {
        type:'post',
        url: '/checkoption',
        data:{
            userID:userID,
            JobID:JobID
        },
        success: data =>{
            //console.log("succ in checkoption");
            if(data)
            {
             this.setState({
             profilemodelOptions: data,
             })
            }
        },
        error:(XMLHttpRequest, textStatus, errorThrown) => {
                    console.log(XMLHttpRequest.status);
                    console.log(XMLHttpRequest.readyState);
                    console.log(textStatus);
                    //clearInterval(interval); //如果失败了再循环，直到100. 什么都不要返回。由cmd那个ajax 去返回。 
              }
    })
  }
  
  
    //在profile里显示结果组件
	handleShowProOutput = e =>{
        //scroll to results
        setTimeout(() => window.scrollTo(0, this.refs.profile.offsetTop+400), 200); 
		this.setState({
      showProOutput: true
      //showPtm: false  
		})
	}
  handleShowPro = () =>
  {
    setTimeout(() => window.scrollTo(0, this.refs.profile.offsetTop), 200); 
  }
  
  //个人主页中点击show查看某一条历史数据，返回新的输入输出
  handleShowResult = e => { //e is the parameters used when call this handleshowresult
    let title = e.target.title;
    let resultstatus = 0;
    //把之前的结果清除，一个output只能显示一个结果！
    this.setState({
      title: [],
      input: [[]],
      results: [{}],
    })
    
    this.setState({
        currentjob: title, //currentjob 永远设为最后一次按show 的title
    })
    this.handleShowProOutput(); //set  showProOutput as true
    this.setState({
        outputjobId: title,
    })
    
    
    this.handleGetmodeloptions("example",title);
    $.ajax(
    {
        type: 'post',
        url: '/read',
        data: {
          'userId': "example",
          'time': title,
        },
        //dataType: 'json',
        success: data =>{
          if(data){
              this.setState({
            })
            //console.log("show profile results got data")
            this.processData(data[0], data[1]); //最关键这个有结果？
            this.handleShowProOutput();
          }
        },
          error: (XMLHttpRequest, textStatus, errorThrown) => {
           if(XMLHttpRequest.status == 404){
             
             //this.setState({
             //showProOutput: false,
             //})
             swal({
             title:"Error",
             text: "No results found for this Job:"+title+"! Please resubmit the job! ",
             icon: "info",
             button: "Got it!"});}
             else{
             swal({
             title: "Error",
             text: "Something wrong with your Job:"+title+"! Please resubmit the job! ",
             icon: "info",
             button: "Got it!"//,
             //timer: 3000
             });
             }
         console.log(XMLHttpRequest.status);
         console.log(XMLHttpRequest.readyState);
         console.log(textStatus);
         this.setState({showProOutput: false})
         }
    })  
  }
  
    componentDidMount(){
    //把之前的结果清除，一个output只能显示一个结果！
    //console.log("help mounted")
    this.setState({
      title: [],
      input: [[]],
      results: [{}],
      showProOutput: false,
    })             
    }
    
    componentWillReceiveProps = () =>{
     //console.log("help update")
     if(this.props.showHelp == false)
     {
        //console.log("showhelp is false!")
        this.setState({
        title: [],
        input: [[]],
        results: [{}],
        showProOutput: false,
        })   
     }
    }
    
	render(){
        let exampleResults=[{}]
        exampleResults[0]={4: "Phosphoserine:0.823",24: "Phosphoserine:0.423",39: "Phosphoserine:0.552",52: "Phosphoserine:0.876",57: "Phosphoserine:0.726",
                  59: "Phosphoserine:0.539",62: "Phosphothreonine:0.842",67: "Phosphoserine:0.555",69: "Phosphoserine:0.546",74: "Phosphoserine:0.854",
                  82: "Phosphoserine:0.245",92: "Phosphoserine:0.269",93: "Phosphothreonine:0.208",97: "Phosphoserine:0.385",100: "Phosphoserine:0.871",
                 108: "Phosphothreonine:0.724",111: "Phosphoserine:0.188",117: "Phosphoserine:0.399",119: "Phosphothreonine:0.089",132: "Phosphoserine:0.116",
                 160: "Phosphoserine:0.152",179: "Phosphoserine:0.465",279: "Phosphoserine:0.408",297: "Phosphoserine:0.433",308: "Phosphoserine:0.847",
                 309: "Phosphoserine:0.894",310: "Phosphothreonine:0.4",313: "Phosphothreonine:0.765",323: "Phosphoserine:0.394",325: "Phosphothreonine:0.322",
                 328: "Phosphoserine:0.51",330: "Phosphoserine:0.106",339: "Phosphothreonine:0.04",342: "Phosphothreonine:0.055",379: "Phosphoserine:0.336",
                 396: "Phosphothreonine:0.128",401: "Phosphoserine:0.171",410: "Phosphothreonine:0.114",419: "Phosphoserine:0.648",425: "Phosphoserine:0.659",
                 430: "Phosphothreonine:0.153",437: "Phosphoserine:0.073",443: "Phosphoserine:0.073",445: "Phosphothreonine:0.064",446: "Phosphothreonine:0.066",
                 452: "Phosphoserine:0.081",458: "Phosphoserine:0.871",473: "Phosphoserine:0.723",475: "Phosphoserine:0.877",492: "Phosphoserine:0.903",505: "Phosphoserine:0.816"}
		
      let exampleInput = [];
      let e = this.state.exampleInput.split(/[\r\n]+/);      
      e = e.join('').split('');
      exampleInput.push(e); //here e should be list not str
     
        return (
      <div>
        <div className = "container">
            <div className={style.help}>
              <h3 className="text-center" style={{marginTop:'10px'}}>Tutorial</h3>
              <div>
                <p className="text-left" style={{marginTop:'10px',fontSize:'14px'}}>Browser compatibility:</p>
                <table className={style.browser}>
                        <tbody>
                        <tr><td>OS</td><td>Version</td><td>chrome</td><td>Firefox</td><td>Microsoft Edge</td><td>Safari</td></tr>
                        <tr><td>Linux</td><td>Ubuntu 16</td><td>75</td><td>70</td><td>n/a</td><td>n/a</td></tr>
                        <tr><td>MacOS</td><td>HighSierra</td><td>77</td><td>70</td><td>n/a</td><td>12.0</td></tr>
                        <tr><td>Windows</td><td>10</td><td>76</td><td>70</td><td>79</td><td>n/a</td></tr>
                        </tbody>
                </table>
                <p className="text-left" style={{marginTop:'20px'}}>
                    Our server has a variety of models built for predicting post-translational modification sites (PTMs). 
                    Users can simultaneously select multiple provided models for prediction using the multi-select drop down list.
                    <img src="img/0.PNG" style={{width: '100%',height: '5rem'}} />
                </p>
                
                <h3 className="text-left font-weight-bold" style={{fontSize:'14px'}}>Input:</h3>
                
                
		        	<p className="text-justify">The only input needed is protein sequences in the <a href="https://zhanglab.ccmb.med.umich.edu/FASTA/" style={{color:'blue'}}>FASTA</a> format.  
                   It accepts any alphabet characters, asterisks(*), hyphens(-), space, and line breaks. 
                   All characters will be coded as a special characters "X" excluding the 20 common amino acids represented by 
                  (A,C,D,E,F,G,H,I,K,L,M,N,P,Q,R,S,T,V,W,Y) for the prediction phase.             
                  </p>
                    
                    <p className="text-justify">We provide two options for input：</p> 
                  
                    <p className="text-justify">
                    1. Paste mode: users can paste up to 10 sequences or 5000 amino acids to the input panel. Upon clicking the <img style={{height: '30px',width:'150px'}} src="img/start.png" /> button,
                    the job will start immediately and return the result in real time. The job can be accessed later by checking the <img style={{height: '30px',cursor: 'pointer'}} onClick={this.handleShowPro} src="img/userheader.png" /> in the header.
                    </p>
                    
                    
                    <p className="text-justify">
                    2   Upload mode: for a larger scale prediction task (a FASTA file is 10MB at most), users can upload a file in the FASTA format by clicking the <span style={{color: 'blue'}}>upload a FASTA file</span>. 
    In this mode, once the job is submitted, it will be placed on a queue for processing. The job can be accessed later by the provided URL or checking the the <img style={{height: '30px',cursor: 'pointer'}} onClick={this.handleShowPro} src="img/userheader.png" /> in the header. 
                    In this mode, one user is allotted to process up to 5 jobs at the same time. 
                    For large-scale jobs, we suggest to download and run the <a href="https://github.com/duolinwang/MusiteDeep_web" style={{color:'blue'}}>standalone tool</a>.
                    </p>
                    <p className="text-justify">For both mode, the jobs' inputs and results will be saved on the server for 72 hours (up to 100MB).</p>
                    <h3 className="text-left font-weight-bold" style={{fontSize:'14px'}}>Output:</h3>
                    <p className="text-justify">
                       After a job is finished, the result can be visualized for each input sequence one by one. 
                    </p>
                </div>
            </div>
            </div>
            <div className = {style.result}>
                    <Output title = {[">sp|P97756|KKCC1_RAT"]} 
                            input = {exampleInput} 
                            results = {exampleResults} 
                            currentresultstatus = "All:100"
                            userId = "example"
                            outputjobId="2019-10-20T22:58:47.827Z"
                            modelOptions = {this.state.modelOptions}
                    />
                    <div className = {style.ptmannotation}>
                       <ul>
                       <li>Phosphorylation:  <span style={{fontWeight: '700',color:'Blue'}}>P</span></li>
                       <li>Glycosylation:  <span style={{fontWeight: '700',color:'Red'}}>gl</span></li>
                       <li>Ubiquitination:  <span style={{fontWeight: '700',color:'Gray'}}>ub</span></li>
                       <li>SUMOylation:  <span style={{fontWeight: '700',color:'Olive'}}>su</span></li>
                       <li>Acetyllysine:  <span style={{fontWeight: '700',color:'Orange'}}>ac</span></li>
                       <li>Methylation:  <span style={{fontWeight: '700',color:'Black'}}>me</span></li>
                       <li>Pyrrolidone carboxylic acid:  <span style={{fontWeight: '700',color:'Purple'}}>pc</span></li>
                       <li>Palmitoylation:  <span style={{fontWeight: '700',color:'Maroon'}}>pa</span></li>
                       <li>Hydroxylation:  <span style={{fontWeight: '700',color:'Green'}}>Hy</span></li>
                       </ul>
                    </div>
            </div>
            
            <div className = "container">
              <div className = {style.help}>
                <p className="text-justify">
                     The predicted PTMs are labeled using their abbreviations on the top of the corresponding positions. 
                     Multiple labels are shown on top of one position if that position is predicted to have multiple PTMs. 
                     The highlighted colors of the predicted sites correspond to their prediction confidence levels
                     (the highest confidence is used for multiple labels).
                     Upon hovering the mouse on the predicited sites, the detailed information of the prediction will be shown.
                     A user may adjust the prediction confidence threshold using the slider to obtain more or fewer predicted sites.
                     <img src="img/2.png" style={{width: '100%'}} />
                     The default threshold is set to 0.5, meaning sites with confidence scores higher than 0.5 are predicted and highlighted as PTM sites.
                </p>
                
                <p className="text-justify">
                     By clicking the <img src="img/3.png" /> , the prediction results in the plain text will be saved.
                </p>
                <p>Here lists an example of the result file:</p>
                   
                    <div class={style.textholder}>
                        <div class={style.textcontent}>
                         <table border="0">
                         <tbody>
                         <tr><th>Position</th><th>Residue</th><th>PTMscores</th><th>Cutoff=0.5</th></tr>
                         <tr><th>>sp|P97756|KKCC1_RAT</th></tr>
                         <tr><th>3</th>  <th>R</th>  <th>Methylarginine:0.026</th>                                   <th>None</th></tr>
                         <tr><th>4</th>  <th>S</th>  <th>Phosphoserine:0.847;O-linked_glycosylation:0.096</th>       <th>Phosphoserine:0.847</th></tr>
                         <tr><th>5</th>  <th>P</th>  <th>Hydroxyproline:0.662</th>                                   <th>Hydroxyproline:0.662</th></tr>
                         <tr><th>8</th>  <th>C</th>  <th>S-palmitoyl_cysteine:0.884</th>                             <th>S-palmitoyl_cysteine:0.884</th></tr>
                         <tr><th>9</th>  <th>C</th>  <th>S-palmitoyl_cysteine:0.799</th>                             <th>S-palmitoyl_cysteine:0.799</th></tr>
                         <tr><th>10</th> <th>Q</th>  <th>Pyrrolidone_carboxylic_acid:0.111</th>                       <th>None</th></tr>
                         <tr><th>12</th><th>P</th><th>Hydroxyproline:0.06</th><th>None</th></tr>
                         <tr><th>13</th><th>R</th><th>Methylarginine:0.018</th><th>None</th></tr>
                         <tr><th>19</th><th>R</th><th>Methylarginine:0.016</th><th>None</th></tr>
                         <tr><th>24</th><th>S</th><th>Phosphoserine:0.509;O-linked_glycosylation:0.047</th><th>Phosphoserine:0.509</th></tr>
                         <tr><th>...</th><th>...</th><th>...</th><th>...</th></tr>
                         <tr><th>>sp|A9QT41|NEMO_PIG</th></tr>
                         <tr><th>2</th><th>S</th><th>Phosphoserine:0.103;O-linked_glycosylation:0.052</th><th>None</th></tr>
                         <tr><th>3</th><th>R</th><th>Methylarginine:0.041</th><th>None</th></tr>
                         <tr><th>4</th><th>T</th><th>Phosphothreonine:0.627;O-linked_glycosylation:0.041</th><th>Phosphothreonine:0.627</th></tr>
                         <tr><th>5</th><th>P</th><th>Hydroxyproline:0.466</th><th>None</th></tr>
                         <tr><th>8</th><th>S</th><th>Phosphoserine:0.412;O-linked_glycosylation:0.17</th><th>None</th></tr>
                         <tr><th>9</th><th>Q</th><th>Pyrrolidone_carboxylic_acid:0.348</th><th>None</th></tr>
                         <tr><th>10</th><th>P</th><th>Hydroxyproline:0.17</th><th>None</th></tr>
                         <tr><th>11</th><th>C</th><th>S-palmitoyl_cysteine:0.642</th><th>S-palmitoyl_cysteine:0.642</th></tr>
                         <tr><th>...</th><th>...</th><th>...</th><th>...</th></tr>
                         </tbody>
                         </table>
                    </div>
                    </div>
                    
                    <p>Except for the first line of the file, which is the header, for each sequence, the first line is the sequence title (start with ">"), 
                       the following lines are the prediction results of the potential PTM positions, 
                       each line contains 4 columns and separated by the tab character ("\t"):
                    </p>
                    <p className="text-justify" style={{padding:'2em'}}>
                       1 Position: the position of the potential PTM sites.<br/>
                       2 Residue: the amino acid code of the residue at the position.<br/>
                       3 PTMscores: the potential PTMs and their predicted confidence scores;  multiple PTMs are separated by semicolon.<br/>
                       4 Cutoffs=0.5: the predicted PTMs whose scores are higher than the present cutoff; the default cutoff is 0.5, which can be changed according to the user’s selection.<br/>
                    </p>
                    
                    <h3 className="text-left font-weight-bold" stype={{fontSize:'14px'}}>Other functions:</h3>
                    <p className="text-justify">
                        In the results panel, we provide several advanced functions:
                    </p>
                    <p>1 Blast-based annotation:</p>
                    <p>This function provides a homology-based search for the current sequence against proteins in Uniprot/Swiss-Prot, and presents known PTM annotations at the aligned positions.
                    Use the following as an example:</p>
             </div>
            </div>
            <div className = {style.result}>
                    <Output title = {[">sp|P97756|KKCC1_RAT"]} 
                            input = {exampleInput} 
                            results = {exampleResults} 
                            currentresultstatus = "All:100"
                            userId = "example"
                            outputjobId="2019-10-20T22:58:47.827Z"
                            modelOptions = {this.state.modelOptions}
                    />
                    <div className = {style.ptmannotation}>
                       <ul>
                       <li>Phosphorylation:  <span style={{fontWeight: '700',color:'Blue'}}>P</span></li>
                       <li>Glycosylation:  <span style={{fontWeight: '700',color:'Red'}}>gl</span></li>
                       <li>Ubiquitination:  <span style={{fontWeight: '700',color:'Gray'}}>ub</span></li>
                       <li>SUMOylation:  <span style={{fontWeight: '700',color:'Olive'}}>su</span></li>
                       <li>Acetyllysine:  <span style={{fontWeight: '700',color:'Orange'}}>ac</span></li>
                       <li>Methylation:  <span style={{fontWeight: '700',color:'Black'}}>me</span></li>
                       <li>Pyrrolidone carboxylic acid:  <span style={{fontWeight: '700',color:'Purple'}}>pc</span></li>
                       <li>Palmitoylation:  <span style={{fontWeight: '700',color:'Maroon'}}>pa</span></li>
                       <li>Hydroxylation:  <span style={{fontWeight: '700',color:'Green'}}>Hy</span></li>
                       </ul>
                    </div>
            </div>            
                
          <div className = "container">
            <div className = {style.help}>
                <p></p>
                <p className="text-justify">
                      This function will be triggered by clicking the  <img src="img/blast.png" /> button. The homologous sequences of the current sequence 
                      will be presented with their existing PTM annotations in blue color according to the PTM type that the user selects. Upon hovering the mouse on the colored sites, the specific annotation will be shown.
                      Users can refer to the sequence in the UniProt/Swiss-Prot database by clicking the sequence title.
                      Users can click the <img src="img/save_blast.PNG" /> button to save the blast output to a file named "blastresult.txt". <br/>
                      Here shows an example of the result file:
                </p>
                <div className={style.textholder}>
                <div className={style.textcontent} style={{fontSize:'11px'}}>
                        <p>>sp|P97756|KKCC1_RAT Calcium/calmodulin-dependent protein kinase kinase 1 OS=Rattus norvegicus GN=Camkk1 PE=1 SV=1</p>
                        <p>MERSPAVCCQDPRAELVERVAAISVAHLEEAEEGPEPASNGVDPPPRARAASVIPGSASRPTPVRPSLSARKFSLQERPAGSCLEAQVGPYSTGPASHMSPRAWRRPTIESHHVAISDTEDCVQLNQYKLQSEIGKGAYGVVRLAYNEREDRHYAMKVLSKKKLLKQYGFPRRPPPRGSQAPQGGPAKQLLPLERVYQEIAILKKLDHVNVVKLIEVLDDPAEDNLYLVFDLLRKGPVMEVPCDKPFPEEQARLYLRDIILGLEYLHCQKIVHRDIKPSNLLLGDDGHVKIADFGVSNQFEGNDAQLSSTAGTPAFMAPEAISDTGQSFSGKALDVWATGVTLYCFVYGKCPFIDEYILALHRKIKNEAVVFPEEPEVSEELKDLILKMLDKNPETRIGVSDIKLHPWVTKHGEEPLPSEEEHCSVVEVTEEEVKNSVKLIPSWTTVILVKSMLRKRSFGNPFEPQARREERSMSAPGNLLLKEGCGEGGKSPELPGVQEDEAAS</p>
                        <p>KKCC1_RAT (100)	67:Phosphoserine;74:Phosphoserine;78:Asymmetric dimethylarginine;100:Phosphoserine;108:Phosphothreonine;458:Phosphoserine;475:Phosphoserine;492:Phosphoserine;</p>
                        <p>MERSPAVCCQDPRAELVERVAAISVAHLEEAEEGPEPASNGVDPPPRARAASVIPGSASRPTPVRPSLSARKFSLQERPAGSCLEAQVGPYSTGPASHMSPRAWRRPTIESHHVAISDTEDCVQLNQYKLQSEIGKGAYGVVRLAYNEREDRHYAMKVLSKKKLLKQYGFPRRPPPRGSQAPQGGPAKQLLPLERVYQEIAILKKLDHVNVVKLIEVLDDPAEDNLYLVFDLLRKGPVMEVPCDKPFPEEQARLYLRDIILGLEYLHCQKIVHRDIKPSNLLLGDDGHVKIADFGVSNQFEGNDAQLSSTAGTPAFMAPEAISDTGQSFSGKALDVWATGVTLYCFVYGKCPFIDEYILALHRKIKNEAVVFPEEPEVSEELKDLILKMLDKNPETRIGVSDIKLHPWVTKHGEEPLPSEEEHCSVVEVTEEEVKNSVKLIPSWTTVILVKSMLRKRSFGNPFEPQARREERSMSAPGNLLLKEGCGEGGKSPELPGVQEDEAAS</p>
                        <p>KKCC1_MOUSE (97)	67:Phosphoserine;74:Phosphoserine;78:Asymmetric dimethylarginine;100:Phosphoserine;108:Phosphothreonine;458:Phosphoserine;475:Phosphoserine;492:Phosphoserine;</p>
                        <p>MESGPAVCCQDPRAELVDRVAAINVAHLEEADEGPEPARNGVDPPPRARAASVIPGSASRPTPVRPSLSARKFSLQERPAGSCLGAQVGPYSTGPASHISPRSWRRPTIESHRVAISDTEDCVQLNQYKLQSEIGKGAYGVVRLAYNESEDRHYAMKVLSKKKLLKQYGFPRRPPPRGSQATQGGPAKQLLPLERVYQEIAILKKLDHVNVVKLIEVLDDPAEDNLYLVFDLLRKGPVMEVPCDKPFPEEQARLYLRDIILGLEYLHCQKIVHRDIKPSNLLLGDDGHVKIADFGVSNQFEGNDAQLSSTAGTPAFMAPEAISDSGQSFSGKALDVWATGVTLYCFVYGKCPFIDDYILTLHRKIKNEAVVFPEEPEVSEDLKDLILRMLDKNPETRIGVSDIKLHPWVTKHGEEPLPSEEEHCSVVEVTEEEVKNSVRLIPSWTTVILVKSMLRKRSFGNPFEPQARREERSMSAPGSLLMKEGCGEGCKSPELPGVQEDEAAS   </p>
                        <p>KKCC1_HUMAN (96)	67:Phosphoserine;74:Phosphoserine;78:Asymmetric dimethylarginine;100:Phosphoserine;108:Phosphothreonine;458:Phosphoserine;475:Phosphoserine;492:Phosphoserine;                                                                                                                                                                                                                                                                                                                                            </p>
                        <p>MEGGPAVCCQDPRAELVERVAAIDVTHLEEADGGPEPTRNGVDPPPRARAASVIPGSTSRLLPARPSLSARKLSLQERPAGSYLEAQAGPYATGPASHISPRAWRRPTIESHHVAISDAEDCVQLNQYKLQSEIGKGAYGVVRLAYNESEDRHYAMKVLSKKKLLKQYGFPRRPPPRGSQAAQGGPAKQLLPLERVYQEIAILKKLDHVNVVKLIEVLDDPAEDNLYLVFDLLRKGPVMEVPCDKPFSEEQARLYLRDVILGLEYLHCQKIVHRDIKPSNLLLGDDGHVKIADFGVSNQFEGNDAQLSSTAGTPAFMAPEAISDSGQSFSGKALDVWATGVTLYCFVYGKCPFIDDFILALHRKIKNEPVVFPEEPEISEELKDLILKMLDKNPETRIGVPDIKLHPWVTKNGEEPLPSEEEHCSVVEVTEEEVKNSVRLIPSWTTVILVKSMLRKRSFGNPFEPQARREERSMSAPGNLLVKEGFGEGGKSPELPGVQEDEAAS   </p>
                        <p>KKCC2_RAT (79)	74:Phosphoserine;100:Phosphoserine;458:Phosphoserine;475:Phosphoserine;                                                                                                                                                                                                                                                                                                                                                                                                                                   </p>
                        <p>-----------------------------------------------------LPLDASEPE-SRSLLSGGKMSLQERSQG------------GPASSSSPRMPRRPTVESHHVSITGLQDCVQLNQYTLKDEIGKGSYGVVKLAYNENDNTYYAMKVLSKKKLIRQAGFPRRPPPRGTRPAPGGCIQPRGPIEQVYQEIAILKKLDHPNVVKLVEVLDDPNEDHLYMVFELVNQGPVMEVPTLKPLSEDQARFYFQDLIKGIEYLHYQKIIHRDIKPSNLLVGEDGHIKIADFGVSNEFKGSDALLSNTVGTPAFMAPESLSETRKIFSGKALDVWAMGVTLYCFVFGQCPFMDERIMCLHSKIKSQALEFPDQPDIAEDLKDLITRMLDKNPESRIVVPEIKLHPWVTRHGAEPLPSEDENCTLVEVTEEEVENSVKHIPSLATVILVKTMIRKRSFGNPFE-GSRREERSLSAPGNLLTKK---------------------   </p>
                        <p>KKCC2_MOUSE (78)	74:Phosphoserine;96:Phosphoserine;458:Phosphoserine;475:Phosphoserine;                                                                                                                                                                                                                                                                                                                                                                                                                                    </p>
                        <p>------------------------------------------DQPPEADGQE-LPLEASDPESRSP-LSGRKMSLQE-------PSQGGPASSSNSLDMNGRCIRRPTVESHHVSITGLQDCVQLNQYTLKDEIGKGSYGVVKLAYNENDNTYYAMKVLSKKKLIRQAGFPRRPPPRGARPAPGGCIQPRGPIEQVYQEIAILKKLDHPNVVKLVEVLDDPNEDHLYMVFELVNQGPVMEVPTLKPLSEDQARFYFQDLIKGIEYLHYQKIIHRDIKPSNLLVGEDGHIKIADFGVSNEFKGSDALLSNTVGTPAFMAPESLSETRKIFSGKALDVWAMGVTLYCFVFGQCPFMDERIMCLHSKIKSQALEFPDQPDIAEDLKDLITRMLDKNPESRIVVPEIKLHPWVTRHGAEPLPSEDENCTLVEVTEEEVENSVKHIPSLATVILVKTMIRKRSFGNPFE-GSRREERSLSAPGNLLTKK---------------------   </p>
                        <p>KKCC2_HUMAN (78)	74:Phosphoserine;83:Phosphoserine;92:Phosphoserine;96:Phosphoserine;100:Phosphoserine;458:Phosphoserine;475:Phosphoserine;                                                                                                                                                                                                                                                                                                                                                                                </p>
                        <p>----------------------------------------------------------------RPHLSGRKLSLQERAAGGSLDMNICPYSPVSSPQSSPRLPRRPTVESHHVSITGMQDCVQLNQYTLKDEIGKGSYGVVKLAYNENDNTYYAMKVLSKKKLIRQAGFPRRPPPRGTRPAPGGCIQPRGPIEQVYQEIAILKKLDHPNVVKLVEVLDDPNEDHLYMVFELVNQGPVMEVPTLKPLSEDQARFYFQDLIKGIEYLHYQKIIHRDIKPSNLLVGEDGHIKIADFGVSNEFKGSDALLSNTVGTPAFMAPESLSETRKIFSGKALDVWAMGVTLYCFVFGQCPFMDERIMCLHSKIKSQALEFPDQPDIAEDLKDLITRMLDKNPESRIVVPEIKLHPWVTRHGAEPLPSEDENCTLVEVTEEEVENSVKHIPSLATVILVKTMIRKRSFGNPFE-GSRREERSLSAPGNLLTKK---------------------   </p>
                        <p>KKCC_CAEEL (71)	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          </p>
                        <p>--------------------------------------------------------------------------------------EAGPHSSNNAATMSPNL-SRPTRYVKSVSQQRSESYIQLNQYRLMEEIGQGSYGIVKLAYNEEDKNLYALKVLDKMKLLKNFACFRQPPPRRNKE-NAAPSVLRNPLQLVQKEIAILKKLSHPNVVKLVEVLDDPNDNYLYMVFEFVEKGSILEIPTDKPLDEDTAWSYFRDTLCGLEYLHYQKIVHRDIKPSNLLLSDIGQVKIADFGVSCEFEGIDAFLSGTAGTPAFMAPEALTEGANHFSGRAQDIWSLGITLYAFVIGTVPFVDNYIIALHKKIKNDPIVFPEAPILSEALQDIILGMLKKDPGHRLMLHEVKVHTWVTRDGTVPMSSEQENCHLVTVTEEEIENCVRVIPRLDTLILVKAMGHRKRFGNPF------------------------------------------   </p>
                </div>
                </div>
                <p className="text-justify">            
                The first two lines represent the ID and sequence of the query protein, and the following lines are the aligned sequences by Blast with the PTM annotations in the Uniprot/Swiss-Prot database. 
                Each alignment result consists of two lines: the first line contains the Uniprot sequence access ID, 
                the Blast identity in the parenthesis, 
                the selected PTM types for annotations and the corresponding positions 
                (according to the position of the query sequence) that have the annotations;
                the second line contains the aligned amino acids, with hyphens "-" representing the unaligned ones.
                </p> 
                
                <p>2 View predicted PTM sites in 3D structure:</p>
                <p>This function provides the visualization of the predicted PTM sites in the context of protein 3D structure. Once click the 
                   <img src="img/show3d.PNG" /> button, a list of homologous proteins that have known 3D structures will be shown in a new tab (need to allow pop-up windows):
                </p>
                <img className={style.jpg6} src="img/6.png" />
                <p></p>
                
                <p>
                  <p className="text-justify">
                  Users can choose one protein and by clicking the <img src="img/showedbutton.png" /> button, the 3D structure with the information of the predicted PTM sites will be shown in a new page.
                  </p>
                  <p>Here is an example:</p>
                  <img className={style.jpg7} src = "img/7.png" />
                  <p>The highlighted labels represent the information of the predicted sites, which contains the position on the query sequence, 
                     the amino acid from the query sequence to the mapped PDB sequence, and the predicted PTM types (in abbreviation) for this site. Multiple PTMs are separated by comma ",". 
                     The default representation of the PTM sites and structures will be shown at the first time and users can make changes by adjusting the parameters. Users can add the surface by checking 
                     the "Add surface" box.
                  </p>
                </p>
                <p></p>
                <p></p>
                <h3 className="text-left font-weight-bold" stype={{fontSize:'14px'}}>Dataset:</h3>
                <p className="text-justify">
                   The preprocessed PTM data from the UniProt/Swiss-Prot database is provided to download.
                   By clicking the  <img src="img/downloadptm.png" style={{height:'8vh'}} /> in the header, it shows the following page. 
                </p>
             </div>
          </div>
                <div className={style.ptm}>
                         <Ptm />
                </div>
          <div className = "container">
              <div className = {style.help}>
                <p></p>
                <h3 className="text-left font-weight-bold" stype={{fontSize:'14px'}}>User job history:</h3>
                <p className="text-justify">
                   All the users’ submitted jobs will be saved in the server for 72 hours (up to 100MB) 
                   for the user to check anytime. By clicking <img src="img/userheader.png" /> in the header, an example of the job history is shown below:
                </p>
                
                <div ref = "profile" className ={style.profile}>
                    <Profile userId = "example" 
                             space = {this.state.space} 
                             changeSpace = {this.changeSpace}
                             showProfile = "true"
                             handleShowResult = {this.handleShowResult} 
                    />
                </div>
               <p>The jobs are listed in the chronological order of the job submission. 
                  Users can view, download, and delete the jobs. 
                  When viewing a job, the query PTMs are shown in the selection field of BLAST-BASED ANNOTATION.
                </p>
            </div>
          </div>
          <div className = {this.state.showProOutput ? style.result : style.resultHide}>
                    <Output title = {this.state.title} 
                            input = {this.state.input} 
                            results = {this.state.results} 
                            currentresultstatus = "All:100"
                            userId = "example"
                            outputjobId={this.state.outputjobId}
                            modelOptions = {this.state.profilemodelOptions}
                    />
                    <div className = {style.ptmannotation}>
                       <ul>
                       <li>Phosphorylation:  <span style={{fontWeight: '700',color:'Blue'}}>P</span></li>
                       <li>Glycosylation:  <span style={{fontWeight: '700',color:'Red'}}>gl</span></li>
                       <li>Ubiquitination:  <span style={{fontWeight: '700',color:'Gray'}}>ub</span></li>
                       <li>SUMOylation:  <span style={{fontWeight: '700',color:'Olive'}}>su</span></li>
                       <li>Acetyllysine:  <span style={{fontWeight: '700',color:'Orange'}}>ac</span></li>
                       <li>Methylation:  <span style={{fontWeight: '700',color:'Black'}}>me</span></li>
                       <li>Pyrrolidone carboxylic acid:  <span style={{fontWeight: '700',color:'Purple'}}>pc</span></li>
                       <li>Palmitoylation:  <span style={{fontWeight: '700',color:'Maroon'}}>pa</span></li>
                       <li>Hydroxylation:  <span style={{fontWeight: '700',color:'Green'}}>Hy</span></li>
                       </ul>
                    </div>
            </div>
            <p></p>
            
            <div className = "container">
              <div className = {style.help}>
                     <p></p>
                     <h3 className="text-left font-weight-bold" stype={{fontSize:'14px'}}>Web API:</h3>
                     <p className="text-justify">
                     We provide Web APIs for automated prediction and homology-based search. We also provide template programs in Python to interpret how to use these APIs, 
                     which can be accessed by clicking <img src="img/api.PNG" style={{cursor: 'pointer'}} onClick = {this.props.handleShowAPI} /> in the header.</p>
                     <p></p>
                     <h3 className="text-left font-weight-bold" style={{fontSize:'14px'}}>Stand-alone tool:</h3>
                     <p className="text-justify">
                         We also provide a stand-alone tool, which can be accessed by clicking  
                     <a href = "https://github.com/duolinwang/MusiteDeep_web"><img src="img/downloadtool.png" style={{height:'8vh',cursor: 'pointer'}} /></a></p>
              
              </div>
            </div>
     </div>
		)
	}
}


export default Help

//<p><img src="img/4.png" style={{width: '80%',margin: '10px 10px 10px 10px'}} /></p>
