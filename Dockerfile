# 使用DaoCloud的Ubuntu镜像
FROM daocloud.io/library/ubuntu:14.04

# 设置镜像作者
MAINTAINER Jason.lu <lu.gt@163.com>

# 设置时区
RUN sudo sh -c "echo 'Asia/Shanghai' > /etc/timezone" && \
    sudo dpkg-reconfigure -f noninteractive tzdata

# 使用阿里云的Ubuntu镜像
RUN echo '\n\
deb http://mirrors.aliyun.com/ubuntu/ trusty main restricted universe multiverse\n\
deb http://mirrors.aliyun.com/ubuntu/ trusty-security main restricted universe multiverse\n\
deb http://mirrors.aliyun.com/ubuntu/ trusty-updates main restricted universe multiverse\n\
deb http://mirrors.aliyun.com/ubuntu/ trusty-proposed main restricted universe multiverse\n\
deb http://mirrors.aliyun.com/ubuntu/ trusty-backports main restricted universe multiverse\n\
deb-src http://mirrors.aliyun.com/ubuntu/ trusty main restricted universe multiverse\n\
deb-src http://mirrors.aliyun.com/ubuntu/ trusty-security main restricted universe multiverse\n\
deb-src http://mirrors.aliyun.com/ubuntu/ trusty-updates main restricted universe multiverse\n\
deb-src http://mirrors.aliyun.com/ubuntu/ trusty-proposed main restricted universe multiverse\n\
deb-src http://mirrors.aliyun.com/ubuntu/ trusty-backports main restricted universe multiverse\n'\
> /etc/apt/sources.list

# 安装node v6.10.1
RUN sudo apt-get update && sudo apt-get install -y wget python3
RUN sudo apt-get install -y python curl bash make gcc g++ binutils

RUN wget https://npm.taobao.org/mirrors/node/v12.15.0/node-v12.15.0-linux-x64.tar.gz && \
    tar -C /usr/local --strip-components 1 -xvf node-v12.15.0-linux-x64.tar.gz && \
    rm node-v12.15.0-linux-x64.tar.gz

# No longer used
# RUN sudo ln -s /usr/bin/python2 /usr/bin/python && python --version

WORKDIR /app

ADD package.json /app/package.json
RUN npm config set strict-ssl false
RUN npm install -g cnpm --registry=https://registry.npm.taobao.org
RUN npm install --production -d --registry=https://registry.npm.taobao.org

ADD . /app

CMD ["/bin/bash", "-c", ". /app/secret.env && cd /app && npm install --registry=https://registry.npm.taobao.org && cd /app && node ./bin/www 1>>/logs/site-new.log 2>>/logs/error-new.log"]

