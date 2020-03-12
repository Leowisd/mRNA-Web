import datetime
import itertools
from collections import OrderedDict
import argparse
import os
import sys
import re
os.environ["CUDA_VISIBLE_DEVICES"] = "0"
import h5py

import tensorflow as tf
from keras.utils.io_utils import HDF5Matrix

gpu_options = tf.GPUOptions()
gpu_options.allow_growth = True
config = tf.ConfigProto(gpu_options=gpu_options)
#config.gpu_options.per_process_gpu_memory_fraction=0.4
sess = tf.Session(config=config)
from keras.backend.tensorflow_backend import set_session
import keras.backend as K
set_session(session=sess)

from multihead_attention_model import *
from Genedata import Gene_data
from keras.preprocessing.sequence import pad_sequences
from sklearn.model_selection import KFold, StratifiedKFold
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
batch_size = 256 #try 200 later! too slow!
nb_classes = 4

def get_id_label_seq_Dict(gene_data):
    id_label_seq_Dict = OrderedDict()
    for gene in gene_data:
         label = gene.dist
         gene_id = gene.id.strip()
         id_label_seq_Dict[gene_id] = {}
         id_label_seq_Dict[gene_id][label]= (gene.seqleft,gene.seqright)
    
    return id_label_seq_Dict


def get_label_id_Dict(id_label_seq_Dict):
    label_id_Dict = OrderedDict()
    for eachkey in id_label_seq_Dict.keys():
        label = list(id_label_seq_Dict[eachkey].keys())[0]
        label_id_Dict.setdefault(label,set()).add(eachkey)
    
    return label_id_Dict

def typeicalSampling(ids, k):
    kf = KFold(n_splits=k, shuffle=True, random_state=1234)
    folds = kf.split(ids)
    train_fold_ids = OrderedDict()
    val_fold_ids = OrderedDict()
    test_fold_ids=OrderedDict()
    for i, (train_indices, test_indices) in enumerate(folds):
        size_all = len(train_indices)
        train_fold_ids[i] = []
        val_fold_ids[i] = []
        test_fold_ids[i]  =[]
        train_indices2 = train_indices[:int(size_all * 0.8)]
        val_indices = train_indices[int(size_all * 0.8):]
        for s in train_indices2:
             train_fold_ids[i].append(ids[s])
        
        for s in val_indices:
             val_fold_ids[i].append(ids[s])
        
        for s in test_indices:
              test_fold_ids[i].append(ids[s])
        
    
    return train_fold_ids,val_fold_ids,test_fold_ids


def group_sample(label_id_Dict,datasetfolder):
    Train = OrderedDict()
    Test = OrderedDict()
    Val = OrderedDict()
    for i in range(5):
        Train.setdefault(i,list())
        Test.setdefault(i,list())
        Val.setdefault(i,list())
    
    for eachkey in label_id_Dict:
        label_ids = list(label_id_Dict[eachkey])
        [train_fold_ids, val_fold_ids,test_fold_ids] = typeicalSampling(label_ids, 5)
        for i in range(5):
            Train[i].extend(train_fold_ids[i])
            Val[i].extend(val_fold_ids[i])
            Test[i].extend(test_fold_ids[i])
            print('label:%s finished sampling! Train length: %s, Test length: %s, Val length:%s'%(eachkey, len(train_fold_ids[i]), len(test_fold_ids[i]),len(val_fold_ids[i])))
    
    for i in range(5):
        print('Train length: %s, Test length: %s, Val length: %s'%(len(Train[i]),len(Test[i]),len(Val[i])))
        print(type(Train[i]))
        print(Train[0][:5])
        np.savetxt(datasetfolder+'/Train'+str(i)+'.txt', np.asarray(Train[i]),fmt="%s")
        np.savetxt(datasetfolder+'/Test'+str(i)+'.txt', np.asarray(Test[i]),fmt="%s")
        np.savetxt(datasetfolder+'/Val'+str(i)+'.txt', np.asarray(Val[i]),fmt="%s")
    
    return Train, Test, Val

def label_dist(dist):
    #assert (len(dist) == 4)
    return [int(x) for x in dist]

def preprocess_data(left, right,dataset,foldnum=5):
    gene_data = Gene_data.load_sequence(dataset, left, right,predict=False)
    id_label_seq_Dict = get_id_label_seq_Dict(gene_data)
    label_id_Dict = get_label_id_Dict(id_label_seq_Dict)
    Train=OrderedDict()
    Test=OrderedDict()
    Val=OrderedDict()
    datasetfolder=os.path.dirname(dataset)
    if os.path.exists(datasetfolder+'/Train'+str(0)+'.txt'):
        for i in range(foldnum):
            Train[i] = np.loadtxt(datasetfolder+'/Train'+str(i)+'.txt',dtype='str')
            Test[i] = np.loadtxt(datasetfolder+'/Test'+str(i)+'.txt',dtype='str')
            Val[i] = np.loadtxt(datasetfolder+'/Val'+str(i)+'.txt',dtype='str')
    else:
        [Train, Test,Val] = group_sample(label_id_Dict,datasetfolder)
    
    Xtrain={}
    Xtest={}
    Xval={}
    Ytrain={}
    Ytest={}
    Yval={}
    for i in range(foldnum):
        print('padding and indexing data')
        #train
        X_left = pad_sequences([[seq_encoding_keys.index(c) for c in list(id_label_seq_Dict[id].values())[0][0]] for id in Train[i]],maxlen=left,
                          dtype=np.int8, value=seq_encoding_keys.index('UNK'),padding='post')  #padding after sequence
        
        X_right = pad_sequences([[seq_encoding_keys.index(c) for c in list(id_label_seq_Dict[id].values())[0][1]] for id in Train[i]],maxlen=right,
                          dtype=np.int8, value=seq_encoding_keys.index('UNK'),padding='pre')# padding before sequence
        
        Xtrain[i] = np.concatenate([X_left,X_right],axis = -1)
        Ytrain[i] = np.array([label_dist(list(id_label_seq_Dict[id].keys())[0]) for id in Train[i]])
        print("training shapes"+str(Xtrain[i].shape)+" "+str(Ytrain[i].shape))
        #test
        X_left = pad_sequences([[seq_encoding_keys.index(c) for c in list(id_label_seq_Dict[id].values())[0][0]] for id in Test[i]],maxlen=left,
                          dtype=np.int8, value=seq_encoding_keys.index('UNK'),padding='post')  #padding after sequence
        
        X_right = pad_sequences([[seq_encoding_keys.index(c) for c in list(id_label_seq_Dict[id].values())[0][1]] for id in Test[i]],maxlen=right,
                          dtype=np.int8, value=seq_encoding_keys.index('UNK'),padding='pre')# padding before sequence
        
        Xtest[i] = np.concatenate([X_left,X_right],axis = -1)
        Ytest[i] = np.array([label_dist(list(id_label_seq_Dict[id].keys())[0]) for id in Test[i]])
        #validation
        X_left = pad_sequences([[seq_encoding_keys.index(c) for c in list(id_label_seq_Dict[id].values())[0][0]] for id in Val[i]],maxlen=left,
                          dtype=np.int8, value=seq_encoding_keys.index('UNK'),padding='post')  #padding after sequence
        
        X_right = pad_sequences([[seq_encoding_keys.index(c) for c in list(id_label_seq_Dict[id].values())[0][1]] for id in Val[i]],maxlen=right,
                          dtype=np.int8, value=seq_encoding_keys.index('UNK'),padding='pre')# padding before sequence
        
        Xval[i] = np.concatenate([X_left,X_right],axis = -1)
        Yval[i] = np.array([label_dist(list(id_label_seq_Dict[id].keys())[0]) for id in Val[i]])
    
    return Xtrain,Ytrain,Xtest, Ytest,Xval,Yval


def run_model(dataset, **kwargs):
    '''load data'''
    Xtrain,Ytrain,Xtest, Ytest,Xval,Yval = preprocess_data(kwargs['left'], kwargs['right'], dataset)
    max_len = kwargs['left']+kwargs['right']
    
    for i in range(5):
        print('Evaluating KFolds {}/10'.format(i + 1))
        model = multihead_attention(max_len, nb_classes, OUTPATH, kfold_index=i)  # initialize
        if kwargs['load_pretrain']:
            model.build_model_multihead_attention_multiscaleCNN4_dropout(dim_attention=kwargs['dim_attention'],
                                                 headnum=kwargs['headnum'],
                                                 load_weights=True,weight_dir=kwargs['weights_dir'],
                                                 embedding_vec=seq_encoding_vectors,
                                                 nb_filters=kwargs['nb_filters'],
                                                 filters_length1=kwargs['filters_length1'],
                                                 filters_length2=kwargs['filters_length2'],
                                                 filters_length3=kwargs['filters_length3'],
                                                 pooling_size=kwargs['pooling_size'],
                                                 drop_input=kwargs['drop_input'],
                                                 drop_cnn=kwargs['drop_cnn'],
                                                 drop_flat=kwargs['drop_flat'],
                                                 W_regularizer=kwargs['W_regularizer'],
                                                 Att_regularizer_weight=kwargs['Att_regularizer_weight'],
                                                 fc_dim = kwargs['fc_dim'],
                                                 fcnum = kwargs['fcnum']
                                                )
        
        else:
            model.build_model_multihead_attention_multiscaleCNN4_dropout(dim_attention=kwargs['dim_attention'],
                                                 headnum=kwargs['headnum'],
                                                 embedding_vec=seq_encoding_vectors,
                                                 nb_filters=kwargs['nb_filters'],
                                                 filters_length1=kwargs['filters_length1'],
                                                 filters_length2=kwargs['filters_length2'],
                                                 filters_length3=kwargs['filters_length3'],
                                                 pooling_size=kwargs['pooling_size'],
                                                 drop_input=kwargs['drop_input'],
                                                 drop_cnn=kwargs['drop_cnn'],
                                                 drop_flat=kwargs['drop_flat'],
                                                 W_regularizer=kwargs['W_regularizer'],
                                                 Att_regularizer_weight=kwargs['Att_regularizer_weight'],
                                                 fc_dim = kwargs['fc_dim'],
                                                 fcnum = kwargs['fcnum']
                                                )
        
        model.train(Xtrain[i], Ytrain[i], batch_size, kwargs['epochs'],Xval[i],Yval[i],loadFinal=kwargs['loadFinal'])
        model.evaluate(Xtest[i],Ytest[i])
        K.clear_session()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--left', type=int, default=4000, help='set left on sample sequence length')
    parser.add_argument('--right', type=int, default=4000, help='set left on sample sequence length')
    parser.add_argument('--dim_attention', type=int, default=10, help='dim_attention')
    parser.add_argument('--headnum', type=int, default=10, help='number of multiheads')
    parser.add_argument('--drop_rate', type=float, default=0.1, help='dropout ratio')
    parser.add_argument('--drop_input', type=float, default=0.2, help='dropout ratio')
    parser.add_argument('--drop_cnn', type=float, default=0.5, help='dropout ratio')
    parser.add_argument('--drop_flat', type=float, default=0.5, help='dropout ratio')
    parser.add_argument('--W_regularizer', type=float, default=0.0005, help='W_regularizer')
    parser.add_argument('--Att_regularizer_weight', type=float, default=0.0005, help='Att_regularizer_weight')
    parser.add_argument('--dataset', type=str, default='../../mRNAsubloci_train.fasta', help='input sequence data')
    parser.add_argument('--epochs', type=int, default=50, help='')
    parser.add_argument('--nb_filters', type=int, default=32, help='number of CNN filters') 
    parser.add_argument('--filters_length', type=int, default=10, help='size of CNN filters') 
    parser.add_argument('--filters_length1', type=int, default=10, help='size of CNN filters') 
    parser.add_argument('--filters_length2', type=int, default=10, help='size of CNN filters') 
    parser.add_argument('--filters_length3', type=int, default=10, help='size of CNN filters') 
    parser.add_argument('--pooling_size', type=int, default=3, help='pooling_size') 
    parser.add_argument('--att_weight', type=float, default=1, help='number of att_weight') 
    parser.add_argument("--loadFinal", action="store_true",help="whether loadFinal model")
    parser.add_argument('--fc_dim', type=int, default=50, help='fc_dim')
    parser.add_argument('--fcnum', type=int, default=1, help='fcnum')
    parser.add_argument("--message", type=str, default="", help="append to the dir name")
    parser.add_argument("--load_pretrain", action="store_true",
                        help="load pretrained CNN weights to the first convolutional layers")
    
    parser.add_argument("--weights_dir", type=str, default="",
                        help="Must specificy the path to pretrained weights, if load_pretrain is set to true. Only enter the relative path respective to the root of this project.") 
    
    args = parser.parse_args()
    
    OUTPATH = os.path.join('Results',args.message)
    if not os.path.exists(OUTPATH):
        os.makedirs(OUTPATH)
    print('OUTPATH:', OUTPATH)    
    
    for k, v in vars(args).items():
        print(k, ':', v)
    
    run_model(**vars(args))


#testmodel2 ./keeprate-5foldcv_alldata_12-22/cnn4000_nb32multiscale4gelulrdecay5e5_1fc100_9-20-49_da80head5_drop0.06.25.26W0.005A0_500epoch #
#python Multihead_foldchange_keeprate.py --left 4000 --right 4000  --fc_dim 100 --fcnum 1 --dim_attention 80 --headnum 5 --nb_filters 32 --filters_length1 9 --filters_length2 20 --filters_length3 49 --drop_input 0.06 --drop_cnn 0.25 --drop_flat 0.26  --W_regularizer 0.005 --Att_regularizer_weight 0 --dataset ../mRNA_multi_data_keepnum_code/modified_mutlilabel_seq.fasta --epochs 500 --message testmodel2
#better？ has seen 0.73 parameters: 51264 time 5s best!

