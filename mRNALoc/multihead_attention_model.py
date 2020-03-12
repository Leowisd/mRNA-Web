from keras import regularizers
from keras import layers
from keras.layers.core import Dense, Dropout, Flatten
from keras.layers import Embedding, BatchNormalization, CuDNNLSTM, LSTM, Bidirectional, Input, \
    Concatenate, Multiply, Dot, Reshape, Activation, Lambda, Masking,concatenate,Add

from keras.layers.convolutional import Convolution1D, MaxPooling1D
from keras.models import Model
from six.moves import range
import numpy as np
from keras.callbacks import EarlyStopping, ModelCheckpoint, Callback, TensorBoard
import tensorflow as tf
from sklearn.metrics import roc_curve, auc, precision_recall_curve, average_precision_score,roc_auc_score,accuracy_score,matthews_corrcoef
from keras import backend as K
from keras.initializers import random_normal
import pickle
import os
import scipy.stats as stats
import csv
import sys

from hier_attention import Attention
from att_weight_callback import att_weight_callback

OUTPATH = None
def gelu(input_tensor):
  """Gaussian Error Linear Unit.
  
  This is a smoother version of the RELU.
  Original paper: https://arxiv.org/abs/1606.08415
  
  Args:
    input_tensor: float Tensor to perform activation.
  
  Returns:
    `input_tensor` with the GELU activation applied.
  """
  cdf = 0.5 * (1.0 + tf.erf(input_tensor / tf.sqrt(2.0)))
  return input_tensor * cdf

class multihead_attention:
    
    def __init__(self, max_len, nb_classes, save_path, kfold_index):
        self.max_len = max_len
        self.nb_classes = nb_classes
        self.is_built = False
        global OUTPATH
        OUTPATH = save_path
        self.kfold_index = kfold_index
        self.att_weight_var = K.variable(1.0)
    
    def build_model_multihead_attention_multiscaleCNN4_dropout(self,
                                        dim_attention,headnum,
                                        embedding_vec,
                                        load_weights=False, weight_dir=None,
                                        nb_filters=32,filters_length1=1,
                                        filters_length2=5,
                                        filters_length3=10,
                                        pooling_size=3,
                                        drop_input=0,
                                        drop_cnn=0.2,
                                        drop_flat=0,
                                        W_regularizer=0.0005,
                                        Att_regularizer_weight=0.0005,
                                        fc_dim = 50,
                                        fcnum=0,
                                        ):
        """
        build multihead attention model for mRNA localization.
        :param dim_attention: dim of attention 
        :param headnum: number of head
        :param load_weights: whether to load the pretrained model weights        
        :param weight_dir: pretrained model weights 
        :param nb_filters: number of CNN filters
        :param filters_length1, filters_length2,filters_length3: CNN filter length for multiscale CNN layers
        :param pooling_size: 1D maxpooling pool_length
        :param drop_input: dropout ratio for input layer
        :param drop_cnn: dropout ratio for cnn layer
        :param drop_flat: dropout ratio for the flat layers and the fully connected layers
        :param W_regularizer: 
        :param Att_regularizer_weight:
        :param fc_dim:
        :param fcnum:
        :return: an assembled model
        """
        print('Advanced Masking')
        input = Input(shape=(self.max_len,), dtype='int8')
        embedding_layer = Embedding(len(embedding_vec), len(embedding_vec[0]), weights=[embedding_vec],
                                    input_length=self.max_len,
                                    trainable=False)
        embedding_output = Dropout(drop_input)(embedding_layer(input)) #layer2
        with tf.name_scope('CNN'):
            first_cnn = Convolution1D(nb_filters, filters_length1, #kernel_regularizer=regularizers.l2(0.0001),
                                      border_mode='same', activation=gelu, use_bias=False,name='CNN1')(embedding_output) #layer3
            first_cnn2 = Convolution1D(int(nb_filters/2), filters_length1, #kernel_regularizer=regularizers.l2(0.0001),
                                      border_mode='same', activation=gelu, use_bias=False)(first_cnn) #layer5
            second_cnn = Convolution1D(nb_filters, filters_length2, #kernel_regularizer=regularizers.l2(0.0001),
                                      border_mode='same', activation=gelu, use_bias=False,name='CNN2')(embedding_output) #layer4
            second_cnn2 = Convolution1D(int(nb_filters/2), filters_length2, #kernel_regularizer=regularizers.l2(0.0001),
                                      border_mode='same', activation=gelu, use_bias=False)(second_cnn)
            third_cnn2 = Convolution1D(int(nb_filters/2), filters_length3, #kernel_regularizer=regularizers.l2(0.0001),
                                      border_mode='same', activation=gelu, use_bias=False,name='CNN3')(embedding_output)
            
            cnn_output1 = Dropout(drop_cnn)(MaxPooling1D(pool_length=pooling_size, stride=pooling_size)(first_cnn2))
            cnn_output2 = Dropout(drop_cnn)(MaxPooling1D(pool_length=pooling_size, stride=pooling_size)(second_cnn2))
            cnn_output3 = Dropout(drop_cnn)(MaxPooling1D(pool_length=pooling_size, stride=pooling_size)(third_cnn2))
        
        with tf.name_scope('multihead_attention'):
            att1,att1_A = Attention(hidden=cnn_output1.get_shape()[-1].value, da=dim_attention, r=headnum,att_weight=self.att_weight_var, init='glorot_uniform', activation='tanh',
                    W1_regularizer=regularizers.l2(W_regularizer),
                    W2_regularizer=regularizers.l2(W_regularizer),
                    W1_constraint=None, W2_constraint=None, return_attention=True,
                    attention_regularizer_weight=Att_regularizer_weight,name="att1")(cnn_output1)#-5 layer
            
            att2,att2_A = Attention(hidden=cnn_output1.get_shape()[-1].value, da=dim_attention, r=headnum,att_weight=self.att_weight_var, init='glorot_uniform', activation='tanh',
                    W1_regularizer=regularizers.l2(W_regularizer),
                    W2_regularizer=regularizers.l2(W_regularizer),
                    W1_constraint=None, W2_constraint=None, return_attention=True,
                    attention_regularizer_weight=Att_regularizer_weight,name="att2")(cnn_output2) #-4 layer
            
            att3,att3_A = Attention(hidden=cnn_output1.get_shape()[-1].value, da=dim_attention, r=headnum,att_weight=self.att_weight_var, init='glorot_uniform', activation='tanh',
                    W1_regularizer=regularizers.l2(W_regularizer),
                    W2_regularizer=regularizers.l2(W_regularizer),
                    W1_constraint=None, W2_constraint=None, return_attention=True,
                    attention_regularizer_weight=Att_regularizer_weight,name="att3")(cnn_output3) #-3 layer
            
            
            output = Dropout(drop_flat)(Flatten()(concatenate([att1,att2,att3]))) #-2 layer
        
        fc = output
        for _ in range(fcnum):
             fc = Dense(fc_dim,activation='relu')(fc)
             fc = Dropout(drop_flat)(fc)
        
        
        with tf.name_scope(''):
             preds = Dense(self.nb_classes,activation='sigmoid')(fc) #-1 layer
        
        self.model = Model(inputs=[input], outputs=preds)
        from keras import optimizers
        optim = optimizers.Adam(lr=0.001, decay=5e-5) #The paper uses a decay rate alpha = alpha/sqrt(t) updted each epoch (t) for the logistic regression demonstration.
        self.model.compile(
            loss='binary_crossentropy',
            optimizer=optim,  # todo
            metrics=['acc']
        )
        
        if load_weights:
            self.model.load_weights(weight_dir)
        
        self.is_built = True
        self.bn = False
        self.model.summary()
    
    @classmethod
    def get_encodings(self,X):
        inputs = [K.learning_phase()] + [self.model.inputs[0]]
        _encoding_f = K.function(inputs, [self.model.layers[1].output])
        return _encoding_f([0] + [X])
    
    def get_maxpoolingoutput_batch(self, X):
        '''
        return the output in the maxpooling layer
        '''
        feature_model = Model(self.model.inputs,self.model.layers[3].output)
        return feature_model.predict(X,batch_size=100)
    
    def get_attention_multiscale_batch(self, X):
        """
        Get the attention weights for given sequences.
        :param X: input sequences
        :return: attention weights from the multiscale multihead attention layers.
        """
        layer = -3
        attmodel1 = Model(self.model.inputs[0],self.model.get_layer('att1').output[1])
        attmodel2 = Model(self.model.inputs[0],self.model.get_layer('att2').output[1])
        attmodel3 = Model(self.model.inputs[0],self.model.get_layer('att3').output[1])
        return attmodel1.predict(X,batch_size=100),attmodel2.predict(X,batch_size=100),attmodel3.predict(X,batch_size=100)
    
    
    def get_PCM_multiscale_weighted(self,X,nb_filters,filters_length1,filters_length2,filters_length3):
        ###for membery efficient
        onehotX = self.get_encodings(X)[0]
        feature_model1 = Model(self.model.inputs,self.model.get_layer('CNN1').output)#layer 2 is cnn for 1CNN model no dropout!
        feature_model2 = Model(self.model.inputs,self.model.get_layer('CNN2').output)
        feature_model3 = Model(self.model.inputs,self.model.get_layer('CNN3').output)
        
        def add(feature_length,up=True):
             if up:
                return int((feature_length-1)/2)
             
             else:
                 return feature_length-1-int((feature_length-1)/2)
        
        Add1up = add(filters_length1,True)
        Add1down = add(filters_length1,False)
        Add2up = add(filters_length2,True)
        Add2down = add(filters_length2,False)
        Add3up = add(filters_length3,True)
        Add3down = add(filters_length3,False)
        
        for m in range(nb_filters):
            PCM1=np.zeros((filters_length1,4))
            PCM2=np.zeros((filters_length2,4))
            PCM3=np.zeros((filters_length3,4))
            for s in range(len(X)):
                if s%1000==0:
                     print(s)
                
                CNNoutputs1=feature_model1.predict(X[s:s+1],batch_size=50)
                CNNoutputs2=feature_model2.predict(X[s:s+1],batch_size=50)
                sub_index1=CNNoutputs1[0,:,m].argmax()-Add1up
                sub_index2=CNNoutputs2[0,:,m].argmax()-Add2up
                if m<int(nb_filters/2):
                    CNNoutputs3=feature_model3.predict(X[s:s+1],batch_size=50)
                    sub_index3=CNNoutputs3[0,:,m].argmax()-Add3up
                
                if CNNoutputs1[0,:,m].max()>0:
                    if sub_index1>=0 and sub_index1+filters_length1<onehotX.shape[1]:
                       PCM1 = PCM1+onehotX[s,sub_index1:(sub_index1+filters_length1),:]*CNNoutputs1[0,:,m].max()
                    elif sub_index1<0:
                       PCM1 = PCM1+np.pad(onehotX[s,0:sub_index1+filters_length1,:],([-sub_index1,0],[0,0]),'constant',constant_values =0)*CNNoutputs1[0,:,m].max() #add zeros before
                       
                    else:
                       PCM1 = PCM1+np.pad(onehotX[s,sub_index1:,:],([0,filters_length1-onehotX.shape[1]+sub_index1],[0,0]),'constant',constant_values =0)*CNNoutputs1[0,:,m].max() #add zeros after
                if CNNoutputs2[0,:,m].max()>0:
                    if sub_index2>=0 and sub_index2+filters_length2<onehotX.shape[1]:
                       PCM2 = PCM2+onehotX[s,sub_index2:(sub_index2+filters_length2),:]*CNNoutputs2[0,:,m].max()
                    elif sub_index2<0:
                       PCM2 = PCM2+np.pad(onehotX[s,0:sub_index2+filters_length2,:],([-sub_index2,0],[0,0]),'constant',constant_values =0)*CNNoutputs2[0,:,m].max() #add zeros before
                    else:
                       PCM2 = PCM2+np.pad(onehotX[s,sub_index2:,:],([0,filters_length2-onehotX.shape[1]+sub_index2],[0,0]),'constant',constant_values =0)*CNNoutputs2[0,:,m].max() #add zeros after
                if m < int(nb_filters/2):
                   if CNNoutputs3[0,:,m].max()>0:
                    if sub_index3>=0 and sub_index3+filters_length3<onehotX.shape[1]:
                       PCM3 = PCM3+onehotX[s,sub_index3:(sub_index3+filters_length3),:]*CNNoutputs3[0,:,m].max()
                    elif sub_index3<0:
                       PCM3 = PCM3+np.pad(onehotX[s,0:sub_index3+filters_length3,:],([-sub_index3,0],[0,0]),'constant',constant_values =0)*CNNoutputs3[0,:,m].max() #add zeros before
                    else:
                       PCM3 = PCM3+np.pad(onehotX[s,sub_index3:,:],([0,filters_length3-onehotX.shape[1]+sub_index3],[0,0]),'constant',constant_values =0)*CNNoutputs3[0,:,m].max() #add zeros after
                
            np.savetxt(OUTPATH + '/PCMmultiscale_weighted_filter1_{}.txt'.format(m), PCM1, delimiter=',')
            np.savetxt(OUTPATH + '/PCMmultiscale_weighted_filter2_{}.txt'.format(m), PCM2, delimiter=',')
            if m < int(nb_filters/2):
               np.savetxt(OUTPATH + '/PCMmultiscale_weighted_filter3_{}.txt'.format(m), PCM3, delimiter=',')
    
    def get_PCM_multiscale(self,X,nb_filters,filters_length1,filters_length2,filters_length3):
        ###for membery efficient
        onehotX = self.get_encodings(X)[0]
        feature_model1 = Model(self.model.inputs,self.model.get_layer('CNN1').output)#layer 2 is cnn for 1CNN model no dropout!
        feature_model2 = Model(self.model.inputs,self.model.get_layer('CNN2').output)
        feature_model3 = Model(self.model.inputs,self.model.get_layer('CNN3').output)
        
        def add(feature_length,up=True):
             if up:
                return int((feature_length-1)/2)
             
             else:
                 return feature_length-1-int((feature_length-1)/2)
        
        Add1up = add(filters_length1,True)
        Add1down = add(filters_length1,False)
        Add2up = add(filters_length2,True)
        Add2down = add(filters_length2,False)
        Add3up = add(filters_length3,True)
        Add3down = add(filters_length3,False)
        
        for m in range(nb_filters):
            PCM1=np.zeros((filters_length1,4))
            PCM2=np.zeros((filters_length2,4))
            PCM3=np.zeros((filters_length3,4))
            for s in range(len(X)):
                if s%1000==0:
                     print(s)
                
                CNNoutputs1=feature_model1.predict(X[s:s+1],batch_size=50)
                CNNoutputs2=feature_model2.predict(X[s:s+1],batch_size=50)
                
                sub_index1=CNNoutputs1[0,:,m].argmax()-Add1up
                sub_index2=CNNoutputs2[0,:,m].argmax()-Add2up
                if m<int(nb_filters/2):
                    CNNoutputs3=feature_model3.predict(X[s:s+1],batch_size=50)
                    sub_index3=CNNoutputs3[0,:,m].argmax()-Add3up
                
                if CNNoutputs1[0,:,m].max()>0:
                    if sub_index1>=0 and sub_index1+filters_length1<onehotX.shape[1]:
                       PCM1 = PCM1+onehotX[s,sub_index1:(sub_index1+filters_length1),:]
                    elif sub_index1<0:
                       PCM1 = PCM1+np.pad(onehotX[s,0:sub_index1+filters_length1,:],([-sub_index1,0],[0,0]),'constant',constant_values =0) #add zeros before
                       
                    else:
                       PCM1 = PCM1+np.pad(onehotX[s,sub_index1:,:],([0,filters_length1-onehotX.shape[1]+sub_index1],[0,0]),'constant',constant_values =0) #add zeros after
                if CNNoutputs2[0,:,m].max()>0:
                    if sub_index2>=0 and sub_index2+filters_length2<onehotX.shape[1]:
                       PCM2 = PCM2+onehotX[s,sub_index2:(sub_index2+filters_length2),:]
                    elif sub_index2<0:
                       PCM2 = PCM2+np.pad(onehotX[s,0:sub_index2+filters_length2,:],([-sub_index2,0],[0,0]),'constant',constant_values =0) #add zeros before
                    else:
                       PCM2 = PCM2+np.pad(onehotX[s,sub_index2:,:],([0,filters_length2-onehotX.shape[1]+sub_index2],[0,0]),'constant',constant_values =0) #add zeros after
                if m < int(nb_filters/2):
                   if CNNoutputs3[0,:,m].max()>0:
                    if sub_index3>=0 and sub_index3+filters_length3<onehotX.shape[1]:
                       PCM3 = PCM3+onehotX[s,sub_index3:(sub_index3+filters_length3),:]
                    elif sub_index3<0:
                       PCM3 = PCM3+np.pad(onehotX[s,0:sub_index3+filters_length3,:],([-sub_index3,0],[0,0]),'constant',constant_values =0) #add zeros before
                    else:
                       PCM3 = PCM3+np.pad(onehotX[s,sub_index3:,:],([0,filters_length3-onehotX.shape[1]+sub_index3],[0,0]),'constant',constant_values =0) #add zeros after
                
            np.savetxt(OUTPATH + '/PCMmultiscale_filter1_{}.txt'.format(m), PCM1, delimiter=',')
            np.savetxt(OUTPATH + '/PCMmultiscale_filter2_{}.txt'.format(m), PCM2, delimiter=',')
            if m < int(nb_filters/2):
               np.savetxt(OUTPATH + '/PCMmultiscale_filter3_{}.txt'.format(m), PCM3, delimiter=',')
    
    
    def get_sigCNN_region(self,X,nb_filters,filters_length1,filters_length2,filters_length3):
        ###for membery efficient
        onehotX = self.get_encodings(X)[0]
        feature_model1 = Model(self.model.inputs,self.model.get_layer('CNN1').output)#layer 2 is cnn for 1CNN model no dropout!
        feature_model2 = Model(self.model.inputs,self.model.get_layer('CNN2').output)
        feature_model3 = Model(self.model.inputs,self.model.get_layer('CNN3').output)
        
        def add(feature_length,up=True):
             if up:
                return int((feature_length-1)/2)
             
             else:
                 return feature_length-1-int((feature_length-1)/2)
        
        Add1up = add(filters_length1,True)
        Add1down = add(filters_length1,False)
        Add2up = add(filters_length2,True)
        Add2down = add(filters_length2,False)
        Add3up = add(filters_length3,True)
        Add3down = add(filters_length3,False)
        
        output = {}
        for m in range(nb_filters):
            output[m]={}
            for s in range(len(X)):
                output[m][s]={}
                if s%1000==0:
                     print(s)
                
                signal1,signal2,signal3=0,0,0
                start1,start2,start3 = -1,-1,-1
                end1,end2,end3=-1,-1,-1
                CNNoutputs1=feature_model1.predict(X[s:s+1],batch_size=50)
                CNNoutputs2=feature_model2.predict(X[s:s+1],batch_size=50)
                sub_index1=CNNoutputs1[0,:,m].argmax()-Add1up
                sub_index2=CNNoutputs2[0,:,m].argmax()-Add2up
                if m<int(nb_filters/2):
                    CNNoutputs3=feature_model3.predict(X[s:s+1],batch_size=50)
                    sub_index3=CNNoutputs3[0,:,m].argmax()-Add3up
                
                if CNNoutputs1[0,:,m].max()>0:
                    signal1 = CNNoutputs1[0,:,m].max()
                    if sub_index1>=0 and sub_index1+filters_length1<onehotX.shape[1]:
                       start1 = sub_index1
                       end1 = sub_index1+filters_length1
                    elif sub_index1<0:
                       start1 = 0
                       end1 = sub_index1+filters_length1                       
                    else:
                       start1 = sub_index1
                       end1 = onehotX.shape[1]
                if CNNoutputs2[0,:,m].max()>0:
                    signal2 = CNNoutputs2[0,:,m].max()
                    if sub_index2>=0 and sub_index2+filters_length2<onehotX.shape[1]:
                       start2 = sub_index2
                       end2 = sub_index2+filters_length2
                    elif sub_index2<0:
                         start2 = 0
                         end2 = sub_index2+filters_length2
                    else:
                       start2 = sub_index2
                       end2 = onehotX.shape[1]
                if m < int(nb_filters/2):
                  if CNNoutputs3[0,:,m].max()>0:
                    signal3 = CNNoutputs3[0,:,m].max()
                    if sub_index3>=0 and sub_index3+filters_length3<onehotX.shape[1]:
                       start3=sub_index3
                       end3=sub_index3+filters_length3
                    elif sub_index3<0:
                         start3 = 0
                         end3 = sub_index3+filters_length3
                    else:
                       start3 = sub_index3
                       end3 = onehotX.shape[1]
                
                output[m][s]['signal1']=signal1
                output[m][s]['signal2']=signal2
                output[m][s]['signal3']=signal3
                output[m][s]['start1']=start1
                output[m][s]['start2']=start2
                output[m][s]['start3']=start3
                output[m][s]['end1']=end1
                output[m][s]['end2']=end2
                output[m][s]['end3']=end3
        
        return output
    def get_1featureMap(self,X,nb_filters,filters_length1,filters_length2,filters_length3):
        ###for membery efficient
        onehotX = self.get_encodings(X)[0]
        feature_model1 = Model(self.model.inputs,self.model.get_layer('CNN1').output)#layer 2 is cnn for 1CNN model no dropout!
        feature_model2 = Model(self.model.inputs,self.model.get_layer('CNN2').output)
        feature_model3 = Model(self.model.inputs,self.model.get_layer('CNN3').output)
        
        CNNoutputs1=feature_model1.predict(X,batch_size=50)#S,8000,32 
        CNNoutputs2=feature_model2.predict(X,batch_size=50)#S,8000,32
        CNNoutputs3=feature_model3.predict(X,batch_size=50)#S,8000,16
        outputmatrix = np.concatenate([CNNoutputs1,CNNoutputs2,CNNoutputs3],axis=-1)
        output = np.sum(outputmatrix,axis=-1)
        
        return outputmatrix,output
    
    def train(self, x_train, y_train, batch_size, epochs=100,x_valid=None,y_valid=None,loadFinal=False):
        if not self.is_built:
            print('Run build_model() before calling train opertaion.')
            return
        
        if x_valid is None:
            print("validation set is not provided, generate one.")
            size_train = len(x_train)
            x_valid = x_train[int(0.9 * size_train):]
            y_valid = y_train[int(0.9 * size_train):]
            x_train = x_train[:int(0.9 * size_train)]
            y_train = y_train[:int(0.9 * size_train)]
        
        early_stopping = EarlyStopping(monitor='val_loss', patience=20)
        best_model_path = OUTPATH + 'weights_fold_{}.h5'.format(self.kfold_index)
        model_checkpoint = ModelCheckpoint(best_model_path, save_best_only=True, verbose=1)
        attCallback=att_weight_callback(self.att_weight_var,1,1,epochs)#current best no change at all
        hist = self.model.fit(x_train, y_train, batch_size=batch_size, nb_epoch=epochs, verbose=1,
                              validation_data=(x_valid, y_valid), callbacks=[attCallback,model_checkpoint,early_stopping], shuffle=True)
        
        # load best performing model
        if not loadFinal:
             self.model.load_weights(best_model_path)
        
        #print("best att weight is ",K.get_value(self.model.layers[-3].att_weight)) #for other model the layer is not right
        Train_Result_Optimizer = hist.history
        Train_Loss = np.asarray(Train_Result_Optimizer.get('loss'))
        Train_Loss = np.array([Train_Loss]).T
        Valid_Loss = np.asarray(Train_Result_Optimizer.get('val_loss'))
        Valid_Loss = np.asarray([Valid_Loss]).T
        Train_Acc = np.asarray(Train_Result_Optimizer.get('acc'))
        Train_Acc = np.array([Train_Acc]).T
        Valid_Acc = np.asarray(Train_Result_Optimizer.get('val_acc'))
        Valid_Acc = np.asarray([Valid_Acc]).T
        np.savetxt(OUTPATH + 'Train_Loss_fold_{}.txt'.format(self.kfold_index), Train_Loss, delimiter=',')
        np.savetxt(OUTPATH + 'Valid_Loss_fold_{}.txt'.format(self.kfold_index), Valid_Loss, delimiter=',')
        np.savetxt(OUTPATH + 'Train_Acc_fold_{}.txt'.format(self.kfold_index), Train_Acc, delimiter=',')
        np.savetxt(OUTPATH + 'Valid_Acc_fold_{}.txt'.format(self.kfold_index), Valid_Acc, delimiter=',')
    
    def evaluate(self,x_test,y_test):
        #attCallback=att_weight_callback(self.att_weight_var,1,1,1,1)#set arr_weight in prediction as 5
        #pred_y = self.model.predict(x_test,callbacks=[attCallback])
        pred_y = self.model.predict(x_test)
        np.savetxt(OUTPATH + 'test_predicted_results__fold_{}.txt'.format(self.kfold_index), np.array(pred_y), delimiter=',')
        y_label_ = list()
        nclass = pred_y.shape[1]
        roc_auc = dict()
        mcc_dict = dict()
        average_precision = dict()
        #binary_acc=[]
        fpr = dict()
        tpr = dict()
        precision = dict()
        recall = dict()
        for i in range(nclass):#calculate one by one
            average_precision[i+1] = average_precision_score(y_test[:, i], pred_y[:, i])
            roc_auc[i+1] = roc_auc_score(y_test[:,i], pred_y[:,i])
            mcc_dict[i+1] = matthews_corrcoef(y_test[:,i],[1 if x>0.5 else 0 for x in pred_y[:,i]])
            fpr[i],tpr[i],_ = roc_curve(y_test[:,i], pred_y[:,i])
            precision[i],recall[i],_ =  precision_recall_curve(y_test[:, i], pred_y[:, i])
            
            #binary_acc.append(accuracy_score(y_test[:,i],[if for x in pred_y[:,i]]))
        
        fpr['micro'],tpr['micro'],_ = roc_curve(y_test.ravel(), pred_y.ravel())
        precision['micro'],recall['micro'],_ =  precision_recall_curve(y_test.ravel(), pred_y.ravel())
        
        average_precision["micro"] = average_precision_score(y_test, pred_y,average="micro")
        roc_auc["micro"] = roc_auc_score(y_test,pred_y,average="micro")
        roc_list = [roc_auc[x+1] for x in range(nclass)]
        roc_list.append(roc_auc['micro'])
        pr_list = [average_precision[x+1] for x in range(nclass)]
        pr_list.append(average_precision['micro'])
        mcc_list = [mcc_dict[x+1] for x in range(nclass)]
        np.savetxt(OUTPATH + 'testevaluation_roc_average_presicion_fold_{}.txt'.format(self.kfold_index), np.array(roc_list+pr_list+mcc_list), delimiter=',')
        picklefile = open(OUTPATH + '5foldavg_test_for_plot','wb')
        pickle.dump((fpr,tpr,precision,recall),picklefile)
        return roc_auc,average_precision
    
    def predict(self,x_test):
        pred_y = self.model.predict(x_test)
        print("att_weight_var is ",K.get_value(self.att_weight_var))
        return pred_y

