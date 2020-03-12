import React, { Component } from 'react';
import saveAs from 'file-saver';
import JSZip from 'jszip';
import $ from 'jquery';
import style from './profile.module.css';
import swal from 'sweetalert';

const Record = (props) =>{
      //let showfilename = props.value.split('/')[-1]
      let showfilename = props.value //is a folder! 改用户的所有job的文件夹名字。
	  return(
      <div className = {style.item}>
        <div>{props.value}</div>
        <div className = {props.jobStatus=="completed"? style.completed : style.uncompleted} >{props.jobStatus}</div>
        <div>{props.seqNumber}</div>
        <div>
          <span title={props.value} onClick = {props.handleShowResult}>Show</span>
          <span title={props.value} onClick = {props.handleDownload}>Download</span>
          <span title={props.value} onClick = {props.handleDelete}>Delete</span>
        </div>
      </div>
  )

}

class Profile extends React.Component{

	constructor(props){
		super(props);
		this.state = {
			records: [],
            jobStatusList:[],
            jobSeqnumList:[],
		}
	}

  //下载历史输入输出
  handleDownload = e => {
    let title = e.target.title;
    $.ajax(
      {
        type: 'post',
        url: '/download',
        data: {
          'fileName': title,
          'fileType': 'upload-files',
          'userId': this.props.userId
        },
        //在浏览器端生成压缩包并下载
        success: data =>{
          if(data){
            let zip = new JSZip();
            data.forEach(e => {
              if(e.name!="seq_num.txt")
              {
              zip.file(e.name, e.data);
              }
            })
            zip.generateAsync({type: 'blob'}).then( content => {
              saveAs(content, `${title}.zip`);
            });
          }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
                  console.log(XMLHttpRequest.status);
                  console.log(XMLHttpRequest.readyState);
                  console.log(textStatus);
            }
      }
    )
  }

  //删除历史文件，这个是当点击delete时调用的
  //不需要kill 后台程序，因为输入文件删除了，后台程序自动没有了。也不需要主动删除waitlist上的job，因为先运行一会儿发现输入文件没有了，也就自动停了。
  //主动删除更好。看看怎么弄。。 对查看url的job好，返回的错误是job不存在了，但是要过一会儿 运行到它时才行，最好主动删除！！
  //waitinglist 是一个list 想想怎么删除。
  handleDelete = e => {
    let title = e.target.title;
    if(this.props.userId == "example")
    {
    swal({
      text: "You cannot delete the examples!",
      icon: "info",
      button: "Got it!"})
    
    return;
    }else{
      $.ajax(
      {
        type: 'post',
        url: '/delete',
        data: {
          'fileName': title,
          'userId': this.props.userId
        },
        success: data =>{
          if(data){
            this.handleCheckSpace();            
            let records = this.state.records;
            let idx = records.indexOf(title);
            
            records.splice(idx, 1);
            this.setState({
              records: records
            })
            this.handleRead();
          }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
                  console.log(XMLHttpRequest.status);
                  console.log(XMLHttpRequest.readyState);
                  console.log(textStatus);
            }
      }
     )
    }
  }


  //读取历史文件的输入输出并显示 把/suers/uplod-files下当前user的所有文件夹的名字返回
  handleRead = () => {
    //console.log('props.userId is ', this.props.userId) //ok 
    $.ajax({
        type: 'post',
        url: '/loadJob',//只把成功submit的返回，在waitinglist 或者tasklist都可以，把其他的只提交input的job删掉。
        data: {
          //'email': this.props.user,//transfer this email to loadJob.js for email variable ctx.request.body.email
          'userId': this.props.userId
        },
        success: data => { //this data is the return from fn_load function is the userFiles and it is a folder
          if(data){
            this.setState({
              records: data["jobId"],
              jobStatusList:data["jobStatus"],
              jobSeqnumList:data["jobSeqnum"],
            })
            
            
            //console.log('userFiles is ', data["jobId"])
            //console.log('jobStatus is ', data["jobStatus"])
            let allcomplete=true;
            for(let js=0;js<data["jobStatus"].length;js++)
            {
                if(data["jobStatus"][js] != 'completed')
                {
                    allcomplete=false;
                }
            }
            console.log(allcomplete)
            if(allcomplete)
            {
              clearInterval(this.interval);
            }
            
          }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
                  console.log(XMLHttpRequest.status);
                  console.log(XMLHttpRequest.readyState);
                  console.log(textStatus);
        }
    })  
  }
  



  //查看已使用的空间大小
  handleCheckSpace = () => {
    $.ajax({
        type: 'post',
        url: '/checkSpace',
        data: {
          'username': this.props.userId
        },
        success: data => {
          if(data){
            //console.log(data);
            this.props.changeSpace(data); 
          }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
                  console.log(XMLHttpRequest.status);
                  console.log(XMLHttpRequest.readyState);
                  console.log(textStatus);
        }
    })    
  }

//如果加了下面这个，几乎会一直update，只有一个好处就是在show 时，如果一个job结束了，running会立即变为complete，如果下面的didupdate，每隔5秒会检查一下，也很好。
//componentWillReceiveProps = () =>{
//    if(this.props.showProfile){
//        console.log("componentWillReceiveProps")
//        this.handleRead();
//     }
//     
//  }
//
componentDidUpdate(prevProps)
{
      if(this.props.showProfile!== prevProps.showProfile)
      {
          if(this.props.showProfile)
          {
               console.log("componentDidUpdate!")
               this.handleCheckSpace();
               this.handleRead();
              //console.log("this is showprofile")
              this.interval = setInterval(()=>{
              //console.log("jobinterval~~~~~~~~~~~~~~~~~~~~")
              this.handleCheckSpace();
              this.handleRead();},5000)
          }else{
              //console.log("showProfile is false!")
              //console.log("delete interval################")
              clearInterval(this.interval);
              
          }
      }
      
}
componentDidMount = ()=>
{
      console.log("componentDidMount!");
      this.handleCheckSpace();
      this.handleRead();
      
}
 
 //下面这个不work！
 componentWillUnmount () {
  // It's necessary to do this otherwise the interval
  // will be executed even if the component is not present anymore. 
  clearInterval(this.interval);
  }
  


//现在不需要了，在componentDidUpdate里第一次就设置了 read及checkspace。
//shouldComponentUpdate = nextProps => {
//    
//    console.log("in shouldcomponentupdate"); //not a problem
//    if(nextProps.userId !== this.props.userId){
//      console.log("userID change");
//      this.handleRead();
//      this.handleCheckSpace();
//    }
//    if(nextProps.showProfile && !this.props.showProfile){
//      console.log("showprofile change");
//      this.handleCheckSpace();
//      
//      
//    }
//    //console.log(nextProps.space, this.props.space)
//    if(nextProps.space !== this.props.space){
//      console.log("space change");
//      //this.handleRead();//外部的导致space变了，也不需要读job
//      this.handleCheckSpace();
//    }
//    
//    
//    return true;
//  }

	render(){
		let records = this.state.records;
		return (
         <div>
  	      <h2 style={{'textAlign':'center'}}>USER JOB HISTORY</h2>
  	      <div className = {style.history}>
  	      	<h3>Hello! {this.props.userId}</h3>
  	      	<h3>You have submitted the following jobs ({this.props.space} MB of 100 MB used): </h3>
            <div className = {style.records}>
                 <div className = {style.record}>
                    <div className = {style.item}>
                        <div>Job ID</div>
                        <div>Status</div>
                        <div># of sequences</div>
                    </div>
                 </div>
    	      	 {records.map((e, idx) =>{
    	      		return (
    	      			<div className = {style.record} key = {e}>
    		      			<Record value = {e} jobStatus = {this.state.jobStatusList[idx]} seqNumber = {this.state.jobSeqnumList[idx]} handleShowResult = {this.props.handleShowResult} handleDownload = {this.handleDownload} handleDelete = {this.handleDelete}/>
    		      		</div>
    	      		)
    	      	  })}
            </div>
  	      </div>
	      </div> 
		)
	}	
}


export default Profile

//			<div className = {this.props.showProfile ? style.profile : style.profile}>
//          <h6 style={{'textAlign':'center'}}>(only for upload mode)</h6>
