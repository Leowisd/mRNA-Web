# -*- coding: utf-8 -*-
"""
Created on Sun Jul 28 13:30:05 2019

@author: duolin
"""
import keras
from keras import backend as K

def linear_change(start_value,end_value,rampup_length,epoch):
   v = (end_value-start_value)/rampup_length * epoch+start_value
   return v

def polynormial_change(start_value,end_value,rampup_length,epoch,power=2):
   v = (end_value-start_value)*((epoch/rampup_length) ** power)+start_value
   return v


class att_weight_callback(keras.callbacks.Callback):
    def __init__(self, att_weight_var,start_value,end_value,rampup_length,predict_weight=1):
        self.att_weight_var = att_weight_var
        self.start_value = start_value
        self.end_value = end_value
        self.rampup_length = rampup_length
        self.predict_weight = predict_weight
    
    def on_train_begain(self, logs={}):
        self.att_weight_var = self.start_value
        
    
    def on_epoch_begin(self, epoch, logs={}):
        if epoch <= self.rampup_length:
            #v = linear_change(self.start_value,self.end_value,self.rampup_length,epoch)
            v = polynormial_change(self.start_value,self.end_value,self.rampup_length,epoch)
            K.set_value(self.att_weight_var,v)
        
        print("weight start at:", K.get_value(self.att_weight_var))
    
    def on_epoch_end(self, epoch, logs={}):
        if epoch == self.rampup_length:
            K.set_value(self.att_weight_var,self.end_value)
            print("weight end in:", K.get_value(self.att_weight_var))
        
    
    #def on_predict_begin(self,logs={}):
    #        K.set_value(self.att_weight_var,self.predict_weight)
    #        print("weight in predict start:", K.get_value(self.att_weight_var))
    
    def on_predict_end(self,logs={}):
            print("weight in predict end:", K.get_value(self.att_weight_var))
    