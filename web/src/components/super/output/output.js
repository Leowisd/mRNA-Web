import React from 'react';
import swal from 'sweetalert';
import $ from 'jquery';
import saveAs from 'file-saver';
import JSZip from 'jszip';
import Element from '../../children/element/element';
import style from './output.module.css';
import Slider from 'react-bootstrap-slider';
//import Select from 'react-select';
import MySelect from "./MySelect.js";
import _ from 'underscore';


const options = [
{ label: 'Phosphorylation (S,T)', value:"Phosphoserine_Phosphothreonine"},
{ label:'Phosphorylation (Y)', value:"Phosphotyrosine"},
{ label:'N-linked glycosylation (N)', value:"N-linked_glycosylation"},
{ label:'O-linked glycosylation (S,T)', value:"O-linked_glycosylation"},
{ label:'Ubiquitination (K)', value:"Ubiquitination"},
{ label:'SUMOylation (K)', value:"SUMOylation"},
{ label:'N6-acetyllysine (K)', value:"N6-acetyllysine"},
{ label:'Methylarginine (R)', value:"Methylarginine"},
{ label:'Methyllysine (K)', value:"Methyllysine"},
{ label:'Pyrrolidone carboxylic acid (Q)', value:"Pyrrolidone_carboxylic_acid"},
{ label:'S-Palmitoylation (C)', value:"S-palmitoyl_cysteine"},
{ label:'Hydroxyproline (P)',value:"Hydroxyproline"},
{ label:'Hydroxylysine (K)',value:"Hydroxylysine"},
];

const ptmshort ={
"Phosphoserine_Phosphothreonine":'P',
"Phosphotyrosine":'P',
"Phosphoserine":'P',
"Phosphothreonine":'P',
"N-linked_glycosylation":'gl',
"O-linked_glycosylation":'gl',
"Ubiquitination":'ub',
"SUMOylation":'su',
"N6-acetyllysine":'ac',
"Methylarginine":'me',
"Methyllysine":'me',
"Pyrrolidone_carboxylic_acid":'pc',
"S-palmitoyl_cysteine":'pa',
"Hydroxyproline":'Hy',
"Hydroxylysine":'Hy',
};

class Output extends React.Component {
  constructor(props){
    super(props);
    //console.log(this.props)

    const titleNew = [];
    if (props.title.length) {
      props.title.forEach((item) => {
        titleNew.push(false);
      });
    }

    this.state = {
      step: 0.01,
      min: 0,
      max: 1,
      curValue: 0.5, //default prediction score
      current: 1,
      currentshow:1,
      currentSeq: '',
      blastOptions: this.props.modelOptions,
      blastRes: [],
      blasting: false,
      blasted:false,
      isOn:true,
      testdisplay:'none',
      titleNew: titleNew, //control show??  about inputcontent in outputDiv
      aaa:[],//none test
      bbb:[],//none test
      results1:[2],//test
      resules2:[2],//test
      mcontent:[2],//test
    }
  }



testhandleClick=(index)=>{
    console.log("test:"+this.props.title[0]);
    console.log(this.props.outputstr4[0])
    this.state.titleNew[index]= !this.state.titleNew[index];
    this.setState({
      titleNew: this.state.titleNew
    });
    //console.log(this.state.titleNew);
    this.setState({
      aaa: this.props.outputdata2,
      })
}


 // handle 3d table
 handle3Dbutton = (event) => {
    let seq = this.state.currentSeq.split("\n")[1];
    //console.log("current index "+this.state.current)
    let positions = Object.keys(this.props.results[this.state.current - 1]) //results的结构是： PTM1:score1|PTM2:score2|PTM3:score3 key 是position
    let position_selects=[];
    let score;
    let ptms;
    positions.forEach(pos=>{
        ptms = this.props.results[this.state.current-1][pos].split(";");
        //console.log(ptms);
        ptms.forEach(ptm=>{
            score = ptm.split(":")[1];
            if(Number(score)>Number(this.state.curValue))
            {
                position_selects.push(pos+":"+ptmshort[ptm.split(":")[0]]) //用short name to present in 3D
            }
        })        
    })
    let positions_select = position_selects.join("%2C");
    //console.log("current valid pos for 3D is "+positions_select)
    let show3dID = this.props.userId+new Date().toISOString();
    $.ajax({
     type:'post',
     url:'/save3ddata',
     data:{
         'show3dID':show3dID,
         'seq':seq,
         'positions_select':positions_select,
     },
     success: () => {
       //只有传数据成功才打开窗口，这样肯定有数据
       //let out = "http://www.musite.net:5000/3dtable?&show3dID="+show3dID;
       let out = 'http://www.musite.net/show3dtable/'+show3dID;
       window.open(out);
     },
    error: function (XMLHttpRequest, textStatus, errorThrown) {
                      console.log(XMLHttpRequest.status);
                      console.log(XMLHttpRequest.readyState);
                      console.log(textStatus);
    }
    })
  }

    handleClickblasttitle = (e) => {
        window.open(e);
    }

  //在前端生成压缩包并下载,为了减少一次web接收处理数据，不用originalResults，用this.props.results 与 this.props.title, 直接展示。用户profile的download也要改为这一种格式比较好。
  //    let positions = Object.keys(this.props.results[this.state.current - 1]) //results的结构是： PTM1:score1|PTM2:score2|PTM3:score3 key 是position
  //还需要this.props.input 获得position位置的amino acid
  handleDownload = () => {
   /* function compare(a, b){
            return a - b;
    }*/
    let zip = new JSZip();
    //let score = this.state.curValue
    //zip.file('input.fasta', this.props.originalInput); //如果用户上传很大的文件，前端未必可以接受，先不支持input的下载和保存。
    //header
    let downloadoutput="results is:\n";
     for(let i=0;i<this.props.outputstr4.length-1;i++){
        downloadoutput+=this.props.outputstr4[i][0]+this.props.outputstr4[i][1]+this.props.outputstr4[i][2]+this.props.outputstr4[i][3]+"\n"
      
      }
    
    zip.file('Prediction_results.txt', downloadoutput);
    zip.generateAsync({type: 'blob'}).then( content => {
      saveAs(content, `mRNALocResult.zip`);
    });
  }


   
  //在前端生成压缩包并下载处理当前blast数据
  handleblastDownload = () => {
    let zip = new JSZip();
    let blastresult=this.state.currentSeq+"\n"; //第一个应该是query sequence
    this.state.blastRes.forEach(e => {
          //e.pos 不只是一个，这里要有一个循环。
          blastresult += e.printtitle+"\t";
          for(let pos of Object.keys(e.pos))
          {
          blastresult+=pos+":"+(e.pos[pos]).join(",")+";";
          //这个label不只是一个！+" positions:"+e.pos+"\n"+e.seq.join("")+"\n" 还要检查pos是从0开始，还是1！
          }
          blastresult+="\n"+e.seq.join("")+"\n";
    })
    
    //var blastJSON = JSON.stringify(this.state.blastRes);
    //console.log("blastresult:"+blastresult)
    zip.file('blastresult.txt', blastresult);
    zip.generateAsync({type: 'blob'}).then( content => {
    saveAs(content, `blastResult.zip`);
    });
  }
  
  
  handleSelect = blastOptions => {
  this.setState({blastOptions:blastOptions});
  }
  //调用blast
  handleBlast = () => {
    //console.log("userid in blast is "+this.props.userId);
    let currentSeq = this.state.currentSeq;
    //console.log(this.state.currentSeq)
    if(this.state.blasting === true){
      swal({
        text: "Please wait for blast processing!",
        icon: "info",
        button: "Got it!"//,
        //timer: 20000
      });
      return;
    }
    
    if(this.state.blastOptions == null){
     swal({
      text: "Please select at least one PTM annotation!",
      icon: "info",
      button: "Got it!"//,
      //timer:20000
     })
     return;
    }
    if(this.state.blastOptions != null){
    this.setState({
    blasting: true
    })
    $.ajax(
      {
        type: 'post',
        url: '/blast',
        data: {
          'userId': this.props.userId,
          'seq': this.state.currentSeq, //this is single sequence can we do all input?
          'blastOptions': this.state.blastOptions
        },
        success: data =>{
          if(currentSeq !== this.state.currentSeq) return;
          if(data){
            //处理得到的blast结果，以便react在不同位置设置不同颜色
            //data 分为两个部分，一个是blast的比对结果，data[0] 另一个是 annotation的结果，data[1] 里。
            let res = data[0].split('\n');//don't consider the last
            res.shift();//remove the first query seq
            res = res.slice(0,res.length-1);//don't consider the last null 
            res = res.map(e => {
                if(e.split(' ').length>=3){
                //console.log(e)
              let title = e.split(' ')[0].replace(/\s/g, "");//e.substring(0, 10).replace(/\s/g, "");//
              let seq = e.split(' ')[2].split('');         //e.substring(18).split('');//
                let printtitle =title+"\t("+e.split(' ')[1]+")";
                //console.log(title)
                //console.log(seq)
              return {
                'title': title, 
                'printtitle':printtitle,
                'seq': seq,
                'pos': {}, //这里要改，应该是一个{【】} 按pos的顺序，应该也是一个hash key是pos，里面有对于这个pos的【ptm1，ptm2，ptm3.。。。】 
              };
            }})
            res = res.slice(0, 50);// setlect top 50? 
            /* set position */
            let ptms = Object.keys(data[1]); //key 是ptm 值是 整个annotation 文本。
            let pos;
            let es;
            ptms.forEach(ptm=>{
                pos = data[1][ptm].split('\n'); //for single seq 
                pos.map(e => {
                    //console.log(ptm+" pos "+e);
                  es = e.split(' ');
                  let title = es[0];//seq id uniprot acc
                  if(es.length > 1){ //for this seq has annotated positions
                    es.splice(0, 1); //第一个是title 把它去掉。
                        //console.log("poses is "+es);
                    for(let obj of res){//把position放到正确的地方。
                      if(obj['title'] === title){
                                //console.log("yes!");
                                for(let e of es)
                                {
                                if(obj['pos'].hasOwnProperty(e))
                                {
                        obj['pos'][e].push(ptm);// set 'pos' in res
                                //console.log("2 pos in obj "+ptm+" pos "+obj['pos'][e])
                          }else{
                                    obj['pos'][e]=[];
                                    obj['pos'][e].push(ptm);
                                    //console.log("1 pos in obj "+ptm+" pos "+obj['pos'][e])
                                }
                                }
                            }
                    }               
                  }
                })
            })
            this.setState({
              blasting: false,
                blasted:  true,
              blastRes: res
            })
          }
        },
        error: (XMLHttpRequest, textStatus, errorThrown) => {
            this.setState({
            blasting: false,
                blasted:  false
          })
            
          if(currentSeq !== this.state.currentSeq)
            {
            return;
            }
            swal({
            title: "error",
            text: "Please try again later!",
            icon: "info",
            button: "Got it!"//,
            //timer: 20000
          });
                  console.log(XMLHttpRequest.status);
                  console.log(XMLHttpRequest.readyState);
                  console.log(textStatus);
            
            }
      }
    )
    }    
  }

  //改变滑块值
  changeValue = () => {
    this.setState({
      curValue: this.sliderRef.getValue()
    });
  };

  //前翻页
  pageBack = () => {
    if(this.state.current === 1) return;
    this.setState({
      current: this.state.current - 1,
      currentshow:this.state.current - 1,
      blasted:false,
      blasting:false,
      blastOptions:this.props.modelOptions
    })
  }

  //后翻页
  pageForward = () => {
    if(this.state.current === this.props.input.length) return;
    this.setState({
      current: this.state.current + 1,
      currentshow:this.state.current + 1,
      blasted: false,
      blasting: false,
      blastOptions:this.props.modelOptions
    })
  }

  //输入页码
  changePage = e => {
    let pageNumber = Number(e.target.value);
    if(pageNumber===0)
    {
        pageNumber = "";
    }
    if(pageNumber <= this.props.input.length){
        this.setState({
        currentshow:pageNumber,
        })
    }
    console.log("pageNumber is "+pageNumber)
    if(pageNumber >= 1 && pageNumber <= this.props.input.length){
      this.setState({
        current: pageNumber,
        blasted: false,
        blasting:false,
        blastOptions:this.props.modelOptions
      });      
    }

  };

    //为了在得到props 把状态设为初始
    componentWillReceiveProps = () =>{
     this.setState({
      blasted:false,
      blasting:false,
      //current:1,
      //currentshow:1,
     }) 
     }

  //判断是否需要更新组件，避免不必要的刷新以提高性能。
  shouldComponentUpdate(nextProps, nextState) {
    //不显示output时不刷新组件
    if(this.props.showOutput === false && nextProps.showOutput === false){
      console.log('showOUtPut');
      return false;
    }
    if (this.state.titleNew) {
      return true;
    }
    if(this.state.bbb){
      return true;
    }
    //props和state没有变化时不刷新组件
    if(_.isEqual(this.props, nextProps) && _.isEqual(this.state, nextState)){
       //这个false导致，如果正在blast，点同一个protein因为state没有改变，导致这个blast结果也要被显示出来。如果进入这个了，就直接return了，不会有下面的
       console.log('nextState');
      return true;
    }
    //reset page number to 1 when start a new job
    if(nextProps.title.length <= 0){
      console.log('dgdg');
      if(this.state.currentSeq !== ''){
        this.setState({
          currentSeq: ''
        })
      }
      if(this.state.blasting !== false){
        this.setState({
          blasting: false,
                blasted: false
        })
      }
      this.setState({
        current: 1,
        currentshow:1,
        blasted:false,
        blasting:false,
        blastOptions:this.props.modelOptions
      })
    }
    console.log('plplplpl');
    //其他情况更新组件
    return true;
  }


  componentDidMount = () => {
    let current = this.state.current - 1;
    let title = this.props.title || [];
    //console.log(title)
    let seq = this.props.input || [];
    //console.log(seq)
    title = title[current] || '';
    seq = seq[current] || [];
    seq = seq.join('');
    seq = title + '\n' + seq;
  }

  componentWillUnmount () {
  }
  
  componentDidUpdate(){
    let current = this.state.current - 1;
    let title = this.props.title || [];
    //console.log(title)
    let seq = this.props.input || [];
    //console.log(seq)
    title = title[current] || '';
    seq = seq[current] || [];
    seq = seq.join('');
    seq = title + '\n' + seq;
  }






  render(){
  
    let input = this.props.input;
    let items;
    let blastRes = this.state.blastRes; //get blast results all results include query.
    
    if(typeof(this.props.outputstr4)!="undefined"&&this.props.title.length>0){
      let outputtitle =[];
      let outputresult = [];
      let outputM = [];
      for(let i=0;i<this.props.outputstr4.length-1;i++){
        outputtitle.push(this.props.outputstr4[i][0]);
        outputresult.push(this.props.outputstr4[i][2]);
        outputM.push(this.props.outputstr4[i][1]);
      
      }
      let RA = [];
      let RB = [];
      let RC = [];
      let RD = [];

      for(let e of outputM){
        e = e.split(",");
        RA.push(e[0]);
        RB.push(e[1]);
        RC.push(e[2]);
        RD.push(e[3]);
      }

      console.log(outputM);


      items = (
       <div  className = {style.item}>

            <div>
              <button className={style.firstlineB1}>PID</button>
              <button className={style.firstlineB3}>Cytoplasm</button>
              <button className={style.firstlineB3}>Nucleus</button>
              <button className={style.firstlineB3}>Endoplasmic</button>
              <button className={style.firstlineB3}>Ribosome</button>
              <button className={style.firstlineB2}>Subcellular Location</button>
              <button className={style.firstlineB}>InputSep</button>
              <button className={style.firstlineB}>Undifined</button>
            </div>

        <div>  
        { 
          this.props.title.map((item,index)=>{
          
            return(
              <div key={index}>
                <button  className={style.title}>{outputtitle[index]}</button>
                <button  className={style.contentone2}>{RA[index]}</button>
                <button  className={style.contentone2}>{RB[index]}</button>
                <button  className={style.contentone2}>{RC[index]}</button>
                <button  className={style.contentone2}>{RD[index]}</button>
                <button  className={style.contentone}>{outputresult[index]}</button>
                <button  className ={style.a2} onClick={(e) => {this.testhandleClick(index, e)}}>{this.state.titleNew[index] ? 'OFF' : 'Show'} </button>
                <button  className ={style.a}> button2 </button>
                <div  className ={style.otest} style={{display:this.state.titleNew[index] ? 'block' : 'none'}}>{this.props.inputcontent2[index]}</div>
              </div>
            )
          })
        }
        </div>
<div>
              <button className={style.download} onClick = {this.handleDownload}>Save the Result</button>
            </div>

         </div>

        )
    }


    else if(!this.state.blasting){
      items = (
        <div className = {style.loading}>
          <div className = {style.curvalue}>{this.props.currentresultstatus}%</div>
          <div className = {style.loader}>
            <div className = {style.dot}></div>
            <div className = {style.dot}></div>
            <div className = {style.dot}></div>
            <div className = {style.dot}></div>
            <div className = {style.dot}></div>
          </div>
        </div>
      )
    }

    return (

          <div className = {style.output}>
            <div className={style.outputid}>
              <p>Results for JobID: {this.props.outputjobId}</p>
            </div>
            <div className = {style.holder}>
              <div className = {style.items}>
                {items}
               </div>

           

            </div>
          </div>
    
    );
  }
}



export default Output

//<Select className = {style.select} options={options} isMulti closeMenuOnSelect={false} onChange = {this.handleSelect} />
//                      <label onClick=this.handleClickblasttitle(e3['title'])>{e3['printtitle']}</label>
//                    <a style={{display: "table-cell"}} href = {url} target = "_blank">{e3['printtitle']}</a>
//                    <td onClick={()=> window.open({url},"_blank")}>{e3['printtitle']}</td>
//                <span><input type = "number" value = {this.state.current > 0 ? this.state.current : ""} min = "1" max = {this.props.input.length} onChange = {this.changePage}/> &nbsp; of &nbsp; {this.props.input.length}</span>
