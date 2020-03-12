import React, { Component } from 'react';
import style from './api.module.css';
//var __html = require('./predict.html');
//var template = { __html: __html };


class Api extends React.Component{

	constructor(props){
		super(props);
		this.state = {
            template1:false,
            template2:false,
		}
	}
    handletemplate1=()=>{
      this.setState(prevState => ({
		  template1: !prevState.template1
		}));
        //console.log(this.state.template1)
    }
    
    handletemplate2=()=>{
      this.setState(prevState => ({
		  template2: !prevState.template2
		}));
          //console.log(this.state.template2)
    }
	render(){
		return (
                 <div className={style.api}>
                    <h3>MusiteDeep Web API</h3>
                    <hr />
                    <p style={{marginBottom:'20px'}}>We provide Web APIs for automated prediction and homology-based search. We also provide template programs in Python to interpret how to use these APIs.</p>
                    <p>{`1. Get prediction results for the selected prediction models {models} and sequence {sequence}`}</p>
                    <p><span style ={{paddingRight:'40px',color:'blue'}}>GET:</span><span>{`http://www.musite.net:5000/musitedeep/{models}/{sequence}`}</span></p>
                  <button style={{marginTop:'10px'}} className={style.submit} onClick={this.handletemplate1}>Python template</button>
                  <div className = {this.state.template1? style.code: style.codeHide}>
                  <pre style={{padding:'10px'}}>{`#OS: Ubuntu 16.04.5 LTS
#Python: Python 3.5 
import requests
import json
#users can only select from the following PTM models:
modeloptions = ["Phosphoserine_Phosphothreonine",
                "Phosphotyrosine",
                "N-linked_glycosylation",
                "O-linked_glycosylation",
                "Ubiquitination",
                "SUMOylation",
                "N6-acetyllysine",
                "Methylarginine",
                "Methyllysine",
                "Pyrrolidone_carboxylic_acid",
                "S-palmitoyl_cysteine",
                "Hydroxyproline",
                "Hydroxylysine"]

#http://www.musite.net:5000/musitedeep/Phosphoserine_Phosphothreonine;O-linked_glycosylation/MERSPAVCCQDPRAELVERVAAISVAHLEEAEEGPEPASNGVDPPPRARAASVIPGSASRPTPVRPSLSARKFSLQERPAGSCLEAQVGPYSTG
model=modeloptions[0]+";"+modeloptions[3] #for multiple models
seq="MERSPAVCCQDPRAELVERVAAISVAHLEEAEEGPEPASNGVDPPPRARAASVIPGSASRPTPVRPSLSARKFSLQERPAGSCLEAQVGPYSTG"
url = "http://www.musite.net:5000/musitedeep/"+model+"/"+seq;
myResponse = requests.get(url)
if(myResponse.ok):
       # In this Example, jData are prediction results from MusiteDeep predictor
       jData = json.loads(myResponse.content.decode('utf-8'))
       if "Error" in jData.keys(): 
           print(jData["Error"])
       else:
           print(jData)
else:
    myResponse.raise_for_status()

'''
jData is in the JSON  format.
The results are in the 'Results' field, jData['Results'],which is a list containing the prediction information for each residue, including 'Residue','Position','PTMscores' and 'Cutoff=0.5'.

Example results:
{"querySeq":"MERSPAVCCQDPRAELVERVAAISVAHLEEAEEGPEPASNGVDPPPRARAASVIPGSASRPTPVRPSLSARKFSLQERPAGSCLEAQVGPYSTG",
 "Results":[{"Position":"4","PTMscores":"Phosphoserine:0.823;O-linked_glycosylation:0.133","Residue":"S","Cutoff=0.5":"Phosphoserine:0.823"},
            {"Position":"24","PTMscores":"Phosphoserine:0.423;O-linked_glycosylation:0.133","Residue":"S","Cutoff=0.5":"None"},
            {"Position":"39","PTMscores":"Phosphoserine:0.552;O-linked_glycosylation:0.304","Residue":"S","Cutoff=0.5":"Phosphoserine:0.552"},
            {"Position":"52","PTMscores":"Phosphoserine:0.876;O-linked_glycosylation:0.56","Residue":"S","Cutoff=0.5":"Phosphoserine:0.876;O-linked_glycosylation:0.56"},
            {"Position":"57","PTMscores":"Phosphoserine:0.726;O-linked_glycosylation:0.59","Residue":"S","Cutoff=0.5":"Phosphoserine:0.726;O-linked_glycosylation:0.59"},
            {"Position":"59","PTMscores":"Phosphoserine:0.539;O-linked_glycosylation:0.642","Residue":"S","Cutoff=0.5":"Phosphoserine:0.539;O-linked_glycosylation:0.642"},
            {"Position":"62","PTMscores":"Phosphothreonine:0.842;O-linked_glycosylation:0.779","Residue":"T","Cutoff=0.5":"Phosphothreonine:0.842;O-linked_glycosylation:0.779"},
            {"Position":"67","PTMscores":"Phosphoserine:0.555;O-linked_glycosylation:0.377","Residue":"S","Cutoff=0.5":"Phosphoserine:0.555"},
            {"Position":"69","PTMscores":"Phosphoserine:0.546;O-linked_glycosylation:0.232","Residue":"S","Cutoff=0.5":"Phosphoserine:0.546"},
            {"Position":"74","PTMscores":"Phosphoserine:0.854;O-linked_glycosylation:0.156","Residue":"S","Cutoff=0.5":"Phosphoserine:0.854"},
            {"Position":"82","PTMscores":"Phosphoserine:0.575;O-linked_glycosylation:0.311","Residue":"S","Cutoff=0.5":"Phosphoserine:0.575"},
            {"Position":"92","PTMscores":"Phosphoserine:0.466;O-linked_glycosylation:0.172","Residue":"S","Cutoff=0.5":"None"},
            {"Position":"93","PTMscores":"Phosphothreonine:0.458;O-linked_glycosylation:0.146","Residue":"T","Cutoff=0.5":"None"}
            ]}
'''`}
                    </pre>
                  </div>
                  <p style={{marginTop:'20px'}}>{`2. Get homology-based search results for the selected PTM types {ptms} and sequence {sequence}`}</p>
                  <p><span style ={{paddingRight:'40px',paddingBottom:'20px',color:'blue'}}>GET:</span><span>{`http://www.musite.net:5000/blast/{ptms}/{sequence}`}</span></p>
                  <button style={{marginTop:'10px'}} className={style.submit} onClick={this.handletemplate2}>Python template</button>
                  <div className = {this.state.template2? style.code: style.codeHide}>
                  <pre style={{padding:'10px'}}>
{`import requests
import json
#users can only select from the following PTM types:
PTMoptions = ["Phosphoserine",
              "Phosphothreonine",
              "Phosphotyrosine",
              "N-linked_glycosylation",
              "O-linked_glycosylation",
              "Ubiquitination",
              "SUMOylation",
              "N6-acetyllysine",
              "Methylarginine",
              "Methyllysine",
              "Pyrrolidone_carboxylic_acid",
              "S-palmitoyl_cysteine",
              "Hydroxyproline",
              "Hydroxylysine"]

#http://www.musite.net:5000/blast/Phosphoserine;O-linked_glycosylation/MERSPAVCCQDPRAELVERVAAISVAHLEEAEEGPEPASNGVDPPPRARAASVIPGSASRPTPVRPSLSARKFSLQERPAGSCLEAQVGPYSTG
PTMoption=PTMoptions[0]+";"+PTMoptions[4] #for multiple PTMs
seq="MERSPAVCCQDPRAELVERVAAISVAHLEEAEEGPEPASNGVDPPPRARAASVIPGSASRPTPVRPSLSARKFSLQERPAGSCLEAQVGPYSTG"
url = "http://www.musite.net:5000/blast/"+PTMoption+"/"+seq;
myResponse = requests.get(url)
if(myResponse.ok):
       jData = json.loads(myResponse.content.decode('utf-8'))
       if "Error" in jData.keys():
           print(jData["Error"])
       else:
           print(jData)
else:
    myResponse.raise_for_status()

'''
jData is in the JSON  format.
The results are in the 'BlastResults' field, jData['BlastResults'],which is a list containing PTM annotaions for each position, including 'PTMPosition','PID','Seq', and 'Identity'.

Example results:
{"querySeq":"MERSPAVCCQDPRAELVERVAAISVAHLEEAEEGPEPASNGVDPPPRARAASVIPGSASRPTPVRPSLSARKFSLQERPAGSCLEAQVGPYSTG",
"BlastResults":[{"PID":"KKCC1_RAT","Identity":"(100)","PTMPosition":"67:Phosphoserine;74:Phosphoserine;","Seq":"MERSPAVCCQDPRAELVERVAAISVAHLEEAEEGPEPASNGVDPPPRARAASVIPGSASRPTPVRPSLSARKFSLQERPAGSCLEAQVGPYSTG"},
                {"PID":"KKCC1_MOUSE","Identity":"(96)","PTMPosition":"67:Phosphoserine;74:Phosphoserine;","Seq":"MESGPAVCCQDPRAELVDRVAAINVAHLEEADEGPEPARNGVDPPPRARAASVIPGSASRPTPVRPSLSARKFSLQERPAGSCLGAQVGPYSTG"},
                {"PID":"KKCC1_HUMAN","Identity":"(91)","PTMPosition":"67:Phosphoserine;74:Phosphoserine;","Seq":"MEGGPAVCCQDPRAELVERVAAIDVTHLEEADGGPEPTRNGVDPPPRARAASVIPGSTSRLLPARPSLSARKLSLQERPAGSYLEAQAGPYATG"}
               ]}
'''                  
`}
                  </pre>
                  </div>
                  </div>
		)
	}
}


export default Api


