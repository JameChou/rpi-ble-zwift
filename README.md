## BLE RPI

### 环境配置

```shell
sudo apt-get install bluetooth bluez libbluetooth-dev libudev-dev
```

安装nodejs 以及 npm
1. 下载Nodejs Binary包[https://nodejs.org/zh-cn/download/](https://nodejs.org/zh-cn/download/).
2. npm使用国内源,把本项目下的.npmrc复制到 "~"下。


### 启动
```shell
cd ~/yourlocation/rpi-ble-zwift
npm install
node main.js
```
