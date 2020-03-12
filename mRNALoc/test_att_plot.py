import datetime
import itertools
from collections import OrderedDict
import argparse
import os
import sys
import matplotlib.pyplot as plt
from keras import activations
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
basedir='./'
sys.path.append(basedir)
#sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import tensorflow as tf

gpu_options = tf.GPUOptions()
gpu_options.allow_growth = True
config = tf.ConfigProto(gpu_options=gpu_options)
sess = tf.Session(config=config)
from keras.backend.tensorflow_backend import set_session
import keras.backend as K
set_session(session=sess)

from multihead_attention_model import *
from transcript_gene_data import Gene_Wrapper
from keras.preprocessing.sequence import pad_sequences

encoding_seq = OrderedDict([
    ('UNK', [0, 0, 0, 0]),
    ('A', [1, 0, 0, 0]),
    ('C', [0, 1, 0, 0]),
    ('G', [0, 0, 1, 0]),
    ('T', [0, 0, 0, 1]),
    ('N', [0.25, 0.25, 0.25, 0.25]),  # A or C or G or T
])

seq_encoding_keys = list(encoding_seq.keys())
seq_encoding_vectors = np.array(list(encoding_seq.values()))

gene_ids = None
batch_size = 100 #try 200 later! too slow!
nb_classes = 4

def label_dist(dist):
    #assert (len(dist) == 4)
    return [int(x) for x in dist]

def preprocess_data(left, right,dataset):
    gene_data = Gene_Wrapper.load_sequence(dataset, left, right)
    
    print('padding and indexing data')
    encoding_keys = seq_encoding_keys
    encoding_vectors = seq_encoding_vectors
    X_left = pad_sequences([[encoding_keys.index(c) for c in gene.seqleft] for gene in gene_data],
                      maxlen=left,
                      dtype=np.int8, value=encoding_keys.index('UNK'),padding='post')  #padding after sequence
    
    X_right = pad_sequences([[encoding_keys.index(c) for c in gene.seqright] for gene in gene_data],
                      maxlen=right,
                      dtype=np.int8, value=encoding_keys.index('UNK'),padding='pre')# padding before sequence
    
    print("X_left shape is "+str(X_left.shape))
    print("X_right shape is "+str(X_right.shape))
    X = np.concatenate([X_left,X_right],axis = -1)
    print("X shape is "+str(X.shape))
    y = np.array([label_dist(gene.dist) for gene in gene_data])
    
    mask_label_left = np.array([np.concatenate([np.ones(len(gene.seqleft)),np.zeros(left-len(gene.seqleft))]) for gene in gene_data],dtype='float32')
    mask_label_right = np.array([np.concatenate([np.zeros(right-len(gene.seqright)),np.ones(len(gene.seqright))]) for gene in gene_data],dtype='float32')
    mask_label = np.concatenate([mask_label_left,mask_label_right],axis=-1)
    
    print("training shapes"+str(X.shape)+" "+str(y.shape))
    print("Example y is "+str(y[0,:]))
    return X, y, mask_label, encoding_keys, encoding_vectors



left = 4000
right = 4000
nb_classes=4
dataset_all='../mRNA_multi_data_keepnum_code/modified_mutlilabel_seq.fasta'
#dataset_test = '../../For_paper/biology analyese/HUMAN_beta_actin_NC_000007.14_modified.fasta'
#dataset_test = '../../For_paper/biology analyese/Chicken_beta_actin_NC_000007.14_modified.fasta'
#dataset_test = '../../For_paper/biology analyese/M18055.1.fasta' #vg1
dataset_test = '../../For_paper/biology analyese/BC090232.1.fasta'
#X, y, mask_label, _, encoding_vectors = preprocess_data(4000,4000, dataset_all)
X_test, y_test, mask_label_test, _, encoding_vectors = preprocess_data(4000,4000, dataset_test)

#weights_dir="Results/10foldcv/multilabel_mRNAsubloci_train.fasta_cnn_40004000_nb64da32head50_attcall1,1power2_run2/"
weights_dir = "Results/keeprate-5foldcv_alldata_12-22/cnn4000_nb32multiscale4gelulrdecay5e5_9-20-49_da80head5_drop0.06.25.26W0.005A0_500epoch/"
#weights_dir = "Results/keeprate-5foldcv_alldata_12-22/cnn4000_nb63multiscale2_8-15-47_da25head55_drop00.75.75W0.01A0.01_val09/"
#weights_dir ="Results/keeprate-5foldcv_alldata_12-22/cnn4000_nb63multiscale2gelulrdecay5e5_8-15-47_da25head55_drop00.75.75W0.001A0_val09"
#del mask_label

weights_dir = "Results/keeprate-5foldcv_alldata_12-22/testmodel2/" #this is the final model used
#calculate PWM
OUTPATH="cnnfilters_PWM_1_20_2020/"
fold=0
model = multihead_attention(left+right,nb_classes, OUTPATH, kfold_index=fold)
model.build_model_multihead_attention_multiscaleCNN4_dropout(
                                                 dim_attention=80,
                                                 headnum=5,
                                                 embedding_vec=encoding_vectors,
                                                 nb_filters=32,
                                                 filters_length1=9,
                                                 filters_length2=20,
                                                 filters_length3=49,
                                                 drop_input=0.06,
                                                 drop_cnn=0.25,
                                                 drop_flat=0.26,
                                                 W_regularizer=0.005,
                                                 Att_regularizer_weight=0,
                                                 BatchNorm=False,
                                                 load_weights=True,
                                                 fcnum=1,
                                                 fc_dim = 100,
                                                 weight_dir=os.path.join(weights_dir,'weights_fold_'+str(fold)+'.h5'),
                                                )


model.get_PCM_multiscale(X,nb_filters=32,filters_length1=9,filters_length2=20,filters_length3=49)
#model.get_PCM_multiscale_weighted(X,nb_filters=32,filters_length1=9,filters_length2=20,filters_length3=49)


for i in range(4):
    #sample_index = np.where(y[:,i]==1)[0]
    sample_index = np.where((y[:,i]==1) & (np.sum(y,axis=-1)==1))[0]
    OUTPATH="cnnfilters_PWM_1_20_2020/uniqueclass"+str(i)
    if not os.path.exists(OUTPATH):
        os.makedirs(OUTPATH)
    
    fold=0
    model = multihead_attention(left+right,nb_classes, OUTPATH, kfold_index=fold)
    model.build_model_multihead_attention_multiscaleCNN4_dropout(
                                                 dim_attention=80,
                                                 headnum=5,
                                                 embedding_vec=encoding_vectors,
                                                 nb_filters=32,
                                                 filters_length1=9,
                                                 filters_length2=20,
                                                 filters_length3=49,
                                                 drop_input=0.06,
                                                 drop_cnn=0.25,
                                                 drop_flat=0.26,
                                                 W_regularizer=0.005,
                                                 Att_regularizer_weight=0,
                                                 BatchNorm=False,
                                                 load_weights=True,
                                                 fcnum=1,
                                                 fc_dim = 100,
                                                 weight_dir=os.path.join(weights_dir,'weights_fold_'+str(fold)+'.h5'),
                                                )
    
    model.get_PCM_multiscale(X[sample_index],nb_filters=32,filters_length1=9,filters_length2=20,filters_length3=49)


#model.get_PCM_multiscale_weighted(X,nb_filters=32,filters_length1=9,filters_length2=20,filters_length3=49)




OUTPATH="testattplot/"
modellist=[]
att_matrix1_list=[]
att_matrix2_list=[]
att_matrix3_list=[]
#same model same seq different attention?????

for fold in range(5):
    model = multihead_attention(left+right,nb_classes, OUTPATH, kfold_index=fold) #just for outpath change
    model.build_model_multihead_attention_multiscaleCNN4_dropout(
                                                 dim_attention=80,#25,#80,
                                                 headnum=5,#55,#5,
                                                 embedding_vec=encoding_vectors,
                                                 nb_filters=32,#63,#32
                                                 filters_length1=9,#8,#9,
                                                 filters_length2=20,#15,#20,
                                                 filters_length3=49,#47,#49,
                                                 drop_input=0.06,#0,#0.06,
                                                 drop_cnn=0.25,#0.75,#0.25,
                                                 drop_flat=0.26,#0.75,#0.26,
                                                 W_regularizer=0.005,#0.01,#0.005,
                                                 Att_regularizer_weight=0,#0.01,#0.010,
                                                 BatchNorm=False,
                                                 load_weights=True,
                                                 fcnum=1,
                                                 fc_dim = 100,
                                                 weight_dir=os.path.join(weights_dir,'weights_fold_'+str(fold)+'.h5'),
                                                )
    
    modellist.append(model)
    att_matrix1,att_matrix2,att_matrix3 = model.get_attention_multiscale_batch(X_test)
    att_matrix1_list.append(att_matrix1)
    att_matrix2_list.append(att_matrix2)
    att_matrix3_list.append(att_matrix3)


####
'''
toppositions = modellist[1].get_sigCNN_region(X_test,nb_filters=32,filters_length1=9,filters_length2=20,filters_length3=49)
startlist = []
endlist = []
signallist = []
plt.clf()
plt.cla()
for i in range(32):
   signallist.append(toppositions[i][0]['signal1'])
   signallist.append(toppositions[i][0]['signal2'])
   signallist.append(toppositions[i][0]['signal3'])
   startlist.append(toppositions[i][0]['start1'])
   startlist.append(toppositions[i][0]['start2'])
   startlist.append(toppositions[i][0]['start3'])
   endlist.append(toppositions[i][0]['end1'])
   endlist.append(toppositions[i][0]['end2'])
   endlist.append(toppositions[i][0]['end3'])
   
   plt.plot(np.arange(toppositions[i][0]['start1'],toppositions[i][0]['end1']),np.repeat(toppositions[i][0]['signal1'],toppositions[i][0]['end1']-toppositions[i][0]['start1']),color="black")
   plt.plot(np.arange(toppositions[i][0]['start2'],toppositions[i][0]['end2']),np.repeat(toppositions[i][0]['signal2'],toppositions[i][0]['end2']-toppositions[i][0]['start2']),color="black")
   plt.plot(np.arange(toppositions[i][0]['start3'],toppositions[i][0]['end3']),np.repeat(toppositions[i][0]['signal3'],toppositions[i][0]['end3']-toppositions[i][0]['start3']),color="black")

#plt.plot(np.arange(7402,7500),np.repeat(4,7500-7402),color='red') #7403 is the target human
plt.plot(np.arange(7462,7562),np.repeat(4,7562-7462),color='red') #7562 is the target chicken

plt.show()

####
signallist=np.asarray(signallist)
signallist[np.where(np.asarray(signallist)==-1)[0]]=0
binsize=10
histgram = np.zeros(len(np.arange(0,8000,binsize)))
index = 0
for i in np.arange(0,8000,binsize): #start, start+100
    start = i
    end = i+binsize
    for j in range(len(signallist)):
      if startlist[j]>end or endlist[j]<start:
            continue
      else:
        histgram[index]+=signallist[j]
    
    index+=1

plot_vs_target(np.repeat(histgram,binsize),target='human')


selectedindex = np.asarray(signallist).argsort()[-top:][::-1]
[startlist[x] for x in selectedindex]
[endlist[x] for x in selectedindex]

'''
#for signle model
feature_matrix,feature_sum = modellist[0].get_1featureMap(X_test,nb_filters=32,filters_length1=9,filters_length2=20,filters_length3=49)

average_feature_sum=np.zeros(8000)
for fold in range(5):
    feature_matrix,feature_sum = modellist[fold].get_1featureMap(X_test,nb_filters=32,filters_length1=9,filters_length2=20,filters_length3=49)
    average_feature_sum+=feature_sum[0]

#showmatrix = np.repeat(feature_matrix[0],100,axis=1)
#plt.imshow(showmatrix)
def plot_vs_target(weightarray,target = 'human'):
    plt.clf()
    plt.cla()
    plt.plot(np.arange(len(weightarray)),weightarray,color="black")
    if target == 'human':
        plt.bar(x=7403,height=weightarray.max(),width = 100,align='edge',color="red",alpha=0.5)
    else:
        plt.bar(x=7462,height=weightarray.max(),width = 100,align='edge',color="red",alpha=0.5) #chicken target is 7462
    plt.show()

plot_vs_target(feature_sum[0],target='chicken')
#plot_vs_target(feature_sum[0]*output_max,target='chicken')
plot_vs_target(average_feature_sum/5,target='human')
plot_vs_target(average_feature_sum/5,target='chicken')

#plot_vs_target((average_feature_sum/5)*output_max,target='human') not good
#plot_vs_target((average_feature_sum/5)*convertattweight2seq(average_att_123),target='human') #not good


def convertattweight2seq(att_weight,length =8000):
    '''
    att_weight is a list with length 2666 need to be converted to 8000
    '''
    seqWeight = []
    for pos in range(len(att_weight)):
        seqWeight.extend(np.repeat(att_weight[pos],3) )
    
    
    return np.pad(np.asarray(seqWeight),([0,length-len(att_weight)*3]),'constant',constant_values =att_weight.min())


plt.clf()
plt.cla()
average_att_123=np.zeros(att_matrix1.shape[2])
for fold in range(5):
     #fold = 0
     print(fold)
     plt.clf()
     plt.cla()
     group_att_avg1= np.average(att_matrix1_list[fold][:,:,:].reshape(-1,att_matrix1.shape[-1]),axis=0)
     group_att_avg2= np.average(att_matrix2_list[fold][:,:,:].reshape(-1,att_matrix2.shape[-1]),axis=0)
     group_att_avg3= np.average(att_matrix3_list[fold][:,:,:].reshape(-1,att_matrix3.shape[-1]),axis=0)
     #average_att_123 += (group_att_avg1+group_att_avg2+group_att_avg3)/3
     average_att_123 += np.max(np.concatenate([group_att_avg1.reshape(2666,1),group_att_avg2.reshape(2666,1),group_att_avg3.reshape(2666,1)],axis=-1),axis=-1)
     plt.plot(np.arange(len(group_att_avg1)),group_att_avg1,color="red")
     plt.plot(np.arange(len(group_att_avg2)),group_att_avg2,color="black")
     plt.plot(np.arange(len(group_att_avg3)),group_att_avg3,color="green")
     plt.show()


plt.plot(np.arange(len(average_att_123)),average_att_123)

plot_vs_target(convertattweight2seq(average_att_123),target='human') #新的model cover上了！！！  weights_dir = "Results/keeprate-5foldcv_alldata_12-22/testmodel2/" human 7403
toppositions=convertattweight2seq(average_att_123).argsort()[-10:][::-1]
#toppositions #array([7489, 7490, 7488, 7493, 7492, 7491, 7487, 7485, 7486, 7511])

#chicken target 7462
#array([7553, 7551, 7552, 7548, 7549, 7550, 7545, 7546, 7547, 6018]) #chicken !!


plt.clf()
plt.cla()
for i in range(4):
    group_att_all=np.zeros(att_matrix1.shape[2])
    sample_index = np.where(y[:,i]==1)[0]
    for fold in range(5):
        group_att_matrix1 = att_matrix1_list[fold][sample_index]
        group_att_matrix2 = att_matrix2_list[fold][sample_index]
        group_att_matrix3 = att_matrix3_list[fold][sample_index]
        group_att_avg1= np.average(group_att_matrix1[:,:,:].reshape(-1,att_matrix1.shape[-1]),axis=0)
        group_att_avg2= np.average(group_att_matrix2[:,:,:].reshape(-1,att_matrix2.shape[-1]),axis=0)
        group_att_avg3= np.average(group_att_matrix3[:,:,:].reshape(-1,att_matrix3.shape[-1]),axis=0)
        group_att_all += group_att_avg1+group_att_avg2+group_att_avg3
    
    group_att_all=group_att_all/5*3
    plt.plot(np.arange(len(group_att_all)),group_att_all)
    #plt.plot(np.arange(len(group_att_all[2000:])),group_att_all[2000:])

plt.show()


plt.clf()
plt.cla()
for i in range(4):
  group_att_all=np.zeros(att_matrix1.shape[2])
  for h in range(att_matrix1.shape[1]):
    sample_index = np.where(y[:,i]==1)[0]
    group_att_matrix1 = att_matrix1_list[0][sample_index]
    group_att_matrix2 = att_matrix2_list[0][sample_index]
    group_att_matrix3 = att_matrix3_list[0][sample_index]
    group_att_avg1= np.average(group_att_matrix1[:,h,:].reshape(-1,att_matrix1.shape[-1]),axis=0)
    group_att_avg2= np.average(group_att_matrix2[:,h,:].reshape(-1,att_matrix2.shape[-1]),axis=0)
    group_att_avg3= np.average(group_att_matrix3[:,h,:].reshape(-1,att_matrix3.shape[-1]),axis=0)
    group_att_all += group_att_avg1+group_att_avg2+group_att_avg3
  
  group_att_all=group_att_all/5
  plt.plot(np.arange(len(group_att_all)),group_att_all)
  #plt.plot(np.arange(len(group_att_all[2000:])),group_att_all[2000:])

plt.show()

plt.clf()
plt.cla()
for i in range(4):
  h=4 #try different head
  sample_index = np.where(y[:,i]==1)[0]
  group_att_matrix1 = att_matrix1[sample_index]
  group_att_matrix2 = att_matrix2[sample_index]
  group_att_matrix3 = att_matrix3[sample_index]
  group_att_avg1= np.average(group_att_matrix1[:,h,:].reshape(-1,att_matrix1.shape[-1]),axis=0)
  group_att_avg2= np.average(group_att_matrix2[:,h,:].reshape(-1,att_matrix2.shape[-1]),axis=0)
  group_att_avg3= np.average(group_att_matrix3[:,h,:].reshape(-1,att_matrix3.shape[-1]),axis=0)
  group_att_all = group_att_avg1+group_att_avg2+group_att_avg3
  
  plt.plot(np.arange(len(group_att_all)),group_att_all)
  #plt.plot(np.arange(len(group_att_all[2000:])),group_att_all[2000:])

plt.show()

plt.clf()
plt.cla()
for h in range(5):
    i=0
    sample_index = np.where(y[:,i]==1)[0]
    group_att_matrix1 = att_matrix1[sample_index]
    group_att_matrix2 = att_matrix2[sample_index]
    group_att_matrix3 = att_matrix3[sample_index]
    group_att_avg1= np.average(group_att_matrix1[:,h,:].reshape(-1,att_matrix1.shape[-1]),axis=0)
    group_att_avg2= np.average(group_att_matrix2[:,h,:].reshape(-1,att_matrix2.shape[-1]),axis=0)
    group_att_avg3= np.average(group_att_matrix3[:,h,:].reshape(-1,att_matrix3.shape[-1]),axis=0)
    #plt.plot(np.arange(len(group_att_avg1)),group_att_avg1)
    plt.plot(np.arange(len(group_att_avg2)),group_att_avg2)
    #plt.plot(np.arange(len(group_att_avg3)),group_att_avg3)

plt.show()

def plot_seq_weights(input):
    plt.clf()
    plt.cla()
    plt.plot(np.arange(len(input)), input)
    plt.show()

def convert2seqPosition(pos,mask_label):
    '''
    pos is the postion on att weight vector, start from 0 
    maxpooling size=3
    '''
    return int(np.sum(mask_label[:pos*3]))

def convert2seqPosition4saliency(pos,mask_label):
    '''
    pos is the postion on att weight vector, start from 0 
    maxpooling size=3
    '''
    return int(np.sum(mask_label[:pos]))


index=0
seq_weights=np.average(att_matrix1[index,:,:],axis=0)+np.average(att_matrix2[index,:,:],axis=0)+np.average(att_matrix3[index,:,:],axis=0)
def get_seqTopPosbyHead(index,att_matrix1,att_matrix2,att_matrix3,headindex,top=10):
    '''
    given att_matrix1,2,3 and top return top positions on sequence
    '''
    #seq_weights=np.average(att_matrix1[index,:,:],axis=0)+np.average(att_matrix2[index,:,:],axis=0)+np.average(att_matrix3[index,:,:],axis=0)
    seq_weights=att_matrix1[index,headindex,:]+att_matrix2[index,headindex,:]+att_matrix3[index,headindex,:]
    toppositions=seq_weights.argsort()[-top:][::-1]
    return [convert2seqPosition(pos,mask_label[index]) for pos in toppositions]

get_seqTopPosbyHead(0,att_matrix1,att_matrix2,att_matrix3,1,10)


def get_seqTopPosbyALL(index,mask_label,att_matrix1,att_matrix2,att_matrix3,top=10):
    '''
    given att_matrix1,2,3 and top return top positions on sequence
    '''
    #seq_weights=np.average(att_matrix1[index,:,:],axis=0)+np.average(att_matrix2[index,:,:],axis=0)+np.average(att_matrix3[index,:,:],axis=0)
    seq_weights=np.max(np.concatenate([att_matrix1[index,:,:],att_matrix2[index,:,:],att_matrix3[index,:,:]],axis=0),axis=0)
    toppositions=seq_weights.argsort()[-top:][::-1]
    return [convert2seqPosition(pos,mask_label[index]) for pos in toppositions] #[2669, 1985, 1059, 2168, 423, 2282, 3128, 1185, 2333, 900] the target is 2855! near! 
    

def get_seqweights_max(index,att_matrix1_list,att_matrix2_list,att_matrix3_list):
        seq_weight_list=np.zeros(att_matrix1_list[0][index,:,:].shape)
        for i in range(4):
            seq_weight_list=np.concatenate([seq_weight_list,att_matrix1_list[i][index,:,:],att_matrix2_list[i][index,:,:],att_matrix3_list[i][index,:,:]],axis=0)
        
        return np.max(seq_weight_list,axis=0)

seq_weights=get_seqweights_max(0,att_matrix1_list,att_matrix2_list,att_matrix3_list)

i=0
seq_weight_list=np.zeros(att_matrix1_list[0][index,:,:].shape)
#seq_weight_list=np.concatenate([seq_weight_list,att_matrix1_list[i][index,:,:],att_matrix2_list[i][index,:,:],att_matrix3_list[i][index,:,:]],axis=0)
seq_weight_list=att_matrix2_list[i][index,:,:]
seq_weights=np.max(seq_weight_list,axis=0)
#plot_seq_weights(seq_weights)
toppositions=seq_weights.argsort()[-top:][::-1]
[convert2seqPosition(pos,mask_label_test[0]) for pos in toppositions]

get_seqTopPosbyALL(0,mask_label_test,att_matrix1_list[0],att_matrix2_list[0],att_matrix3_list[0],10)


def compile_saliency_function(model,layername='CNN1'):
    model.model.layers[-1].activation = activations.linear
    rawinp = model.model.layers[0].input
    inp = model.model.layers[2].input #must be float format
    #inp = model.model.get_layer(layername).output
    outp = model.model.layers[-1].output #must be float format
    max_outp = K.max(outp, axis=1) #outp[:,0]# knwon class is 0
    saliency = K.gradients(K.sum(max_outp), inp)
    return K.function([rawinp,K.learning_phase()], saliency)

saliency_fn1 = compile_saliency_function(model,'CNN1')
saliency_fn2 = compile_saliency_function(model,'CNN2')
saliency_fn3 = compile_saliency_function(model,'CNN3')
saliency1 = saliency_fn1([[x for x in X_test],1])[0]#1 is test phase
saliency = saliency[::-1].transpose(1, 0, 2)
output= np.abs(saliency).max(axis=-1)



def get_saliency(X,model):
    saliency_fn = compile_saliency_function(model)
    saliency = saliency_fn([[x for x in X],1])[0]#1 is test phase
    saliency = saliency[::-1].transpose(1, 0, 2)
    #output= np.abs(saliency).max(axis=-1) #get all saliency
    output= saliency.max(axis=-1) #get positive saliency
    return output


saliencyarray=get_saliency(X_test,modellist[0])[:,0]

plot_vs_target(saliencyarray,target='human')

saliencyarray = np.zeros([5,8000])
for i in range(5):
    saliencyarray[i]=get_saliency(X_test,modellist[i])[:,0]

output_median = np.median(saliencyarray,axis=0)
output_mean = np.mean(saliencyarray,axis=0)
output_max = np.max(saliencyarray,axis=0)

binsize=10
histgram = np.zeros(len(np.arange(0,8000,binsize)))
index = 0
for i in np.arange(0,8000,binsize): #start, start+100
    start = i
    end = i+binsize
    for j in range(len(output_max)):
      if j>end or j<start:
            continue
      else:
        histgram[index]+=output_max[j]
    
    index+=1

plot_vs_target(np.repeat(histgram,binsize),target='human')

plot_vs_target(output_max,target='chicken')

toppositions=output_max.argsort()[-top:][::-1]

[convert2seqPosition4saliency(x,mask_label_test[0]) for x in toppositions]

#[3219, 2117, 528, 2692, 2307, 2654, 2034, 319, 2509, 2416]


#analyze CNN filters
select_index = []
for i in range(len(y)):
    if y[i].sum()==1:
        select_index.append(i)

X_oneclass = X[select_index,:] #5079

feature_matrix = model.get_feature_batch(X_oneclass)
feature_matrix_max = np.max(feature_matrix,axis=1)
maxpooling_matrix = model.get_maxpoolingoutput_batch(X_oneclass)



feature_matrix_average = np.zeros([feature_matrix.shape[0],feature_matrix.shape[2]])
for i in range(len(feature_matrix)):
    sumtemp = feature_matrix[i,:,:].sum(axis=0)
    length = feature_matrix.shape[1]- len(np.where(X_oneclass[i,:]==0)[0])
    feature_matrix_average[i,:] = sumtemp/length

import seaborn as sns
import scipy.cluster.hierarchy as sch
from sklearn.metrics.pairwise import cosine_similarity

#disMatCNN = sch.distance.pdist(np.transpose(feature_matrix_average),'cosine')
#disMat_mrna = sch.distance.pdist(feature_matrix_average,'cosine')

#Z_CNN=sch.linkage(disMatCNN,method='ward')
#Z_mrna=sch.linkage(disMat_mrna,method='ward')


sample_class = np.argmax(y[select_index],axis=1)
palette = plt.get_cmap('Set1')
#clustg=sns.clustermap(feature_matrix_average,metric='cosine',row_colors=palette(sample_class))
#clustg=sns.clustermap(np.transpose(feature_matrix_average),col_colors=palette(sample_class),col_linkage=Z_mrna,row_linkage=Z_CNN,z_score=0)
clustg=sns.clustermap(np.transpose(feature_matrix_average),col_colors=palette(sample_class),metric='cosine',z_score=0)

max_filter = feature_matrix_average.argmax(axis=1) #all 58 !!!

clustg=sns.clustermap(np.transpose(np.concatenate([feature_matrix_average[:,0:58],feature_matrix_average[:,59:]],axis=-1)),metric='cosine',col_colors=palette(sample_class))


Z_CNN=sch.linkage(disMatCNN,method='ward')
Z_mrna=sch.linkage(disMat_mrna,method='ward')

clustg=sns.clustermap(np.transpose(feature_matrix_max),col_colors=palette(sample_class),metric='cosine',z_score=0)
clustg=sns.clustermap(np.transpose(feature_matrix_max),col_colors=palette(sample_class),metric='cosine')


maxpooling_matrix = model.get_maxpoolingoutput_batch(X_oneclass)
maxpooling_matrix_average = np.zeros([maxpooling_matrix.shape[0],maxpooling_matrix.shape[2]])
for i in range(len(maxpooling_matrix)):
    sumtemp = maxpooling_matrix[i,:,:].sum(axis=0)
    length = feature_matrix.shape[1]- len(np.where(X_oneclass[i,:]==0)[0])
    maxpooling_matrix_average[i,:] = sumtemp/length

clustg=sns.clustermap(np.transpose(maxpooling_matrix_average),col_colors=palette(sample_class),metric='cosine',z_score=0)


y_pred = model.predict(X_oneclass)

clustg=sns.clustermap(np.transpose(y_pred),col_colors=palette(sample_class),metric='cosine',z_score=0)


y_pred = model.predict(X)

