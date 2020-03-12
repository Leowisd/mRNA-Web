import datetime
import itertools
from collections import OrderedDict
import argparse
import os
import sys
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
from Genedata import Gene_data
from keras.preprocessing.sequence import pad_sequences
from sklearn.metrics import precision_recall_curve
from sklearn.metrics import roc_curve, auc


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

def data_stats(longest, data):
    print('average length:', np.average([len(gene.seq) for gene in data]))
    length = np.zeros(longest + 1, dtype=int)
    for gene in data:
        length[len(gene.seq)] += 1
    for i, freq in enumerate(length):
        if freq > 0:
            break
    min_len = i
    plt.ion()
    plt.figure()
    plt.title('Length Frequency')
    plt.xlabel('Length')
    plt.ylabel('Frequency')
    plt.ylim(top=50)
    plt.bar(range(1, longest + 1), length[1:longest + 1])
    plt.savefig(OUTPATH + 'length_frequency.png')
    plt.pause(1)
    plt.close()


batch_size = 100 #try 200 later! too slow!
nb_classes = 4

def get_label(label):
    #assert (len(dist) == 4)
    return [int(x) for x in label]

def preprocess_data(left, right,dataset,evaluate=False):
    gene_data = Gene_data.load_sequence(dataset, left, right,predict=True)
    geneids = [gene.id for gene in gene_data]
    print('padding and indexing data')
    X_left = pad_sequences([[seq_encoding_keys.index(c) for c in gene.seqleft] for gene in gene_data],
                      maxlen=left,
                      dtype=np.int8, value=seq_encoding_keys.index('UNK'),padding='post')  #padding after sequence
    
    X_right = pad_sequences([[seq_encoding_keys.index(c) for c in gene.seqright] for gene in gene_data],
                      maxlen=right,
                      dtype=np.int8, value=seq_encoding_keys.index('UNK'),padding='pre')# padding before sequence
    
    X = np.concatenate([X_left,X_right],axis = -1)
    mask_label_left = np.array([np.concatenate([np.ones(len(gene.seqleft)),np.zeros(left-len(gene.seqleft))]) for gene in gene_data],dtype='float32')
    mask_label_right = np.array([np.concatenate([np.zeros(right-len(gene.seqright)),np.ones(len(gene.seqright))]) for gene in gene_data],dtype='float32')
    mask_label = np.concatenate([mask_label_left,mask_label_right],axis=-1)
    if evaluate:
       y = np.array([get_label(gene.label) for gene in gene_data])
       return X, y, mask_label,geneids 
    
    else: 
       return X,mask_label,geneids


# starts training in CNN model
def run_model(lower_bound, upper_bound, dataset, **kwargs):
    '''load data into the playground'''
    
    classlist = ["Cytoplasm","Nucleus","Endoplasmic reticulum","Ribosome"]
    import pickle
    max_len = kwargs['left']+kwargs['right']
    if kwargs['evaluate']:
        X, y, mask_label,geneids = preprocess_data(kwargs['left'],kwargs['right'], dataset)
    
    else:
        X, mask_label,geneids = preprocess_data(kwargs['left'],kwargs['right'], dataset)
    
    avg_predicted_y=np.zeros([X.shape[0],nb_classes])
    for i in range(kwargs['foldnum']):
        model = multihead_attention(max_len, nb_classes, OUTPATH, kfold_index=i)  # initialize
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
                                                 fcnum = kwargs['fcnum'],
                                                 load_weights=True,
                                                 weight_dir = kwargs['weights_dir']+str(i)+".h5"
                                                )
        
        pred_y = model.predict(X)
        avg_predicted_y+=pred_y
        K.clear_session()
    
    avg_predicted_y = avg_predicted_y/5
    print("shape of avg_predicted_y is "+str(avg_predicted_y.shape))
    outfile=open(OUTPATH+"/prediction_results.txt",'w')
    defaultcutoff=0.5
    for i in range(len(geneids)):
        outfile.write(geneids[i]+"\t")
        label = []
        for c in range(nb_classes):
            outfile.write("%0.3f"%(avg_predicted_y[i,c])+",")
            if avg_predicted_y[i,c]>defaultcutoff:
                label.append(classlist[c])
                
        if len(label)==0:
            label = "None"
        
        outfile.write("\t"+",".join(label)+"\n")
    
    
    if kwargs['evaluate']:
         roc_auc = dict()
         mcc_dict = dict()
         average_precision = dict()
         #for ROC plot
         fpr = dict()
         tpr = dict()
         precision = dict()
         recall = dict()
         for i in range(nb_classes):#calculate one by one
             average_precision[i+1] = average_precision_score(y[:, i], avg_predicted_y[:, i])
             roc_auc[i+1] = roc_auc_score(y[:,i], avg_predicted_y[:,i])
             mcc_dict[i+1] = matthews_corrcoef(y[:,i],[1 if x>0.5 else 0 for x in avg_predicted_y[:,i]])
             fpr[i],tpr[i],_ = roc_curve(y[:,i], avg_predicted_y[:,i])
             precision[i],recall[i],_ =  precision_recall_curve(y[:, i], avg_predicted_y[:, i])
         
         
         fpr['micro'],tpr['micro'],_ = roc_curve(y.ravel(), avg_predicted_y.ravel())
         precision['micro'],recall['micro'],_ =  precision_recall_curve(y.ravel(), avg_predicted_y.ravel())
         average_precision["micro"] = average_precision_score(y, avg_predicted_y,average="micro")
         roc_auc["micro"] = roc_auc_score(y,avg_predicted_y,average="micro")
         roc_list = [roc_auc[x+1] for x in range(nclass)]
         roc_list.append(roc_auc['micro'])
         pr_list = [average_precision[x+1] for x in range(nclass)]
         pr_list.append(average_precision['micro'])
         mcc_list = [mcc_dict[x+1] for x in range(nclass)]
         np.savetxt(OUTPATH + '/evaluation_roc_average_presicion.txt', np.array(roc_list+pr_list+mcc_list), delimiter=',')
         
         picklefile = open(OUTPATH + '/evaluation_plot','wb')
         pickle.dump((fpr,tpr,precision,recall),picklefile)



if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    '''Model parameters'''
    parser.add_argument('--lower_bound', type=int, default=4000, help='set lower bound on sample sequence length')
    parser.add_argument('--upper_bound', type=int, default=4000, help='set upper bound on sample sequence length')
    parser.add_argument('--left', type=int, default=1000, help='set left on sample sequence length')
    parser.add_argument('--right', type=int, default=3000, help='set left on sample sequence length')
    parser.add_argument('--dim_attention', type=int, default=80, help='dim_attention')
    parser.add_argument('--headnum', type=int, default=5, help='number of multiheads') #select one from 3
    parser.add_argument('--drop_input', type=float, default=0.06, help='drop_input')
    parser.add_argument('--drop_cnn', type=float, default=0.25, help='drop_cnn')
    parser.add_argument('--drop_flat', type=float, default=0.26, help='drop_flat')
    parser.add_argument('--W_regularizer', type=float, default=0.005, help='W_regularizer')
    parser.add_argument('--Att_regularizer_weight', type=float, default=0, help='Att_regularizer_weight')
    parser.add_argument('--dataset', type=str, default='../../mRNAsubloci_train.fasta', help='input sequence data')
    parser.add_argument('--epochs', type=int, default=500, help='')
    parser.add_argument('--nb_filters', type=int, default=32, help='number of CNN filters') #select one from 3
    parser.add_argument('--filters_length', type=int, default=10, help='size of CNN filters') #select one from 3
    parser.add_argument('--filters_length1', type=int, default=9, help='size of CNN filters') #select one from 3
    parser.add_argument('--filters_length2', type=int, default=20, help='size of CNN filters') #select one from 3
    parser.add_argument('--filters_length3', type=int, default=49, help='size of CNN filters') #select one from 3
    parser.add_argument('--pooling_size', type=int, default=3, help='pooling_size') #select one from 3
    parser.add_argument("--loadFinal", action="store_true",help="whether loadFinal model")
    parser.add_argument('--fc_dim', type=int, default=100, help='fc_dim')
    parser.add_argument('--fcnum', type=int, default=1, help='fcnum')
    parser.add_argument("--outputpath", type=str, default="", help="append to the dir name")
    parser.add_argument("--weights_dir", type=str, default="./model/weights_fold_",
                        help="Must specificy pretrained weights dir for prediction") 
    
    parser.add_argument("--foldnum", type=int, default=5,help="foldnum") 
    
    parser.add_argument("--evaluate",action="store_true",help="whether to evaluate the test result, if set, labels must be provided")
    parser.add_argument('--att_weight', type=float, default=1, help='number of att_weight') #select one from 3
    args = parser.parse_args()
    
    OUTPATH = args.outputpath
    if not os.path.exists(OUTPATH):
        os.makedirs(OUTPATH)
    print('OUTPATH:', OUTPATH)
    
    for k, v in vars(args).items():
        print(k, ':', v)
    
    websiteoutput = open(OUTPATH+"/prediction_predicted_num.txt",'w')
    websiteoutput.write("Start:0\n")
    websiteoutput.close()
    run_model(**vars(args))
    websiteoutput = open(OUTPATH+"/prediction_predicted_num.txt",'w')
    websiteoutput.write("All:100\n")
    websiteoutput.close()


#python3 Multihead_predict.py --dataset modified_test_multilabel_seq.fasta --outputpath testresult