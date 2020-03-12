#OS: Ubuntu 16.04.5 LTS
#Python: Python 3.5 

#For PTM prediction:
import requests
import json
#users can only selected from the following PTM models:
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
                "Hydroxylysine",
               ]

model=modeloptions[0]+";"+modeloptions[3] #for multiple model
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
jData is in the json format
The results are in the 'BlastResults' filed, jData['BlastResults'],which is a list contains PTM annotaions for each position, including 'PTMPosition','PID','Seq', and 'Identity'.
'''

#users can only selected from the following PTM types:
PTMoptions = [
"Phosphoserine",
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
"Hydroxylysine",
]
PTMoption=PTMoptions[0] #for single PTM
PTMoption=PTMoptions[0]+";"+PTMoptions[4] #for multiple model
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

#The Blast results are in the 'BlastResults' filed, jData['BlastResults'],which is a list contains PTM annotaions for each position, including 'PTMPosition','PID','Seq', and 'Identity'.