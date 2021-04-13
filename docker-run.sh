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
if [ "a${preserve}" != "ayes" ] && [ ${old_version} = ${version} ] ; then
    echo "Same version, skip the rebuilding and restarting..."
    exit 0;
fi

echo $version > ./GIT_VERSION

echo "Building docker image"
docker build -t yugc-final:${version} . 
RET=$?
if [ ${RET} -ne 0 ] ; then
    echo "docker build failed"
    exit 3
fi

if [ ! -d ${workdir}/logs ] ; then
  mkdir ${workdir}/logs;
fi

echo "running tagging, restarting"
docker tag yugc-final:${version} yugc-final:latest
docker rm -f finalserver1
docker run -d --net=simple --name=finalserver1 -v ${workdir}/logs:/logs -p 8921:3000 yugc-final
