#!/usr/bin/env bash
cd $(dirname $0)
echo "Workdir $(pwd)"
workdir=$(pwd)
set -x;

old_version=$(git log -1 --format=%h)
git pull
RET=$?
if [ ${RET} -ne 0 ] ; then
    echo "Git pulling failed"
    exit 3
fi


version=$(git log -1 --format=%h)
echo "Version: ${version}"
if [ ${old_version} = ${version} ] ; then
    echo "Same version, skip the rebuilding and restarting..."
    exit 0;
fi

echo $version > ./GIT_VERSION

echo "Building docker image"
docker build -t redhat-be3:${version} . 
RET=$?
if [ ${RET} -ne 0 ] ; then
    echo "docker build failed"
    exit 3
fi

if [ ! -d ${workdir}/logs ] ; then
  mkdir ${workdir}/logs;
fi

echo "running tagging, restarting"
docker tag redhat-be3:${version} redhat-be3:latest
docker rm -f be1
docker run -d --net=simple --name=be1 -v ${workdir}/logs:/logs -p 8900:3000 redhat-be3
