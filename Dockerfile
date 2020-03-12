FROM node:8
RUN apt-get update && apt-get install -y \ 
    python2.7 \
    python-pip \
    python3.5 \ 
    python3-pip
RUN python3 -m pip install numpy scipy && python3 -m pip install scikit-learn && python3 -m pip install pillow && python3 -m pip install h5py && python3 -m pip install tensorflow==1.11.0 && python3 -m pip install keras==2.1.5  && python3 -m pip install pandas && python3 -m pip install python-crontab && python3 -m pip install feedparser && python3 -m pip install pymongo==3.9.0 && python3 -m pip install configparser
RUN wget ftp://ftp.ncbi.nlm.nih.gov/blast/executables/blast+/2.7.1/ncbi-blast-2.7.1+-x64-linux.tar.gz
RUN tar zxvpf ncbi-blast-2.7.1+-x64-linux.tar.gz
RUN rm ncbi-blast-2.7.1+-x64-linux.tar.gz
ENV PATH "$PATH:/ncbi-blast-2.7.1+/bin"
WORKDIR /musite           
COPY package*.json ./
RUN npm install
COPY . /musite/
RUN ls -la /musite/*
EXPOSE 5000
