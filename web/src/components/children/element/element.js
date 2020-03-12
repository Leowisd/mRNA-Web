import React from 'react';
//import ReactTooltip from 'react-tooltip';
//这里的element组件就是sequence中具体的位点字母，有三种type，正常的位点、记录长度的数字、blast的位点
//seq 是要展示的sequence 结果，pos 是上面一长条的位置每10个一个位置，blast 是blast 的显示结果


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

const colormap={
  'P':'Blue',
  'gl':'Red',
  'ub':'Gray',
  'ac':'Orange',
  'me':'Black',
  'pc':'Purple',
  'pa':'Maroon',
  'Hy':'Green',
}

//下面这个必须大写才好使/////
const PTMEACH = props =>{
  let ptm = props.value
  let ptmcolor = colormap[ptm]
  return(
  <p style={{marginBottom:'0',marginTop:'0',fontWeight: 700,color:ptmcolor}}>{ptm}<br /></p>
  )
}



const Element = props =>{

     let titleStype = {
    marginTop:0,
    marginBottom:0,
    marginLeft:0,
    marginRight:0,
    paddingLeft:0
        }
  let titleItemStyle ={
          marginBottom:'2px'
        }
    if(props.type === 'ptmlabel'){
     //id 氨基酸的 index 从1 开始
    //props.value 当前的氨基酸
    //value 一个位点上最大的score
    //props.curValue 当前的阈值条的值
    //results predict 对于这条seq的所有result
    let id = props.id;
    //let value = Math.floor(Number(props.results[id]) * 100);
    let value=0; //
    let results=[];
    let ptmtypes=[];
    if(props.results.hasOwnProperty(id)){
      results=props.results[id].split(";");
      //console.log(results)
      let values=[];
      results.forEach(result => {
        let tempvalue = Number(result.split(":")[1])
        values.push(tempvalue);
        //ptmtypes.push(result.split(":")[0]);
        if(tempvalue>Number(props.curValue))
        {ptmtypes.push(ptmshort[result.split(":")[0]])}
       })
       //console.log(ptmtypes);
       value = Math.max.apply(Math, values); //只要一个ptm大于阈值就高亮，所以这里算则score的最大值赋给当前位置，作为当前位置值。
       //console.log(value);
    }
    let spanStyle = {};
    if(value <= Number(props.curValue)){
      spanStyle = {
        opacity: 0,
      }
    }
    
    return(
      <span style = {spanStyle}>
      {ptmtypes.map((ptm,index)=>{return (<PTMEACH value = {ptm} key={'ptmeach'+index}/>)})}
      |</span>
    )
  }else if(props.type === 'ptmlabel2'){ // 可能用不上了。
     //id 氨基酸的 index 从1 开始
    //props.value 当前的氨基酸
    //value 一个位点上最大的score
    //props.curValue 当前的阈值条的值
    //results predict 对于这条seq的所有result
    let id = props.id;
    //let value = Math.floor(Number(props.results[id]) * 100);
    let value=0; //
    let results=[];
    let ptmtypes=[];
    if(props.results.hasOwnProperty(id)){
      results=props.results[id].split(";");
      //console.log(results)
      let values=[];
      results.forEach(result => {
        let tempvalue = Number(result.split(":")[1])
        values.push(tempvalue);
        //ptmtypes.push(result.split(":")[0]);
        if(tempvalue>Number(props.curValue))
        {ptmtypes.push(ptmshort[result.split(":")[0]])}
       })
       //console.log(ptmtypes);
       value = Math.max.apply(Math, values); //只要一个ptm大于阈值就高亮，所以这里算则score的最大值赋给当前位置，作为当前位置值。
       //console.log(value);
    }
    let spanStyle = {'fontSize': '10px'};
    if(value <= Number(props.curValue)){
      spanStyle = {
        opacity: 0,
      }
    }
    
    return(
      <span style = {spanStyle}>|</span>
    )
  }
  else if(props.type === 'seq'){
    //id 氨基酸的 index 从1 开始
    //props.value 当前的氨基酸
    //value 一个位点上最大的score
    //props.curValue 当前的阈值条的值
    //results predict 对于这条seq的所有result
    let id = props.id;
    //let value = Math.floor(Number(props.results[id]) * 100);
    let value=0; //
    let results=[];
    let printresult=[];
    if(props.results.hasOwnProperty(id)){
      //console.log(props.results[id])
      results=props.results[id].split(";");
      //console.log(results)
      let values=[];
      //let ptmtypes=[];
      results.forEach(result => {
        let tempvalue = Number(result.split(":")[1])
        values.push(tempvalue);
        //ptmtypes.push(result.split(":")[0]);
        if(tempvalue>Number(props.curValue))
        {printresult.push(result)}
       })
       //console.log(values);
       value = Math.max.apply(Math, values); //只要一个ptm大于阈值就高亮，所以这里算则score的最大值赋给当前位置，作为当前位置值。
       //console.log(value);
    }
    let bgYellow = Math.round(200 - value*100);
    //console.log("bgYellow is "+bgYellow.toString());
    let backgroundColor = 'rgba( 255,' + bgYellow + ', 0,0.95)'
    let spanStyle = {
      backgroundColor: '#fff'
    };
    if(value > Number(props.curValue)){
      spanStyle = {
        backgroundColor: backgroundColor,
        borderRadius: '5%'
      }
      let dataplacement = "bottom";
      //const tooltip_title=<ul>{printresult.map((e,index)=>{return(<li>{e}</li>)})}</ul>
      let tooltip_title = printresult.join("\n");
      //console.log(printresult)
      //console.log("tooltip_title is "+ tooltip_title);
      let tooltip_toggle="tooltip";
      //tooltip_disable=false;
    
    return(
    <React.Fragment>
    <span style = {spanStyle} 
          data-toggle={tooltip_toggle} 
          data-placement={dataplacement} 
          data-html="true"
          data-trigger='click hover'
          title={tooltip_title}>
          {props.value}
    </span>
    {/*<span style={spanStyle} data-place='bottom' data-tip data-for='data-title' data-event='click focus hover' >{props.value}</span>
     <ReactTooltip  id='data-title' globalEventOff='click' >
       <ul style={titleStype}>{printresult.map((epredict,indexpredict)=>{return(<li style={titleItemStyle}>{epredict}</li>)})}</ul>
    </ReactTooltip>*/}
     
    </React.Fragment>
    )}
    else{
        return(
        <span style = {spanStyle}>
        {props.value}
        </span>
        )
        
    }
  }

  else if(props.type === 'posvalue'){
    let spanStyle = {'fontSize': '10px',margin:0};
    let value = props.value;
    if(value % 10 !== 0){
      spanStyle = {
        opacity: 0,
        'fontSize': '10px',
         margin:0,
      }
    }
    return(
     
      <span style = {spanStyle}>
        {value}
      </span>
    )
  }

  else if(props.type === 'pos'){
    let spanStyle = {'fontSize': '6px',margin:0};
    let value = props.value;
    if(value % 10 !== 0){
      spanStyle = {
        opacity: 0,
        'fontSize': '6px',
      }
    }

    return(
     
      <span style = {spanStyle}>
        |
      </span>
    )
  }
  else if(props.type === 'blast'){
    let spanStyle = {};
    let value = props.value; //当前seq的一个氨基酸
    let hashpos = props.pos;// 当前seq的 pos的字典，key是pos，value是ptm list。
    let pos = Object.keys(hashpos); //list of poses
    let index = props.index; //氨基酸的位置。 检查一下，应该都是从1开始的 传过来的index 是 +1 了，pos 是从1 开始，检查一下blast的 download结果，对不对。
    if(pos.indexOf(String(index)) >= 0){
      spanStyle = {
        backgroundColor: 'rgba(122, 173, 241, 0.9)',
        borderRadius: '5%'
      }
      let tooltip_title=hashpos[index].join("\n");
      let dataplacement = "top";
      let tooltip_toggle="tooltip";
      return(
      <React.Fragment>
      <span style = {spanStyle} data-toggle={tooltip_toggle} data-trigger='click hover' data-placement={dataplacement} data-html="true" title={tooltip_title}>
          {value}
      </span>
      {/*<span style={spanStyle} data-place='bottom' data-tip data-for='data-title' data-event='click focus hover' >{value}</span>
      <ReactTooltip  id='data-title' globalEventOff='click' >
      <ul style={titleStype}>{hashpos[index].map((eblast,blastindex)=>{return(<li style={titleItemStyle}>{eblast}</li>)})}</ul>
      </ReactTooltip>*/
      }
      </React.Fragment>       
      )
    }

    else{
      return(
      <span style = {spanStyle}>
        {value}
      </span>
      )
    }
  }
}

export default Element
//
//    the following one works but not looks good 下面这个很快
//    return(
//      <span style = {spanStyle} data-toggle={tooltip_toggle} data-placement={dataplacement} title = {tooltip_title}>
//          {props.value}
//      </span>
//    )  

 
// 下面这个也work 是react的，但是很慢，不知道为什么

//    return(
//    <React.Fragment>
//        <span style = {spanStyle} data-tip={tooltip_title} data-for='ptmvalue' data-tip-disable={tooltip_disable} data-place="bottom"> {props.value}</span>
//       <ReactTooltip effect='solid' id="ptmvalue" delayShow = '0' getContent={(dataTip) =>
//         <ul><li>{dataTip}</li>
//         </ul> }>
//       </ReactTooltip>
//       </React.Fragment>
//    )   


//this one not work ..... 下面这个会报错，大是是我想展示的格式。
//    return(
//    <React.Fragment>
//        <span style = {spanStyle} data-tip={tooltip_title} data-for='ptmvalue' data-tip-disable={tooltip_disable} data-place="bottom"> {props.value}</span>
//       <ReactTooltip effect='solid' id="ptmvalue" delayShow = '0' getContent={(dataTip) =>
//         <ul>{dataTip.map((e,index)=>{return(<li>{e}</li>)})}
//         </ul> }>
//       </ReactTooltip>
//       </React.Fragment>
//    ) 


//    return(
//    <React.Fragment>
//      <span style = {spanStyle} data-toggle={tooltip_toggle} data-placement={dataplacement} data-html="true" title={popover}>
//          {props.value}
//      </span>
//    </React.Fragment>
//
//    ) 


// <span style = {spanStyle}>
//        |
//        <br />
//        {value}
//      </span>
//{ptmtypes.map((ptm,index)=>{return ({ptm})})}

//{ptmtypes.map((ptm,index)=>{return (<ptmeach value = {ptm} key={'ptmeach'+index}/>)})}      
