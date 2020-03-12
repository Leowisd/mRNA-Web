import React, { Component } from 'react';
import swal from 'sweetalert';
import $ from 'jquery';
import Header from './components/super/header/header';
import Summary from './components/super/summary/summary';
import Warning from './components/super/warning/warning';
import Verify from './components/super/verify/verify';
import Predict from './components/super/predict/predict';
import Ptm from './components/super/ptm/ptm';
import Contact from './components/super/contact/contact';
import Api from './components/super/api/api';
import Help from './components/super/help/help';
import Profile from './components/super/profile/profile';
import Output from './components/super/output/output';
import Footer from './components/super/footer/footer';
import './main.module.css';
import style from './main.module.css';

class Main extends Component {

	constructor(props){
		super(props);
		this.state = {
		showProfile: false,
		showOutput: false,
    showProOutput: false,//profile 的output 
    showPtm: false, //展示ptm数据页
    showAPI:false,
    showContact:false,//展示contact页面
    showHelp:false,//展示help页面
		data: "",
    processeddata:"",//data after preprocessing
		time: "",
    modelOptions: [{label: "Phosphorylation (S,T)", value:"Phosphoserine_Phosphothreonine"}], //default one 如果不想要，就设为null
    profilemodelOptions:null, //只当想show profile时用这个option。
		title: [],
		input: [[]],
    uploadcontent:"",//不直接upload了，只把变量保存。
    uploadSeqNum:0,
		results: [{}],
    outputjobId:"", //output显示的job上面显示一个id。一次output只能有一次有效的id
		space: 0,
		userId:'',
    currentresultstatus:"Start:0", //一次只能显示一个results，这个用于记录upload file的结果情况。 不只是upload file copy seq 也用这个。
    currentjob:'', //一个用户可以有list of jobs，但是一次show只能显示最后一个，否则就乱了！用currentjob记录用户的最后要show的目录，就是time
		visitors: '',
    processed_num_proteins:'',
    processed_num_sites:'',
    showPredict: true, //展示用户输入框。
    pasted:true, //pasted mode
    reversed:false,
    reversedsubmitted:false,
    jobsubmit:false,
    outputdata2:[], 
    recievedfile:"",
    outputstr4:[], //New resultbulk include : inputtitle(PID) + result1(include result:a b c d) + result2..
    inputhead2:[],
    inputcontent2:[], //New inputDataContent && without inputtitle(PID)
    textkey:0, //New still devlp
    Rcolor:0,  //New still devlp
    Dcolor:1  //New still devlp
		}
        console.log("in constructor")
	}

  changeSpace = value => {
    this.setState({
      space: value
    })
  }

  //修改sequence
  changeInput = e => {
    let data = e.target.value;
    //console.log(data)
    this.setState({
      data: data
    });
  };

  //修改model
  changeModel = modelOptions => {
  this.setState({modelOptions:modelOptions});
  let temp ="";
  }
  
  //点击example
  handleExample = () =>{
    this.setState({
      data: ">1100,NM_001006115\nCCGCCATCTTGTTGTTGATCCGTACCCAGTGGGCAGCGCCGGGAGCTGGACCAAGCGGCCGGTGAGAGGCCGCTGTAGCGGTGC\n>0001,NM_002033\nAATCCCTCCCTCCGGCGGGCGTCGCTGGCGGGTGGCTAGGCCCAACGGCAGGAAGCCGACGCTATCCTCCGTTCCGCGGCGCCGGGTCCGCCTTCCGTCTGTTCTAGGGCCTGCTCCTGCGCGGCAGCTGCTTTAGAAGGTCTCGAGCCTCCTGTACCTTCCCAGGGATGAACCGGGCCTTCCCTCTGGAAGGCGAGGGTTCGGGCCACAGTGAGCGAGGGCCAGGGCGGTGGGCGCGCGCAGAGGGAAACCGGATCAGTTGAGAGAGAATCAAGAGTAGCGGATGAGGCGCTTGTGGGGCGCGGCCCGGAAGCCCTCGGGCGCGGGCTGGGA"
    })
  }

  //当进行新的预测时，将state中存储的以前的输入输出清空
  clearResult = () => {
    this.setState({
      title: [],
      input: [[]],
      results: [{}],
      currentresultstatus:"Start:0",
      outputdata2:[],
      outputstr4:[],
      inputcontent2:[]

    })
  }

  Rchangekeymain = ()=>{
    this.setState({
      textkey:1,
      Rcolor:1,
      Dcolor:0
      })
    //console.log(this.state.textkey)

  }

  Dchangekeymain = ()=>{
    this.setState({
      textkey:0,
      Rcolor:0,
      Dcolor:1
      })
    //console.log(this.state.textkey)

  }


  //提交输入的sequence
  handlePredictSeqmain = () => {
      //check valid fasta file
      //console.log("the current data is "+ this.state.data)
      // 没有选择任何model
      if(this.state.modelOptions == null || this.state.modelOptions.length == 0 ){
        swal({
          text: "Please select at least one PTM model!",
          icon: "info",
          button: "Got it!"//,
          //timer: 3000
        });
        return;
      }
      
      
      if(this.state.data.charAt(0) !=">")
      {
       //console.log("seq not start with \>");
       swal({
            title: "Invalid FASTA format",
            text: "Please paste sequences  with the correct FASTA format!\
                   The first line must be started with > and only alphabet, *, -, space, and line breaks are accepted in the sequence.",
            icon: "info",
          button: "Got it!"//,
          //timer: 3000
        });
        return;
      }
      let cmdkey = this.state.textkey;
      console.log(cmdkey)
      let len = this.state.data.split(/[\r\n]+\>/).length;
      //console.log("num of sequences "+len);
      let residuenum = 0;
      let fasta=this.processCheck_Data(this.state.data);//if false not fasta format else return preprocessed fasta data
      if(fasta ==0)
      {
          swal({
             title:"Invalid FASTA format",
            text: "Please paste sequences  with the correct FASTA format!\
                   The first line must be started with > and only alphabet, *, -, space, and line breaks are accepted in the sequence.",
            icon: "info",
             button: "Got it!"//,
            //timer: 3000
             });
            return;
      }
      
      if(fasta ==1)
      {
          swal({
             text: "Duplicate protein IDs are found in your input data, please check!\n",
             icon: "info",
             button: "Got it!"//,
            //timer: 3000
             });
            return;
      }
       
      //输入为空
      if(len === 0){
        swal({
          text: "Please input at least one sequence!",
          icon: "info",
          button: "Got it!"//,
          //timer: 3000
        });
        return;
      }
      
      //输入太大
        if(len > 10  || fasta[1] > 5000){
          swal({
            title: "Input sequences reach the limitation!",
            text: `10 sequences or 5000 residues at most for this paste mode, there are ${len} sequences and ${fasta[1]} residues in your input. Please reduce the size or upload a FASTA file.`,
            icon: "info",
            button: "Got it!"//,
            //timer: 3000
          });
          return;
        }
      
      if(this.state.pasted)
      { 
        console.log(this.state.pasted)
        this.setState({
            showOutput: true,
        })
      }
      
      //clear the previous data(input and output) 
      this.clearResult();
      
      //scroll window to output
      setTimeout(() => window.scrollTo(0, this.refs.footer.offsetTop), 200); 
      
      //更新处理的蛋白质个数，并写入文件
      //len = Number(this.state.processed_num_proteins) + len
      //residuenum=Number(this.state.processed_num_sites) + residuenum
      
      //console.log("the state.processeddata in predictictsubmit is "+this.state.processeddata) //用这个只是表明有时set state不work 
      //console.log("the fasta in predictictsubmit is "+fasta)
      let time = new Date().toISOString(); //this is the current time
      this.setState({
		  time: time,
          outputjobId:time
	  })
      
     $.ajax(
            {
              type: 'post',
              url: '/cmd',
              data: {
                'input': fasta[0], //cannot depend on this.state sometimes the set work after ajax!!!! don't understand why!
                'model': this.state.modelOptions,
                'userId': localStorage.getItem('userIdMusiteDeep'),
                'time':time,
                'seqNum':len,
                'textkey':cmdkey,
              },
              //dataType: 'json',
              success: data =>{
                console.log(data);
              	//if(time !== this.state.time){
              	//	return;
              	//}
                if(data == 'error'){
                  swal({
                    title: "Prediction failed!",
                    text: "please try again later.",
                    icon: "info",
                    button: "Got it!"//,
                    //timer: 3000
                  });
                  this.setState({
                    registerErrorMsg: data,
                    showOutput: false,
                  })
                  return;                  
                }
                else {
                  this.setState({
                    //originalInput: data[0],
                    //originalResults: data[1],
                    processed_num_proteins: data[2],
                    processed_num_sites: data[3],
                  })
                  console.log(data[0])
                  console.log(data[1])
                  this.processData(data[0], data[1]);
                  this.handleShowOutput();
                }
              },
              error: (XMLHttpRequest, textStatus, errorThrown) => {
              	//if(time !== this.state.time){
              	//	return;
              	//}
                //只有长时间不相应这个才会发生。
                swal({
                  title: "Prediction failed!",
                  text: "Reduce sequences size or try again later.",
                  icon: "info",
                  button: "Got it!"//,
                  //timer: 3000
                });
                this.setState({
                  showOutput: false
                })
                console.log(XMLHttpRequest.status);
                console.log(XMLHttpRequest.readyState);
                console.log(textStatus);
                return;
              }
            }
            )
     
     let resultstatus=0;
     let statuscount=0;
     let interval = setInterval(()=>
     {
       //console.log("interval begin in handlepredictseqmain");
       //console.log(this.state.showPredict)
       //console.log(this.state.pasted)
       if(time == this.state.time && this.state.showPredict && this.state.pasted) //只有当前数据的time与当前的state的time是一个才work，如果换了work 这个就不能再继续了。 并且当前是paste 及predict 模式
       {
          if(Number(resultstatus < 100))
          {  
          $.ajax(
          {
          type: 'post',
          url: '/readcmdstatus',
          data: {
          'input': fasta, //cannot depend on this.state sometimes the set work after ajax!!!! don't understand why!
          'userId': localStorage.getItem('userIdMusiteDeep'),
          'time':time,
          },
          //dataType: 'json',
          success: data =>{
            //console.log(data);
            if(data.search("nostatus") != -1){ //由于开始地太快，可能没有job的status file 允许等待一会儿，儿不是reject。
                
                statuscount+=1;
                if(statuscount>10){
                  swal({
                  title: "Prediction failed!",
                  text: "Please try again later.",
                  icon: "info",
                  button: "Got it!"//,
                  //timer: 3000
                  });
                  clearInterval(interval);
                }
            }
            else{
               
                resultstatus=data.split(":")[1]
                this.setState({
                currentresultstatus: data
              })
              //console.log("processed "+data)
            }
          },
          error: (XMLHttpRequest, textStatus, errorThrown) => {
                    console.log(XMLHttpRequest.status);
                    console.log(XMLHttpRequest.readyState);
                    console.log(textStatus);
                    //clearInterval(interval); //如果失败了再循环，直到100. 什么都不要返回。由cmd那个ajax 去返回。 
              }
          })
          }else{clearInterval(interval);}
          if(Number(resultstatus == 100))
          {
          clearInterval(interval);   
          }
       }else{clearInterval(interval);}
       },1000)
  }

//上传文件 file is uploaded saved in file variable
//这里暂时改一下，ondrop并不上传文件，只对文件进行检查。
onDrop = file => {
  	if(file.length < 1) return;
  	let userId = localStorage.getItem('userIdMusiteDeep');
    let size = Number((file[0].size / (1024 * 1024)).toFixed(3));
    let sum = size + Number(this.state.space);
    
    //文件太大
    if(size>10)
    {
      swal({
        text: "Please upload a smaller file, 10MB at most.",
        icon: "info",
        button: "Got it!"//,
        //timer: 3000
      });
      return;
    }
    
    //该用户文件总尺寸达到上限。
    if(sum > 100){
      swal({
        title: "You have reached your storage limitation (100MB)!",
        text: "Please delete old files (view by clicking USER JOB HISTORY) or upload a smaller file instead.",
        icon: "info",
        button: "Got it!"//,
        //timer: 3000
      });
      return;
    }

    //set time, only show latest result(be same to the time state), it's to deal with the case that user submit several times.
		//console.log("current state time is "+this.state.time+" in ondrop")
    //console.log("current time is "+time+" in ondrop")
    //console.log("current state time is "+this.state.time+" in ondrop")
    //console.log('Received file: ', file[0]['name']);
    let data = new FormData();
    data.append('file', file[0]);
    data.append('userId', userId);
    this.setState({
      showOutput: false
    })

    //clear the previous data(input and output) 
    this.clearResult();
    
    $.ajax(
    {
      type: 'post',
      url: '/uploadcheck',
      data: data,
      processData: false,
      contentType: false,
      success: data => {
      
      //console.log(data)
       if(!data["success"]){
          swal({
            title: "Upload file failed!",
            text: "Please try again later!",
            icon: "info",
            button: "Got it!"//,
            //timer: 3000
          });
          this.setState({
            showOutput: false,
          })
          return;
      }
      if(!data["fasta"]){
          swal({
            title: "Invalid FASTA format",
            text: "Please upload seqeucnes with the correct FASTA format!\
                   The first line must be started with > and only alphabet, *, -, space, and line breaks are accepted in the sequence.",
            icon: "info",
            button: "Got it!"//,
            //timer: 3000
          });
          this.setState({
            showOutput: false,
          })
          return;
      }
      if(data["duplicate"]){
          swal({
            text: "Duplicate protein IDs are found in your input data, please check!\n",
            icon: "info",
            button: "Got it!"//,
            //timer: 3000
          });
          this.setState({
            showOutput: false,
          })
          return;
      }
      this.setState({
           recievedfile: file[0]['name'],
           uploadcontent:data["input"],
           uploadSeqNum:data['uploadSeqNum'],
        })
        
      
      this.turnToUploadSuccess();
      
      },
      error: (XMLHttpRequest, textStatus, errorThrown) => {
        swal({
          title: "Upload file failed, please try again later!",
          icon: "info",
          button: "Got it!"//,
          //timer: 3000
        });
        this.setState({
          showOutput:false, 
        }) 
        console.log(XMLHttpRequest.status);
        console.log(XMLHttpRequest.readyState);
        console.log(textStatus);
        return;
      }
    }
  	)
  }


	turnToInput = () => {
		this.setState({
            pasted:true,
			reversed: false,
            reversedsubmitted:false,
            jobsubmit:false,
		})
	}
    
	turnToUpload = () => {
		this.setState({
			reversed: true,
            reversedsubmitted:false,
            pasted:false,
            jobsubmit:false,
            showOutput:false,
            showProOutput:false,
		})
	}
    
	turnToUploadSuccess = e =>{  
		this.setState({
        reversedsubmitted: true,
        reversed:false,
        pasted:false,
        showOutput:false,
        showProOutput:false,
        jobsubmit:false,
        //showPtm: false  
		})
	}
    
    turnTojobSubmitted = e =>{
        this.setState({
            jobsubmit: true,
            reversedsubmitted:false,
            reversed:false,
            pasted:false,
            showOutput:false,
            showProOutput:false,
        })
        
    }

//在上传文件状态下 点击start prediction时调用 这里改了，只负责提交不显示output
handleuploadpredict = () => {
  	//let userId = this.state.userId;
    //let time = this.state.time;
    this.setState({
      showOutput: false, //这里改了，所有upload的都不会在这个地方显示output！
      showProOutput:false,
    })
    
    //clear the previous data(input and output) 
    this.clearResult();
    // 没有选择任何model
      if(this.state.modelOptions == null || this.state.modelOptions.length == 0 ){
        swal({
          text: "Please select at least one PTM model!",
          icon: "info",
          button: "Got it!"//,
          //timer: 3000
        });
        return;
    }
    //scroll window to output 因为不要显示output了，所以下面这个没有用了
    //setTimeout(() => window.scrollTo(0, this.refs.footer.offsetTop), 200); 
    //这个main里，记录的job时间是submit时间，不是upload file的时间。
    let time = new Date().toISOString();//以上传文件时的时间记录这个job
	this.setState({
		time: time
    })
    
    //可能传大数据需要这个。
    let data = new FormData();
    let userId = this.state.userId;
    let modelOptions = {'models':this.state.modelOptions};
    let uploadcontent = this.state.uploadcontent;
    let uploadSeqNum=this.state.uploadSeqNum;
    data.append('userId', userId);
    data.append('time', time);//这里改了，submit重新获取time，记录这个时间
    data.append('modelOptions',JSON.stringify(modelOptions));
    data.append('uploadcontent',uploadcontent);
    data.append('uploadSeqNum',uploadSeqNum);
    
    $.ajax(
    {
      type: 'post',
      url: '/uploadpredict',
      data: data,
      processData: false,//必须把这个设为false才可以！ 否则jquery会parse
      contentType: false,
      timeout:0, //设置为无限等待。 否则不同浏览器有默认的等待时间, 不work
      //processData: false,
      //contentType: false,
      success: data => {
        if(data instanceof Array){//永远不可能到这一步了。后台不会给前台返回任何结果了。
        //    this.setState({
        //      originalInput: data[0],
        //      originalResults: data[1],
        //      processed_num_proteins: data[2],
        //      processed_num_sites: data[3]
        //    })                
        //  console.log(data[2]);
        //  this.processData(data[0], data[1]);
        //  this.handleShowOutput(); //received data prescent the data set the showOutput to true
        }else if(data === 'amountError'){
          swal({
            text: "Please wait for your previous files’ processing! (One user is allotted to process up to 5 jobs at the same time.)",
            icon: "info",
            button: "Got it!"//,
            //timer: 3000
          });
          this.setState({
            showOutput: false,
          })
        }else if(data = "submitted")
        {
        //console.log("jobsubmit="+this.state.jobsubmit);
        this.turnTojobSubmitted();
        //console.log("jobsubmit="+this.state.jobsubmit);
        //以后有了域名了localhost：3000 可以改为www.musite.net url 已经改到'../../children/jobsubmitted/jobsubmitted.js'里处理了
        //swal({
        //title: "Your job has been submitted, which can be accessed by the following url or refer to USER JOB HISTORY:",
        //text: `localhost:3000/job/${this.state.userId}/${this.state.time}/${this.state.model}`,
        //icon: "info",
        //button: "Got it!"
        //}); 
        }
        else {
          console.log("wait for submit");
          swal({
            text: data,
            icon: "info",
            button: "Got it!"//,
            //timer: 3000
          });
          this.setState({
            showOutput: false,  
          }) 
        }
      },
      error: (XMLHttpRequest, textStatus, errorThrown) => {
        //swal({
        //  title: "Prediction failed, please try again later!",
        //  icon: "info",
        //  button: "Got it!"//,
        //  //timer: 3000
        //});
        //this.setState({
        //  showOutput:false, 
        //}) 
        console.log(XMLHttpRequest.status);//500
        console.log(XMLHttpRequest.readyState);//4
        console.log(textStatus);//error
        console.log(errorThrown);//Internal server error
      }
    }
  	)
    //以下程序只是为了调试用，实际应该在后台的app.js 调用 waitinglist与tasklist的交互。
    //下面这个不能用！ 刷新就没有了。为了调试！！！！！！！！！
    //let interval = setInterval(()=>
    //{
    //let results = '';
    //if(results != "jobfinished" || results !='jobnotexists')
    //{
    //   $.ajax(
    //   {
    //      type:'post',
    //      url: '/uploadpredict_check',
    //      data: {
    //      'userId':this.state.userId,
    //      'time':this.state.time, //因为以上传文件时的时间记录这个job，所以这里不能重新获取time
    //      'model':this.state.model
    //      },
    //      success: data =>{
    //        if(data){
    //            results = data[0];
    //      }},          
    //   })
    //
    //}else{clearInterval(interval);}
    //},5000)
    
  }

  //在submit时检查input数据，并把空格，空白的行去掉等操作，如果是fasta返回true 否则返回false
  processCheck_Data = (input) =>{
   // console.log(input)
    let res = [];
    let title;
    let aanum = 0; //记录氨基酸个数，如果返回data 时同时返回。
    let titlehash = new Object();
    if(input.charAt(0) != '>'){
        //console.log("fasta failed 1")
        return 0;
    }
    input = input.split(/[\r\n]+\>/);//devide sequences
    //console.log("inputs in processCheck_Data"+input)
    //inputs.shift(0);//delete the blank element
    let len = input.length;//how many sequences
    let data = "";
    let data2 = [];
    //console.log(input);
    let j=0;
    for(let e of input){
      //e = e.replace( /,/g, '' );
      e = e.split(/[\n\r]+/);
      title=e[0];//第一个一定是id
     // console.log(""+e[0]);
      if(j==0)
      {
          title = title.slice(1); //the first title contains > need to be removed
      }
      if(titlehash.hasOwnProperty(title)){
          //console.log("duplicate id are found!");
          return 1; //duplicate id error
      }else{
          titlehash[title]=1;
      }
      e.shift(0);//这个是id要去掉
      if(e[e.length - 1] === ''){
        e.pop();//如果最后一个是空也要去掉
      }
      
      e = e.join('').replace(/\s+/g,''); //去掉sequence间所有可能的空格
      //console.log("current e in processCheck_Data is"+e)
      aanum +=e.length; //记录氨基酸个数。
      if(e.match(/^[a-zA-Z-\*]+$/)==null)
      {
          //console.log("fasta failed 2")
          return 0;
      }

      data+=">"+title+"\n"+e.toUpperCase()+"\n";
      data2.push(e.toUpperCase());
      j++;
    }

    //console.log("outputdata2= "+this.state.outputdata2);
    res.push(data);
    res.push(aanum);
    return res;
    }

 //对返回的输入输出进行格式处理，然后将新的输入输出存到state中。
 //对结果的输入输出处理，多结果的处理也是在这里地方！
  processData = (input, output) =>{
    //console.log("input="+input)
    //console.log("output:"+output)
     input = input.split(/[\r\n]+\>/);
     let inputhead=[];
     let inputcontent=[];

      for(let e of input){
           e = e.split(/[\n\r]+/);
           inputhead.push(e[0]);
           inputcontent.push(e[1])
         }

    let title = this.state.title;
    let results = [{}];
    let tmp = [];
    let j=0;
    let outputstr=[];
    let outputstr3=[]
    
    outputstr = output.split(/[\r\n]+/);
    if(output[output.length - 1] === ''){
        output.pop();//如果最后一个是空也要去掉
    }
   // console.log("outputstr:"+outputstr[0])

    for(let i=0;i<outputstr.length;i++){
      let outputstr2=[];
      outputstr2=outputstr[i].trim().split(/[\s]+/);
     // console.log("outputstr2="+outputstr2[1])
      outputstr3[i]=outputstr2;



    }
    //console.log("str3="+outputstr3[1][2])

    this.setState({
      outputstr4:outputstr3,
      title:inputhead,
      inputcontent2:inputcontent,
      currentresultstatus:"All:100"
    })
    console.log(this.state.outputstr4)
    console.log(this.state.inputhead2)
    console.log(this.state.inputcontent2)

    //console.log("outputstr2="+outputstr2[0])
    //console.log(output);
    let outputhash = {};//一个hash table，key 是seqid，之后是list，按顺序，里面存pos \t ptm：score1|ptm2：score2|ptm3:score3
    let scores;
    let score;
    let pos;
    let id;
    let ptmtypes;
    let lastshow="";
   
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
            //console.log(data);
            if(data)
            {
             //console.log(data);
             this.setState({
             profilemodelOptions: data,
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
  
  
  //个人主页中点击show查看某一条历史数据，返回新的输入输出
  handleShowResult = e => { //e is the parameters used when call this handleshowresult
    let title = e.target.title;
    let resultstatus = 0;
    //把之前的结果清除，一个output只能显示一个结果！
    this.clearResult();
    this.setState({
        currentjob: title, //currentjob 永远设为最后一次按show 的title
    })
    this.handleShowProOutput();
    this.setState({
        outputjobId: title,
    })
    
    this.handleGetmodeloptions(this.state.userId,title);
    //let userrecords = []
    
    let statuscount=0;
    
    //下面的intervel只对有的job还在运行的时候有用，对于已经完成的job有点慢了。如果加一个status，可以对complete的job直接读取。
    
    let interval = setInterval(()=>
    {
       //console.log("interval begin in handleShowResult")
       //console.log("currentjob="+this.state.currentjob)
       //console.log("current title="+title)
       
       //下面的showproOutput 一定有延迟，开始state 不能是true，即使上面设置为了true也不行，有1秒的延迟。
       if(this.state.currentjob == title && this.state.showProOutput) //只有当interval里的title与当前job一致时才要继续，否则停止。用户可能换了一个job show了。
       {
       if(Number(resultstatus) <100)
        { 
          $.ajax(
          {
          type: 'post',
          url: '/readJobstatus',
          data: {
            'userId': this.state.userId,
            'time': title,
          },
          //dataType: 'json',
          success: data =>{
            if(data){
              if(data[0].search("inwaiting_") != -1)
              {
              swal({
              title:"In queue",
              text: "There are "+data[0].split("_")[1]+" jobs ahead of JobID:"+title+". Please wait and check it later.",
              icon: "info",
              button: "Got it!"//,
              //timer: 3000
              });
              this.setState({showProOutput: false})
              clearInterval(interval);
              this.clearResult();
              }else if(data[0] == 'jobnotexists'){  //这个jobnotexists只，连input 都没有，folder都没有了。
              swal({
              title:"Error",
              text: "Job:"+title+" does not exist! Please resubmit the job! ",
              icon: "info",
              button: "Got it!"//,
              //timer: 3000
              });
              clearInterval(interval);
              this.clearResult();
              this.setState({showProOutput: false})
              }else if(data[0] == 'jobhasnotstart')
              {
                swal({
                     title: "Not started",
                     text: "Job "+title+" has not started! Please try again later",
                     icon: "info",
                     button: "Got it!"//,
                    //timer: 3000
                 });
                 this.clearResult();
                 this.setState({showProOutput: false})
              }else if(data[0] == 'nostatus')//可能访问过快，job 的status没有生成。
              {
              statuscount+=1;
              if(statuscount>10)
              {
                swal({
                  title:"Error",
                  text: "Something wrong with your Job:"+title+"! Please try again later (refreshing this webpage)!",
                  icon: "info",
                  button: "Got it!"//,
                  });
                  clearInterval(interval);
                }
              }
              else{
                this.setState({
                currentresultstatus: data[0]
                })
                resultstatus=data[0].split(":")[1]
                //console.log("processed "+resultstatus)
              }
            }
          },
          error: (XMLHttpRequest, textStatus, errorThrown) => {
            this.handleShowProfile();
            if(XMLHttpRequest.status == 404){
              swal({
              title:"Error",
              text: "No results found for this Job"+title+"! Please resubmit the job! ",
              icon: "info",
              button: "Got it!"//,
              //timer: 3000
            });
            }
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
                    clearInterval(interval); //如果失败了就删除interval
                    this.clearResult(); //并且不显示输出
                    this.setState({showProOutput: false})
              }
          })
          }else{clearInterval(interval);}
          if(Number(resultstatus) ==100)
          {
              $.ajax(
                {
                  type: 'post',
                  url: '/read',
                  data: {
                    'userId': this.state.userId,
                    'time': title,
                  },
                  //dataType: 'json',
                  success: data =>{
                    if(data){
                        this.setState({
                        //originalInput: data[0],
                        //originalResults: data[1],
                        //currentresultstatus: data[2]
                      })
                      //this.processCheck_Data(data(0));
                      console.log(data[0]);
                      console.log(data[1]);
                      this.processData(data[0], data[1]); //最关键这个有结果？
                      this.handleShowProOutput();
                    }
                  },
             error: (XMLHttpRequest, textStatus, errorThrown) => {
              this.handleShowProfile();
              if(XMLHttpRequest.status == 404){
                
                swal({
                title:"Error",
                text: "No results found for this Job:"+title+"! Please resubmit the job! ",
                icon: "info",
                button: "Got it!"});}else{
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
            clearInterval(interval); //如果失败了就删除interval
            this.setState({showProOutput: false})
            }
          })
          clearInterval(interval);
          }
    }else{clearInterval(interval);}
  },1000)
  
  }


  justshowit=()=>{
    console.log('Succcessful come here ')
    if(localStorage.getItem("MusiteDeepShowPage")!=null){
        if(localStorage.getItem("MusiteDeepShowPage")=="ShowHelp"){
		  this.handleShowHelp(); //main 程序里有这个。
        }
    
    localStorage.removeItem("MusiteDeepShowPage")
    }
  }
  //显示个人主页
  handleShowProfile = e =>{
    window.scrollTo(0, 0);     
    //if(this.state.showProfile){
    //  this.setState({
    //    showProfile: false,
    //    showPredict: true,
    //    showPtm: false
    //  })
    //}
    //else{
      this.setState({
        showProfile: true,
        showPredict: false,
        showOutput: false,
        showProOutput:false,
        showPtm: false,
        showContact:false,
        showAPI:false,
        showHelp:false,
      })
    //}
  }

  //显示输入组件,用户从任何地方点了home就会返回到这个页面。
  handleShowPredict = e =>{
    //window.scrollTo(0, this.refs.main.offsetTop);     
    window.scrollTo(0, 0);
    this.setState({
      showProfile: false,
      showPredict: true,
      pasted: true, //默认是pasted 模式。
      showOutput: false,
      showProOutput:false,
      showPtm: false,
      showAPI:false,
      showContact:false,
      showHelp:false,
      data: "",
      modelOptions: [{label: "Phosphorylation (S,T)", value:"Phosphoserine_Phosphothreonine"}], //default one 如果不想要，就设为null
    })
    this.turnToInput();
    
  }

  //显示结果组件
	handleShowOutput = e =>{
        //scroll to results
        setTimeout(() => window.scrollTo(0, this.refs.footer.offsetTop), 200); 
		this.setState({
      showOutput: this.state.pasted&this.state.showPredict? true:false, //只有当前是predict状态，即不是show别的东西时，并且是paste模式，才会展示output。比如已经转到ptm下载，就算得到了结果调用这个函数，由于showpredict的state已经为false，也不会show output。
      //showPtm: false  
		})
	}


  //在profile里显示结果组件
	handleShowProOutput = e =>{
        //scroll to results
        setTimeout(() => window.scrollTo(0, this.refs.footer.offsetTop), 200); 
		this.setState({
      showProOutput: this.state.showProfile? true:false,
      //showPtm: false  
		})
	}


  //显示ptm组件
  handleShowPtm = e =>{ 
      window.scrollTo(0, 0);     
    //if(this.state.showPtm){
      this.setState({
        showPredict: false,//stay in showPtm
        showOutput: false,
        showProOutput:false,
        showPtm: true,
        showHelp:false,
        showAPI:false,
        showProfile:false,
        showContact:false,
      })
    //}
    //else{
    //  this.setState({
    //    showProfile: false,
    //    showPredict: false,
    //    showOutput: false,
    //    showPtm: true
    //  })
    //}
  }
  
  
  handleShowContact=e=>{
      window.scrollTo(0, 0);     
      this.setState({
          showContact:true,
          showPredict: false,//stay in showPtm
          showOutput: false,
          showProOutput:false,
          showPtm: false,
          showAPI:false,
          showProfile:false,
          showHelp:false,//展示help页面
      })
  }

  handleShowAPI=e=>{
      window.scrollTo(0, 0);     
      this.setState({
          showContact:false,
          showPredict: false,//stay in showPtm
          showOutput: false,
          showProOutput:false,
          showPtm: false,
          showAPI:true,
          showProfile:false,
          showHelp:false,//展示help页面
      })
  }
  handleShowHelp=e=>{
      window.scrollTo(0, 0);     
      this.setState({
          showHelp:true,
          showContact:false,
          showPredict: false,//stay in showPtm
          showOutput: false,
          showProOutput:false,
          showPtm: false,
          showAPI:false,
          showProfile:false,
      })
  }

  //查看网站访问量
  getVisitors = () => {
    $.getJSON('../static/visitors/visitors.json', data => {
      data = data['visitors'] || [];
      this.setState({
        visitors: data.length
      })
    })
  }
  
  //查看网站历史处理过的位点及蛋白质总数
  get_processed_Numbers=()=>{
    $.get('../static/visitors/processed_protein_record.txt', result => {
     var textByLine = result.toString().split(/[\n\r]+/);
     var i;
     this.setState({
        processed_num_proteins: textByLine[0],
        processed_num_sites:textByLine[1]
      })
    });
  }
  
  //给用户创建一个随机的id并存在localstorage里,如果这个用户的getItem里没有userId才会做。
	setUserId = () => {
    let randomId = Number(Math.random().toString().substr(2)).toString(36);
    let time = new Date().toISOString();
    let userId = time + randomId;
    console.log("current userid is"+userId);
   	localStorage.setItem('userIdMusiteDeep', userId);
    this.setState({
      userId: userId
    });
    console.log('userId in setUserId is ',this.state.userId)
  }

  componentDidMount = () => {
    console.log("in didmount")
    window.scrollTo(0, 0);
    //setTimeout(() => window.scrollTo(0, this.refs.main.offsetTop), 5000);
    if(localStorage.getItem('userIdMusiteDeep')){
      this.setState({
      userId: localStorage.getItem('userIdMusiteDeep')
      });
    }
    this.getVisitors();
    this.get_processed_Numbers();
    console.log("localStorage is "+localStorage.getItem('userIdMusiteDeep'));
    if(!localStorage.getItem('userIdMusiteDeep')){
    	 this.setUserId();
         console.log("setUserId to ");
    }
    this.justshowit();
    //console.log('userId in main.js is '+ this.state.userId)
  }

	render(){

        console.log(this.state.Rcolor)
        let showresult = false;
        if(this.state.showProfile && this.state.showProOutput)
        {
            showresult = true;
        }
        if(this.state.showOutput && this.state.showPredict)
        {
            showresult = true;
        }
		return (
		<div className = {style.main}>
        <header>
				  <Header handleShowPtm = {this.handleShowPtm} handleShowAPI={this.handleShowAPI} handleShowContact={this.handleShowContact} handleShowHelp={this.handleShowHelp} handleShowPredict = {this.handleShowPredict} handleShowProfile = {this.handleShowProfile}/>
		</header>
    
        <Summary visitors = {this.state.visitors} num_protein = {this.state.processed_num_proteins} num_sites = {this.state.processed_num_sites}/>
        <main ref = "main" className = { showresult ? style.large : style.small }>
                <div className = {this.state.showPtm ? style.ptm : style.ptmHide}>
                	<Ptm />
                </div>

                <div className = {this.state.showAPI? style.api:style.apiHide}>
                    <Api />
                </div>

                <div className = {this.state.showContact? style.contact:style.contactHide}>
                    <Contact />
                </div>
                
                <div className = {this.state.showHelp? style.help:style.helpHide}>
                    <Help showHelp={this.state.showHelp} handleShowAPI={this.handleShowAPI}/>
                </div>

                <div className ={this.state.showProfile? style.profile:style.profileHide}>
                    <Profile userId = {this.state.userId} 
                        space = {this.state.space} 
                        changeSpace = {this.changeSpace}
                        showProfile = {this.state.showProfile}
                        handleShowResult = {this.handleShowResult} 
                    />
                </div>

                <div className = {this.state.showPredict ? style.predict : style.predictHide}>
		  	     		    <Predict space = {this.state.space} 
                        data = {this.state.data} 
                        processData = {this.processData} 
                        changeModel = {this.changeModel} 
                        changeInput = {this.changeInput} 
                        handleExample = {this.handleExample} 
                        handlePredictSeq = {this.handlePredictSeqmain}
                        RchangekeyPre = {this.Rchangekeymain}
                        DchangekeyPre = {this.Dchangekeymain}
                        Rcolor = {this.state.Rcolor}
                        Dcolor = {this.state.Dcolor}
                        uploadpredict = {this.handleuploadpredict}
                        onDrop = {this.onDrop}
                        recievedfile={this.state.recievedfile}
                        turnToUpload = {this.turnToUpload}
                        turnToInput = {this.turnToInput}
                        pasted = {this.state.pasted}
                        reversed={this.state.reversed}
                        reversedsubmitted={this.state.reversedsubmitted}
                        jobsubmit = {this.state.jobsubmit}
                        jobId = {this.state.time}
                        uploadcontent={this.state.uploadcontent}
                        userId = {this.state.userId}
                        modelOptions = {this.state.modelOptions}
                        handleShowOutput = {this.handleShowOutput}
                    />
                </div>

                <div className = {showresult ? style.result : style.resultHide}>
                    <Output title = {this.state.title} 
                        input = {this.state.input} 
                        outputstr4 = {this.state.outputstr4}
                        inputcontent2={this.state.inputcontent2}
                        results = {this.state.results} 
                        currentresultstatus = {this.state.currentresultstatus}
                        userId = {this.state.userId}
                        outputjobId={this.state.outputjobId}
                        modelOptions = {this.state.showProfile ? this.state.profilemodelOptions : this.state.modelOptions}
                        odata={this.state.data}
                            
                    />
                </div>

        </main>

        <footer ref = "footer">
          <Footer />
        </footer>

		</div>
		);
	}
}


export default Main

//
//       <footer ref = "footer">
//         <Footer />
//       </footer>