import React, { Component } from 'react';
import swal from 'sweetalert';
import $ from 'jquery';
import Header from './components/super/header/header';
import Output from './components/super/output/output';
import Footer from './components/super/footer/footer';
import './job.module.css';
import style from './job.module.css';

class Job extends Component {

	constructor(props){
		super(props);
		this.state = {
      showOutput: true,//这里的showoutput其实没有用。因为job会一直有output。
		  data: "",
      //originalInput: '',//the oritnal input get from backend file
      //originalResults: '',//the oritnal result get from backend file
      currentresultstatus:"Start:0",
		  title: [],
		  input: [[]], //input after postprocessing
		  results: [{}],//results after postprocessing
      modelOptions: null,
      aaa:[2]
	  }
  }

  goToHomePage = () => {
    window.open("http://www.musite.net");
  }
  
  handleShowResult = (JobID,UserID) => {
    //console.log("handleEvent in showresult");
    console.log("current resultstatus is "+this.state.currentresultstatus);
    if(Number(this.state.currentresultstatus.split(":")[1])==100)
    {
      console.log("current resultstatus changed to "+this.state.currentresultstatus);
      $.ajax(
      {
        type: 'post',
        url: '/read',
        data: {
          'time': JobID, //time for transfer to read
          'userId': UserID
        },
        success: data =>{
          if(data){
            //this.setState({
              //originalInput: data[0],
              //originalResults: data[1],
            //})
            this.processData(data[0], data[1]);
          }
        },
        error: (XMLHttpRequest, textStatus, errorThrown) => {
            if(XMLHttpRequest.status == 404){
              swal({
              title: "Error",
              text: "Job:"+JobID+" cannot be found! Please resubmit the job! ",
              icon: "info",
              button: "Got it!"//,
              //timer: 3000
            });
                  this.setState({showOutput: false})
                  clearInterval(this.interval); //如果失败了就删除interval
            }
            else{
              swal({
              title: "Error",
              text: "Something wrong with your Job:"+JobID+"! Please resubmit the job! ",
              icon: "info",
              button: "Got it!"//,
              //timer: 3000
            });
                  clearInterval(this.interval); //如果失败了就删除interval
                  this.setState({showOutput: false})
            }
          console.log(XMLHttpRequest.status);
          console.log(XMLHttpRequest.readyState);
          console.log(textStatus);
          clearInterval(this.interval); //如果失败了就删除interval
          this.setState({showOutput: false})
        }
      }
    )
  }
}

  //读取job的状态，这个函数需要被定时调用
  handlegetJobstatus = (JobID,UserID,statuscount) => {
    console.log("handleEvent");
    console.log("current resultstatus is "+this.state.currentresultstatus);
    if(Number(this.state.currentresultstatus.split(":")[1]) <100)
    {
      console.log(this.state.currentresultstatus)
      $.ajax(
      {
        type: 'post',
        url: '/readJobstatus',
        data: {
          'time': JobID, //time for transfer to read
          'userId': UserID
        },
        success: data =>{
          if(data[0].search("inwaiting_") != -1)
              {
              swal({
              title:"In queue",
              text: "There are "+data[0].split("_")[1]+" jobs ahead of JobID:"+JobID+". Please wait and check it later. ",
              icon: "info",
              button: "Got it!"//,
              //timer: 3000
              });
              this.setState({showOutput: false})
              clearInterval(this.interval);
          }else if(data[0] == 'jobnotexists'){
              //console.log(this.state.title);
              swal({
              title: "Error",
              text: "Job:"+JobID+" does not exist! Please resubmit the job! ",
              icon: "info",
              button: "Got it!"//,
              //timer: 3000
              });
              this.setState({showOutput: false})
              clearInterval(this.interval);
          }else if(data[0] == 'jobhasnotstart')
          {
             swal({
              text: "Job:"+JobID+" has not stated! Please try again later (refreshing this webpage)!",
              icon: "info",
              button: "Got it!"//,
              //timer: 3000
              });
              this.setState({showOutput: false})
              clearInterval(this.interval);
              
          }else if(data[0] == 'nostatus')//可能访问过快，job 的status没有生成。
          {
              statuscount+=1;
              if(statuscount>10)
              {
                swal({
                  title: "Error",
                  text: "Something wrong with Job:"+JobID+"! Please try again later (refreshing this webpage)!",
                  icon: "info",
                  button: "Got it!"//,
                  });
                  clearInterval(this.interval);
                }
          }
          else{
            //成功获取正在运行的job的运行状态。
            console.log("in read jobstatus "+data[0])
            this.setState({
              currentresultstatus: data[0]
            })
            console.log("processed "+data[0])
          }
        },
        error: (XMLHttpRequest, textStatus, errorThrown) => {
            if(XMLHttpRequest.status == 404){
              swal({
              title: "Error",
              text: "Something wrong with Job:"+JobID+"! Please try again later (refreshing this webpage)!",
              icon: "info",
              button: "Got it!"//,
              //timer: 3000
            });
              this.setState({showOutput: false})
              clearInterval(this.interval);
            }
            else{
              swal({
              title: "Error",
              text: "Something wrong with Job:"+JobID+"! Please resubmit the job! ",
              icon: "info",
              button: "Got it!"//,
              //timer: 3000
            });
              this.setState({showOutput: false})
              clearInterval(this.interval);
            }
          console.log(XMLHttpRequest.status);
          console.log(XMLHttpRequest.readyState);
          console.log(textStatus);
          this.setState({showOutput: false})
          clearInterval(this.interval); //如果失败了就删除interval
        }
      }
    )
    }else{clearInterval(this.interval);}
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
    //console.log(output);
    let outputhash = {};//一个hash table，key 是seqid，之后是list，按顺序，里面存pos \t ptm：score1|ptm2：score2|ptm3:score3
    let scores;
    let score;
    let pos;
    let id;
    let ptmtypes;
    let lastshow="";
    for(j=1;j<output.length;j++) //output加了header j 从1开始
    {
        //ptmtypes =output[j].split("\t")[4].split(",");
        //scores = output[j].split("\t")[3].split(",");
        //lastshow=ptmtypes[0]+":"+scores[0]   
        //for(let t=1;t<scores.length;t++)
        //{
        //   lastshow+="|"+ptmtypes[t]+":"+scores[t]
        //}
        //console.log(output[j])
        if(output[j].charAt(0)=='>')
        {
           id = output[j];
           j+=1; //read next line
        }
        pos = output[j].split("\t")[0];
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
      currentresultstatus:"All:100" //因为已经把到这步了，这里可以写100了，因为后台的百分比数改了。
    })
  }
  handleGetmodeloptions = ()=>
  {
    console.log("begin in checkoption");
    $.ajax(
    {
        type:'post',
        url: '/checkoption',
        data:{
            userID:this.props.match.params.UserID,
            JobID:this.props.match.params.JobID
        },
        success: data =>{
            //console.log("succ in checkoption");
            //console.log(data);
            if(data)
            {
             //console.log(data);
             this.setState({
             modelOptions: data,
             })
             //console.log(data);
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
  componentDidMount = () => {
    //The following works!
    //$.getJSON('../users/upload-files/common/'+this.props.match.params.UserID+this.props.match.params.JobID+'_modelOptions.json',data => {
    //$.getJSON('../static/visitors/visitors.json', data=> {
    //this.setState({
    //    modelOptions: data['modelOptions'],
    //  })
    
    //console.log("modeloptions:");
    //console.log(data);
    //})
    //let interval = setInterval(()=>{
    this.handleGetmodeloptions();
    //},3000)
    let statuscount=0;
    this.interval = setInterval(()=>{
    this.handlegetJobstatus(this.props.match.params.JobID,this.props.match.params.UserID,statuscount);
    this.handleShowResult(this.props.match.params.JobID,this.props.match.params.UserID);
    }, 3000)
    
  }
  
  //componentUpdate(){
  //    
  //    
 //}
  
  componentWillUnmount () {
  // It's necessary to do this otherwise the interval
  // will be executed even if the component is not present anymore. 
  clearInterval(this.interval);
  }
	render(){
        //console.log(this.state.modelOptions);
		return (
			<div className = {style.job}>
			  <header>
                <div className = {style.home}>
                  <a href = "http://www.musite.net">MUSITEDEEP HOME</a>
                </div>
              </header>
              <main ref = "main" className = {style.small}>
                  <div className = {style.output}>
                    <Output title = {this.state.title} 
                        input = {this.state.input} 
                        results = {this.state.results} 
                        currentresultstatus ={this.state.currentresultstatus}
                        userId = {this.props.match.params.UserID}
                        outputjobId={this.props.match.params.JobID}
                        modelOptions = {this.state.modelOptions}
                        aaa={this.state.aaa}
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
              </main>
              <footer ref = "footer">
                <Footer />
              </footer>
			</div>
		);
	}
}


export default Job
