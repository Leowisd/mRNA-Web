#OS: Ubuntu 16.04.5 LTS
#Python: Python 3.5 
import requests
import json

#users can only selected the following PTM models:
modeloptions = [
"Phosphoserine_Phosphothreonine",
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
"Hydroxylysine",
]
model=modeloptions[0] #for single model
model=modeloptions[0]+";"+modeloptions[3] #for multiple model
seq="MERSPAVCCQDPRAELVERVAAISVAHLEEAEEGPEPASNGVDPPPRARAASVIPGSASRPTPVRPSLSARKFSLQERPAGSCLEAQVGPYSTG"

url = "http://www.musite.net:5000/musitedeep/"+model+"/"+seq;
url = "http://localhost:5000/musitedeep/"+model+"/"+seq;

myResponse = requests.get(url)
if(myResponse.ok):
       # In this Example, jData are prediction results from MusiteDeep predictor
       jData = json.loads(myResponse.content.decode('utf-8'))
       if "Error" in jData.keys(): #when invalid sequence is provided
           print(jData["Error"])
       else:
           print(jData)
else:
    myResponse.raise_for_status()
    
